import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Verify MCP API key
    const apiKey = request.headers.get('X-API-Key')
    if (apiKey !== process.env.APP_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const trainerSlug = searchParams.get('trainer_slug')
    const date = searchParams.get('date')

    if (!trainerSlug) {
      return NextResponse.json({ error: 'trainer_slug is required' }, { status: 400 })
    }

    // Use the existing available-slots endpoint logic
    const trainer = await prisma.trainer.findFirst({
      where: { bookingSlug: trainerSlug },
      include: {
        user: true,
        appointments: date ? {
          where: {
            datetime: {
              gte: new Date(date + 'T00:00:00+03:00'),
              lt: new Date(date + 'T23:59:59+03:00')
            },
            status: {
              not: 'cancelled'
            }
          }
        } : undefined
      }
    })

    if (!trainer) {
      return NextResponse.json({ 
        success: false, 
        error: 'Trainer not found' 
      }, { status: 404 })
    }

    // Parse trainer's working hours
    let workingHours: Record<string, any> = {}
    let sessionDuration = 60
    let breakBetweenSessions = 15

    if (trainer.workingHours) {
      try {
        const parsed = JSON.parse(trainer.workingHours)
        if (parsed.availability) {
          // Convert from availability format to working hours
          for (const [day, slots] of Object.entries(parsed.availability)) {
            const daySlots = slots as any[]
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
        }
      } catch (e) {
        console.log('Error parsing working hours')
      }
    }

    // Default working hours if none set
    if (Object.keys(workingHours).length === 0) {
      workingHours = {
        sunday: { enabled: true, start: '09:00', end: '17:00' },
        monday: { enabled: true, start: '09:00', end: '17:00' },
        tuesday: { enabled: true, start: '09:00', end: '17:00' },
        wednesday: { enabled: true, start: '09:00', end: '17:00' },
        thursday: { enabled: true, start: '09:00', end: '17:00' },
        friday: { enabled: true, start: '09:00', end: '13:00' },
        saturday: { enabled: false, start: '10:00', end: '14:00' }
      }
    }

    // Generate available time slots for the date
    const targetDate = new Date(date || new Date().toISOString().split('T')[0])
    const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'lowercase' })
    const daySchedule = workingHours[dayName]

    if (!daySchedule || !daySchedule.enabled) {
      return NextResponse.json({
        success: true,
        data: {
          date: targetDate.toISOString().split('T')[0],
          slots: [],
          trainer: trainerSlug
        }
      })
    }

    // Generate time slots
    const slots = []
    const startHour = parseInt(daySchedule.start.split(':')[0])
    const startMinute = parseInt(daySchedule.start.split(':')[1])
    const endHour = parseInt(daySchedule.end.split(':')[0])
    const endMinute = parseInt(daySchedule.end.split(':')[1])

    const totalSlotTime = sessionDuration + breakBetweenSessions

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = (hour === startHour ? startMinute : 0); minute < 60; minute += totalSlotTime) {
        const slotEndMinute = minute + sessionDuration
        if (hour === endHour - 1 && slotEndMinute > endMinute) break
        if (slotEndMinute >= 60) continue

        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        
        // Check if this slot conflicts with existing appointments
        const slotDateTime = new Date(targetDate)
        slotDateTime.setHours(hour, minute, 0, 0)
        
        const hasConflict = trainer.appointments?.some(apt => {
          const aptTime = new Date(apt.datetime)
          const aptEndTime = new Date(aptTime.getTime() + (apt.duration * 60000))
          const slotEndTime = new Date(slotDateTime.getTime() + (sessionDuration * 60000))
          
          return (slotDateTime < aptEndTime && slotEndTime > aptTime)
        })

        if (!hasConflict) {
          slots.push(timeStr)
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        date: targetDate.toISOString().split('T')[0],
        slots,
        trainer: trainerSlug,
        trainerName: trainer.user.name
      }
    })
  } catch (error) {
    console.error('Error fetching availability for MCP:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch availability' },
      { status: 500 }
    )
  }
}