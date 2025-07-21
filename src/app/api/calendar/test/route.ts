// src/app/api/calendar/test/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getGoogleCalendar, createCalendarEvent } from '@/lib/calendar'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email || !session.accessToken) {
      return NextResponse.json({ 
        error: 'Unauthorized or no access token. Please login with Google.' 
      }, { status: 401 })
    }

    console.log('Testing calendar with access token for:', session.user.email)

    // First, let's see what calendars are available
    const calendar = getGoogleCalendar(session.accessToken as string)
    const calendarList = await calendar.calendarList.list()
    
    console.log('Available calendars:', calendarList.data.items?.map(cal => ({
      id: cal.id,
      summary: cal.summary,
      primary: cal.primary
    })))

    // Create a test event for tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(14, 0, 0, 0) // 2 PM

    const endTime = new Date(tomorrow)
    endTime.setHours(15, 0, 0, 0) // 3 PM

    const eventData = {
      summary: '🏋️ בדיקת חיבור יומן - Fitness Booking App',
      description: 'זהו אירוע בדיקה ליישום הזמנות המאמן\nאם אתה רואה את זה, החיבור עובד!',
      start: {
        dateTime: tomorrow.toISOString(),
        timeZone: 'Asia/Jerusalem'
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'Asia/Jerusalem'
      }
    }

    console.log('Creating test event:', eventData)

    const calendarEvent = await createCalendarEvent(
      session.accessToken as string,
      eventData
    )

    console.log('Test event created successfully:', {
      id: calendarEvent.id,
      htmlLink: calendarEvent.htmlLink,
      status: calendarEvent.status,
      created: calendarEvent.created
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Test event created successfully!',
      eventId: calendarEvent.id,
      eventLink: calendarEvent.htmlLink,
      eventDate: tomorrow.toLocaleDateString('he-IL'),
      eventTime: '14:00-15:00',
      calendars: calendarList.data.items?.map(cal => ({
        id: cal.id,
        name: cal.summary,
        primary: cal.primary
      }))
    })

  } catch (error) {
    console.error('Calendar test error:', error)
    return NextResponse.json({ 
      error: 'Calendar test failed: ' + error.message,
      details: error.response?.data || error.toString()
    }, { status: 500 })
  }
}