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
  const [showAvailabilitySettings, setShowAvailabilitySettings] = useState(false)

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
      const response = await fetch('/api/trainer/appointments')
      const data = await response.json()
      if (data.appointments) {
        setAppointments(data.appointments)
        
        const today = new Date().toDateString()
        const todayCount = data.appointments.filter(apt => 
          new Date(apt.datetime).toDateString() === today
        ).length
        setAppointmentsCount(todayCount)
      }
    } catch (error) {
      console.error('Fetch appointments error:', error)
    }
  }

  useEffect(() => {
    const setupTrainer = async () => {
      try {
        await fetch('/api/trainer/setup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        })
      } catch (error) {
        console.error('Setup error:', error)
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
    }
  }, [session])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" 
               style={{animation: 'spin 1s linear infinite'}}></div>
          <div className="text-xl font-medium text-gray-700">טוען...</div>
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
    <div className="min-h-screen bg-blue-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-extrabold text-blue-900">
                🏋️ לוח בקרה למאמן
              </h1>
              <p className="text-lg text-blue-700 mt-2 font-medium">
                שלום <span className="text-blue-900">{session.user?.name || session.user?.email}</span>
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-colors"
              style={{transform: 'translateY(0)', transition: 'all 0.2s ease'}}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              התנתק
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4">
        <div className="space-y-8">
          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            
            {/* Google Calendar Card */}
            <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-blue-100"
                 style={{transition: 'all 0.3s ease', transform: 'translateY(0)'}}
                 onMouseOver={(e) => {
                   e.currentTarget.style.transform = 'translateY(-4px)'
                   e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                 }}
                 onMouseOut={(e) => {
                   e.currentTarget.style.transform = 'translateY(0)'
                   e.currentTarget.style.boxShadow = ''
                 }}>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                      <span className="text-white text-2xl">📅</span>
                    </div>
                  </div>
                  <div className="mr-4 flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">יומן Google</h3>
                    <div className={`text-sm font-semibold px-3 py-1 rounded-full inline-block ${
                      isConnectedToGoogle 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {isConnectedToGoogle ? '✅ מחובר' : '❌ לא מחובר'}
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  {!isConnectedToGoogle ? (
                    <button
                      onClick={handleGoogleCalendarConnect}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold shadow-lg transition-colors"
                    >
                      🔗 חבר יומן Google
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center text-green-700 text-sm font-medium">
                          <span className="mr-2">✅</span>
                          יומן מחובר בהצלחה
                        </div>
                      </div>
                      <button
                        onClick={testCalendarEvent}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold shadow-lg transition-colors"
                      >
                        🧪 בדוק יצירת אירוע
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Booking Link Card */}
            <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-green-100"
                 style={{transition: 'all 0.3s ease', transform: 'translateY(0)'}}
                 onMouseOver={(e) => {
                   e.currentTarget.style.transform = 'translateY(-4px)'
                   e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                 }}
                 onMouseOut={(e) => {
                   e.currentTarget.style.transform = 'translateY(0)'
                   e.currentTarget.style.boxShadow = ''
                 }}>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center shadow-lg">
                      <span className="text-white text-2xl">🔗</span>
                    </div>
                  </div>
                  <div className="mr-4 flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">קישור הזמנה</h3>
                    <div className="bg-gray-100 p-3 rounded-lg border">
                      <p className="text-sm text-gray-700 break-all font-mono">
                        {bookingLink}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={copyBookingLink}
                    className="bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold text-sm shadow-lg transition-colors"
                  >
                    📋 העתק
                  </button>
                  <Link
                    href={bookingLink.replace(window.location.origin, '')}
                    target="_blank"
                    className="bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-semibold text-sm shadow-lg transition-colors text-center"
                  >
                    👀 צפה
                  </Link>
                </div>
              </div>
            </div>

            {/* Appointments Card */}
            <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-purple-100"
                 style={{transition: 'all 0.3s ease', transform: 'translateY(0)'}}
                 onMouseOver={(e) => {
                   e.currentTarget.style.transform = 'translateY(-4px)'
                   e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                 }}
                 onMouseOut={(e) => {
                   e.currentTarget.style.transform = 'translateY(0)'
                   e.currentTarget.style.boxShadow = ''
                 }}>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                      <span className="text-white text-2xl">📊</span>
                    </div>
                  </div>
                  <div className="mr-4 flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">הזמנות היום</h3>
                    <div className="text-4xl font-extrabold text-purple-600">
                      {appointmentsCount}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAvailabilitySettings(true)}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-semibold shadow-lg transition-colors"
                >
                  ⚙️ הגדרות זמינות
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Recent Appointments */}
          <div className="bg-white shadow-lg rounded-lg border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">📋 הזמנות אחרונות</h2>
                <div className="w-20 h-1 bg-blue-600 rounded-full"></div>
              </div>
              
              {appointments.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">📅</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">אין הזמנות עדיין</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    שתף את קישור ההזמנה שלך עם לקוחות כדי להתחיל לקבל הזמנות
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.slice(0, 5).map((appointment: any) => (
                    <div key={appointment.id} 
                         className="flex justify-between items-center p-5 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-4 space-x-reverse">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-lg">
                            {appointment.clientName?.charAt(0) || 'C'}
                          </span>
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-lg">{appointment.clientName}</div>
                          <div className="text-sm text-gray-600">{appointment.clientEmail}</div>
                          {appointment.clientPhone && (
                            <div className="text-sm text-gray-600">{appointment.clientPhone}</div>
                          )}
                        </div>
                      </div>
                      <div className="text-left flex items-center space-x-4 space-x-reverse">
                        <div className="text-center">
                          <div className="font-bold text-gray-900">
                            {new Date(appointment.datetime).toLocaleDateString('he-IL')}
                          </div>
                          <div className="text-sm text-blue-600 font-semibold">
                            {new Date(appointment.datetime).toLocaleTimeString('he-IL', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                        <button
                          onClick={() => deleteAppointment(appointment.id, appointment.clientName)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg transition-colors"
                          title="מחק הזמנה"
                        >
                          🗑️ מחק
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Enhanced Modal */}
      {showAvailabilitySettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
             style={{backdropFilter: 'blur(4px)'}}>
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-auto"
               style={{animation: 'fadeIn 0.3s ease-out'}}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  ⚙️ הגדרות זמינות
                </h3>
                <button
                  onClick={() => setShowAvailabilitySettings(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <p className="text-gray-700 text-center">
                    כאן תוכל להגדיר את שעות הזמינות שלך ואת סוגי האימונים שאתה מציע.
                  </p>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <div className="flex items-center text-yellow-800">
                    <span className="text-xl mr-2">⚠️</span>
                    <p className="font-semibold">תכונה זו תהיה זמינה בקרוב...</p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setShowAvailabilitySettings(false)}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-semibold shadow-lg transition-colors"
              >
                סגור
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  )
}