// src/app/api/trainer/appointments/route.ts - FIXED VERSION
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized',
        appointments: [] 
      }, { status: 401 })
    }

    console.log('Fetching upcoming appointments for:', session.user.email)

    // Get trainer
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { trainer: true }
    })

    if (!user?.trainer) {
      console.log('Trainer not found for user:', session.user.email)
      return NextResponse.json({ 
        success: true,
        appointments: [],
        message: 'Trainer profile not found'
      })
    }

    // 🔧 FIX: Get only UPCOMING appointments (future + booked status)
    const now = new Date()
    const upcomingAppointments = await prisma.appointment.findMany({
      where: {
        trainerId: user.trainer.id,
        datetime: {
          gte: now // Only future appointments
        },
        status: 'booked' // Only booked appointments (not completed/cancelled)
      },
      orderBy: {
        datetime: 'asc'
      },
      // 🔧 FIX: Select only fields needed by dashboard
      select: {
        id: true,
        clientName: true,
        clientEmail: true,
        clientPhone: true,
        datetime: true,
        duration: true,
        status: true,
        client: {
          select: {
            phone: true
          }
        }
      }
    })

    console.log('Found', upcomingAppointments.length, 'upcoming appointments')

    // 🔧 FIX: Return in correct format with success field
    return NextResponse.json({ 
      success: true,
      appointments: upcomingAppointments
    })

  } catch (error) {
    console.error('Get appointments error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to get appointments: ' + error.message,
      appointments: [] 
    }, { status: 500 })
  }
}