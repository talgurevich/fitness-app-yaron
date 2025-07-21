// src/components/AvailabilitySettings.tsx
'use client'
import { useState, useEffect } from 'react'

interface TimeSlot {
  start: string
  end: string
  isAvailable: boolean
}

interface DayAvailability {
  [key: string]: TimeSlot[]
}

interface AvailabilitySettingsProps {
  onClose: () => void
}

export default function AvailabilitySettings({ onClose }: AvailabilitySettingsProps) {
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
  const [loading, setLoading] = useState(false)
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

  // Load existing availability settings
  useEffect(() => {
    loadAvailabilitySettings()
  }, [])

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
        onClose()
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

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700">טוען הגדרות זמינות...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full mx-auto my-8">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">⚙️ הגדרות זמינות</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 max-h-96 overflow-y-auto">
          {/* Session Settings */}
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 הגדרות אימון</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  משך אימון (דקות)
                </label>
                <select
                  value={sessionDuration}
                  onChange={(e) => setSessionDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={30}>30 דקות</option>
                  <option value={45}>45 דקות</option>
                  <option value={60}>60 דקות</option>
                  <option value={90}>90 דקות</option>
                  <option value={120}>120 דקות</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  הפסקה בין אימונים (דקות)
                </label>
                <select
                  value={breakBetweenSessions}
                  onChange={(e) => setBreakBetweenSessions(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
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

          {/* Weekly Schedule */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">📅 לוח שבועי</h3>
            
            {Object.entries(daysInHebrew).map(([dayKey, dayName]) => (
              <div key={dayKey} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <h4 className="text-lg font-medium text-gray-900 mr-3">{dayName}</h4>
                    <button
                      onClick={() => toggleDayAvailability(dayKey)}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        availability[dayKey][0]?.isAvailable
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {availability[dayKey][0]?.isAvailable ? '✅ פעיל' : '❌ לא פעיל'}
                    </button>
                  </div>
                  {availability[dayKey][0]?.isAvailable && (
                    <button
                      onClick={() => addTimeSlot(dayKey)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      + הוסף שעות
                    </button>
                  )}
                </div>

                {availability[dayKey][0]?.isAvailable && (
                  <div className="space-y-2">
                    {availability[dayKey].map((slot, index) => (
                      <div key={index} className="flex items-center space-x-2 space-x-reverse bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <label className="text-sm font-medium text-gray-700">מ:</label>
                          <input
                            type="time"
                            value={slot.start}
                            onChange={(e) => updateDayAvailability(dayKey, index, 'start', e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <label className="text-sm font-medium text-gray-700">עד:</label>
                          <input
                            type="time"
                            value={slot.end}
                            onChange={(e) => updateDayAvailability(dayKey, index, 'end', e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        {availability[dayKey].length > 1 && (
                          <button
                            onClick={() => removeTimeSlot(dayKey, index)}
                            className="text-red-600 hover:text-red-700 text-sm"
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

        <div className="p-6 border-t border-gray-200 flex justify-between">
          <button
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            ביטול
          </button>
          <button
            onClick={saveAvailabilitySettings}
            disabled={saving}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              saving
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {saving ? '💾 שומר...' : '💾 שמור הגדרות'}
          </button>
        </div>
      </div>

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