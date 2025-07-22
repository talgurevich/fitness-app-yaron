// src/app/api/calendar/connect/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getGoogleCalendar } from '@/lib/calendar'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        error: 'Not authenticated',
        needsGoogleAuth: true
      }, { status: 401 })
    }

    // Check if user has Google access token
    if (!session.accessToken) {
      return NextResponse.json({ 
        error: 'No Google access token found. Please login with Google.',
        needsGoogleAuth: true
      }, { status: 400 })
    }

    console.log('Testing calendar connection for:', session.user.email)

    // Test the connection by fetching calendar list
    const calendar = getGoogleCalendar(session.accessToken as string)
    const calendarList = await calendar.calendarList.list()
    
    const calendars = calendarList.data.items?.map(cal => ({
      id: cal.id,
      name: cal.summary,
      primary: cal.primary
    })) || []

    console.log('Successfully connected to Google Calendar. Found', calendars.length, 'calendars')

    return NextResponse.json({ 
      success: true,
      message: 'Successfully connected to Google Calendar',
      calendars: calendars
    })

  } catch (error) {
    console.error('Calendar connection error:', error)
    
    // Check if it's an authentication error
    if (error.message?.includes('invalid_grant') || error.code === 401) {
      return NextResponse.json({ 
        error: 'Google authentication expired. Please logout and login again with Google.',
        needsReauth: true
      }, { status: 401 })
    }

    return NextResponse.json({ 
      error: 'Failed to connect to Google Calendar: ' + error.message,
      details: error.response?.data || error.toString()
    }, { status: 500 })
  }
}