export function isAdmin(user: { role: string }): boolean {
    return user.role === 'admin'
}

export function requireRole(user: { role: string }, ...roles: string[]): boolean {
    return roles.includes(user.role)
}
