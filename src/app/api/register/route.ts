// src/app/api/register/route.ts
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { name, email, phone } = await request.json()

    // Validate required fields
    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Send notification email to you (the admin)
    const adminNotification = await resend.emails.send({
      from: 'FitnessPro Registration <noreply@trainer-booking.com>',
      to: ['tal.gurevich2@gmail.com'], // Your email
      subject: '🚀 New Trainer Registration Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0; font-size: 24px;">New Trainer Registration!</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Someone wants to join FitnessPro</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">Contact Details:</h2>
            <p style="margin: 8px 0; color: #555;"><strong>Name:</strong> ${name}</p>
            <p style="margin: 8px 0; color: #555;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 8px 0; color: #555;"><strong>Phone:</strong> ${phone}</p>
          </div>
          
          <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6;">
            <h3 style="color: #1e40af; margin: 0 0 10px 0; font-size: 16px;">Next Steps:</h3>
            <ul style="color: #374151; margin: 0; padding-left: 20px;">
              <li>Contact them within 24 hours</li>
              <li>Explain the FitnessPro system features</li>
              <li>Help them set up their trainer profile</li>
              <li>Guide them through Google Calendar integration</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              This email was sent from your FitnessPro registration form
            </p>
          </div>
        </div>
      `
    })

    // Send welcome email to the potential trainer
    const welcomeEmail = await resend.emails.send({
      from: 'FitnessPro Team <hello@trainer-booking.com>',
      to: [email],
      subject: 'ברוכים הבאים ל-FitnessPro! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; direction: rtl;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0; font-size: 24px;">ברוכים הבאים ל-FitnessPro!</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">תודה על ההתעניינות במערכת שלנו</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">שלום ${name}!</h2>
            <p style="color: #555; line-height: 1.6; margin: 0;">
              תודה שהשארתם פרטים להצטרפות ל-FitnessPro. אנחנו נחזור אליכם תוך 24 שעות עם כל המידע על המערכת וכיצד היא יכולה לעזור לכם לנהל את העסק שלכם בצורה יעילה יותר.
            </p>
          </div>
          
          <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6;">
            <h3 style="color: #1e40af; margin: 0 0 10px 0; font-size: 16px;">במה FitnessPro יעזור לכם:</h3>
            <ul style="color: #374151; margin: 0; padding-left: 20px;">
              <li>ניהול הזמנות אוטומטי עם חיבור ליומן Google</li>
              <li>קישור אישי לקבלת הזמנות מלקוחות</li>
              <li>מעקב מקצועי אחר כל הלקוחות וההכנסות</li>
              <li>חסכון של שעות עבודה מיותרות בשבוע</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 25px;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              יש שאלות? תכתבו לנו ב: <a href="mailto:hello@trainer-booking.com" style="color: #3b82f6;">hello@trainer-booking.com</a>
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              FitnessPro - מערכת הזמנות מתקדמת למאמני כושר
            </p>
          </div>
        </div>
      `
    })

    console.log('Admin notification sent:', adminNotification.data?.id)
    console.log('Welcome email sent:', welcomeEmail.data?.id)

    return NextResponse.json({ 
      success: true, 
      message: 'Registration successful' 
    })

  } catch (error) {
    console.error('Registration error:', error)
    
    return NextResponse.json(
      { error: 'Failed to process registration' },
      { status: 500 }
    )
  }
}