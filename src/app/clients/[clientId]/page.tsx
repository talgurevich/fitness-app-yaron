// src/app/clients/[clientId]/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface Client {
  id: string
  name: string
  email: string
  phone?: string
  notes?: string
  goals?: string
  medicalNotes?: string
  emergencyContact?: string
  birthDate?: string
  joinedDate: string
  lastSessionDate?: string
  preferredDays?: string
  preferredTimes?: string
  sessionDuration?: number
  totalAppointments: number
  completedSessions: number
  upcomingAppointments: number
  appointments: Array<{
    id: string
    datetime: string
    duration: number
    status: string
    sessionNotes?: string
  }>
}

export default function ClientProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const clientId = params.clientId as string

  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    notes: '',
    goals: '',
    medicalNotes: '',
    emergencyContact: '',
    birthDate: '',
    sessionDuration: 60
  })

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/login')
      return
    }

    fetchClient()
  }, [session, status, router, clientId])

  const fetchClient = async () => {
    try {
      const response = await fetch(`/api/trainer/clients/${clientId}`)
      const data = await response.json()
      
      if (data.success) {
        setClient(data.client)
        // Initialize edit form
        setEditForm({
          name: data.client.name || '',
          phone: data.client.phone || '',
          notes: data.client.notes || '',
          goals: data.client.goals || '',
          medicalNotes: data.client.medicalNotes || '',
          emergencyContact: data.client.emergencyContact || '',
          birthDate: data.client.birthDate ? data.client.birthDate.split('T')[0] : '',
          sessionDuration: data.client.sessionDuration || 60
        })
      } else {
        console.error('Failed to fetch client:', data.error)
        router.push('/clients')
      }
    } catch (error) {
      console.error('Error fetching client:', error)
      router.push('/clients')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/trainer/clients/${clientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      })

      const data = await response.json()
      
      if (data.success) {
        setClient(data.client)
        setEditing(false)
        alert('פרטי הלקוח נשמרו בהצלחה!')
      } else {
        alert('שגיאה בשמירת הפרטים: ' + data.error)
      }
    } catch (error) {
      console.error('Error saving client:', error)
      alert('שגיאה בשמירת הפרטים')
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('he-IL')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'booked': return 'bg-blue-100 text-blue-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'הושלם'
      case 'booked': return 'מתוכנן'
      case 'cancelled': return 'בוטל'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700">טוען פרטי לקוח...</p>
        </div>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">לקוח לא נמצא</h2>
          <Link href="/clients" className="text-blue-600 hover:text-blue-800">
            חזרה לרשימת הלקוחות
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link 
                href="/clients"
                className="text-gray-600 hover:text-gray-900 mr-4"
              >
                ← חזרה לרשימת לקוחות
              </Link>
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    {client.name}
                  </h1>
                  <p className="text-sm text-gray-500">{client.email}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2 space-x-reverse">
              {editing ? (
                <>
                  <button
                    onClick={() => setEditing(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    ביטול
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? 'שומר...' : 'שמור'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setEditing(true)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    ✏️ ערוך פרטים
                  </button>
                  <button className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700">
                    📅 קבע אימון
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Client Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Basic Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">מידע בסיסי</h2>
              
              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">שם מלא</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">טלפון</label>
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">תאריך לידה</label>
                    <input
                      type="date"
                      value={editForm.birthDate}
                      onChange={(e) => setEditForm({...editForm, birthDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">איש קשר לחירום</label>
                    <input
                      type="text"
                      value={editForm.emergencyContact}
                      onChange={(e) => setEditForm({...editForm, emergencyContact: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div><span className="font-medium">אימייל:</span> {client.email}</div>
                  <div><span className="font-medium">טלפון:</span> {client.phone || 'לא צוין'}</div>
                  <div><span className="font-medium">הצטרף:</span> {formatDate(client.joinedDate)}</div>
                  {client.birthDate && <div><span className="font-medium">תאריך לידה:</span> {formatDate(client.birthDate)}</div>}
                  {client.emergencyContact && <div><span className="font-medium">איש קשר לחירום:</span> {client.emergencyContact}</div>}
                </div>
              )}
            </div>

            {/* Goals and Notes */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">מטרות והערות</h2>
              
              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">מטרות אימון</label>
                    <textarea
                      value={editForm.goals}
                      onChange={(e) => setEditForm({...editForm, goals: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="מה המטרות של הלקוח?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">הערות רפואיות</label>
                    <textarea
                      value={editForm.medicalNotes}
                      onChange={(e) => setEditForm({...editForm, medicalNotes: e.target.value})}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="מגבלות, פציעות, מצבים רפואיים"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">הערות כלליות</label>
                    <textarea
                      value={editForm.notes}
                      onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="הערות נוספות על הלקוח"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">מטרות אימון</h3>
                    <p className="text-gray-700">{client.goals || 'לא צוינו מטרות'}</p>
                  </div>
                  {client.medicalNotes && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">הערות רפואיות</h3>
                      <p className="text-gray-700 bg-yellow-50 p-3 rounded-lg">{client.medicalNotes}</p>
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">הערות כלליות</h3>
                    <p className="text-gray-700">{client.notes || 'אין הערות'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Appointment History */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">היסטוריית אימונים</h2>
              
              {client.appointments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">אין אימונים עדיין</p>
              ) : (
                <div className="space-y-3">
                  {client.appointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">
                          {formatDateTime(appointment.datetime)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {appointment.duration} דקות
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                        {getStatusText(appointment.status)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Stats & Quick Actions */}
          <div className="space-y-6">
            
            {/* Stats */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">סטטיסטיקות</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">סה"כ אימונים</span>
                  <span className="text-2xl font-bold text-gray-900">{client.totalAppointments}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">אימונים שהושלמו</span>
                  <span className="text-2xl font-bold text-green-600">{client.completedSessions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">אימונים מתוכננים</span>
                  <span className="text-2xl font-bold text-blue-600">{client.upcomingAppointments}</span>
                </div>
                {client.lastSessionDate && (
                  <div className="pt-3 border-t">
                    <span className="text-sm text-gray-600">אימון אחרון:</span>
                    <div className="font-medium text-gray-900">{formatDate(client.lastSessionDate)}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">פעולות מהירות</h2>
              
              <div className="space-y-3">
                <button className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">
                  📅 קבע אימון חדש
                </button>
                <button className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                  📧 שלח אימייל
                </button>
                <button className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                  📱 שלח SMS
                </button>
                <button className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                  📝 הוסף הערה מהירה
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}