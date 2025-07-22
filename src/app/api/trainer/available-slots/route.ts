// src/app/api/trainer/available-slots/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface TimeSlot {
  start: string
  end: string
  isAvailable: boolean
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

    console.log('🔍 Getting available slots for:', { trainerSlug, date })

    // Find trainer by booking slug
    const trainer = await prisma.trainer.findFirst({
      where: { bookingSlug: trainerSlug },
      include: {
        user: true,
        appointments: {
          where: {
            datetime: {
              gte: new Date(date + 'T00:00:00.000Z'),
              lt: new Date(date + 'T23:59:59.999Z')
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

    // Parse trainer's availability settings
    let availability = {}
    let sessionDuration = 60
    let breakBetweenSessions = 15

    if (trainer.workingHours) {
      try {
        const parsed = JSON.parse(trainer.workingHours)
        availability = parsed.availability || {}
        sessionDuration = parsed.sessionDuration || 60
        breakBetweenSessions = parsed.breakBetweenSessions || 15
      } catch (e) {
        console.log('⚠️ Error parsing workingHours, using defaults')
      }
    }

    // Default availability if none set
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

    // Get day of week
    const selectedDate = new Date(date)
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const dayOfWeek = days[selectedDate.getDay()]

    const dayAvailability = availability[dayOfWeek] as TimeSlot[]

    if (!dayAvailability || dayAvailability.length === 0 || !dayAvailability[0].isAvailable) {
      return NextResponse.json({
        success: true,
        availableSlots: [],
        trainerName: trainer.user.name || trainer.user.email
      })
    }

    // Generate all possible time slots
    const allSlots: string[] = []
    
    for (const period of dayAvailability) {
      if (!period.isAvailable) continue
      
      const [startHour, startMinute] = period.start.split(':').map(Number)
      const [endHour, endMinute] = period.end.split(':').map(Number)
      
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
    }

    // Filter out booked slots
    const bookedTimes = trainer.appointments.map(apt => 
      new Date(apt.datetime).toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    )

    const availableSlots = allSlots.filter(slot => !bookedTimes.includes(slot))

    console.log('📊 Generated slots:', {
      totalSlots: allSlots.length,
      bookedSlots: bookedTimes.length,
      availableSlots: availableSlots.length
    })

    return NextResponse.json({
      success: true,
      availableSlots,
      trainerName: trainer.user.name || trainer.user.email,
      sessionDuration,
      dayAvailability: dayAvailability
    })

  } catch (error) {
    console.error('❌ Error getting available slots:', error)
    return NextResponse.json({ 
      error: 'Failed to get available slots: ' + error.message,
      availableSlots: []
    }, { status: 500 })
  }
}