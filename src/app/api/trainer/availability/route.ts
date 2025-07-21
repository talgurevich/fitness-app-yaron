// src/app/api/trainer/availability/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        trainer: true
      }
    })

    if (!user?.trainer) {
      return NextResponse.json({ error: 'Trainer not found' }, { status: 404 })
    }

    // Parse working hours from JSON string
    let workingHours = {}
    try {
      workingHours = user.trainer.workingHours ? JSON.parse(user.trainer.workingHours) : {}
    } catch (error) {
      console.error('Error parsing working hours:', error)
    }

    return NextResponse.json({ 
      workingHours,
      timezone: user.trainer.timezone || 'Asia/Jerusalem'
    })

  } catch (error) {
    console.error('Get availability error:', error)
    return NextResponse.json({ 
      error: 'Failed to get availability' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { workingHours, timezone } = body

    console.log('Updating availability:', { workingHours, timezone })

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { trainer: true }
    })

    if (!user?.trainer) {
      return NextResponse.json({ error: 'Trainer not found' }, { status: 404 })
    }

    // Update trainer availability
    await prisma.trainer.update({
      where: { id: user.trainer.id },
      data: {
        workingHours: JSON.stringify(workingHours),
        timezone: timezone || 'Asia/Jerusalem'
      }
    })

    console.log('Availability updated successfully')

    return NextResponse.json({ 
      success: true,
      message: 'Availability updated successfully'
    })

  } catch (error) {
    console.error('Update availability error:', error)
    return NextResponse.json({ 
      error: 'Failed to update availability: ' + error.message 
    }, { status: 500 })
  }
}