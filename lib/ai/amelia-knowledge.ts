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
            'Operadora de planos de saúde com atendimento humano, transparência e agilidade — planos para você, sua família e sua empresa.',
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
            description: 'Rede credenciada ampla com opções na sua região.',
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
            title: 'Rede credenciada',
            description: 'Hospitais, clínicas e laboratórios credenciados em todo o Brasil.',
        },
    ],
    priceAnchor:
        'No site, planos são apresentados a partir de R$ 82,00. O valor final depende do perfil, região e quantidade de vidas — o consultor confirma na proposta.',
    planTypes: [
        'Plano individual e familiar',
        'Plano empresarial (CNPJ)',
        'Plano coletivo por adesão',
    ],
    companyRole:
        'A Amélia Saúde é operadora de planos de saúde registrada na ANS: cria, gerencia e administra planos de assistência médica, organiza a rede credenciada e garante a cobertura dos procedimentos contratados, assumindo o risco financeiro das despesas de saúde em troca da mensalidade.',
    operadora: {
        definition:
            'Operadora de planos de saúde é a empresa responsável por criar, gerenciar e administrar planos de assistência médica ou odontológica. Organiza a rede de atendimento (hospitais, clínicas e laboratórios) e garante a cobertura dos procedimentos contratados.',
        financialRole:
            'Assume o risco financeiro de custear as despesas de saúde do beneficiário em troca do pagamento mensal (mensalidade).',
        regulation:
            'Toda operadora que atua no Brasil deve ser autorizada e fiscalizada pela Agência Nacional de Saúde Suplementar (ANS), que define regras de cobertura mínima e reajustes.',
        redeCredenciada:
            'Conjunto de hospitais, médicos e laboratórios parceiros da operadora aos quais o beneficiário tem acesso conforme o plano contratado.',
        vsAdministradora:
            'A administradora de benefícios funciona apenas como intermediária comercial para vender planos coletivos por adesão (sindicatos ou associações). A operadora é a dona do plano que realmente arca com os custos da saúde do beneficiário. A Amélia Saúde é operadora — não administradora.',
    },
    faq: [
        {
            question: 'O que é a Amélia Saúde como operadora?',
            answer:
                'Somos operadora de planos de saúde registrada na ANS: criamos e administramos os planos, organizamos a rede credenciada e garantimos a cobertura dos procedimentos contratados. Diferente de uma administradora de benefícios — que apenas intermedia planos coletivos por adesão —, somos a empresa responsável pelo plano e pelos custos da sua assistência.',
        },
        {
            question: 'Qual a diferença entre operadora e administradora de benefícios?',
            answer:
                'A operadora cria, gerencia e custeia o plano de saúde, com rede credenciada e cobertura dos procedimentos. A administradora de benefícios atua só como intermediária comercial na venda de planos coletivos por adesão. A Amélia Saúde é operadora.',
        },
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
        ans: 'Operadora registrada na ANS',
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
            'Conceito de operadora de planos de saúde e diferença em relação à administradora de benefícios',
            'Papel da Amélia como operadora de planos de saúde',
            'Rede credenciada e tipos de plano',
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

**Tipos de plano:** ${k.planTypes.join('; ')}

**Referência de preço:** ${k.priceAnchor}

**Papel da Amélia:** ${k.companyRole}

**O que é uma operadora:** ${k.operadora.definition} ${k.operadora.financialRole}

**Regulação ANS:** ${k.operadora.regulation}

**Rede credenciada:** ${k.operadora.redeCredenciada}

**Operadora vs administradora:** ${k.operadora.vsAdministradora}

**Prova social:** ${k.socialProof.years}; ${k.socialProof.clients}; ${k.socialProof.ans}

**Contatos:** 0800 ${k.contacts.phone0800}; WhatsApp ${k.contacts.whatsapp} (${k.contacts.hours})

**FAQ:**
${faq}

**Pode dizer:**
${can}

**Não pode dizer:**
${cannot}`
}
