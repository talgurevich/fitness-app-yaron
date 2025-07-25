// src/app/api/contact/route.ts - Using exact same pattern as working booking emails
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone } = await request.json()

    // Validate required fields (same as booking system)
    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'Name, email, and phone are required' },
        { status: 400 }
      )
    }

    // Validate email format (same as booking system)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Log the contact request (same pattern as booking)
    console.log('📧 New contact form submission:', {
      name,
      email, 
      phone,
      timestamp: new Date().toISOString()
    })

    // Send notification email to trainer (EXACT same pattern as booking system)
    try {
      const contactNotificationEmail = await resend.emails.send({
        from: 'Fitness Booking System <onboarding@resend.dev>', // Exact same as booking
        to: ['tal.gurevich2@gmail.com'], // Same as working booking system
        subject: `📞 New Contact Form Submission from ${name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
              <h1 style="color: white; margin: 0; font-size: 24px;">📞 New Contact Form Submission!</h1>
              <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Someone is interested in your fitness booking system</p>
            </div>
            
            <div style="background: #f8fafc; padding: 25px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #3b82f6;">
              <h2 style="color: #1e40af; margin: 0 0 15px 0; font-size: 18px;">📋 Contact Details:</h2>
              <div style="margin: 12px 0; color: #374151;">
                <strong>👤 Name:</strong> ${name}
              </div>
              <div style="margin: 12px 0; color: #374151;">
                <strong>📧 Email:</strong> 
                <a href="mailto:${email}" style="color: #3b82f6; text-decoration: none; margin-left: 8px;">${email}</a>
              </div>
              <div style="margin: 12px 0; color: #374151;">
                <strong>📱 Phone:</strong> 
                <a href="tel:${phone}" style="color: #3b82f6; text-decoration: none; margin-left: 8px;">${phone}</a>
              </div>
              <div style="margin: 12px 0; color: #374151;">
                <strong>⏰ Submitted:</strong> ${new Date().toLocaleString()}
              </div>
            </div>
            
            <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin-bottom: 20px;">
              <h3 style="color: #059669; margin: 0 0 10px 0; font-size: 16px;">💡 Next Steps:</h3>
              <ul style="color: #374151; margin: 0; padding-left: 20px; line-height: 1.6;">
                <li>Someone is interested in your fitness booking system</li>
                <li>Consider reaching out within 24 hours for best response rate</li>
                <li>They may want to know about features, pricing, or setup</li>
                <li>This could be a potential new trainer client</li>
              </ul>
            </div>
            
            <div style="text-align: center; padding: 20px; background: #f1f5f9; border-radius: 8px;">
              <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard" 
                 style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
                📊 View Dashboard
              </a>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                This notification was sent from your Fitness Booking System contact form
              </p>
              <p style="color: #6b7280; font-size: 12px; margin: 10px 0 0 0;">
                Contact form submission time: ${new Date().toLocaleString()}
              </p>
            </div>
          </div>
        `
      })

      console.log('✅ Contact notification email sent successfully!')
      console.log('📧 Email response:', contactNotificationEmail)
      console.log('📧 Email ID:', contactNotificationEmail.data?.id || 'No ID returned')

    } catch (emailError) {
      console.error('❌ Failed to send contact notification email:', emailError)
      // Don't fail the whole request if email fails, just log it
    }
    
    return NextResponse.json(
      { 
        message: 'Contact form submitted successfully',
        data: { name, email, phone }
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to submit contact form' },
      { status: 500 }
    )
  }
}