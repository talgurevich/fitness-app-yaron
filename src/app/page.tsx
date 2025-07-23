// src/app/page.tsx - Updated to match dashboard design system
'use client'
import Link from 'next/link'
import LanguageToggle, { useTranslations } from '@/components/LanguageToggle'

export default function HomePage() {
  const { t } = useTranslations()

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
          </div>
        </div>
      </header>

      {/* Main Content */}
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
            {t('copyright_2024') || '© 2024 FitnessPro. כל הזכויות שמורות.'}
          </p>
        </div>
      </footer>
    </div>
  )
}