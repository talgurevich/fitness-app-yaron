// src/app/login/page.tsx - Fixed styling and logo size
'use client'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) {
      router.push('/dashboard')
    }
  }, [session, router])

  if (session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700">מפנה לדשבורד...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          כניסה למערכת
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          מערכת הזמנות אימונים למאמנים
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <button
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              {/* Properly sized Google logo */}
              <svg className="w-4 h-4 mr-3 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              המשך עם Google
            </button>

            {/* Privacy Policy Notice */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500 leading-relaxed">
                בהמשך השימוש, אתה מסכים ל
                <Link href="/terms" className="text-blue-600 hover:text-blue-800 underline mx-1">
                  תנאי השירות
                </Link>
                ול
                <Link href="/privacy" className="text-blue-600 hover:text-blue-800 underline mx-1">
                  מדיניות הפרטיות
                </Link>
                שלנו.
              </p>
            </div>
          </div>
        </div>

        {/* Additional Footer Links */}
        <div className="mt-6 text-center">
          <div className="flex justify-center space-x-4 space-x-reverse text-sm">
            <Link href="/privacy" className="text-gray-600 hover:text-gray-900 transition-colors">
              מדיניות פרטיות
            </Link>
            <span className="text-gray-300">•</span>
            <Link href="/contact" className="text-gray-600 hover:text-gray-900 transition-colors">
              צור קשר
            </Link>
            <span className="text-gray-300">•</span>
            <Link href="/help" className="text-gray-600 hover:text-gray-900 transition-colors">
              עזרה
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}