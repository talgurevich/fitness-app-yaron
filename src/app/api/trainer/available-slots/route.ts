// src/app/api/trainer/available-slots/route.ts - FIXED VERSION
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface TimeSlot {
  start: string
  end: string
  isAvailable: boolean
}

interface WorkingHoursDay {
  enabled: boolean
  start: string
  end: string
}

// GET - Get available time slots for a specific trainer and date (PUBLIC)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const trainerSlug = searchParams.get('trainerSlug')
    const date = searchParams.get('date')

    if (!trainerSlug || !date) {
      return NextResponse.json({ 
        error: 'trainerSlug and date are required' 
      }, { status: 400 })
    }

    console.log('🔍 Getting available slots for:', { 
      trainerSlug, 
      date,
      startOfDayIsrael: new Date(date + 'T00:00:00+03:00').toISOString(),
      endOfDayIsrael: new Date(date + 'T23:59:59+03:00').toISOString()
    })

    // Find trainer by booking slug
    const trainer = await prisma.trainer.findFirst({
      where: { bookingSlug: trainerSlug },
      include: {
        user: true,
        appointments: {
          where: {
            datetime: {
              // Fix: Use Israel timezone for date boundaries
              gte: new Date(date + 'T00:00:00+03:00'), // Start of day in Israel
              lt: new Date(date + 'T23:59:59+03:00')   // End of day in Israel
            },
            status: {
              not: 'cancelled' // Only consider non-cancelled appointments
            }
          }
        }
      }
    })

    if (!trainer) {
      return NextResponse.json({ 
        error: 'Trainer not found',
        availableSlots: []
      }, { status: 404 })
    }

    // Parse trainer's settings
    let workingHours: Record<string, WorkingHoursDay> = {}
    let sessionDuration = 60
    let breakBetweenSessions = 15

    if (trainer.workingHours) {
      try {
        const parsed = JSON.parse(trainer.workingHours)
        
        // Handle both old and new formats
        if (parsed.availability) {
          // Old format: convert from availability array to working hours object
          for (const [day, slots] of Object.entries(parsed.availability)) {
            const daySlots = slots as TimeSlot[]
            if (daySlots && daySlots.length > 0) {
              workingHours[day] = {
                enabled: daySlots[0].isAvailable,
                start: daySlots[0].start,
                end: daySlots[0].end
              }
            }
          }
          sessionDuration = parsed.sessionDuration || 60
          breakBetweenSessions = parsed.breakBetweenSessions || 15
        } else {
          // New format: direct working hours object
          workingHours = parsed
        }
      } catch (e) {
        console.log('⚠️ Error parsing workingHours, using defaults')
      }
    }

    // Default working hours if none set
    if (Object.keys(workingHours).length === 0) {
      workingHours = {
        sunday: { enabled: false, start: '09:00', end: '17:00' },
        monday: { enabled: true, start: '09:00', end: '17:00' },
        tuesday: { enabled: true, start: '09:00', end: '17:00' },
        wednesday: { enabled: true, start: '09:00', end: '17:00' },
        thursday: { enabled: true, start: '09:00', end: '17:00' },
        friday: { enabled: false, start: '09:00', end: '14:00' },
        saturday: { enabled: false, start: '10:00', end: '16:00' }
      }
    }

    // Get day of week
    const selectedDate = new Date(date)
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const dayOfWeek = days[selectedDate.getDay()]

    const daySchedule = workingHours[dayOfWeek]

    if (!daySchedule || !daySchedule.enabled) {
      return NextResponse.json({
        success: true,
        availableSlots: [],
        trainerName: trainer.user.name || trainer.user.email
      })
    }

    // Generate all possible time slots
    const allSlots: string[] = []
    
    const [startHour, startMinute] = daySchedule.start.split(':').map(Number)
    const [endHour, endMinute] = daySchedule.end.split(':').map(Number)
    
    const startTime = startHour * 60 + startMinute
    const endTime = endHour * 60 + endMinute
    
    let currentTime = startTime
    const slotDuration = sessionDuration + breakBetweenSessions
    
    while (currentTime + sessionDuration <= endTime) {
      const hours = Math.floor(currentTime / 60)
      const minutes = currentTime % 60
      const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
      allSlots.push(timeString)
      currentTime += slotDuration
    }

    // FIXED: Convert booked appointments to time strings with proper timezone handling
    const trainerTimezone = trainer.timezone || 'Asia/Jerusalem'
    const bookedTimes = trainer.appointments.map(apt => {
      // Convert the appointment datetime to the trainer's timezone
      const appointmentDate = new Date(apt.datetime)
      
      // Format in trainer's timezone
      return appointmentDate.toLocaleTimeString('en-GB', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: trainerTimezone
      })
    })

    console.log('📅 Debug info:', {
      selectedDate: selectedDate.toISOString(),
      israelDate: selectedDate.toLocaleDateString('he-IL', { timeZone: 'Asia/Jerusalem' }),
      dayOfWeek,
      daySchedule,
      appointments: trainer.appointments.map(apt => ({
        datetime: apt.datetime.toISOString(),
        israelDateTime: new Date(apt.datetime).toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' }),
        formattedTime: new Date(apt.datetime).toLocaleTimeString('en-GB', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit',
          timeZone: trainerTimezone
        })
      })),
      bookedTimes,
      allSlots
    })

    // Filter out booked slots
    const availableSlots = allSlots.filter(slot => !bookedTimes.includes(slot))

    console.log('📊 Generated slots:', {
      totalSlots: allSlots.length,
      bookedSlots: bookedTimes.length,
      availableSlots: availableSlots.length,
      bookedTimes
    })

    return NextResponse.json({
      success: true,
      availableSlots,
      trainerName: trainer.user.name || trainer.user.email,
      sessionDuration,
      daySchedule
    })

  } catch (error) {
    console.error('❌ Error getting available slots:', error)
    return NextResponse.json({ 
      error: 'Failed to get available slots: ' + error.message,
      availableSlots: []
    }, { status: 500 })
  }
}