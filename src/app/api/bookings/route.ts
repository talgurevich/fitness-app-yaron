// src/app/api/bookings/route.ts - Fixed to prevent duplicate clients by email
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getGoogleCalendar } from '@/lib/calendar'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Get trainer info
    const trainer = await prisma.trainer.findFirst({
      where: {
        user: {
          email: session.user.email
        }
      },
      include: {
        user: true
      }
    })

    if (!trainer) {
      return NextResponse.json({ success: false, error: 'Trainer not found' }, { status: 404 })
    }

    const body = await request.json()
    const { 
      clientId, 
      clientName, 
      clientEmail, 
      datetime, 
      duration = 60, 
      sessionPrice, 
      notes,
      clientPhone 
    } = body

    // Validate required fields
    if (!clientName || !clientEmail || !datetime) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: clientName, clientEmail, datetime' 
      }, { status: 400 })
    }

    const appointmentDate = new Date(datetime)

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
    if (session.accessToken && trainer.googleCalendarId) {
      try {
        const calendar = getGoogleCalendar(session.accessToken as string)
        
        const endTime = new Date(appointmentDate.getTime() + (duration * 60 * 1000))
        
        const event = await calendar.events.insert({
          calendarId: 'primary',
          requestBody: {
            summary: `Training Session - ${client.name}`, // Use client's correct name
            description: `Fitness training session with ${client.name}${notes ? `\n\nNotes: ${notes}` : ''}`,
            start: {
              dateTime: appointmentDate.toISOString(),
              timeZone: trainer.timezone || 'Asia/Jerusalem'
            },
            end: {
              dateTime: endTime.toISOString(),
              timeZone: trainer.timezone || 'Asia/Jerusalem'
            },
            attendees: [
              { email: client.email, displayName: client.name }
            ]
          }
        })
        
        googleEventId = event.data.id
        console.log('Google Calendar event created:', googleEventId)
      } catch (calendarError) {
        console.error('Failed to create Google Calendar event:', calendarError)
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

    // Send confirmation email to client (using client's correct info)
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

      const confirmationEmail = await resend.emails.send({
        from: `${trainer.user.name || 'Your Trainer'} <booking@trainer-booking.com>`,
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

      console.log('Confirmation email sent:', confirmationEmail.data?.id)
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError)
      // Don't fail the appointment creation if email fails
    }

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
    console.error('Booking error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to book appointment: ' + error.message 
    }, { status: 500 })
  }
}