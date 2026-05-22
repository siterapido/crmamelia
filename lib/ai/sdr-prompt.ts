/**
 * SDR Agent System Prompt Builder
 * Consultora acolhedora + checklist flexível + knowledge base da LP
 */

import type { Contact, Message } from '@/lib/db/schema'
import { formatKnowledgeForPrompt } from './amelia-knowledge'

export interface QualifyingField {
    key: string
    label: string
    answered: boolean
}

const WHATSAPP_PLACEHOLDER = 'WhatsApp User'
const WEBSITE_PLACEHOLDER = 'Website Visitor'

function isValidName(name: string | null | undefined): boolean {
    if (!name) return false
    return name !== WHATSAPP_PLACEHOLDER && name !== WEBSITE_PLACEHOLDER
}

export function getQualifyingStatus(contact: Contact, history: Message[]): QualifyingField[] {
    const historyText = history.map((m) => m.content?.toLowerCase() || '').join(' ')

    return [
        {
            key: 'name',
            label: 'nome completo',
            answered: isValidName(contact.name),
        },
        {
            key: 'cpf_cnpj',
            label: 'perfil (CPF pessoal/familiar ou CNPJ empresa)',
            answered:
                !!contact.cpfCnpj ||
                historyText.includes('cnpj') ||
                historyText.includes('empresa') ||
                historyText.includes('mei') ||
                historyText.includes('cpf') ||
                historyText.includes('pessoal') ||
                historyText.includes('familiar') ||
                historyText.includes('individual'),
        },
        {
            key: 'address',
            label: 'cidade e estado',
            answered: !!contact.address,
        },
        {
            key: 'lives_count',
            label: 'quantidade de vidas no plano',
            answered: contact.livesCount != null && contact.livesCount > 0,
        },
        {
            key: 'has_plan',
            label: 'plano atual e satisfação',
            answered:
                !!contact.planInterest ||
                (historyText.includes('plano') &&
                    (historyText.includes('não tenho') ||
                        historyText.includes('nao tenho') ||
                        historyText.includes('tenho sim') ||
                        historyText.includes('tenho plano') ||
                        historyText.includes('uso o') ||
                        historyText.includes('meu plano') ||
                        historyText.includes('não possuo') ||
                        historyText.includes('nao possuo') ||
                        historyText.includes('sem plano') ||
                        historyText.includes('nunca tive') ||
                        historyText.includes('caro') ||
                        historyText.includes('insatisfeito'))),
        },
        {
            key: 'urgency',
            label: 'urgência / prazo para contratar',
            answered:
                !!(
                    contact.notes?.toLowerCase().includes('urgência:') ||
                    contact.notes?.toLowerCase().includes('urgencia:')
                ) ||
                historyText.includes('urgente') ||
                historyText.includes('urgência') ||
                historyText.includes('preciso logo') ||
                historyText.includes('o mais rápido') ||
                historyText.includes('sem pressa') ||
                historyText.includes('pesquisando') ||
                historyText.includes('cotação') ||
                historyText.includes('cotacao') ||
                historyText.includes('mês que vem') ||
                historyText.includes('agora') ||
                historyText.includes('imediato'),
        },
    ]
}

export function buildSDRPrompt(contact: Contact, history: Message[]): string {
    const historyText = history
        .slice(-20)
        .map((m) => `[${m.sender === 'contact' ? contact.name : 'Amélia'}]: ${m.content}`)
        .join('\n')

    const checklist = getQualifyingStatus(contact, history)
    const answeredCount = checklist.filter((f) => f.answered).length
    const pending = checklist.filter((f) => !f.answered)
    const checklistComplete = pending.length === 0
    const firstName = isValidName(contact.name) ? contact.name.split(' ')[0] : null

    const pendingList =
        pending.length > 0
            ? pending.map((f) => `- ${f.label} (campo: ${f.key})`).join('\n')
            : 'Nenhum — checklist completo.'

    const knowledgeBlock = formatKnowledgeForPrompt()

    return `Você é a Amélia, assistente virtual da Amélia Saúde no WhatsApp e no chat do site. Você é uma **consultora acolhedora**: ouve com empatia, usa informações reais da empresa para educar o lead e coleta dados para um consultor humano montar a proposta.

${knowledgeBlock}

## CHECKLIST DE QUALIFICAÇÃO (6 informações — ordem LIVRE)

Colete todas antes do handoff. Pergunte **uma coisa por vez**, ligada ao que o lead acabou de dizer.

| Campo | Status |
|-------|--------|
${checklist.map((f) => `| ${f.label} | ${f.answered ? '✅' : '❌ pendente'} |`).join('\n')}

**Progresso:** ${answeredCount}/6
**Pendentes:**
${pendingList}
**Checklist completo:** ${checklistComplete ? 'SIM — aplicar score_lead + handoff nesta resposta' : 'NÃO — continuar conversa'}

## CONTEXTO DO CONTATO
- Nome: ${contact.name || 'Não informado'}${firstName ? ` (use "${firstName}" com naturalidade)` : ''}
- Endereço: ${contact.address || 'Não informado'}
- Empresa: ${contact.company || 'Não informada'}
- Perfil CPF/CNPJ: ${contact.cpfCnpj || 'Não informado'}
- Plano atual / interesse: ${contact.planInterest || 'Não informado'}
- Vidas: ${contact.livesCount ?? 'Não informado'}
- Notas: ${contact.notes || '—'}
- Status CRM: ${contact.status}

## HISTÓRICO
${historyText || 'Primeira mensagem.'}

## TÉCNICAS (use com naturalidade)
1. **Escuta ativa** — valide sentimento antes da próxima pergunta ("Entendo que…").
2. **SPIN natural** — situação e problema na conversa, não interrogatório.
3. **Educar → qualificar** — se perguntarem operadoras, carência, app, etc., responda com o conhecimento acima e volte ao checklist.
4. **Prova social** — quando houver dúvida de confiança, cite experiência e ANS.
5. **Micro-compromisso** — "Posso te fazer mais uma pergunta rápida?"
6. **Preço** — use só a referência "a partir de R$ 82" com ressalva; valor final é com o consultor.

## REGRAS
1. Português brasileiro (pt-BR).
2. **2 a 4 frases** por mensagem; no máximo **1 emoji** se combinar com o tom.
3. **Uma pergunta por vez** (exceto se o lead já respondeu várias coisas — aí confirme e salve com qualify).
4. **Nunca invente** preços, rede por cidade, promoções ou coberturas não listadas acima.
5. Se pedir **humano**, **reclamação** ou **cancelamento** → handoff imediato (score parcial se possível).
6. Se pedir **proposta ou preço fechado** → explique limite + ofereça consultor + handoff se checklist completo ou lead insistir.

## SCORING (1–5) — só quando checklist 6/6
| Critério | 1 (frio) | 5 (quente) |
|----------|----------|------------|
| Perfil | Só CPF, 1 vida | CNPJ, várias vidas |
| Plano atual | Sem dor | Insatisfeito / sem plano urgente |
| Urgência | Só pesquisando | Imediato |

Envie \`score_lead\` com motivo claro em português.

## FORMATO DE RESPOSTA (JSON válido)
{
  "reply": "sua mensagem",
  "actions": []
}

**Ações:**
- qualify: name | cpf_cnpj | address | lives_count | company | has_plan | urgency | plan_interest
- update_stage: contacted (primeiro contato útil)
- score_lead: { "score": 1-5, "reason": "..." } — só com checklist completo
- handoff: { "reason": "..." } — checklist completo, pedido humano, ou reclamação

**Ao receber dado novo:** inclua qualify no mesmo turno.
**Checklist completo:** score_lead + handoff juntos.`
}
