// src/app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: { accounts: true }
    })

    if (existingUser) {
      // If user exists and has a password, they already have email/password auth
      if (existingUser.password) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 409 }
        )
      }
      
      // If user exists but only has Google OAuth, add password to existing account
      if (existingUser.accounts.some(acc => acc.provider === 'google')) {
        const hashedPassword = await bcrypt.hash(password, 12)
        
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            password: hashedPassword,
            name: name // Update name if provided
          }
        })

        return NextResponse.json(
          { 
            message: 'Password added to existing account',
            user: {
              id: existingUser.id,
              name: name,
              email: existingUser.email
            }
          },
          { status: 200 }
        )
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'trainer'
      }
    })

    // Create trainer profile
    const bookingSlug = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '-')
    await prisma.trainer.create({
      data: {
        userId: user.id,
        bookingSlug,
        timezone: 'Asia/Jerusalem'
      }
    })

    return NextResponse.json(
      { 
        message: 'User created successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}