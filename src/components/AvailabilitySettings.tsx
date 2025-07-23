// src/components/AvailabilitySettings.tsx - Fixed icon sizes
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

  const daysInEnglish = {
    sunday: 'Sunday',
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday'
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
        alert('✅ Availability settings saved successfully!')
        onClose()
      } else {
        alert('❌ Error saving settings: ' + data.error)
      }
    } catch (error) {
      console.error('Error saving availability:', error)
      alert('❌ Error saving settings')
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
        <div className="bg-white rounded-2xl shadow-2xl p-12 text-center max-w-md w-full">
          <div className="w-4 h-4 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-700 text-lg">Loading availability settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full mx-auto my-8">
        <div className="p-8 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Availability Settings</h2>
                <p className="text-gray-600">Configure your working hours and session preferences</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-6 h-6 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-8 max-h-[70vh] overflow-y-auto">
          {/* Session Settings */}
          <div className="mb-10 bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <svg className="w-4 h-4 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Session Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Session Duration (minutes)
                </label>
                <select
                  value={sessionDuration}
                  onChange={(e) => setSessionDuration(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                  <option value={90}>90 minutes</option>
                  <option value={120}>120 minutes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Break Between Sessions (minutes)
                </label>
                <select
                  value={breakBetweenSessions}
                  onChange={(e) => setBreakBetweenSessions(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={0}>No break</option>
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                </select>
              </div>
            </div>
          </div>

          {/* Weekly Schedule */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <svg className="w-4 h-4 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v12a2 2 0 002 2z" />
              </svg>
              Weekly Schedule
            </h3>
            
            {Object.entries(daysInEnglish).map(([dayKey, dayName]) => (
              <div key={dayKey} className="border border-gray-200 rounded-2xl p-6 hover:border-gray-300 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <h4 className="text-lg font-bold text-gray-900 mr-4">{dayName}</h4>
                    <button
                      onClick={() => toggleDayAvailability(dayKey)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                        availability[dayKey][0]?.isAvailable
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      {availability[dayKey][0]?.isAvailable ? '✅ Available' : '❌ Unavailable'}
                    </button>
                  </div>
                  {availability[dayKey][0]?.isAvailable && (
                    <button
                      onClick={() => addTimeSlot(dayKey)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-semibold px-4 py-2 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                    >
                      + Add Time Slot
                    </button>
                  )}
                </div>

                {availability[dayKey][0]?.isAvailable && (
                  <div className="space-y-3">
                    {availability[dayKey].map((slot, index) => (
                      <div key={index} className="flex items-center space-x-4 bg-gray-50 p-4 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <label className="text-sm font-semibold text-gray-700">From:</label>
                          <input
                            type="time"
                            value={slot.start}
                            onChange={(e) => updateDayAvailability(dayKey, index, 'start', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div className="flex items-center space-x-3">
                          <label className="text-sm font-semibold text-gray-700">To:</label>
                          <input
                            type="time"
                            value={slot.end}
                            onChange={(e) => updateDayAvailability(dayKey, index, 'end', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        {availability[dayKey].length > 1 && (
                          <button
                            onClick={() => removeTimeSlot(dayKey, index)}
                            className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                            title="Remove time slot"
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

        <div className="p-8 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="flex justify-between">
            <button
              onClick={onClose}
              className="px-8 py-3 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={saveAvailabilitySettings}
              disabled={saving}
              className={`px-8 py-3 rounded-xl text-sm font-semibold transition-colors ${
                saving
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {saving ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </div>
              ) : (
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Settings
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}