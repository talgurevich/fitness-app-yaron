// SMS Reminder API - Send appointment reminders via Twilio
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import twilio from 'twilio'

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
)

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        success: false, 
        error: 'לא מחובר למערכת' 
      }, { status: 401 })
    }

    const body = await request.json()
    const { appointmentId, message } = body

    console.log('📱 SMS reminder request:', { appointmentId, trainerEmail: session.user.email })

    // Validate Twilio configuration
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
      return NextResponse.json({ 
        success: false, 
        error: 'Twilio configuration missing' 
      }, { status: 500 })
    }

    // Get trainer
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { trainer: true }
    })

    if (!user?.trainer) {
      return NextResponse.json({ 
        success: false, 
        error: 'Trainer profile not found' 
      }, { status: 404 })
    }

    // Get appointment with client details
    const appointment = await prisma.appointment.findUnique({
      where: { 
        id: appointmentId,
        trainerId: user.trainer.id // Ensure appointment belongs to this trainer
      },
      include: {
        client: true
      }
    })

    if (!appointment) {
      return NextResponse.json({ 
        success: false, 
        error: 'הזמנה לא נמצאה' 
      }, { status: 404 })
    }

    // Check if client has a phone number
    if (!appointment.clientPhone && !appointment.client?.phone) {
      return NextResponse.json({ 
        success: false, 
        error: 'ללקוח אין מספר טלפון רשום' 
      }, { status: 400 })
    }

    let clientPhone = appointment.clientPhone || appointment.client?.phone
    
    // Format phone number to E.164 format (add +972 for Israeli numbers)
    if (clientPhone) {
      // Remove any non-digit characters
      clientPhone = clientPhone.replace(/\D/g, '')
      
      // If it starts with 0, replace with +972
      if (clientPhone.startsWith('0')) {
        clientPhone = '+972' + clientPhone.substring(1)
      }
      // If it doesn't start with +, assume it's an Israeli number
      else if (!clientPhone.startsWith('972')) {
        clientPhone = '+972' + clientPhone
      }
      // If it starts with 972, add the +
      else if (clientPhone.startsWith('972')) {
        clientPhone = '+' + clientPhone
      }
    }

    // Format appointment details
    const appointmentDate = new Date(appointment.datetime)
    const formattedDate = appointmentDate.toLocaleDateString('he-IL')
    const formattedTime = appointmentDate.toLocaleTimeString('he-IL', {
      hour: '2-digit',
      minute: '2-digit'
    })

    // Create SMS message
    const smsMessage = message || `היי ${appointment.clientName}! 👋

תזכורת לאימון שלנו:
📅 תאריך: ${formattedDate}
⏰ שעה: ${formattedTime}
⏱️ משך: ${appointment.duration} דקות

נתראה בזמן! 💪

${user.trainer.name}`

    // Send SMS via Twilio
    const twilioResponse = await twilioClient.messages.create({
      body: smsMessage,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: clientPhone
    })

    console.log('✅ SMS sent successfully:', {
      sid: twilioResponse.sid,
      to: clientPhone,
      appointmentId
    })

    // Log the SMS in database (optional - you can add an SMS log table)
    // await prisma.smsLog.create({
    //   data: {
    //     appointmentId,
    //     trainerId: user.trainer.id,
    //     clientPhone,
    //     message: smsMessage,
    //     twilioSid: twilioResponse.sid,
    //     status: 'sent'
    //   }
    // })

    return NextResponse.json({
      success: true,
      message: 'תזכורת SMS נשלחה בהצלחה!',
      twilioSid: twilioResponse.sid
    })

  } catch (error: any) {
    console.error('❌ SMS sending error:', error)
    
    // Handle Twilio-specific errors
    if (error.code) {
      let errorMessage = 'שגיאה בשליחת SMS'
      
      switch (error.code) {
        case 21211:
          errorMessage = 'מספר הטלפון לא תקין'
          break
        case 21608:
          errorMessage = 'המספר לא יכול לקבל SMS'
          break
        case 21614:
          errorMessage = 'מספר טלפון לא תקין'
          break
        default:
          errorMessage = `שגיאת Twilio: ${error.message}`
      }
      
      return NextResponse.json({ 
        success: false, 
        error: errorMessage 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      success: false, 
      error: 'שגיאה בשליחת תזכורת SMS' 
    }, { status: 500 })
  }
}