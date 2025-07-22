// src/lib/prisma-adapter.ts
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "./prisma"

export function CustomPrismaAdapter(p: typeof prisma) {
  const adapter = PrismaAdapter(p)
  
  return {
    ...adapter,
    linkAccount: async (account: any) => {
      // Filter out the problematic field
      const { refresh_token_expires_in, ...accountData } = account
      
      console.log('🔗 Linking account (filtered):', {
        provider: accountData.provider,
        hasAccessToken: !!accountData.access_token,
        hasRefreshToken: !!accountData.refresh_token,
        filteredField: !!refresh_token_expires_in
      })
      
      return await p.account.create({
        data: accountData
      })
    }
  }
}