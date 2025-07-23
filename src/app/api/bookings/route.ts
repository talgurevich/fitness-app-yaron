// src/app/api/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createCalendarEvent } from '@/lib/calendar'

// Dynamic imports to avoid build-time issues
let resendInstance: any = null
let emailTemplates: any = null

async function initializeEmailServices() {
  console.log('🔧 Initializing email services...')
  console.log('📊 RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY)
  
  if (!process.env.RESEND_API_KEY) {
    console.log('⚠️ RESEND_API_KEY not found. Emails disabled.')
    return false
  }

  try {
    if (!resendInstance) {
      console.log('📦 Importing Resend...')
      const { Resend } = await import('resend')
      resendInstance = new Resend(process.env.RESEND_API_KEY)
      console.log('✅ Resend instance created')
    }

    if (!emailTemplates) {
      console.log('📦 Importing email templates...')
      emailTemplates = await import('@/lib/email-templates')
      console.log('✅ Email templates loaded')
    }

    return true
  } catch (error) {
    console.error('❌ Failed to initialize email services:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { trainerSlug, clientName, clientEmail, clientPhone, datetime, duration = 60 } = body

    console.log('📝 Received booking:', { trainerSlug, clientName, clientEmail, datetime })

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
      console.log('❌ Trainer not found for slug:', trainerSlug)
      return NextResponse.json({ error: 'Trainer not found' }, { status: 404 })
    }

    console.log('✅ Found trainer:', trainer.user.email)

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

    console.log('✅ Created appointment:', appointment.id)

    // Try to create Google Calendar event automatically
    let calendarEventId = null
    let calendarEventLink = null
    
    try {
      console.log('📅 Attempting to create calendar event...')
      
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

הזמן באמצעותת: Fitness Booking App`,
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
      console.log('ℹ️ Booking created successfully but calendar event failed. This is OK.')
    }

    // Send confirmation emails
    let emailStatus = {
      clientEmailSent: false,
      trainerEmailSent: false,
      errors: [] as string[],
      debug: {} as any
    }

    console.log('📧 Starting email process...')
    
    // Try to initialize and send emails
    const emailServicesReady = await initializeEmailServices()
    
    emailStatus.debug.servicesReady = emailServicesReady
    emailStatus.debug.resendInstance = !!resendInstance
    emailStatus.debug.emailTemplates = !!emailTemplates
    
    if (emailServicesReady && resendInstance && emailTemplates) {
      try {
        console.log('📧 Email services ready, preparing to send emails...')

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

        console.log('📧 Email data prepared:', { 
          clientEmail: emailData.clientEmail, 
          trainerEmail: emailData.trainerEmail 
        })

        // Determine FROM address - use verified domain if available, fallback to test mode
        const FROM_DOMAIN = process.env.VERIFIED_EMAIL_DOMAIN || null
        const USE_TEST_MODE = !FROM_DOMAIN
        
        if (USE_TEST_MODE) {
          console.log('🧪 Using test mode - sending all emails to verified address')
        } else {
          console.log('✅ Using verified domain:', FROM_DOMAIN)
        }

        // Send client confirmation email
        try {
          console.log('📤 Sending client confirmation email...')
          const clientEmail = emailTemplates.getClientConfirmationEmail(emailData)
          console.log('📤 Client email template generated, subject:', clientEmail.subject)
          
          const emailPayload = {
            from: FROM_DOMAIN ? `Fitness Booking <booking@${FROM_DOMAIN}>` : 'Fitness Booking <onboarding@resend.dev>',
            to: USE_TEST_MODE ? ['tal.gurevich2@gmail.com'] : [emailData.clientEmail],
            subject: USE_TEST_MODE ? `[CLIENT COPY for ${emailData.clientEmail}] ${clientEmail.subject}` : clientEmail.subject,
            html: USE_TEST_MODE ? `
              <div style="background: #fef3c7; padding: 16px; margin-bottom: 20px; border-radius: 8px; border: 2px solid #f59e0b;">
                <strong>🧪 TEST MODE: This email was meant for client: ${emailData.clientEmail}</strong><br>
                <small>Set VERIFIED_EMAIL_DOMAIN environment variable to send to real recipients</small>
              </div>
              ${clientEmail.html}
            ` : clientEmail.html
          }
          
          const clientResult = await resendInstance.emails.send(emailPayload)
          
          console.log('✅ Client email sent successfully:', clientResult)
          emailStatus.clientEmailSent = true
          emailStatus.debug.clientResult = clientResult
          
        } catch (clientEmailError) {
          console.error('❌ Failed to send client email:', clientEmailError)
          emailStatus.errors.push('Failed to send client confirmation email: ' + clientEmailError.message)
          emailStatus.debug.clientError = clientEmailError
        }

        // Send trainer notification email
        try {
          console.log('📤 Sending trainer notification email...')
          const trainerEmail = emailTemplates.getTrainerNotificationEmail(emailData)
          console.log('📤 Trainer email template generated, subject:', trainerEmail.subject)
          
          const emailPayload = {
            from: FROM_DOMAIN ? `Fitness Booking <booking@${FROM_DOMAIN}>` : 'Fitness Booking <onboarding@resend.dev>',
            to: USE_TEST_MODE ? ['tal.gurevich2@gmail.com'] : [emailData.trainerEmail],
            subject: USE_TEST_MODE ? `[TRAINER COPY for ${emailData.trainerEmail}] ${trainerEmail.subject}` : trainerEmail.subject,
            html: USE_TEST_MODE ? `
              <div style="background: #fef3c7; padding: 16px; margin-bottom: 20px; border-radius: 8px; border: 2px solid #f59e0b;">
                <strong>🧪 TEST MODE: This notification was meant for trainer: ${emailData.trainerEmail}</strong><br>
                <small>Set VERIFIED_EMAIL_DOMAIN environment variable to send to real recipients</small>
              </div>
              ${trainerEmail.html}
            ` : trainerEmail.html
          }
          
          const trainerResult = await resendInstance.emails.send(emailPayload)
          
          console.log('✅ Trainer email sent successfully:', trainerResult)
          emailStatus.trainerEmailSent = true
          emailStatus.debug.trainerResult = trainerResult
          
        } catch (trainerEmailError) {
          console.error('❌ Failed to send trainer email:', trainerEmailError)
          emailStatus.errors.push('Failed to send trainer notification email: ' + trainerEmailError.message)
          emailStatus.debug.trainerError = trainerEmailError
        }

      } catch (generalEmailError) {
        console.error('❌ General email error:', generalEmailError)
        emailStatus.errors.push('Email service error: ' + generalEmailError.message)
        emailStatus.debug.generalError = generalEmailError
      }
    } else {
      console.log('⚠️ Email services not available. Emails not sent.')
      emailStatus.errors.push('Email service not configured')
    }

    console.log('📊 Final email status:', emailStatus)

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
    console.error('❌ Booking error:', error)
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