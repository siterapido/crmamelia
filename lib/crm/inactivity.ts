export const INACTIVITY_THRESHOLDS = {
    alert: 4,
    critical: 24,
    dormant: 48,
} as const

export const INACTIVITY_LABELS: Record<Exclude<InactivityLevel, null>, string> = {
    alert: 'Aguardando',
    critical: 'Sem resposta',
    dormant: 'Dormente',
}

export type InactivityLevel = 'alert' | 'critical' | 'dormant' | null

export function hoursSince(date: string | Date | null): number | null {
    if (!date) return null
    return (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60)
}

export function getInactivityLevel(hours: number | null): InactivityLevel {
    if (hours === null) return null
    if (hours >= INACTIVITY_THRESHOLDS.dormant) return 'dormant'
    if (hours >= INACTIVITY_THRESHOLDS.critical) return 'critical'
    if (hours >= INACTIVITY_THRESHOLDS.alert) return 'alert'
    return null
}

export function formatInactivityDuration(hours: number): string {
    if (hours < 1) return `${Math.round(hours * 60)}min`
    if (hours < 24) return `${Math.round(hours)}h`
    return `${Math.floor(hours / 24)}d`
}
