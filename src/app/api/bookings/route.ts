// src/app/api/bookings/route.ts - Fixed to prevent duplicate clients by email
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getGoogleCalendar } from '@/lib/calendar'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  console.log('🚨 BOOKINGS ROUTE CALLED - REQUEST RECEIVED 🚨')
  console.log('📍 Current timestamp:', new Date().toISOString())
  console.log('📍 Request URL:', request.url)
  console.log('📍 Request method:', request.method)
  
  try {
    const body = await request.json()
    console.log('📦 Request body received:', { 
      keys: Object.keys(body),
      datetime: body.datetime,
      clientName: body.clientName,
      trainerSlug: body.trainerSlug 
    })
    
    const { 
      clientId, 
      clientName, 
      clientEmail, 
      datetime, 
      duration = 60, 
      sessionPrice, 
      notes,
      clientPhone,
      trainerSlug // Added to handle public bookings
    } = body

    let trainer;
    const session = await getServerSession(authOptions)
    
    if (session?.user?.email) {
      // Booking made by logged-in trainer
      trainer = await prisma.trainer.findFirst({
        where: {
          user: {
            email: session.user.email
          }
        },
        include: {
          user: {
            include: {
              accounts: true // Include accounts to get refresh token
            }
          }
        }
      })
    } else if (trainerSlug) {
      // Public booking via trainer's booking page
      trainer = await prisma.trainer.findFirst({
        where: {
          bookingSlug: trainerSlug
        },
        include: {
          user: {
            include: {
              accounts: true // Include accounts to get refresh token
            }
          }
        }
      })
    } else {
      return NextResponse.json({ success: false, error: 'Trainer not found' }, { status: 400 })
    }

    if (!trainer) {
      return NextResponse.json({ success: false, error: 'Trainer not found' }, { status: 404 })
    }

    // Validate required fields
    if (!clientName || !clientEmail || !datetime) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: clientName, clientEmail, datetime' 
      }, { status: 400 })
    }

    // Parse datetime - the frontend sends "YYYY-MM-DDTHH:mm:ss" representing Israel local time
    // We need to interpret this correctly regardless of server timezone
    
    // First, parse the date parts
    const [datePart, timePart] = datetime.split('T')
    const [year, month, day] = datePart.split('-').map(Number)
    const [hourStr, minuteStr] = timePart.split(':')
    const hour = parseInt(hourStr)
    const minute = parseInt(minuteStr)
    
    // CRITICAL FIX: Append Israel timezone offset to ensure correct interpretation
    // The datetime represents Israel local time, not server local time
    const israelDatetime = datetime + '+03:00'  // Israel is UTC+3 in summer
    const appointmentDate = new Date(israelDatetime)
    
    // Log what we received vs what the server interpreted
    console.log('🕐 Timezone Debug:', {
      receivedTime: `${hourStr}:${minuteStr}`,
      receivedDatetime: datetime,
      israelDatetime: israelDatetime,
      serverTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      parsedUTC: appointmentDate.toISOString(),
      israelDisplay: appointmentDate.toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' })
    })
    
    console.log('📝 Booking request details:', {
      trainerEmail: trainer.user.email,
      clientName,
      clientEmail,
      receivedDatetime: datetime,
      parsedDatetime: appointmentDate.toISOString(),
      localTime: appointmentDate.toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' }),
      utcTime: appointmentDate.toUTCString(),
      trainerSlug: trainerSlug || 'direct-booking'
    })

    // 🔧 FIX: Find or create client by email (the key change!)
    let client = await prisma.client.findUnique({
      where: {
        trainerId_email: {
          trainerId: trainer.id,
          email: clientEmail
        }
      }
    })

    if (client) {
      console.log('✅ Found existing client:', client.email, '- Using existing data')
      
      // Optional: Update client info if booking form has more recent/correct data
      // You can uncomment this if you want to allow updates to client info
      /*
      if (clientPhone && !client.phone) {
        await prisma.client.update({
          where: { id: client.id },
          data: { phone: clientPhone }
        })
        client.phone = clientPhone
      }
      */
    } else {
      console.log('🆕 Creating new client for:', clientEmail)
      
      // Create new client
      client = await prisma.client.create({
        data: {
          trainerId: trainer.id,
          email: clientEmail,
          name: clientName,
          phone: clientPhone || null,
          sessionPrice: sessionPrice || 180, // Set default price
          joinedDate: new Date()
        }
      })
    }

    // Create Google Calendar event if trainer has calendar access
    let googleEventId = null
    
    console.log('🔍 Calendar integration debug - trainer accounts:', {
      trainerEmail: trainer.user.email,
      totalAccounts: trainer.user.accounts?.length || 0,
      accountProviders: trainer.user.accounts?.map(acc => acc.provider) || [],
      googleCalendarId: trainer.googleCalendarId
    })
    
    // Check if trainer has a Google account with refresh token
    const googleAccount = trainer.user.accounts?.find(acc => acc.provider === 'google')
    
    console.log('🔍 Calendar integration check:', {
      hasGoogleAccount: !!googleAccount,
      hasRefreshToken: !!googleAccount?.refresh_token,
      hasCalendarId: !!trainer.googleCalendarId,
      calendarId: trainer.googleCalendarId,
      refreshTokenPreview: googleAccount?.refresh_token ? googleAccount.refresh_token.substring(0, 20) + '...' : 'none'
    })
    
    if (googleAccount?.refresh_token) {
      try {
        // If no calendar ID is set, use 'primary' as default
        const calendarId = trainer.googleCalendarId || 'primary'
        console.log('📅 Using calendar ID:', calendarId)
        console.log('🕐 Calendar event times:', {
          originalDatetime: datetime,
          startTime: datetime,
          endTime: `${datePart}T${String(hour + Math.floor(duration / 60)).padStart(2, '0')}:${String(minute + (duration % 60)).padStart(2, '0')}:00`,
          timezone: trainer.timezone || 'Asia/Jerusalem'
        })
        
        // Use the trainer's refresh token to get a new access token
        const { google } = await import('googleapis')
        const oauth2Client = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET,
          process.env.NEXTAUTH_URL + '/api/auth/callback/google'
        )
        
        oauth2Client.setCredentials({
          refresh_token: googleAccount.refresh_token
        })
        
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
        
        const endTime = new Date(appointmentDate.getTime() + (duration * 60 * 1000))
        
        const event = await calendar.events.insert({
          calendarId: calendarId,
          requestBody: {
            summary: `Training Session - ${client.name}`, // Use client's correct name
            description: `Fitness training session with ${client.name}${notes ? `\n\nNotes: ${notes}` : ''}`,
            start: {
              dateTime: datetime,  // datetime already includes seconds from frontend
              timeZone: trainer.timezone || 'Asia/Jerusalem'
            },
            end: {
              dateTime: `${datePart}T${String(hour + Math.floor(duration / 60)).padStart(2, '0')}:${String(minute + (duration % 60)).padStart(2, '0')}:00`,
              timeZone: trainer.timezone || 'Asia/Jerusalem'
            },
            attendees: [
              { email: client.email, displayName: client.name }
            ]
          }
        })
        
        googleEventId = event.data.id
        console.log('✅ Google Calendar event created:', googleEventId)
      } catch (calendarError: any) {
        console.error('❌ Failed to create Google Calendar event:', {
          error: calendarError.message,
          code: calendarError.code,
          details: calendarError.response?.data
        })
        // Don't fail the appointment creation if calendar fails
      }
    }

    // Create appointment linked to the client (using client's correct data)
    const appointment = await prisma.appointment.create({
      data: {
        trainerId: trainer.id,
        clientId: client.id, // Always link to client
        clientName: client.name, // Use client's correct name
        clientEmail: client.email, // Use client's correct email
        clientPhone: client.phone, // Use client's correct phone
        datetime: appointmentDate,
        duration,
        status: 'booked',
        sessionPrice: sessionPrice || client.sessionPrice || 180,
        sessionNotes: notes || null,
        googleEventId
      }
    })

    // Update client's lastSessionDate if this is a future appointment
    if (appointmentDate > new Date()) {
      try {
        await prisma.client.update({
          where: { id: client.id },
          data: { lastSessionDate: appointmentDate }
        })
      } catch (error) {
        console.error('Failed to update client lastSessionDate:', error)
      }
    }

    // Send confirmation emails to both client and trainer
    try {
      const formatDateTime = (date: Date) => {
        return date.toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZone: trainer.timezone || 'Asia/Jerusalem'
        })
      }

      // 1. Send confirmation email to CLIENT
      const confirmationEmail = await resend.emails.send({
        from: `${trainer.user.name || 'Your Trainer'} <onboarding@resend.dev>`,
        to: [client.email], // Use client's correct email
        subject: `Training Session Confirmed - ${formatDateTime(appointmentDate)}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Training Session Confirmed! 💪</h1>
              <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Your appointment has been scheduled</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">Session Details:</h2>
              <p style="margin: 8px 0; color: #555;"><strong>Client:</strong> ${client.name}</p>
              <p style="margin: 8px 0; color: #555;"><strong>Trainer:</strong> ${trainer.user.name || trainer.user.email}</p>
              <p style="margin: 8px 0; color: #555;"><strong>Date & Time:</strong> ${formatDateTime(appointmentDate)}</p>
              <p style="margin: 8px 0; color: #555;"><strong>Duration:</strong> ${duration} minutes</p>
              ${sessionPrice ? `<p style="margin: 8px 0; color: #555;"><strong>Session Price:</strong> ₪${sessionPrice}</p>` : ''}
              ${notes ? `<p style="margin: 8px 0; color: #555;"><strong>Notes:</strong> ${notes}</p>` : ''}
            </div>
            
            <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6;">
              <h3 style="color: #1e40af; margin: 0 0 10px 0; font-size: 16px;">What's Next:</h3>
              <ul style="color: #374151; margin: 0; padding-left: 20px;">
                <li>This appointment has been added to your trainer's calendar</li>
                <li>You'll receive a calendar invitation if your trainer uses Google Calendar</li>
                <li>Please arrive 5 minutes early for your session</li>
                <li>Contact your trainer if you need to reschedule</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                Questions? Reply to this email or contact ${trainer.user.name || 'your trainer'} directly.
              </p>
              <p style="color: #6b7280; font-size: 12px; margin: 10px 0 0 0;">
                This confirmation was sent from your trainer's booking system
              </p>
            </div>
          </div>
        `
      })

      console.log('✅ Client confirmation email sent:', confirmationEmail.data?.id)

      // 2. Send notification email to TRAINER
      const trainerNotificationEmail = await resend.emails.send({
        from: 'Fitness Booking System <onboarding@resend.dev>',
        to: [trainer.user.email], // Send to the actual trainer's email
        subject: `🆕 New Booking: ${client.name} - ${formatDateTime(appointmentDate)}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
              <h1 style="color: white; margin: 0; font-size: 24px;">🎉 New Training Session Booked!</h1>
              <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">You have a new client appointment</p>
            </div>
            
            <div style="background: #f8fafc; padding: 25px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #3b82f6;">
              <h2 style="color: #1e40af; margin: 0 0 15px 0; font-size: 18px;">📋 Booking Details:</h2>
              <div style="margin: 12px 0; color: #374151;">
                <strong>👤 Client:</strong> ${client.name}
              </div>
              <div style="margin: 12px 0; color: #374151;">
                <strong>📧 Email:</strong> 
                <a href="mailto:${client.email}" style="color: #3b82f6; text-decoration: none; margin-left: 8px;">${client.email}</a>
              </div>
              ${client.phone ? `
                <div style="margin: 12px 0; color: #374151;">
                  <strong>📱 Phone:</strong> 
                  <a href="tel:${client.phone}" style="color: #3b82f6; text-decoration: none; margin-left: 8px;">${client.phone}</a>
                </div>
              ` : ''}
              <div style="margin: 12px 0; color: #374151;">
                <strong>📅 Date & Time:</strong> ${formatDateTime(appointmentDate)}
              </div>
              <div style="margin: 12px 0; color: #374151;">
                <strong>⏱️ Duration:</strong> ${duration} minutes
              </div>
              ${sessionPrice ? `
                <div style="margin: 12px 0; color: #374151;">
                  <strong>💰 Session Price:</strong> ₪${sessionPrice}
                </div>
              ` : ''}
              ${notes ? `
                <div style="margin: 12px 0; color: #374151;">
                  <strong>📝 Notes:</strong> ${notes}
                </div>
              ` : ''}
              <div style="margin: 12px 0; color: #374151;">
                <strong>🆔 Booking ID:</strong> ${appointment.id}
              </div>
            </div>
            
            <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin-bottom: 20px;">
              <h3 style="color: #059669; margin: 0 0 10px 0; font-size: 16px;">💡 Next Steps:</h3>
              <ul style="color: #374151; margin: 0; padding-left: 20px; line-height: 1.6;">
                <li>The client has been sent a confirmation email</li>
                <li>A Google Calendar event has been ${googleEventId ? 'created' : 'attempted (check calendar connection)'}</li>
                <li>Consider reaching out to confirm any special requirements</li>
                <li>The appointment is visible in your dashboard</li>
              </ul>
            </div>
            
            <div style="text-align: center; padding: 20px; background: #f1f5f9; border-radius: 8px;">
              <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard" 
                 style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
                📊 View in Dashboard
              </a>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                This notification was sent from your Fitness Booking System
              </p>
              <p style="color: #6b7280; font-size: 12px; margin: 10px 0 0 0;">
                Booking time: ${new Date().toLocaleString()}
              </p>
            </div>
          </div>
        `
      })

      console.log('✅ Trainer notification email sent:', trainerNotificationEmail.data?.id)

    } catch (emailError) {
      console.error('❌ Failed to send confirmation emails:', emailError)
      // Don't fail the appointment creation if email fails
    }

    console.log('✅ Booking process completed successfully for:', {
      appointmentId: appointment.id,
      clientName: client.name,
      hasGoogleEventId: !!appointment.googleEventId
    })

    return NextResponse.json({
      success: true,
      appointment: {
        id: appointment.id,
        clientId: client.id,
        clientName: client.name, // Return client's correct name
        clientEmail: client.email, // Return client's correct email
        clientPhone: client.phone, // Return client's correct phone
        datetime: appointment.datetime.toISOString(),
        duration: appointment.duration,
        status: appointment.status,
        sessionPrice: appointment.sessionPrice,
        googleEventId: appointment.googleEventId
      },
      message: `Appointment booked successfully for ${client.name}`
    })

  } catch (error) {
    console.error('🚨 BOOKING ERROR - CAUGHT IN MAIN HANDLER 🚨')
    console.error('Booking error:', error)
    console.error('📍 Error timestamp:', new Date().toISOString())
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to book appointment: ' + error.message 
    }, { status: 500 })
  } finally {
    console.log('🚨 BOOKINGS ROUTE COMPLETED 🚨')
  }
}