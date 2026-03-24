/**
 * Role-Based Access Control (RBAC)
 *
 * Roles:
 * - admin: Acesso total (Blog + CRM + Gestão de Usuários + Configurações)
 * - gestor: Blog + CRM (sem gestão de usuários, pode gerenciar equipe)
 * - produtor: Apenas Blog/Conteúdo
 * - vendedor: Apenas CRM (apenas dados atribuídos a ele)
 *
 * Permissões por função:
 *
 * ADMIN:
 * - Acesso completo a todos os dados (sem restrições)
 * - Pode gerenciar usuários
 * - Pode acessar configurações
 * - Pode atribuir conversas/leads/deals de outros
 * - Pode editar qualquer registro
 *
 * GESTOR:
 * - Acesso completo a todos os dados (sem restrições)
 * - Pode gerenciar equipe (atribuir leads)
 * - Pode acessar configurações
 * - Pode editar qualquer registro
 *
 * VENDEDOR:
 * - Apenas dados atribuídos a ele (conversas, leads, deals)
 * - Pode assumir conversas não atribuídas
 * - NÃO pode ver dados de outros vendedores
 * - NÃO pode acessar configurações
 * - NÃO pode gerenciar usuários
 */

export type UserRole = 'admin' | 'gestor' | 'produtor' | 'vendedor'

export const ROLE_LABELS: Record<UserRole, string> = {
    admin: 'Administrador',
    gestor: 'Gestor',
    produtor: 'Produtor de Conteúdo',
    vendedor: 'Vendedor',
}

export const ALL_ROLES: UserRole[] = ['admin', 'gestor', 'produtor', 'vendedor']

export type Permission =
    | 'crm:view_all'       // Ver todos os registros (independente de atribuição)
    | 'crm:view_own'       // Ver apenas registros atribuídos
    | 'crm:create'        // Criar leads/deals
    | 'crm:edit_all'       // Editar qualquer registro
    | 'crm:edit_own'       // Editar apenas registros atribuídos
    | 'crm:assign'         // Atribuir/desatribuir registros
    | 'crm:delete'         // Excluir registros
    | 'crm:bulk_edit'      // Edição em massa
    | 'users:manage'       // Gerenciar usuários
    | 'settings:manage'   // Acessar configurações
    | 'blog:manage'       // Gerenciar blog

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
    admin: [
        'crm:view_all', 'crm:create', 'crm:edit_all', 'crm:assign', 'crm:delete', 'crm:bulk_edit',
        'users:manage', 'settings:manage', 'blog:manage'
    ],
    gestor: [
        'crm:view_all', 'crm:create', 'crm:edit_all', 'crm:assign', 'crm:delete', 'crm:bulk_edit',
        'settings:manage', 'blog:manage'
    ],
    produtor: [
        'blog:manage'
    ],
    vendedor: [
        'crm:view_own', 'crm:create', 'crm:edit_own', 'crm:assign', 'crm:bulk_edit'
    ],
}

export function hasPermission(user: { role: string }, permission: Permission): boolean {
    const role = user.role as UserRole
    return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

export function canViewAllCRMData(user: { role: string }): boolean {
    return hasPermission(user, 'crm:view_all')
}

export function canAssignCRMData(user: { role: string }): boolean {
    return hasPermission(user, 'crm:assign')
}

export function canManageUsers(user: { role: string }): boolean {
    return hasPermission(user, 'users:manage')
}

// Which roles can access each area
const ACCESS_MAP = {
    blog: ['admin', 'gestor', 'produtor'] as UserRole[],
    crm: ['admin', 'gestor', 'vendedor'] as UserRole[],
    users: ['admin'] as UserRole[],
    settings: ['admin', 'gestor'] as UserRole[],
} as const

export type AccessArea = keyof typeof ACCESS_MAP

export function isAdmin(user: { role: string }): boolean {
    return user.role === 'admin'
}

export function isGestor(user: { role: string }): boolean {
    return user.role === 'gestor'
}

export function canManageAgents(user: { role: string }): boolean {
    return user.role === 'admin' || user.role === 'gestor'
}

export function requireRole(user: { role: string }, ...roles: string[]): boolean {
    return roles.includes(user.role)
}

export function canAccess(user: { role: string }, area: AccessArea): boolean {
    return ACCESS_MAP[area].includes(user.role as UserRole)
}

/**
 * Check access and return 403 response if denied.
 * Returns null if access is granted.
 */
export function denyAccess(user: { role: string }, area: AccessArea): Response | null {
    if (!canAccess(user, area)) {
        return Response.json({ error: 'Acesso negado' }, { status: 403 })
    }
    return null
}

export function getDefaultRedirect(role: string): string {
    switch (role) {
        case 'admin':
            return '/admin'
        case 'gestor':
        case 'vendedor':
            return '/crm'
        case 'produtor':
            return '/admin'
        default:
            return '/admin'
    }
}
