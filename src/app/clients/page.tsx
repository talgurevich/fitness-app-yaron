// src/app/clients/page.tsx - Buttons moved to body for better mobile experience
'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Client {
  id: string
  name: string
  email: string
  phone?: string
  joinedDate: string
  lastSessionDate?: string
  totalAppointments: number
  completedSessions: number
  upcomingAppointments: number
  notes?: string
  goals?: string
  lastAppointment?: {
    datetime: string
    status: string
  }
}

export default function ClientsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/login')
      return
    }

    fetchClients()
  }, [session, status, router])

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/trainer/clients')
      const data = await response.json()
      
      if (data.success) {
        setClients(data.clients)
      } else {
        console.error('Failed to fetch clients:', data.error)
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusInfo = (client: Client) => {
    if (client.upcomingAppointments > 0) {
      return {
        text: 'Active',
        color: '#16a34a',
        backgroundColor: '#dcfce7'
      }
    }
    if (client.completedSessions > 0) {
      return {
        text: 'Existing',
        color: '#2563eb',
        backgroundColor: '#dbeafe'
      }
    }
    return {
      text: 'New',
      color: '#6b7280',
      backgroundColor: '#f3f4f6'
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
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading clients...</p>
        </div>
      </div>
    )
  }

  const activeClients = clients.filter(c => c.upcomingAppointments > 0).length
  const totalSessions = clients.reduce((sum, c) => sum + c.totalAppointments, 0)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Clean Header - Only title and essential navigation */}
      <header style={{ 
        backgroundColor: 'white', 
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ 
          maxWidth: '1280px', 
          margin: '0 auto', 
          padding: '0 16px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Title Section */}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
                Client Management
              </h1>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                {clients.length} clients
              </p>
            </div>
          </div>

          {/* Just breadcrumb navigation */}
          <nav style={{ fontSize: '12px', color: '#6b7280' }}>
            <Link href="/dashboard" style={{ color: '#3b82f6', textDecoration: 'none' }}>
              Dashboard
            </Link>
            <span style={{ margin: '0 8px' }}>›</span>
            <span>Clients</span>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
        
        {/* Action Buttons Section - Now in body */}
        <div style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '24px'
        }}>
          {/* Back Button */}
          <Link 
            href="/dashboard"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#6b7280',
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              textDecoration: 'none',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                alert('Scheduling feature coming soon! For now, you can set your availability and share your booking link with clients.')
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#16a34a',
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dcfce7'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f0fdf4'}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Schedule Session
            </button>

            <Link
              href="/availability"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#2563eb',
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                textDecoration: 'none',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dbeafe'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#eff6ff'}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v12a2 2 0 002 2z" />
              </svg>
              Set Availability
            </Link>

            <Link
              href={`/book/${session?.user?.email?.split('@')[0]?.replace(/[^a-zA-Z0-9]/g, '-')}`}
              target="_blank"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#7c3aed',
                backgroundColor: '#faf5ff',
                border: '1px solid #d8b4fe',
                borderRadius: '8px',
                textDecoration: 'none',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3e8ff'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#faf5ff'}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Share Booking Link
            </Link>
          </div>
        </div>

        {/* Hero Section with Stats */}
        <div style={{ 
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
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
                Your Clients 👥
              </h2>
              <p style={{ fontSize: '16px', opacity: 0.9, margin: '0 0 24px 0' }}>
                Manage your client relationships and track their progress
              </p>
              
              {/* Stats Row */}
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                <div>
                  <p style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>{clients.length}</p>
                  <p style={{ fontSize: '14px', opacity: 0.8, margin: 0 }}>Total Clients</p>
                </div>
                <div>
                  <p style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>{activeClients}</p>
                  <p style={{ fontSize: '14px', opacity: 0.8, margin: 0 }}>Active This Month</p>
                </div>
                <div>
                  <p style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>{totalSessions}</p>
                  <p style={{ fontSize: '14px', opacity: 0.8, margin: 0 }}>Total Sessions</p>
                </div>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div style={{ 
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '32px'
        }}>
          <div style={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>
                Client Directory
              </h3>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                Find and manage your clients
              </p>
            </div>
            
            {/* Search Input */}
            <div style={{ position: 'relative', minWidth: '280px' }}>
              <input
                type="text"
                placeholder="Search clients by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 40px',
                  fontSize: '14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
              />
              <div style={{ 
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)'
              }}>
                <svg width="16" height="16" fill="none" stroke="#9ca3af" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Clients Grid */}
        {filteredClients.length === 0 ? (
          <div style={{ 
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '16px',
            padding: '64px 32px',
            textAlign: 'center'
          }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              backgroundColor: '#f3f4f6', 
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <svg width="32" height="32" fill="none" stroke="#9ca3af" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0' }}>
              {searchTerm ? 'No clients found' : 'No clients yet'}
            </h3>
            <p style={{ fontSize: '16px', color: '#6b7280', margin: '0 0 24px 0' }}>
              {searchTerm 
                ? `No clients match "${searchTerm}". Try a different search term.`
                : 'Clients will be automatically added when they book sessions'
              }
            </p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px'
          }}>
            {filteredClients.map((client) => {
              const statusInfo = getStatusInfo(client)
              return (
                <Link 
                  key={client.id} 
                  href={`/clients/${client.id}`}
                  style={{
                    display: 'block',
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '20px',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                    e.currentTarget.style.borderColor = '#3b82f6'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.borderColor = '#e5e7eb'
                  }}
                >
                  {/* Client Header */}
                  <div style={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '16px'
                  }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ 
                        fontSize: '16px', 
                        fontWeight: '600', 
                        color: '#111827', 
                        margin: '0 0 4px 0',
                        transition: 'color 0.2s'
                      }}>
                        {client.name}
                      </h3>
                      <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 2px 0' }}>
                        {client.email}
                      </p>
                      {client.phone && (
                        <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>
                          {client.phone}
                        </p>
                      )}
                    </div>
                    <span style={{ 
                      padding: '4px 8px',
                      fontSize: '11px',
                      fontWeight: '600',
                      color: statusInfo.color,
                      backgroundColor: statusInfo.backgroundColor,
                      borderRadius: '6px',
                      whiteSpace: 'nowrap'
                    }}>
                      {statusInfo.text}
                    </span>
                  </div>

                  {/* Stats Grid */}
                  <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '8px',
                    marginBottom: '16px'
                  }}>
                    <div style={{ 
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px',
                      padding: '8px',
                      textAlign: 'center'
                    }}>
                      <p style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
                        {client.totalAppointments}
                      </p>
                      <p style={{ fontSize: '10px', color: '#6b7280', margin: 0 }}>Total</p>
                    </div>
                    <div style={{ 
                      backgroundColor: '#f0fdf4',
                      borderRadius: '8px',
                      padding: '8px',
                      textAlign: 'center'
                    }}>
                      <p style={{ fontSize: '16px', fontWeight: '600', color: '#16a34a', margin: 0 }}>
                        {client.completedSessions}
                      </p>
                      <p style={{ fontSize: '10px', color: '#6b7280', margin: 0 }}>Done</p>
                    </div>
                    <div style={{ 
                      backgroundColor: '#eff6ff',
                      borderRadius: '8px',
                      padding: '8px',
                      textAlign: 'center'
                    }}>
                      <p style={{ fontSize: '16px', fontWeight: '600', color: '#2563eb', margin: 0 }}>
                        {client.upcomingAppointments}
                      </p>
                      <p style={{ fontSize: '10px', color: '#6b7280', margin: 0 }}>Upcoming</p>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div style={{ 
                    paddingTop: '12px',
                    borderTop: '1px solid #f3f4f6'
                  }}>
                    <div style={{ 
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '12px',
                      color: '#6b7280'
                    }}>
                      <span>Joined {formatDate(client.joinedDate)}</span>
                      {client.lastSessionDate && (
                        <span>Last: {formatDate(client.lastSessionDate)}</span>
                      )}
                    </div>
                    
                    {client.goals && (
                      <div style={{ 
                        marginTop: '8px',
                        padding: '8px',
                        backgroundColor: '#fef3c7',
                        borderRadius: '6px'
                      }}>
                        <p style={{ 
                          fontSize: '11px', 
                          color: '#92400e', 
                          margin: 0,
                          fontWeight: '500'
                        }}>
                          Goals: {client.goals.substring(0, 60)}...
                        </p>
                      </div>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .action-buttons {
            flex-direction: column;
            width: 100%;
          }
          
          .action-buttons > * {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  )
}