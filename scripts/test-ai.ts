import { processSDRMessage } from '../lib/ai/sdr-agent';
import { db } from '../lib/db';
import { contacts, conversations } from '../lib/db/schema';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

async function testAI() {
    console.log('Testing AI Agent...');
    try {
        const [contact] = await db.select().from(contacts).limit(1);
        if (!contact) {
            console.error('No contact found in DB. Run the webhook test first.');
            return;
        }

        const [conversation] = await db.select().from(conversations).where(eq(conversations.contactId, contact.id)).limit(1);
        
        console.log('Processing message for contact:', contact.name);
        const result = await processSDRMessage(
            conversation.id,
            "Quero saber sobre planos de saúde para minha empresa",
            [],
            contact
        );
        
        console.log('AI Result:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('AI Test Failed:', error);
    }
}

testAI();
