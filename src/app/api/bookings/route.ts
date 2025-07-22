// src/app/api/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createCalendarEvent } from '@/lib/calendar'
import { Resend } from 'resend'
import { getClientConfirmationEmail, getTrainerNotificationEmail } from '@/lib/email-templates'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { trainerSlug, clientName, clientEmail, clientPhone, datetime, duration = 60 } = body

    console.log('Received booking:', { trainerSlug, clientName, clientEmail, datetime })

    // Find trainer by booking slug
    const trainer = await prisma.trainer.findFirst({
      where: {
        bookingSlug: trainerSlug
      },
      include: {
        user: true
      }
    })

    if (!trainer) {
      console.log('Trainer not found for slug:', trainerSlug)
      return NextResponse.json({ error: 'Trainer not found' }, { status: 404 })
    }

    console.log('Found trainer:', trainer.user.email)

    // Create the appointment
    const appointment = await prisma.appointment.create({
      data: {
        trainerId: trainer.id,
        clientName,
        clientEmail,
        clientPhone: clientPhone || '',
        datetime: new Date(datetime),
        duration,
        status: 'booked'
      }
    })

    console.log('Created appointment:', appointment.id)

    // Try to create Google Calendar event automatically
    let calendarEventId = null
    let calendarEventLink = null
    
    try {
      console.log('Attempting to create calendar event...')
      
      // Get the trainer's Google account access token
      const account = await prisma.account.findFirst({
        where: {
          userId: trainer.userId,
          provider: 'google'
        }
      })

      if (!account?.access_token) {
        console.log('⚠️ No Google access token found for trainer. Calendar event not created.')
      } else {
        console.log('✅ Found Google access token, creating calendar event...')
        
        // Create calendar event directly
        const startTime = new Date(appointment.datetime)
        const endTime = new Date(startTime.getTime() + duration * 60000)

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

        const calendarEvent = await createCalendarEvent(account.access_token, eventData)
        
        // Update appointment with Google Event ID
        await prisma.appointment.update({
          where: { id: appointment.id },
          data: { googleEventId: calendarEvent.id }
        })
        
        calendarEventId = calendarEvent.id
        calendarEventLink = calendarEvent.htmlLink
        
        console.log('✅ Calendar event created successfully:', calendarEvent.id)
      }
      
    } catch (calendarError) {
      console.error('❌ Calendar event creation error:', calendarError)
      // Don't fail the booking if calendar creation fails
      console.log('ℹ️ Booking created successfully but calendar event failed. This is OK.')
    }

    // Send confirmation emails
    let emailStatus = {
      clientEmailSent: false,
      trainerEmailSent: false,
      errors: [] as string[]
    }

    if (process.env.RESEND_API_KEY) {
      try {
        console.log('📧 Sending confirmation emails...')

        const emailData = {
          clientName: appointment.clientName,
          clientEmail: appointment.clientEmail,
          clientPhone: appointment.clientPhone || undefined,
          trainerName: trainer.user.name || trainer.user.email || 'המאמן',
          trainerEmail: trainer.user.email!,
          datetime: appointment.datetime,
          duration: appointment.duration,
          appointmentId: appointment.id,
          calendarEventLink: calendarEventLink || undefined
        }

        // Send client confirmation email
        try {
          const clientEmail = getClientConfirmationEmail(emailData)
          await resend.emails.send({
            from: 'Fitness Booking <onboarding@resend.dev>', // Use your verified domain
            ...clientEmail
          })
          emailStatus.clientEmailSent = true
          console.log('✅ Client confirmation email sent to:', appointment.clientEmail)
        } catch (clientEmailError) {
          console.error('❌ Failed to send client email:', clientEmailError)
          emailStatus.errors.push('Failed to send client confirmation email')
        }

        // Send trainer notification email
        try {
          const trainerEmail = getTrainerNotificationEmail(emailData)
          await resend.emails.send({
            from: 'Fitness Booking <onboarding@resend.dev>', // Use your verified domain
            ...trainerEmail
          })
          emailStatus.trainerEmailSent = true
          console.log('✅ Trainer notification email sent to:', trainer.user.email)
        } catch (trainerEmailError) {
          console.error('❌ Failed to send trainer email:', trainerEmailError)
          emailStatus.errors.push('Failed to send trainer notification email')
        }

      } catch (generalEmailError) {
        console.error('❌ General email error:', generalEmailError)
        emailStatus.errors.push('Email service error')
      }
    } else {
      console.log('⚠️ RESEND_API_KEY not found. Emails not sent.')
      emailStatus.errors.push('Email service not configured')
    }

    return NextResponse.json({ 
      success: true, 
      appointment: {
        id: appointment.id,
        datetime: appointment.datetime,
        clientName: appointment.clientName
      },
      calendar: {
        eventCreated: !!calendarEventId,
        eventId: calendarEventId,
        eventLink: calendarEventLink
      },
      emails: emailStatus
    })

  } catch (error) {
    console.error('Booking error:', error)
    return NextResponse.json({ 
      error: 'Failed to create booking: ' + error.message,
      success: false 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const trainerSlug = searchParams.get('trainerSlug')

    if (!trainerSlug) {
      return NextResponse.json({ error: 'Trainer slug required' }, { status: 400 })
    }

    const trainer = await prisma.trainer.findFirst({
      where: {
        bookingSlug: trainerSlug
      },
      include: {
        appointments: {
          where: {
            datetime: {
              gte: new Date() // Only future appointments
            }
          },
          orderBy: {
            datetime: 'asc'
          }
        },
        user: true
      }
    })

    if (!trainer) {
      return NextResponse.json({ error: 'Trainer not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      trainer: {
        name: trainer.user.name || trainer.user.email,
        appointments: trainer.appointments
      }
    })

  } catch (error) {
    console.error('Get bookings error:', error)
    return NextResponse.json({ 
      error: 'Failed to get bookings: ' + error.message,
      trainer: { name: 'Error', appointments: [] }
    }, { status: 500 })
  }
}