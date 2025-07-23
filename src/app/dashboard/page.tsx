// src/app/dashboard/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AvailabilitySettings from '@/components/AvailabilitySettings'

interface Appointment {
  id: string
  clientName: string
  clientEmail: string
  datetime: string
  duration: number
  status: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [showAvailabilitySettings, setShowAvailabilitySettings] = useState(false)
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/login')
      return
    }

    fetchUpcomingAppointments()
  }, [session, status, router])

  const fetchUpcomingAppointments = async () => {
    try {
      const response = await fetch('/api/trainer/appointments')
      const data = await response.json()
      
      if (data.success) {
        setUpcomingAppointments(data.appointments || [])
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('he-IL', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('he-IL', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'booked': return 'bg-blue-100 text-blue-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'הושלם'
      case 'booked': return 'מתוכנן'
      case 'cancelled': return 'בוטל'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700">טוען דשבורד...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    דשבורד מאמן
                  </h1>
                  <p className="text-sm text-gray-500">
                    שלום, {session?.user?.name || session?.user?.email}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 space-x-reverse">
              <Link
                href={`/book/${session?.user?.email?.split('@')[0]?.replace(/[^a-zA-Z0-9]/g, '-')}`}
                target="_blank"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                🔗 לינק הזמנה
              </Link>
              <button
                onClick={() => signOut()}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                יציאה
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white p-6">
              <h2 className="text-2xl font-bold mb-2">
                ברוך הבא למערכת הזמנות הכושר! 💪
              </h2>
              <p className="text-blue-100 mb-4">
                נהל את הלקוחות שלך, קבע זמינות וצפה באימונים הקרובים
              </p>
              <div className="flex space-x-3 space-x-reverse">
                <button
                  onClick={() => setShowAvailabilitySettings(true)}
                  className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  ⚙️ הגדר זמינות
                </button>
                <Link
                  href="/clients"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  👥 צפה בלקוחות
                </Link>
              </div>
            </div>

            {/* Client Management Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">ניהול לקוחות</h3>
                    <p className="text-sm text-gray-600">נהל את הלקוחות שלך ופרטיהם</p>
                  </div>
                </div>
                <Link
                  href="/clients"
                  className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  צפה בכל הלקוחות
                </Link>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">-</div>
                  <div className="text-xs text-gray-600">סה"כ לקוחות</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">-</div>
                  <div className="text-xs text-gray-600">פעילים החודש</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">-</div>
                  <div className="text-xs text-gray-600">אימונים השבוע</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">-</div>
                  <div className="text-xs text-gray-600">לקוחות חדשים</div>
                </div>
              </div>
              
              <div className="mt-4 flex space-x-2 space-x-reverse">
                <Link
                  href="/clients"
                  className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-center"
                >
                  👥 רשימת לקוחות
                </Link>
                <button className="flex-1 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">
                  📅 קבע אימון
                </button>
              </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">אימונים קרובים</h3>
                <span className="text-sm text-gray-500">
                  {upcomingAppointments.length} אימונים מתוכננים
                </span>
              </div>
              
              {upcomingAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">אין אימונים מתוכננים</h4>
                  <p className="text-gray-600 mb-4">אימונים חדשים יופיעו כאן כשלקוחות יזמינו</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingAppointments.slice(0, 5).map((appointment) => {
                    const { date, time } = formatDateTime(appointment.datetime)
                    return (
                      <div key={appointment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{appointment.clientName}</div>
                            <div className="text-sm text-gray-600">{appointment.clientEmail}</div>
                            <div className="text-sm text-gray-500">{appointment.duration} דקות</div>
                          </div>
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-gray-900">{date}</div>
                          <div className="text-sm text-gray-600">{time}</div>
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${getStatusColor(appointment.status)}`}>
                            {getStatusText(appointment.status)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                  
                  {upcomingAppointments.length > 5 && (
                    <div className="text-center pt-4">
                      <Link 
                        href="/appointments" 
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        צפה בכל האימונים ({upcomingAppointments.length})
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            
            {/* Quick Stats */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">סטטיסטיקות מהירות</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">אימונים היום</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {upcomingAppointments.filter(apt => {
                      const today = new Date().toDateString()
                      const aptDate = new Date(apt.datetime).toDateString()
                      return today === aptDate
                    }).length}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">השבוע</span>
                  <span className="text-2xl font-bold text-green-600">
                    {upcomingAppointments.length}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">לקוחות פעילים</span>
                  <span className="text-2xl font-bold text-purple-600">-</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">פעולות מהירות</h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => setShowAvailabilitySettings(true)}
                  className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-right"
                >
                  ⚙️ הגדר זמינות
                </button>
                
                <Link
                  href="/clients"
                  className="block w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-right"
                >
                  👥 נהל לקוחות
                </Link>
                
                <button className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 text-right">
                  📅 קבע אימון חדש
                </button>
                
                <Link
                  href={`/book/${session?.user?.email?.split('@')[0]?.replace(/[^a-zA-Z0-9]/g, '-')}`}
                  target="_blank"
                  className="block w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 text-right"
                >
                  🔗 שתף לינק הזמנה
                </Link>
              </div>
            </div>

            {/* Profile Summary */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">הפרופיל שלי</h3>
              
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600">שם:</span>
                  <span className="font-medium text-gray-900 mr-2">
                    {session?.user?.name || 'לא הוגדר'}
                  </span>
                </div>
                
                <div>
                  <span className="text-gray-600">אימייל:</span>
                  <span className="font-medium text-gray-900 mr-2">
                    {session?.user?.email}
                  </span>
                </div>
                
                <div>
                  <span className="text-gray-600">לינק הזמנה:</span>
                  <div className="mt-1">
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                      /book/{session?.user?.email?.split('@')[0]?.replace(/[^a-zA-Z0-9]/g, '-')}
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Availability Settings Modal */}
      {showAvailabilitySettings && (
        <AvailabilitySettings onClose={() => setShowAvailabilitySettings(false)} />
      )}
    </div>
  )
}