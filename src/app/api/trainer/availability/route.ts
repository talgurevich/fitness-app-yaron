// src/app/api/trainer/availability/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'

// This would typically use your database
// For now, we'll simulate with a simple storage mechanism
// You should replace this with your actual database implementation

interface TimeSlot {
  start: string
  end: string
  isAvailable: boolean
}

interface DayAvailability {
  [key: string]: TimeSlot[]
}

interface AvailabilityData {
  availability: DayAvailability
  sessionDuration: number
  breakBetweenSessions: number
  updatedAt: string
}

// Temporary in-memory storage - replace with your database
const availabilityStore = new Map<string, AvailabilityData>()

// GET - Fetch trainer's availability settings
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        success: false, 
        error: 'לא מחובר למערכת' 
      }, { status: 401 })
    }

    const trainerEmail = session.user.email
    const availabilityData = availabilityStore.get(trainerEmail)

    if (!availabilityData) {
      // Return default availability if none exists
      const defaultAvailability: AvailabilityData = {
        availability: {
          sunday: [{ start: '09:00', end: '17:00', isAvailable: true }],
          monday: [{ start: '09:00', end: '17:00', isAvailable: true }],
          tuesday: [{ start: '09:00', end: '17:00', isAvailable: true }],
          wednesday: [{ start: '09:00', end: '17:00', isAvailable: true }],
          thursday: [{ start: '09:00', end: '17:00', isAvailable: true }],
          friday: [{ start: '09:00', end: '13:00', isAvailable: true }],
          saturday: [{ start: '10:00', end: '14:00', isAvailable: false }]
        },
        sessionDuration: 60,
        breakBetweenSessions: 15,
        updatedAt: new Date().toISOString()
      }

      return NextResponse.json({
        success: true,
        ...defaultAvailability
      })
    }

    return NextResponse.json({
      success: true,
      ...availabilityData
    })

  } catch (error) {
    console.error('Error fetching availability:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'שגיאה בטעינת הגדרות הזמינות' 
    }, { status: 500 })
  }
}

// POST - Save trainer's availability settings
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
    const { availability, sessionDuration, breakBetweenSessions } = body

    // Validate the data
    if (!availability || typeof sessionDuration !== 'number' || typeof breakBetweenSessions !== 'number') {
      return NextResponse.json({ 
        success: false, 
        error: 'נתונים לא תקינים' 
      }, { status: 400 })
    }

    // Validate time slots
    for (const [day, slots] of Object.entries(availability)) {
      if (!Array.isArray(slots)) {
        return NextResponse.json({ 
          success: false, 
          error: `נתוני יום ${day} לא תקינים` 
        }, { status: 400 })
      }

      for (const slot of slots as TimeSlot[]) {
        if (!slot.start || !slot.end || typeof slot.isAvailable !== 'boolean') {
          return NextResponse.json({ 
            success: false, 
            error: `נתוני שעות ביום ${day} לא תקינים` 
          }, { status: 400 })
        }

        // Validate time format (HH:MM)
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
        if (!timeRegex.test(slot.start) || !timeRegex.test(slot.end)) {
          return NextResponse.json({ 
            success: false, 
            error: `פורמט השעות ביום ${day} לא תקין` 
          }, { status: 400 })
        }

        // Validate that end time is after start time
        if (slot.start >= slot.end) {
          return NextResponse.json({ 
            success: false, 
            error: `שעת הסיום חייבת להיות אחרי שעת ההתחלה ביום ${day}` 
          }, { status: 400 })
        }
      }
    }

    const trainerEmail = session.user.email
    const availabilityData: AvailabilityData = {
      availability,
      sessionDuration,
      breakBetweenSessions,
      updatedAt: new Date().toISOString()
    }

    // Save to temporary storage - replace with your database
    availabilityStore.set(trainerEmail, availabilityData)

    /* 
    // Example of how you might save to a real database:
    
    await db.trainerAvailability.upsert({
      where: { trainerEmail },
      update: availabilityData,
      create: {
        trainerEmail,
        ...availabilityData
      }
    })
    */

    return NextResponse.json({
      success: true,
      message: 'הגדרות הזמינות נשמרו בהצלחה'
    })

  } catch (error) {
    console.error('Error saving availability:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'שגיאה בשמירת הגדרות הזמינות' 
    }, { status: 500 })
  }
}

// Helper function to generate available time slots for a specific day
export function generateAvailableSlots(
  dayAvailability: TimeSlot[], 
  sessionDuration: number, 
  breakBetweenSessions: number,
  date: Date
): string[] {
  const slots: string[] = []
  
  for (const period of dayAvailability) {
    if (!period.isAvailable) continue
    
    const [startHour, startMinute] = period.start.split(':').map(Number)
    const [endHour, endMinute] = period.end.split(':').map(Number)
    
    const startTime = startHour * 60 + startMinute // Convert to minutes
    const endTime = endHour * 60 + endMinute
    
    let currentTime = startTime
    const slotDuration = sessionDuration + breakBetweenSessions
    
    while (currentTime + sessionDuration <= endTime) {
      const hours = Math.floor(currentTime / 60)
      const minutes = currentTime % 60
      const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
      slots.push(timeString)
      currentTime += slotDuration
    }
  }
  
  return slots
}