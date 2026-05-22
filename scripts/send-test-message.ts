import * as dotenv from 'dotenv'
import { resolve } from 'path'
import { sendTextMessage } from '../lib/whatsapp/evolution-client'

dotenv.config({ path: resolve(process.cwd(), process.env.DOTENV_CONFIG_PATH || '.env.local') })

const MESSAGE =
    '✅ Teste de conexão — Amélia Saúde CRM. Se você recebeu esta mensagem, a integração Evolution API (instância amelia1) está funcionando.'

async function main() {
    const phoneArg = process.argv[2]
    if (!phoneArg) {
        console.error('Usage: npx tsx scripts/send-test-message.ts <phone>')
        process.exit(1)
    }

    const digits = phoneArg.replace(/\D/g, '')
    const withCountry = digits.startsWith('55') ? digits : `55${digits}`

    console.log('Enviando para:', withCountry)
    const response = await sendTextMessage(withCountry, MESSAGE)
    console.log('Sucesso:', JSON.stringify(response, null, 2))
}

main().catch((err) => {
    console.error('Falha:', err instanceof Error ? err.message : err)
    process.exit(1)
})
