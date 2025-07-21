// src/app/dashboard/page.tsx
'use client'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [bookingLink, setBookingLink] = useState('')
  const [isConnectedToGoogle, setIsConnectedToGoogle] = useState(false)

  const [appointments, setAppointments] = useState([])
  const [appointmentsCount, setAppointmentsCount] = useState(0)

  const deleteAppointment = async (appointmentId: string, clientName: string) => {
    if (!confirm(`האם אתה בטוח שברצונך למחוק את ההזמנה של ${clientName}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/bookings/${appointmentId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        alert('ההזמנה נמחקה בהצלחה')
        fetchAppointments()
      } else {
        alert('שגיאה במחיקת ההזמנה: ' + data.error)
      }
    } catch (error) {
      console.error('Delete appointment error:', error)
      alert('שגיאה במחיקת ההזמנה')
    }
  }

  const fetchAppointments = async () => {
    try {
      console.log('🔍 Fetching appointments...')
      const response = await fetch('/api/trainer/appointments')
      const data = await response.json()
      
      console.log('📋 Response:', data)
      console.log('📊 Status:', response.status)
      
      if (data.appointments) {
        console.log('✅ Found appointments:', data.appointments.length)
        console.log('📅 Appointments data:', data.appointments)
        setAppointments(data.appointments)
        
        const today = new Date().toDateString()
        const todayCount = data.appointments.filter(apt => 
          new Date(apt.datetime).toDateString() === today
        ).length
        setAppointmentsCount(todayCount)
        console.log('📈 Today count:', todayCount)
      } else {
        console.log('❌ No appointments in response')
        console.log('🔍 Full response:', data)
      }
    } catch (error) {
      console.error('💥 Fetch appointments error:', error)
    }
  }

  useEffect(() => {
    const setupTrainer = async () => {
      try {
        console.log('🚀 Setting up trainer...')
        const response = await fetch('/api/trainer/setup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        })
        const data = await response.json()
        console.log('🎯 Trainer setup result:', data)
      } catch (error) {
        console.error('💥 Setup error:', error)
      }
    }

    if (session) {
      setupTrainer()
      fetchAppointments()
    }
  }, [session])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.email) {
      const slug = session.user.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '-')
      setBookingLink(`${window.location.origin}/book/${slug}`)
      console.log('🔗 Generated booking link:', `${window.location.origin}/book/${slug}`)
    }
  }, [session])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mb-4"></div>
          <div className="text-lg font-medium text-gray-700">טוען...</div>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const handleGoogleCalendarConnect = async () => {
    try {
      const response = await fetch('/api/calendar/connect')
      const data = await response.json()
      
      if (data.success) {
        setIsConnectedToGoogle(true)
        alert('יומן Google חובר בהצלחה! נמצאו ' + (data.calendars?.length || 0) + ' יומנים.')
      } else if (data.needsGoogleAuth) {
        alert('עליך להתחבר עם Google כדי לגשת ליומן. אנא התנתק והתחבר שוב עם Google.')
      } else if (data.needsReauth) {
        alert('צריך לאשר הרשאות מחדש. אנא התנתק והתחבר שוב עם Google.')
      } else {
        alert('שגיאה בחיבור: ' + data.error)
      }
    } catch (error) {
      console.error('Calendar connection error:', error)
      alert('שגיאה בחיבור ליומן Google')
    }
  }

  const testCalendarEvent = async () => {
    try {
      alert('בודק יצירת אירוע ביומן...')
      
      const response = await fetch('/api/calendar/test', {
        method: 'POST'
      })
      
      const data = await response.json()
      
      if (data.success) {
        const message = `✅ אירוע נוצר בהצלחה!
        
📅 תאריך: ${data.eventDate}
⏰ שעה: ${data.eventTime}
🔗 קישור: ${data.eventLink}

📊 יומנים זמינים: ${data.calendars?.length || 0}

בדוק את היומן הראשי שלך ב-Google Calendar`
        
        alert(message)
        console.log('Test event created:', data)
        
        if (data.eventLink) {
          console.log('Direct event link:', data.eventLink)
        }
      } else {
        alert('❌ שגיאה ביצירת אירוע: ' + data.error)
        console.error('Calendar test failed:', data)
      }
    } catch (error) {
      console.error('Test calendar error:', error)
      alert('שגיאה בבדיקת היומן')
    }
  }

  const copyBookingLink = () => {
    navigator.clipboard.writeText(bookingLink)
    alert('קישור הועתק ללוח!')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  לוח בקרה למאמן
                </h1>
                <p className="text-sm text-gray-500">
                  {session.user?.name || session.user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              יציאה
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          
          {/* Google Calendar Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">יומן Google</h3>
                  <p className="text-xs text-gray-500">סטטוס חיבור</p>
                </div>
              </div>
              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                isConnectedToGoogle 
                  ? 'bg-gray-100 text-gray-800' 
                  : 'bg-gray-50 text-gray-600'
              }`}>
                {isConnectedToGoogle ? 'מחובר' : 'לא מחובר'}
              </div>
            </div>
            
            <div className="mt-4">
              {!isConnectedToGoogle ? (
                <button
                  onClick={handleGoogleCalendarConnect}
                  className="w-full bg-gray-900 text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  חיבור ליומן
                </button>
              ) : (
                <button
                  onClick={testCalendarEvent}
                  className="w-full bg-gray-100 text-gray-900 text-sm font-medium py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  בדוק חיבור
                </button>
              )}
            </div>
          </div>

          {/* Booking Link Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">קישור הזמנה</h3>
                  <p className="text-xs text-gray-500">שיתוף עם לקוחות</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-xs text-gray-600 font-mono break-all">
                {bookingLink}
              </p>
            </div>
            
            <div className="flex space-x-2 space-x-reverse">
              <button
                onClick={copyBookingLink}
                className="flex-1 bg-gray-900 text-white text-sm font-medium py-2 px-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                העתק
              </button>
              <Link
                href={bookingLink.replace(window.location.origin, '')}
                target="_blank"
                className="flex-1 bg-gray-100 text-gray-900 text-sm font-medium py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors text-center"
              >
                צפה
              </Link>
            </div>
          </div>

          {/* Appointments Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">הזמנות היום</h3>
                  <p className="text-xs text-gray-500">סה"כ אימונים</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {appointmentsCount}
              </div>
            </div>
            
            <Link 
              href="/availability"
              className="w-full bg-gray-100 text-gray-900 text-sm font-medium py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-center block"
            >
              הגדרות זמינות
            </Link>
          </div>
        </div>

        {/* Recent Appointments */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">הזמנות אחרונות</h2>
          </div>
          
          <div className="p-6">
            {appointments.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">אין הזמנות</h3>
                <p className="text-sm text-gray-500 max-w-sm mx-auto">
                  שתף את קישור ההזמנה שלך עם לקוחות כדי להתחיל לקבל הזמנות
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.slice(0, 5).map((appointment: any) => (
                  <div key={appointment.id} 
                       className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {appointment.clientName?.charAt(0) || 'C'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{appointment.clientName}</p>
                        <p className="text-xs text-gray-500">{appointment.clientEmail}</p>
                        {appointment.clientPhone && (
                          <p className="text-xs text-gray-500">{appointment.clientPhone}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(appointment.datetime).toLocaleDateString('he-IL')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(appointment.datetime).toLocaleTimeString('he-IL', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteAppointment(appointment.id, appointment.clientName)}
                        className="inline-flex items-center p-2 border border-gray-200 rounded-lg text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors"
                        title="מחק הזמנה"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}