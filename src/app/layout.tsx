// src/app/layout.tsx
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from './providers'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  title: 'FitnessPro - מערכת הזמנות למאמני כושר',
  description: 'פלטפורמה מקצועית לניהול הזמנות עם חיבור ליומן Google ומעקב אחר לקוחות',
  keywords: 'מאמן כושר, הזמנות, יומן Google, ניהול לקוחות, אימונים',
  authors: [{ name: 'FitnessPro' }],
  robots: 'index, follow',
  openGraph: {
    title: 'FitnessPro - מערכת הזמנות למאמני כושר',
    description: 'פלטפורמה מקצועית לניהול הזמנות עם חיבור ליומן Google',
    type: 'website',
    locale: 'he_IL',
    alternateLocale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FitnessPro - מערכת הזמנות למאמני כושר',
    description: 'פלטפורמה מקצועית לניהול הזמנות עם חיבור ליומן Google',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="FitnessPro" />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}