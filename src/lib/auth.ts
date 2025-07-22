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
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // For now, just return a dummy user for testing
        if (credentials?.email === "test@test.com" && credentials?.password === "123456") {
          return {
            id: "1",
            email: "test@test.com",
            name: "Test Trainer",
            role: "trainer"
          }
        }
        return null
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events",
          access_type: "offline",
          prompt: "consent"
        }
      }
    })
  ],
  session: {
    strategy: "database" // Changed from "jwt" to "database"
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        session.user.role = user.role || "trainer"
        
        // Get the user's Google access token
        const account = await prisma.account.findFirst({
          where: {
            userId: user.id,
            provider: 'google'
          }
        })
        
        if (account?.access_token) {
          session.accessToken = account.access_token
        }
      }
      return session
    },

    async signIn({ user, account, profile }) {
      // Allow all sign-ins
      if (account?.provider === "google") {
        console.log("🔗 Google account connected:", {
          email: user.email,
          hasAccessToken: !!account.access_token,
          hasRefreshToken: !!account.refresh_token,
          scope: account.scope
        })
      }
      return true
    }
  },
  pages: {
    signIn: "/login",
  },
  events: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        console.log("📅 Google authentication successful:", {
          email: user.email,
          accessToken: !!account.access_token,
          refreshToken: !!account.refresh_token
        })
      }
    }
  }
}