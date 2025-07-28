import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function makeAdmin() {
  const email = 'tal.gurevich@gmail.com'
  
  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: 'admin' }
    })
    
    console.log(`✅ Successfully updated ${email} to admin role`)
    console.log('User:', user)
  } catch (error) {
    console.error('❌ Error updating user role:', error)
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    
    if (!existingUser) {
      console.log(`User with email ${email} not found in database`)
    }
  } finally {
    await prisma.$disconnect()
  }
}

makeAdmin()