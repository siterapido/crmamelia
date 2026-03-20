/**
 * Seed Script - Initialize database with default data
 * Run with: npx tsx lib/db/seed.ts
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { hashPassword } from '../auth'
import * as schema from './schema'

async function seed() {
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL is not set')
    }

    const sql = neon(process.env.DATABASE_URL)
    const db = drizzle(sql, { schema })

    console.log('🌱 Seeding database...')

    // Create categories
    console.log('Creating categories...')
    const categoriesData = [
        { name: 'Saúde', slug: 'saude', color: '#10D86F' },
        { name: 'Planos', slug: 'planos', color: '#F5A623' },
        { name: 'Bem-estar', slug: 'bem-estar', color: '#6366F1' },
        { name: 'Institucional', slug: 'institucional', color: '#FFB800' },
        { name: 'Dicas', slug: 'dicas', color: '#EC4899' },
    ]

    for (const cat of categoriesData) {
        await db.insert(schema.categories).values(cat).onConflictDoNothing()
    }
    console.log('✅ Categories created')

    // Create default author
    console.log('Creating default author...')
    await db.insert(schema.authors).values({
        name: 'Equipe SIX Saúde',
        email: 'blog@sixsaude.com.br',
        role: 'Comunicação',
    }).onConflictDoNothing()
    console.log('✅ Default author created')

    // Create admin user
    console.log('Creating admin user...')
    const adminPassword = await hashPassword('admin123') // Change this!
    await db.insert(schema.users).values({
        email: 'admin@sixsaude.com.br',
        passwordHash: adminPassword,
        name: 'Administrador',
        role: 'admin',
    }).onConflictDoNothing()
    console.log('✅ Admin user created (email: admin@sixsaude.com.br, password: admin123)')

    // Create CRM pipeline stages
    console.log('Creating pipeline stages...')
    const stagesData = [
        { name: 'Novo', slug: 'new', color: '#6366F1', order: 0 },
        { name: 'Contactado', slug: 'contacted', color: '#3B82F6', order: 1 },
        { name: 'Qualificado', slug: 'qualified', color: '#F5A623', order: 2 },
        { name: 'Proposta', slug: 'proposal', color: '#F59E0B', order: 3 },
        { name: 'Negociação', slug: 'negotiation', color: '#EC4899', order: 4 },
        { name: 'Ganho', slug: 'won', color: '#10D86F', order: 5 },
        { name: 'Perdido', slug: 'lost', color: '#E63946', order: 6 },
    ]

    for (const stage of stagesData) {
        await db.insert(schema.pipelineStages).values(stage).onConflictDoNothing()
    }
    console.log('✅ Pipeline stages created')

    // Create agent user
    console.log('Creating agent user...')
    const agentPassword = await hashPassword('agent123')
    await db.insert(schema.users).values({
        email: 'atendente@sixsaude.com.br',
        passwordHash: agentPassword,
        name: 'Atendente SIX',
        role: 'agent',
    }).onConflictDoNothing()
    console.log('✅ Agent user created (email: atendente@sixsaude.com.br, password: agent123)')

    // Create quick replies
    console.log('Creating quick replies...')
    const quickRepliesData = [
        {
            title: 'Saudação',
            shortcut: '/oi',
            content: 'Olá! Tudo bem? Sou da equipe SIX Saúde. Como posso te ajudar hoje? 😊',
            category: 'saudacao',
        },
        {
            title: 'Aguardar',
            shortcut: '/aguarda',
            content: 'Um momento, por favor! Vou verificar as informações e te retorno em instantes. ⏳',
            category: 'geral',
        },
        {
            title: 'Encaminhamento',
            shortcut: '/especialista',
            content: 'Vou encaminhar você para um de nossos especialistas em planos de saúde para te atender melhor. Em breve entraremos em contato! 👥',
            category: 'handoff',
        },
        {
            title: 'Proposta',
            shortcut: '/proposta',
            content: 'Ótimo! Com base nas informações que coletei, vou preparar uma proposta personalizada para você. Aguarde nosso contato em breve! 📋',
            category: 'vendas',
        },
        {
            title: 'Obrigado',
            shortcut: '/obrigado',
            content: 'Obrigado pelo contato! Foi um prazer te atender. Qualquer dúvida, estamos à disposição. Tenha um ótimo dia! 🌟',
            category: 'encerramento',
        },
    ]

    for (const qr of quickRepliesData) {
        await db.insert(schema.quickReplies).values(qr).onConflictDoNothing()
    }
    console.log('✅ Quick replies created')

    console.log('')
    console.log('🎉 Database seeded successfully!')
    console.log('')
    console.log('⚠️  IMPORTANT: Change the admin password after first login!')
}

seed().catch(console.error)
