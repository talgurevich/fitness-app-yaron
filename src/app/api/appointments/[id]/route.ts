// src/app/api/appointments/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Fetch appointment details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        trainer: {
          include: {
            user: true
          }
        }
      }
    })

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    // Verify the trainer owns this appointment
    if (appointment.trainer.user.email !== session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      appointment: {
        id: appointment.id,
        datetime: appointment.datetime.toISOString(),
        duration: appointment.duration,
        status: appointment.status,
        sessionPrice: appointment.sessionPrice,
        sessionNotes: appointment.sessionNotes,
        clientName: appointment.clientName,
        clientEmail: appointment.clientEmail,
        clientPhone: appointment.clientPhone
      }
    })

  } catch (error) {
    console.error('Error fetching appointment:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch appointment' 
    }, { status: 500 })
  }
}

// PUT - Update appointment details
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      sessionPrice, 
      sessionNotes, 
      duration, 
      datetime,
      status 
    } = body

    // Find the appointment and verify ownership
    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: {
        trainer: {
          include: {
            user: true
          }
        }
      }
    })

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    // Verify the trainer owns this appointment
    if (appointment.trainer.user.email !== session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Prepare update data
    const updateData: any = {}
    
    if (sessionPrice !== undefined) updateData.sessionPrice = parseInt(sessionPrice)
    if (sessionNotes !== undefined) updateData.sessionNotes = sessionNotes || null
    if (duration !== undefined) updateData.duration = parseInt(duration)
    if (status !== undefined) updateData.status = status
    
    // Handle datetime update with proper timezone
    if (datetime) {
      // Parse datetime ensuring it's treated as Israel time
      const israelDatetime = datetime.includes('+') ? datetime : datetime + '+03:00'
      updateData.datetime = new Date(israelDatetime)
    }

    // Update the appointment
    const updatedAppointment = await prisma.appointment.update({
      where: { id: params.id },
      data: updateData
    })

    console.log('✅ Appointment updated successfully:', {
      appointmentId: params.id,
      updatedFields: Object.keys(updateData),
      trainerEmail: session.user.email
    })

    return NextResponse.json({
      success: true,
      appointment: {
        id: updatedAppointment.id,
        datetime: updatedAppointment.datetime.toISOString(),
        duration: updatedAppointment.duration,
        status: updatedAppointment.status,
        sessionPrice: updatedAppointment.sessionPrice,
        sessionNotes: updatedAppointment.sessionNotes
      },
      message: 'Appointment updated successfully'
    })

  } catch (error) {
    console.error('Error updating appointment:', error)
    return NextResponse.json({ 
      error: 'Failed to update appointment: ' + error.message 
    }, { status: 500 })
  }
}