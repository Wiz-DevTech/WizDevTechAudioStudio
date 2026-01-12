import { NextRequest, NextResponse } from 'next/server'
import { readFile, unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { db } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const audio = await db.generatedAudio.findUnique({
      where: { id: params.id },
    })

    if (!audio) {
      return NextResponse.json(
        { error: 'Audio file not found' },
        { status: 404 }
      )
    }

    const filepath = join(process.cwd(), 'public', audio.audioPath.replace(/^\//, ''))

    if (!existsSync(filepath)) {
      return NextResponse.json(
        { error: 'Audio file not found' },
        { status: 404 }
      )
    }

    const buffer = await readFile(filepath)

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000',
      },
    })
  } catch (error) {
    console.error('Get audio error:', error)
    return NextResponse.json(
      { error: 'Failed to get audio file' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const audio = await db.generatedAudio.findUnique({
      where: { id: params.id },
    })

    if (!audio) {
      return NextResponse.json(
        { error: 'Audio file not found' },
        { status: 404 }
      )
    }

    // Delete from database
    await db.generatedAudio.delete({
      where: { id: params.id },
    })

    // Try to delete file
    const filepath = join(process.cwd(), 'public', audio.audioPath.replace(/^\//, ''))
    if (existsSync(filepath)) {
      await unlink(filepath)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete audio error:', error)
    return NextResponse.json(
      { error: 'Failed to delete audio file' },
      { status: 500 }
    )
  }
}
