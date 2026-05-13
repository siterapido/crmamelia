# Design: Reorganização de Fluxo e Remoção do CMS

**Data:** 2026-05-11
**Status:** Aprovado

## Problema

O sistema atual tem problemas de UX e organização:
- Login redireciona roles diferentes para áreas diferentes
- Admin é acessado automaticamente por alguns roles
- CMS está presente mas não é necessário
- Funções não estão agrupadas de forma clara

## Solução

### 1. Redirecionamento pós-login → `/crm/pipeline`

**Arquivo:** `lib/auth/rbac.ts`

`getDefaultRedirect()` retorna `/crm/pipeline` para todos os roles (admin, gestor, vendedor, produtor).

**Arquivo:** `app/api/auth/login/route.ts`

A resposta do login inclui o redirect URL baseado em `getDefaultRedirect()`.

**Arquivo:** `lib/auth/context.tsx`

O `login()` no client-side não precisa mudar — o redirect será feito pelo componente que chama o login.

### 2. Admin acessível apenas via botão

**Arquivo:** `components/crm/CrmSidebar.tsx`

- Botão "Voltar ao Admin" (já existe para admin) renomeado para "Admin"
- Mantém visibilidade restrita a `isAdmin(user)`

**Arquivo:** `app/admin/layout.tsx`

- Usuários não-admin que acessarem `/admin` diretamente → redirecionados para `/crm/pipeline`
- Remover lógica de login page (pathname `/login` não existe como página dedicada)

**Arquivo:** `components/admin/Sidebar.tsx`

- Adicionar botão "Voltar ao CRM" → `/crm/pipeline`
- Remover todas as referências ao CMS

### 3. Agrupamento correto das funções

**CRM Sidebar** (`components/crm/CrmSidebar.tsx`):
- Seção "Vendas": Pipeline, Dashboard, Conversas, Contatos
- Seção "Admin" (só admin): botão para `/admin`

**Admin Sidebar** (`components/admin/Sidebar.tsx`):
- Seção "Sistema": Dashboard Admin, Usuários, Conexões, Equipe
- Botão "Voltar ao CRM" → `/crm/pipeline`
- Remover seções CMS e CRM duplicado (CRM fica só em `/crm`)

### 4. Desabilitar CMS

**Remover:**
- `app/admin/cms/` — diretório inteiro
- `app/admin/cms/posts/` — gestão de posts
- `app/admin/cms/ai-generator/` — gerador IA

**Limpar referências em:**
- `app/admin/page.tsx` — remover card CMS
- `components/admin/Sidebar.tsx` — remover `cmsItems` e seção CMS
- `app/admin/layout.tsx` — remover lógica `isCMSArea` e `canAccessCMS`

**Manter:**
- Blog público (`/blog`, `/noticias`) — continua funcionando
- Permissão `blog:manage` no RBAC — mantida sem UI (pode ser útil no futuro)

## Arquitetura de Acesso

```
Login → /crm/pipeline (todos os roles)
                    │
                    ├── Vendedor: vê Vendas (Pipeline, Dashboard, Conversas, Contatos)
                    ├── Gestor: vê Vendas + Configurações
                    └── Admin: vê Vendas + Configurações + botão "Admin"
                                        │
                                        └── /admin → Sistema (Usuários, Conexões, Equipe)
                                                     + botão "Voltar ao CRM"
```

## Arquivos Modificados

| Arquivo | Mudança |
|---------|---------|
| `lib/auth/rbac.ts` | `getDefaultRedirect` → sempre `/crm/pipeline` |
| `app/api/auth/login/route.ts` | Incluir redirect na resposta |
| `lib/auth/context.tsx` | Sem mudança (redirect feito pelo caller) |
| `components/crm/CrmSidebar.tsx` | Renomear botão, ajustar seções |
| `components/admin/Sidebar.tsx` | Remover CMS, adicionar "Voltar ao CRM" |
| `app/admin/layout.tsx` | Redirecionar não-admin para `/crm/pipeline` |
| `app/admin/page.tsx` | Remover card CMS |
| `app/crm/layout.tsx` | Sem mudança significativa |

## Arquivos Removidos

| Arquivo | Motivo |
|---------|--------|
| `app/admin/cms/` | CMS desabilitado |
| `app/admin/cms/posts/` | Gestão de posts removida |
| `app/admin/cms/ai-generator/` | Gerador IA removido |
