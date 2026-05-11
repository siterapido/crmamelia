/**
 * File Upload API Route
 * POST /api/upload - Upload a file and return public URL
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads')

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('file') as File | null

        if (!file) {
            return NextResponse.json({ error: 'Arquivo é obrigatório' }, { status: 400 })
        }

        const maxSize = 10 * 1024 * 1024 // 10MB
        if (file.size > maxSize) {
            return NextResponse.json({ error: 'Arquivo muito grande (máximo 10MB)' }, { status: 400 })
        }

        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'video/mp4', 'video/webm',
            'audio/mpeg', 'audio/ogg', 'audio/wav',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ]

        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Tipo de arquivo não permitido' }, { status: 400 })
        }

        if (!existsSync(UPLOAD_DIR)) {
            await mkdir(UPLOAD_DIR, { recursive: true })
        }

        const timestamp = Date.now()
        const ext = file.name.split('.').pop()
        const fileName = `${timestamp}-${Math.random().toString(36).slice(2)}.${ext}`
        const filePath = join(UPLOAD_DIR, fileName)

        const bytes = await file.arrayBuffer()
        await writeFile(filePath, Buffer.from(bytes))

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ameliasaude.vercel.app'
        const url = `${baseUrl}/uploads/${fileName}`

        return NextResponse.json({
            success: true,
            url,
            fileName: file.name,
            type: file.type,
            size: file.size,
        })
    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json({ error: 'Erro ao fazer upload' }, { status: 500 })
    }
}
