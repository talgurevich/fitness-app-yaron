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
            user: true
          }
        }
      }
    })

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    console.log('Found appointment for trainer:', appointment.trainer.user.email)

    // Get the trainer's Google account access token
    const account = await prisma.account.findFirst({
      where: {
        userId: appointment.trainer.userId,
        provider: 'google'
      }
    })

    if (!account?.access_token) {
      console.log('No Google access token found for trainer:', appointment.trainer.user.email)
      return NextResponse.json({ 
        error: 'Trainer needs to connect Google Calendar. Please go to dashboard and click "חבר יומן Google".',
        needsReauth: true 
      }, { status: 400 })
    }

    console.log('Using access token for calendar event creation')

    // Create calendar event
    const startTime = new Date(appointment.datetime)
    const endTime = new Date(startTime.getTime() + (appointment.duration || 60) * 60000)

    const eventData = {
      summary: `🏋️ אימון עם ${appointment.clientName}`,
      description: `אימון אישי
      
לקוח: ${appointment.clientName}
אימייל: ${appointment.clientEmail}${appointment.clientPhone ? `
טלפון: ${appointment.clientPhone}` : ''}

הזמן באמצעות: Fitness Booking App`,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: 'Asia/Jerusalem'
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'Asia/Jerusalem'
      },
      attendees: [
        { email: appointment.clientEmail, responseStatus: 'needsAction' }
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 24 hours before
          { method: 'popup', minutes: 30 }       // 30 minutes before
        ]
      }
    }

    console.log('Creating calendar event with data:', {
      summary: eventData.summary,
      start: eventData.start,
      end: eventData.end
    })

    const calendarEvent = await createCalendarEvent(account.access_token, eventData)

    // Update appointment with Google Event ID
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { googleEventId: calendarEvent.id }
    })

    console.log('✅ Calendar event created successfully:', calendarEvent.id)

    return NextResponse.json({ 
      success: true, 
      eventId: calendarEvent.id,
      eventLink: calendarEvent.htmlLink,
      message: 'Calendar event created successfully'
    })

  } catch (error) {
    console.error('❌ Create calendar event error:', error)
    
    // Handle specific Google API errors
    if (error.message?.includes('invalid_grant') || error.code === 401) {
      return NextResponse.json({ 
        error: 'Google authentication expired. Trainer needs to reconnect Google Calendar.',
        needsReauth: true
      }, { status: 401 })
    }

    if (error.message?.includes('insufficient permissions')) {
      return NextResponse.json({ 
        error: 'Insufficient permissions. Trainer needs to reconnect Google Calendar with proper permissions.',
        needsReauth: true
      }, { status: 403 })
    }

    return NextResponse.json({ 
      error: 'Failed to create calendar event: ' + error.message,
      details: error.response?.data || error.toString()
    }, { status: 500 })
  }
}