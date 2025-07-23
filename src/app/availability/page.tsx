// src/app/availability/page.tsx - Fixed icon sizes
'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface TimeSlot {
  start: string
  end: string
  isAvailable: boolean
}

interface DayAvailability {
  [key: string]: TimeSlot[]
}

export default function AvailabilitySettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [availability, setAvailability] = useState<DayAvailability>({
    sunday: [{ start: '09:00', end: '17:00', isAvailable: true }],
    monday: [{ start: '09:00', end: '17:00', isAvailable: true }],
    tuesday: [{ start: '09:00', end: '17:00', isAvailable: true }],
    wednesday: [{ start: '09:00', end: '17:00', isAvailable: true }],
    thursday: [{ start: '09:00', end: '17:00', isAvailable: true }],
    friday: [{ start: '09:00', end: '13:00', isAvailable: true }],
    saturday: [{ start: '10:00', end: '14:00', isAvailable: false }]
  })

  const [sessionDuration, setSessionDuration] = useState(60)
  const [breakBetweenSessions, setBreakBetweenSessions] = useState(15)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const daysInHebrew = {
    sunday: 'ראשון',
    monday: 'שני',
    tuesday: 'שלישי',
    wednesday: 'רביעי',
    thursday: 'חמישי',
    friday: 'שישי',
    saturday: 'שבת'
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      loadAvailabilitySettings()
    }
  }, [session])

  const loadAvailabilitySettings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/trainer/availability')
      const data = await response.json()
      
      if (data.success && data.availability) {
        setAvailability(data.availability)
        setSessionDuration(data.sessionDuration || 60)
        setBreakBetweenSessions(data.breakBetweenSessions || 15)
      }
    } catch (error) {
      console.error('Error loading availability:', error)
    }
    setLoading(false)
  }

  const saveAvailabilitySettings = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/trainer/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          availability,
          sessionDuration,
          breakBetweenSessions
        })
      })

      const data = await response.json()
      
      if (data.success) {
        alert('✅ הגדרות הזמינות נשמרו בהצלחה!')
        router.push('/dashboard')
      } else {
        alert('❌ שגיאה בשמירת ההגדרות: ' + data.error)
      }
    } catch (error) {
      console.error('Error saving availability:', error)
      alert('❌ שגיאה בשמירת ההגדרות')
    }
    setSaving(false)
  }

  const updateDayAvailability = (day: string, index: number, field: 'start' | 'end' | 'isAvailable', value: string | boolean) => {
    setAvailability(prev => ({
      ...prev,
      [day]: prev[day].map((slot, i) => 
        i === index ? { ...slot, [field]: value } : slot
      )
    }))
  }

  const addTimeSlot = (day: string) => {
    const lastSlot = availability[day][availability[day].length - 1]
    const newStartTime = lastSlot ? lastSlot.end : '09:00'
    
    setAvailability(prev => ({
      ...prev,
      [day]: [
        ...prev[day],
        { start: newStartTime, end: '17:00', isAvailable: true }
      ]
    }))
  }

  const removeTimeSlot = (day: string, index: number) => {
    if (availability[day].length <= 1) return
    
    setAvailability(prev => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index)
    }))
  }

  const toggleDayAvailability = (day: string) => {
    setAvailability(prev => ({
      ...prev,
      [day]: prev[day].map(slot => ({
        ...slot,
        isAvailable: !prev[day][0].isAvailable
      }))
    }))
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mb-4"></div>
          <div className="text-lg font-medium text-gray-700">טוען הגדרות זמינות...</div>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Link 
                href="/dashboard"
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                חזור
              </Link>
              <div className="w-6 h-6 bg-gray-900 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">הגדרות זמינות</h1>
                <p className="text-sm text-gray-500">הגדרת שעות עבודה ואימונים</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Session Settings */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">הגדרות אימון</h2>
              <p className="text-sm text-gray-500">משך אימון והפסקות</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    משך אימון
                  </label>
                  <select
                    value={sessionDuration}
                    onChange={(e) => setSessionDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  >
                    <option value={30}>30 דקות</option>
                    <option value={45}>45 דקות</option>
                    <option value={60}>60 דקות</option>
                    <option value={90}>90 דקות</option>
                    <option value={120}>120 דקות</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    הפסקה בין אימונים
                  </label>
                  <select
                    value={breakBetweenSessions}
                    onChange={(e) => setBreakBetweenSessions(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  >
                    <option value={0}>ללא הפסקה</option>
                    <option value={15}>15 דקות</option>
                    <option value={30}>30 דקות</option>
                    <option value={45}>45 דקות</option>
                    <option value={60}>60 דקות</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Schedule */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">לוח שבועי</h2>
              <p className="text-sm text-gray-500">הגדרת שעות עבודה לכל יום בשבוע</p>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {Object.entries(daysInHebrew).map(([dayKey, dayName]) => (
                  <div key={dayKey} className="border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-t-lg">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <h3 className="text-sm font-semibold text-gray-900">{dayName}</h3>
                        <button
                          onClick={() => toggleDayAvailability(dayKey)}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            availability[dayKey][0]?.isAvailable
                              ? 'bg-gray-900 text-white'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {availability[dayKey][0]?.isAvailable ? 'פעיל' : 'לא פעיל'}
                        </button>
                      </div>
                      {availability[dayKey][0]?.isAvailable && (
                        <button
                          onClick={() => addTimeSlot(dayKey)}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          הוסף שעות
                        </button>
                      )}
                    </div>

                    {availability[dayKey][0]?.isAvailable && (
                      <div className="p-4 space-y-3">
                        {availability[dayKey].map((slot, index) => (
                          <div key={index} className="flex items-center space-x-3 space-x-reverse">
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <label className="text-xs font-medium text-gray-600 w-8">מ:</label>
                              <input
                                type="time"
                                value={slot.start}
                                onChange={(e) => updateDayAvailability(dayKey, index, 'start', e.target.value)}
                                className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-transparent"
                              />
                            </div>
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <label className="text-xs font-medium text-gray-600 w-8">עד:</label>
                              <input
                                type="time"
                                value={slot.end}
                                onChange={(e) => updateDayAvailability(dayKey, index, 'end', e.target.value)}
                                className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-transparent"
                              />
                            </div>
                            {availability[dayKey].length > 1 && (
                              <button
                                onClick={() => removeTimeSlot(dayKey, index)}
                                className="inline-flex items-center p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                title="הסר שעות"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              ביטול
            </Link>
            <button
              onClick={saveAvailabilitySettings}
              disabled={saving}
              className={`inline-flex items-center px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                saving
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-white rounded-full animate-spin ml-2"></div>
                  שומר...
                </>
              ) : (
                'שמור הגדרות'
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}