// src/app/api/trainer/appointments/route.ts
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

    console.log('Fetching appointments for:', session.user.email)

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        trainer: {
          include: {
            appointments: {
              orderBy: {
                datetime: 'asc'
              }
            }
          }
        }
      }
    })

    if (!user?.trainer) {
      console.log('Trainer not found for user:', session.user.email)
      return NextResponse.json({ 
        appointments: [],
        message: 'Trainer profile not found'
      })
    }

    console.log('Found', user.trainer.appointments.length, 'appointments')

    return NextResponse.json({ 
      appointments: user.trainer.appointments 
    })

  } catch (error) {
    console.error('Get appointments error:', error)
    return NextResponse.json({ 
      error: 'Failed to get appointments: ' + error.message,
      appointments: [] 
    }, { status: 500 })
  }
}