
import { testConnection } from '../lib/whatsapp/evolution-client'
import * as dotenv from 'dotenv'

// Load .env.local
dotenv.config({ path: '.env.local' })

async function check() {
    console.log('Testing Evolution API connection...')
    console.log('URL:', process.env.EVOLUTION_API_URL)
    console.log('Instance:', process.env.EVOLUTION_INSTANCE_NAME)
    
    try {
        const result = await testConnection()
        if (result.success) {
            console.log('✅ Success! Status:', result.status)
        } else {
            console.error('❌ Failed:', result.error)
        }
    } catch (err) {
        console.error('❌ Unexpected error:', err)
    }
}

check()
