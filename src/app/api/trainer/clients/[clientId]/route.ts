// src/app/api/trainer/clients/[clientId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Fetch specific client details
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
    console.log('👤 Fetching client details for:', clientId)

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

    // Fetch client with full details
    const client = await prisma.client.findFirst({
      where: { 
        id: clientId,
        trainerId: user.trainer.id // Ensure trainer owns this client
      },
      include: {
        appointments: {
          orderBy: { datetime: 'desc' },
          take: 10 // Recent appointments
        },
        _count: {
          select: {
            appointments: true
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

    // Calculate additional statistics
    const completedSessions = await prisma.appointment.count({
      where: { 
        clientId: client.id,
        status: 'completed'
      }
    })

    const upcomingAppointments = await prisma.appointment.count({
      where: { 
        clientId: client.id,
        datetime: { gte: new Date() },
        status: 'booked'
      }
    })

    const clientWithStats = {
      ...client,
      completedSessions,
      upcomingAppointments
    }

    console.log('✅ Client details retrieved:', client.name)

    return NextResponse.json({
      success: true,
      client: clientWithStats
    })

  } catch (error) {
    console.error('❌ Error fetching client details:', error)
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
    
    console.log('📝 Updating client:', clientId, body)

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
    const existingClient = await prisma.client.findFirst({
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

    // Update client information
    const updatedClient = await prisma.client.update({
      where: { id: clientId },
      data: {
        name: body.name || existingClient.name,
        phone: body.phone || existingClient.phone,
        notes: body.notes,
        goals: body.goals,
        medicalNotes: body.medicalNotes,
        emergencyContact: body.emergencyContact,
        birthDate: body.birthDate ? new Date(body.birthDate) : existingClient.birthDate,
        preferredDays: body.preferredDays ? JSON.stringify(body.preferredDays) : existingClient.preferredDays,
        preferredTimes: body.preferredTimes ? JSON.stringify(body.preferredTimes) : existingClient.preferredTimes,        sessionDuration: body.sessionDuration || existingClient.sessionDuration,
        updatedAt: new Date()
      }
    })

    console.log('✅ Client updated successfully:', updatedClient.name)

    return NextResponse.json({
      success: true,
      client: updatedClient,
      message: 'Client updated successfully'
    })

  } catch (error) {
    console.error('❌ Error updating client:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update client' 
    }, { status: 500 })
  }
}