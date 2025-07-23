// src/app/api/trainer/auto-complete/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { autoCompleteTrainerAppointments, autoCompleteAppointments } from '@/lib/auto-complete-appointments'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get trainer info
    const trainer = await prisma.trainer.findFirst({
      where: {
        user: {
          email: session.user.email
        }
      }
    })

    if (!trainer) {
      return NextResponse.json({ error: 'Trainer not found' }, { status: 404 })
    }

    // Auto-complete appointments for this trainer
    const result = await autoCompleteTrainerAppointments(trainer.id)

    console.log(`Auto-completed ${result.completed} appointments for trainer ${trainer.id}`)

    return NextResponse.json({ 
      success: true,
      message: `Auto-completed ${result.completed} appointments`,
      ...result
    })

  } catch (error) {
    console.error('Auto-complete error:', error)
    return NextResponse.json({ 
      error: 'Failed to auto-complete appointments: ' + error.message 
    }, { status: 500 })
  }
}

// GET endpoint to check what appointments would be auto-completed (preview mode)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get trainer info
    const trainer = await prisma.trainer.findFirst({
      where: {
        user: {
          email: session.user.email
        }
      }
    })

    if (!trainer) {
      return NextResponse.json({ error: 'Trainer not found' }, { status: 404 })
    }

    // Find appointments that would be auto-completed (preview only)
    const currentTime = new Date()
    const pastAppointments = await prisma.appointment.findMany({
      where: {
        trainerId: trainer.id,
        datetime: {
          lt: currentTime
        },
        status: 'booked'
      },
      select: {
        id: true,
        clientName: true,
        datetime: true,
        duration: true
      },
      orderBy: {
        datetime: 'desc'
      }
    })

    return NextResponse.json({ 
      success: true,
      pendingCompletion: pastAppointments.length,
      appointments: pastAppointments
    })

  } catch (error) {
    console.error('Auto-complete preview error:', error)
    return NextResponse.json({ 
      error: 'Failed to preview auto-completion: ' + error.message 
    }, { status: 500 })
  }
}