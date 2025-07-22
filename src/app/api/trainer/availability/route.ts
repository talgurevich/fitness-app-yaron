// src/app/api/trainer/availability/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth' // Fixed import path
import { prisma } from '@/lib/prisma'

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

// GET - Fetch trainer's availability settings (for authenticated trainer)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        success: false, 
        error: 'לא מחובר למערכת' 
      }, { status: 401 })
    }

    console.log('📅 Fetching availability for:', session.user.email)

    // Get trainer from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        trainer: true
      }
    })

    if (!user?.trainer) {
      console.log('⚠️ No trainer profile found for:', session.user.email)
      // Return default availability if no trainer profile exists
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

    // Parse stored availability or use defaults
    let availability = {}
    let sessionDuration = 60
    let breakBetweenSessions = 15

    if (user.trainer.workingHours) {
      try {
        const parsed = JSON.parse(user.trainer.workingHours)
        availability = parsed.availability || {}
        sessionDuration = parsed.sessionDuration || 60
        breakBetweenSessions = parsed.breakBetweenSessions || 15
      } catch (e) {
        console.log('Error parsing workingHours, using defaults')
      }
    }

    // If no stored availability, use defaults
    if (Object.keys(availability).length === 0) {
      availability = {
        sunday: [{ start: '09:00', end: '17:00', isAvailable: true }],
        monday: [{ start: '09:00', end: '17:00', isAvailable: true }],
        tuesday: [{ start: '09:00', end: '17:00', isAvailable: true }],
        wednesday: [{ start: '09:00', end: '17:00', isAvailable: true }],
        thursday: [{ start: '09:00', end: '17:00', isAvailable: true }],
        friday: [{ start: '09:00', end: '13:00', isAvailable: true }],
        saturday: [{ start: '10:00', end: '14:00', isAvailable: false }]
      }
    }

    console.log('✅ Successfully fetched availability')

    return NextResponse.json({
      success: true,
      availability,
      sessionDuration,
      breakBetweenSessions,
      updatedAt: user.trainer.updatedAt.toISOString()
    })

  } catch (error) {
    console.error('❌ Error fetching availability:', error)
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

    console.log('💾 Saving availability for:', session.user.email)

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

    // Find or create trainer
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { trainer: true }
    })

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'משתמש לא נמצא' 
      }, { status: 404 })
    }

    // Store availability in JSON format
    const availabilityData = {
      availability,
      sessionDuration,
      breakBetweenSessions,
      updatedAt: new Date().toISOString()
    }

    // Update trainer record
    await prisma.trainer.upsert({
      where: { userId: user.id },
      update: {
        workingHours: JSON.stringify(availabilityData)
      },
      create: {
        userId: user.id,
        bookingSlug: session.user.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '-'),
        workingHours: JSON.stringify(availabilityData),
        timezone: 'Asia/Jerusalem'
      }
    })

    console.log('✅ Availability saved successfully')

    return NextResponse.json({
      success: true,
      message: 'הגדרות הזמינות נשמרו בהצלחה'
    })

  } catch (error) {
    console.error('❌ Error saving availability:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'שגיאה בשמירת הגדרות הזמינות' 
    }, { status: 500 })
  }
}