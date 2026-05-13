import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

async function testConnection() {
    const apiUrl = process.env.EVOLUTION_API_URL;
    const apiKey = process.env.EVOLUTION_API_KEY;
    const instanceName = process.env.EVOLUTION_INSTANCE_NAME;

    if (!apiUrl || !apiKey || !instanceName) {
        console.error('Missing required environment variables: EVOLUTION_API_URL, EVOLUTION_API_KEY, EVOLUTION_INSTANCE_NAME');
        process.exit(1);
    }

    console.log('Testing Evolution API connection...');
    console.log('URL:', apiUrl);
    console.log('Instance:', instanceName);
    
    try {
        const response = await fetch(`${apiUrl}/instance/connectionState/${instanceName}`, {
            headers: { 
                'apikey': apiKey,
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Test Failed:', error);
    }
}

testConnection();
