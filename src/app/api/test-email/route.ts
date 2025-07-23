// src/app/api/test-email/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  console.log('🧪 Testing email functionality...')
  
  try {
    // Check environment variable
    const hasApiKey = !!process.env.RESEND_API_KEY
    const apiKeyLength = process.env.RESEND_API_KEY?.length || 0
    const apiKeyPreview = process.env.RESEND_API_KEY?.substring(0, 10) + '...'
    
    console.log('📊 Environment check:')
    console.log('  - RESEND_API_KEY exists:', hasApiKey)
    console.log('  - API key length:', apiKeyLength)
    console.log('  - API key preview:', apiKeyPreview)
    
    if (!hasApiKey) {
      return NextResponse.json({
        success: false,
        error: 'RESEND_API_KEY not found in environment',
        debug: { hasApiKey, apiKeyLength }
      })
    }

    // Test Resend import and initialization
    console.log('📦 Importing Resend...')
    const { Resend } = await import('resend')
    console.log('✅ Resend imported successfully')
    
    const resend = new Resend(process.env.RESEND_API_KEY)
    console.log('✅ Resend instance created')

    // Test simple email send
    console.log('📤 Sending test email...')
    const result = await resend.emails.send({
      from: 'Test <onboarding@resend.dev>',
      to: ['test@example.com'], // This will show in Resend dashboard even if bounced
      subject: '🧪 Test Email from Fitness Booking App',
      html: `
        <h1>Test Email</h1>
        <p>This is a test email sent at ${new Date().toISOString()}</p>
        <p>If you see this in the Resend dashboard, the integration is working!</p>
      `
    })

    console.log('✅ Email sent successfully:', result)

    return NextResponse.json({
      success: true,
      message: 'Email test completed successfully',
      result: result,
      debug: {
        hasApiKey,
        apiKeyLength,
        apiKeyPreview,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ Email test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      debug: {
        errorType: error.constructor.name,
        stack: error.stack,
        timestamp: new Date().toISOString()
      }
    }, { status: 500 })
  }
}