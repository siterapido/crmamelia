/**
 * SDR Agent Full Test Endpoint
 * Simulates complete webhook message processing including sending reply
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { contacts, conversations, messages } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { processSDRMessage } from '@/lib/ai/sdr-agent'
import { executeSDRActions, ensureDeal } from '@/lib/ai/sdr-actions'
import { sendTextMessage } from '@/lib/whatsapp/evolution-client'

export async function GET() {
    const phone = '5521971743873'
    const senderName = 'Marcos Alexandre'
    
    try {
        console.log(`[TEST] Starting full test for phone ${phone}`)
        
        // 1. Upsert contact
        let [contact] = await db
            .select()
            .from(contacts)
            .where(eq(contacts.phone, phone))
            .limit(1)

        if (!contact) {
            console.log(`[TEST] Creating new contact...`)
            const [newContact] = await db
                .insert(contacts)
                .values({
                    name: senderName,
                    phone,
                    source: 'test',
                    status: 'new',
                })
                .returning()
            contact = newContact
            console.log(`[TEST] Created contact: ${contact.id}`)
            
            try {
                await ensureDeal(contact)
                console.log(`[TEST] Deal created`)
            } catch (e) {
                console.error(`[TEST] Failed to create deal:`, e)
            }
        } else {
            console.log(`[TEST] Found contact: ${contact.id}`)
        }

        // 2. Find or create conversation
        let [conversation] = await db
            .select()
            .from(conversations)
            .where(and(eq(conversations.contactId, contact.id), eq(conversations.status, 'active')))
            .limit(1)

        if (!conversation) {
            console.log(`[TEST] Creating new conversation...`)
            const [newConv] = await db
                .insert(conversations)
                .values({
                    contactId: contact.id,
                    status: 'active',
                    aiEnabled: true,
                })
                .returning()
            conversation = newConv
            console.log(`[TEST] Created conversation: ${conversation.id}`)
        } else {
            console.log(`[TEST] Found conversation: ${conversation.id}`)
        }

        // 3. Save inbound message
        const testMessage = 'Olá, quero informações sobre planos de saúde'
        await db.insert(messages).values({
            conversationId: conversation.id,
            direction: 'inbound',
            sender: 'contact',
            content: testMessage,
            messageType: 'text',
            status: 'read',
        })
        console.log(`[TEST] Saved inbound message`)

        // 4. Get history
        const history = await db
            .select()
            .from(messages)
            .where(eq(messages.conversationId, conversation.id))
            .orderBy((messages) => messages.createdAt)
            .limit(20)

        console.log(`[TEST] Processing with SDR agent...`)
        
        // 5. Process with SDR
        const result = await processSDRMessage(
            conversation.id,
            testMessage,
            history,
            contact
        )

        console.log(`[TEST] SDR result:`, { reply: result.reply ? 'YES' : 'NO', actions: result.actions.length })

        // 6. Execute actions
        if (result.actions.length > 0) {
            await executeSDRActions(result.actions, contact, conversation.id)
            console.log(`[TEST] Executed ${result.actions.length} actions`)
        }

        // 7. Send reply
        if (result.reply) {
            console.log(`[TEST] Sending reply to ${phone}...`)
            console.log(`[TEST] Env - URL: ${process.env.EVOLUTION_API_URL}, Key: ${!!process.env.EVOLUTION_API_KEY}, Instance: ${process.env.EVOLUTION_INSTANCE_NAME}`)
            
            const sendResult = await sendTextMessage(phone, result.reply)
            console.log(`[TEST] Send result:`, JSON.stringify(sendResult).slice(0, 200))

            // Save outbound message
            await db.insert(messages).values({
                conversationId: conversation.id,
                whatsappMessageId: sendResult?.key?.id || 'test-' + Date.now(),
                direction: 'outbound',
                sender: 'ai',
                content: result.reply,
                messageType: 'text',
                status: 'sent',
                aiGenerated: true,
            })
            console.log(`[TEST] Saved outbound message`)
        }

        return NextResponse.json({
            success: true,
            contact: contact.id,
            conversation: conversation.id,
            message: testMessage,
            reply: result.reply,
            actions: result.actions,
            env: {
                EVOLUTION_API_URL: process.env.EVOLUTION_API_URL,
                EVOLUTION_API_KEY_SET: !!process.env.EVOLUTION_API_KEY,
                EVOLUTION_INSTANCE_NAME: process.env.EVOLUTION_INSTANCE_NAME,
            }
        })
    } catch (error) {
        console.error(`[TEST] Error:`, error)
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            env: {
                EVOLUTION_API_URL: process.env.EVOLUTION_API_URL,
                EVOLUTION_API_KEY_SET: !!process.env.EVOLUTION_API_KEY,
                EVOLUTION_INSTANCE_NAME: process.env.EVOLUTION_INSTANCE_NAME,
            }
        }, { status: 500 })
    }
}