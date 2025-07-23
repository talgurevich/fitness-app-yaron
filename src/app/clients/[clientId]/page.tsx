// src/app/clients/[clientId]/page.tsx - Fixed icon sizes and layout
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
        alert('Client information saved successfully!')
      } else {
        alert('Error saving information: ' + data.error)
      }
    } catch (error) {
      console.error('Error saving client:', error)
      alert('Error saving information')
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
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
      case 'completed': return 'Completed'
      case 'booked': return 'Scheduled'
      case 'cancelled': return 'Cancelled'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-4 h-4 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700">Loading client profile...</p>
        </div>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Client not found</h2>
          <Link href="/clients" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Client List
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link 
                href="/clients"
                className="text-gray-600 hover:text-gray-900 mr-6 inline-flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Clients
              </Link>
              <div className="flex items-center space-x-4">
                <div className="w-6 h-6 bg-blue-600 rounded-xl flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {client.name}
                  </h1>
                  <p className="text-sm text-gray-500">{client.email}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              {editing ? (
                <>
                  <button
                    onClick={() => setEditing(false)}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Save Changes
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setEditing(true)}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Profile
                  </button>
                  <Link
                    href="/availability"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-xl hover:bg-green-700 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v12a2 2 0 002 2z" />
                    </svg>
                    Schedule Session
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Content - 3 columns */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Basic Information */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Basic Information</h2>
              
              {editing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Birth Date</label>
                    <input
                      type="date"
                      value={editForm.birthDate}
                      onChange={(e) => setEditForm({...editForm, birthDate: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
                    <input
                      type="text"
                      value={editForm.emergencyContact}
                      onChange={(e) => setEditForm({...editForm, emergencyContact: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Email</span>
                      <p className="text-gray-900">{client.email}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Phone</span>
                      <p className="text-gray-900">{client.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Joined</span>
                      <p className="text-gray-900">{formatDate(client.joinedDate)}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {client.birthDate && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">Birth Date</span>
                        <p className="text-gray-900">{formatDate(client.birthDate)}</p>
                      </div>
                    )}
                    {client.emergencyContact && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">Emergency Contact</span>
                        <p className="text-gray-900">{client.emergencyContact}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Goals and Notes */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Goals & Notes</h2>
              
              {editing ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Training Goals</label>
                    <textarea
                      value={editForm.goals}
                      onChange={(e) => setEditForm({...editForm, goals: e.target.value})}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="What are the client's fitness goals?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Medical Notes</label>
                    <textarea
                      value={editForm.medicalNotes}
                      onChange={(e) => setEditForm({...editForm, medicalNotes: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Injuries, limitations, medical conditions"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">General Notes</label>
                    <textarea
                      value={editForm.notes}
                      onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Additional notes about the client"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Training Goals</h3>
                    <p className="text-gray-700 bg-gray-50 rounded-xl p-4">
                      {client.goals || 'No goals specified'}
                    </p>
                  </div>
                  {client.medicalNotes && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Medical Notes</h3>
                      <p className="text-gray-700 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                        ⚠️ {client.medicalNotes}
                      </p>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">General Notes</h3>
                    <p className="text-gray-700 bg-gray-50 rounded-xl p-4">
                      {client.notes || 'No notes'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Session History */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Session History</h2>
              
              {client.appointments.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500">No sessions yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {client.appointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div>
                        <div className="font-semibold text-gray-900">
                          {formatDateTime(appointment.datetime)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {appointment.duration} minutes
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                        {getStatusText(appointment.status)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            
            {/* Stats */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Statistics</h2>
              
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{client.totalAppointments}</div>
                  <div className="text-sm text-gray-600">Total Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{client.completedSessions}</div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{client.upcomingAppointments}</div>
                  <div className="text-sm text-gray-600">Upcoming</div>
                </div>
                {client.lastSessionDate && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">Last session:</div>
                    <div className="font-semibold text-gray-900">{formatDate(client.lastSessionDate)}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
              
              <div className="space-y-3">
                <Link
                  href="/availability"
                  className="w-full inline-flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v12a2 2 0 002 2z" />
                  </svg>
                  Schedule New Session
                </Link>
                <button className="w-full inline-flex items-center justify-center px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Send Email
                </button>
                <button className="w-full inline-flex items-center justify-center px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Send SMS
                </button>
                <button className="w-full inline-flex items-center justify-center px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Add Quick Note
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}