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
        // Refresh appointments list
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
        
        // Count today's appointments
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
    // Setup trainer profile when component loads
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
    // Generate booking link based on user email
    if (session?.user?.email) {
      const slug = session.user.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '-')
      setBookingLink(`${window.location.origin}/book/${slug}`)
    }
  }, [session])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">טוען...</div>
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
        
        // Also log the direct link
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
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                לוח בקרה למאמן
              </h1>
              <p className="text-gray-600">שלום {session.user?.name || session.user?.email}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
            >
              התנתק
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            
            {/* Google Calendar Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">G</span>
                    </div>
                  </div>
                  <div className="mr-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        יומן Google
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {isConnectedToGoogle ? 'מחובר' : 'לא מחובר'}
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-5">
                  {!isConnectedToGoogle ? (
                    <button
                      onClick={handleGoogleCalendarConnect}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
                    >
                      חבר יומן Google
                    </button>
                  ) : (
                    <div>
                      <div className="text-green-600 text-sm mb-2">✓ מחובר בהצלחה</div>
                      <button
                        onClick={testCalendarEvent}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md text-sm"
                      >
                        בדוק יצירת אירוע
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Booking Link Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">🔗</span>
                    </div>
                  </div>
                  <div className="mr-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        קישור הזמנה
                      </dt>
                      <dd className="text-sm font-medium text-gray-900 break-all">
                        {bookingLink}
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-5 flex space-x-2 space-x-reverse">
                  <button
                    onClick={copyBookingLink}
                    className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md text-sm"
                  >
                    העתק קישור
                  </button>
                  <Link
                    href={bookingLink.replace(window.location.origin, '')}
                    target="_blank"
                    className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md text-sm"
                  >
                    צפה בדף
                  </Link>
                </div>
              </div>
            </div>

            {/* Appointments Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">📅</span>
                    </div>
                  </div>
                  <div className="mr-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        הזמנות היום
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {appointmentsCount}
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-5">
                  <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md">
                    צפה בכל ההזמנות
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Appointments */}
          <div className="mt-8">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  הזמנות אחרונות
                </h3>
                <div className="text-center py-8 text-gray-500">
                  {appointments.length === 0 ? (
                    <>
                      <p>אין הזמנות עדיין</p>
                      <p className="text-sm mt-2">שתף את קישור ההזמנה שלך עם לקוחות כדי להתחיל לקבל הזמנות</p>
                    </>
                  ) : (
                    <div className="space-y-4">
                      {appointments.slice(0, 5).map((appointment: any) => (
                        <div key={appointment.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium">{appointment.clientName}</div>
                            <div className="text-sm text-gray-600">{appointment.clientEmail}</div>
                            {appointment.clientPhone && (
                              <div className="text-sm text-gray-600">{appointment.clientPhone}</div>
                            )}
                          </div>
                          <div className="text-right flex items-center space-x-2 space-x-reverse">
                            <div>
                              <div className="font-medium">
                                {new Date(appointment.datetime).toLocaleDateString('he-IL')}
                              </div>
                              <div className="text-sm text-gray-600">
                                {new Date(appointment.datetime).toLocaleTimeString('he-IL', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </div>
                            </div>
                            <button
                              onClick={() => deleteAppointment(appointment.id, appointment.clientName)}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                              title="מחק הזמנה"
                            >
                              מחק
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Availability Settings Modal */}
      {showAvailabilitySettings && (
        <AvailabilitySettings 
          onClose={() => setShowAvailabilitySettings(false)} 
        />
      )}
    </div>
  )
}