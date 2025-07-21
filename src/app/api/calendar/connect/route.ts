// src/app/api/calendar/connect/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getGoogleCalendar } from '@/lib/calendar'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has access token (signed in with Google)
    if (!session.accessToken) {
      return NextResponse.json({ 
        error: 'לא נמצא טוקן גישה. אנא התחבר עם Google כדי לגשת ליומן',
        needsGoogleAuth: true 
      }, { status: 400 })
    }

    try {
      // Test the calendar connection by fetching calendar list
      const calendar = getGoogleCalendar(session.accessToken as string)
      const calendarList = await calendar.calendarList.list()

      return NextResponse.json({ 
        success: true, 
        message: 'Google Calendar connected successfully',
        calendars: calendarList.data.items?.map(cal => ({
          id: cal.id,
          summary: cal.summary
        })) || []
      })

    } catch (calendarError) {
      console.error('Calendar API error:', calendarError)
      return NextResponse.json({ 
        error: 'שגיאה בגישה ליומן Google. ייתכן שצריך להעניק הרשאות מחדש.',
        needsReauth: true 
      }, { status: 403 })
    }

  } catch (error) {
    console.error('Calendar connection error:', error)
    return NextResponse.json({ 
      error: 'Failed to connect to Google Calendar',
      success: false 
    }, { status: 500 })
  }
}