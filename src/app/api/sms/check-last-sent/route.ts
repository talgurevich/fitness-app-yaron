// Check when last SMS was sent for an appointment
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        success: false, 
        error: 'Not authenticated' 
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const appointmentId = searchParams.get('appointmentId')

    if (!appointmentId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Appointment ID required' 
      }, { status: 400 })
    }

    // Get the last SMS sent for this appointment
    const lastSms = await prisma.smsLog.findFirst({
      where: { appointmentId },
      orderBy: { sentAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      lastSms: lastSms ? {
        sentAt: lastSms.sentAt,
        status: lastSms.status
      } : null
    })

  } catch (error) {
    console.error('Error checking last SMS:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to check SMS history' 
    }, { status: 500 })
  }
}