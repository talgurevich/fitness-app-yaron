// src/app/api/calendar/test/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getGoogleCalendar } from '@/lib/calendar'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('🗓️ Testing calendar connection...')
    
    // Check if user is authenticated
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        success: false, 
        error: 'Not authenticated' 
      }, { status: 401 })
    }

    console.log('🔍 Session debug:', {
      email: session.user.email,
      hasAccessToken: !!session.accessToken,
      tokenLength: session.accessToken?.length || 0,
      tokenPrefix: session.accessToken?.substring(0, 20) + '...' || 'none',
      sessionError: session.error
    })

    // Check for session errors (like token refresh failures)
    if (session.error) {
      return NextResponse.json({ 
        success: false, 
        error: `Session error: ${session.error}. Please logout and login again.` 
      }, { status: 401 })
    }

    // Check if user has access token for Google Calendar
    if (!session.accessToken) {
      return NextResponse.json({ 
        success: false, 
        error: 'No Google Calendar access. Please logout and login again to grant calendar permissions.' 
      }, { status: 400 })
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
      return NextResponse.json({ 
        success: false, 
        error: 'Trainer profile not found' 
      }, { status: 404 })
    }

    // Test Google Calendar connection
    try {
      console.log('🔧 Creating Google Calendar client...')
      const calendar = getGoogleCalendar(session.accessToken as string)
      
      console.log('📡 Testing calendar list API call...')
      
      // Simple test: Get calendar list
      const calendarList = await calendar.calendarList.list({
        maxResults: 5
      })

      console.log('✅ Calendar list successful:', {
        calendarsFound: calendarList.data.items?.length || 0,
        primaryCalendar: calendarList.data.items?.find(cal => cal.primary)?.summary
      })

      // If we get here, the connection works - let's try a simple event test
      const testEventStart = new Date()
      testEventStart.setMinutes(testEventStart.getMinutes() + 1) // 1 minute from now
      
      const testEventEnd = new Date(testEventStart.getTime() + (5 * 60 * 1000)) // 5 minutes duration

      console.log('📝 Testing event creation...')
      
      const testEvent = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: {
          summary: 'Calendar Test - DO NOT BOOK',
          description: 'This is an automated test event. It will be deleted immediately.',
          start: {
            dateTime: testEventStart.toISOString(),
            timeZone: trainer.timezone || 'Asia/Jerusalem'
          },
          end: {
            dateTime: testEventEnd.toISOString(),
            timeZone: trainer.timezone || 'Asia/Jerusalem'
          },
          transparency: 'transparent' // Show as free time
        }
      })

      // Immediately delete the test event
      if (testEvent.data.id) {
        await calendar.events.delete({
          calendarId: 'primary',
          eventId: testEvent.data.id
        })
        console.log('✅ Test event created and deleted successfully')
      }

      return NextResponse.json({
        success: true,
        message: 'Calendar connection successful!',
        details: {
          calendarsFound: calendarList.data.items?.length || 0,
          primaryCalendar: calendarList.data.items?.find(cal => cal.primary)?.summary || 'Unknown',
          timezone: trainer.timezone || 'Asia/Jerusalem',
          testEventCreated: !!testEvent.data.id,
          tokenWorking: true
        }
      })

    } catch (calendarError: any) {
      console.error('❌ Calendar API error:', {
        message: calendarError.message,
        code: calendarError.code,
        status: calendarError.status,
        response: calendarError.response?.data
      })
      
      // Handle specific Google Calendar API errors
      if (calendarError.code === 401 || calendarError.status === 401) {
        return NextResponse.json({ 
          success: false, 
          error: 'Google Calendar access expired or invalid. Please logout and login again to refresh permissions.' 
        }, { status: 401 })
      }
      
      if (calendarError.code === 403 || calendarError.status === 403) {
        return NextResponse.json({ 
          success: false, 
          error: 'Calendar access denied. Please logout and login again, and make sure to grant calendar permissions.' 
        }, { status: 403 })
      }

      if (calendarError.message?.includes('Rate Limit') || calendarError.message?.includes('quota')) {
        return NextResponse.json({ 
          success: false, 
          error: 'Calendar API rate limit reached. Please try again in a few moments.' 
        }, { status: 429 })
      }

      return NextResponse.json({ 
        success: false, 
        error: `Calendar API error: ${calendarError.message || 'Unknown error'}. Please logout and login again.` 
      }, { status: 400 })
    }

  } catch (error: any) {
    console.error('❌ Calendar test error:', error)
    return NextResponse.json({ 
      success: false, 
      error: `Test failed: ${error.message || 'Unknown error'}` 
    }, { status: 500 })
  }
}

// Also support POST method for the button
export async function POST(request: NextRequest) {
  return GET(request)
}