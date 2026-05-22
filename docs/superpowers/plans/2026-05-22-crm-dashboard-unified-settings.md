# CRM Dashboard Home + Configurações Unificadas — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tornar o Dashboard a home do CRM com fila de trabalho acionável, unificar gestão em Configurações (sem `/admin` separado), e aplicar tema claro no app CRM.

**Architecture:** Redirects e RBAC primeiro; settings com layout + sub-rotas; API `inbox` unificada com filtros `assignedTo`; extração de inatividade compartilhada com pipeline; tokens CSS escopados ao layout CRM.

**Tech Stack:** Next.js 16 App Router, React 19, Drizzle/Neon, Tailwind CSS 4, Framer Motion, Jose RBAC (`lib/auth/rbac.ts`)

**Spec:** `docs/superpowers/specs/2026-05-22-crm-dashboard-unified-settings-design.md`

---

## File map

| File | Responsibility |
|------|----------------|
| `lib/auth/rbac.ts` | Redirect dashboard, acesso settings por seção |
| `lib/crm/inactivity.ts` | `getInactivityLevel`, labels, thresholds compartilhados |
| `app/api/crm/inbox/route.ts` | Dados da fila de trabalho |
| `app/crm/page.tsx` | Redirect → dashboard |
| `app/crm/dashboard/page.tsx` | UI inbox (3 colunas + filtro gestor) |
| `app/crm/settings/layout.tsx` | Sub-nav Perfil / Equipe / Templates / Integrações |
| `app/crm/settings/profile/page.tsx` | Perfil + senha (migrado de `settings/page.tsx`) |
| `app/crm/settings/team/page.tsx` | Membros + Estrutura (merge users + team) |
| `app/crm/settings/integrations/page.tsx` | WhatsApp + SDR status (admin) |
| `components/crm/CrmSidebar.tsx` | Nav “Início”, tema claro, sem admin section |
| `app/crm/layout.tsx` | Classes tema claro no shell |
| `styles/globals.css` | Tokens `--crm-*` |
| `app/admin/layout.tsx` | Redirects `/admin/*` → CRM settings |
| `middleware.ts` ou `app/admin/*/page.tsx` | Redirects legados |

---

## Phase 1 — RBAC e redirects

### Task 1: Atualizar redirects e acesso a settings

**Files:**
- Modify: `lib/auth/rbac.ts`
- Modify: `app/crm/page.tsx`
- Modify: `app/api/auth/login/route.ts` (se redirect hardcoded)

- [ ] **Step 1: Alterar `getDefaultRedirect`**

Em `lib/auth/rbac.ts`, substituir retornos CRM:

```typescript
export function getDefaultRedirect(role: string): string {
    switch (role) {
        case 'produtor':
            return '/admin/cms/posts' // ou rota de blog ativa no projeto
        case 'admin':
        case 'gestor':
        case 'vendedor':
            return '/crm/dashboard'
        default:
            return '/crm/dashboard'
    }
}
```

- [ ] **Step 2: Adicionar helper de seção de settings**

No mesmo arquivo:

```typescript
export type SettingsSection = 'profile' | 'team' | 'templates' | 'integrations'

export function canAccessSettingsSection(
    user: { role: string },
    section: SettingsSection
): boolean {
    const role = user.role as UserRole
    switch (section) {
        case 'profile':
            return canAccess(user, 'crm') // todos com CRM
        case 'team':
        case 'templates':
            return role === 'admin' || role === 'gestor'
        case 'integrations':
            return role === 'admin'
        default:
            return false
    }
}
```

- [ ] **Step 3: Incluir vendedor em `ACCESS_MAP.settings`**

Alterar:

```typescript
settings: ['admin', 'gestor'] as UserRole[],
```

Para:

```typescript
settings: ['admin', 'gestor', 'vendedor'] as UserRole[],
```

(Vendedor só acessa `profile` via layout guard.)

- [ ] **Step 4: Redirect `/crm` → dashboard**

`app/crm/page.tsx`:

```typescript
import { redirect } from 'next/navigation'

export default function CrmPage() {
    redirect('/crm/dashboard')
}
```

- [ ] **Step 5: Verificar build**

Run: `cd /Volumes/SSDdoMarcos/Projetos/crm-amelia && pnpm build`

Expected: compila sem erro

---

### Task 2: Redirects `/admin` → CRM

**Files:**
- Modify: `app/admin/page.tsx`
- Modify: `app/admin/users/page.tsx`
- Modify: `app/admin/team/page.tsx`
- Modify: `app/admin/connections/page.tsx`
- Modify: `app/admin/layout.tsx`

- [ ] **Step 1: Páginas admin viram redirect**

Exemplo `app/admin/page.tsx`:

```typescript
import { redirect } from 'next/navigation'

export default function AdminPage() {
    redirect('/crm/settings/team')
}
```

`app/admin/connections/page.tsx`:

```typescript
import { redirect } from 'next/navigation'

export default function AdminConnectionsPage() {
    redirect('/crm/settings/integrations')
}
```

`app/admin/users/page.tsx` e `app/admin/team/page.tsx` → `redirect('/crm/settings/team')` (team aceita `?tab=structure`).

- [ ] **Step 2: Atualizar guard em `app/admin/layout.tsx`**

Substituir redirect de não-admin de `/crm/pipeline` para `/crm/dashboard`:

```typescript
router.push('/crm/dashboard')
```

E redirect CMS:

```typescript
router.replace('/crm/dashboard')
```

- [ ] **Step 3: Teste manual redirects**

Run: `pnpm dev`

| URL | Esperado |
|-----|----------|
| `/crm` | `/crm/dashboard` |
| `/admin` | `/crm/settings/team` |
| `/admin/connections` | `/crm/settings/integrations` |

---

## Phase 2 — Settings unificado

### Task 3: Layout de Configurações com guard por seção

**Files:**
- Create: `app/crm/settings/layout.tsx`
- Create: `app/crm/settings/page.tsx` (redirect)
- Modify: `app/crm/settings/page.tsx` → mover para profile

- [ ] **Step 1: Criar `app/crm/settings/page.tsx` redirect**

```typescript
import { redirect } from 'next/navigation'

export default function SettingsIndexPage() {
    redirect('/crm/settings/profile')
}
```

- [ ] **Step 2: Criar layout com sub-nav**

`app/crm/settings/layout.tsx` (client):

```typescript
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/context'
import { canAccessSettingsSection, type SettingsSection } from '@/lib/auth/rbac'
import { cn } from '@/lib/utils/cn'
import { User, Users, Zap, Plug } from 'lucide-react'
import { useEffect } from 'react'

const NAV: { href: string; label: string; section: SettingsSection; icon: typeof User }[] = [
    { href: '/crm/settings/profile', label: 'Perfil', section: 'profile', icon: User },
    { href: '/crm/settings/team', label: 'Equipe', section: 'team', icon: Users },
    { href: '/crm/settings/templates', label: 'Templates', section: 'templates', icon: Zap },
    { href: '/crm/settings/integrations', label: 'Integrações', section: 'integrations', icon: Plug },
]

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    const { user } = useAuth()

    const visibleNav = NAV.filter((item) => user && canAccessSettingsSection(user, item.section))

    useEffect(() => {
        if (!user) return
        const match = NAV.find((n) => pathname.startsWith(n.href))
        if (match && !canAccessSettingsSection(user, match.section)) {
            router.replace('/crm/settings/profile')
        }
    }, [user, pathname, router])

    return (
        <div className="flex gap-8 max-w-5xl">
            <nav className="w-48 shrink-0 space-y-1">
                {visibleNav.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                            pathname.startsWith(item.href)
                                ? 'bg-[var(--crm-accent-bg)] text-[var(--crm-text)]'
                                : 'text-[var(--crm-text-muted)] hover:bg-[var(--crm-surface-2)]'
                        )}
                    >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                    </Link>
                ))}
            </nav>
            <div className="flex-1 min-w-0">{children}</div>
        </div>
    )
}
```

- [ ] **Step 3: Mover perfil para `profile/page.tsx`**

Copiar conteúdo de `app/crm/settings/page.tsx` (formulário nome/senha/logout) para `app/crm/settings/profile/page.tsx`. Remover blocos “Administração” e links duplicados para templates — ficam só no layout.

- [ ] **Step 4: Redirect legado users**

Criar `app/crm/settings/users/page.tsx`:

```typescript
import { redirect } from 'next/navigation'

export default function LegacySettingsUsersPage() {
    redirect('/crm/settings/team')
}
```

---

### Task 4: Página Equipe unificada

**Files:**
- Create: `app/crm/settings/team/page.tsx`
- Reference: `app/admin/users/page.tsx`, `app/admin/team/page.tsx`, `app/crm/settings/users/page.tsx`

- [ ] **Step 1: Criar página com abas Membros | Estrutura**

Usar `useSearchParams()` para `tab=structure`:

```typescript
const tab = searchParams.get('tab') === 'structure' ? 'structure' : 'members'
```

- **Membros:** reutilizar lógica de `app/admin/users/page.tsx` (fetch `/api/crm/users`, modal CRUD). Roles: `ALL_ROLES` de rbac. Só `admin` pode criar usuário com role `admin`.

- **Estrutura:** reutilizar UI de `app/admin/team/page.tsx` (gestores/vendedores). Remover `Math.random()` de `memberCount` — usar contagem real filtrando `teamLeadId` se existir no schema, ou omitir contador até ter campo.

- [ ] **Step 2: Proteger rota no server (opcional)**

Se houver middleware CRM, garantir gestor/admin. Client-side já coberto pelo layout.

- [ ] **Step 3: Teste manual**

Login gestor → `/crm/settings/team` → criar vendedor, ver aba Estrutura.

---

### Task 5: Página Integrações

**Files:**
- Create: `app/crm/settings/integrations/page.tsx`
- Reference: bloco WhatsApp/SDR em `app/crm/settings/page.tsx` (linhas ~370–412)
- Reference: `app/admin/cms/crm/settings/page.tsx` se tiver ações reais

- [ ] **Step 1: Extrair cards WhatsApp + Agente SDR**

Página admin-only com:
- Status conexão WhatsApp (fetch `/api/crm/whatsapp/test` se existir, senão status estático com TODO removido — usar resposta real da API)
- Link para QR code se aplicável
- Status agente SDR (texto configurado)

- [ ] **Step 2: Não recriar página Conexões mock**

Sem lista fake OpenAI/webhooks de `app/admin/connections/page.tsx`.

---

### Task 6: Atualizar CrmSidebar

**Files:**
- Modify: `components/crm/CrmSidebar.tsx`

- [ ] **Step 1: Renomear e reordenar nav**

```typescript
const navItems = [
    { href: '/crm/dashboard', label: 'Início', icon: LayoutDashboard },
    { href: '/crm/pipeline', label: 'Pipeline', icon: LayoutGrid },
    { href: '/crm/conversations', label: 'Conversas', icon: MessageSquare },
    { href: '/crm/contacts', label: 'Contatos', icon: UserCheck },
    { href: '/crm/settings/profile', label: 'Configurações', icon: Settings, exact: false },
]
```

Logo `href="/crm/dashboard"`.

- [ ] **Step 2: Remover blocos**

Deletar `adminNavItems`, seção “Administração”, link “Voltar ao Admin”.

- [ ] **Step 3: Active state para Configurações**

`pathname.startsWith('/crm/settings')` marca Configurações ativo.

---

## Phase 3 — API Inbox e Dashboard

### Task 7: Extrair utilitário de inatividade

**Files:**
- Create: `lib/crm/inactivity.ts`
- Modify: `app/crm/pipeline/page.tsx` (importar lib)

- [ ] **Step 1: Criar `lib/crm/inactivity.ts`**

```typescript
export type InactivityLevel = 'alert' | 'critical' | 'dormant' | null

export const INACTIVITY_THRESHOLDS = { alert: 4, critical: 24, dormant: 48 } as const

export function hoursSince(date: Date | null): number | null {
    if (!date) return null
    return (Date.now() - date.getTime()) / (1000 * 60 * 60)
}

export function getInactivityLevel(hours: number | null): InactivityLevel {
    if (hours === null) return null
    if (hours >= INACTIVITY_THRESHOLDS.dormant) return 'dormant'
    if (hours >= INACTIVITY_THRESHOLDS.critical) return 'critical'
    if (hours >= INACTIVITY_THRESHOLDS.alert) return 'alert'
    return null
}

export const INACTIVITY_LABELS: Record<NonNullable<InactivityLevel>, string> = {
    alert: 'Aguardando',
    critical: 'Sem resposta',
    dormant: 'Dormente',
}

export function formatInactivityDuration(hours: number): string {
    if (hours < 1) return `${Math.round(hours * 60)}min`
    if (hours < 24) return `${Math.round(hours)}h`
    return `${Math.floor(hours / 24)}d`
}
```

- [ ] **Step 2: Refatorar pipeline para importar**

Substituir definições locais em `app/crm/pipeline/page.tsx` por:

```typescript
import { getInactivityLevel, formatInactivityDuration, INACTIVITY_LABELS, ... } from '@/lib/crm/inactivity'
```

- [ ] **Step 3: Build**

Run: `pnpm build` — sem erros de import circular.

---

### Task 8: API `GET /api/crm/inbox`

**Files:**
- Create: `app/api/crm/inbox/route.ts`
- Reference: `app/api/crm/followups/route.ts`, `lib/db/schema.ts`

- [ ] **Step 1: Implementar handler**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { contactFollowups, contacts, conversations, deals, users, messages } from '@/lib/db/schema'
import { getCurrentUser } from '@/lib/auth'
import { canViewAllCRMData } from '@/lib/auth/rbac'
import { eq, and, lte, sql, desc, or, isNull } from 'drizzle-orm'
import { getInactivityLevel, hoursSince } from '@/lib/crm/inactivity'

export async function GET(request: NextRequest) {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const assigneeId = request.nextUrl.searchParams.get('assigneeId')
    const viewAll = canViewAllCRMData(user)
    const filterAssignee = (column: typeof contacts.assignedTo) => {
        if (!viewAll) return eq(column, user.id)
        if (assigneeId && assigneeId !== 'all') return eq(column, assigneeId)
        return undefined
    }

    const now = new Date()

    // Follow-ups: sent=false, scheduledAt <= now
    const followupRows = await db.select({...}).from(contactFollowups)
        .innerJoin(contacts, eq(contactFollowups.contactId, contacts.id))
        .where(and(
            eq(contactFollowups.sent, false),
            lte(contactFollowups.scheduledAt, now),
            filterAssignee(contacts.assignedTo) ?? sql`true`,
        ))
        .orderBy(contactFollowups.scheduledAt)
        .limit(10)

    // Conversations: active + inbound pendente (lastInboundAt, sem outbound depois)
    // Implementar query similar à lógica do pipeline — deals com lastInboundAt e getInactivityLevel !== null

    // Deals: join deals + contacts, filtrar inatividade via hoursSince(lastInboundAt ou updatedAt)

    const assignees = viewAll
        ? await db.select({ id: users.id, name: users.name }).from(users)
            .where(or(eq(users.role, 'vendedor'), eq(users.role, 'gestor')))
        : []

    return NextResponse.json({
        counts: {
            followups: followupRows.length,
            conversations: conversationRows.length,
            deals: dealRows.length,
            total: followupRows.length + conversationRows.length + dealRows.length,
        },
        followups: followupRows,
        conversations: conversationRows,
        deals: dealRows,
        assignees,
    })
}
```

**Nota implementação:** Alinhar critério de “conversa aguardando” com pipeline: usar `conversations.lastInboundAt` + ausência de resposta outbound posterior (ver query usada em pipeline ou simplificar: `flowState` active e `hoursSince(lastInboundAt) >= 4`).

- [ ] **Step 2: Teste API com curl**

```bash
curl -s -b cookies.txt 'http://localhost:3000/api/crm/inbox' | jq '.counts'
```

Expected: JSON com `counts.total` numérico.

---

### Task 9: Reescrever Dashboard

**Files:**
- Modify: `app/crm/dashboard/page.tsx`
- Create (opcional): `components/crm/InboxColumn.tsx`

- [ ] **Step 1: Fetch inbox com filtro**

```typescript
const [assigneeId, setAssigneeId] = useState<string>('all')
const url = assigneeId === 'all'
    ? '/api/crm/inbox'
    : `/api/crm/inbox?assigneeId=${assigneeId}`

useEffect(() => {
    fetch(url, { credentials: 'include' }).then(r => r.json()).then(setInbox)
}, [assigneeId])
```

- [ ] **Step 2: Header com contador e select gestor**

Mostrar `assignees` no `<select>` apenas se `user.role` é `admin` ou `gestor`.

- [ ] **Step 3: Três colunas**

Componente por coluna: título, lista (max 10), link “Ver todos”:
- Follow-ups → contact page
- Conversas → `/crm/conversations/[id]`
- Deals → `/crm/pipeline?deal={id}`

Badges usando classes light (ver Task 10).

- [ ] **Step 4: Remover KPI grid e quick actions**

Deletar `statCards`, pipeline summary widget, quick actions grid.

- [ ] **Step 5: Rodapé compacto**

Uma linha com totais + link pipeline.

- [ ] **Step 6: Teste manual checklist (spec §7)**

---

## Phase 4 — Tema claro

### Task 10: Tokens CSS CRM

**Files:**
- Modify: `styles/globals.css`
- Modify: `app/crm/layout.tsx`

- [ ] **Step 1: Adicionar tokens em `:root`**

```css
:root {
  --crm-surface: #ffffff;
  --crm-surface-2: #f7f7f8;
  --crm-border: #e5e5e7;
  --crm-text: #0a0a0a;
  --crm-text-muted: #6b6b6b;
  --crm-accent: var(--color-gold-primary);
  --crm-accent-bg: rgba(123, 107, 177, 0.12);
}
```

- [ ] **Step 2: Aplicar no layout CRM**

`app/crm/layout.tsx`:

```typescript
<div className="h-screen flex overflow-hidden bg-[var(--crm-surface)] text-[var(--crm-text)]">
```

Loading state: fundo `--crm-surface-2` em vez de `bg-black-deep`.

---

### Task 11: Sidebar e componentes CRM (tema claro)

**Files:**
- Modify: `components/crm/CrmSidebar.tsx`
- Modify: `app/crm/dashboard/page.tsx` (classes de card)

- [ ] **Step 1: Sidebar clara**

Substituir `bg-charcoal border-white/10` por:

```typescript
className="fixed ... bg-[var(--crm-surface-2)] border-r border-[var(--crm-border)]"
```

Item ativo: `bg-[var(--crm-accent-bg)] text-[var(--crm-text)] border border-[var(--crm-border)]`

Texto default: `text-[var(--crm-text-muted)]`

- [ ] **Step 2: Cards do dashboard**

`bg-white border border-[var(--crm-border)] rounded-2xl shadow-sm`

- [ ] **Step 3: Badges inatividade (light)**

```typescript
const inboxBadgeStyles = {
    alert: 'bg-amber-50 text-amber-800 border-amber-200',
    critical: 'bg-orange-50 text-orange-800 border-orange-200',
    dormant: 'bg-red-50 text-red-800 border-red-200',
}
```

- [ ] **Step 4: Passagem incremental pipeline/conversas/contatos**

Substituir `bg-charcoal`, `text-white`, `text-platinum` por tokens CRM nos arquivos tocados nesta PR (mínimo: dashboard + sidebar + settings layout). Pipeline pode ser follow-up se PR grande.

---

## Phase 5 — Limpeza legado

### Task 12: Remover código morto

**Files:**
- Delete: `app/admin/cms/crm/**` (após confirmar redirects)
- Delete ou manter redirect-only: `app/admin/users`, `app/admin/team`, `app/admin/connections` pages (manter thin redirect)
- Modify: `app/admin/page.tsx` (já redirect)

- [ ] **Step 1: Verificar nenhum link interno para `/admin/cms`**

Run: `rg '/admin/cms' app components`

Expected: zero ou só redirects

- [ ] **Step 2: Remover diretório `app/admin/cms/crm`**

- [ ] **Step 3: Atualizar spec antiga**

Adicionar nota em `2026-05-11-crm-flow-reorganization-design.md`: superseded por `2026-05-22-*`.

- [ ] **Step 4: Build final + lint**

Run:

```bash
pnpm lint && pnpm build
```

Expected: pass

---

## Spec coverage checklist

| Requisito spec | Task |
|----------------|------|
| Dashboard home | 1, 4, 9 |
| Fila trabalho | 7, 8, 9 |
| Filtro gestor | 8, 9 |
| Eliminar /admin UI | 2, 12 |
| Equipe unificada | 4 |
| Sem Conexões | 2, 5 |
| Settings por papel | 1, 3 |
| Tema claro | 10, 11 |
| API inbox | 8 |
| Redirects | 1, 2, 3 |

---

## Manual test plan (final)

- [ ] Login vendedor → `/crm/dashboard`, só itens atribuídos
- [ ] Login gestor → filtro atendente altera listas
- [ ] Login admin → Equipe + Integrações; sem “Voltar ao Admin”
- [ ] Vendedor em `/crm/settings` → só Perfil
- [ ] `/admin/connections` → integrações
- [ ] Tema claro legível (sidebar + dashboard)
- [ ] `pnpm build` OK
