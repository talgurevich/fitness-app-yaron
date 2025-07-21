import './globals.css'
import { Inter } from 'next/font/google'
import { NextAuthProvider } from './providers'
import Header from '@/components/Header'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'מערכת הזמנות למאמני כושר',
  description: 'מערכת הזמנות פשוטה למאמני כושר',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="rtl">
      <body className={inter.className}>
        <NextAuthProvider>
          <Header />
          <main className="min-h-screen bg-gray-50">{children}</main>
        </NextAuthProvider>
      </body>
    </html>
  )
}
