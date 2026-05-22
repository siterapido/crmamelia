/**
 * Amélia Saúde — base de conhecimento para o agente SDR.
 * Fonte: landing /lp (HeroSection, PlanSection, FAQSection, SocialProofSection).
 * Atualizar aqui quando o copy público da LP mudar.
 */

export interface FaqItem {
    question: string
    answer: string
}

export const ameliaKnowledge = {
    brand: {
        name: 'Amélia Saúde',
        tagline: 'Sua saúde em nossos planos',
        positioning:
            'Administradora de benefícios de saúde com atendimento humano, transparência e agilidade — planos para você, sua família e sua empresa.',
    },
    benefits: [
        {
            title: 'Atendimento ágil',
            description: 'Processos sem burocracia, pelo celular ou computador.',
        },
        {
            title: 'Preços competitivos',
            description: 'Planos com bom custo-benefício no mercado.',
        },
        {
            title: 'Ampla cobertura',
            description: 'Principais operadoras e opções na sua região.',
        },
        {
            title: 'Plano coletivo por adesão',
            description: 'Condições especiais para profissionais ligados a entidades de classe.',
        },
        {
            title: 'Plano empresarial',
            description: 'Proteção para equipes com planos corporativos.',
        },
        {
            title: 'Parcerias com operadoras',
            description: 'Trabalhamos com Nova Saúde, Ônix e Hapvida Notre Dame.',
        },
    ],
    operators: ['Nova Saúde', 'Ônix', 'Hapvida Notre Dame'],
    priceAnchor:
        'No site, planos são apresentados a partir de R$ 82,00. O valor final depende do perfil, região e quantidade de vidas — o consultor confirma na proposta.',
    planTypes: [
        'Plano individual e familiar',
        'Plano empresarial (CNPJ)',
        'Plano coletivo por adesão',
    ],
    administratorRole:
        'A Amélia Saúde é administradora: cuida da gestão do plano, atendimento e suporte. As operadoras (Nova Saúde, Ônix, Hapvida Notre Dame) fornecem a rede credenciada de médicos e hospitais.',
    faq: [
        {
            question: 'Quando recebo minha carteirinha digital?',
            answer:
                'A partir da data de início da vigência do contrato, pelo Aplicativo Amélia Saúde.',
        },
        {
            question: 'Como realizo o pagamento das mensalidades?',
            answer:
                'Boleto digital por e-mail e SMS; também pelo site ou WhatsApp. Permite pagamento após vencimento com atualização automática.',
        },
        {
            question: 'Quando posso começar a usar o plano?',
            answer: 'Após a data de início da vigência expressa no contrato.',
        },
        {
            question: 'Como funcionam as carências?',
            answer:
                'Prazos conforme ANS, com possibilidade de redução promocional. Urgência e emergência não têm carência. Detalhes na proposta.',
        },
        {
            question: 'O que é Cobertura Parcial Temporária (CPT)?',
            answer:
                'Período de restrição para alguns procedimentos de alta complexidade ligados a doenças pré-existentes. Consultas e urgência/emergência não são afetados.',
        },
        {
            question: 'Como entrar em contato com o suporte?',
            answer:
                'Telefone 0800-000-5123 e WhatsApp (21) 97233-8589, segunda a sexta, 9h às 18h.',
        },
    ] as FaqItem[],
    socialProof: {
        years: '10+ anos de experiência',
        clients: '5.000+ clientes atendidos',
        support: 'Suporte disponível',
        satisfaction: 'Alta taxa de satisfação dos clientes',
        ans: 'Administradora registrada na ANS',
    },
    contacts: {
        phone0800: '0800-000-5123',
        whatsapp: '(21) 97233-8589',
        whatsappLink: 'https://wa.me/5521972338589',
        hours: 'Segunda a sexta, 9h às 18h',
        email: 'atendimento@ameliasaude.com.br',
    },
    boundaries: {
        canSay: [
            'Benefícios e tipos de plano listados acima',
            'Operadoras parceiras (Nova Saúde, Ônix, Hapvida Notre Dame)',
            'Papel administradora vs operadora',
            'FAQ e prova social desta base',
            'Referência "a partir de R$ 82" com ressalva de confirmação pelo consultor',
        ],
        cannotSay: [
            'Preço fechado ou personalizado sem consultor',
            'Rede credenciada específica por cidade sem confirmação',
            'Promoções ou descontos inventados',
            'Garantia de contratação ou prazo de carência personalizado',
        ],
    },
} as const

/** Texto compacto injetado no system prompt do SDR */
export function formatKnowledgeForPrompt(): string {
    const k = ameliaKnowledge
    const benefits = k.benefits.map((b) => `- ${b.title}: ${b.description}`).join('\n')
    const faq = k.faq.map((f) => `P: ${f.question}\nR: ${f.answer}`).join('\n\n')
    const can = k.boundaries.canSay.map((s) => `- ${s}`).join('\n')
    const cannot = k.boundaries.cannotSay.map((s) => `- ${s}`).join('\n')

    return `## CONHECIMENTO AMÉLIA SAÚDE (use apenas este conteúdo — não invente)

**Marca:** ${k.brand.name} — ${k.brand.tagline}
${k.brand.positioning}

**Benefícios:**
${benefits}

**Operadoras:** ${k.operators.join(', ')}

**Tipos de plano:** ${k.planTypes.join('; ')}

**Referência de preço:** ${k.priceAnchor}

**Administradora vs operadora:** ${k.administratorRole}

**Prova social:** ${k.socialProof.years}; ${k.socialProof.clients}; ${k.socialProof.ans}

**Contatos:** 0800 ${k.contacts.phone0800}; WhatsApp ${k.contacts.whatsapp} (${k.contacts.hours})

**FAQ:**
${faq}

**Pode dizer:**
${can}

**Não pode dizer:**
${cannot}`
}
