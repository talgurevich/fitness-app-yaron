// src/app/api/trainer/clients/[clientId]/payments/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Record a new payment
export async function POST(
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

    // Verify client belongs to this trainer
    const client = await prisma.client.findFirst({
      where: {
        id: params.clientId,
        trainerId: trainer.id
      }
    })

    if (!client) {
      return NextResponse.json({ success: false, error: 'Client not found' }, { status: 404 })
    }

    const body = await request.json()
    const { amount, paymentMethod, notes, appointmentId } = body

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json({ success: false, error: 'Valid amount is required' }, { status: 400 })
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        trainerId: trainer.id,
        clientId: client.id,
        appointmentId: appointmentId || null,
        amount: Math.round(amount), // Convert to integer (cents)
        paymentMethod: paymentMethod || 'cash',
        notes: notes || null,
        paymentDate: new Date()
      }
    })

    return NextResponse.json({ 
      success: true, 
      payment: {
        id: payment.id,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        paymentDate: payment.paymentDate.toISOString(),
        notes: payment.notes
      }
    })

  } catch (error) {
    console.error('Error recording payment:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

// GET - Fetch payment history for a client
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

    // Get payments for this client
    const payments = await prisma.payment.findMany({
      where: {
        clientId: params.clientId,
        trainerId: trainer.id
      },
      orderBy: {
        paymentDate: 'desc'
      },
      include: {
        appointment: {
          select: {
            datetime: true,
            duration: true
          }
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      payments: payments.map(payment => ({
        id: payment.id,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        paymentDate: payment.paymentDate.toISOString(),
        notes: payment.notes,
        appointment: payment.appointment
      }))
    })

  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}