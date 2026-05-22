import { redirect } from 'next/navigation'

export default function AdminTeamPage() {
    redirect('/crm/settings/team?tab=structure')
}
