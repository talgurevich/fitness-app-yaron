// src/app/clients/[clientId]/book/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface Client {
  id: string
  name: string
  email: string
  sessionPrice: number
  sessionDuration: number
}

interface TimeSlot {
  time: string
  available: boolean
  conflictCount?: number
}

export default function BookAppointmentPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const clientId = params.clientId as string

  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  // Form state
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [duration, setDuration] = useState(60)
  const [sessionPrice, setSessionPrice] = useState(180)
  const [notes, setNotes] = useState('')
  
  // Time slots
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/login')
      return
    }

    fetchClient()
  }, [session, status, router, clientId])

  useEffect(() => {
    if (selectedDate) {
      generateTimeSlots()
    }
  }, [selectedDate])

  const fetchClient = async () => {
    try {
      const response = await fetch(`/api/trainer/clients/${clientId}`)
      const data = await response.json()
      
      if (data.success) {
        setClient(data.client)
        setDuration(data.client.sessionDuration || 60)
        setSessionPrice(data.client.sessionPrice || 180)
      } else {
        alert('Client not found')
        router.push('/clients')
      }
    } catch (error) {
      console.error('Error fetching client:', error)
      alert('Error loading client data')
      router.push('/clients')
    } finally {
      setLoading(false)
    }
  }

  const generateTimeSlots = () => {
    const slots: TimeSlot[] = []
    
    // Generate slots from 6:00 AM to 10:00 PM
    for (let hour = 6; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        slots.push({
          time: timeString,
          available: true // Since we don't prevent double-booking
        })
      }
    }
    
    setTimeSlots(slots)
  }

  const formatTimeSlot = (time: string) => {
    const [hour, minute] = time.split(':')
    const hourNum = parseInt(hour)
    const ampm = hourNum >= 12 ? 'PM' : 'AM'
    const displayHour = hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum
    return `${displayHour}:${minute} ${ampm}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedDate || !selectedTime) {
      alert('Please select both date and time')
      return
    }

    setSubmitting(true)

    try {
      const datetime = new Date(`${selectedDate}T${selectedTime}:00`)
      
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clientId: client?.id,
          clientName: client?.name,
          clientEmail: client?.email,
          datetime: datetime.toISOString(),
          duration,
          sessionPrice,
          notes: notes || null
        })
      })

      const data = await response.json()
      
      if (data.success) {
        // Success! Redirect back to client page
        router.push(`/clients/${clientId}?booked=true`)
      } else {
        alert('Error booking appointment: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error booking appointment:', error)
      alert('Error booking appointment')
    } finally {
      setSubmitting(false)
    }
  }

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0]
  }

  if (loading) {
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
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading client...</p>
        </div>
      </div>
    )
  }

  if (!client) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
            Client not found
          </h2>
          <Link 
            href="/clients" 
            style={{
              color: '#2563eb',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            ← Back to Clients
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: 'white', 
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 10
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
            <Link 
              href={`/clients/${clientId}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                fontSize: '13px',
                fontWeight: '500',
                color: '#374151',
                backgroundColor: '#f3f4f6',
                border: 'none',
                borderRadius: '6px',
                textDecoration: 'none',
                transition: 'all 0.2s'
              }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to {client.name}
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
                Book Appointment
              </h1>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                Schedule session with {client.name}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 16px' }}>
        
        {/* Client Info Card */}
        <div style={{ 
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              backgroundColor: '#eff6ff', 
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="24" height="24" fill="none" stroke="#3b82f6" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>
                {client.name}
              </h2>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                {client.email} • ₪{client.sessionPrice}/hour
              </p>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <div style={{ 
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 24px 0' }}>
            Schedule Appointment
          </h3>

          <form onSubmit={handleSubmit}>
            {/* Date Selection */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#374151', 
                marginBottom: '8px' 
              }}>
                Select Date *
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  color: '#111827',
                  backgroundColor: 'white',
                  maxWidth: '300px'
                }}
              />
            </div>

            {/* Time Slots */}
            {selectedDate && (
              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151', 
                  marginBottom: '8px' 
                }}>
                  Select Time *
                </label>
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                  gap: '8px',
                  maxHeight: '300px',
                  overflowY: 'auto',
                  padding: '8px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  backgroundColor: '#f9fafb'
                }}>
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.time}
                      type="button"
                      onClick={() => setSelectedTime(slot.time)}
                      style={{
                        padding: '10px 12px',
                        fontSize: '14px',
                        fontWeight: '500',
                        border: '1px solid',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        backgroundColor: selectedTime === slot.time ? '#3b82f6' : 'white',
                        borderColor: selectedTime === slot.time ? '#3b82f6' : '#d1d5db',
                        color: selectedTime === slot.time ? 'white' : '#374151'
                      }}
                      onMouseOver={(e) => {
                        if (selectedTime !== slot.time) {
                          e.currentTarget.style.backgroundColor = '#f3f4f6'
                        }
                      }}
                      onMouseOut={(e) => {
                        if (selectedTime !== slot.time) {
                          e.currentTarget.style.backgroundColor = 'white'
                        }
                      }}
                    >
                      {formatTimeSlot(slot.time)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Duration and Price */}
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151', 
                  marginBottom: '8px' 
                }}>
                  Duration (minutes)
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px',
                    color: '#111827',
                    backgroundColor: 'white'
                  }}
                >
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                  <option value={90}>90 minutes</option>
                  <option value={120}>120 minutes</option>
                </select>
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151', 
                  marginBottom: '8px' 
                }}>
                  Session Price (₪)
                </label>
                <input
                  type="number"
                  value={sessionPrice}
                  onChange={(e) => setSessionPrice(parseInt(e.target.value) || 0)}
                  min="0"
                  step="10"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px',
                    color: '#111827',
                    backgroundColor: 'white'
                  }}
                />
              </div>
            </div>

            {/* Session Notes */}
            <div style={{ marginBottom: '32px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#374151', 
                marginBottom: '8px' 
              }}>
                Session Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this session..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  color: '#111827',
                  backgroundColor: 'white',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Submit Button */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link
                href={`/clients/${clientId}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: '500',
                  color: '#374151',
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  minWidth: '120px'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
              >
                Cancel
              </Link>
              
              <button
                type="submit"
                disabled={submitting || !selectedDate || !selectedTime}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: 'white',
                  backgroundColor: (submitting || !selectedDate || !selectedTime) ? '#9ca3af' : '#3b82f6',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: (submitting || !selectedDate || !selectedTime) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  minWidth: '160px'
                }}
                onMouseOver={(e) => {
                  if (!submitting && selectedDate && selectedTime) {
                    e.currentTarget.style.backgroundColor = '#2563eb'
                  }
                }}
                onMouseOut={(e) => {
                  if (!submitting && selectedDate && selectedTime) {
                    e.currentTarget.style.backgroundColor = '#3b82f6'
                  }
                }}
              >
                {submitting ? (
                  <>
                    <div style={{ 
                      width: '16px', 
                      height: '16px', 
                      border: '2px solid white', 
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Booking...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v12a2 2 0 002 2z" />
                    </svg>
                    Book Appointment
                  </>
                )}
              </button>
            </div>
          </form>
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