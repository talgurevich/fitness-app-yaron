// src/app/clients/[clientId]/page.tsx - Updated to match dashboard design system
'use client'
import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import LanguageToggle, { useTranslations } from '@/components/LanguageToggle'

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
  const { t } = useTranslations()

  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingAppointment, setDeletingAppointment] = useState<string | null>(null)
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

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to cancel this appointment? This will also remove it from your calendar.')) {
      return
    }

    setDeletingAppointment(appointmentId)
    try {
      const response = await fetch(`/api/bookings/${appointmentId}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      
      if (data.success) {
        // Refresh client data to update the appointments list
        await fetchClient()
        alert('Appointment cancelled successfully!')
      } else {
        alert('Error cancelling appointment: ' + data.error)
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error)
      alert('Error cancelling appointment')
    } finally {
      setDeletingAppointment(null)
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
      case 'completed': return { backgroundColor: '#dcfce7', color: '#166534' }
      case 'booked': return { backgroundColor: '#dbeafe', color: '#1e40af' }
      case 'cancelled': return { backgroundColor: '#fee2e2', color: '#991b1b' }
      default: return { backgroundColor: '#f3f4f6', color: '#1f2937' }
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
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading client profile...</p>
        </div>
      </div>
    )
  }

  if (!client) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ 
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '16px',
          padding: '48px',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
            Client not found
          </h2>
          <Link 
            href="/clients" 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: '#2563eb',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Client List
          </Link>
        </div>
      </div>
    )
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
              href="/clients"
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
                transition: 'all 0.2s',
                marginRight: '12px'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Clients
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
                {client.name}
              </h1>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                {client.email}
              </p>
            </div>
          </div>

          {/* Desktop Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LanguageToggle />
            
            {editing ? (
              <>
                <button
                  onClick={() => setEditing(false)}
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
                    cursor: 'pointer',
                    textDecoration: 'none',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: 'white',
                    backgroundColor: saving ? '#9ca3af' : '#3b82f6',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    if (!saving) e.currentTarget.style.backgroundColor = '#2563eb'
                  }}
                  onMouseOut={(e) => {
                    if (!saving) e.currentTarget.style.backgroundColor = '#3b82f6'
                  }}
                >
                  {saving ? (
                    <>
                      <div style={{ 
                        width: '14px', 
                        height: '14px', 
                        border: '2px solid white', 
                        borderTop: '2px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Profile
                </button>
                <Link
                  href={`/book/${session?.user?.email?.split('@')[0]?.replace(/[^a-zA-Z0-9]/g, '-')}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: '#16a34a',
                    backgroundColor: '#f0fdf4',
                    border: 'none',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dcfce7'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f0fdf4'}
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v12a2 2 0 002 2z" />
                  </svg>
                  Schedule Session
                </Link>
              </>
            )}
            
            <button
              onClick={() => signOut()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                fontSize: '13px',
                fontWeight: '500',
                color: '#dc2626',
                backgroundColor: '#fef2f2',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {t('sign_out')}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
        
        {/* Client Hero Section */}
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '32px',
          color: 'white'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 8px 0' }}>
                {client.name} 👤
              </h2>
              <p style={{ fontSize: '16px', opacity: 0.9, margin: '0 0 24px 0' }}>
                Client since {formatDate(client.joinedDate)}
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Link
                  href={`/book/${session?.user?.email?.split('@')[0]?.replace(/[^a-zA-Z0-9]/g, '-')}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#667eea',
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v12a2 2 0 002 2z" />
                  </svg>
                  Schedule Session
                </Link>
                <button
                  onClick={() => setEditing(!editing)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'white',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  {editing ? 'Cancel Edit' : 'Edit Profile'}
                </button>
              </div>
            </div>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              backgroundColor: 'rgba(255,255,255,0.2)', 
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '32px'
        }}>
          <div style={{ 
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '20px',
            transition: 'all 0.2s'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                backgroundColor: '#eff6ff', 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="20" height="20" fill="none" stroke="#3b82f6" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Total Sessions</p>
                <p style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0 }}>
                  {client.totalAppointments}
                </p>
              </div>
            </div>
          </div>

          <div style={{ 
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '20px',
            transition: 'all 0.2s'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                backgroundColor: '#f0fdf4', 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="20" height="20" fill="none" stroke="#16a34a" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Completed</p>
                <p style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0 }}>
                  {client.completedSessions}
                </p>
              </div>
            </div>
          </div>

          <div style={{ 
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '20px',
            transition: 'all 0.2s'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                backgroundColor: '#faf5ff', 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="20" height="20" fill="none" stroke="#9333ea" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Upcoming</p>
                <p style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0 }}>
                  {client.upcomingAppointments}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Layout */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'minmax(0, 1fr) 300px',
          gap: '32px'
        }}>
          
          {/* Main Content Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Basic Information */}
            <div style={{ 
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '16px',
              overflow: 'hidden'
            }}>
              <div style={{ 
                padding: '24px',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
                    Basic Information
                  </h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
                    Contact details and personal info
                  </p>
                </div>
              </div>
              
              <div style={{ padding: '24px' }}>
                {editing ? (
                  <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '20px'
                  }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', margin: '0 0 8px 0' }}>
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          color: '#111827',
                          backgroundColor: 'white'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', margin: '0 0 8px 0' }}>
                        Phone
                      </label>
                      <input
                        type="text"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          color: '#111827',
                          backgroundColor: 'white'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', margin: '0 0 8px 0' }}>
                        Birth Date
                      </label>
                      <input
                        type="date"
                        value={editForm.birthDate}
                        onChange={(e) => setEditForm({...editForm, birthDate: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          color: '#111827',
                          backgroundColor: 'white'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', margin: '0 0 8px 0' }}>
                        Emergency Contact
                      </label>
                      <input
                        type="text"
                        value={editForm.emergencyContact}
                        onChange={(e) => setEditForm({...editForm, emergencyContact: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          color: '#111827',
                          backgroundColor: 'white'
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '24px'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div>
                        <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Email
                        </p>
                        <p style={{ fontSize: '14px', color: '#111827', margin: 0 }}>
                          {client.email}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Phone
                        </p>
                        <p style={{ fontSize: '14px', color: '#111827', margin: 0 }}>
                          {client.phone || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Joined
                        </p>
                        <p style={{ fontSize: '14px', color: '#111827', margin: 0 }}>
                          {formatDate(client.joinedDate)}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {client.birthDate && (
                        <div>
                          <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Birth Date
                          </p>
                          <p style={{ fontSize: '14px', color: '#111827', margin: 0 }}>
                            {formatDate(client.birthDate)}
                          </p>
                        </div>
                      )}
                      {client.emergencyContact && (
                        <div>
                          <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Emergency Contact
                          </p>
                          <p style={{ fontSize: '14px', color: '#111827', margin: 0 }}>
                            {client.emergencyContact}
                          </p>
                        </div>
                      )}
                      {client.lastSessionDate && (
                        <div>
                          <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Last Session
                          </p>
                          <p style={{ fontSize: '14px', color: '#111827', margin: 0 }}>
                            {formatDate(client.lastSessionDate)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Goals and Notes */}
            <div style={{ 
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '16px',
              overflow: 'hidden'
            }}>
              <div style={{ 
                padding: '24px',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
                  Goals & Notes
                </h3>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
                  Training goals and important information
                </p>
              </div>
              
              <div style={{ padding: '24px' }}>
                {editing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', margin: '0 0 8px 0' }}>
                        Training Goals
                      </label>
                      <textarea
                        value={editForm.goals}
                        onChange={(e) => setEditForm({...editForm, goals: e.target.value})}
                        rows={4}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          color: '#111827',
                          backgroundColor: 'white',
                          resize: 'vertical'
                        }}
                        placeholder="What are the client's fitness goals?"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', margin: '0 0 8px 0' }}>
                        Medical Notes
                      </label>
                      <textarea
                        value={editForm.medicalNotes}
                        onChange={(e) => setEditForm({...editForm, medicalNotes: e.target.value})}
                        rows={3}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          color: '#111827',
                          backgroundColor: 'white',
                          resize: 'vertical'
                        }}
                        placeholder="Injuries, limitations, medical conditions"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', margin: '0 0 8px 0' }}>
                        General Notes
                      </label>
                      <textarea
                        value={editForm.notes}
                        onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                        rows={4}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          color: '#111827',
                          backgroundColor: 'white',
                          resize: 'vertical'
                        }}
                        placeholder="Additional notes about the client"
                      />
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0' }}>
                        Training Goals
                      </h4>
                      <div style={{ 
                        padding: '16px',
                        backgroundColor: '#f9fafb',
                        border: '1px solid #f3f4f6',
                        borderRadius: '8px'
                      }}>
                        <p style={{ fontSize: '14px', color: '#374151', margin: 0, lineHeight: '1.5' }}>
                          {client.goals || 'No goals specified'}
                        </p>
                      </div>
                    </div>
                    {client.medicalNotes && (
                      <div>
                        <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0' }}>
                          Medical Notes
                        </h4>
                        <div style={{ 
                          padding: '16px',
                          backgroundColor: '#fefce8',
                          border: '1px solid #fde047',
                          borderRadius: '8px'
                        }}>
                          <p style={{ fontSize: '14px', color: '#a16207', margin: 0, lineHeight: '1.5' }}>
                            ⚠️ {client.medicalNotes}
                          </p>
                        </div>
                      </div>
                    )}
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0' }}>
                        General Notes
                      </h4>
                      <div style={{ 
                        padding: '16px',
                        backgroundColor: '#f9fafb',
                        border: '1px solid #f3f4f6',
                        borderRadius: '8px'
                      }}>
                        <p style={{ fontSize: '14px', color: '#374151', margin: 0, lineHeight: '1.5' }}>
                          {client.notes || 'No notes'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Session History */}
            <div style={{ 
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '16px',
              overflow: 'hidden'
            }}>
              <div style={{ 
                padding: '24px',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
                  Session History
                </h3>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
                  {client.appointments?.length || 0} sessions recorded
                </p>
              </div>
              
              <div style={{ padding: '24px' }}>
                {!client.appointments || client.appointments.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                    <div style={{ 
                      width: '64px', 
                      height: '64px', 
                      backgroundColor: '#f3f4f6', 
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px'
                    }}>
                      <svg width="24" height="24" fill="none" stroke="#9ca3af" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0' }}>
                      No sessions yet
                    </h4>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 20px 0' }}>
                      Sessions will appear here once scheduled
                    </p>
                    <Link
                      href={`/book/${session?.user?.email?.split('@')[0]?.replace(/[^a-zA-Z0-9]/g, '-')}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 16px',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#16a34a',
                        backgroundColor: '#f0fdf4',
                        border: 'none',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        transition: 'all 0.2s'
                      }}
                    >
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v12a2 2 0 002 2z" />
                      </svg>
                      Schedule first session
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {(client.appointments || []).map((appointment) => (
                      <div key={appointment.id} style={{ 
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '16px',
                        border: '1px solid #f3f4f6',
                        borderRadius: '8px',
                        transition: 'all 0.2s'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ 
                            width: '32px', 
                            height: '32px', 
                            backgroundColor: '#eff6ff', 
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <svg width="16" height="16" fill="none" stroke="#3b82f6" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <p style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: 0 }}>
                              {formatDateTime(appointment.datetime)}
                            </p>
                            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                              {appointment.duration} minutes
                            </p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ 
                            display: 'inline-block',
                            padding: '4px 8px',
                            fontSize: '11px',
                            fontWeight: '500',
                            borderRadius: '12px',
                            ...getStatusColor(appointment.status)
                          }}>
                            {getStatusText(appointment.status)}
                          </span>
                          {/* Only show delete button for future appointments */}
                          {appointment.status === 'booked' && new Date(appointment.datetime) > new Date() && (
                            <button
                              onClick={() => handleDeleteAppointment(appointment.id)}
                              disabled={deletingAppointment === appointment.id}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '6px 8px',
                                fontSize: '11px',
                                fontWeight: '500',
                                color: deletingAppointment === appointment.id ? '#9ca3af' : '#dc2626',
                                backgroundColor: deletingAppointment === appointment.id ? '#f9fafb' : '#fef2f2',
                                border: `1px solid ${deletingAppointment === appointment.id ? '#e5e7eb' : '#fecaca'}`,
                                borderRadius: '6px',
                                cursor: deletingAppointment === appointment.id ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s'
                              }}
                              onMouseOver={(e) => {
                                if (deletingAppointment !== appointment.id) {
                                  e.currentTarget.style.backgroundColor = '#fee2e2'
                                }
                              }}
                              onMouseOut={(e) => {
                                if (deletingAppointment !== appointment.id) {
                                  e.currentTarget.style.backgroundColor = '#fef2f2'
                                }
                              }}
                            >
                              {deletingAppointment === appointment.id ? (
                                <>
                                  <div style={{ 
                                    width: '10px', 
                                    height: '10px', 
                                    border: '1px solid #9ca3af', 
                                    borderTop: '1px solid transparent',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                  }}></div>
                                  Cancelling...
                                </>
                              ) : (
                                <>
                                  <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  Cancel
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Quick Actions */}
            <div style={{ 
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
                Quick Actions
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Link
                  href={`/book/${session?.user?.email?.split('@')[0]?.replace(/[^a-zA-Z0-9]/g, '-')}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 12px',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: 'white',
                    backgroundColor: '#16a34a',
                    border: 'none',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#15803d'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v12a2 2 0 002 2z" />
                  </svg>
                  Schedule Session
                </Link>
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 12px',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: '#374151',
                    backgroundColor: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Send Email
                </button>
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 12px',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: '#374151',
                    backgroundColor: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Send SMS
                </button>
              </div>
            </div>

            {/* Client Summary */}
            <div style={{ 
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
                Client Summary
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 2px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Member Since
                  </p>
                  <p style={{ fontSize: '13px', color: '#111827', margin: 0 }}>
                    {formatDate(client.joinedDate)}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 2px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Session Duration
                  </p>
                  <p style={{ fontSize: '13px', color: '#111827', margin: 0 }}>
                    {client.sessionDuration || 60} minutes
                  </p>
                </div>
                {client.phone && (
                  <div>
                    <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 2px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Phone
                    </p>
                    <p style={{ fontSize: '13px', color: '#111827', margin: 0 }}>
                      {client.phone}
                    </p>
                  </div>
                )}
              </div>
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