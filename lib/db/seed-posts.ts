/**
 * Seed Script - Create 10 Example Blog Posts
 * Run with: npx tsx lib/db/seed-posts.ts
 */

import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'
import { eq } from 'drizzle-orm'

// Helper to create slug
function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .normalize('NFD') // decomposed for accent removal
        .replace(/[\u0300-\u036f]/g, '') // remove accents
        .replace(/\s+/g, '-') // replace spaces with -
        .replace(/[^\w\-]+/g, '') // remove all non-word chars
        .replace(/\-\-+/g, '-') // replace multiple - with single -
        .replace(/^-+/, '') // trim - from start
        .replace(/-+$/, '') // trim - from end
}

// Blog Posts Data
const postsData = [
    {
        title: '5 Benefícios de Ter um Plano de Saúde Familiar',
        categoryName: 'Planos',
        coverImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        excerpt: 'Descubra por que investir em um plano de saúde familiar é a melhor decisão para proteger quem você ama e garantir tranquilidade para o futuro.',
        content: `
            <p>Proteger a família é a prioridade de qualquer pessoa. E quando falamos de saúde, essa proteção se torna ainda mais essencial. Ter um plano de saúde familiar não é apenas um luxo, mas um investimento na segurança e bem-estar de todos.</p>
            
            <h2>1. Economia Financeira</h2>
            <p>Contratar um plano familiar costuma ser muito mais vantajoso financeiramente do que planos individuais. As operadoras oferecem descontos progressivos dependendo do número de dependentes, o que reduz significativamente o custo per capita.</p>
            
            <h2>2. Acesso a Medicina Preventiva</h2>
            <p>Com um plano de saúde, sua família tem acesso facilitado a check-ups e exames de rotina. A prevenção é sempre o melhor remédio, e detectar problemas precocemente pode salvar vidas e evitar tratamentos complexos e caros no futuro.</p>
            
            <h2>3. Atendimento em Emergências</h2>
            <p>Imprevistos acontecem. Ter a segurança de saber para onde correr em caso de uma emergência médica, sem depender das longas filas do sistema público, não tem preço. O atendimento rápido pode ser crucial em situações delicadas.</p>
            
            <h2>4. Ampla Rede Credenciada</h2>
            <p>Planos de saúde familiares, como os oferecidos pela Amélia Saúde, contam com uma vasta rede de hospitais, clínicas e laboratórios de excelência. Isso garante que você terá o especialista certo perto de você quando precisar.</p>
            
            <h2>5. Tranquilidade e Segurança</h2>
            <p>Saber que sua família está amparada traz uma paz de espírito inestimável. Você não precisa se preocupar com custos surpresa em caso de internações ou cirurgias, pois o plano oferece a cobertura necessária.</p>
            
            <p>Investir na saúde da sua família é um ato de amor. Fale com um consultor da Amélia Saúde e encontre o plano perfeito para o seu lar.</p>
        `
    },
    {
        title: 'Como Escolher o Melhor Plano Odontológico para Você',
        categoryName: 'Planos',
        coverImage: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        excerpt: 'Entenda o que avaliar na hora de contratar um plano odontológico e garanta o sorriso perfeito sem estourar o orçamento.',
        content: `
            <p>Um sorriso saudável abre portas e eleva a autoestima. Mas com tantas opções no mercado, como saber qual o melhor plano odontológico para suas necessidades? Separamos algumas dicas essenciais.</p>

            <h2>Avalie a Rede Credenciada</h2>
            <p>Verifique se o plano possui dentistas e clínicas próximas à sua casa ou trabalho. A facilidade de acesso é fundamental para manter a rotina de consultas.</p>

            <h2>Cobertura de Procedimentos</h2>
            <p>Analise o Rol de Procedimentos da ANS que o plano cobre. Planos básicos geralmente cobrem limpezas, restaurações e extrações. Se você precisa de ortodontia (aparelho) ou próteses, precisará de um plano mais completo.</p>

            <h2>Carência</h2>
            <p>Fique atento aos períodos de carência. Alguns planos liberam procedimentos simples em 24 horas, mas tratamentos mais complexos podem exigir alguns meses de espera.</p>

            <h2>Custo-Benefício</h2>
            <p>Compare o valor mensal do plano com o custo de consultas particulares. Geralmente, se você vai ao dentista mais de duas vezes ao ano ou precisa de tratamentos, o plano já se paga.</p>

            <p>Na Amélia Saúde, oferecemos opções flexíveis que se adaptam ao seu perfil. Não deixe sua saúde bucal para depois!</p>
        `
    },
    {
        title: 'A Importância do Check-up Anual para a Sua Saúde',
        categoryName: 'Saúde',
        coverImage: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        excerpt: 'Prevenir é melhor do que remediar. Saiba quais exames não podem faltar na sua rotina anual e mantenha sua saúde em dia.',
        content: `
            <p>Muitas pessoas só procuram um médico quando sentem algum sintoma. No entanto, o check-up anual é uma ferramenta poderosa para manter a saúde em dia e diagnosticar doenças silenciosas.</p>

            <h2>O que é um Check-up?</h2>
            <p>É uma bateria de exames clínicos, laboratoriais e de imagem realizados periodicamente para avaliar o estado geral de saúde do paciente.</p>

            <h2>Exames Comuns</h2>
            <ul>
                <li>Hemograma completo</li>
                <li>Glicemia e Colesterol</li>
                <li>Eletrocardiograma (para o coração)</li>
                <li>Exames de urina e fezes</li>
            </ul>

            <p>Para mulheres, o Papanicolau e a Mamografia são essenciais dependendo da idade. Para homens, o exame de próstata é indispensável a partir dos 45/50 anos.</p>

            <h2>Benefícios da Detecção Precoce</h2>
            <p>Doenças como diabetes, hipertensão e alguns tipos de câncer podem não apresentar sintomas iniciais. Detectá-las cedo aumenta drasticamente as chances de controle e cura.</p>

            <p>Agende seu check-up hoje mesmo. Seu corpo agradece!</p>
        `
    },
    {
        title: 'Telemedicina: A Revolução no Atendimento Médico',
        categoryName: 'Saúde', // Usando Saúde pois Inovação não estava no seed original, mas vou tentar criar se não existir
        coverImage: 'https://images.unsplash.com/photo-1576091160550-217358c7db81?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        excerpt: 'Saiba como a telemedicina está transformando o acesso à saúde, trazendo médicos especialistas para a palma da sua mão.',
        content: `
            <p>A tecnologia mudou a forma como vivemos, e a saúde não ficou para trás. A telemedicina chegou para democratizar o acesso a especialistas e agilizar atendimentos.</p>

            <h2>O que é Telemedicina?</h2>
            <p>É o exercício da medicina através de tecnologias de comunicação. Consultas são realizadas por vídeo chamada, com a mesma segurança e sigilo de um consultório presencial.</p>

            <h2>Vantagens Principais</h2>
            <ul>
                <li><strong>Comodidade:</strong> Consulte-se sem sair de casa.</li>
                <li><strong>Rapidez:</strong> Evite filas e deslocamentos desnecessários.</li>
                <li><strong>Acesso:</strong> Fale com especialistas de grandes centros mesmo morando no interior.</li>
            </ul>

            <h2>Quando Usar?</h2>
            <p>É ideal para triagem de sintomas leves (resfriados, alergias), acompanhamento de doenças crônicas, análise de exames e renovação de receitas.</p>

            <p>A Amélia Saúde integra tecnologia de ponta para oferecer telemedicina de qualidade aos seus beneficiários.</p>
        `
    },
    {
        title: 'Saúde Mental no Trabalho: Dicas para o Bem-estar',
        categoryName: 'Bem-estar',
        coverImage: 'https://images.unsplash.com/photo-1493836512294-502baa1986e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        excerpt: 'O equilíbrio emocional é fundamental para a produtividade e felicidade. Confira dicas para manter a saúde mental no ambiente corporativo.',
        content: `
            <p>O ambiente de trabalho pode ser fonte de realização, mas também de muito estresse. Cuidar da saúde mental é tão importante quanto bater metas.</p>

            <h2>Sinais de Alerta</h2>
            <p>Fique atento a sintomas como irritabilidade constante, insônia, falta de concentração e desânimo. Podem ser sinais de Burnout.</p>

            <h2>Dicas Práticas</h2>
            <ol>
                <li><strong>Faça Pausas:</strong> Levante-se, estique o corpo e desconecte-se por alguns minutos.</li>
                <li><strong>Defina Limites:</strong> Evite levar trabalho para casa ou responder e-mails fora do horário.</li>
                <li><strong>Organize-se:</strong> O planejamento reduz a ansiedade e a sensação de urgência constante.</li>
            </ol>

            <p>Empresas parceiras da Amélia Saúde contam com programas de apoio ao colaborador. Se precisar, peça ajuda.</p>
        `
    },
    {
        title: 'Guia Completo de Prevenção: Cuide do Seu Sorriso',
        categoryName: 'Dicas',
        coverImage: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        excerpt: 'Escovação correta, fio dental e alimentação. Aprenda o básico que faz toda a diferença para a sua saúde bucal.',
        content: `
            <p>Um sorriso bonito começa com bons hábitos diários. A prevenção é a chave para evitar cáries, gengivite e outros problemas incômodos.</p>

            <h2>A Técnica de Escovação</h2>
            <p>Não use força, use jeito. Faça movimentos circulares suaves, atingindo dentes e gengiva. Não esqueça de escovar a língua para combater o mau hálito.</p>

            <h2>O Poder do Fio Dental</h2>
            <p>A escova não alcança todos os lugares. O fio dental deve ser usado pelo menos uma vez ao dia, preferencialmente antes de dormir, para remover a placa bacteriana entre os dentes.</p>

            <h2>Alimentação Amiga dos Dentes</h2>
            <p>Evite o consumo excessivo de açúcares, que alimentam as bactérias causadoras da cárie. Alimentos fibrosos como maçã ajudam na limpeza natural.</p>

            <p>E claro, visite seu dentista a cada 6 meses. Prevenir é sempre mais barato e indolor!</p>
        `
    },
    {
        title: 'Nutrição e Imunidade: O Poder dos Alimentos',
        categoryName: 'Bem-estar',
        coverImage: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        excerpt: 'Descubra quais alimentos ajudam a fortalecer seu sistema imunológico e manter seu corpo protegido contra doenças.',
        content: `
            <p>Você é o que você come. Essa frase nunca foi tão verdadeira quando falamos de imunidade. Uma alimentação equilibrada é a primeira linha de defesa do corpo.</p>

            <h2>Nutrientes Essenciais</h2>
            <ul>
                <li><strong>Vitamina C:</strong> Laranja, limão, acerola. Ajuda na produção de glóbulos brancos.</li>
                <li><strong>Zinco:</strong> Carne, feijão, castanhas. Fundamental para a defesa celular.</li>
                <li><strong>Ômega-3:</strong> Peixes, linhaça. Possui ação anti-inflamatória.</li>
            </ul>

            <h2>O Perigo dos Ultraprocessados</h2>
            <p>Alimentos ricos em açúcar, sódio e conservantes inflamam o corpo e prejudicam a resposta imune. Prefira sempre comida de verdade.</p>

            <h2>Hidratação</h2>
            <p>Água é vital. Ela transporta nutrientes e elimina toxinas. Beba pelo menos 2 litros por dia.</p>

            <p>Lembre-se: nenhum alimento é milagroso isoladamente. O segredo é a constância de bons hábitos.</p>
        `
    },
    {
        title: 'Atividade Física em Casa: Por Onde Começar?',
        categoryName: 'Bem-estar',
        coverImage: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        excerpt: 'Sem tempo para academia? Veja como criar uma rotina de exercícios em casa e saia do sedentarismo hoje mesmo.',
        content: `
            <p>A falta de tempo não é mais desculpa. Treinar em casa é prático, econômico e eficiente. O importante é colocar o corpo em movimento.</p>

            <h2>Comece Simples</h2>
            <p>Não tente fazer o treino de um atleta olímpico no primeiro dia. Comece com 15 a 20 minutos.</p>

            <h2>Exercícios Funcionais</h2>
            <p>Use o peso do próprio corpo.</p>
            <ul>
                <li>Agachamentos (simulam sentar e levantar)</li>
                <li>Flexões de braço (podem ser feitas com os joelhos no chão)</li>
                <li>Polichinelos (para aquecer e elevar a frequência cardíaca)</li>
                <li>Abdominais</li>
            </ul>

            <h2>Consistência > Intensidade</h2>
            <p>É melhor treinar 20 minutos todos os dias do que 2 horas uma vez por semana. Crie o hábito.</p>

            <p>Atenção: consulte um médico antes de iniciar qualquer atividade física.</p>
        `
    },
    {
        title: 'Entenda as Carências do Seu Plano de Saúde',
        categoryName: 'Planos',
        coverImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        excerpt: 'O que é carência? Quanto tempo preciso esperar? Tire suas dúvidas sobre os prazos legais e contratuais.',
        content: `
            <p>Carência é o tempo que você deve esperar para poder usar determinados serviços do plano após a contratação. É uma dúvida comum e muito importante.</p>

            <h2>Prazos Máximos da ANS</h2>
            <p>A Agência Nacional de Saúde Suplementar define limites que as operadoras devem respeitar:</p>
            <ul>
                <li><strong>Urgência e Emergência:</strong> 24 horas</li>
                <li><strong>Consultas e Exames Simples:</strong> 30 dias (padrão de mercado, mas lei permite até 180)</li>
                <li><strong>Cirurgias e Internações:</strong> 180 dias</li>
                <li><strong>Parto:</strong> 300 dias</li>
                <li><strong>Doenças Preexistentes:</strong> 24 meses (para procedimentos de alta complexidade ligados à doença)</li>
            </ul>

            <h2>Portabilidade</h2>
            <p>Se você já tem um plano há algum tempo, pode trocar de operadora sem cumprir novas carências (portabilidade), seguindo algumas regras.</p>

            <p>A Amélia Saúde preza pela transparência. Consulte seu contrato e tire dúvidas com nossa equipe.</p>
        `
    },
    {
        title: 'Por Que Escolher a Amélia Saúde? Conheça Nossos Diferenciais',
        categoryName: 'Institucional',
        coverImage: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        excerpt: 'Mais que um plano, somos parceiros da sua saúde. Conheça a tecnologia, o atendimento e a rede que fazem da Amélia a melhor escolha.',
        content: `
            <p>No mercado de saúde, confiança é tudo. A Amélia Saúde nasceu para oferecer uma experiência diferente, humanizada e eficiente.</p>

            <h2>1. Atendimento Humanizado</h2>
            <p>Aqui você não é um número. Nosso time de concierges de saúde está pronto para ouvir e resolver, sem robôs infinitos.</p>

            <h2>2. Tecnologia Integrada</h2>
            <p>Nosso aplicativo coloca o controle na sua mão. Agende consultas, acesse a carteirinha digital e fale com médicos via telemedicina com poucos cliques.</p>

            <h2>3. Melhor Custo-Benefício</h2>
            <p>Trabalhamos incansavelmente para oferecer a melhor rede credenciada por um valor justo. Saúde de qualidade deve ser acessível.</p>

            <h2>4. Gestão de Saúde</h2>
            <p>Não focamos apenas na doença, mas na saúde. Nossos programas de prevenção ajudam você a viver mais e melhor.</p>

            <p>Venha ser Amélia. Sua saúde merece esse cuidado.</p>
        `
    }
]

async function seedPosts() {
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL is not set')
    }

    const sql = neon(process.env.DATABASE_URL)
    const db = drizzle(sql, { schema })

    console.log('📝 Seeding posts...')

    // 1. Get Default Author
    const author = await db.query.authors.findFirst({
        where: eq(schema.authors.email, 'blog@ameliasaude.com.br')
    })

    if (!author) {
        console.error('❌ Author not found. Please run the main seed script first: npx tsx lib/db/seed.ts')
        return
    }

    // 2. Get Categories Map
    const categoriesList = await db.select().from(schema.categories)
    const categoryMap = new Map(categoriesList.map(c => [c.name, c.id]))

    // 3. Insert Posts
    for (const post of postsData) {
        // Find category ID
        let categoryId = categoryMap.get(post.categoryName)

        // Generate slug
        const slug = slugify(post.title)

        if (!categoryId) {
            console.log(`⚠️  Category '${post.categoryName}' not found for post '${post.title}'. Skipping or defaulting...`)
            // Optional: Create category or skip. Assuming standard categories exist from seed.ts
            // Let's try to find a fallback 'Outros' or just skip to be safe, or use the first available category.
            const fallback = categoriesList[0]
            if (fallback) {
                console.log(`   Using fallback category: ${fallback.name}`)
                categoryId = fallback.id
            } else {
                console.error('   No categories available. Skipping.')
                continue
            }
        }

        console.log(`Inserting: ${post.title}...`)

        try {
            await db.insert(schema.posts).values({
                title: post.title,
                slug: slug,
                excerpt: post.excerpt,
                content: post.content,
                coverImage: post.coverImage,
                categoryId: categoryId,
                authorId: author.id,
                status: 'published',
                publishedAt: new Date(),
                readingTime: 5,
                featured: false,
                aiGenerated: true
            }).onConflictDoNothing()
        } catch (error) {
            console.error(`   Error inserting ${post.title}:`, error)
        }
    }

    console.log('✅ Posts seeded successfully!')
}

seedPosts().catch(console.error)
