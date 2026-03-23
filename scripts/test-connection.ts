import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve('/Users/marcosalexandre/projetos/sixsaude/.env.local') });

async function testConnection() {
    const apiUrl = 'https://evolution-api-production-027f.up.railway.app';
    const apiKey = '27F55316E89A-46EC-80E2-59412C91A830';
    const instanceName = 'sixosaudeficial';

    console.log('Testing Evolution API connection with user-provided info...');
    console.log('URL:', apiUrl);
    console.log('Key:', apiKey);
    console.log('Instance:', instanceName);
    
    try {
        const response = await fetch(`${apiUrl}/instance/connectionStatus/${instanceName}`, {
            headers: { 'apikey': apiKey }
        });
        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Test Failed:', error);
    }
}

testConnection();
