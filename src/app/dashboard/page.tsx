// src/app/dashboard/page.tsx - Complete dashboard with WhatsApp Help Component
'use client'
import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import LanguageToggle, { useTranslations } from '@/components/LanguageToggle'
import WhatsAppHelp from '@/components/WhatsAppHelp'

interface Appointment {
  id: string
  clientName: string
  clientEmail: string
  datetime: string
  duration: number
  status: string
}

interface CalendarStatus {
  connected: boolean
  calendarsFound?: number
  primaryCalendar?: string
  error?: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t } = useTranslations()
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [autoCompleting, setAutoCompleting] = useState(false)
  const [completedCount, setCompletedCount] = useState(0)
  const [calendarStatus, setCalendarStatus] = useState<CalendarStatus>({ connected: false })
  const [calendarTesting, setCalendarTesting] = useState(false)
  const [calendarConnecting, setCalendarConnecting] = useState(false)
  const [calendarMessage, setCalendarMessage] = useState<string | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/login')
      return
    }

    // Run auto-completion first, then fetch appointments, then check calendar
    fetchDashboardData()
  }, [session, status, router])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // 🆕 STEP 1: Run auto-completion first to update past appointments
      await runAutoCompletion()
      
      // STEP 2: Then fetch updated appointment data
      await fetchUpcomingAppointments()
      
      // STEP 3: Check calendar connection status
      await checkCalendarStatus()
      
      // STEP 4: Check if user has seen onboarding
      const seenOnboarding = localStorage.getItem(`onboarding_seen_${session?.user?.email}`)
      if (!seenOnboarding) {
        setShowOnboarding(true)
      }
      
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  // 🆕 Check Calendar Connection Status
  const checkCalendarStatus = async () => {
    try {
      const response = await fetch('/api/calendar/connect')
      const data = await response.json()
      
      if (data.success) {
        setCalendarStatus({
          connected: true,
          calendarsFound: data.calendars?.length || 0,
          primaryCalendar: data.calendars?.find(cal => cal.primary)?.name || 'Unknown'
        })
      } else {
        setCalendarStatus({
          connected: false,
          error: data.error
        })
      }
    } catch (error) {
      console.error('Calendar status check failed:', error)
      setCalendarStatus({
        connected: false,
        error: 'Failed to check calendar status'
      })
    }
  }

  // 🆕 Auto-completion function
  const runAutoCompletion = async () => {
    try {
      setAutoCompleting(true)
      
      const response = await fetch('/api/trainer/auto-complete', {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        
        if (data.completed > 0) {
          setCompletedCount(data.completed)
          console.log(`Auto-completed ${data.completed} appointments`)
          
          // Show a brief notification (optional)
          if (data.completed > 0) {
            setTimeout(() => setCompletedCount(0), 5000) // Clear after 5 seconds
          }
        }
      }
    } catch (error) {
      console.error('Auto-completion failed:', error)
    } finally {
      setAutoCompleting(false)
    }
  }

  const fetchUpcomingAppointments = async () => {
    try {
      const response = await fetch('/api/trainer/appointments')
      const data = await response.json()
      
      if (data.success) {
        setUpcomingAppointments(data.appointments || [])
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
    }
  }

  // 🆕 Manual refresh function
  const handleRefresh = async () => {
    await fetchDashboardData()
  }

  const handleOnboardingClose = () => {
    setShowOnboarding(false)
    localStorage.setItem(`onboarding_seen_${session?.user?.email}`, 'true')
  }

  const handleStartSetup = () => {
    handleOnboardingClose()
    router.push('/availability')
  }

  // 🆕 Connect Calendar function
  const handleConnectCalendar = async () => {
    try {
      setCalendarConnecting(true)
      setCalendarMessage(null)
      
      const response = await fetch('/api/calendar/connect')
      const data = await response.json()
      
      if (data.success) {
        setCalendarStatus({
          connected: true,
          calendarsFound: data.calendars?.length || 0,
          primaryCalendar: data.calendars?.find(cal => cal.primary)?.name || 'Unknown'
        })
        setCalendarMessage('✅ Calendar connected successfully!')
      } else {
        setCalendarMessage(`❌ ${data.error || 'Calendar connection failed'}`)
        
        // If needs Google auth, could redirect to re-login
        if (data.needsGoogleAuth || data.needsReauth) {
          setCalendarMessage('❌ Please logout and login again with Google to connect calendar')
        }
      }
      
      // Clear message after 5 seconds
      setTimeout(() => setCalendarMessage(null), 5000)
      
    } catch (error) {
      console.error('Calendar connection failed:', error)
      setCalendarMessage('❌ Calendar connection failed')
      setTimeout(() => setCalendarMessage(null), 5000)
    } finally {
      setCalendarConnecting(false)
    }
  }

  // 🆕 Test Calendar function
  const handleTestCalendar = async () => {
    try {
      setCalendarTesting(true)
      setCalendarMessage(null)
      
      const response = await fetch('/api/calendar/test')
      const data = await response.json()
      
      if (data.success) {
        setCalendarMessage('✅ Calendar test successful!')
      } else {
        setCalendarMessage(`❌ ${data.error || 'Calendar test failed'}`)
      }
      
      // Clear message after 5 seconds
      setTimeout(() => setCalendarMessage(null), 5000)
      
    } catch (error) {
      console.error('Calendar test failed:', error)
      setCalendarMessage('❌ Calendar test failed')
      setTimeout(() => setCalendarMessage(null), 5000)
    } finally {
      setCalendarTesting(false)
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      })
    }
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
      case 'completed': return t('completed')
      case 'booked': return t('scheduled_status')
      case 'cancelled': return t('cancelled')
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
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            {autoCompleting ? 'Updating sessions...' : (t('loading_dashboard') || 'Loading dashboard...')}
          </p>
        </div>
      </div>
    )
  }

  const todaySessions = upcomingAppointments.filter(apt => {
    const today = new Date().toDateString()
    const aptDate = new Date(apt.datetime).toDateString()
    return today === aptDate
  }).length

  const weekSessions = upcomingAppointments.length
  const uniqueClients = new Set(upcomingAppointments.map(apt => apt.clientEmail)).size

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Top Header */}
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
                <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
                {t('trainer_dashboard')}
              </h1>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                Welcome, {session?.user?.name || session?.user?.email}
              </p>
            </div>
          </div>

          {/* Desktop Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LanguageToggle />
            
            {/* 🆕 Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={loading || autoCompleting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                fontSize: '13px',
                fontWeight: '500',
                color: '#059669',
                backgroundColor: '#ecfdf5',
                border: 'none',
                borderRadius: '6px',
                cursor: loading || autoCompleting ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                if (!loading && !autoCompleting) {
                  e.currentTarget.style.backgroundColor = '#d1fae5'
                }
              }}
              onMouseOut={(e) => {
                if (!loading && !autoCompleting) {
                  e.currentTarget.style.backgroundColor = '#ecfdf5'
                }
              }}
            >
              {loading || autoCompleting ? (
                <>
                  <div style={{ 
                    width: '14px', 
                    height: '14px', 
                    border: '2px solid #059669', 
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  {t('updating')}
                </>
              ) : (
                <>
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {t('refresh')}
                </>
              )}
            </button>
            
            <Link
              href={`/book/${session?.user?.email?.split('@')[0]?.replace(/[^a-zA-Z0-9]/g, '-')}`}
              target="_blank"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                fontSize: '13px',
                fontWeight: '500',
                color: '#2563eb',
                backgroundColor: '#eff6ff',
                border: 'none',
                borderRadius: '6px',
                textDecoration: 'none',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dbeafe'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#eff6ff'}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              {t('share_link')}
            </Link>
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
        
        {/* 🆕 Calendar status notification */}
        {calendarMessage && (
          <div style={{
            backgroundColor: calendarMessage.includes('✅') ? '#ecfdf5' : '#fef2f2',
            border: `1px solid ${calendarMessage.includes('✅') ? '#a7f3d0' : '#fecaca'}`,
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ 
              fontSize: '14px', 
              color: calendarMessage.includes('✅') ? '#059669' : '#dc2626', 
              fontWeight: '500' 
            }}>
              {calendarMessage}
            </span>
          </div>
        )}
        
        {/* 🆕 Auto-completion notification */}
        {completedCount > 0 && (
          <div style={{
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <svg width="16" height="16" fill="none" stroke="#059669" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span style={{ fontSize: '14px', color: '#059669', fontWeight: '500' }}>
              ✓ Auto-completed {completedCount} past session{completedCount !== 1 ? 's' : ''}
            </span>
          </div>
        )}
        
        {/* Welcome Section - Enhanced with Calendar Controls */}
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
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 8px 0' }}>
                {t('welcome_back_trainer')} 💪
              </h2>
              <p style={{ fontSize: '16px', opacity: 0.9, margin: '0 0 24px 0' }}>
                {t('business_today')}
              </p>
              
              {/* Calendar Status & Controls */}
              <div style={{ 
                backgroundColor: 'rgba(255,255,255,0.1)', 
                borderRadius: '12px', 
                padding: '16px',
                marginBottom: '24px',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <svg width="18" height="18" fill="white" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v12a2 2 0 002 2z" />
                  </svg>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>
                    Google Calendar
                  </h3>
                </div>
                
                {calendarStatus.connected ? (
                  <div>
                    <p style={{ fontSize: '14px', opacity: 0.9, margin: '0 0 12px 0' }}>
                      ✅ Connected to {calendarStatus.primaryCalendar} ({calendarStatus.calendarsFound} calendars)
                    </p>
                    <button
                      onClick={handleTestCalendar}
                      disabled={calendarTesting}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#667eea',
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: calendarTesting ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        if (!calendarTesting) {
                          e.currentTarget.style.transform = 'translateY(-1px)'
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!calendarTesting) {
                          e.currentTarget.style.transform = 'translateY(0)'
                        }
                      }}
                    >
                      {calendarTesting ? (
                        <>
                          <div style={{ 
                            width: '14px', 
                            height: '14px', 
                            border: '2px solid #667eea', 
                            borderTop: '2px solid transparent',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                          }}></div>
                          Testing...
                        </>
                      ) : (
                        <>
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Test Calendar
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div>
                    <p style={{ fontSize: '14px', opacity: 0.9, margin: '0 0 12px 0' }}>
                      ❌ Calendar not connected - appointments won't sync to Google Calendar
                    </p>
                    <button
                      onClick={handleConnectCalendar}
                      disabled={calendarConnecting}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#667eea',
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: calendarConnecting ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        if (!calendarConnecting) {
                          e.currentTarget.style.transform = 'translateY(-1px)'
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!calendarConnecting) {
                          e.currentTarget.style.transform = 'translateY(0)'
                        }
                      }}
                    >
                      {calendarConnecting ? (
                        <>
                          <div style={{ 
                            width: '14px', 
                            height: '14px', 
                            border: '2px solid #667eea', 
                            borderTop: '2px solid transparent',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                          }}></div>
                          Connecting...
                        </>
                      ) : (
                        <>
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v12a2 2 0 002 2z" />
                          </svg>
                          Connect Calendar
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Other Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Link
                  href="/availability"
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
                  {t('set_availability')}
                </Link>
                <Link
                  href="/clients"
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
                    textDecoration: 'none',
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  View Clients
                </Link>
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
                <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
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
                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>{t('todays_sessions')}</p>
                <p style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0 }}>
                  {todaySessions}
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
                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>{t('this_week')}</p>
                <p style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0 }}>
                  {weekSessions}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>{t('active_clients')}</p>
                <p style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0 }}>
                  {uniqueClients}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Layout - Responsive Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr',
          gap: '32px'
        }} className="main-layout">
          
          {/* Main Sessions Area */}
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
                  {t('upcoming_sessions')}
                </h3>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
                  {upcomingAppointments.length} {t('scheduled')}
                </p>
              </div>
            </div>
            
            <div style={{ padding: '24px' }}>
              {upcomingAppointments.length === 0 ? (
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
                    {t('no_upcoming_sessions')}
                  </h4>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 20px 0' }}>
                    {t('new_appointments_appear_here')}
                  </p>
                  <Link
                    href={`/book/${session?.user?.email?.split('@')[0]?.replace(/[^a-zA-Z0-9]/g, '-')}`}
                    target="_blank"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 16px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#2563eb',
                      backgroundColor: '#eff6ff',
                      border: 'none',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    {t('share_booking_link')}
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {upcomingAppointments.slice(0, 8).map((appointment) => {
                    const { date, time } = formatDateTime(appointment.datetime)
                    return (
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
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div>
                            <p style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: 0 }}>
                              {appointment.clientName}
                            </p>
                            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                              {appointment.clientEmail}
                            </p>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: '13px', fontWeight: '500', color: '#111827', margin: 0 }}>
                            {date}
                          </p>
                          <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                            {time}
                          </p>
                          <span style={{ 
                            display: 'inline-block',
                            padding: '2px 8px',
                            fontSize: '11px',
                            fontWeight: '500',
                            borderRadius: '12px',
                            marginTop: '4px',
                            ...getStatusColor(appointment.status).split(' ').reduce((acc, cls) => {
                              if (cls.startsWith('bg-')) {
                                acc.backgroundColor = {
                                  'bg-green-100': '#dcfce7',
                                  'bg-blue-100': '#dbeafe',
                                  'bg-red-100': '#fee2e2',
                                  'bg-gray-100': '#f3f4f6'
                                }[cls] || '#f3f4f6'
                              }
                              if (cls.startsWith('text-')) {
                                acc.color = {
                                  'text-green-800': '#166534',
                                  'text-blue-800': '#1e40af',
                                  'text-red-800': '#991b1b',
                                  'text-gray-800': '#1f2937'
                                }[cls] || '#1f2937'
                              }
                              return acc
                            }, {})
                          }}>
                            {getStatusText(appointment.status)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Quick Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Quick Actions */}
            <div style={{ 
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
                {t('quick_actions')}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Link
                  href="/availability"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 12px',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: 'white',
                    backgroundColor: '#3b82f6',
                    border: 'none',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v12a2 2 0 002 2z" />
                  </svg>
                  {t('set_availability')}
                </Link>
                <Link
                  href="/clients"
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
                    textDecoration: 'none',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  {t('manage_clients')}
                </Link>
                <Link
                  href={`/book/${session?.user?.email?.split('@')[0]?.replace(/[^a-zA-Z0-9]/g, '-')}`}
                  target="_blank"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 12px',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: '#2563eb',
                    backgroundColor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dbeafe'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#eff6ff'}
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  {t('share_link')}
                </Link>
              </div>
            </div>

            {/* Profile Card */}
            <div style={{ 
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
                {t('profile_info')}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 2px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {t('name').toUpperCase()}
                  </p>
                  <p style={{ fontSize: '13px', color: '#111827', margin: 0 }}>
                    {session?.user?.name || t('not_set')}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 2px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {t('email').toUpperCase()}
                  </p>
                  <p style={{ fontSize: '13px', color: '#111827', margin: 0 }}>
                    {session?.user?.email}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 2px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {t('booking_url').toUpperCase()}
                  </p>
                  <code style={{ 
                    fontSize: '11px', 
                    color: '#6b7280', 
                    backgroundColor: '#f9fafb',
                    padding: '4px 6px',
                    borderRadius: '4px',
                    display: 'block',
                    wordBreak: 'break-all'
                  }}>
                    /book/{session?.user?.email?.split('@')[0]?.replace(/[^a-zA-Z0-9]/g, '-')}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Onboarding Modal */}
      {showOnboarding && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            padding: '32px',
            position: 'relative'
          }}>
            {/* Close button */}
            <button
              onClick={handleOnboardingClose}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                color: '#6b7280',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              ×
            </button>

            {/* Modal Content */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                fontSize: '36px'
              }}>
                🚀
              </div>
              <h2 style={{
                fontSize: '28px',
                fontWeight: '700',
                color: '#111827',
                margin: '0 0 8px 0'
              }}>
                {t('welcome_to_system')}
              </h2>
              <p style={{
                fontSize: '16px',
                color: '#6b7280',
                margin: 0
              }}>
                {t('lets_get_started')}
              </p>
            </div>

            <p style={{
              fontSize: '16px',
              color: '#4b5563',
              textAlign: 'center',
              marginBottom: '32px',
              lineHeight: 1.6
            }}>
              {t('onboarding_intro')}
            </p>

            {/* Steps */}
            <div style={{ marginBottom: '32px' }}>
              {/* Step 1 */}
              <div style={{
                display: 'flex',
                gap: '16px',
                marginBottom: '24px',
                padding: '16px',
                backgroundColor: '#f9fafb',
                borderRadius: '12px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#eff6ff',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#3b82f6'
                }}>
                  1
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#111827',
                    margin: '0 0 4px 0'
                  }}>
                    {t('set_your_availability')}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    margin: 0,
                    lineHeight: 1.5
                  }}>
                    {t('set_availability_desc')}
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div style={{
                display: 'flex',
                gap: '16px',
                marginBottom: '24px',
                padding: '16px',
                backgroundColor: '#f9fafb',
                borderRadius: '12px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#f0fdf4',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#16a34a'
                }}>
                  2
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#111827',
                    margin: '0 0 4px 0'
                  }}>
                    {t('test_calendar_connection')}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    margin: 0,
                    lineHeight: 1.5
                  }}>
                    {t('test_calendar_desc')}
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div style={{
                display: 'flex',
                gap: '16px',
                padding: '16px',
                backgroundColor: '#f9fafb',
                borderRadius: '12px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#faf5ff',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#9333ea'
                }}>
                  3
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#111827',
                    margin: '0 0 4px 0'
                  }}>
                    {t('share_your_link')}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    margin: 0,
                    lineHeight: 1.5
                  }}>
                    {t('share_link_desc')}
                  </p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center'
            }}>
              <button
                onClick={handleStartSetup}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                {t('start_setup')}
              </button>
              <button
                onClick={handleOnboardingClose}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'transparent',
                  color: '#6b7280',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb'
                  e.currentTarget.style.color = '#4b5563'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = '#6b7280'
                }}
              >
                {t('skip_tutorial')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🆕 WhatsApp Help Component - Floating Button */}
      <WhatsAppHelp />

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @media (min-width: 1025px) {
          .main-layout {
            grid-template-columns: minmax(0, 1fr) 300px !important;
          }
        }
        
        @media (max-width: 1024px) {
          .main-layout {
            grid-template-columns: 1fr !important;
          }
          
          /* On mobile, show quick actions after the main content */
          .main-layout > div:nth-child(2) {
            order: 2;
          }
          
          .main-layout > div:first-child {
            order: 1;
          }
        }
      `}</style>
    </div>
  )
}