// Trainer Profile API - Update trainer information including phone number
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        success: false, 
        error: 'לא מחובר למערכת' 
      }, { status: 401 })
    }

    // Get trainer profile
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

    return NextResponse.json({
      success: true,
      trainer: {
        id: user.trainer.id,
        name: user.name,
        email: user.email,
        phone: user.trainer.phone,
        bookingSlug: user.trainer.bookingSlug,
        timezone: user.trainer.timezone
      }
    })

  } catch (error: any) {
    console.error('❌ Get trainer profile error:', error)
    
    return NextResponse.json({ 
      success: false, 
      error: 'שגיאה בטעינת פרטי המאמן' 
    }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        success: false, 
        error: 'לא מחובר למערכת' 
      }, { status: 401 })
    }

    const body = await request.json()
    const { phone, name } = body

    // Validate phone number format (Israeli format)
    if (phone && !/^[\d\-\+\(\)\s]+$/.test(phone)) {
      return NextResponse.json({ 
        success: false, 
        error: 'פורמט מספר טלפון לא תקין' 
      }, { status: 400 })
    }

    console.log('📱 Updating trainer profile:', { email: session.user.email, phone, name })

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

    // Build update data objects
    const trainerUpdateData: any = {}
    const userUpdateData: any = {}

    // Only update fields that are provided in the request
    if (phone !== undefined) {
      trainerUpdateData.phone = phone || null
    }
    
    if (name !== undefined) {
      userUpdateData.name = name
    }

    // Update trainer phone if provided
    if (Object.keys(trainerUpdateData).length > 0) {
      await prisma.trainer.update({
        where: { id: user.trainer.id },
        data: trainerUpdateData
      })
    }

    // Update user name if provided
    if (Object.keys(userUpdateData).length > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: userUpdateData
      })
    }

    console.log('✅ Trainer profile updated successfully')

    return NextResponse.json({
      success: true,
      message: 'פרטי המאמן עודכנו בהצלחה',
      trainer: {
        phone: phone || user.trainer.phone,
        name: name || user.name
      }
    })

  } catch (error: any) {
    console.error('❌ Update trainer profile error:', error)
    
    return NextResponse.json({ 
      success: false, 
      error: 'שגיאה בעדכון פרטי המאמן' 
    }, { status: 500 })
  }
}