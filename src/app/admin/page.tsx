'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface TrainerAnalytics {
  id: string
  bookingSlug: string
  user: {
    name: string | null
    email: string
  }
  thisMonth: {
    appointmentCount: number
    revenue: number
    uniqueClients: number
    newClients: number
  }
  total: {
    appointmentCount: number
    clientCount: number
  }
  recentAppointments: Array<{
    id: string
    datetime: string
    clientName: string
    clientEmail: string
    status: string
    sessionPrice: number | null
  }>
}

interface AnalyticsData {
  dateRange: {
    monthName: string
  }
  platformStats: {
    totalTrainers: number
    totalAppointmentsThisMonth: number
    totalRevenueThisMonth: number
    totalNewClientsThisMonth: number
    averageAppointmentsPerTrainer: number
  }
  trainers: TrainerAnalytics[]
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'loading') return

    fetchAnalytics()
  }, [status, router])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/analytics')
      
      if (!response.ok) {
        if (response.status === 403) {
          setError('Access denied - Admin permissions required')
          return
        }
        throw new Error('Failed to fetch analytics')
      }

      const data = await response.json()
      setAnalytics(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#64748b', fontSize: '16px' }}>Loading admin dashboard...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '32px',
          maxWidth: '400px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: '600', 
            color: '#1f2937', 
            marginBottom: '12px' 
          }}>
            Access Error
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>{error}</p>
          <button 
            onClick={() => router.push('/')}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            Return Home
          </button>
        </div>
      </div>
    )
  }

  if (!analytics) return null

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '24px 0'
          }}>
            <div>
              <h1 style={{
                fontSize: '32px',
                fontWeight: '700',
                color: '#1e293b',
                margin: '0 0 8px 0'
              }}>
                🎯 Admin Dashboard
              </h1>
              <p style={{
                color: '#64748b',
                fontSize: '16px',
                margin: '0'
              }}>
                Platform analytics for {analytics.dateRange.monthName}
              </p>
            </div>
            <div style={{
              fontSize: '14px',
              color: '#64748b',
              padding: '8px 16px',
              backgroundColor: '#f1f5f9',
              borderRadius: '8px'
            }}>
              Welcome, {session?.user?.name || session?.user?.email}
            </div>
          </div>
        </div>
      </div>

      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '32px 24px'
      }}>
        {/* Platform Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              fontSize: '36px',
              fontWeight: '700',
              color: '#3b82f6',
              marginBottom: '8px'
            }}>
              {analytics.platformStats.totalTrainers}
            </div>
            <div style={{
              fontSize: '14px',
              color: '#64748b',
              fontWeight: '500'
            }}>
              👥 Total Trainers
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              fontSize: '36px',
              fontWeight: '700',
              color: '#10b981',
              marginBottom: '8px'
            }}>
              {analytics.platformStats.totalAppointmentsThisMonth}
            </div>
            <div style={{
              fontSize: '14px',
              color: '#64748b',
              fontWeight: '500'
            }}>
              📅 Sessions This Month
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              fontSize: '36px',
              fontWeight: '700',
              color: '#8b5cf6',
              marginBottom: '8px'
            }}>
              ₪{analytics.platformStats.totalRevenueThisMonth.toLocaleString()}
            </div>
            <div style={{
              fontSize: '14px',
              color: '#64748b',
              fontWeight: '500'
            }}>
              💰 Revenue This Month
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              fontSize: '36px',
              fontWeight: '700',
              color: '#f59e0b',
              marginBottom: '8px'
            }}>
              {analytics.platformStats.totalNewClientsThisMonth}
            </div>
            <div style={{
              fontSize: '14px',
              color: '#64748b',
              fontWeight: '500'
            }}>
              ✨ New Clients
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              fontSize: '36px',
              fontWeight: '700',
              color: '#6366f1',
              marginBottom: '8px'
            }}>
              {analytics.platformStats.averageAppointmentsPerTrainer}
            </div>
            <div style={{
              fontSize: '14px',
              color: '#64748b',
              fontWeight: '500'
            }}>
              📊 Avg Sessions/Trainer
            </div>
          </div>
        </div>

        {/* Trainers Table */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '24px',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#1e293b',
              margin: '0'
            }}>
              🏆 Trainer Performance
            </h2>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead style={{ backgroundColor: '#f8fafc' }}>
                <tr>
                  <th style={{
                    padding: '16px 24px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid #e2e8f0'
                  }}>
                    Trainer
                  </th>
                  <th style={{
                    padding: '16px 24px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid #e2e8f0'
                  }}>
                    Sessions This Month
                  </th>
                  <th style={{
                    padding: '16px 24px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid #e2e8f0'
                  }}>
                    Revenue This Month
                  </th>
                  <th style={{
                    padding: '16px 24px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid #e2e8f0'
                  }}>
                    Active Clients
                  </th>
                  <th style={{
                    padding: '16px 24px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid #e2e8f0'
                  }}>
                    Total Clients
                  </th>
                  <th style={{
                    padding: '16px 24px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid #e2e8f0'
                  }}>
                    Booking Link
                  </th>
                </tr>
              </thead>
              <tbody>
                {analytics.trainers.map((trainer, index) => (
                  <tr 
                    key={trainer.id}
                    style={{
                      backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb',
                      borderBottom: '1px solid #f1f5f9'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f1f5f9'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'white' : '#f9fafb'
                    }}
                  >
                    <td style={{ padding: '20px 24px' }}>
                      <div>
                        <div style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#1f2937',
                          marginBottom: '4px'
                        }}>
                          {trainer.user.name || 'No name set'}
                        </div>
                        <div style={{
                          fontSize: '14px',
                          color: '#6b7280'
                        }}>
                          {trainer.user.email}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div>
                        <div style={{
                          fontSize: '18px',
                          fontWeight: '600',
                          color: '#1f2937',
                          marginBottom: '4px'
                        }}>
                          {trainer.thisMonth.appointmentCount}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#6b7280'
                        }}>
                          {trainer.thisMonth.uniqueClients} unique clients
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#059669'
                      }}>
                        ₪{trainer.thisMonth.revenue.toLocaleString()}
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{
                        fontSize: '16px',
                        color: '#1f2937'
                      }}>
                        {trainer.thisMonth.uniqueClients}
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div>
                        <div style={{
                          fontSize: '16px',
                          color: '#1f2937',
                          marginBottom: '4px'
                        }}>
                          {trainer.total.clientCount}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#6b7280'
                        }}>
                          +{trainer.thisMonth.newClients} this month
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <a 
                        href={`/book/${trainer.bookingSlug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: '#3b82f6',
                          textDecoration: 'none',
                          fontSize: '14px',
                          fontWeight: '500',
                          padding: '8px 12px',
                          backgroundColor: '#eff6ff',
                          borderRadius: '6px',
                          border: '1px solid #dbeafe'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#dbeafe'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#eff6ff'
                        }}
                      >
                        /book/{trainer.bookingSlug}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}