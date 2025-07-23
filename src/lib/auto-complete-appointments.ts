// src/lib/auto-complete-appointments.ts
import { prisma } from '@/lib/prisma'

export interface AutoCompletionResult {
  completed: number
  appointments: Array<{
    id: string
    clientName: string
    datetime: Date
  }>
}

/**
 * Auto-complete appointments that have passed their scheduled time
 * @param trainerId - Optional: only complete appointments for specific trainer
 * @returns Promise<AutoCompletionResult>
 */
export async function autoCompleteAppointments(trainerId?: string): Promise<AutoCompletionResult> {
  try {
    const currentTime = new Date()
    
    // Find appointments that should be auto-completed
    const pastAppointments = await prisma.appointment.findMany({
      where: {
        datetime: {
          lt: currentTime // Less than current time (in the past)
        },
        status: 'booked', // Only process booked appointments
        ...(trainerId && { trainerId }) // Filter by trainer if provided
      },
      include: {
        client: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (pastAppointments.length === 0) {
      return {
        completed: 0,
        appointments: []
      }
    }

    console.log(`Found ${pastAppointments.length} appointments to auto-complete`)

    // Group appointments by client to batch update completedSessions
    const clientUpdates = new Map<string, number>()
    
    pastAppointments.forEach(appointment => {
      if (appointment.clientId) {
        const currentCount = clientUpdates.get(appointment.clientId) || 0
        clientUpdates.set(appointment.clientId, currentCount + 1)
      }
    })

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update all appointment statuses to 'completed'
      const appointmentIds = pastAppointments.map(apt => apt.id)
      
      await tx.appointment.updateMany({
        where: {
          id: { in: appointmentIds }
        },
        data: {
          status: 'completed'
        }
      })

      // 2. Update completedSessions count for each affected client
      const clientUpdatePromises = Array.from(clientUpdates.entries()).map(([clientId, incrementCount]) => 
        tx.client.update({
          where: { id: clientId },
          data: {
            completedSessions: {
              increment: incrementCount
            },
            lastSessionDate: currentTime // Update last session date
          }
        })
      )

      await Promise.all(clientUpdatePromises)

      return {
        completed: pastAppointments.length,
        appointments: pastAppointments.map(apt => ({
          id: apt.id,
          clientName: apt.client?.name || apt.clientName,
          datetime: apt.datetime
        }))
      }
    })

    console.log(`Auto-completed ${result.completed} appointments`)
    
    return result

  } catch (error) {
    console.error('Error auto-completing appointments:', error)
    throw new Error(`Failed to auto-complete appointments: ${error.message}`)
  }
}

/**
 * Auto-complete appointments for a specific trainer
 */
export async function autoCompleteTrainerAppointments(trainerId: string): Promise<AutoCompletionResult> {
  return autoCompleteAppointments(trainerId)
}

/**
 * Check if auto-completion should run based on last run time
 * Prevents excessive database queries
 */
export function shouldRunAutoCompletion(lastRunTime?: Date): boolean {
  if (!lastRunTime) return true
  
  const now = new Date()
  const timeDiff = now.getTime() - lastRunTime.getTime()
  const oneHour = 60 * 60 * 1000 // 1 hour in milliseconds
  
  return timeDiff > oneHour // Only run if it's been more than 1 hour
}