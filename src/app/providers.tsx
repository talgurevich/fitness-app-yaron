// src/app/providers.tsx
'use client'
import { SessionProvider } from 'next-auth/react'
import { LanguageProvider } from '@/components/LanguageToggle'

interface ProvidersProps {
  children: React.ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </SessionProvider>
  )
}