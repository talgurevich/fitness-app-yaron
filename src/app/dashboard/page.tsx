// src/app/dashboard/page.tsx - Complete redesign with proper responsive layout
'use client'
import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Appointment {
  id: string
  clientName: string
  clientEmail: string
  datetime: string
  duration: number
  status: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/login')
      return
    }

    fetchUpcomingAppointments()
  }, [session, status, router])

  const fetchUpcomingAppointments = async () => {
    try {
      const response = await fetch('/api/trainer/appointments')
      const data = await response.json()
      
      if (data.success) {
        setUpcomingAppointments(data.appointments || [])
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
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
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700">Loading dashboard...</p>
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
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            {/* Logo/Title */}
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-lg font-semibold text-gray-900">Trainer Dashboard</h1>
            </div>

            {/* Desktop Action Buttons */}
            <div className="hidden md:flex items-center space-x-2">
              <Link
                href="/availability"
                className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Availability
              </Link>
              <Link
                href="/clients"
                className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Clients
              </Link>
              <Link
                href={`/book/${session?.user?.email?.split('@')[0]?.replace(/[^a-zA-Z0-9]/g, '-')}`}
                target="_blank"
                className="px-3 py-1.5 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
              >
                <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Share Link
              </Link>
              <button
                onClick={() => signOut()}
                className="px-3 py-1.5 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
              >
                Sign Out
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Welcome Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {session?.user?.name || session?.user?.email?.split('@')[0]}!
          </h2>
          <p className="text-gray-600">Here's what's happening with your training business today.</p>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-12 lg:gap-6">
          
          {/* Left Column - Stats & Quick Actions */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Stats Cards */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Today's Overview</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Sessions Today</span>
                  <span className="text-lg font-bold text-blue-600">{todaySessions}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">This Week</span>
                  <span className="text-lg font-bold text-green-600">{weekSessions}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Clients</span>
                  <span className="text-lg font-bold text-purple-600">{uniqueClients}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Link
                  href="/availability"
                  className="w-full flex items-center justify-center px-3 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v12a2 2 0 002 2z" />
                  </svg>
                  Set Availability
                </Link>
                <Link
                  href="/clients"
                  className="w-full flex items-center justify-center px-3 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  Manage Clients
                </Link>
              </div>
            </div>

            {/* Profile Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Profile</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Email</span>
                  <p className="text-sm text-gray-900">{session?.user?.email}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Booking URL</span>
                  <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded break-all">
                    /book/{session?.user?.email?.split('@')[0]?.replace(/[^a-zA-Z0-9]/g, '-')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sessions */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Upcoming Sessions</h3>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {upcomingAppointments.length} scheduled
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                {upcomingAppointments.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v12a2 2 0 002 2z" />
                    </svg>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No upcoming sessions</h4>
                    <p className="text-gray-600 mb-4">New appointments will appear here when clients book</p>
                    <Link
                      href={`/book/${session?.user?.email?.split('@')[0]?.replace(/[^a-zA-Z0-9]/g, '-')}`}
                      target="_blank"
                      className="inline-flex items-center px-4 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                    >
                      Share booking link
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingAppointments.map((appointment) => {
                      const { date, time } = formatDateTime(appointment.datetime)
                      return (
                        <div key={appointment.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{appointment.clientName}</p>
                              <p className="text-sm text-gray-600">{appointment.clientEmail}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">{date}</p>
                            <p className="text-sm text-gray-600">{time}</p>
                            <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full mt-1 ${getStatusColor(appointment.status)}`}>
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
          </div>
        </div>

        {/* Mobile/Tablet Layout */}
        <div className="lg:hidden space-y-6">
          
          {/* Mobile Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
              <p className="text-lg font-bold text-blue-600">{todaySessions}</p>
              <p className="text-xs text-gray-600">Today</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
              <p className="text-lg font-bold text-green-600">{weekSessions}</p>
              <p className="text-xs text-gray-600">This Week</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
              <p className="text-lg font-bold text-purple-600">{uniqueClients}</p>
              <p className="text-xs text-gray-600">Clients</p>
            </div>
          </div>

          {/* Mobile Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/availability"
                className="flex items-center justify-center px-3 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v12a2 2 0 002 2z" />
                </svg>
                Availability
              </Link>
              <Link
                href="/clients"
                className="flex items-center justify-center px-3 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                Clients
              </Link>
            </div>
            <Link
              href={`/book/${session?.user?.email?.split('@')[0]?.replace(/[^a-zA-Z0-9]/g, '-')}`}
              target="_blank"
              className="w-full flex items-center justify-center px-3 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors mt-2"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Share Booking Link
            </Link>
          </div>

          {/* Mobile Sessions */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Upcoming Sessions</h3>
              <p className="text-sm text-gray-600">{upcomingAppointments.length} scheduled</p>
            </div>
            
            <div className="p-4">
              {upcomingAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-8 h-8 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-600 text-sm">No upcoming sessions</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingAppointments.map((appointment) => {
                    const { date, time } = formatDateTime(appointment.datetime)
                    return (
                      <div key={appointment.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{appointment.clientName}</p>
                          <p className="text-xs text-gray-600">{date} at {time}</p>
                        </div>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                          {getStatusText(appointment.status)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Sign Out */}
          <div className="text-center">
            <button
              onClick={() => signOut()}
              className="px-4 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}