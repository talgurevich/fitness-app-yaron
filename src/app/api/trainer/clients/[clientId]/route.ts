// src/app/api/trainer/clients/[clientId]/route.ts - Enhanced with appointments
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Fetch single client with all appointment details
export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        success: false, 
        error: 'Not authenticated' 
      }, { status: 401 })
    }

    const clientId = params.clientId

    // Get trainer
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { trainer: true }
    })

    if (!user?.trainer) {
      return NextResponse.json({ 
        success: false, 
        error: 'Trainer profile not found' 
      }, { status: 404 })
    }

    // Fetch client with full appointment details and payment info
    const client = await prisma.client.findUnique({
      where: { 
        id: clientId,
        trainerId: user.trainer.id // Ensure client belongs to this trainer
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
            sessionPrice: true,
            googleEventId: true,
            createdAt: true
          }
        },
        payments: {
          orderBy: { paymentDate: 'desc' },
          select: {
            id: true,
            amount: true,
            paymentDate: true,
            paymentMethod: true,
            notes: true,
            appointmentId: true
          }
        },
        measurements: {
          orderBy: { date: 'desc' },
          select: {
            id: true,
            date: true,
            weight: true,
            chest: true,
            waist: true,
            hips: true,
            arms: true,
            thighs: true,
            notes: true
          }
        },
        _count: {
          select: {
            appointments: {
              where: { status: 'completed' }
            }
          }
        }
      }
    })

    if (!client) {
      return NextResponse.json({ 
        success: false, 
        error: 'Client not found' 
      }, { status: 404 })
    }

    // Calculate statistics
    const totalAppointments = client.appointments.length

    const upcomingAppointments = client.appointments.filter(app => 
      new Date(app.datetime) > new Date() && app.status === 'booked'
    ).length

    const completedSessions = client._count.appointments

    // Calculate payment totals
    const totalPaid = client.payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0
    const totalOwed = completedSessions * (client.sessionPrice || 180)
    const outstandingBalance = Math.max(0, totalOwed - totalPaid)

    // Enhance client data with calculated fields
    const enhancedClient = {
      ...client,
      totalAppointments,
      completedSessions,
      upcomingAppointments,
      totalPaid,
      outstandingBalance
    }

    console.log('✅ Fetched client with', totalAppointments, 'appointments')

    return NextResponse.json({
      success: true,
      client: enhancedClient
    })

  } catch (error) {
    console.error('❌ Error fetching client:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch client details' 
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
      return NextResponse.json({ 
        success: false, 
        error: 'Not authenticated' 
      }, { status: 401 })
    }

    const clientId = params.clientId
    const body = await request.json()

    // Get trainer
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { trainer: true }
    })

    if (!user?.trainer) {
      return NextResponse.json({ 
        success: false, 
        error: 'Trainer profile not found' 
      }, { status: 404 })
    }

    // Verify client belongs to this trainer
    const existingClient = await prisma.client.findUnique({
      where: { 
        id: clientId,
        trainerId: user.trainer.id
      }
    })

    if (!existingClient) {
      return NextResponse.json({ 
        success: false, 
        error: 'Client not found' 
      }, { status: 404 })
    }

    // Build update data object with only provided fields
    const updateData: any = {}
    
    // Only update fields that are provided in the request
    if (body.name !== undefined) updateData.name = body.name
    if (body.email !== undefined) updateData.email = body.email
    if (body.phone !== undefined) {
      updateData.phone = body.phone || null
      console.log('📱 Updating phone number:', {
        clientId,
        oldPhone: existingClient.phone,
        newPhone: body.phone,
        updateData: updateData.phone
      })
    }
    if (body.notes !== undefined) updateData.notes = body.notes || null
    if (body.nutritionPlan !== undefined) updateData.nutritionPlan = body.nutritionPlan || null
    if (body.goals !== undefined) updateData.goals = body.goals || null
    if (body.medicalNotes !== undefined) updateData.medicalNotes = body.medicalNotes || null
    if (body.emergencyContact !== undefined) updateData.emergencyContact = body.emergencyContact || null
    if (body.birthDate !== undefined) updateData.birthDate = body.birthDate ? new Date(body.birthDate) : null
    if (body.sessionDuration !== undefined) updateData.sessionDuration = body.sessionDuration || 60
    if (body.sessionPrice !== undefined) updateData.sessionPrice = body.sessionPrice || 180

    // Update client
    const updatedClient = await prisma.client.update({
      where: { id: clientId },
      data: updateData,
      include: {
        appointments: {
          orderBy: { datetime: 'desc' },
          select: {
            id: true,
            datetime: true,
            duration: true,
            status: true,
            sessionNotes: true,
            sessionPrice: true,
            googleEventId: true,
            createdAt: true
          }
        },
        payments: {
          orderBy: { paymentDate: 'desc' },
          select: {
            id: true,
            amount: true,
            paymentDate: true,
            paymentMethod: true,
            notes: true,
            appointmentId: true
          }
        },
        measurements: {
          orderBy: { date: 'desc' },
          select: {
            id: true,
            date: true,
            weight: true,
            chest: true,
            waist: true,
            hips: true,
            arms: true,
            thighs: true,
            notes: true
          }
        },
        _count: {
          select: {
            appointments: {
              where: { status: 'completed' }
            }
          }
        }
      }
    })

    // Calculate statistics for the response
    const totalAppointments = updatedClient.appointments.length
    const upcomingAppointments = updatedClient.appointments.filter(app => 
      new Date(app.datetime) > new Date() && app.status === 'booked'
    ).length
    const completedSessions = updatedClient._count.appointments
    const totalPaid = updatedClient.payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0
    const totalOwed = completedSessions * updatedClient.sessionPrice
    const outstandingBalance = Math.max(0, totalOwed - totalPaid)

    const enhancedClient = {
      ...updatedClient,
      totalAppointments,
      completedSessions,
      upcomingAppointments,
      totalPaid,
      outstandingBalance
    }

    console.log('✅ Updated client:', {
      clientId,
      updatedPhone: updatedClient.phone,
      updateDataKeys: Object.keys(updateData)
    })

    return NextResponse.json({
      success: true,
      client: enhancedClient
    })

  } catch (error) {
    console.error('❌ Error updating client:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update client' 
    }, { status: 500 })
  }
}