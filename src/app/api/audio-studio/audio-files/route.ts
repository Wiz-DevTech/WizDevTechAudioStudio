import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const audioFiles = await db.generatedAudio.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
      include: {
        voiceProfile: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(audioFiles)
  } catch (error) {
    console.error('Get audio files error:', error)
    return NextResponse.json(
      { error: 'Failed to get audio file list' },
      { status: 500 }
    )
  }
}
