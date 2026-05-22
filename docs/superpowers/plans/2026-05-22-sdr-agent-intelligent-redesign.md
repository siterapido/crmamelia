# SDR Agent Intelligent Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Evolve the Amélia SDR agent into a consultative, landing-informed assistant on Kimi K2.6, and ship client-facing flow documentation (site + DOCX).

**Architecture:** Structured knowledge in `amelia-knowledge.ts` feeds a refactored `sdr-prompt.ts` with flexible 6-field checklist; `sdr-agent.ts` switches model/timeouts; CRM actions persist `has_plan`/`urgency`; public `/como-funciona` + `gerar_fluxo_cliente.py`.

**Tech Stack:** Next.js 16, Vercel AI SDK `generateObject`, OpenRouter, Drizzle, python-docx

**Spec:** `docs/superpowers/specs/2026-05-22-sdr-agent-intelligent-redesign-design.md`

---

## Implementation status (2026-05-22)

- [x] Task 1: `lib/ai/amelia-knowledge.ts`
- [x] Task 2: Refactor `lib/ai/sdr-prompt.ts`
- [x] Task 3: `lib/ai/sdr-agent.ts` — Kimi K2.6, 35s, 600 tokens
- [x] Task 4: `lib/ai/sdr-actions.ts` — has_plan, urgency
- [x] Task 5: Admin + diagnostics copy
- [x] Task 6: `app/como-funciona/page.tsx` + Footer link
- [x] Task 7: `docs/gerar_fluxo_cliente.py` + npm scripts
- [x] Task 8: `pnpm build` passes

## Manual verification (remaining)

- [ ] `npx tsx scripts/test-ai.ts` with `OPENROUTER_API_KEY` — confirm JSON + tone
- [ ] WhatsApp real message — operadoras question + natural qualify
- [ ] `pnpm docs:fluxo-cliente` — open `docs/fluxo-agente-cliente.docx`
- [ ] Visit `/como-funciona` locally
