import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Verify MCP API key
    const apiKey = request.headers.get('X-API-Key')
    if (apiKey !== process.env.APP_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const includeDetails = searchParams.get('include_details') === 'true'

    const trainers = await prisma.trainer.findMany({
      include: {
        user: true
      }
    })

    const formattedTrainers = trainers.map(trainer => ({
      id: trainer.id,
      name: trainer.user.name,
      slug: trainer.bookingSlug,
      ...(includeDetails && {
        specialization: 'כוח ופיתוח גוף', // Default - could be stored in DB
        experience: '5 שנות ניסיון', // Default - could be stored in DB
        price: 180 // Default - could come from trainer settings
      })
    }))

    return NextResponse.json({
      success: true,
      data: formattedTrainers
    })
  } catch (error) {
    console.error('Error fetching trainers for MCP:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch trainers' },
      { status: 500 }
    )
  }
}