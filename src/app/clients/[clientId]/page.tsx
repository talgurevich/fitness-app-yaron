// src/app/clients/[clientId]/page.tsx - Clean header with buttons moved to body
'use client'
import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import LanguageToggle, { useTranslations } from '@/components/LanguageToggle'

interface Payment {
  id: string
  amount: number
  paymentDate: string
  paymentMethod: string
  notes?: string
  appointmentId?: string
}

interface Measurement {
  id: string
  date: string
  weight?: number
  chest?: number
  waist?: number
  hips?: number
  arms?: number
  thighs?: number
  notes?: string
}

interface Client {
  id: string
  name: string
  email: string
  phone?: string
  notes?: string
  nutritionPlan?: string
  goals?: string
  medicalNotes?: string
  emergencyContact?: string
  birthDate?: string
  joinedDate: string
  lastSessionDate?: string
  preferredDays?: string
  preferredTimes?: string
  sessionDuration?: number
  sessionPrice?: number
  totalAppointments: number
  completedSessions: number
  upcomingAppointments: number
  totalPaid?: number
  outstandingBalance?: number
  appointments: Array<{
    id: string
    datetime: string
    duration: number
    status: string
    sessionNotes?: string
    sessionPrice?: number
  }>
  payments?: Payment[]
  measurements?: Measurement[]
}

export default function ClientProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const clientId = params.clientId as string
  const { t } = useTranslations()

  // Booking success handling
  const bookingSuccess = searchParams.get('booked') === 'true'
  const [showSuccessMessage, setShowSuccessMessage] = useState(bookingSuccess)

  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editingNotes, setEditingNotes] = useState(false)
  const [editingNutrition, setEditingNutrition] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showMeasurementForm, setShowMeasurementForm] = useState(false)
  const [showCharts, setShowCharts] = useState(false)
  const [measurementForm, setMeasurementForm] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: '',
    chest: '',
    waist: '',
    hips: '',
    arms: '',
    thighs: '',
    notes: ''
  })
  const [deletingAppointment, setDeletingAppointment] = useState<string | null>(null)
  
  // Payment form state
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [addingPayment, setAddingPayment] = useState(false)
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: 'cash',
    notes: '',
    appointmentId: ''
  })

  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
    nutritionPlan: '',
    goals: '',
    medicalNotes: '',
    emergencyContact: '',
    birthDate: '',
    sessionDuration: 60,
    sessionPrice: 180
  })

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/login')
      return
    }

    fetchClient()

    if (bookingSuccess) {
      setShowSuccessMessage(true)
      const timer = setTimeout(() => {
        setShowSuccessMessage(false)
      }, 5000)
      
      setTimeout(() => {
        fetchClient()
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [session, status, router, clientId, bookingSuccess])

  const fetchClient = async () => {
    try {
      const response = await fetch(`/api/trainer/clients/${clientId}`)
      const data = await response.json()
      
      if (data.success) {
        setClient(data.client)
        setEditForm({
          name: data.client.name || '',
          email: data.client.email || '',
          phone: data.client.phone || '',
          notes: data.client.notes || '',
          nutritionPlan: data.client.nutritionPlan || '',
          goals: data.client.goals || '',
          medicalNotes: data.client.medicalNotes || '',
          emergencyContact: data.client.emergencyContact || '',
          birthDate: data.client.birthDate ? data.client.birthDate.split('T')[0] : '',
          sessionDuration: data.client.sessionDuration || 60,
          sessionPrice: data.client.sessionPrice || 180
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
        alert(t('client_info_saved_success'))
      } else {
        alert(t('error_saving_info') + ': ' + data.error)
      }
    } catch (error) {
      console.error('Error saving client:', error)
      alert(t('error_saving_info'))
    } finally {
      setSaving(false)
    }
  }

  const handleAddPayment = async () => {
    if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
      alert(t('please_enter_valid_payment_amount'))
      return
    }

    setAddingPayment(true)
    try {
      const response = await fetch(`/api/trainer/clients/${clientId}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: parseFloat(paymentForm.amount),
          paymentMethod: paymentForm.paymentMethod,
          notes: paymentForm.notes || null,
          appointmentId: paymentForm.appointmentId || null
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setShowPaymentForm(false)
        setPaymentForm({ amount: '', paymentMethod: 'cash', notes: '', appointmentId: '' })
        await fetchClient()
        alert(t('payment_recorded_success'))
      } else {
        alert(t('error_recording_payment') + ': ' + data.error)
      }
    } catch (error) {
      console.error('Error recording payment:', error)
      alert(t('error_recording_payment'))
    } finally {
      setAddingPayment(false)
    }
  }

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!confirm(t('confirm_cancel_appointment'))) {
      return
    }

    setDeletingAppointment(appointmentId)
    try {
      const response = await fetch(`/api/bookings/${appointmentId}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      
      if (data.success) {
        await fetchClient()
        alert(t('appointment_cancelled_success'))
      } else {
        alert(t('error_cancelling_appointment') + ': ' + data.error)
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error)
      alert(t('error_cancelling_appointment'))
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
      case 'completed': return t('completed')
      case 'booked': return t('scheduled')
      case 'cancelled': return t('cancelled')
      default: return status
    }
  }

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'cash': return t('cash')
      case 'bank_transfer': return t('bank_transfer')
      case 'credit_card': return t('credit_card')
      case 'paypal': return t('paypal')
      case 'check': return t('check')
      default: return method
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
          <p style={{ color: '#6b7280', fontSize: '14px' }}>{t('loading_client_profile')}</p>
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
            {t('client_not_found')}
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
            {t('back_to_client_list')}
          </Link>
        </div>
      </div>
    )
  }

  // Calculate payment data with safe fallbacks
  const sessionPrice = client.sessionPrice || 180
  const completedSessions = client.completedSessions || 0
  const totalPaid = client.totalPaid || 0
  const totalOwed = sessionPrice * completedSessions
  const outstandingBalance = totalOwed - totalPaid
  const payments = client.payments || []

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Clean Header - Only title and navigation */}
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
          {/* Client Info */}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
                {client.name}
              </h1>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                {client.email} • ₪{sessionPrice}/{t('per_hour')}
                {outstandingBalance > 0 && (
                  <span style={{ color: '#dc2626', fontWeight: '500' }}> • ₪{outstandingBalance} {t('owed')}</span>
                )}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <LanguageToggle />
            <nav style={{ fontSize: '12px', color: '#6b7280' }}>
              <Link href="/clients" style={{ color: '#3b82f6', textDecoration: 'none' }}>
                {t('clients')}
              </Link>
              <span style={{ margin: '0 8px' }}>›</span>
              <span>{client.name}</span>
            </nav>
          </div>
        </div>
      </header>

      {/* Payment Form Modal */}
      {showPaymentForm && (
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
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            width: '400px',
            maxWidth: '90vw'
          }}>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0' }}>
                {t('record_payment')}
              </h3>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                {t('outstanding_balance')}: ₪{outstandingBalance}
              </p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', margin: '0 0 8px 0' }}>
                {t('amount')} (₪) *
              </label>
              <input
                type="number"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                placeholder={t('enter_payment_amount')}
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

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', margin: '0 0 8px 0' }}>
                {t('payment_method')}
              </label>
              <select
                value={paymentForm.paymentMethod}
                onChange={(e) => setPaymentForm({...paymentForm, paymentMethod: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: '#111827',
                  backgroundColor: 'white'
                }}
              >
                <option value="cash">{t('cash')}</option>
                <option value="bank_transfer">{t('bank_transfer')}</option>
                <option value="credit_card">{t('credit_card')}</option>
                <option value="paypal">{t('paypal')}</option>
                <option value="check">{t('check')}</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', margin: '0 0 8px 0' }}>
                {t('notes_optional')}
              </label>
              <textarea
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})}
                placeholder={t('payment_notes_placeholder')}
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
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowPaymentForm(false)}
                style={{
                  padding: '10px 16px',
                  fontSize: '14px',
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
                {t('cancel')}
              </button>
              <button
                onClick={handleAddPayment}
                disabled={addingPayment}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'white',
                  backgroundColor: addingPayment ? '#9ca3af' : '#059669',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: addingPayment ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  if (!addingPayment) e.currentTarget.style.backgroundColor = '#047857'
                }}
                onMouseOut={(e) => {
                  if (!addingPayment) e.currentTarget.style.backgroundColor = '#059669'
                }}
              >
                {addingPayment ? (
                  <>
                    <div style={{ 
                      width: '14px', 
                      height: '14px', 
                      border: '2px solid white', 
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    {t('recording')}
                  </>
                ) : (
                  t('record_payment')
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
        
        {/* Action Buttons Section - Moved to body */}
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
            href="/clients"
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
            {t('back_to_clients')}
          </Link>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Book Session Button */}
            <Link
              href={`/clients/${clientId}/book`}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {t('book_session')}
            </Link>
            
            {/* Record Payment Button */}
            <button
              onClick={() => setShowPaymentForm(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#059669',
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#d1fae5'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ecfdf5'}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              {t('record_payment')}
            </button>
            
            {/* Edit Profile Buttons */}
            {editing ? (
              <>
                <button
                  onClick={() => setEditing(false)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    backgroundColor: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'white',
                    backgroundColor: saving ? '#9ca3af' : '#3b82f6',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {saving ? t('saving') : t('save_changes')}
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {t('edit_profile')}
              </button>
            )}
          </div>
        </div>
        
        {/* Success Message */}
        {showSuccessMessage && (
          <div style={{
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="16" height="16" fill="none" stroke="#059669" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span style={{ fontSize: '14px', color: '#059669', fontWeight: '500' }}>
                ✓ {t('appointment_booked_success_email', { name: client.name })}
              </span>
            </div>
            <button
              onClick={() => setShowSuccessMessage(false)}
              style={{
                padding: '4px',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#059669',
                cursor: 'pointer'
              }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
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
              <p style={{ fontSize: '16px', opacity: 0.9, margin: '0 0 4px 0' }}>
                {t('client_since')} {formatDate(client.joinedDate)}
              </p>
              <p style={{ fontSize: '18px', fontWeight: '600', opacity: 0.95, margin: '0 0 8px 0' }}>
                💰 ₪{sessionPrice} {t('per_hour')}
              </p>
              {outstandingBalance > 0 && (
                <p style={{ fontSize: '16px', fontWeight: '600', backgroundColor: 'rgba(220, 38, 38, 0.2)', padding: '8px 12px', borderRadius: '6px', margin: '0 0 24px 0' }}>
                  ⚠️ {t('outstanding')}: ₪{outstandingBalance}
                </p>
              )}
              {outstandingBalance === 0 && completedSessions > 0 && (
                <p style={{ fontSize: '16px', fontWeight: '600', backgroundColor: 'rgba(34, 197, 94, 0.2)', padding: '8px 12px', borderRadius: '6px', margin: '0 0 24px 0' }}>
                  ✅ {t('fully_paid_up')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Stats Grid with Payment Info */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
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
                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>{t('total_sessions')}</p>
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
                backgroundColor: '#fff7ed', 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="20" height="20" fill="none" stroke="#ea580c" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>{t('total_owed')}</p>
                <p style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0 }}>
                  ₪{totalOwed.toLocaleString()}
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
                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>{t('total_paid')}</p>
                <p style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0 }}>
                  ₪{totalPaid.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div style={{ 
            backgroundColor: 'white',
            border: `1px solid ${outstandingBalance > 0 ? '#fca5a5' : '#e5e7eb'}`,
            borderRadius: '12px',
            padding: '20px',
            transition: 'all 0.2s'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                backgroundColor: outstandingBalance > 0 ? '#fef2f2' : '#f0fdf4', 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="20" height="20" fill="none" stroke={outstandingBalance > 0 ? '#dc2626' : '#16a34a'} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>{t('outstanding')}</p>
                <p style={{ fontSize: '24px', fontWeight: '700', color: outstandingBalance > 0 ? '#dc2626' : '#16a34a', margin: 0 }}>
                  ₪{outstandingBalance.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment History Section - Only show if payments exist */}
        {payments.length > 0 && (
          <div style={{ 
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '16px',
            overflow: 'hidden',
            marginBottom: '32px'
          }}>
            <div style={{ 
              padding: '24px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
                {t('payment_history')}
              </h3>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
                {t('payments_recorded', { count: payments.length })}
              </p>
            </div>
            
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {payments.map((payment) => (
                  <div key={payment.id} style={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px',
                    border: '1px solid #f3f4f6',
                    borderRadius: '8px',
                    backgroundColor: '#f9fafb'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        backgroundColor: '#f0fdf4', 
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <svg width="16" height="16" fill="none" stroke="#16a34a" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: 0 }}>
                          ₪{payment.amount} - {getPaymentMethodText(payment.paymentMethod)}
                        </p>
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                          {formatDate(payment.paymentDate)}
                          {payment.notes && ` • ${payment.notes}`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Basic Information */}
        <div style={{ 
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '32px'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
            {t('basic_information')}
          </h3>
          
          {editing ? (
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              marginBottom: '20px'
            }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', margin: '0 0 8px 0' }}>
                  {t('full_name')}
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
                  {t('email')}
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
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
                  {t('phone')}
                </label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                  placeholder={t('phone_placeholder')}
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
                  {t('session_price')} (₪)
                </label>
                <input
                  type="number"
                  value={editForm.sessionPrice}
                  onChange={(e) => setEditForm({...editForm, sessionPrice: parseInt(e.target.value) || 180})}
                  min="50"
                  max="1000"
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
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '24px',
              marginBottom: '20px'
            }}>
              <div>
                <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {t('email')}
                </p>
                <p style={{ fontSize: '14px', color: '#111827', margin: 0 }}>
                  {client.email}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {t('session_price')}
                </p>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#ea580c', margin: 0 }}>
                  ₪{sessionPrice} {t('per_hour')}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {t('phone')}
                </p>
                <p style={{ fontSize: '14px', color: '#111827', margin: 0 }}>
                  {client.phone || t('not_provided')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Client Notes Section */}
        <div style={{ 
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '32px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
              {t('client_notes')}
            </h3>
            <button
              onClick={() => setEditingNotes(!editingNotes)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
                color: editingNotes ? '#dc2626' : '#3b82f6',
                backgroundColor: editingNotes ? '#fef2f2' : '#eff6ff',
                border: editingNotes ? '1px solid #fecaca' : '1px solid #bfdbfe',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              {editingNotes ? t('cancel') : t('edit_notes')}
            </button>
          </div>
          
          {editingNotes ? (
            <div>
              <textarea
                value={editForm.notes}
                onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                placeholder={t('notes_placeholder')}
                rows={6}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#111827',
                  backgroundColor: 'white',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  marginBottom: '12px'
                }}
              />
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={async () => {
                    setSaving(true)
                    try {
                      const response = await fetch(`/api/trainer/clients/${client?.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ notes: editForm.notes })
                      })
                      const data = await response.json()
                      if (data.success) {
                        setClient({...client!, notes: editForm.notes})
                        setEditingNotes(false)
                      }
                    } catch (error) {
                      console.error('Error saving notes:', error)
                    }
                    setSaving(false)
                  }}
                  disabled={saving}
                  style={{
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: 'white',
                    backgroundColor: '#3b82f6',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.7 : 1
                  }}
                >
                  {saving ? t('saving') : t('save_changes')}
                </button>
                <button
                  onClick={() => {
                    setEditForm({...editForm, notes: client?.notes || ''})
                    setEditingNotes(false)
                  }}
                  style={{
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#6b7280',
                    backgroundColor: '#f9fafb',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  {t('cancel')}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ 
              minHeight: '80px',
              padding: '16px',
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#374151',
              lineHeight: '1.6'
            }}>
              {client?.notes ? (
                <div style={{ whiteSpace: 'pre-wrap' }}>{client.notes}</div>
              ) : (
                <div style={{ color: '#9ca3af', fontStyle: 'italic', textAlign: 'center' }}>
                  <p style={{ margin: '0 0 8px 0' }}>{t('no_notes_added')}</p>
                  <p style={{ margin: 0, fontSize: '12px' }}>{t('click_to_add_notes')}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Nutrition Plan Section */}
        <div style={{ 
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '32px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
              {t('nutrition_plan')}
            </h3>
            <button
              onClick={() => setEditingNutrition(!editingNutrition)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
                color: editingNutrition ? '#dc2626' : '#059669',
                backgroundColor: editingNutrition ? '#fef2f2' : '#ecfdf5',
                border: editingNutrition ? '1px solid #fecaca' : '1px solid #a7f3d0',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {editingNutrition ? t('cancel') : t('edit_nutrition_plan')}
            </button>
          </div>
          
          {editingNutrition ? (
            <div>
              <textarea
                value={editForm.nutritionPlan}
                onChange={(e) => setEditForm({...editForm, nutritionPlan: e.target.value})}
                placeholder={t('nutrition_plan_placeholder')}
                rows={8}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#111827',
                  backgroundColor: 'white',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  marginBottom: '12px'
                }}
              />
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={async () => {
                    setSaving(true)
                    try {
                      const response = await fetch(`/api/trainer/clients/${client?.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ nutritionPlan: editForm.nutritionPlan })
                      })
                      const data = await response.json()
                      if (data.success) {
                        setClient({...client!, nutritionPlan: editForm.nutritionPlan})
                        setEditingNutrition(false)
                      }
                    } catch (error) {
                      console.error('Error saving nutrition plan:', error)
                    }
                    setSaving(false)
                  }}
                  disabled={saving}
                  style={{
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: 'white',
                    backgroundColor: '#059669',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.7 : 1
                  }}
                >
                  {saving ? t('saving') : t('save_changes')}
                </button>
                <button
                  onClick={() => {
                    setEditForm({...editForm, nutritionPlan: client?.nutritionPlan || ''})
                    setEditingNutrition(false)
                  }}
                  style={{
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#6b7280',
                    backgroundColor: '#f9fafb',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  {t('cancel')}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ 
              minHeight: '100px',
              padding: '16px',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#374151',
              lineHeight: '1.6'
            }}>
              {client?.nutritionPlan ? (
                <div style={{ whiteSpace: 'pre-wrap' }}>{client.nutritionPlan}</div>
              ) : (
                <div style={{ color: '#9ca3af', fontStyle: 'italic', textAlign: 'center' }}>
                  <p style={{ margin: '0 0 8px 0' }}>{t('no_nutrition_plan')}</p>
                  <p style={{ margin: 0, fontSize: '12px' }}>{t('click_to_add_nutrition_plan')}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Progress Tracking Section */}
        <div style={{ 
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '32px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
              {t('progress_tracking')}
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setShowCharts(!showCharts)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#6b40e3',
                  backgroundColor: '#f3f0ff',
                  border: '1px solid #ddd6fe',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                {showCharts ? t('view_table') : t('view_charts')}
              </button>
              <button
                onClick={() => setShowMeasurementForm(!showMeasurementForm)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: showMeasurementForm ? '#dc2626' : '#7c3aed',
                  backgroundColor: showMeasurementForm ? '#fef2f2' : '#f5f3ff',
                  border: showMeasurementForm ? '1px solid #fecaca' : '1px solid #c4b5fd',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {showMeasurementForm ? t('cancel') : t('add_measurement')}
              </button>
            </div>
          </div>
          
          {/* Measurement Form */}
          {showMeasurementForm && (
            <div style={{
              marginBottom: '24px',
              padding: '20px',
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}>
              <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
                {t('add_new_measurement')}
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '16px',
                marginBottom: '16px'
              }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', margin: '0 0 6px 0' }}>
                    {t('measurement_date')}
                  </label>
                  <input
                    type="date"
                    value={measurementForm.date}
                    onChange={(e) => setMeasurementForm({...measurementForm, date: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      color: '#111827',
                      backgroundColor: 'white'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', margin: '0 0 6px 0' }}>
                    {t('weight_kg')}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={measurementForm.weight}
                    onChange={(e) => setMeasurementForm({...measurementForm, weight: e.target.value})}
                    placeholder="70.5"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      color: '#111827',
                      backgroundColor: 'white'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', margin: '0 0 6px 0' }}>
                    {t('chest_cm')}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={measurementForm.chest}
                    onChange={(e) => setMeasurementForm({...measurementForm, chest: e.target.value})}
                    placeholder="95"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      color: '#111827',
                      backgroundColor: 'white'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', margin: '0 0 6px 0' }}>
                    {t('waist_cm')}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={measurementForm.waist}
                    onChange={(e) => setMeasurementForm({...measurementForm, waist: e.target.value})}
                    placeholder="80"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      color: '#111827',
                      backgroundColor: 'white'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', margin: '0 0 6px 0' }}>
                    {t('hips_cm')}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={measurementForm.hips}
                    onChange={(e) => setMeasurementForm({...measurementForm, hips: e.target.value})}
                    placeholder="95"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      color: '#111827',
                      backgroundColor: 'white'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', margin: '0 0 6px 0' }}>
                    {t('arms_cm')}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={measurementForm.arms}
                    onChange={(e) => setMeasurementForm({...measurementForm, arms: e.target.value})}
                    placeholder="35"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      color: '#111827',
                      backgroundColor: 'white'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', margin: '0 0 6px 0' }}>
                    {t('thighs_cm')}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={measurementForm.thighs}
                    onChange={(e) => setMeasurementForm({...measurementForm, thighs: e.target.value})}
                    placeholder="55"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      color: '#111827',
                      backgroundColor: 'white'
                    }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', margin: '0 0 6px 0' }}>
                  {t('notes_optional')}
                </label>
                <textarea
                  value={measurementForm.notes}
                  onChange={(e) => setMeasurementForm({...measurementForm, notes: e.target.value})}
                  placeholder={t('notes_placeholder')}
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    color: '#111827',
                    backgroundColor: 'white',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    marginBottom: '16px'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={async () => {
                    setSaving(true)
                    try {
                      const response = await fetch(`/api/trainer/clients/${client?.id}/measurements`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          date: measurementForm.date,
                          weight: measurementForm.weight ? parseFloat(measurementForm.weight) : null,
                          chest: measurementForm.chest ? parseFloat(measurementForm.chest) : null,
                          waist: measurementForm.waist ? parseFloat(measurementForm.waist) : null,
                          hips: measurementForm.hips ? parseFloat(measurementForm.hips) : null,
                          arms: measurementForm.arms ? parseFloat(measurementForm.arms) : null,
                          thighs: measurementForm.thighs ? parseFloat(measurementForm.thighs) : null,
                          notes: measurementForm.notes || null
                        })
                      })
                      const data = await response.json()
                      if (data.success) {
                        const newMeasurements = [...(client?.measurements || []), data.measurement]
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        setClient({...client!, measurements: newMeasurements})
                        setShowMeasurementForm(false)
                        setMeasurementForm({
                          date: new Date().toISOString().split('T')[0],
                          weight: '',
                          chest: '',
                          waist: '',
                          hips: '',
                          arms: '',
                          thighs: '',
                          notes: ''
                        })
                      }
                    } catch (error) {
                      console.error('Error saving measurement:', error)
                    }
                    setSaving(false)
                  }}
                  disabled={saving || (!measurementForm.weight && !measurementForm.chest && !measurementForm.waist && !measurementForm.hips && !measurementForm.arms && !measurementForm.thighs)}
                  style={{
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: 'white',
                    backgroundColor: '#7c3aed',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving || (!measurementForm.weight && !measurementForm.chest && !measurementForm.waist && !measurementForm.hips && !measurementForm.arms && !measurementForm.thighs) ? 0.7 : 1
                  }}
                >
                  {saving ? t('saving') : t('save_measurement')}
                </button>
                <button
                  onClick={() => {
                    setShowMeasurementForm(false)
                    setMeasurementForm({
                      date: new Date().toISOString().split('T')[0],
                      weight: '',
                      chest: '',
                      waist: '',
                      hips: '',
                      arms: '',
                      thighs: '',
                      notes: ''
                    })
                  }}
                  style={{
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#6b7280',
                    backgroundColor: '#f9fafb',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  {t('cancel')}
                </button>
              </div>
            </div>
          )}
          
          {/* Measurements Display */}
          {client?.measurements && client.measurements.length > 0 ? (
            showCharts ? (
              // Simple Chart View (using CSS to create visual bars)
              <div>
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 12px 0' }}>
                    {t('weight_progress')}
                  </h4>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'flex-end', 
                    height: '200px',
                    backgroundColor: '#f9fafb',
                    padding: '20px',
                    borderRadius: '8px',
                    gap: '8px',
                    overflowX: 'auto'
                  }}>
                    {client.measurements
                      .filter(m => m.weight)
                      .slice(-10)
                      .map((measurement, index) => {
                        const maxWeight = Math.max(...client.measurements.filter(m => m.weight).map(m => m.weight!))
                        const minWeight = Math.min(...client.measurements.filter(m => m.weight).map(m => m.weight!))
                        const range = maxWeight - minWeight || 1
                        const height = ((measurement.weight! - minWeight) / range) * 150 + 20
                        
                        return (
                          <div key={measurement.id} style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center',
                            flex: '1',
                            minWidth: '60px'
                          }}>
                            <div style={{
                              width: '100%',
                              maxWidth: '40px',
                              height: `${height}px`,
                              backgroundColor: '#7c3aed',
                              borderRadius: '4px 4px 0 0',
                              marginBottom: '8px',
                              position: 'relative',
                              cursor: 'pointer'
                            }}>
                              <span style={{
                                position: 'absolute',
                                top: '-20px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                fontSize: '12px',
                                fontWeight: '600',
                                color: '#111827',
                                whiteSpace: 'nowrap'
                              }}>
                                {measurement.weight} kg
                              </span>
                            </div>
                            <span style={{ fontSize: '10px', color: '#6b7280', textAlign: 'center' }}>
                              {new Date(measurement.date).toLocaleDateString()}
                            </span>
                          </div>
                        )
                      })}
                  </div>
                </div>
              </div>
            ) : (
              // Table View
              <div style={{ overflow: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                      <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>{t('date')}</th>
                      <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>{t('weight')}</th>
                      <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>{t('chest')}</th>
                      <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>{t('waist')}</th>
                      <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>{t('hips')}</th>
                      <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>{t('arms')}</th>
                      <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>{t('thighs')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {client.measurements.slice(0, 10).map((measurement, index) => {
                      const prevMeasurement = client.measurements[index + 1]
                      return (
                        <tr key={measurement.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '12px 8px', fontSize: '14px', color: '#111827' }}>
                            {new Date(measurement.date).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: '14px' }}>
                            {measurement.weight ? (
                              <div>
                                <span style={{ color: '#111827', fontWeight: '500' }}>{measurement.weight} kg</span>
                                {prevMeasurement?.weight && (
                                  <span style={{ 
                                    display: 'block', 
                                    fontSize: '11px', 
                                    color: measurement.weight < prevMeasurement.weight ? '#10b981' : measurement.weight > prevMeasurement.weight ? '#ef4444' : '#6b7280'
                                  }}>
                                    {measurement.weight < prevMeasurement.weight ? '↓' : measurement.weight > prevMeasurement.weight ? '↑' : '='} 
                                    {Math.abs(measurement.weight - prevMeasurement.weight).toFixed(1)}
                                  </span>
                                )}
                              </div>
                            ) : '-'}
                          </td>
                          <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: '14px', color: '#111827' }}>
                            {measurement.chest ? `${measurement.chest} cm` : '-'}
                          </td>
                          <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: '14px', color: '#111827' }}>
                            {measurement.waist ? `${measurement.waist} cm` : '-'}
                          </td>
                          <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: '14px', color: '#111827' }}>
                            {measurement.hips ? `${measurement.hips} cm` : '-'}
                          </td>
                          <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: '14px', color: '#111827' }}>
                            {measurement.arms ? `${measurement.arms} cm` : '-'}
                          </td>
                          <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: '14px', color: '#111827' }}>
                            {measurement.thighs ? `${measurement.thighs} cm` : '-'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            <div style={{ 
              minHeight: '120px',
              padding: '32px',
              backgroundColor: '#f5f3ff',
              border: '1px solid #ddd6fe',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <svg width="48" height="48" fill="none" stroke="#7c3aed" viewBox="0 0 24 24" style={{ margin: '0 auto 16px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p style={{ margin: '0 0 8px 0', color: '#6b40e3', fontSize: '16px', fontWeight: '500' }}>{t('no_measurements_yet')}</p>
              <p style={{ margin: 0, fontSize: '14px', color: '#7c3aed' }}>{t('start_tracking_progress')}</p>
            </div>
          )}
        </div>

        {/* Appointments Section - Enhanced with Past/Future and Delete */}
        <div style={{ 
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '16px',
          overflow: 'hidden',
          marginBottom: '32px'
        }}>
          <div style={{ 
            padding: '24px',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
              {t('session_history_upcoming')}
            </h3>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
              {t('total_appointments', { count: client.appointments?.length || 0 })}
            </p>
          </div>
          
          <div style={{ padding: '24px' }}>
            {client.appointments && client.appointments.length > 0 ? (
              (() => {
                const now = new Date()
                const futureAppointments = client.appointments
                  .filter(app => new Date(app.datetime) > now)
                  .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())
                
                const pastAppointments = client.appointments
                  .filter(app => new Date(app.datetime) <= now)
                  .sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime())

                return (
                  <div>
                    {/* Future Appointments */}
                    {futureAppointments.length > 0 && (
                      <div style={{ marginBottom: '32px' }}>
                        <h4 style={{ 
                          fontSize: '16px', 
                          fontWeight: '600', 
                          color: '#2563eb', 
                          margin: '0 0 16px 0',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v12a2 2 0 002 2z" />
                          </svg>
                          {t('upcoming_sessions', { count: futureAppointments.length })}
                        </h4>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {futureAppointments.map((appointment) => (
                            <div 
                              key={appointment.id} 
                              style={{ 
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '16px',
                                border: '1px solid #dbeafe',
                                borderRadius: '8px',
                                backgroundColor: '#eff6ff'
                              }}
                            >
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                                  <p style={{ fontSize: '15px', fontWeight: '600', color: '#1e40af', margin: 0 }}>
                                    {formatDateTime(appointment.datetime)}
                                  </p>
                                  <span style={{ 
                                    ...getStatusColor(appointment.status),
                                    padding: '2px 8px',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    borderRadius: '4px'
                                  }}>
                                    {getStatusText(appointment.status)}
                                  </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', color: '#6b7280' }}>
                                  <span>⏱️ {appointment.duration} {t('minutes')}</span>
                                  {appointment.sessionPrice && (
                                    <span>💰 ₪{appointment.sessionPrice}</span>
                                  )}
                                  {appointment.sessionNotes && (
                                    <span>📝 {t('notes')}</span>
                                  )}
                                </div>
                                {appointment.sessionNotes && (
                                  <p style={{ 
                                    fontSize: '12px', 
                                    color: '#6b7280', 
                                    margin: '8px 0 0 0',
                                    fontStyle: 'italic',
                                    background: '#f8fafc',
                                    padding: '8px',
                                    borderRadius: '4px'
                                  }}>
                                    "{appointment.sessionNotes}"
                                  </p>
                                )}
                              </div>
                              
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {/* SMS Reminder Button */}
                                <button
                                  onClick={() => alert('📱 SMS Reminder Feature\n\nThis feature will send SMS reminders to clients about upcoming appointments.\n\nComing soon!')}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '8px 12px',
                                    fontSize: '12px',
                                    fontWeight: '500',
                                    color: '#059669',
                                    backgroundColor: '#f0fdf4',
                                    border: '1px solid #bbf7d0',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                  }}
                                  onMouseOver={(e) => {
                                    e.currentTarget.style.backgroundColor = '#dcfce7'
                                    e.currentTarget.style.borderColor = '#86efac'
                                  }}
                                  onMouseOut={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f0fdf4'
                                    e.currentTarget.style.borderColor = '#bbf7d0'
                                  }}
                                  title="Send SMS reminder to client"
                                >
                                  <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                  </svg>
                                  📱 SMS
                                </button>
                                
                                {/* Delete Button for Future Appointments */}
                                {appointment.status !== 'cancelled' && (
                                  <button
                                    onClick={() => handleDeleteAppointment(appointment.id)}
                                  disabled={deletingAppointment === appointment.id}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '8px 12px',
                                    fontSize: '12px',
                                    fontWeight: '500',
                                    color: deletingAppointment === appointment.id ? '#9ca3af' : '#dc2626',
                                    backgroundColor: deletingAppointment === appointment.id ? '#f3f4f6' : '#fef2f2',
                                    border: '1px solid',
                                    borderColor: deletingAppointment === appointment.id ? '#e5e7eb' : '#fecaca',
                                    borderRadius: '6px',
                                    cursor: deletingAppointment === appointment.id ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s',
                                    marginLeft: '12px'
                                  }}
                                  onMouseOver={(e) => {
                                    if (deletingAppointment !== appointment.id) {
                                      e.currentTarget.style.backgroundColor = '#fee2e2'
                                      e.currentTarget.style.borderColor = '#fca5a5'
                                    }
                                  }}
                                  onMouseOut={(e) => {
                                    if (deletingAppointment !== appointment.id) {
                                      e.currentTarget.style.backgroundColor = '#fef2f2'
                                      e.currentTarget.style.borderColor = '#fecaca'
                                    }
                                  }}
                                >
                                  {deletingAppointment === appointment.id ? (
                                    <>
                                      <div style={{ 
                                        width: '12px', 
                                        height: '12px', 
                                        border: '2px solid #9ca3af', 
                                        borderTop: '2px solid transparent',
                                        borderRadius: '50%',
                                        animation: 'spin 1s linear infinite'
                                      }}></div>
                                      {t('cancelling')}
                                    </>
                                  ) : (
                                    <>
                                      <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                      {t('cancel')}
                                    </>
                                  )}
                                </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Past Appointments */}
                    {pastAppointments.length > 0 && (
                      <div>
                        <h4 style={{ 
                          fontSize: '16px', 
                          fontWeight: '600', 
                          color: '#059669', 
                          margin: '0 0 16px 0',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {t('session_history', { count: pastAppointments.length })}
                        </h4>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {pastAppointments.slice(0, 10).map((appointment) => ( // Show last 10 sessions
                            <div 
                              key={appointment.id} 
                              style={{ 
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '16px',
                                border: '1px solid',
                                borderColor: appointment.status === 'completed' ? '#d1fae5' : '#f3f4f6',
                                borderRadius: '8px',
                                backgroundColor: appointment.status === 'completed' ? '#f0fdf4' : '#f9fafb',
                                opacity: appointment.status === 'cancelled' ? 0.6 : 1
                              }}
                            >
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                                  <p style={{ fontSize: '15px', fontWeight: '600', color: '#111827', margin: 0 }}>
                                    {formatDateTime(appointment.datetime)}
                                  </p>
                                  <span style={{ 
                                    ...getStatusColor(appointment.status),
                                    padding: '2px 8px',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    borderRadius: '4px'
                                  }}>
                                    {getStatusText(appointment.status)}
                                  </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', color: '#6b7280' }}>
                                  <span>⏱️ {appointment.duration} {t('minutes')}</span>
                                  {appointment.sessionPrice && (
                                    <span>💰 ₪{appointment.sessionPrice}</span>
                                  )}
                                  {appointment.sessionNotes && (
                                    <span>📝 {t('notes')}</span>
                                  )}
                                </div>
                                {appointment.sessionNotes && (
                                  <p style={{ 
                                    fontSize: '12px', 
                                    color: '#6b7280', 
                                    margin: '8px 0 0 0',
                                    fontStyle: 'italic',
                                    background: 'rgba(0,0,0,0.05)',
                                    padding: '8px',
                                    borderRadius: '4px'
                                  }}>
                                    "{appointment.sessionNotes}"
                                  </p>
                                )}
                              </div>
                              
                              {/* Delete Button for Past Appointments (if needed for cleanup) */}
                              <button
                                onClick={() => handleDeleteAppointment(appointment.id)}
                                disabled={deletingAppointment === appointment.id}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '6px 10px',
                                  fontSize: '11px',
                                  fontWeight: '500',
                                  color: deletingAppointment === appointment.id ? '#9ca3af' : '#6b7280',
                                  backgroundColor: 'transparent',
                                  border: '1px solid',
                                  borderColor: deletingAppointment === appointment.id ? '#e5e7eb' : '#d1d5db',
                                  borderRadius: '4px',
                                  cursor: deletingAppointment === appointment.id ? 'not-allowed' : 'pointer',
                                  transition: 'all 0.2s',
                                  marginLeft: '12px',
                                  opacity: 0.7
                                }}
                                onMouseOver={(e) => {
                                  if (deletingAppointment !== appointment.id) {
                                    e.currentTarget.style.opacity = '1'
                                    e.currentTarget.style.color = '#dc2626'
                                    e.currentTarget.style.borderColor = '#fca5a5'
                                  }
                                }}
                                onMouseOut={(e) => {
                                  if (deletingAppointment !== appointment.id) {
                                    e.currentTarget.style.opacity = '0.7'
                                    e.currentTarget.style.color = '#6b7280'
                                    e.currentTarget.style.borderColor = '#d1d5db'
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
                                    {t('deleting')}
                                  </>
                                ) : (
                                  <>
                                    <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    {t('delete')}
                                  </>
                                )}
                              </button>
                            </div>
                          ))}
                          
                          {pastAppointments.length > 10 && (
                            <div style={{ 
                              textAlign: 'center', 
                              padding: '12px',
                              color: '#6b7280',
                              fontSize: '14px',
                              fontStyle: 'italic'
                            }}>
                              {t('showing_last_sessions', { count: 10, remaining: pastAppointments.length - 10 })}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {futureAppointments.length === 0 && pastAppointments.length === 0 && (
                      <div style={{ 
                        textAlign: 'center',
                        padding: '40px 20px',
                        color: '#6b7280'
                      }}>
                        <div style={{ 
                          width: '48px', 
                          height: '48px', 
                          backgroundColor: '#f3f4f6', 
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 16px'
                        }}>
                          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p style={{ fontSize: '16px', fontWeight: '500', color: '#374151', margin: '0 0 8px 0' }}>
                          {t('no_appointments_yet')}
                        </p>
                        <p style={{ fontSize: '14px', margin: 0 }}>
                          {t('book_first_session_to_see_history')}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })()
            ) : (
              <div style={{ 
                textAlign: 'center',
                padding: '40px 20px',
                color: '#6b7280'
              }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  backgroundColor: '#f3f4f6', 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p style={{ fontSize: '16px', fontWeight: '500', color: '#374151', margin: '0 0 8px 0' }}>
                  No appointments yet
                </p>
                <p style={{ fontSize: '14px', margin: 0 }}>
                  Book the first session with this client to see appointment history here.
                </p>
              </div>
            )}
          </div>
        </div>

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