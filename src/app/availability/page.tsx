// src/app/availability/page.tsx
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

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // Load existing availability settings
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
    if (availability[day].length <= 1) return // Keep at least one slot
    
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
      <div className="flex items-center justify-center min-h-screen bg-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl font-medium text-gray-700">טוען הגדרות זמינות...</div>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link 
                href="/dashboard"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium text-sm mr-4 transition-colors"
              >
                ← חזור לדשבורד
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-blue-900">⚙️ הגדרות זמינות</h1>
                <p className="text-blue-700 mt-1">הגדר את שעות הזמינות שלך ואת סוגי האימונים</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto py-8 px-4">
        <div className="space-y-8">
          {/* Session Settings Card */}
          <div className="bg-white shadow-lg rounded-lg border border-blue-100">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                🎯 הגדרות אימון
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <label className="block text-sm font-semibold text-blue-900 mb-3">
                    ⏱️ משך אימון (דקות)
                  </label>
                  <select
                    value={sessionDuration}
                    onChange={(e) => setSessionDuration(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-lg font-medium"
                  >
                    <option value={30}>30 דקות</option>
                    <option value={45}>45 דקות</option>
                    <option value={60}>60 דקות (המלצה)</option>
                    <option value={90}>90 דקות</option>
                    <option value={120}>120 דקות</option>
                  </select>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <label className="block text-sm font-semibold text-green-900 mb-3">
                    ☕ הפסקה בין אימונים (דקות)
                  </label>
                  <select
                    value={breakBetweenSessions}
                    onChange={(e) => setBreakBetweenSessions(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-green-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-lg font-medium"
                  >
                    <option value={0}>ללא הפסקה</option>
                    <option value={15}>15 דקות (המלצה)</option>
                    <option value={30}>30 דקות</option>
                    <option value={45}>45 דקות</option>
                    <option value={60}>60 דקות</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Schedule Card */}
          <div className="bg-white shadow-lg rounded-lg border border-blue-100">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                📅 לוח שבועי
              </h2>
              
              <div className="space-y-6">
                {Object.entries(daysInHebrew).map(([dayKey, dayName]) => (
                  <div key={dayKey} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <h3 className="text-xl font-bold text-gray-900 mr-4">{dayName}</h3>
                        <button
                          onClick={() => toggleDayAvailability(dayKey)}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                            availability[dayKey][0]?.isAvailable
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {availability[dayKey][0]?.isAvailable ? '✅ פעיל' : '❌ לא פעיל'}
                        </button>
                      </div>
                      {availability[dayKey][0]?.isAvailable && (
                        <button
                          onClick={() => addTimeSlot(dayKey)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-lg"
                        >
                          + הוסף שעות
                        </button>
                      )}
                    </div>

                    {availability[dayKey][0]?.isAvailable && (
                      <div className="space-y-3">
                        {availability[dayKey].map((slot, index) => (
                          <div key={index} className="flex items-center space-x-3 space-x-reverse bg-gray-50 p-4 rounded-lg border">
                            <div className="flex items-center space-x-3 space-x-reverse flex-1">
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <label className="text-sm font-semibold text-gray-700 min-w-8">מ:</label>
                                <input
                                  type="time"
                                  value={slot.start}
                                  onChange={(e) => updateDayAvailability(dayKey, index, 'start', e.target.value)}
                                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <label className="text-sm font-semibold text-gray-700 min-w-8">עד:</label>
                                <input
                                  type="time"
                                  value={slot.end}
                                  onChange={(e) => updateDayAvailability(dayKey, index, 'end', e.target.value)}
                                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                            </div>
                            {availability[dayKey].length > 1 && (
                              <button
                                onClick={() => removeTimeSlot(dayKey, index)}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
                                title="הסר שעות"
                              >
                                🗑️
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
          <div className="flex justify-between items-center bg-white shadow-lg rounded-lg border border-blue-100 p-6">
            <Link
              href="/dashboard"
              className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg"
            >
              ביטול
            </Link>
            <button
              onClick={saveAvailabilitySettings}
              disabled={saving}
              className={`px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg ${
                saving
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {saving ? '💾 שומר...' : '💾 שמור הגדרות'}
            </button>
          </div>
        </div>
      </main>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  )
}