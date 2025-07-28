import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Find the trainer for tal.gurevich@gmail.com
  const user = await prisma.user.findUnique({
    where: { email: 'tal.gurevich@gmail.com' },
    include: { trainer: true }
  })

  if (!user || !user.trainer) {
    console.error('❌ Trainer not found for tal.gurevich@gmail.com')
    console.log('Make sure to login first to create the trainer profile')
    return
  }

  const trainerId = user.trainer.id
  console.log(`✅ Found trainer: ${user.name} (${trainerId})`)

  // Create sample clients
  const clients = [
    {
      name: 'שרה כהן',
      email: 'sarah.cohen@example.com',
      phone: '0521234567',
      goals: 'הפחתת משקל וחיזוק שרירים',
      notes: 'מתאמנת 3 פעמים בשבוע, מוטיבציה גבוהה',
      sessionPrice: 200,
      joinedDate: new Date('2024-01-15')
    },
    {
      name: 'דוד לוי',
      email: 'david.levi@example.com',
      phone: '0523456789',
      goals: 'בניית מסת שריר',
      notes: 'רקע בכדורגל, נפצע בברך לפני שנה',
      medicalNotes: 'פציעה בברך - להיזהר בתרגילי סקוואט',
      sessionPrice: 180,
      joinedDate: new Date('2024-02-01')
    },
    {
      name: 'מיכל ברק',
      email: 'michal.barak@example.com',
      phone: '0524567890',
      goals: 'שיפור כושר כללי',
      notes: 'מעדיפה אימונים בבוקר',
      sessionPrice: 180,
      joinedDate: new Date('2024-03-10')
    },
    {
      name: 'יוסף אברהם',
      email: 'yosef.avraham@example.com',
      phone: '0525678901',
      goals: 'הכנה לטריאתלון',
      notes: 'רוכב אופניים ברמה מתקדמת',
      sessionPrice: 250,
      joinedDate: new Date('2023-12-01')
    },
    {
      name: 'רחל גרין',
      email: 'rachel.green@example.com',
      phone: '0526789012',
      goals: 'יוגה ופילאטיס',
      notes: 'גמישות טובה, כוח בינוני',
      sessionPrice: 180,
      joinedDate: new Date('2024-04-20')
    },
    {
      name: 'אורן שמש',
      email: 'oren.shemesh@example.com',
      phone: '0527890123',
      goals: 'שיקום לאחר ניתוח',
      medicalNotes: 'ניתוח כתף לפני 3 חודשים',
      notes: 'מתקדם לאט אבל בטוח',
      sessionPrice: 220,
      joinedDate: new Date('2024-05-01')
    }
  ]

  // Create clients
  console.log('📝 Creating clients...')
  for (const clientData of clients) {
    const client = await prisma.client.upsert({
      where: {
        trainerId_email: {
          trainerId,
          email: clientData.email
        }
      },
      update: {},
      create: {
        ...clientData,
        trainerId
      }
    })
    console.log(`✅ Created client: ${client.name}`)
  }

  // Get all created clients
  const createdClients = await prisma.client.findMany({
    where: { trainerId }
  })

  // Create appointments for each client
  console.log('📅 Creating appointments...')
  const now = new Date()
  
  for (const client of createdClients) {
    // Past appointments (completed)
    for (let i = 1; i <= 8; i++) {
      const appointmentDate = new Date(now)
      appointmentDate.setDate(now.getDate() - (i * 7)) // Weekly appointments going back
      appointmentDate.setHours(10 + (i % 8), 0, 0, 0) // Vary the hours
      
      await prisma.appointment.create({
        data: {
          trainerId,
          clientId: client.id,
          clientName: client.name,
          clientEmail: client.email,
          clientPhone: client.phone,
          datetime: appointmentDate,
          duration: 60,
          status: 'completed',
          sessionPrice: client.sessionPrice,
          sessionNotes: i % 3 === 0 ? 'אימון מצוין! התקדמות יפה' : i % 3 === 1 ? 'עבדנו על טכניקה' : null
        }
      })
    }

    // Upcoming appointments
    for (let i = 1; i <= 4; i++) {
      const appointmentDate = new Date(now)
      appointmentDate.setDate(now.getDate() + (i * 7)) // Weekly appointments going forward
      appointmentDate.setHours(10 + (i % 8), 0, 0, 0)
      
      await prisma.appointment.create({
        data: {
          trainerId,
          clientId: client.id,
          clientName: client.name,
          clientEmail: client.email,
          clientPhone: client.phone,
          datetime: appointmentDate,
          duration: 60,
          status: 'booked',
          sessionPrice: client.sessionPrice
        }
      })
    }

    console.log(`✅ Created 12 appointments for ${client.name}`)
  }

  // Add some measurements for clients
  console.log('📏 Adding measurements...')
  const measurementClients = createdClients.slice(0, 3) // First 3 clients
  
  for (const client of measurementClients) {
    // Initial measurement
    await prisma.measurement.create({
      data: {
        clientId: client.id,
        date: client.joinedDate,
        weight: 70 + Math.random() * 30,
        chest: 90 + Math.random() * 20,
        waist: 75 + Math.random() * 20,
        hips: 95 + Math.random() * 15,
        arms: 30 + Math.random() * 10,
        thighs: 55 + Math.random() * 10,
        notes: 'מדידה ראשונית'
      }
    })

    // Progress measurement
    const progressDate = new Date(client.joinedDate)
    progressDate.setMonth(progressDate.getMonth() + 2)
    
    await prisma.measurement.create({
      data: {
        clientId: client.id,
        date: progressDate,
        weight: 68 + Math.random() * 30,
        chest: 92 + Math.random() * 20,
        waist: 73 + Math.random() * 20,
        hips: 94 + Math.random() * 15,
        arms: 31 + Math.random() * 10,
        thighs: 56 + Math.random() * 10,
        notes: 'התקדמות יפה!'
      }
    })

    console.log(`✅ Added measurements for ${client.name}`)
  }

  // Add some payments
  console.log('💰 Adding payments...')
  for (const client of createdClients) {
    // Get completed appointments for this client
    const completedAppointments = await prisma.appointment.findMany({
      where: {
        clientId: client.id,
        status: 'completed'
      },
      orderBy: { datetime: 'asc' }
    })

    // Pay for first 6 sessions
    const sessionsToPay = completedAppointments.slice(0, 6)
    for (const appointment of sessionsToPay) {
      await prisma.payment.create({
        data: {
          trainerId,
          clientId: client.id,
          appointmentId: appointment.id,
          amount: appointment.sessionPrice || client.sessionPrice,
          paymentMethod: Math.random() > 0.5 ? 'cash' : 'transfer',
          paymentDate: appointment.datetime,
          notes: 'תשלום עבור אימון'
        }
      })
    }

    console.log(`✅ Added ${sessionsToPay.length} payments for ${client.name}`)
  }

  console.log('✨ Seed completed successfully!')

  // Show summary
  const summary = await prisma.trainer.findUnique({
    where: { id: trainerId },
    include: {
      _count: {
        select: {
          clients: true,
          appointments: true,
          payments: true
        }
      }
    }
  })

  console.log('\n📊 Summary:')
  console.log(`- Clients: ${summary?._count.clients}`)
  console.log(`- Appointments: ${summary?._count.appointments}`)
  console.log(`- Payments: ${summary?._count.payments}`)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })