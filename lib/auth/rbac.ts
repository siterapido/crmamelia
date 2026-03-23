/**
 * Role-Based Access Control (RBAC)
 *
 * Roles:
 * - admin: Acesso total (Blog + CRM + Gestão de Usuários)
 * - gestor: Blog + CRM (sem gestão de usuários)
 * - produtor: Apenas Blog/Conteúdo
 * - vendedor: Apenas CRM
 */

export type UserRole = 'admin' | 'gestor' | 'produtor' | 'vendedor'

export const ROLE_LABELS: Record<UserRole, string> = {
    admin: 'Administrador',
    gestor: 'Gestor',
    produtor: 'Produtor de Conteúdo',
    vendedor: 'Vendedor',
}

export const ALL_ROLES: UserRole[] = ['admin', 'gestor', 'produtor', 'vendedor']

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
        case 'gestor':
        case 'produtor':
            return '/admin'
        case 'vendedor':
            return '/crm'
        default:
            return '/admin'
    }
}
