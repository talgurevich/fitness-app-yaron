// src/lib/admin.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function isAdmin(): Promise<boolean> {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return false
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })

    return user?.role === 'admin'
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

export async function requireAdmin() {
  const adminStatus = await isAdmin()
  
  if (!adminStatus) {
    throw new Error('Admin access required')
  }
  
  return true
}