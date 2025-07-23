// src/app/api/trainer/clients/[clientId]/route.ts - Fixed to handle missing Payment model
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Fetch client with optional payment data
export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Get trainer info
    const trainer = await prisma.trainer.findFirst({
      where: {
        user: {
          email: session.user.email
        }
      }
    })

    if (!trainer) {
      return NextResponse.json({ success: false, error: 'Trainer not found' }, { status: 404 })
    }

    // Get client with related data - handle payments safely
    let client
    
    try {
      // Try to get client with payments (if Payment model exists)
      client = await prisma.client.findFirst({
        where: {
          id: params.clientId,
          trainerId: trainer.id
        },
        include: {
          appointments: {
            orderBy: { datetime: 'desc' },
            select: {
              id: true,
              datetime: true,
              duration: true,
              status: true,
              sessionNotes: true,
              sessionPrice: true
            }
          },
          payments: {
            orderBy: { paymentDate: 'desc' },
            select: {
              id: true,
              amount: true,
              paymentMethod: true,
              paymentDate: true,
              notes: true,
              appointmentId: true
            }
          }
        }
      })
    } catch (paymentsError) {
      console.log('Payment model not found, falling back to basic client data')
      
      // Fallback: Get client without payments
      client = await prisma.client.findFirst({
        where: {
          id: params.clientId,
          trainerId: trainer.id
        },
        include: {
          appointments: {
            orderBy: { datetime: 'desc' },
            select: {
              id: true,
              datetime: true,
              duration: true,
              status: true,
              sessionNotes: true,
              sessionPrice: true
            }
          }
        }
      })
      
      // Add empty payments array
      if (client) {
        (client as any).payments = []
      }
    }

    if (!client) {
      return NextResponse.json({ success: false, error: 'Client not found' }, { status: 404 })
    }

    // Calculate appointment statistics
    const completedAppointments = client.appointments.filter(apt => apt.status === 'completed')
    const upcomingAppointments = client.appointments.filter(apt => 
      apt.status === 'booked' && new Date(apt.datetime) > new Date()
    )
    
    // Calculate payment statistics (safe handling)
    const payments = (client as any).payments || []
    const totalPaid = payments.reduce((sum: number, payment: any) => sum + payment.amount, 0)
    
    // Calculate total owed (completed sessions * session price)
    const totalOwed = completedAppointments.reduce((sum, apt) => {
      const sessionPrice = apt.sessionPrice || client.sessionPrice || 180
      return sum + sessionPrice
    }, 0)
    
    const outstandingBalance = totalOwed - totalPaid

    return NextResponse.json({
      success: true,
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        notes: client.notes,
        goals: client.goals,
        medicalNotes: client.medicalNotes,
        emergencyContact: client.emergencyContact,
        birthDate: client.birthDate,
        joinedDate: client.joinedDate,
        lastSessionDate: client.lastSessionDate,
        preferredDays: client.preferredDays,
        preferredTimes: client.preferredTimes,
        sessionDuration: client.sessionDuration,
        sessionPrice: client.sessionPrice,
        totalAppointments: client.appointments.length,
        completedSessions: completedAppointments.length,
        upcomingAppointments: upcomingAppointments.length,
        totalPaid, // Total payments received (0 if no payments)
        totalOwed, // Total amount owed
        outstandingBalance, // Outstanding balance
        appointments: client.appointments,
        payments // Payment history (empty array if no payments)
      }
    })

  } catch (error) {
    console.error('Error fetching client:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

// PUT - Update client information
export async function PUT(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const trainer = await prisma.trainer.findFirst({
      where: {
        user: {
          email: session.user.email
        }
      }
    })

    if (!trainer) {
      return NextResponse.json({ success: false, error: 'Trainer not found' }, { status: 404 })
    }

    const body = await request.json()
    const { 
      name, 
      phone, 
      notes, 
      goals, 
      medicalNotes, 
      emergencyContact, 
      birthDate,
      sessionDuration,
      sessionPrice
    } = body

    // Update client basic info
    const updatedClient = await prisma.client.update({
      where: {
        id: params.clientId,
        trainerId: trainer.id
      },
      data: {
        name: name || undefined,
        phone: phone || undefined,
        notes: notes || undefined,
        goals: goals || undefined,
        medicalNotes: medicalNotes || undefined,
        emergencyContact: emergencyContact || undefined,
        birthDate: birthDate ? new Date(birthDate) : undefined,
        sessionDuration: sessionDuration || undefined,
        sessionPrice: sessionPrice || undefined
      },
      include: {
        appointments: {
          orderBy: { datetime: 'desc' },
          select: {
            id: true,
            datetime: true,
            duration: true,
            status: true,
            sessionNotes: true,
            sessionPrice: true
          }
        }
      }
    })

    // Try to get payments if the model exists
    let payments = []
    try {
      const clientWithPayments = await prisma.client.findFirst({
        where: { id: params.clientId },
        include: {
          payments: {
            orderBy: { paymentDate: 'desc' },
            select: {
              id: true,
              amount: true,
              paymentMethod: true,
              paymentDate: true,
              notes: true,
              appointmentId: true
            }
          }
        }
      })
      payments = clientWithPayments?.payments || []
    } catch (error) {
      console.log('Payment model not available')
    }

    // Recalculate statistics
    const completedAppointments = updatedClient.appointments.filter(apt => apt.status === 'completed')
    const upcomingAppointments = updatedClient.appointments.filter(apt => 
      apt.status === 'booked' && new Date(apt.datetime) > new Date()
    )
    
    const totalPaid = payments.reduce((sum: number, payment: any) => sum + payment.amount, 0)
    const totalOwed = completedAppointments.reduce((sum, apt) => {
      const sessionPrice = apt.sessionPrice || updatedClient.sessionPrice || 180
      return sum + sessionPrice
    }, 0)
    const outstandingBalance = totalOwed - totalPaid

    return NextResponse.json({
      success: true,
      client: {
        ...updatedClient,
        totalAppointments: updatedClient.appointments.length,
        completedSessions: completedAppointments.length,
        upcomingAppointments: upcomingAppointments.length,
        totalPaid,
        totalOwed,
        outstandingBalance,
        payments
      }
    })

  } catch (error) {
    console.error('Error updating client:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}