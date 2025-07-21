// src/app/api/trainer/setup/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Setting up trainer for:', session.user.email)

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || session.user.email,
          role: 'trainer'
        }
      })
      console.log('Created new user:', user.id)
    }

    // Generate booking slug from email
    const bookingSlug = session.user.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '-')

    // Create or update trainer profile
    const trainer = await prisma.trainer.upsert({
      where: { userId: user.id },
      update: {
        bookingSlug: bookingSlug
      },
      create: {
        userId: user.id,
        bookingSlug: bookingSlug,
        timezone: 'Asia/Jerusalem'
      }
    })

    console.log('Trainer setup complete:', trainer.bookingSlug)

    return NextResponse.json({ 
      success: true, 
      trainer: {
        id: trainer.id,
        bookingSlug: trainer.bookingSlug
      }
    })

  } catch (error) {
    console.error('Trainer setup error:', error)
    return NextResponse.json({ 
      error: 'Failed to setup trainer: ' + error.message,
      success: false 
    }, { status: 500 })
  }
}