// src/app/clients/page.tsx - Fixed icon sizes and layout
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

  const getStatusColor = (client: Client) => {
    if (client.upcomingAppointments > 0) return 'bg-green-100 text-green-800'
    if (client.completedSessions > 0) return 'bg-blue-100 text-blue-800'
    return 'bg-gray-100 text-gray-800'
  }

  const getStatusText = (client: Client) => {
    if (client.upcomingAppointments > 0) return 'Active'
    if (client.completedSessions > 0) return 'Existing'
    return 'New'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-4 h-4 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700">Loading clients...</p>
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
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 mr-4 inline-flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-600 rounded-xl flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Client Management
                  </h1>
                  <p className="text-sm text-gray-500">
                    {clients.length} registered clients
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Stats */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div className="mb-4 sm:mb-0">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Client List</h2>
                <div className="flex space-x-6 text-sm text-gray-600">
                  <span>Total clients: {clients.length}</span>
                  <span>•</span>
                  <span>Active: {clients.filter(c => c.upcomingAppointments > 0).length}</span>
                </div>
              </div>
              
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-80 px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Client List */}
        {filteredClients.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">No clients yet</h3>
            <p className="text-gray-600 mb-6">Clients will be automatically added when they book sessions</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map((client) => (
              <Link 
                key={client.id} 
                href={`/clients/${client.id}`}
                className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600">
                      {client.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{client.email}</p>
                    {client.phone && (
                      <p className="text-sm text-gray-500">{client.phone}</p>
                    )}
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(client)}`}>
                    {getStatusText(client)}
                  </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <div className="text-lg font-bold text-gray-900">{client.totalAppointments}</div>
                    <div className="text-xs text-gray-600">Total</div>
                  </div>
                  <div className="bg-green-50 rounded-xl p-3 text-center">
                    <div className="text-lg font-bold text-green-600">{client.completedSessions}</div>
                    <div className="text-xs text-gray-600">Completed</div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <div className="text-lg font-bold text-blue-600">{client.upcomingAppointments}</div>
                    <div className="text-xs text-gray-600">Upcoming</div>
                  </div>
                </div>

                {/* Last session */}
                {client.lastSessionDate && (
                  <div className="text-sm text-gray-500 border-t pt-3 mb-3">
                    <span>Last session: {formatDate(client.lastSessionDate)}</span>
                  </div>
                )}

                {/* Goals preview */}
                {client.goals && (
                  <div className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3">
                    <span className="font-medium">Goals:</span> {client.goals.substring(0, 50)}...
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}