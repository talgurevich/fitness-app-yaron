// Analytics API - Weekly appointment growth data
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

    // Calculate last 8 weeks of data
    const weeks = []
    const now = new Date()
    
    for (let i = 7; i >= 0; i--) {
      const endDate = new Date(now)
      endDate.setDate(now.getDate() - (i * 7))
      endDate.setHours(23, 59, 59, 999)
      
      const startDate = new Date(endDate)
      startDate.setDate(endDate.getDate() - 6)
      startDate.setHours(0, 0, 0, 0)
      
      // Count appointments for this week
      const appointmentCount = await prisma.appointment.count({
        where: {
          trainerId: user.trainer.id,
          datetime: {
            gte: startDate,
            lte: endDate
          }
        }
      })
      
      // Format week label (e.g., "Dec 15-21")
      const weekLabel = `${startDate.toLocaleDateString('he-IL', { month: 'short', day: 'numeric' })}-${endDate.toLocaleDateString('he-IL', { day: 'numeric' })}`
      
      weeks.push({
        week: weekLabel,
        appointments: appointmentCount,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      })
    }

    // Calculate growth metrics
    const currentWeek = weeks[weeks.length - 1]?.appointments || 0
    const previousWeek = weeks[weeks.length - 2]?.appointments || 0
    const growthPercentage = previousWeek > 0 ? 
      Math.round(((currentWeek - previousWeek) / previousWeek) * 100) : 
      currentWeek > 0 ? 100 : 0

    const totalAppointments = weeks.reduce((sum, week) => sum + week.appointments, 0)
    const averagePerWeek = Math.round(totalAppointments / 8)

    return NextResponse.json({
      success: true,
      data: {
        weeks,
        metrics: {
          currentWeek,
          previousWeek,
          growthPercentage,
          totalAppointments,
          averagePerWeek
        }
      }
    })

  } catch (error: any) {
    console.error('❌ Analytics growth error:', error)
    
    return NextResponse.json({ 
      success: false, 
      error: 'שגיאה בטעינת נתוני הצמיחה' 
    }, { status: 500 })
  }
}