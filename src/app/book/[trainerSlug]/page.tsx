// src/app/book/[trainerSlug]/page.tsx - Enhanced with background image and email first
'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import LanguageToggle, { useTranslations } from '@/components/LanguageToggle'

interface BookingForm {
  name: string
  email: string
  phone: string
}

export default function BookingPage() {
  const params = useParams()
  const trainerSlug = params.trainerSlug as string
  const { t } = useTranslations()
  
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    name: '',
    email: '',
    phone: ''
  })
  const [isBooking, setIsBooking] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  
  // Real data from API
  const [trainerName, setTrainerName] = useState('')
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  // Generate next 7 days
  const getNext7Days = () => {
    const days = []
    for (let i = 0; i < 7; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      days.push({
        date: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('he-IL', { weekday: 'short' }),
        dayNum: date.getDate(),
        month: date.toLocaleDateString('he-IL', { month: 'short' })
      })
    }
    return days
  }

  // Fetch available slots for selected date
  const fetchAvailableSlots = async (date: string) => {
    if (!date) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/trainer/available-slots?trainerSlug=${trainerSlug}&date=${date}`)
      const data = await response.json()
      
      if (data.success) {
        setAvailableSlots(data.availableSlots || [])
        if (data.trainerName) {
          setTrainerName(data.trainerName)
        }
      } else {
        console.error('Error fetching slots:', data.error)
        setAvailableSlots([])
      }
    } catch (error) {
      console.error('Error fetching available slots:', error)
      setAvailableSlots([])
    } finally {
      setLoading(false)
    }
  }

  // Update slots when date changes
  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots(selectedDate)
      setSelectedTime('') // Reset selected time when date changes
    }
  }, [selectedDate, trainerSlug])

  // Set initial date to today
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    setSelectedDate(today)
  }, [])

  // Set fallback trainer name from slug if not loaded from API
  useEffect(() => {
    if (!trainerName && trainerSlug) {
      setTrainerName(trainerSlug.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase()))
    }
  }, [trainerName, trainerSlug])

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsBooking(true)

    try {
      const datetime = new Date(`${selectedDate}T${selectedTime}:00`)
      
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trainerSlug,
          clientName: bookingForm.name,
          clientEmail: bookingForm.email,
          clientPhone: bookingForm.phone,
          datetime: datetime.toISOString(),
        }),
      })

      const result = await response.json()

      if (result.success) {
        setShowSuccess(true)
        // Reset form after 3 seconds
        setTimeout(() => {
          setShowSuccess(false)
          setBookingForm({ name: '', email: '', phone: '' })
          setSelectedTime('')
          // Refresh available slots
          fetchAvailableSlots(selectedDate)
        }, 3000)
      } else {
        alert(t('booking_error') + ': ' + result.error)
      }
    } catch (error) {
      console.error('Booking error:', error)
      alert(t('booking_error'))
    } finally {
      setIsBooking(false)
    }
  }

  const days = getNext7Days()

  if (showSuccess) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundImage: 'url(https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#f9fafb',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '16px' 
      }}>
        {/* Overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          zIndex: 1
        }}></div>
        
        <div style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(229, 231, 235, 0.3)',
          borderRadius: '16px',
          padding: '48px 32px',
          textAlign: 'center',
          maxWidth: '400px',
          width: '100%',
          position: 'relative',
          zIndex: 2
        }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            backgroundColor: '#f0fdf4', 
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <svg width="24" height="24" fill="none" stroke="#16a34a" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
            {t('booking_success')} ✅
          </h2>
          <p style={{ fontSize: '16px', color: '#6b7280', margin: '0 0 16px 0', lineHeight: '1.5' }}>
            {t('booking_success_message')} {new Date(selectedDate).toLocaleDateString('he-IL')} {t('at_time')} {selectedTime} {t('sent_to_trainer')}
          </p>
          <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>
            {t('confirmation_email')}: <strong>{bookingForm.email}</strong>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundImage: 'url(https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundColor: '#f9fafb',
      position: 'relative'
    }}>
      {/* Background Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        zIndex: 1
      }}></div>

      {/* Header - matches dashboard exactly */}
      <header style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(229, 231, 235, 0.3)',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        position: 'relative',
        zIndex: 2
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                {t('book_session_with')} {trainerName}
              </h1>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                {t('select_date_time')}
              </p>
            </div>
          </div>
          
          {/* Language Toggle */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <LanguageToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px', position: 'relative', zIndex: 2 }}>
        
        {/* Hero Section */}
        <div style={{ 
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '32px',
          color: 'white',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 8px 0' }}>
            📅 {t('booking_appointment')}
          </h2>
          <p style={{ fontSize: '16px', opacity: 0.9, margin: 0 }}>
            {t('select_time_start_training')}
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '32px'
        }}>
          
          {/* Date & Time Selection */}
          <div style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(229, 231, 235, 0.3)',
            borderRadius: '16px',
            overflow: 'hidden'
          }}>
            <div style={{ 
              padding: '24px',
              borderBottom: '1px solid rgba(229, 231, 235, 0.3)',
              backgroundColor: 'rgba(248, 250, 252, 0.8)'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0' }}>
                {t('select_date_time')}
              </h3>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                {t('click_desired_date_time')}
              </p>
            </div>
            
            <div style={{ padding: '24px' }}>
              {/* Date Selection */}
              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
                  {t('date')} 📅
                </h4>
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: '8px'
                }}>
                  {days.map((day) => (
                    <button
                      key={day.date}
                      onClick={() => setSelectedDate(day.date)}
                      style={{
                        padding: '12px 4px',
                        textAlign: 'center',
                        borderRadius: '8px',
                        border: selectedDate === day.date ? '2px solid #3b82f6' : '1px solid rgba(229, 231, 235, 0.5)',
                        backgroundColor: selectedDate === day.date ? '#eff6ff' : 'rgba(255, 255, 255, 0.8)',
                        color: selectedDate === day.date ? '#1e40af' : '#374151',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        fontSize: '12px',
                        backdropFilter: 'blur(5px)'
                      }}
                      onMouseOver={(e) => {
                        if (selectedDate !== day.date) {
                          e.currentTarget.style.backgroundColor = 'rgba(249, 250, 251, 0.9)'
                          e.currentTarget.style.borderColor = 'rgba(209, 213, 219, 0.8)'
                        }
                      }}
                      onMouseOut={(e) => {
                        if (selectedDate !== day.date) {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'
                          e.currentTarget.style.borderColor = 'rgba(229, 231, 235, 0.5)'
                        }
                      }}
                    >
                      <div style={{ opacity: 0.75, marginBottom: '2px' }}>{day.dayName}</div>
                      <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{day.dayNum}</div>
                      <div style={{ opacity: 0.75, fontSize: '10px' }}>{day.month}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
                    {t('available_times')} ⏰
                  </h4>
                  
                  {loading ? (
                    <div style={{ textAlign: 'center', padding: '32px 0' }}>
                      <div style={{ 
                        width: '20px', 
                        height: '20px', 
                        border: '2px solid #e5e7eb', 
                        borderTop: '2px solid #3b82f6',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 16px'
                      }}></div>
                      <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>{t('loading_available_times')}</p>
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px 0' }}>
                      <div style={{ 
                        width: '48px', 
                        height: '48px', 
                        backgroundColor: 'rgba(243, 244, 246, 0.8)', 
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px'
                      }}>
                        <svg width="20" height="20" fill="none" stroke="#9ca3af" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                        {t('no_available_times')}
                      </p>
                    </div>
                  ) : (
                    <div style={{ 
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
                      gap: '8px'
                    }}>
                      {availableSlots.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setSelectedTime(slot)}
                          style={{
                            padding: '12px 8px',
                            textAlign: 'center',
                            borderRadius: '8px',
                            border: selectedTime === slot ? '2px solid #16a34a' : '1px solid rgba(229, 231, 235, 0.5)',
                            backgroundColor: selectedTime === slot ? '#f0fdf4' : 'rgba(255, 255, 255, 0.8)',
                            color: selectedTime === slot ? '#15803d' : '#374151',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            backdropFilter: 'blur(5px)'
                          }}
                          onMouseOver={(e) => {
                            if (selectedTime !== slot) {
                              e.currentTarget.style.backgroundColor = 'rgba(249, 250, 251, 0.9)'
                              e.currentTarget.style.borderColor = 'rgba(209, 213, 219, 0.8)'
                            }
                          }}
                          onMouseOut={(e) => {
                            if (selectedTime !== slot) {
                              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'
                              e.currentTarget.style.borderColor = 'rgba(229, 231, 235, 0.5)'
                            }
                          }}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Booking Form */}
          <div style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(229, 231, 235, 0.3)',
            borderRadius: '16px',
            overflow: 'hidden'
          }}>
            <div style={{ 
              padding: '24px',
              borderBottom: '1px solid rgba(229, 231, 235, 0.3)',
              backgroundColor: 'rgba(248, 250, 252, 0.8)'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0' }}>
                {t('booking_details')}
              </h3>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                {t('fill_details_complete')}
              </p>
            </div>
            
            <div style={{ padding: '24px' }}>
              {selectedDate && selectedTime && (
                <div style={{ 
                  backgroundColor: 'rgba(240, 249, 255, 0.8)',
                  border: '1px solid rgba(186, 230, 253, 0.5)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '24px',
                  backdropFilter: 'blur(5px)'
                }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#0c4a6e', margin: '0 0 12px 0' }}>
                    📋 {t('session_summary')}:
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <p style={{ fontSize: '14px', color: '#0369a1', margin: 0 }}>
                      <strong>{t('date')}:</strong>{' '}
                      {new Date(selectedDate).toLocaleDateString('he-IL', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                    <p style={{ fontSize: '14px', color: '#0369a1', margin: 0 }}>
                      <strong>{t('time')}:</strong> {selectedTime}
                    </p>
                    <p style={{ fontSize: '14px', color: '#0369a1', margin: 0 }}>
                      <strong>{t('trainer')}:</strong> {trainerName}
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleBooking} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* EMAIL FIELD FIRST */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', margin: '0 0 8px 0' }}>
                    {t('email_address')} *
                  </label>
                  <input
                    type="email"
                    required
                    value={bookingForm.email}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, email: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid rgba(209, 213, 219, 0.5)',
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      color: '#111827',
                      backdropFilter: 'blur(5px)'
                    }}
                    placeholder="your@email.com"
                  />
                </div>

                {/* NAME FIELD SECOND */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', margin: '0 0 8px 0' }}>
                    {t('full_name')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={bookingForm.name}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, name: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid rgba(209, 213, 219, 0.5)',
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      color: '#111827',
                      backdropFilter: 'blur(5px)'
                    }}
                    placeholder={t('your_name')}
                  />
                </div>

                {/* PHONE FIELD THIRD */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', margin: '0 0 8px 0' }}>
                    {t('phone_number')}
                  </label>
                  <input
                    type="tel"
                    value={bookingForm.phone}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, phone: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid rgba(209, 213, 219, 0.5)',
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      color: '#111827',
                      backdropFilter: 'blur(5px)'
                    }}
                    placeholder={t('phone_placeholder')}
                  />
                </div>

                <button
                  type="submit"
                  disabled={!selectedDate || !selectedTime || !bookingForm.name || !bookingForm.email || isBooking}
                  style={{
                    width: '100%',
                    padding: '16px 24px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    border: 'none',
                    cursor: (!selectedDate || !selectedTime || !bookingForm.name || !bookingForm.email || isBooking) ? 'not-allowed' : 'pointer',
                    backgroundColor: (!selectedDate || !selectedTime || !bookingForm.name || !bookingForm.email || isBooking) ? 'rgba(156, 163, 175, 0.8)' : 'rgba(22, 163, 74, 0.9)',
                    color: 'white',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    backdropFilter: 'blur(5px)'
                  }}
                  onMouseOver={(e) => {
                    if (!(!selectedDate || !selectedTime || !bookingForm.name || !bookingForm.email || isBooking)) {
                      e.currentTarget.style.backgroundColor = 'rgba(21, 128, 61, 0.95)'
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!(!selectedDate || !selectedTime || !bookingForm.name || !bookingForm.email || isBooking)) {
                      e.currentTarget.style.backgroundColor = 'rgba(22, 163, 74, 0.9)'
                    }
                  }}
                >
                  {isBooking ? (
                    <>
                      <div style={{ 
                        width: '16px', 
                        height: '16px', 
                        border: '2px solid white', 
                        borderTop: '2px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                      {t('sending_booking')}
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v12a2 2 0 002 2z" />
                      </svg>
                      {t('book_session')} 💪
                    </>
                  )}
                </button>
              </form>
            </div>
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