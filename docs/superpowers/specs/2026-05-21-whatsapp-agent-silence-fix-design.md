# Design: Correção do silêncio total do agente WhatsApp

**Data:** 2026-05-21  
**Status:** Superseded — ver `2026-05-21-whatsapp-webhook-ingestion-fix-design.md` (aprovado 2026-05-21)  
**Contexto:** Usuário confirmou **B** — mensagens de teste no WhatsApp **não aparecem no CRM** (falha antes da persistência ou webhook não chega).

## Problema

O agente SDR não responde e as mensagens inbound **não são gravadas** em `contacts` / `conversations` / `messages`. O endpoint `/api/whatsapp/diagnostics` retorna **ALL SYSTEMS OK** (Evolution `open`, webhook URL configurada, OpenRouter válido), mas o fluxo real de mensagens não produz efeito visível no CRM.

## Diagnóstico (evidências)

| Verificação | Resultado |
|-------------|-----------|
| Produção deploy | Commit `a20f03e` — usa `after()` para todo `handleInboundMessage` |
| Evolution webhook `find` | `enabled: true`, URL `https://crmamelia.vercel.app/api/whatsapp/webhook` |
| Sintoma do usuário | **B** — nada no CRM |
| Código local (não commitado) | Remove `after()`, adiciona skip de `@lid` — **não deployar** sem merge do fix abaixo |

### Causas raiz prováveis (ordenadas por impacto em B)

1. **`after()` para persistência inteira** — Em serverless, se o callback `after()` não executar ou for interrompido após o `200 OK`, **nenhum registro** é criado no banco. Explica silêncio total + CRM vazio.

2. **`payload.data` como array** — Produção atual trata `data` só como objeto. Se Evolution enviar `data: [{ key, message }]`, o handler retorna **400** (`invalid_payload`) e descarta a mensagem.

3. **Nome do evento** — Se `payload.event` vier como `MESSAGES_UPSERT` (e não `messages.upsert`), produção retorna `200` sem processar (sem branch correspondente).

4. **Webhook não disparado pela Evolution** — Configuração `find` correta não garante entrega HTTP. Firewall, instância errada ou instabilidade em `api.odontogpt.com`.

5. **`@lid` sem telefone** (fase 2) — Quando ingestão funcionar, envio pode falhar se só houver `remoteJid` `@lid`; não explica CRM vazio sozinho, mas quebra respostas.

## Solução proposta

### Arquitetura alvo

```
WhatsApp → Evolution API
         → POST /api/whatsapp/webhook
         → [SYNC] validar evento + normalizar data[]
         → [SYNC] resolver contato (JID real, não @lid)
         → [SYNC] upsert contact + conversation + inbound message  ← obrigatório antes do 200
         → [ASYNC after()] runSDRAgent + sendText + outbound message
         → 200 { status: 'ok' }
```

**Regra:** Tudo que o usuário precisa ver no CRM (mensagem inbound) é **síncrono**. Só a resposta da IA fica em `after()`.

### Mudanças no código

| # | Arquivo | Mudança |
|---|---------|---------|
| 1 | `app/api/whatsapp/webhook/route.ts` | `normalizeWebhookEvent()` — aceitar `MESSAGES_UPSERT` / `messages.upsert` |
| 2 | idem | `collectUpsertMessages()` — `data` objeto ou array |
| 3 | idem | `resolveContactFromUpsert()` — `remoteJidAlt`, `sender`, `participant`; rejeitar envio para `@lid` puro |
| 4 | idem | Dividir `handleInboundMessage` → `persistInboundMessage()` (sync) + `runSDRAgent()` (after) |
| 5 | idem | Manter `export const maxDuration = 60` e `after()` **apenas** para IA |
| 6 | `app/api/whatsapp/diagnostics/route.ts` | Campo opcional `last_inbound_test` ou instrução de teste webhook POST |
| 7 | `scripts/check-webhook-config.ts` | POST de smoke test + instrução para conferir CRM |

### Resolução de contato (JID)

Ordem de fallback ao resolver telefone/JID de resposta:

1. `key.remoteJid` se terminar em `@s.whatsapp.net` (ou `@c.us`)
2. `data.remoteJidAlt` / `key.remoteJidAlt` (Evolution ≥ 2.3.7 com fix LID)
3. `payload.sender` / `data.sender`
4. `key.participant`
5. Se só `@lid` e sem alternativa → log `[Webhook] LID unresolved` + **não** retornar 200 silencioso; registrar em diagnostics (futuro)

### Tratamento de erros

- Persistência sync falhou → `500` (Evolution pode retentar) ou `200` com log crítico (decisão: **500** para inbound não salvo, para forçar retry)
- IA falhou após persistência → `FALLBACK_MESSAGE` via Evolution (já existe)
- `aiEnabled: false` → persiste inbound, não chama agente

### Fora do escopo

- Trocar Evolution de servidor (`api.odontogpt.com`) — documentar recomendação de upgrade LID ao operador
- Autenticação HMAC no webhook
- Fila externa (Redis/Inngest) — só se `after()` continuar instável após fix sync

## Abordagens consideradas

| Abordagem | Prós | Contras |
|-----------|------|---------|
| **A) Sync persist + after só IA** (escolhida) | Corrige B diretamente; CRM sempre atualiza | Resposta IA ainda depende de `after()` |
| B) Tudo síncrono (sem after) | Máxima simplicidade | Pode estourar timeout em picos |
| C) Apenas upgrade Evolution | Zero código | Não controlamos `odontogpt`; não corrige array/event |

**Recomendação:** **A** imediato; validar entrega real com script + mensagem teste; escalar para fila só se necessário.

## Critérios de sucesso

- [ ] Mensagem real no WhatsApp → aparece no CRM em &lt; 30s (inbound, sender `contact`)
- [ ] Mesmo teste → resposta do agente ou fallback em &lt; 60s
- [ ] `pnpm` script de webhook smoke + `diagnostics` OK
- [ ] Logs Vercel mostram `[Handler] Created contact` ou `Found contact` **antes** do `200 OK`
- [ ] Payload com `data[]` e evento `MESSAGES_UPSERT` processados

## Validação

1. Deploy com fix
2. `npx tsx scripts/test-webhook-post.ts` → verificar linha em `messages` no CRM
3. Enviar WhatsApp real para número conectado (`amelia1`)
4. `GET /api/whatsapp/diagnostics` permanece OK
5. Se ainda B após deploy → escalar para operador Evolution (webhook não dispara)

## Referências

- Spec anterior: `docs/superpowers/specs/2026-05-20-evolution-whatsapp-agent-production-design.md`
- Evolution @lid: https://github.com/EvolutionAPI/evolution-api/issues/2326
- Commit base produção: `a20f03e`
