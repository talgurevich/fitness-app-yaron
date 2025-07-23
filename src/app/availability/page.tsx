// src/app/availability/page.tsx - Fixed to match design system
'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import LanguageToggle, { useTranslations } from '@/components/LanguageToggle'

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
  const { t } = useTranslations()
  
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
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '20px', 
            height: '20px', 
            border: '2px solid #e5e7eb', 
            borderTop: '2px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>טוען הגדרות זמינות...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header - matches dashboard exactly */}
      <header style={{ 
        backgroundColor: 'white', 
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ 
          maxWidth: '1280px', 
          margin: '0 auto', 
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px'
        }}>
          {/* Logo & Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link 
              href="/dashboard"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                fontSize: '13px',
                fontWeight: '500',
                color: '#374151',
                backgroundColor: '#f3f4f6',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                textDecoration: 'none',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              חזור
            </Link>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              backgroundColor: '#3b82f6', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="18" height="18" fill="white" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
                הגדרות זמינות
              </h1>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                הגדרת שעות עבודה ואימונים
              </p>
            </div>
          </div>

          {/* Desktop Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LanguageToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
        
        {/* Hero Section */}
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '32px',
          color: 'white',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ 
              fontSize: '28px', 
              fontWeight: '700', 
              margin: '0 0 8px 0' 
            }}>
              ⏰ הגדרות זמינות
            </h2>
            <p style={{ 
              fontSize: '16px', 
              opacity: 0.9, 
              margin: 0,
              lineHeight: '1.6'
            }}>
              הגדירו את שעות העבודה שלכם ואת משך האימונים כדי שלקוחות יוכלו להזמין בזמנים המתאימים לכם
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Session Settings */}
          <div style={{ 
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '16px',
            overflow: 'hidden'
          }}>
            <div style={{ 
              padding: '24px',
              borderBottom: '1px solid #e5e7eb',
              backgroundColor: '#f9fafb'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>
                הגדרות אימון
              </h3>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                משך אימון והפסקות בין לקוחות
              </p>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '24px'
              }}>
                <div>
                  <label style={{ 
                    display: 'block',
                    fontSize: '14px', 
                    fontWeight: '500', 
                    color: '#111827', 
                    margin: '0 0 8px 0' 
                  }}>
                    משך אימון
                  </label>
                  <select
                    value={sessionDuration}
                    onChange={(e) => setSessionDuration(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      fontSize: '14px',
                      color: '#111827',
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      outline: 'none',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#3b82f6'
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <option value={30}>30 דקות</option>
                    <option value={45}>45 דקות</option>
                    <option value={60}>60 דקות</option>
                    <option value={90}>90 דקות</option>
                    <option value={120}>120 דקות</option>
                  </select>
                </div>
                
                <div>
                  <label style={{ 
                    display: 'block',
                    fontSize: '14px', 
                    fontWeight: '500', 
                    color: '#111827', 
                    margin: '0 0 8px 0' 
                  }}>
                    הפסקה בין אימונים
                  </label>
                  <select
                    value={breakBetweenSessions}
                    onChange={(e) => setBreakBetweenSessions(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      fontSize: '14px',
                      color: '#111827',
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      outline: 'none',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#3b82f6'
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
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
          <div style={{ 
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '16px',
            overflow: 'hidden'
          }}>
            <div style={{ 
              padding: '24px',
              borderBottom: '1px solid #e5e7eb',
              backgroundColor: '#f9fafb'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>
                לוח שבועי
              </h3>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                הגדרת שעות עבודה לכל יום בשבוע
              </p>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {Object.entries(daysInHebrew).map(([dayKey, dayName]) => (
                  <div key={dayKey} style={{ 
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px 20px',
                      backgroundColor: '#f9fafb'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
                          {dayName}
                        </h4>
                        <button
                          onClick={() => toggleDayAvailability(dayKey)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '4px 12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            color: availability[dayKey][0]?.isAvailable ? 'white' : '#6b7280',
                            backgroundColor: availability[dayKey][0]?.isAvailable ? '#3b82f6' : '#f3f4f6',
                            border: 'none',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={(e) => {
                            if (availability[dayKey][0]?.isAvailable) {
                              e.currentTarget.style.backgroundColor = '#2563eb'
                            } else {
                              e.currentTarget.style.backgroundColor = '#e5e7eb'
                            }
                          }}
                          onMouseOut={(e) => {
                            if (availability[dayKey][0]?.isAvailable) {
                              e.currentTarget.style.backgroundColor = '#3b82f6'
                            } else {
                              e.currentTarget.style.backgroundColor = '#f3f4f6'
                            }
                          }}
                        >
                          {availability[dayKey][0]?.isAvailable ? 'פעיל' : 'לא פעיל'}
                        </button>
                      </div>
                      {availability[dayKey][0]?.isAvailable && (
                        <button
                          onClick={() => addTimeSlot(dayKey)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '8px 12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            color: '#374151',
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                        >
                          <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          הוסף שעות
                        </button>
                      )}
                    </div>

                    {availability[dayKey][0]?.isAvailable && (
                      <div style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {availability[dayKey].map((slot, index) => (
                            <div key={index} style={{ 
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '12px',
                              backgroundColor: '#f9fafb',
                              borderRadius: '8px'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <label style={{ 
                                  fontSize: '12px', 
                                  fontWeight: '500', 
                                  color: '#6b7280',
                                  minWidth: '24px'
                                }}>
                                  מ:
                                </label>
                                <input
                                  type="time"
                                  value={slot.start}
                                  onChange={(e) => updateDayAvailability(dayKey, index, 'start', e.target.value)}
                                  style={{
                                    padding: '8px 12px',
                                    fontSize: '13px',
                                    color: '#111827',
                                    backgroundColor: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '6px',
                                    outline: 'none',
                                    transition: 'all 0.2s'
                                  }}
                                  onFocus={(e) => {
                                    e.currentTarget.style.borderColor = '#3b82f6'
                                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                                  }}
                                  onBlur={(e) => {
                                    e.currentTarget.style.borderColor = '#e5e7eb'
                                    e.currentTarget.style.boxShadow = 'none'
                                  }}
                                />
                              </div>
                              
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <label style={{ 
                                  fontSize: '12px', 
                                  fontWeight: '500', 
                                  color: '#6b7280',
                                  minWidth: '24px'
                                }}>
                                  עד:
                                </label>
                                <input
                                  type="time"
                                  value={slot.end}
                                  onChange={(e) => updateDayAvailability(dayKey, index, 'end', e.target.value)}
                                  style={{
                                    padding: '8px 12px',
                                    fontSize: '13px',
                                    color: '#111827',
                                    backgroundColor: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '6px',
                                    outline: 'none',
                                    transition: 'all 0.2s'
                                  }}
                                  onFocus={(e) => {
                                    e.currentTarget.style.borderColor = '#3b82f6'
                                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                                  }}
                                  onBlur={(e) => {
                                    e.currentTarget.style.borderColor = '#e5e7eb'
                                    e.currentTarget.style.boxShadow = 'none'
                                  }}
                                />
                              </div>
                              
                              {availability[dayKey].length > 1 && (
                                <button
                                  onClick={() => removeTimeSlot(dayKey, index)}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '32px',
                                    height: '32px',
                                    color: '#dc2626',
                                    backgroundColor: '#fef2f2',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                  }}
                                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                                  title="הסר שעות"
                                >
                                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '16px',
            padding: '24px'
          }}>
            <Link
              href="/dashboard"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                textDecoration: 'none',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
            >
              ביטול
            </Link>
            
            <button
              onClick={saveAvailabilitySettings}
              disabled={saving}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '600',
                color: saving ? '#9ca3af' : 'white',
                backgroundColor: saving ? '#f3f4f6' : '#3b82f6',
                border: 'none',
                borderRadius: '8px',
                cursor: saving ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                if (!saving) {
                  e.currentTarget.style.backgroundColor = '#2563eb'
                }
              }}
              onMouseOut={(e) => {
                if (!saving) {
                  e.currentTarget.style.backgroundColor = '#3b82f6'
                }
              }}
            >
              {saving ? (
                <>
                  <div style={{ 
                    width: '16px', 
                    height: '16px', 
                    border: '2px solid #e5e7eb', 
                    borderTop: '2px solid #9ca3af',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  שומר...
                </>
              ) : (
                <>
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  שמור הגדרות
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}