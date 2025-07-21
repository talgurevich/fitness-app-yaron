// src/app/api/calendar/create-event/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createCalendarEvent } from '@/lib/calendar'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { appointmentId } = body

    console.log('Creating calendar event for appointment:', appointmentId)

    // Get appointment with trainer details
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        trainer: {
          include: { 
            user: true,
            // Get the trainer's access token from their latest session
          }
        }
      }
    })

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    // For now, we'll get the access token from the trainer's Google account
    // In a real app, you'd store the refresh token and get a fresh access token
    
    // Get the trainer's access token (this is a simplified approach)
    const account = await prisma.account.findFirst({
      where: {
        userId: appointment.trainer.userId,
        provider: 'google'
      }
    })

    if (!account?.access_token) {
      return NextResponse.json({ 
        error: 'No Google access token found for trainer. Please reconnect Google Calendar.',
        needsReauth: true 
      }, { status: 400 })
    }

    // Create calendar event
    const startTime = new Date(appointment.datetime)
    const endTime = new Date(startTime.getTime() + appointment.duration * 60000)

    const eventData = {
      summary: `פגישת אימון עם ${appointment.clientName}`,
      description: `לקוח: ${appointment.clientName}\nאימייל: ${appointment.clientEmail}${appointment.clientPhone ? `\nטלפון: ${appointment.clientPhone}` : ''}`,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: 'Asia/Jerusalem'
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'Asia/Jerusalem'
      },
      attendees: [
        { email: appointment.clientEmail }
      ]
    }

    const calendarEvent = await createCalendarEvent(account.access_token, eventData)

    // Update appointment with Google Event ID
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { googleEventId: calendarEvent.id }
    })

    console.log('Calendar event created:', calendarEvent.id)

    return NextResponse.json({ 
      success: true, 
      eventId: calendarEvent.id,
      eventLink: calendarEvent.htmlLink 
    })

  } catch (error) {
    console.error('Create calendar event error:', error)
    return NextResponse.json({ 
      error: 'Failed to create calendar event: ' + error.message 
    }, { status: 500 })
  }
}