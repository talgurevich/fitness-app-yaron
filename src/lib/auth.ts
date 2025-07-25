// src/lib/auth.ts - Make sure this includes calendar scopes
import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: [
            'openid',
            'email',
            'profile',
            'https://www.googleapis.com/auth/calendar',        // Read/write calendar access
            'https://www.googleapis.com/auth/calendar.events'   // Events access
          ].join(' '),
          access_type: 'offline',  // Get refresh token
          prompt: 'consent',       // Force consent screen to get refresh token
        }
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle account linking for Google OAuth
      if (account?.provider === 'google' && user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          include: { accounts: true }
        })

        if (existingUser) {
          // Check if Google account is already linked
          const googleAccount = existingUser.accounts.find(acc => acc.provider === 'google')
          
          if (!googleAccount) {
            // Link Google account to existing user
            await prisma.account.create({
              data: {
                userId: existingUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                refresh_token: account.refresh_token,
                access_token: account.access_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
                session_state: account.session_state,
              }
            })
            
            // Update user with Google profile info if missing
            if (!existingUser.image && profile?.picture) {
              await prisma.user.update({
                where: { id: existingUser.id },
                data: { image: profile.picture }
              })
            }
          }
        }
      }
      
      return true
    },
    async jwt({ token, account }) {
      // Persist the OAuth access_token and refresh_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.expiresAt = account.expires_at
      }
      
      // Check if token is expired and refresh if possible
      if (token.expiresAt && Date.now() > (token.expiresAt as number) * 1000) {
        console.log('🔄 Token expired, attempting refresh...')
        try {
          const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              client_id: process.env.GOOGLE_CLIENT_ID!,
              client_secret: process.env.GOOGLE_CLIENT_SECRET!,
              grant_type: 'refresh_token',
              refresh_token: token.refreshToken as string,
            }),
          })

          const refreshedTokens = await response.json()

          if (!response.ok) {
            throw new Error('Failed to refresh token')
          }

          console.log('✅ Token refreshed successfully')
          
          return {
            ...token,
            accessToken: refreshedTokens.access_token,
            expiresAt: Math.floor(Date.now() / 1000 + refreshedTokens.expires_in),
            refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
          }
        } catch (error) {
          console.error('❌ Error refreshing token:', error)
          return {
            ...token,
            error: 'RefreshAccessTokenError',
          }
        }
      }
      
      return token
    },
    async session({ session, token }) {
      // Send properties to the client
      session.accessToken = token.accessToken as string
      session.error = token.error as string
      return session
    },
  },
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
}