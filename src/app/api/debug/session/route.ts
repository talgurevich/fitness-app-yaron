// src/app/api/debug/session/route.ts - Temporary debug endpoint
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'No session found' }, { status: 401 })
    }

    // Don't expose full tokens in production, but useful for debugging
    const debugInfo = {
      user: {
        name: session.user?.name,
        email: session.user?.email,
        image: session.user?.image
      },
      hasAccessToken: !!session.accessToken,
      accessTokenLength: session.accessToken ? session.accessToken.length : 0,
      accessTokenPrefix: session.accessToken ? session.accessToken.substring(0, 20) + '...' : null,
      error: session.error,
      // Show first/last few chars of token for debugging
      tokenDebug: session.accessToken ? {
        starts: session.accessToken.substring(0, 10),
        ends: session.accessToken.substring(session.accessToken.length - 10)
      } : null
    }

    return NextResponse.json(debugInfo)
    
  } catch (error) {
    console.error('Debug session error:', error)
    return NextResponse.json({ 
      error: 'Debug failed: ' + error.message 
    }, { status: 500 })
  }
}