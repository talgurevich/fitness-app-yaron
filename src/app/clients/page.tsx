// src/app/clients/page.tsx - Buttons moved to body for better mobile experience
'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import LanguageToggle, { useTranslations } from '@/components/LanguageToggle'

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
  const { t } = useTranslations()
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
        text: t('active'),
        color: '#16a34a',
        backgroundColor: '#dcfce7'
      }
    }
    if (client.completedSessions > 0) {
      return {
        text: t('existing'),
        color: '#2563eb',
        backgroundColor: '#dbeafe'
      }
    }
    return {
      text: t('new'),
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
          <p style={{ color: '#6b7280', fontSize: '14px' }}>{t('loading_clients')}</p>
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
                {t('client_management')}
              </h1>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                {clients.length} {t('clients_count')}
              </p>
            </div>
          </div>

          {/* Just breadcrumb navigation */}
          <nav style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/dashboard" style={{ color: '#3b82f6', textDecoration: 'none' }}>
              {t('dashboard')}
            </Link>
            <span style={{ margin: '0 8px' }}>›</span>
            <span>{t('clients')}</span>
            <LanguageToggle />
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
            {t('navigation.backToDashboard')}
          </Link>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                alert(t('scheduling_feature_coming_soon'))
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
              {t('schedule_session')}
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
              {t('set_availability')}
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
              {t('share_booking_link')}
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
                {t('your_clients')}
              </h2>
              <p style={{ fontSize: '16px', opacity: 0.9, margin: '0 0 24px 0' }}>
                {t('manage_client_relationships')}
              </p>
              
              {/* Stats Row */}
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                <div>
                  <p style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>{clients.length}</p>
                  <p style={{ fontSize: '14px', opacity: 0.8, margin: 0 }}>{t('total_clients')}</p>
                </div>
                <div>
                  <p style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>{activeClients}</p>
                  <p style={{ fontSize: '14px', opacity: 0.8, margin: 0 }}>{t('active_this_month')}</p>
                </div>
                <div>
                  <p style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>{totalSessions}</p>
                  <p style={{ fontSize: '14px', opacity: 0.8, margin: 0 }}>{t('total_sessions')}</p>
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
                {t('client_directory')}
              </h3>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                {t('find_manage_clients')}
              </p>
            </div>
            
            {/* Search Input */}
            <div style={{ position: 'relative', minWidth: '280px' }}>
              <input
                type="text"
                placeholder={t('search_clients')}
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

        {/* Clients Table */}
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
              {searchTerm ? t('no_clients_found') : t('no_clients_yet')}
            </h3>
            <p style={{ fontSize: '16px', color: '#6b7280', margin: '0 0 24px 0' }}>
              {searchTerm 
                ? t('no_clients_match_search').replace('{searchTerm}', searchTerm)
                : t('clients_added_automatically')
              }
            </p>
          </div>
        ) : (
          <div style={{ 
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '16px',
            overflow: 'hidden'
          }}>
            <table style={{ 
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb' }}>
                  <th style={{ 
                    padding: '16px 20px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#374151',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    Client
                  </th>
                  <th style={{ 
                    padding: '16px 20px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#374151',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    Contact
                  </th>
                  <th style={{ 
                    padding: '16px 20px',
                    textAlign: 'center',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#374151',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    Status
                  </th>
                  <th style={{ 
                    padding: '16px 20px',
                    textAlign: 'center',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#374151',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    Sessions
                  </th>
                  <th style={{ 
                    padding: '16px 20px',
                    textAlign: 'center',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#374151',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    Joined
                  </th>
                  <th style={{ 
                    padding: '16px 20px',
                    textAlign: 'center',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#374151',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    Last Session
                  </th>
                  <th style={{ 
                    padding: '16px 20px',
                    textAlign: 'center',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#374151',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid #e5e7eb',
                    width: '80px'
                  }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client, index) => {
                  const statusInfo = getStatusInfo(client)
                  return (
                    <tr 
                      key={client.id}
                      style={{ 
                        borderBottom: index < filteredClients.length - 1 ? '1px solid #f3f4f6' : 'none',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#f9fafb'
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }}
                    >
                      {/* Client Name and Avatar */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ 
                            width: '40px', 
                            height: '40px', 
                            backgroundColor: '#eff6ff', 
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <svg width="20" height="20" fill="none" stroke="#3b82f6" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div>
                            <p style={{ 
                              fontSize: '14px', 
                              fontWeight: '600', 
                              color: '#111827', 
                              margin: '0 0 2px 0'
                            }}>
                              {client.name}
                            </p>
                            {client.goals && (
                              <p style={{ 
                                fontSize: '12px', 
                                color: '#6b7280', 
                                margin: 0,
                                maxWidth: '200px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                {client.goals}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td style={{ padding: '16px 20px' }}>
                        <div>
                          <p style={{ 
                            fontSize: '13px', 
                            color: '#111827', 
                            margin: '0 0 2px 0'
                          }}>
                            {client.email}
                          </p>
                          {client.phone && (
                            <p style={{ 
                              fontSize: '12px', 
                              color: '#6b7280', 
                              margin: 0
                            }}>
                              {client.phone}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
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
                      </td>

                      {/* Sessions Stats */}
                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '12px' }}>
                          <span style={{ 
                            padding: '2px 6px',
                            backgroundColor: '#f3f4f6',
                            borderRadius: '4px',
                            color: '#374151'
                          }}>
                            {client.totalAppointments} total
                          </span>
                          <span style={{ 
                            padding: '2px 6px',
                            backgroundColor: '#dcfce7',
                            borderRadius: '4px',
                            color: '#16a34a'
                          }}>
                            {client.completedSessions} done
                          </span>
                          <span style={{ 
                            padding: '2px 6px',
                            backgroundColor: '#dbeafe',
                            borderRadius: '4px',
                            color: '#2563eb'
                          }}>
                            {client.upcomingAppointments} upcoming
                          </span>
                        </div>
                      </td>

                      {/* Joined Date */}
                      <td style={{ 
                        padding: '16px 20px', 
                        textAlign: 'center',
                        fontSize: '13px',
                        color: '#6b7280'
                      }}>
                        {formatDate(client.joinedDate)}
                      </td>

                      {/* Last Session */}
                      <td style={{ 
                        padding: '16px 20px', 
                        textAlign: 'center',
                        fontSize: '13px',
                        color: '#6b7280'
                      }}>
                        {client.lastSessionDate ? formatDate(client.lastSessionDate) : '-'}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                        <Link 
                          href={`/clients/${client.id}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '32px',
                            height: '32px',
                            backgroundColor: '#f3f4f6',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#e5e7eb'
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = '#f3f4f6'
                          }}
                          title={`View ${client.name}'s profile`}
                        >
                          <svg width="16" height="16" fill="none" stroke="#6b7280" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
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