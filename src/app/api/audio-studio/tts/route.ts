import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { text, voice = 'tongtong', speed = 1.0, volume = 1.0 } = await req.json()

    // Validate inputs
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Please enter valid text content' },
        { status: 400 }
      )
    }

    if (text.length > 1024) {
      return NextResponse.json(
        { error: 'Text length cannot exceed 1024 characters' },
        { status: 400 }
      )
    }

    if (speed < 0.5 || speed > 2.0) {
      return NextResponse.json(
        { error: 'Speed must be between 0.5 and 2.0' },
        { status: 400 }
      )
    }

    if (volume <= 0 || volume > 10) {
      return NextResponse.json(
        { error: 'Volume must be between 0 and 10' },
        { status: 400 }
      )
    }

    // Import ZAI SDK
    const ZAI = (await import('z-ai-web-dev-sdk')).default

    // Create SDK instance
    const zai = await ZAI.create()

    // Generate TTS audio
    const response = await zai.audio.tts.create({
      input: text.trim(),
      voice: voice,
      speed: speed,
      volume: volume,
      response_format: 'wav',
      stream: false,
    })

    // Get array buffer from Response object
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(new Uint8Array(arrayBuffer))

    // Ensure audio directory exists
    const audioDir = join(process.cwd(), 'public', 'audio')
    if (!existsSync(audioDir)) {
      await mkdir(audioDir, { recursive: true })
    }

    // Save audio file
    const filename = `audio-${Date.now()}.wav`
    const filepath = join(audioDir, filename)
    await writeFile(filepath, buffer)

    // Save to database
    const generatedAudio = await db.generatedAudio.create({
      data: {
        title: `Generated Audio ${new Date().toLocaleString()}`,
        text: text.trim(),
        audioPath: `/audio/${filename}`,
        format: 'wav',
        speed: speed,
        volume: volume,
      },
    })

    // Return audio as response
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    console.error('TTS API Error:', error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to generate speech, please try again later',
      },
      { status: 500 }
    )
  }
}
