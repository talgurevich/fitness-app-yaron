// src/app/api/bookings/[id]/route.ts - FIXED VERSION
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getGoogleCalendar } from '@/lib/calendar'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const appointmentId = params.id

    // Find the appointment and verify it belongs to this trainer
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        trainer: {
          include: { user: true }
        }
      }
    })

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    // Verify this appointment belongs to the logged-in trainer
    if (appointment.trainer.user.email !== session.user.email) {
      return NextResponse.json({ error: 'Not authorized to delete this appointment' }, { status: 403 })
    }

    // Try to delete from Google Calendar if it exists
    if (appointment.googleEventId && session.accessToken) {
      try {
        const calendar = getGoogleCalendar(session.accessToken as string)
        await calendar.events.delete({
          calendarId: 'primary',
          eventId: appointment.googleEventId
        })
        console.log('Google Calendar event deleted:', appointment.googleEventId)
      } catch (calendarError) {
        console.error('Failed to delete from Google Calendar:', calendarError)
        // Don't fail the entire operation if calendar deletion fails
      }
    }

    // 🔧 NEW: Use transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      // Delete the appointment from database
      await tx.appointment.delete({
        where: { id: appointmentId }
      })

      // 🆕 Update completedSessions count if this was a completed appointment
      if (appointment.status === 'completed' && appointment.clientId) {
        await tx.client.update({
          where: { id: appointment.clientId },
          data: {
            completedSessions: {
              decrement: 1  // Decrease the completed sessions count
            }
          }
        })
        
        console.log(`Decremented completedSessions for client ${appointment.clientId}`)
      }
    })

    console.log('Appointment deleted:', appointmentId)

    return NextResponse.json({ 
      success: true, 
      message: 'Appointment deleted successfully' 
    })

  } catch (error) {
    console.error('Delete appointment error:', error)
    return NextResponse.json({ 
      error: 'Failed to delete appointment: ' + error.message 
    }, { status: 500 })
  }
}