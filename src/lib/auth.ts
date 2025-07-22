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
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // Store user role
      if (user) {
        token.role = user.role || "trainer"
      }
      
      // Store access token in JWT for immediate use
      if (account?.access_token) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.expiresAt = account.expires_at
      }
      
      return token
    },
    
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.accessToken = token.accessToken as string
      }
      return session
    },

    async signIn({ user, account, profile }) {
      // For Google sign-ins, ensure we store all necessary data
      if (account?.provider === "google") {
        console.log("Google sign-in successful for:", user.email)
        console.log("Access token received:", !!account.access_token)
        console.log("Refresh token received:", !!account.refresh_token)
      }
      return true
    }
  },
  pages: {
    signIn: "/login",
  },
  events: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        console.log("🔗 Google account connected:", {
          email: user.email,
          hasAccessToken: !!account.access_token,
          hasRefreshToken: !!account.refresh_token,
          scope: account.scope
        })
      }
    }
  }
}