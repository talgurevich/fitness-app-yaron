// src/app/book/[trainerSlug]/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

interface TimeSlot {
  time: string
  available: boolean
}

interface BookingForm {
  name: string
  email: string
  phone: string
}

export default function BookingPage() {
  const params = useParams()
  const trainerSlug = params.trainerSlug as string
  
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    name: '',
    email: '',
    phone: ''
  })
  const [isBooking, setIsBooking] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Mock trainer data - in real app this would come from API
  const trainerName = trainerSlug.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase())
  
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

  // Get day of week in English format for API compatibility
  const getDayOfWeek = (date: string): string => {
    const selectedDate = new Date(date)
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    return days[selectedDate.getDay()]
  }

  // Get available time slots based on trainer's availability
  const getTimeSlots = (date: string): TimeSlot[] => {
    const dayOfWeek = getDayOfWeek(date)
    
    // Mock trainer availability - in real app this would come from API
    const trainerAvailability = {
      sunday: { enabled: true, start: '09:00', end: '17:00' },
      monday: { enabled: true, start: '09:00', end: '17:00' },
      tuesday: { enabled: true, start: '09:00', end: '17:00' },
      wednesday: { enabled: true, start: '09:00', end: '17:00' },
      thursday: { enabled: true, start: '09:00', end: '17:00' },
      friday: { enabled: true, start: '09:00', end: '14:00' },
      saturday: { enabled: false, start: '09:00', end: '17:00' }
    }

    const dayAvailability = trainerAvailability[dayOfWeek as keyof typeof trainerAvailability]
    
    if (!dayAvailability?.enabled) {
      return [] // No slots available on this day
    }

    // Generate time slots between start and end times
    const slots: TimeSlot[] = []
    const startHour = parseInt(dayAvailability.start.split(':')[0])
    const startMinute = parseInt(dayAvailability.start.split(':')[1])
    const endHour = parseInt(dayAvailability.end.split(':')[0])
    const endMinute = parseInt(dayAvailability.end.split(':')[1])
    
    for (let hour = startHour; hour < endHour || (hour === endHour && startMinute < endMinute); hour++) {
      for (let minute = (hour === startHour ? startMinute : 0); minute < 60; minute += 60) {
        if (hour === endHour && minute >= endMinute) break
        
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        slots.push({
          time: timeString,
          // Randomly make some slots unavailable for demo (existing bookings)
          available: Math.random() > 0.2
        })
      }
    }
    
    return slots
  }

  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])

  useEffect(() => {
    if (selectedDate) {
      setTimeSlots(getTimeSlots(selectedDate))
      setSelectedTime('') // Reset selected time when date changes
    }
  }, [selectedDate])

  // Set initial date to today
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    setSelectedDate(today)
  }, [])

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
        }, 3000)
      } else {
        alert('שגיאה ביצירת הזמנה: ' + result.error)
      }
    } catch (error) {
      console.error('Booking error:', error)
      alert('שגיאה ביצירת הזמנה')
    } finally {
      setIsBooking(false)
    }
  }

  const days = getNext7Days()

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">הזמנה נשלחה בהצלחה!</h2>
          <p className="text-gray-600 mb-4">
            ההזמנה שלך ל-{new Date(selectedDate).toLocaleDateString('he-IL')} בשעה {selectedTime} נשלחה למאמן
          </p>
          <p className="text-sm text-gray-500">
            תקבל אישור בקרוב למייל: {bookingForm.email}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  הזמן אימון עם {trainerName}
                </h1>
                <p className="text-sm text-gray-500">
                  בחר תאריך ושעה המתאימים לך
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Date & Time Selection */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">בחר תאריך ושעה</h2>
            </div>
            <div className="p-6">
              {/* Date Selection */}
              <div className="mb-8">
                <h3 className="text-sm font-medium text-gray-900 mb-4">תאריך</h3>
                <div className="grid grid-cols-7 gap-2">
                  {days.map((day) => (
                    <button
                      key={day.date}
                      onClick={() => setSelectedDate(day.date)}
                      className={`p-3 text-center rounded-lg border transition-colors ${
                        selectedDate === day.date
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-xs opacity-75">{day.dayName}</div>
                      <div className="font-semibold">{day.dayNum}</div>
                      <div className="text-xs opacity-75">{day.month}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-4">שעות זמינות</h3>
                  {timeSlots.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-500">אין שעות זמינות בתאריך זה</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot.time}
                          onClick={() => slot.available && setSelectedTime(slot.time)}
                          disabled={!slot.available}
                          className={`p-3 text-center rounded-lg border text-sm font-medium transition-colors ${
                            selectedTime === slot.time
                              ? 'bg-gray-900 text-white border-gray-900'
                              : slot.available
                              ? 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                              : 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed'
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Booking Form */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">פרטי ההזמנה</h2>
            </div>
            <div className="p-6">
              {selectedDate && selectedTime && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">סיכום הפגישה:</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">תאריך:</span>{' '}
                      {new Date(selectedDate).toLocaleDateString('he-IL', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                    <p><span className="font-medium">שעה:</span> {selectedTime}</p>
                    <p><span className="font-medium">מאמן:</span> {trainerName}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleBooking} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    שם מלא *
                  </label>
                  <input
                    type="text"
                    required
                    value={bookingForm.name}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="השם שלך"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    כתובת אימייל *
                  </label>
                  <input
                    type="email"
                    required
                    value={bookingForm.email}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    מספר טלפון
                  </label>
                  <input
                    type="tel"
                    value={bookingForm.phone}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="050-1234567"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!selectedDate || !selectedTime || !bookingForm.name || !bookingForm.email || isBooking}
                  className={`w-full py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                    (!selectedDate || !selectedTime || !bookingForm.name || !bookingForm.email || isBooking)
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {isBooking ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-white rounded-full animate-spin ml-2"></div>
                      שולח הזמנה...
                    </div>
                  ) : (
                    'הזמן אימון'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}