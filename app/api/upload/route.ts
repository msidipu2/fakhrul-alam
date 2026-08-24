import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Ensure upload directory exists in public/renders
    const uploadDir = path.join(process.cwd(), 'public', 'renders')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    // Sanitize filename and create unique timestamped name
    const timestamp = Date.now()
    const sanitizedOriginalName = file.name
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, '_')
    const fileName = `${timestamp}_${sanitizedOriginalName}`
    const filePath = path.join(uploadDir, fileName)

    // Write file to disk
    fs.writeFileSync(filePath, buffer)

    const publicUrl = `/renders/${fileName}`

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName,
      sizeKB: Math.round(buffer.length / 1024),
    })
  } catch (error: any) {
    console.error('API Upload error:', error)
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 })
  }
}
