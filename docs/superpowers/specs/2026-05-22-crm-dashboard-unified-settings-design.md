# Design: Dashboard como Home, Configurações Unificadas e Tema Claro

**Data:** 2026-05-22  
**Status:** Aprovado  
**Substitui parcialmente:** `2026-05-11-crm-flow-reorganization-design.md` (pipeline-first e área `/admin` separada)

## Problema

O CRM atual fragmenta a experiência em três “apps” mentais:

1. **Pipeline como home** — usuário cai no Kanban, não na ação do dia.
2. **Admin separado** (`/admin`) — duplica Usuários, Equipe, Conexões (mock) e gera botão “Voltar ao Admin”.
3. **Configurações espalhadas** — sidebar com “Administração” (Atendentes, Templates) + `/crm/settings` + `/admin/*`.

O dashboard existente prioriza KPIs genéricos e resumo de pipeline, pouco alinhado a CRMs com IA que abrem com **fila de trabalho** (o que fazer agora).

## Decisões do produto (validadas)

| Tema | Decisão |
|------|---------|
| Home | Dashboard (`/crm/dashboard`) |
| Conteúdo do dashboard | Fila de trabalho: follow-ups, conversas aguardando, deals parados |
| Gestor no dashboard | Fila da equipe com filtro por atendente |
| Admin `/admin` | Eliminar como área separada; tudo em Configurações no CRM |
| Conexões | Remover aba/página; integrações reais em Configurações → Integrações |
| Equipe + Usuários | Uma seção **Equipe** (lista + hierarquia) |
| Acesso Configurações | Todos entram; vendedor só **Perfil**; gestor/admin veem Equipe e Templates; admin vê Integrações |
| Visual | **Tema claro** como padrão do CRM (identidade preto/dourado) |

## Abordagem escolhida

**Hub único no CRM** com sub-rotas em Configurações + redirects de `/admin/*` para compatibilidade.

Alternativas descartadas:

- Página única de settings com scroll — não escala.
- Manter `/admin` como UI ativa — mantém redundância.

---

## 1. Navegação e arquitetura de informação

### Sidebar CRM

| Item | Rota | Papéis |
|------|------|--------|
| Início | `/crm/dashboard` | admin, gestor, vendedor |
| Pipeline | `/crm/pipeline` | admin, gestor, vendedor |
| Conversas | `/crm/conversations` | admin, gestor, vendedor |
| Contatos | `/crm/contacts` | admin, gestor, vendedor |
| Configurações | `/crm/settings` | todos (conteúdo por papel) |

**Removido:**

- Seção sidebar “Administração” (Atendentes, Templates)
- Link “Voltar ao Admin”
- Navegação ativa para `/admin` no fluxo diário

### Configurações — layout com sub-navegação

Novo layout: `app/crm/settings/layout.tsx` com tabs/links laterais.

| Seção | Rota | admin | gestor | vendedor |
|-------|------|:-----:|:------:|:--------:|
| Perfil | `/crm/settings/profile` | ✓ | ✓ | ✓ |
| Equipe | `/crm/settings/team` | ✓ | ✓ | — |
| Templates | `/crm/settings/templates` | ✓ | ✓ | — |
| Integrações | `/crm/settings/integrations` | ✓ | — | — |

- `/crm/settings` → redirect para `/crm/settings/profile`
- Conteúdo atual de `app/crm/settings/page.tsx` (perfil/senha) migra para `profile/page.tsx`
- `app/crm/settings/users/page.tsx` → consolidado em `team/page.tsx`
- WhatsApp/SDR hoje em settings → `integrations/page.tsx` (substitui mock `/admin/connections`)

### Equipe unificada

Uma página substitui:

- `/admin/users`
- `/admin/team`
- `/crm/settings/users` (“Atendentes”)

**UI em duas abas:**

1. **Membros** — tabela CRUD (nome, e-mail, papel, ativo), usa `/api/crm/users`
2. **Estrutura** — hierarquia gestor → vendedores (UI atual de `/admin/team`)

Apenas `admin` pode criar/editar papéis `admin` e desativar contas; `gestor` gerencia vendedores da equipe.

### Redirects e login

| Origem | Destino |
|--------|---------|
| `getDefaultRedirect()` (admin, gestor, vendedor) | `/crm/dashboard` |
| `/crm` | `/crm/dashboard` |
| Logo sidebar | `/crm/dashboard` |
| `/admin` | `/crm/settings/team` (admin/gestor) ou `/crm/dashboard` |
| `/admin/users` | `/crm/settings/team` |
| `/admin/team` | `/crm/settings/team?tab=structure` |
| `/admin/connections` | `/crm/settings/integrations` |
| `/crm/settings/users` | `/crm/settings/team` |
| `app/admin/cms/crm/*` | equivalente em `/crm/*` (já parcial) |

**Produtor:** `getDefaultRedirect()` deve apontar para a área de blog existente (ex.: `/admin` só se ainda houver CMS de posts; caso contrário, rota de blog definida no projeto). Não usa dashboard CRM.

### RBAC

Atualizar `lib/auth/rbac.ts`:

- `canAccess(user, 'settings')` → incluir `vendedor` para rota base e `profile`
- Nova helper `canAccessSettingsSection(user, section)` ou matriz por seção
- `users:manage` continua só `admin`; gestor usa `crm:assign` + gestão de vendedores na API existente
- Middleware/layout de settings bloqueia seções por papel (redirect para profile se vendedor tentar `/team`)

---

## 2. Dashboard — fila de trabalho

### Objetivo

Responder: *“O que preciso fazer agora?”* em menos de 5 segundos.

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Bom dia, {nome} · {data}          [Atendente ▼]  [+ Contato]│
│ 12 itens precisam de atenção                                 │
├─────────────────────────────────────────────────────────────┤
│ [Follow-ups 4] [Conversas 5] [Deals 3]  ← chips filtráveis  │
├──────────────┬──────────────┬───────────────────────────────┤
│ Follow-ups   │ Conversas    │ Deals parados                 │
│ (lista)      │ (lista)      │ (lista)                       │
├──────────────┴──────────────┴───────────────────────────────┤
│ 8 conversas ativas · 16 deals abertos · Ver pipeline →      │
└─────────────────────────────────────────────────────────────┘
```

### Critérios de cada fila

**Follow-ups**

- `contact_followups.sent = false`
- `scheduledAt <= now()` → badge “Atrasado”
- Ordenar por `scheduledAt` ASC
- Escopo: `assignedTo` do contato = usuário (vendedor) ou filtro gestor

**Conversas**

- Status ativo com inbound pendente de resposta humana
- Badges (reutilizar pipeline): Aguardando (4h), Sem resposta (24h), Dormente (48h)
- Ordenar por urgência (dormant > critical > alert)
- Link: `/crm/conversations/[id]`

**Deals parados**

- Deals abertos com última atividade/inbound acima dos limiares de inatividade
- Mesma função `getInactivityLevel` de `app/crm/pipeline/page.tsx`
- Link: `/crm/pipeline` com scroll/highlight do deal (query `?deal=id`)

### Gestor — filtro de equipe

- Select no header: “Todos” + lista de vendedores/gestores
- Query `assigneeId` na API; default “Todos”
- Contadores dos chips refletem filtro ativo

### API

**Novo:** `GET /api/crm/inbox?assigneeId=<uuid|all>`

```typescript
{
  counts: { followups: number, conversations: number, deals: number, total: number },
  followups: InboxFollowup[],
  conversations: InboxConversation[],
  deals: InboxDeal[],
  assignees?: { id: string, name: string }[]  // só gestor/admin
}
```

- Implementação: queries paralelas com filtros `assignedTo` em contacts/conversations/deals
- Limite: 10 itens por coluna na resposta (paginação futura: `?limit=`)

### Removido do dashboard

- Grid 4 KPIs (Novos Leads, etc.)
- Widget “Ações rápidas”
- Breakdown completo `dealsByStage` (permanece no Pipeline)

### Estados vazios

- Copy acionável: “Nenhum follow-up pendente — ótimo trabalho!”
- CTA secundário para Pipeline ou Conversas quando uma fila está vazia mas outras não

---

## 3. Tema claro (design system CRM)

### Tokens CSS (ex.: `app/crm/crm-theme.css` ou extensão globals)

| Token | Valor | Uso |
|-------|-------|-----|
| `--crm-surface` | `#FFFFFF` | Fundo página |
| `--crm-surface-2` | `#F7F7F8` | Sidebar, cards |
| `--crm-border` | `#E5E5E7` | Bordas |
| `--crm-text` | `#0A0A0A` | Primário |
| `--crm-text-muted` | `#6B6B6B` | Secundário |
| `--crm-accent` | `#F5A623` | CTAs, ativo |
| `--crm-accent-bg` | `#FFF8E7` | Item nav ativo |

### Escopo

- **Incluído:** `app/crm/**`, `components/crm/**`, layout settings unificado
- **Excluído:** blog público, landing, `app/admin/login`

### Componentes prioritários

1. `CrmSidebar` — fundo claro, logo com contraste
2. `app/crm/layout.tsx` — `bg-[var(--crm-surface)]`
3. Dashboard inbox (novo)
4. Pipeline, conversas, contatos (passagem incremental; mesmos tokens)

### Badges de urgência

Manter semântica: âmbar (alert), laranja (critical), vermelho (dormant) com fundos claros (`*-50` Tailwind).

### Acessibilidade

- Texto secundário ≥ 4.5:1 sobre branco
- Focus ring visível em itens da fila e sidebar

---

## 4. Migração e limpeza técnica

### Arquivos a criar

| Arquivo | Função |
|---------|--------|
| `app/crm/settings/layout.tsx` | Sub-nav settings |
| `app/crm/settings/profile/page.tsx` | Perfil (migrado) |
| `app/crm/settings/team/page.tsx` | Equipe unificada |
| `app/crm/settings/integrations/page.tsx` | WhatsApp, webhooks, status IA |
| `app/api/crm/inbox/route.ts` | Dados do dashboard |
| `lib/crm/inactivity.ts` | Extrair lógica compartilhada pipeline/inbox |

### Arquivos a remover (após redirects)

- `app/admin/page.tsx`, `app/admin/users/`, `app/admin/team/`, `app/admin/connections/`
- `app/admin/cms/crm/**` (diretório legado)
- `components/admin/Sidebar.tsx` se não usado por login

### Arquivos a modificar

| Arquivo | Mudança |
|---------|---------|
| `components/crm/CrmSidebar.tsx` | Nav nova, tema claro, sem admin section |
| `app/crm/page.tsx` | Redirect `/crm/dashboard` |
| `lib/auth/rbac.ts` | Redirect, settings access vendedor |
| `app/crm/dashboard/page.tsx` | Reescrita inbox UI |
| `app/admin/layout.tsx` | Redirect global para CRM |

---

## 5. Fluxo de dados

```text
Login → /crm/dashboard
              │
              ▼
    GET /api/crm/inbox?assigneeId=
              │
    ┌─────────┼─────────┐
    ▼         ▼         ▼
followups  conversations  deals
    │         │         │
    └─────────┴─────────┘
              │
    filtros assignedTo + inactivity rules
```

---

## 6. Erros e edge cases

| Caso | Comportamento |
|------|----------------|
| API inbox falha | Skeleton + toast “Não foi possível carregar sua fila” |
| Vendedor acessa `/crm/settings/team` | Redirect `/crm/settings/profile` |
| Admin antigo bookmark `/admin/connections` | Redirect integrações |
| Sem itens nas 3 filas | Empty state celebratório + link pipeline |
| Gestor sem vendedores na equipe | Filtro mostra só “Todos” |

---

## 7. Testes (manual)

- [ ] Login vendedor → dashboard só com itens atribuídos
- [ ] Login gestor → filtro por atendente altera contagens e listas
- [ ] Login admin → acesso Equipe + Integrações; sem `/admin` na sidebar
- [ ] Follow-up vencido aparece com badge Atrasado
- [ ] Deal 48h+ sem resposta aparece em Deals parados
- [ ] Redirects `/admin/*` funcionam
- [ ] Tema claro: contraste legível na sidebar e cards
- [ ] Vendedor: Configurações mostra só Perfil

---

## 8. Fora de escopo (YAGNI)

- Toggle dark/light pelo usuário
- KPIs / gráficos de performance no dashboard
- Página Conexões mock ou marketplace de integrações
- Reestruturação do blog ou área produtor
- Paginação avançada na inbox (fase 2)

---

## 9. Ordem de implementação sugerida

1. RBAC + redirects + sidebar (sem quebrar rotas)
2. Settings layout + migração Equipe + redirects admin
3. API `/api/crm/inbox` + dashboard fila
4. Tema claro (tokens + sidebar + dashboard)
5. Remoção código legado `admin/cms` e páginas admin mortas

---

## Aprovações

| Seção | Status |
|-------|--------|
| 1. Navegação e IA | Aprovado |
| 2. Dashboard inbox | Aprovado |
| 3. Tema claro | Aprovado |
| Spec completa | Aprovado |
| Plano de implementação | `docs/superpowers/plans/2026-05-22-crm-dashboard-unified-settings.md` |
