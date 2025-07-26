import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 })
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
      return NextResponse.json({ 
        success: false, 
        error: 'Trainer not found' 
      }, { status: 404 })
    }

    const { clientId } = params
    const body = await request.json()

    // Verify the client belongs to this trainer
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        trainerId: trainer.id
      }
    })

    if (!client) {
      return NextResponse.json({ 
        success: false, 
        error: 'Client not found' 
      }, { status: 404 })
    }

    // Create the measurement
    const measurement = await prisma.measurement.create({
      data: {
        clientId: clientId,
        date: new Date(body.date),
        weight: body.weight,
        chest: body.chest,
        waist: body.waist,
        hips: body.hips,
        arms: body.arms,
        thighs: body.thighs,
        notes: body.notes
      }
    })

    return NextResponse.json({
      success: true,
      measurement
    })

  } catch (error: any) {
    console.error('Measurement creation error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create measurement: ' + error.message 
    }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 })
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
      return NextResponse.json({ 
        success: false, 
        error: 'Trainer not found' 
      }, { status: 404 })
    }

    const { clientId } = params

    // Verify the client belongs to this trainer
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        trainerId: trainer.id
      }
    })

    if (!client) {
      return NextResponse.json({ 
        success: false, 
        error: 'Client not found' 
      }, { status: 404 })
    }

    // Get all measurements for this client
    const measurements = await prisma.measurement.findMany({
      where: {
        clientId: clientId
      },
      orderBy: {
        date: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      measurements
    })

  } catch (error: any) {
    console.error('Measurements fetch error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch measurements: ' + error.message 
    }, { status: 500 })
  }
}