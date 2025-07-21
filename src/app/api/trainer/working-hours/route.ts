// src/app/api/trainer/working-hours/route.ts
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

    let workingHours = {
      sunday: { enabled: false, start: '09:00', end: '17:00' },
      monday: { enabled: true, start: '09:00', end: '17:00' },
      tuesday: { enabled: true, start: '09:00', end: '17:00' },
      wednesday: { enabled: true, start: '09:00', end: '17:00' },
      thursday: { enabled: true, start: '09:00', end: '17:00' },
      friday: { enabled: false, start: '09:00', end: '14:00' },
      saturday: { enabled: false, start: '10:00', end: '16:00' }
    }

    if (user.trainer.workingHours) {
      try {
        workingHours = JSON.parse(user.trainer.workingHours)
      } catch (error) {
        console.error('Error parsing working hours:', error)
      }
    }

    return NextResponse.json({ workingHours })

  } catch (error) {
    console.error('Get working hours error:', error)
    return NextResponse.json({ 
      error: 'Failed to get working hours: ' + error.message 
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
    const { workingHours } = body

    // Validate working hours format
    const requiredDays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    for (const day of requiredDays) {
      if (!workingHours[day] || 
          typeof workingHours[day].enabled !== 'boolean' ||
          !workingHours[day].start || 
          !workingHours[day].end) {
        return NextResponse.json({ 
          error: `Invalid working hours format for ${day}` 
        }, { status: 400 })
      }
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { trainer: true }
    })

    if (!user?.trainer) {
      return NextResponse.json({ error: 'Trainer not found' }, { status: 404 })
    }

    // Update working hours
    await prisma.trainer.update({
      where: { id: user.trainer.id },
      data: {
        workingHours: JSON.stringify(workingHours)
      }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Working hours updated successfully'
    })

  } catch (error) {
    console.error('Update working hours error:', error)
    return NextResponse.json({ 
      error: 'Failed to update working hours: ' + error.message 
    }, { status: 500 })
  }
}