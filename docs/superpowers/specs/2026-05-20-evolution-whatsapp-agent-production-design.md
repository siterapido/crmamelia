# Design: Agente Amélia + Evolution API em Produção

**Data:** 2026-05-20  
**Status:** Implementado (webhook Evolution configurado em 2026-05-20)

## Problema

O agente SDR da Amélia e o pipeline WhatsApp já estão implementados no código, mas em produção o fluxo só funciona de ponta a ponta quando:

1. As variáveis de ambiente na Vercel apontam para a instância Evolution correta
2. O webhook da instância `amelia1` na Evolution API envia eventos para o deploy de produção
3. A documentação/UI do CRM não induz configuração incorreta (ex.: Meta Business Manager)

A instância WhatsApp **amelia1** em `https://api.odontogpt.com` está conectada (state `open`, número `5521971724757`). O deploy de produção do CRM é `https://crmamelia.vercel.app`.

## Estado verificado (2026-05-20)

| Componente | Resultado |
|------------|-----------|
| Vercel Production env (`insightfy/crmamelia`) | `EVOLUTION_*`, `OPENROUTER_API_KEY`, `DATABASE_URL` presentes |
| `GET /api/whatsapp/diagnostics` | `ALL SYSTEMS OK` — Evolution `open`, OpenRouter válido, DB OK |
| `GET /api/whatsapp/webhook` | Ativo |
| Webhook Evolution → `crmamelia.vercel.app` | **Não verificado remotamente** (requer API key); provável gap se agente não responde |

## Solução

### Arquitetura

```
WhatsApp → Evolution API (amelia1 @ api.odontogpt.com)
         → POST https://crmamelia.vercel.app/api/whatsapp/webhook
         → CRM (contact, conversation, message)
         → SDR Agent (OpenRouter / google/gemini-3.1-flash-lite)
         → POST Evolution /message/sendText/amelia1
         → WhatsApp
```

**Arquivos centrais (já existentes, sem reescrita):**

- `app/api/whatsapp/webhook/route.ts` — handler `messages.upsert` / `messages.update`
- `lib/whatsapp/evolution-client.ts` — envio e status
- `lib/ai/sdr-agent.ts` — geração de resposta e ações CRM

### 1. Variáveis de ambiente (Vercel Production)

| Variável | Valor esperado |
|----------|----------------|
| `EVOLUTION_API_URL` | `https://api.odontogpt.com` (sem barra final) |
| `EVOLUTION_API_KEY` | API key da instância (Evolution Manager) |
| `EVOLUTION_INSTANCE_NAME` | `amelia1` |
| `OPENROUTER_API_KEY` | Chave válida OpenRouter |
| `NEXT_PUBLIC_APP_URL` | `https://crmamelia.vercel.app` (recomendado para URLs absolutas) |

**Regras:** nunca commitar secrets; rotacionar `EVOLUTION_API_KEY` se exposta em canal inseguro.

### 2. Webhook na Evolution API

**Endpoint:** `POST https://api.odontogpt.com/webhook/set/amelia1`  
**Header:** `apikey: <EVOLUTION_API_KEY>`

**Body:**

```json
{
  "enabled": true,
  "url": "https://crmamelia.vercel.app/api/whatsapp/webhook",
  "webhookByEvents": false,
  "webhookBase64": false,
  "events": ["MESSAGES_UPSERT", "MESSAGES_UPDATE"]
}
```

**Verificação:** `GET https://api.odontogpt.com/webhook/find/amelia1` — URL e eventos devem coincidir.

**Alternativa UI:** Evolution Manager → instância `amelia1` → Integrations / Webhook — mesmos valores.

**Comportamento no handler:**

- `messages.upsert` + `fromMe: false` → processa agente
- `messages.upsert` + `fromMe: true` → ignora (evita loop)
- `messages.update` → atualiza status da mensagem no CRM

### 3. Implementação complementar (escopo mínimo pós-aprovação do spec)

| Item | Arquivo | Descrição |
|------|---------|-----------|
| Script de setup | `scripts/setup-evolution-webhook.ts` | Aplica e valida webhook via API; usa env local ou args |
| UI CRM settings | `app/admin/cms/crm/settings/page.tsx` | Substituir instruções Meta por Evolution API + URL fixa de produção |
| Diagnóstico | `app/api/whatsapp/diagnostics/route.ts` | Opcional: incluir `webhook/find` (URL configurada vs esperada) |
| Documentação env | `.env.example` ou README | Listar variáveis `EVOLUTION_*` e URL de webhook |

**Fora do escopo:**

- Trocar provedor WhatsApp ou modelo de IA
- Autenticação HMAC no webhook Evolution (não usado hoje; avaliar em fase futura)
- Reescrever lógica SDR ou schema do banco

### 4. Validação em produção

1. `GET https://crmamelia.vercel.app/api/whatsapp/diagnostics` → `ALL SYSTEMS OK`
2. `GET https://api.odontogpt.com/webhook/find/amelia1` → URL = `https://crmamelia.vercel.app/api/whatsapp/webhook`
3. Enviar mensagem de teste ao número conectado → resposta do agente em menos de 15s
4. CRM: contato/conversa/mensagens inbound (`contact`) e outbound (`ai`)
5. Logs Vercel: `[Webhook] Received event: messages.upsert` sem `❌ Error processing`

**Fallback esperado se IA falhar:** mensagem fixa em português (já em `FALLBACK_MESSAGE` no webhook).

### 5. Timeouts e limites Vercel

| Etapa | Timeout no código |
|-------|-------------------|
| Webhook total | 8s (`WEBHOOK_TIMEOUT_MS`) |
| SDR OpenRouter | 6s (`SDR_TIMEOUT_MS`) |
| Evolution send | 5s (`EVOLUTION_TIMEOUT_MS`) |

Garantir que o projeto Vercel use runtime com limite ≥ 10s para a rota do webhook (Fluid Compute / config atual do projeto).

### 6. Segurança e operação

- API key Evolution apenas em Vercel Environment Variables (Production)
- Endpoint `/api/whatsapp/diagnostics` expõe nomes de env, não valores — considerar restringir a admin em implementação futura
- Após go-live, monitorar logs de `[Webhook]` e `[AI]` na Vercel

## Abordagem escolhida

**Híbrido:** variáveis já na Vercel (verificado); configurar webhook Evolution via Manager ou script; pequenos ajustes de UI/script/diagnóstico para evitar regressão operacional.

## Critérios de sucesso

- [ ] Mensagem inbound no WhatsApp gera resposta automática do agente SDR (teste manual pendente)
- [ ] Mensagem e contato aparecem no CRM em `crmamelia.vercel.app`
- [x] `diagnostics` permanece `ALL SYSTEMS OK` (pré-deploy)
- [x] Webhook Evolution aponta para `https://crmamelia.vercel.app/api/whatsapp/webhook` (via `pnpm whatsapp:setup-webhook`)

## Referências

- Evolution webhooks: https://doc.evolution-api.com/v2/en/configuration/webhooks
- Evolution set webhook: https://doc.evolution-api.com/v2/api-reference/webhook/set
- Commit relacionado: `9c77e01` (instância amelia1, URL odontogpt)
