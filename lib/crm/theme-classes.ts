/** Shared Tailwind classes for CRM light theme */
export const crm = {
    page: 'text-[var(--crm-text)]',
    card: 'bg-white rounded-2xl border border-[var(--crm-border)] shadow-sm',
    cardHeader: 'border-b border-[var(--crm-border)]',
    muted: 'text-[var(--crm-text-muted)]',
    input:
        'bg-[var(--crm-surface-2)] border border-[var(--crm-border)] text-[var(--crm-text)] placeholder:text-[var(--crm-text-muted)]/50 focus:outline-none focus:border-[var(--crm-accent)]',
    rowHover: 'hover:bg-[var(--crm-surface-2)]',
    divider: 'border-[var(--crm-border)]',
    surface: 'bg-[var(--crm-surface-2)]',
} as const
