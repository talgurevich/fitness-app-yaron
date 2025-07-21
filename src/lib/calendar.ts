// src/lib/calendar.ts
import { google } from 'googleapis'

export const getGoogleCalendar = (accessToken: string) => {
  const auth = new google.auth.OAuth2()
  auth.setCredentials({ access_token: accessToken })
  
  return google.calendar({ version: 'v3', auth })
}

export const createCalendarEvent = async (accessToken: string, eventData: {
  summary: string
  description?: string
  start: { dateTime: string; timeZone: string }
  end: { dateTime: string; timeZone: string }
  attendees?: { email: string }[]
}) => {
  try {
    const calendar = getGoogleCalendar(accessToken)
    
    const event = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: eventData
    })
    
    return event.data
  } catch (error) {
    console.error('Error creating calendar event:', error)
    throw error
  }
}

export const getCalendarEvents = async (accessToken: string, timeMin: string, timeMax: string) => {
  try {
    const calendar = getGoogleCalendar(accessToken)
    
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime'
    })
    
    return response.data.items || []
  } catch (error) {
    console.error('Error fetching calendar events:', error)
    throw error
  }
}