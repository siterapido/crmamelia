import { sendTextMessage } from '../lib/whatsapp/evolution-client';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

async function testSend() {
    const phone = '558486536223'; // The instance owner phone
    const message = 'Teste de resposta automática da Amélia Saúde';
    
    console.log(`Testing sendTextMessage to ${phone}...`);
    try {
        const response = await sendTextMessage(phone, message);
        console.log('Send Success:', JSON.stringify(response, null, 2));
    } catch (error) {
        console.error('Send Failed:', error);
    }
}

testSend();
