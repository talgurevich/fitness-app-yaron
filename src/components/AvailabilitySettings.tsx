// src/components/AvailabilitySettings.tsx
'use client'
import { useState, useEffect } from 'react'

interface WorkingHours {
  [day: string]: {
    enabled: boolean
    start: string
    end: string
  }
}

interface AvailabilitySettingsProps {
  onClose: () => void
}

export default function AvailabilitySettings({ onClose }: AvailabilitySettingsProps) {
  const [workingHours, setWorkingHours] = useState<WorkingHours>({
    sunday: { enabled: true, start: '09:00', end: '17:00' },
    monday: { enabled: true, start: '09:00', end: '17:00' },
    tuesday: { enabled: true, start: '09:00', end: '17:00' },
    wednesday: { enabled: true, start: '09:00', end: '17:00' },
    thursday: { enabled: true, start: '09:00', end: '17:00' },
    friday: { enabled: true, start: '09:00', end: '14:00' },
    saturday: { enabled: false, start: '09:00', end: '17:00' }
  })
  
  const [timezone, setTimezone] = useState('Asia/Jerusalem')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const dayNames = {
    sunday: 'ראשון',
    monday: 'שני',
    tuesday: 'שלישי', 
    wednesday: 'רביעי',
    thursday: 'חמישי',
    friday: 'שישי',
    saturday: 'שבת'
  }

  useEffect(() => {
    fetchAvailability()
  }, [])

  const fetchAvailability = async () => {
    try {
      const response = await fetch('/api/trainer/availability')
      const data = await response.json()
      
      if (data.workingHours) {
        setWorkingHours({ ...workingHours, ...data.workingHours })
      }
      if (data.timezone) {
        setTimezone(data.timezone)
      }
    } catch (error) {
      console.error('Error fetching availability:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveAvailability = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/trainer/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workingHours, timezone })
      })

      const data = await response.json()
      
      if (data.success) {
        alert('זמינות עודכנה בהצלחה!')
        onClose()
      } else {
        alert('שגיאה בעדכון הזמינות: ' + data.error)
      }
    } catch (error) {
      console.error('Error saving availability:', error)
      alert('שגיאה בשמירת הזמינות')
    } finally {
      setSaving(false)
    }
  }

  const updateDayHours = (day: string, field: string, value: string | boolean) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }))
  }

  const generateTimeOptions = () => {
    const times = []
    for (let hour = 6; hour <= 23; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        times.push(timeString)
      }
    }
    return times
  }

  const timeOptions = generateTimeOptions()

  if (loading) {
    return (
      <div style={{ 
        position: 'fixed', 
        inset: 0, 
        backgroundColor: 'rgba(0, 0, 0, 0.5)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        zIndex: 50
      }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '2rem', 
          borderRadius: '1rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}>
          <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>טוען...</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      position: 'fixed', 
      inset: 0, 
      backgroundColor: 'rgba(0, 0, 0, 0.5)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      zIndex: 50,
      padding: '1rem'
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '1rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        maxWidth: '48rem',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        {/* Header */}
        <div style={{ 
          padding: '2rem 2rem 1rem 2rem',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold', 
              color: '#111827' 
            }}>
              הגדרות זמינות
            </h2>
            <button
              onClick={onClose}
              style={{
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '2rem',
                height: '2rem',
                cursor: 'pointer',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>
          </div>
          <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
            הגדר את השעות בהן אתה זמין לקבלת הזמנות
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: '2rem' }}>
          {/* Days Configuration */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ 
              fontSize: '1.125rem', 
              fontWeight: 'bold', 
              marginBottom: '1rem',
              color: '#111827'
            }}>
              שעות עבודה שבועיות
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {Object.entries(dayNames).map(([day, dayName]) => (
                <div 
                  key={day}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '1rem',
                    padding: '1rem',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '0.5rem',
                    border: '1px solid #e5e7eb'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    minWidth: '6rem'
                  }}>
                    <input
                      type="checkbox"
                      checked={workingHours[day]?.enabled || false}
                      onChange={(e) => updateDayHours(day, 'enabled', e.target.checked)}
                      style={{ width: '1rem', height: '1rem' }}
                    />
                    <label style={{ 
                      fontWeight: 'bold',
                      color: workingHours[day]?.enabled ? '#111827' : '#6b7280'
                    }}>
                      {dayName}
                    </label>
                  </div>
                  
                  {workingHours[day]?.enabled && (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '1rem',
                      flex: 1
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', color: '#6b7280' }}>מ:</label>
                        <select
                          value={workingHours[day]?.start || '09:00'}
                          onChange={(e) => updateDayHours(day, 'start', e.target.value)}
                          style={{
                            padding: '0.5rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem'
                          }}
                        >
                          {timeOptions.map(time => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', color: '#6b7280' }}>עד:</label>
                        <select
                          value={workingHours[day]?.end || '17:00'}
                          onChange={(e) => updateDayHours(day, 'end', e.target.value)}
                          style={{
                            padding: '0.5rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem'
                          }}
                        >
                          {timeOptions.map(time => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ 
            display: 'flex', 
            gap: '1rem',
            justifyContent: 'flex-end',
            borderTop: '1px solid #e5e7eb',
            paddingTop: '1rem'
          }}>
            <button
              onClick={onClose}
              style={{
                backgroundColor: '#6b7280',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              ביטול
            </button>
            <button
              onClick={saveAvailability}
              disabled={saving}
              style={{
                backgroundColor: saving ? '#6b7280' : '#10b981',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: 'bold',
                cursor: saving ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {saving ? 'שומר...' : 'שמור זמינות'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}