// src/app/page.tsx - Updated with registration modal
'use client'
import Link from 'next/link'
import { useState } from 'react'
import LanguageToggle, { useTranslations } from '@/components/LanguageToggle'

export default function HomePage() {
  const { t } = useTranslations()
  const [showRegistrationModal, setShowRegistrationModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Registration failed')
      }

      // Success! Close modal and show success message
      setShowRegistrationModal(false)
      setFormData({ name: '', email: '', phone: '' })
      alert('תודה על הרשמתך! שלחנו לך מייל עם פרטים נוספים ונחזור אליך תוך 24 שעות.')
      
    } catch (error) {
      console.error('Registration error:', error)
      alert('אירעה שגיאה בשליחת הבקשה. אנא נסו שוב מאוחר יותר.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
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
                FitnessPro
              </h1>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                {t('fitness_booking_system') || 'מערכת הזמנות למאמני כושר'}
              </p>
            </div>
          </div>

          {/* Desktop Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LanguageToggle />
            
            {/* Login Button */}
            <Link
              href="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              התחברות
            </Link>

            {/* Register Button */}
            <button
              onClick={() => setShowRegistrationModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                fontSize: '13px',
                fontWeight: '500',
                color: '#3b82f6',
                backgroundColor: 'transparent',
                border: '1px solid #3b82f6',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#3b82f6'
                e.currentTarget.style.color = 'white'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = '#3b82f6'
              }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              רוצה להירשם
            </button>
          </div>
        </div>
      </header>

      {/* Registration Modal */}
      {showRegistrationModal && (
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
            padding: '32px',
            maxWidth: '480px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            position: 'relative'
          }}>
            {/* Close Button */}
            <button
              onClick={() => setShowRegistrationModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: '#f3f4f6',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Header */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ 
                width: '64px', 
                height: '64px', 
                backgroundColor: '#eff6ff', 
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '28px'
              }}>
                🚀
              </div>
              <h2 style={{ 
                fontSize: '24px', 
                fontWeight: '700', 
                color: '#111827', 
                margin: '0 0 8px 0' 
              }}>
                הצטרפו אלינו!
              </h2>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                השאירו פרטים ונחזור אליכם עם כל המידע על המערכת
              </p>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  שם מלא *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  placeholder="הכניסו את השם המלא שלכם"
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  כתובת אימייל *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  placeholder="example@email.com"
                />
              </div>

              <div style={{ marginBottom: '32px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px'
                }}>
                  מספר טלפון *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  placeholder="050-1234567"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '14px 24px',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: 'white',
                  backgroundColor: isSubmitting ? '#9ca3af' : '#3b82f6',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseOver={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.backgroundColor = '#2563eb'
                  }
                }}
                onMouseOut={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.backgroundColor = '#3b82f6'
                  }
                }}
              >
                {isSubmitting ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid transparent',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    שולח...
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    שלח בקשה
                  </>
                )}
              </button>

              <p style={{ 
                fontSize: '12px', 
                color: '#6b7280', 
                textAlign: 'center', 
                margin: '16px 0 0 0',
                lineHeight: '1.4'
              }}>
                ברגע שתשלחו את הפרטים, נציג שלנו יחזור אליכם תוך 24 שעות עם כל המידע על המערכת והתחלת השימוש
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Add CSS for spinner animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Main Content - Rest of your existing homepage content... */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
        
        {/* Hero Section */}
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '16px',
          padding: '64px 32px',
          marginBottom: '32px',
          color: 'white',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ 
              fontSize: '48px', 
              fontWeight: '700', 
              margin: '0 0 16px 0',
              lineHeight: '1.2'
            }}>
              {t('advanced_booking_system') || 'מערכת הזמנות מתקדמת'}
            </h2>
            <h3 style={{ 
              fontSize: '32px', 
              fontWeight: '600', 
              margin: '0 0 24px 0',
              opacity: 0.9
            }}>
              {t('for_fitness_trainers') || 'למאמני כושר'} 💪
            </h3>
            <p style={{ 
              fontSize: '18px', 
              opacity: 0.9, 
              margin: '0 0 40px 0',
              lineHeight: '1.6',
              maxWidth: '600px',
              margin: '0 auto 40px auto'
            }}>
              {t('homepage_description') || 'פלטפורמה מקצועית לניהול הזמנות עם חיבור ליומן Google ומעקב אחר לקוחות. הפכו את ניהול האימונים שלכם לפשוט ויעיל יותר מתמיד.'}
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                href="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px 32px',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#667eea',
                  backgroundColor: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                התחברות למאמנים
              </Link>
            </div>
          </div>
        </div>

        {/* Features Title */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h3 style={{ 
            fontSize: '32px', 
            fontWeight: '700', 
            color: '#111827', 
            margin: '0 0 8px 0' 
          }}>
            {t('why_choose_our_system') || 'למה לבחור במערכת שלנו?'}
          </h3>
          <p style={{ fontSize: '16px', color: '#6b7280', margin: 0 }}>
            {t('everything_trainer_needs') || 'כל מה שמאמן כושר צריך במקום אחד'}
          </p>
        </div>

        {/* Features Grid */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '24px',
          marginBottom: '64px'
        }}>
          {/* Feature 1 */}
          <div style={{ 
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '16px',
            padding: '32px',
            textAlign: 'center',
            transition: 'all 0.2s'
          }}>
            <div style={{ 
              width: '64px', 
              height: '64px', 
              backgroundColor: '#eff6ff', 
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: '28px'
            }}>
              📅
            </div>
            <h4 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              color: '#111827', 
              margin: '0 0 16px 0' 
            }}>
              {t('google_calendar_integration') || 'חיבור ליומן Google'}
            </h4>
            <p style={{ 
              fontSize: '14px',
              color: '#6b7280', 
              lineHeight: '1.6', 
              margin: 0 
            }}>
              {t('google_calendar_description') || 'סנכרון אוטומטי עם יומן Google שלכם. כל הזמנה חדשה תופיע מיד ביומן הפרטי שלכם עם כל הפרטים הרלוונטיים.'}
            </p>
          </div>

          {/* Feature 2 */}
          <div style={{ 
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '16px',
            padding: '32px',
            textAlign: 'center',
            transition: 'all 0.2s'
          }}>
            <div style={{ 
              width: '64px', 
              height: '64px', 
              backgroundColor: '#f0fdf4', 
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: '28px'
            }}>
              🔗
            </div>
            <h4 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              color: '#111827', 
              margin: '0 0 16px 0' 
            }}>
              {t('personal_booking_link') || 'קישור הזמנה אישי'}
            </h4>
            <p style={{ 
              fontSize: '14px',
              color: '#6b7280', 
              lineHeight: '1.6', 
              margin: 0 
            }}>
              {t('personal_link_description') || 'כל מאמן מקבל קישור אישי ויוניק. שתפו אותו עם הלקוחות שלכם והם יוכלו להזמין פגישות ישירות ללא צורך ברישום.'}
            </p>
          </div>

          {/* Feature 3 */}
          <div style={{ 
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '16px',
            padding: '32px',
            textAlign: 'center',
            transition: 'all 0.2s'
          }}>
            <div style={{ 
              width: '64px', 
              height: '64px', 
              backgroundColor: '#faf5ff', 
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: '28px'
            }}>
              📊
            </div>
            <h4 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              color: '#111827', 
              margin: '0 0 16px 0' 
            }}>
              {t('advanced_management') || 'ניהול מתקדם'}
            </h4>
            <p style={{ 
              fontSize: '14px',
              color: '#6b7280', 
              lineHeight: '1.6', 
              margin: 0 
            }}>
              {t('advanced_management_description') || 'לוח בקרה מקצועי עם מעקב אחר כל ההזמנות, פרטי לקוחות, וניהול זמינות. הכל במקום אחד ונגיש.'}
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '64px'
        }}>
          <div style={{ 
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center',
            transition: 'all 0.2s'
          }}>
            <div style={{ 
              fontSize: '32px', 
              fontWeight: '700', 
              color: '#3b82f6', 
              margin: '0 0 8px 0' 
            }}>
              500+
            </div>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              {t('registered_trainers') || 'מאמנים רשומים'}
            </p>
          </div>

          <div style={{ 
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center',
            transition: 'all 0.2s'
          }}>
            <div style={{ 
              fontSize: '32px', 
              fontWeight: '700', 
              color: '#16a34a', 
              margin: '0 0 8px 0' 
            }}>
              10K+
            </div>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              {t('workouts_completed') || 'אימונים בוצעו'}
            </p>
          </div>

          <div style={{ 
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center',
            transition: 'all 0.2s'
          }}>
            <div style={{ 
              fontSize: '32px', 
              fontWeight: '700', 
              color: '#9333ea', 
              margin: '0 0 8px 0' 
            }}>
              98%
            </div>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              {t('satisfaction_rate') || 'שביעות רצון'}
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div style={{ 
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '16px',
          padding: '48px 32px',
          textAlign: 'center'
        }}>
          <h3 style={{ 
            fontSize: '28px', 
            fontWeight: '700', 
            color: '#111827', 
            margin: '0 0 16px 0' 
          }}>
            {t('start_today') || 'התחילו עוד היום!'} 🚀
          </h3>
          <p style={{ 
            fontSize: '16px', 
            color: '#6b7280', 
            margin: '0 0 32px 0',
            lineHeight: '1.6',
            maxWidth: '600px',
            margin: '0 auto 32px auto'
          }}>
            {t('join_many_trainers') || 'הצטרפו למאמנים רבים שכבר משתמשים במערכת ומנהלים את העסק שלהם ביעילות מקסימלית'}
          </p>
          <Link
            href="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '16px 32px',
              fontSize: '16px',
              fontWeight: '600',
              color: 'white',
              backgroundColor: '#3b82f6',
              border: 'none',
              borderRadius: '8px',
              textDecoration: 'none',
              transition: 'all 0.2s',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#2563eb'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#3b82f6'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {t('join_now_free') || 'הצטרפו עכשיו - בחינם'}
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ 
        backgroundColor: 'white',
        borderTop: '1px solid #e5e7eb',
        marginTop: '64px',
        padding: '32px 16px'
      }}>
        <div style={{ 
          maxWidth: '1280px', 
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ 
              width: '24px', 
              height: '24px', 
              backgroundColor: '#3b82f6', 
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="14" height="14" fill="white" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <span style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
              FitnessPro
            </span>
          </div>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
            © 2025{' '}
            <a 
              href="https://www.linkedin.com/in/talgurevich/" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                color: '#3b82f6', 
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = '#2563eb'
                e.currentTarget.style.textDecoration = 'underline'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = '#3b82f6'
                e.currentTarget.style.textDecoration = 'none'
              }}
            >
              Tal Gurevich
            </a>
            {' '}• All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}