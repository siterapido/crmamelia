# Design: Correção de ingestão webhook WhatsApp (CRM vazio)

**Data:** 2026-05-21  
**Status:** Aprovado  
**Sintoma confirmado:** **B** — mensagem real no WhatsApp **não aparece** no CRM (`crmamelia.vercel.app`).

## Problema

O teste manual `sendText` via Evolution API funciona, mas mensagens inbound reais não geram registros em `contacts`, `conversations` ou `messages`. O agente SDR permanece em silêncio porque o pipeline inbound nunca completa a persistência.

Diagnostics retorna **ALL SYSTEMS OK** (Evolution `open`, webhook URL configurada, OpenRouter válido) — isso valida configuração estática, não entrega HTTP em mensagens reais.

## Diagnóstico (evidências)

| Verificação | Resultado |
|-------------|-----------|
| `sendText` manual (script) | ✅ Mensagem entregue (API Evolution saudável) |
| Webhook `find` | ✅ URL `https://crmamelia.vercel.app/api/whatsapp/webhook`, eventos `MESSAGES_UPSERT` + `MESSAGES_UPDATE` |
| POST simulado `MESSAGES_UPSERT` + JID `@s.whatsapp.net` | ✅ `persisted: 1` (handler novo) |
| POST simulado só `@lid` | ⚠️ `persisted: 0` (descartado) |
| Handler antigo (`a20f03e`) | ❌ `event === 'messages.upsert'` não casa com `MESSAGES_UPSERT` → `200` sem processar |
| Sintoma usuário | **B** — CRM vazio após mensagem real |

### Causas raiz (ordenadas por impacto em B)

1. **Webhook não disparado pela Evolution** — `find` correto não garante POST HTTP em cada mensagem (`api.odontogpt.com`).
2. **Payload `@lid` sem JID alternativo** — handler retorna `200` com `persisted: 0`; nada no CRM.
3. **Handler legado** — ignora `MESSAGES_UPSERT` e/ou `data[]` array.
4. **`after()` para persistência inteira** (legado) — serverless pode matar callback após `200`; CRM vazio.
5. **Persistência falha** — raro se diagnostics DB OK; retornar `500` para retry.

## Solução aprovada (Abordagem A + B)

### Arquitetura alvo

```
WhatsApp inbound
    → Evolution API (amelia1 @ api.odontogpt.com)
    → POST https://crmamelia.vercel.app/api/whatsapp/webhook
    → [SYNC] normalizeWebhookEvent() + collectUpsertMessages()
    → [SYNC] resolveContactFromUpsert() (JID real, não só @lid)
    → [SYNC] persistInboundMessage() → contact + conversation + message
    → [ASYNC after()] runSDRAgent() + sendText + outbound message
    → 200 { status: 'ok', persisted, skipped? }
```

**Regras:**

- Tudo visível no CRM é **síncrono** antes do `200`.
- Só a resposta da IA usa `after()`.
- `@lid` sem alternativa → log explícito + `skipped: [{ reason: 'lid_unresolved', remoteJid }]` na resposta (não silêncio).
- Falha de persistência em todos os itens → **500** `persist_failed`.

### Resolução de contato (JID)

Ordem de fallback:

1. `key.remoteJid` se `@s.whatsapp.net` ou `@c.us`
2. `key.remoteJidAlt` / `data.remoteJidAlt`
3. `payload.sender` / `data.sender`
4. `key.participant`
5. Só `@lid` → skip com log + campo `skipped` na resposta

### Mudanças no código

| # | Arquivo | Mudança |
|---|---------|---------|
| 1 | `app/api/whatsapp/webhook/route.ts` | Normalização de evento, `data[]`, persist sync, `after()` só IA, resposta com `skipped` |
| 2 | `app/api/whatsapp/diagnostics/route.ts` | Instrução de smoke test webhook + link para script |
| 3 | `scripts/check-webhook-config.ts` | Rodar smoke POST e reportar `persisted` |
| 4 | `scripts/test-webhook-post.ts` | Casos: `MESSAGES_UPSERT` array, `@lid`, JID válido |

### Tratamento de erros

| Cenário | Comportamento |
|---------|---------------|
| Persist OK, IA falha | `FALLBACK_MESSAGE` via Evolution |
| `aiEnabled: false` | Persiste inbound, sem agente |
| Todos os upserts falham persist | HTTP 500 |
| Só `@lid` | HTTP 200 + `persisted: 0` + `skipped` |

### Fora do escopo

- Migrar Evolution para outro host (documentar upgrade LID ao operador `odontogpt`)
- HMAC no webhook
- Fila externa (Redis/Inngest) — só se `after()` da IA continuar instável após ingestão OK

## Abordagens consideradas

| Abordagem | Decisão |
|-----------|---------|
| **A) Sync persist + observabilidade** | ✅ Escolhida |
| B) Validar entrega webhook no servidor Evolution | ✅ Em paralelo (operador) |
| C) Polling Evolution | ❌ Só se A+B falharem |

## Critérios de sucesso

- [ ] Mensagem real WhatsApp → CRM em &lt; 30s (`direction: inbound`, `sender: contact`)
- [ ] Mesmo teste → resposta agente ou fallback em &lt; 60s
- [ ] `npx tsx scripts/test-webhook-post.ts` → `persisted: 1`
- [ ] Logs Vercel: `[Handler] Created/Found contact` antes do `200`
- [ ] Se ainda **B** após deploy → escalar operador Evolution (webhook não dispara)

## Validação pós-deploy

1. Deploy produção (`crmamelia.vercel.app`)
2. `npx tsx scripts/test-webhook-post.ts`
3. `npx tsx scripts/check-webhook-config.ts`
4. Mensagem real no WhatsApp para número da `amelia1`
5. Conferir CRM + resposta do agente
6. Se B persistir: logs Evolution + considerar upgrade Evolution (issue #2326 @lid)

## Referências

- `docs/superpowers/specs/2026-05-20-evolution-whatsapp-agent-production-design.md`
- `docs/superpowers/specs/2026-05-21-whatsapp-agent-silence-fix-design.md` (rascunho anterior — superseded)
- https://github.com/EvolutionAPI/evolution-api/issues/2326
