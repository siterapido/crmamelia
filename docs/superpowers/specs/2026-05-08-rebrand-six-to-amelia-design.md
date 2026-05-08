# Rebranding: SIX Saúde → Amélia Saúde

**Date:** 2026-05-08
**Status:** Approved

## Goal

Substituir todas as referências à marca "SIX Saúde" por "Amélia Saúde" em todo o CRM — prompts de IA, UI components, metadata/SEO, logos, configurações, domínios e documentação.

## Scope

### 1. AI Prompts & Personas
| File | Change |
|------|--------|
| `lib/ai/sdr-prompt.ts` | "assistente virtual da SIX Saúde" → "assistente virtual da Amélia Saúde" |
| `app/api/chat/support/route.ts` | SYSTEM_PROMPT: "SIX Saúde" → "Amélia Saúde" |
| `app/api/ai/generate-post/route.ts` | "especialista em ... SIX Saúde" → "Amélia Saúde" |
| `lib/ai/inactivity-messages.ts` | Nome nas mensagens de inatividade |
| `lib/ai/sdr-agent.ts` | `X-Title: 'SIX Saude SDR Agent'` → `'Amelia Saude SDR Agent'` |
| `lib/ai/sdr-actions.ts` | Deal title `${name} - SIX Saúde` → `${name} - Amélia Saúde` |

### 2. UI Components
| File | Change |
|------|--------|
| `components/ui/AIChatWidget.tsx` | "Assistente SIX Saúde" → "Assistente Amélia Saúde", welcome message |
| `components/ui/WhatsAppButton.tsx` | "Vim pelo site da SIX Saúde" → "Vim pelo site da Amélia Saúde" |
| `components/layout/Navbar.tsx` | Logo paths, alt text |
| `components/layout/Footer.tsx` | Footer branding, email, social text |
| `components/admin/Sidebar.tsx` | Admin sidebar logo |
| `components/crm/CrmSidebar.tsx` | CRM sidebar logo |
| `components/logo.tsx` | Alt text "Six Saúde" → "Amélia Saúde" |
| `components/logo-image.tsx` | Alt text |
| `components/logo-horizontal.tsx` | Alt text |
| `components/logo-horizontal-image.tsx` | Alt text |
| `components/sections/HeroSection.tsx` | WhatsApp message text |
| `components/sections/HeroSectionGold.tsx` | WhatsApp message text |
| `components/sections/CTABanner.tsx` | WhatsApp message text |
| `components/sections/AppSection.tsx` | "aplicativo SIX Saúde" → "aplicativo Amélia Saúde" |
| `components/sections/HighlightSection.tsx` | "Por que a SIX Saúde?" → "Por que a Amélia Saúde?" |

### 3. Metadata & SEO
| File | Change |
|------|--------|
| `app/layout.tsx` | title, OG metadata, siteName, Schema.org JSON-LD, social links |
| `app/page.tsx` | metadata title, OG description |
| `app/lp-2/page.tsx` | metadata title |
| `app/blog/[slug]/page.tsx` | "Blog SIX Saúde" → "Blog Amélia Saúde" |
| `app/noticias/[slug]/page.tsx` | Metadata title |
| `app/cookies/page.tsx` | Page title |
| `app/login/page.tsx` | Logo + copyright text |

### 4. Logo Files (Rename)
| Current | New |
|---------|-----|
| `public/six-saude-logo-preta.svg` | `public/amelia-saude-logo-preta.svg` |
| `public/six-saude-logo-branca.svg` | `public/amelia-saude-logo-branca.svg` |
| `public/six-saude-logo-amarela.svg` | `public/amelia-saude-logo-amarela.svg` |
| `public/six-saude-logo-preta-horizontal.svg` | `public/amelia-saude-logo-preta-horizontal.svg` |
| `public/six-saude-logo-branca-horizontal.svg` | `public/amelia-saude-logo-branca-horizontal.svg` |
| `public/six-saude-logo-amarela-horizontal.svg` | `public/amelia-saude-logo-amarela-horizontal.svg` |
| `public/Logos/SIX SAÚDE LOGO FINAL - Branca.png` | `public/Logos/AMÉLIA SAÚDE LOGO FINAL - Branca.png` |
| `public/Logos/SIX SAÚDE LOGO FINAL - Preta .png` | `public/Logos/AMÉLIA SAÚDE LOGO FINAL - Preta.png` |
| `public/Logos/SIX SAÚDE LOGO FINAL - Amarela.png` | `public/Logos/AMÉLIA SAÚDE LOGO FINAL - Amarela.png` |

### 5. Configuration & Environment
| File | Change |
|------|--------|
| `package.json` | `"name": "sixsaude"` → `"ameliasaude"` |
| `.env.example` | `EVOLUTION_INSTANCE_NAME=sixsaude` → `ameliasaude` |
| `.env.local` | `EVOLUTION_INSTANCE_NAME=sixosaudeficial` → `ameliasaudeoficial` |
| `app/api/upload/route.ts` | `sixsaude.vercel.app` → `ameliasaude.vercel.app` |

### 6. Domain & Contact Info
All occurrences of `sixsaude.com.br` → `ameliasaude.com.br` in:
- Footer, LegalPageLayout, CTABanner, sdr-actions.ts, lib/db/seed.ts
- Emails: contato@sixsaude.com.br → contato@ameliasaude.com.br

### 7. Documentation
| File | Change |
|------|--------|
| `CLAUDE.md` | "SIX Saude" → "Amélia Saúde" |
| `CLAWDBOT-MIGRATION.md` | All references |
| `components/logo.README.md` | Title and examples |
| `components/NAVBAR-LOGO-UPDATE.md` | All references |
| `Documentos /prompts.md` | Relevant mentions |

## Out of Scope
- Database schema changes
- Business logic changes
- SPIN Selling methodology
- Plan names, pricing, contact phone numbers
- Design system (colors, fonts, tailwind config)
- CRM functionality

## Verification
- `npm run build` — must succeed
- `npm run test` — all tests pass
- Visual inspection of chat widget and landing page
