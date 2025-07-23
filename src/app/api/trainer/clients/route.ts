// src/app/api/trainer/clients/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Fetch all clients for the authenticated trainer
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        success: false, 
        error: 'Not authenticated' 
      }, { status: 401 })
    }

    console.log('📋 Fetching clients for trainer:', session.user.email)

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

    // Sync clients from appointments first (auto-create missing clients)
    await syncClientsFromAppointments(user.trainer.id)

    // Fetch all clients with appointment statistics
    const clients = await prisma.client.findMany({
      where: { trainerId: user.trainer.id },
      include: {
        appointments: {
          orderBy: { datetime: 'desc' },
          take: 1 // Get most recent appointment for quick stats
        },
        _count: {
          select: {
            appointments: {
              where: { status: 'completed' }
            }
          }
        }
      },
      orderBy: { lastSessionDate: 'desc' }
    })

    // Calculate additional statistics
    const clientsWithStats = await Promise.all(
      clients.map(async (client) => {
        const totalAppointments = await prisma.appointment.count({
          where: { clientId: client.id }
        })

        const upcomingAppointments = await prisma.appointment.count({
          where: { 
            clientId: client.id,
            datetime: { gte: new Date() },
            status: 'booked'
          }
        })

        return {
          ...client,
          totalAppointments,
          completedSessions: client._count.appointments,
          upcomingAppointments,
          lastAppointment: client.appointments[0] || null
        }
      })
    )

    console.log('✅ Found', clientsWithStats.length, 'clients')

    return NextResponse.json({
      success: true,
      clients: clientsWithStats
    })

  } catch (error) {
    console.error('❌ Error fetching clients:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch clients' 
    }, { status: 500 })
  }
}

// Helper function to sync clients from appointments
async function syncClientsFromAppointments(trainerId: string) {
  try {
    // Get all unique client emails from appointments for this trainer
    const uniqueAppointments = await prisma.appointment.findMany({
      where: { 
        trainerId,
        clientId: null // Only appointments not yet linked to a client
      },
      distinct: ['clientEmail'],
      orderBy: { datetime: 'desc' }
    })

    // Create client records for each unique email
    for (const appointment of uniqueAppointments) {
      const existingClient = await prisma.client.findUnique({
        where: {
          trainerId_email: {
            trainerId,
            email: appointment.clientEmail
          }
        }
      })

      if (!existingClient) {
        // Get the most recent appointment for this client to use as profile data
        const latestAppointment = await prisma.appointment.findFirst({
          where: {
            trainerId,
            clientEmail: appointment.clientEmail
          },
          orderBy: { datetime: 'desc' }
        })

        // Create client profile
        const newClient = await prisma.client.create({
          data: {
            trainerId,
            email: appointment.clientEmail,
            name: appointment.clientName || appointment.clientEmail,
            phone: appointment.clientPhone,
            lastSessionDate: latestAppointment?.datetime
          }
        })

        // Link all appointments for this client
        await prisma.appointment.updateMany({
          where: {
            trainerId,
            clientEmail: appointment.clientEmail
          },
          data: {
            clientId: newClient.id
          }
        })

        console.log('✅ Created client profile for:', appointment.clientEmail)
      }
    }
  } catch (error) {
    console.error('❌ Error syncing clients:', error)
  }
}