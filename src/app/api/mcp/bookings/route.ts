import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createCalendarEvent } from '@/lib/calendar'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    // Verify MCP API key
    const apiKey = request.headers.get('X-API-Key')
    if (apiKey !== process.env.APP_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      trainer_slug,
      datetime,
      client_name,
      client_email,
      client_phone = '',
      duration = 60
    } = body

    // Validate required fields
    if (!trainer_slug || !datetime || !client_name || !client_email) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 })
    }

    // Find trainer
    const trainer = await prisma.trainer.findFirst({
      where: { bookingSlug: trainer_slug },
      include: {
        user: {
          include: {
            accounts: true
          }
        }
      }
    })

    if (!trainer) {
      return NextResponse.json({
        success: false,
        error: 'Trainer not found'
      }, { status: 404 })
    }

    // Parse datetime - assume it's in Israel timezone
    const appointmentDate = new Date(datetime + '+03:00')

    // Check if slot is still available
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        trainerId: trainer.id,
        datetime: appointmentDate,
        status: {
          not: 'cancelled'
        }
      }
    })

    if (existingAppointment) {
      return NextResponse.json({
        success: false,
        error: 'Time slot is no longer available'
      }, { status: 409 })
    }

    // Find or create client
    let client = await prisma.client.findFirst({
      where: {
        trainerId: trainer.id,
        email: client_email
      }
    })

    if (!client) {
      client = await prisma.client.create({
        data: {
          trainerId: trainer.id,
          email: client_email,
          name: client_name,
          phone: client_phone || null,
          sessionPrice: 180 // Default price
        }
      })
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        trainerId: trainer.id,
        clientId: client.id,
        clientName: client_name,
        clientEmail: client_email,
        clientPhone: client_phone || null,
        datetime: appointmentDate,
        duration: duration,
        sessionPrice: 180,
        status: 'booked'
      },
      include: {
        trainer: {
          include: {
            user: true
          }
        },
        client: true
      }
    })

    // Try to create Google Calendar event if trainer has OAuth
    let googleEventId = null
    try {
      const googleAccount = trainer.user.accounts.find(acc => acc.provider === 'google')
      if (googleAccount?.access_token) {
        const eventData = {
          summary: `אימון עם ${client_name}`,
          description: `אימון אישי עם ${client_name}\nטלפון: ${client_phone || 'לא סופק'}`,
          start: {
            dateTime: appointmentDate.toISOString(),
            timeZone: 'Asia/Jerusalem'
          },
          end: {
            dateTime: new Date(appointmentDate.getTime() + duration * 60000).toISOString(),
            timeZone: 'Asia/Jerusalem'
          },
          attendees: [
            { email: client_email, responseStatus: 'accepted' }
          ],
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'email', minutes: 24 * 60 },
              { method: 'popup', minutes: 60 }
            ]
          }
        }

        const calendarEvent = await createCalendarEvent(googleAccount.access_token, eventData)
        googleEventId = calendarEvent.id
      }
    } catch (calendarError) {
      console.log('Calendar event creation failed:', calendarError)
    }

    // Update appointment with Google event ID if created
    if (googleEventId) {
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: { googleEventId }
      })
    }

    // Send confirmation email
    try {
      const formattedDate = appointmentDate.toLocaleDateString('he-IL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      const formattedTime = appointmentDate.toLocaleTimeString('he-IL', {
        hour: '2-digit',
        minute: '2-digit'
      })

      await resend.emails.send({
        from: 'bookings@fitnessapp.com', // Update with your actual domain
        to: client_email,
        subject: 'אישור אימון - Booking Confirmation',
        html: `
          <div dir="rtl">
            <h2>שלום ${client_name}!</h2>
            <p>האימון שלך נקבע בהצלחה:</p>
            <ul>
              <li><strong>מאמן:</strong> ${trainer.user.name}</li>
              <li><strong>תאריך:</strong> ${formattedDate}</li>
              <li><strong>שעה:</strong> ${formattedTime}</li>
              <li><strong>משך:</strong> ${duration} דקות</li>
            </ul>
            <p>תקבל תזכורת יום לפני האימון.</p>
            <p>בהצלחה!</p>
          </div>
        `
      })
    } catch (emailError) {
      console.log('Email sending failed:', emailError)
    }

    return NextResponse.json({
      success: true,
      data: {
        id: appointment.id,
        trainer: trainer.user.name,
        datetime: appointmentDate.toISOString(),
        client_name,
        client_email,
        duration,
        googleEventId,
        confirmationMessage: 'Booking created successfully!'
      }
    })

  } catch (error) {
    console.error('Error creating booking via MCP:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}