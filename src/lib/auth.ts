// src/lib/auth.ts
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "./prisma"

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
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
      allowDangerousEmailAccountLinking: true // This allows linking existing accounts
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
          console.log('✅ Session created with Google access token')
        }
      }
      return session
    },

    async signIn({ user, account, profile }) {
      console.log('🔐 Sign in attempt:', {
        provider: account?.provider,
        email: user.email,
        hasAccessToken: !!account?.access_token
      })
      return true
    }
  },
  pages: {
    signIn: "/login",
  }
}