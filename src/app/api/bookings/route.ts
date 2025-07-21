// src/app/api/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { trainerSlug, clientName, clientEmail, clientPhone, datetime, duration = 60 } = body

    console.log('Received booking:', { trainerSlug, clientName, clientEmail, datetime })

    // Find trainer by booking slug
    const trainer = await prisma.trainer.findFirst({
      where: {
        bookingSlug: trainerSlug
      },
      include: {
        user: true
      }
    })

    if (!trainer) {
      console.log('Trainer not found for slug:', trainerSlug)
      return NextResponse.json({ error: 'Trainer not found' }, { status: 404 })
    }

    console.log('Found trainer:', trainer.user.email)

    // Create the appointment
    const appointment = await prisma.appointment.create({
      data: {
        trainerId: trainer.id,
        clientName,
        clientEmail,
        clientPhone: clientPhone || '',
        datetime: new Date(datetime),
        duration,
        status: 'booked'
      }
    })

    console.log('Created appointment:', appointment.id)

    // Try to create Google Calendar event automatically
    try {
      const calendarResponse = await fetch(`${request.nextUrl.origin}/api/calendar/create-event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId: appointment.id })
      })
      
      const calendarData = await calendarResponse.json()
      
      if (calendarData.success) {
        console.log('Calendar event created successfully:', calendarData.eventId)
      } else {
        console.log('Calendar event creation failed:', calendarData.error)
      }
    } catch (calendarError) {
      console.error('Calendar event creation error:', calendarError)
      // Don't fail the booking if calendar creation fails
    }

    return NextResponse.json({ 
      success: true, 
      appointment: {
        id: appointment.id,
        datetime: appointment.datetime,
        clientName: appointment.clientName
      }
    })

  } catch (error) {
    console.error('Booking error:', error)
    return NextResponse.json({ 
      error: 'Failed to create booking: ' + error.message,
      success: false 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const trainerSlug = searchParams.get('trainerSlug')

    if (!trainerSlug) {
      return NextResponse.json({ error: 'Trainer slug required' }, { status: 400 })
    }

    const trainer = await prisma.trainer.findFirst({
      where: {
        bookingSlug: trainerSlug
      },
      include: {
        appointments: {
          where: {
            datetime: {
              gte: new Date() // Only future appointments
            }
          },
          orderBy: {
            datetime: 'asc'
          }
        },
        user: true
      }
    })

    if (!trainer) {
      return NextResponse.json({ error: 'Trainer not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      trainer: {
        name: trainer.user.name || trainer.user.email,
        appointments: trainer.appointments
      }
    })

  } catch (error) {
    console.error('Get bookings error:', error)
    return NextResponse.json({ 
      error: 'Failed to get bookings: ' + error.message,
      trainer: { name: 'Error', appointments: [] }
    }, { status: 500 })
  }
}