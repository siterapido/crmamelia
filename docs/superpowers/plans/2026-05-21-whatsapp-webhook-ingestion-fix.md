# WhatsApp Webhook Ingestion Fix — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Garantir que mensagens inbound reais do WhatsApp apareçam no CRM e disparem o agente SDR, corrigindo ingestão webhook (evento, array `data`, persistência síncrona, observabilidade `@lid`).

**Architecture:** Persistência CRM síncrona antes do HTTP 200; agente IA apenas em `after()`. Resposta do webhook expõe `persisted` e `skipped` para diagnóstico. Scripts validam pipeline sem depender de mensagem manual.

**Tech Stack:** Next.js 16 App Router, Drizzle/Neon, Evolution API, Vercel `after()`, OpenRouter via `lib/ai/sdr-agent.ts`

**Spec:** `docs/superpowers/specs/2026-05-21-whatsapp-webhook-ingestion-fix-design.md`

---

## File map

| File | Responsibility |
|------|----------------|
| `app/api/whatsapp/webhook/route.ts` | Ingestão inbound: normalizar evento, persist sync, IA async, resposta com `skipped` |
| `app/api/whatsapp/diagnostics/route.ts` | Hint de smoke test + resultado esperado |
| `scripts/test-webhook-post.ts` | POST simulado para produção/local |
| `scripts/check-webhook-config.ts` | Valida Evolution + roda smoke POST |

---

### Task 1: Webhook — rastrear mensagens ignoradas (`skipped`)

**Files:**
- Modify: `app/api/whatsapp/webhook/route.ts`

- [ ] **Step 1: Adicionar array `skipped` no handler POST**

No início do bloco `messages.upsert` (após `let persistedCount = 0`), adicionar:

```typescript
const skipped: { reason: string; remoteJid?: string }[] = []
```

- [ ] **Step 2: Registrar skip quando `resolveContactFromUpsert` falha**

Substituir:

```typescript
const resolved = resolveContactFromUpsert(messageData, payload)
if (!resolved) {
    continue
}
```

Por:

```typescript
const resolved = resolveContactFromUpsert(messageData, payload)
if (!resolved) {
    const remoteJid = (messageData.key as { remoteJid?: string })?.remoteJid
    skipped.push({
        reason: remoteJid?.includes('@lid') ? 'lid_unresolved' : 'contact_unresolved',
        remoteJid,
    })
    continue
}
```

- [ ] **Step 3: Incluir `skipped` na resposta JSON**

Substituir:

```typescript
return NextResponse.json({ status: 'ok', persisted: persistedCount })
```

Por:

```typescript
return NextResponse.json({
    status: 'ok',
    persisted: persistedCount,
    ...(skipped.length > 0 ? { skipped } : {}),
})
```

- [ ] **Step 4: Verificar build**

Run: `cd /Volumes/SSDdoMarcos/Projetos/crm-amelia && pnpm build`

Expected: compila sem erro em `webhook/route.ts`

---

### Task 2: Webhook — confirmar persistência síncrona e IA em `after()` apenas

**Files:**
- Modify: `app/api/whatsapp/webhook/route.ts` (verificação; maior parte já implementada)

- [ ] **Step 1: Confirmar que `persistInboundMessage` é awaited antes do `200`**

Verificar que não existe `after()` envolvendo `persistInboundMessage`. Deve existir apenas:

```typescript
const ctx = await persistInboundMessage(...)
persistedCount++
// ...
after(async () => { await runSDRAgent(...) })
```

- [ ] **Step 2: Confirmar normalização de evento**

Função `normalizeWebhookEvent` deve transformar `MESSAGES_UPSERT` → `messages.upsert`:

```typescript
function normalizeWebhookEvent(event: string | undefined): string {
    if (!event) return ''
    const e = event.toLowerCase().replace(/_/g, '.')
    if (e === 'messages.upsert') return 'messages.upsert'
    if (e === 'messages.update') return 'messages.update'
    return e
}
```

- [ ] **Step 3: Confirmar `collectUpsertMessages` aceita array**

```typescript
function collectUpsertMessages(data: unknown): Record<string, unknown>[] {
    if (!data) return []
    if (Array.isArray(data)) return data as Record<string, unknown>[]
    return [data as Record<string, unknown>]
}
```

- [ ] **Step 4: Teste local do webhook (opcional se `pnpm dev` rodando)**

Run: `npx tsx scripts/test-webhook-post.ts http://localhost:3000`

Expected: `{"status":"ok","persisted":1}`

---

### Task 3: Script `test-webhook-post.ts` — casos @lid e MESSAGES_UPSERT

**Files:**
- Modify: `scripts/test-webhook-post.ts`

- [ ] **Step 1: Aceitar modo via argv**

```typescript
const mode = process.argv[3] || 'valid' // valid | lid
const baseUrl = process.argv[2] || 'https://crmamelia.vercel.app'

const payloads: Record<string, object> = {
    valid: {
        event: 'MESSAGES_UPSERT',
        instance: 'amelia1',
        data: [{
            key: {
                remoteJid: '5584986174829@s.whatsapp.net',
                fromMe: false,
                id: `test-${Date.now()}`,
            },
            pushName: 'Webhook Test',
            message: { conversation: 'Teste automático pipeline webhook' },
        }],
    },
    lid: {
        event: 'MESSAGES_UPSERT',
        instance: 'amelia1',
        data: [{
            key: {
                remoteJid: '123456789@lid',
                fromMe: false,
                id: `test-lid-${Date.now()}`,
            },
            pushName: 'LID Test',
            message: { conversation: 'Teste @lid' },
        }],
    },
}

const payload = payloads[mode] ?? payloads.valid
```

- [ ] **Step 2: Rodar ambos os modos em produção**

Run:

```bash
npx tsx scripts/test-webhook-post.ts https://crmamelia.vercel.app valid
npx tsx scripts/test-webhook-post.ts https://crmamelia.vercel.app lid
```

Expected:
- `valid` → `persisted: 1`
- `lid` → `persisted: 0` e `skipped: [{ reason: 'lid_unresolved', ... }]`

---

### Task 4: Script `check-webhook-config.ts` — smoke POST integrado

**Files:**
- Modify: `scripts/check-webhook-config.ts`

- [ ] **Step 1: Adicionar smoke POST após validação Evolution**

No final de `main()`, antes do fechamento:

```typescript
console.log('\n=== Webhook smoke POST (production) ===')
const smokePayload = {
    event: 'MESSAGES_UPSERT',
    instance,
    data: [{
        key: {
            remoteJid: '5521971724757@s.whatsapp.net',
            fromMe: false,
            id: `smoke-${Date.now()}`,
        },
        pushName: 'Smoke Check',
        message: { conversation: 'Smoke test from check-webhook-config' },
    }],
}
const smokeRes = await fetch(EXPECTED_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(smokePayload),
})
const smokeBody = await smokeRes.text()
console.log('Status:', smokeRes.status)
console.log('Body:', smokeBody)
console.log(smokeRes.ok && smokeBody.includes('"persisted":1') ? '✅ Smoke persisted' : '❌ Smoke failed — check deploy')
```

- [ ] **Step 2: Executar script**

Run: `npx tsx scripts/check-webhook-config.ts`

Expected: todas as validações ✅ + smoke `persisted: 1`

---

### Task 5: Diagnostics — instrução de teste webhook

**Files:**
- Modify: `app/api/whatsapp/diagnostics/route.ts`

- [ ] **Step 1: Adicionar check `webhook_smoke_test` na resposta**

Antes do `return NextResponse.json`, adicionar:

```typescript
diagnostics['webhook_smoke_test'] = {
    status: 'ℹ️ MANUAL',
    detail:
        'Run: npx tsx scripts/test-webhook-post.ts https://crmamelia.vercel.app valid — expect persisted:1. Real WhatsApp must show inbound in CRM within 30s.',
}
```

- [ ] **Step 2: Verificar endpoint**

Run: `curl -s https://crmamelia.vercel.app/api/whatsapp/diagnostics | head -c 500`

Expected: campo `webhook_smoke_test` presente

---

### Task 6: Deploy produção e validação com usuário (B → OK)

**Files:** nenhum (operações)

- [ ] **Step 1: Commit das mudanças**

```bash
git add app/api/whatsapp/webhook/route.ts \
  app/api/whatsapp/diagnostics/route.ts \
  scripts/test-webhook-post.ts \
  scripts/check-webhook-config.ts \
  docs/superpowers/specs/2026-05-21-whatsapp-webhook-ingestion-fix-design.md \
  docs/superpowers/plans/2026-05-21-whatsapp-webhook-ingestion-fix.md
git commit -m "fix(whatsapp): sync webhook ingestion and skipped observability"
```

- [ ] **Step 2: Deploy Vercel produção**

Run: `vercel --prod` (ou push para branch conectada ao projeto `crmamelia`)

Expected: deploy concluído sem erro

- [ ] **Step 3: Smoke pós-deploy**

```bash
npx tsx scripts/test-webhook-post.ts https://crmamelia.vercel.app valid
npx tsx scripts/check-webhook-config.ts
```

- [ ] **Step 4: Teste real WhatsApp**

1. Enviar mensagem para o número conectado na instância `amelia1`
2. Abrir CRM → conversas
3. Confirmar inbound em &lt; 30s
4. Confirmar resposta agente ou fallback em &lt; 60s

- [ ] **Step 5: Se ainda B (CRM vazio)**

1. Ver logs Vercel filtro `[Webhook]` na hora do envio
2. Se **nenhum log** → escalar operador `api.odontogpt.com` (webhook não dispara)
3. Se log `LID unresolved` ou `persisted:0` + `skipped` → upgrade Evolution (issue #2326) ou capturar payload real nos logs

---

## Plan self-review (spec coverage)

| Spec requirement | Task |
|------------------|------|
| normalizeWebhookEvent | Task 2 |
| collectUpsertMessages array | Task 2 |
| resolveContactFromUpsert / @lid | Task 1–2 (já existe) + Task 1 skipped |
| persist sync + after só IA | Task 2 |
| skipped na resposta | Task 1 |
| 500 persist_failed | Task 2 (já existe) |
| diagnostics hint | Task 5 |
| scripts smoke | Task 3–4 |
| deploy + validação B | Task 6 |

No placeholders. All tasks have concrete files and commands.
