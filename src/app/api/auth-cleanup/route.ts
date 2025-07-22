// src/app/api/auth-cleanup/route.ts (TEMPORARY - DELETE AFTER USE)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    console.log('🧹 Cleaning up auth data for:', email)

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        accounts: true,
        sessions: true,
        trainer: {
          include: {
            appointments: true
          }
        }
      }
    })

    if (user) {
      console.log('👤 Found user:', {
        id: user.id,
        email: user.email,
        accounts: user.accounts.length,
        sessions: user.sessions.length,
        hasTrainer: !!user.trainer,
        appointments: user.trainer?.appointments.length || 0
      })

      // Delete all sessions first
      await prisma.session.deleteMany({
        where: { userId: user.id }
      })
      console.log('🗑️ Deleted sessions')

      // Delete all accounts
      await prisma.account.deleteMany({
        where: { userId: user.id }
      })
      console.log('🗑️ Deleted accounts')

      // Keep trainer and appointments - just reset the user for fresh auth
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: null,
          image: null
        }
      })
      console.log('🔄 Reset user auth data')

      return NextResponse.json({ 
        success: true,
        message: `Cleaned up auth data for ${email}. You can now login with Google.`,
        kept: {
          trainer: !!user.trainer,
          appointments: user.trainer?.appointments.length || 0
        }
      })
    } else {
      return NextResponse.json({ 
        success: true,
        message: `No user found for ${email}. You can proceed with Google login.`
      })
    }

  } catch (error) {
    console.error('Cleanup error:', error)
    return NextResponse.json({ 
      error: 'Cleanup failed: ' + error.message 
    }, { status: 500 })
  }
}