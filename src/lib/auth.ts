// src/lib/auth.ts
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { CustomPrismaAdapter } from "./prisma-adapter"
import { prisma } from "./prisma"

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  adapter: CustomPrismaAdapter(prisma), // Use our custom adapter
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events",
          access_type: "offline",
          prompt: "consent"
        }
      },
      allowDangerousEmailAccountLinking: true
    }),
    CredentialsProvider({
      name: "credentials", 
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (credentials?.email === "test@test.com" && credentials?.password === "123456") {
          return {
            id: "test-user-id",
            email: "test@test.com",
            name: "Test Trainer",
            role: "trainer"
          }
        }
        return null
      }
    })
  ],
  session: {
    strategy: "database"
  },
  // Add explicit cookie configuration for custom domain
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' 
        ? "__Secure-next-auth.session-token" 
        : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? '.trainer-booking.com' : undefined
      },
    },
    callbackUrl: {
      name: process.env.NODE_ENV === 'production' 
        ? "__Secure-next-auth.callback-url" 
        : "next-auth.callback-url",
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? '.trainer-booking.com' : undefined
      },
    },
    csrfToken: {
      name: process.env.NODE_ENV === 'production' 
        ? "__Host-next-auth.csrf-token" 
        : "next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    pkceCodeVerifier: {
      name: process.env.NODE_ENV === 'production' 
        ? "__Secure-next-auth.pkce.code_verifier" 
        : "next-auth.pkce.code_verifier",
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 15, // 15 minutes
        domain: process.env.NODE_ENV === 'production' ? '.trainer-booking.com' : undefined
      },
    },
    state: {
      name: process.env.NODE_ENV === 'production' 
        ? "__Secure-next-auth.state" 
        : "next-auth.state",
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 15, // 15 minutes
        domain: process.env.NODE_ENV === 'production' ? '.trainer-booking.com' : undefined
      },
    },
    nonce: {
      name: process.env.NODE_ENV === 'production' 
        ? "__Secure-next-auth.nonce" 
        : "next-auth.nonce",
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? '.trainer-booking.com' : undefined
      },
    }
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        session.user.role = user.role || "trainer"
        
        // Get Google access token
        const account = await prisma.account.findFirst({
          where: {
            userId: user.id,
            provider: 'google'
          }
        })
        
        if (account?.access_token) {
          session.accessToken = account.access_token
          console.log('✅ Session created with Google access token for:', user.email)
        }
      }
      return session
    },

    async signIn({ user, account, profile }) {
      console.log('🔐 Sign in attempt:', {
        provider: account?.provider,
        email: user.email,
        hasAccessToken: !!account?.access_token,
        hasRefreshToken: !!account?.refresh_token
      })
      return true
    }
  },
  pages: {
    signIn: "/login",
  },
  // Add debug logging
  debug: process.env.NODE_ENV === 'development',
}