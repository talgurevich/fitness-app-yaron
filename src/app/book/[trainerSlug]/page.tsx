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
        dayName: date.toLocaleDateString('he-IL', { weekday: 'long' }),
        dayNum: date.getDate(),
        month: date.toLocaleDateString('he-IL', { month: 'short' })
      })
    }
    return days
  }

  // Get available time slots based on trainer's availability
  const getTimeSlots = (date: string): TimeSlot[] => {
    const selectedDate = new Date(date)
    const dayOfWeek = selectedDate.toLocaleDateString('en-US', { weekday: 'lowercase' })
    
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">הזמנה נשלחה בהצלחה!</h2>
          <p className="text-gray-600 mb-4">
            ההזמנה שלך ל-{selectedDate} בשעה {selectedTime} נשלחה למאמן
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
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            הזמן פגישה עם {trainerName}
          </h1>
          <p className="text-gray-600 mt-2">
            בחר תאריך, שעה ומלא פרטים להזמנה
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Date & Time Selection */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">בחר תאריך ושעה</h2>
            
            {/* Date Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">תאריך</h3>
              <div className="grid grid-cols-7 gap-2">
                {days.map((day) => (
                  <button
                    key={day.date}
                    onClick={() => setSelectedDate(day.date)}
                    className={`p-3 text-center rounded-lg border ${
                      selectedDate === day.date
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-xs">{day.dayName}</div>
                    <div className="font-semibold">{day.dayNum}</div>
                    <div className="text-xs">{day.month}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div>
                <h3 className="text-lg font-medium mb-3">שעה</h3>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => slot.available && setSelectedTime(slot.time)}
                      disabled={!slot.available}
                      className={`p-3 text-center rounded-lg border ${
                        selectedTime === slot.time
                          ? 'bg-blue-600 text-white border-blue-600'
                          : slot.available
                          ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Booking Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">פרטי ההזמנה</h2>
            
            {selectedDate && selectedTime && (
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="font-medium text-blue-900">פרטי הפגישה:</h3>
                <p className="text-blue-700">
                  {new Date(selectedDate).toLocaleDateString('he-IL', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })} בשעה {selectedTime}
                </p>
                <p className="text-blue-700">עם {trainerName}</p>
              </div>
            )}

            <form onSubmit={handleBooking} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  שם מלא *
                </label>
                <input
                  type="text"
                  required
                  value={bookingForm.name}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="השם שלך"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  אימייל *
                </label>
                <input
                  type="email"
                  required
                  value={bookingForm.email}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  טלפון
                </label>
                <input
                  type="tel"
                  value={bookingForm.phone}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="050-1234567"
                />
              </div>

              <button
                type="submit"
                disabled={!selectedDate || !selectedTime || !bookingForm.name || !bookingForm.email || isBooking}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-md transition-colors"
              >
                {isBooking ? 'שולח הזמנה...' : 'הזמן פגישה'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}