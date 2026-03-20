import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { contacts } from '@/lib/db/schema'

export async function GET() {
    try {
        console.log('[TestDB] Querying contacts...')
        const results = await db.select().from(contacts).limit(1)
        console.log('[TestDB] Success, results count:', results.length)
        return NextResponse.json({ success: true, count: results.length })
    } catch (error: any) {
        console.error('[TestDB] Error:', error)
        return NextResponse.json({ 
            success: false, 
            error: error.message,
            stack: error.stack,
            cause: error.cause ? String(error.cause) : undefined
        }, { status: 500 })
    }
}
