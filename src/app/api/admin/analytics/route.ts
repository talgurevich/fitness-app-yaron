// src/app/api/admin/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Check admin permissions
    await requireAdmin()

    // Get current month date range
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

    console.log('📊 Analytics date range:', {
      startOfMonth: startOfMonth.toISOString(),
      endOfMonth: endOfMonth.toISOString()
    })

    // Get all trainers with their booking stats
    const trainers = await prisma.trainer.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        appointments: {
          where: {
            datetime: {
              gte: startOfMonth,
              lte: endOfMonth
            },
            status: {
              not: 'cancelled'
            }
          },
          include: {
            client: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        clients: {
          select: {
            id: true,
            name: true,
            email: true,
            joinedDate: true
          }
        },
        _count: {
          select: {
            appointments: {
              where: {
                status: {
                  not: 'cancelled'
                }
              }
            },
            clients: true
          }
        }
      }
    })

    // Calculate analytics for each trainer
    const trainerAnalytics = trainers.map(trainer => {
      const thisMonthAppointments = trainer.appointments
      const thisMonthRevenue = thisMonthAppointments.reduce((sum, apt) => 
        sum + (apt.sessionPrice || 180), 0
      )

      // Calculate unique clients this month
      const uniqueClientsThisMonth = new Set(
        thisMonthAppointments.map(apt => apt.clientEmail)
      ).size

      // Get recent clients (joined this month)
      const recentClients = trainer.clients.filter(client => 
        client.joinedDate >= startOfMonth
      )

      return {
        id: trainer.id,
        bookingSlug: trainer.bookingSlug,
        user: trainer.user,
        timezone: trainer.timezone,
        
        // This month's stats
        thisMonth: {
          appointmentCount: thisMonthAppointments.length,
          revenue: thisMonthRevenue,
          uniqueClients: uniqueClientsThisMonth,
          newClients: recentClients.length
        },
        
        // Overall stats
        total: {
          appointmentCount: trainer._count.appointments,
          clientCount: trainer._count.clients
        },
        
        // Recent activity
        recentAppointments: thisMonthAppointments
          .sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime())
          .slice(0, 5)
          .map(apt => ({
            id: apt.id,
            datetime: apt.datetime,
            clientName: apt.client?.name || apt.clientName,
            clientEmail: apt.clientEmail,
            status: apt.status,
            sessionPrice: apt.sessionPrice
          }))
      }
    })

    // Sort trainers by this month's appointment count (most active first)
    trainerAnalytics.sort((a, b) => b.thisMonth.appointmentCount - a.thisMonth.appointmentCount)

    // Calculate platform totals
    const platformStats = {
      totalTrainers: trainers.length,
      totalAppointmentsThisMonth: trainerAnalytics.reduce((sum, t) => sum + t.thisMonth.appointmentCount, 0),
      totalRevenueThisMonth: trainerAnalytics.reduce((sum, t) => sum + t.thisMonth.revenue, 0),
      totalNewClientsThisMonth: trainerAnalytics.reduce((sum, t) => sum + t.thisMonth.newClients, 0),
      averageAppointmentsPerTrainer: trainerAnalytics.length > 0 
        ? Math.round(trainerAnalytics.reduce((sum, t) => sum + t.thisMonth.appointmentCount, 0) / trainerAnalytics.length)
        : 0
    }

    return NextResponse.json({
      success: true,
      dateRange: {
        startOfMonth: startOfMonth.toISOString(),
        endOfMonth: endOfMonth.toISOString(),
        monthName: startOfMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      },
      platformStats,
      trainers: trainerAnalytics
    })

  } catch (error) {
    console.error('❌ Admin analytics error:', error)
    
    if (error.message === 'Admin access required') {
      return NextResponse.json({ 
        error: 'Unauthorized - Admin access required' 
      }, { status: 403 })
    }

    return NextResponse.json({ 
      error: 'Failed to get analytics: ' + error.message 
    }, { status: 500 })
  }
}