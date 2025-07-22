// src/lib/calendar.ts
import { google } from 'googleapis'

export const getGoogleCalendar = (accessToken: string) => {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  )
  auth.setCredentials({ access_token: accessToken })
  
  return google.calendar({ version: 'v3', auth })
}

export const createCalendarEvent = async (accessToken: string, eventData: {
  summary: string
  description?: string
  start: { dateTime: string; timeZone: string }
  end: { dateTime: string; timeZone: string }
  attendees?: { email: string; responseStatus?: string }[]
  reminders?: {
    useDefault: boolean
    overrides?: { method: string; minutes: number }[]
  }
}) => {
  try {
    console.log('🗓️ Creating calendar event:', eventData.summary)
    
    const calendar = getGoogleCalendar(accessToken)
    
    const event = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        ...eventData,
        // Ensure attendees get email invitations
        sendUpdates: 'all',
        // Set event status
        status: 'confirmed'
      }
    })
    
    console.log('✅ Calendar event created successfully:', {
      id: event.data.id,
      htmlLink: event.data.htmlLink,
      status: event.data.status
    })
    
    return event.data
  } catch (error) {
    console.error('❌ Error creating calendar event:', error)
    
    // More detailed error logging
    if (error.response) {
      console.error('API Error Response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      })
    }
    
    throw error
  }
}

export const getCalendarEvents = async (accessToken: string, timeMin: string, timeMax: string) => {
  try {
    console.log('📅 Fetching calendar events from', timeMin, 'to', timeMax)
    
    const calendar = getGoogleCalendar(accessToken)
    
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime'
    })
    
    console.log('📋 Found', response.data.items?.length || 0, 'calendar events')
    
    return response.data.items || []
  } catch (error) {
    console.error('❌ Error fetching calendar events:', error)
    throw error
  }
}

export const deleteCalendarEvent = async (accessToken: string, eventId: string) => {
  try {
    console.log('🗑️ Deleting calendar event:', eventId)
    
    const calendar = getGoogleCalendar(accessToken)
    
    await calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId,
      sendUpdates: 'all' // Notify attendees about cancellation
    })
    
    console.log('✅ Calendar event deleted successfully')
    
    return true
  } catch (error) {
    console.error('❌ Error deleting calendar event:', error)
    throw error
  }
}