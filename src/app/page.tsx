// src/app/page.tsx - Parallax homepage with smooth scrolling effects
'use client'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import LanguageToggle, { useTranslations } from '@/components/LanguageToggle'

export default function HomePage() {
  const { t, language } = useTranslations()
  const [showRegistrationModal, setShowRegistrationModal] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Refs for parallax elements
  const heroRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Intersection Observer for fade-in animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in')
          }
        })
      },
      { threshold: 0.1 }
    )

    const elements = document.querySelectorAll('.fade-in-section')
    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

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
    <div key={language} style={{ minHeight: '100vh', backgroundColor: '#0f172a', position: 'relative', overflow: 'hidden' }}>
      {/* Animated Background Elements */}
      <div className="parallax-bg">
        <div className="floating-shape shape-1" style={{
          transform: `translateY(${scrollY * 0.1}px) rotate(${scrollY * 0.05}deg)`
        }} />
        <div className="floating-shape shape-2" style={{
          transform: `translateY(${scrollY * 0.15}px) rotate(${-scrollY * 0.03}deg)`
        }} />
        <div className="floating-shape shape-3" style={{
          transform: `translateY(${scrollY * 0.08}px) rotate(${scrollY * 0.04}deg)`
        }} />
        <div className="floating-shape shape-4" style={{
          transform: `translateY(${scrollY * 0.12}px) rotate(${-scrollY * 0.02}deg)`
        }} />
      </div>

      {/* Header */}
      <header style={{ 
        backgroundColor: 'rgba(15, 23, 42, 0.95)', 
        borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
        backdropFilter: 'blur(10px)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        transition: 'all 0.3s ease'
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
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3)'
            }}>
              <svg width="18" height="18" fill="white" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: '600', color: 'white', margin: 0 }}>
                Trainer Booking
              </h1>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
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
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                border: '1px solid #3b82f6',
                borderRadius: '6px',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #2563eb, #1d4ed8)'
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(59, 130, 246, 0.4)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #3b82f6, #2563eb)'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)'
              }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {t('login')}
            </Link>

          </div>
        </div>
      </header>

      {/* Registration Modal */}
      {showRegistrationModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              onClick={() => setShowRegistrationModal(false)}
              className="modal-close"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div className="modal-icon">
                🚀
              </div>
              <h2 style={{ 
                fontSize: '24px', 
                fontWeight: '700', 
                color: 'white', 
                margin: '0 0 8px 0' 
              }}>
                הצטרפו אלינו!
              </h2>
              <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>
                השאירו פרטים ונחזור אליכם עם כל המידע על המערכת
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">שם מלא *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  placeholder="הכניסו את השם המלא שלכם"
                />
              </div>

              <div className="form-group">
                <label className="form-label">כתובת אימייל *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  placeholder="example@email.com"
                />
              </div>

              <div className="form-group">
                <label className="form-label">מספר טלפון *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  placeholder="050-1234567"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="submit-button"
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner" />
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

              <p className="form-footer">
                ברגע שתשלחו את הפרטים, נציג שלנו יחזור אליכם תוך 24 שעות עם כל המידע על המערכת והתחלת השימוש
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main style={{ paddingTop: '64px' }}>
        
        {/* Hero Section with Large Background Image */}
        <section 
          ref={heroRef}
          className="hero-section"
          style={{
            transform: `translateY(${scrollY * 0.3}px)`,
            opacity: Math.max(0, 1 - scrollY / 800),
            backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.7), rgba(30, 41, 59, 0.8)), url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`,
            backgroundSize: `${100 + scrollY * 0.02}%`,
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        >
          {/* Additional parallax overlay for depth */}
          <div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `radial-gradient(ellipse at center, transparent 0%, rgba(15, 23, 42, 0.3) 100%)`,
              transform: `translateY(${scrollY * 0.1}px)`,
              pointerEvents: 'none'
            }}
          />
          
          <div className="hero-content">
            <div className="hero-badge">
              מערכת פשוטה למאמני כושר אישיים
            </div>
            <h2 className="hero-title">
              {t('advanced_booking_system') || 'מערכת הזמנות פשוטה'}
            </h2>
            <h3 className="hero-subtitle">
              {t('for_fitness_trainers') || 'למאמני כושר'} 💪
            </h3>
            <p className="hero-description">
              {t('homepage_description') || 'פלטפורמה מקצועית לניהול הזמנות עם חיבור ליומן Google ומעקב אחר לקוחות. הפכו את ניהול האימונים שלכם לפשוט ויעיל יותר מתמיד.'}
            </p>
            <div className="hero-buttons">
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
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  border: '1px solid #3b82f6',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #2563eb, #1d4ed8)'
                  e.currentTarget.style.transform = 'translateY(-3px)'
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(59, 130, 246, 0.4)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #3b82f6, #2563eb)'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(59, 130, 246, 0.3)'
                }}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {t('login_for_trainers')}
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section 
          ref={featuresRef}
          className="fade-in-section section-padding"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        >
          <div className="container">
            <div className="section-header">
              <h3 className="section-title">
                {t('why_choose_our_system') || 'למה לבחור במערכת שלנו?'}
              </h3>
              <p className="section-subtitle">
                {t('everything_trainer_needs') || 'כל מה שמאמן כושר צריך במקום אחד'}
              </p>
            </div>

            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon calendar">
                  📅
                </div>
                <h4 className="feature-title">
                  {t('google_calendar_integration') || 'חיבור ליומן Google'}
                </h4>
                <p className="feature-description">
                  {t('google_calendar_description') || 'סנכרון אוטומטי עם יומן Google שלכם. כל הזמנה חדשה תופיע מיד ביומן הפרטי שלכם עם כל הפרטים הרלוונטיים.'}
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon link">
                  🔗
                </div>
                <h4 className="feature-title">
                  {t('personal_booking_link') || 'קישור הזמנה אישי'}
                </h4>
                <p className="feature-description">
                  {t('personal_link_description') || 'כל מאמן מקבל קישור אישי ויוניק. שתפו אותו עם הלקוחות שלכם והם יוכלו להזמין פגישות ישירות ללא צורך ברישום.'}
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon management">
                  📊
                </div>
                <h4 className="feature-title">
                  {t('advanced_management') || 'ניהול מתקדם'}
                </h4>
                <p className="feature-description">
                  {t('advanced_management_description') || 'לוח בקרה מקצועי עם מעקב אחר כל ההזמנות, פרטי לקוחות, וניהול זמינות. הכל במקום אחד ונגיש.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section 
          ref={statsRef}
          className="fade-in-section stats-section"
          style={{ transform: `translateY(${scrollY * 0.05}px)` }}
        >
          <div className="container">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">500+</div>
                <p className="stat-label">
                  {t('registered_trainers') || 'מאמנים רשומים'}
                </p>
              </div>

              <div className="stat-card">
                <div className="stat-number">10K+</div>
                <p className="stat-label">
                  {t('workouts_completed') || 'אימונים בוצעו'}
                </p>
              </div>

              <div className="stat-card">
                <div className="stat-number">98%</div>
                <p className="stat-label">
                  {t('satisfaction_rate') || 'שביעות רצון'}
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">
              <div className="footer-icon">
                <svg width="14" height="14" fill="white" viewBox="0 0 24 24">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <span>Trainer Booking</span>
            </div>
            
            {/* Legal Links */}
            <div className="footer-links">
              <Link 
                href="/privacy" 
                className="footer-link"
                style={{
                  color: '#93c5fd',
                  textDecoration: 'none',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  opacity: 0.9
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.color = '#60a5fa'
                  e.currentTarget.style.textDecoration = 'underline'
                  e.currentTarget.style.opacity = '1'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.color = '#93c5fd'
                  e.currentTarget.style.textDecoration = 'none'
                  e.currentTarget.style.opacity = '0.9'
                }}
              >
                {t('privacy_policy')}
              </Link>
              <span className="footer-separator">•</span>
              <Link 
                href="/terms" 
                className="footer-link"
                style={{
                  color: '#93c5fd',
                  textDecoration: 'none',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  opacity: 0.9
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.color = '#60a5fa'
                  e.currentTarget.style.textDecoration = 'underline'
                  e.currentTarget.style.opacity = '1'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.color = '#93c5fd'
                  e.currentTarget.style.textDecoration = 'none'
                  e.currentTarget.style.opacity = '0.9'
                }}
              >
                {t('terms_of_service')}
              </Link>
            </div>

            <p className="footer-text">
              © 2025{' '}
              <a 
                href="https://www.linkedin.com/in/talgurevich/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="footer-link"
              >
                Tal Gurevich
              </a>
              {' '}• All rights reserved
            </p>
          </div>
        </div>
      </footer>

      {/* Styles */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
          50% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.6); }
        }

        .parallax-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: -1;
        }

        .floating-shape {
          position: absolute;
          border-radius: 50%;
          opacity: 0.1;
          animation: float 6s ease-in-out infinite;
        }

        .shape-1 {
          width: 100px;
          height: 100px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          top: 20%;
          left: 10%;
          animation-delay: 0s;
        }

        .shape-2 {
          width: 150px;
          height: 150px;
          background: linear-gradient(135deg, #10b981, #3b82f6);
          top: 60%;
          right: 15%;
          animation-delay: 2s;
        }

        .shape-3 {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #f59e0b, #ef4444);
          top: 40%;
          left: 60%;
          animation-delay: 4s;
        }

        .shape-4 {
          width: 120px;
          height: 120px;
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          top: 80%;
          left: 20%;
          animation-delay: 1s;
        }

        .glass-button {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          font-size: 13px;
          font-weight: 500;
          border-radius: 6px;
          text-decoration: none;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          cursor: pointer;
        }

        .glass-button.primary {
          color: white;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          border: 1px solid #3b82f6;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
        }

        .glass-button.primary:hover {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(59, 130, 246, 0.4);
          border-color: #2563eb;
        }

        .glass-button.secondary {
          color: white;
          background: rgba(30, 41, 59, 0.9);
          border: 1px solid rgba(59, 130, 246, 0.3);
        }

        .glass-button.secondary:hover {
          color: white;
          background: rgba(30, 41, 59, 1);
          transform: translateY(-2px);
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 16px;
          animation: fadeInUp 0.3s ease;
        }

        .modal-content {
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95));
          backdrop-filter: blur(20px);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 16px;
          padding: 32px;
          max-width: 480px;
          width: 100%;
          max-height: 90vh;
          overflow: auto;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
          position: relative;
          animation: fadeInUp 0.3s ease;
        }

        .modal-close {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          background: rgba(148, 163, 184, 0.1);
          color: #94a3b8;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .modal-close:hover {
          background: rgba(148, 163, 184, 0.2);
          color: white;
        }

        .modal-icon {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          font-size: 28px;
          border: 1px solid rgba(59, 130, 246, 0.3);
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #e2e8f0;
          margin-bottom: 6px;
        }

        .form-input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 8px;
          font-size: 14px;
          background: rgba(30, 41, 59, 0.5);
          color: white;
          transition: all 0.2s;
          box-sizing: border-box;
        }

        .form-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-input::placeholder {
          color: #64748b;
        }

        .submit-button {
          width: 100%;
          padding: 14px 24px;
          font-size: 16px;
          font-weight: 600;
          color: white;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 16px;
        }

        .submit-button:hover:not(:disabled) {
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
        }

        .submit-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .form-footer {
          font-size: 12px;
          color: #64748b;
          text-align: center;
          margin: 0;
          line-height: 1.4;
        }

        .hero-section {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          position: relative;
          /* Background handled inline for parallax */
        }

        .hero-content {
          max-width: 800px;
          margin: 0 auto;
          padding: 0 32px;
          animation: fadeInUp 1s ease;
          position: relative;
          z-index: 2;
          background: rgba(15, 23, 42, 0.3);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 40px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .hero-badge {
          display: inline-block;
          padding: 8px 16px;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2));
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 50px;
          font-size: 14px;
          color: #93c5fd;
          margin-bottom: 24px;
          backdrop-filter: blur(10px);
        }

        .hero-title {
          font-size: clamp(32px, 8vw, 48px);
          font-weight: 700;
          color: white;
          margin: 0 0 16px 0;
          line-height: 1.2;
          background: linear-gradient(135deg, #ffffff, #e2e8f0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: clamp(24px, 6vw, 32px);
          font-weight: 600;
          color: #94a3b8;
          margin: 0 0 24px 0;
        }

        .hero-description {
          font-size: 18px;
          color: #cbd5e1;
          margin: 0 0 40px 0;
          line-height: 1.6;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
          margin-bottom: 40px;
        }

        .hero-buttons {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .cta-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 16px 32px;
          font-size: 16px;
          font-weight: 600;
          border-radius: 8px;
          text-decoration: none;
          transition: all 0.3s ease;
          cursor: pointer;
          border: none;
        }

        .cta-button.primary {
          color: white;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          border: 1px solid #3b82f6;
          box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
        }

        .cta-button.primary:hover {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(59, 130, 246, 0.4);
        }

        .cta-button.secondary {
          color: white;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
          border: 1px solid rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(10px);
        }

        .cta-button.secondary:hover {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1));
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(255, 255, 255, 0.2);
        }

        .cta-button.large {
          padding: 20px 40px;
          font-size: 18px;
        }

        .section-padding {
          padding: 100px 0;
        }

        .container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 32px;
        }

        .section-header {
          text-align: center;
          margin-bottom: 64px;
        }

        .section-title {
          font-size: clamp(28px, 6vw, 32px);
          font-weight: 700;
          color: white;
          margin: 0 0 16px 0;
          background: linear-gradient(135deg, #ffffff, #e2e8f0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .section-subtitle {
          font-size: 16px;
          color: #94a3b8;
          margin: 0;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 32px;
        }

        .feature-card {
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.8));
          backdrop-filter: blur(20px);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 16px;
          padding: 32px;
          text-align: center;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.5), transparent);
        }

        .feature-card:hover {
          transform: translateY(-10px);
          border-color: rgba(59, 130, 246, 0.3);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .feature-icon {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          font-size: 28px;
          border: 1px solid rgba(148, 163, 184, 0.2);
        }

        .feature-icon.calendar {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(147, 197, 253, 0.1));
        }

        .feature-icon.link {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(110, 231, 183, 0.1));
        }

        .feature-icon.management {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(196, 181, 253, 0.1));
        }

        .feature-title {
          font-size: 20px;
          font-weight: 600;
          color: white;
          margin: 0 0 16px 0;
        }

        .feature-description {
          font-size: 14px;
          color: #cbd5e1;
          line-height: 1.6;
          margin: 0;
        }

        .stats-section {
          padding: 100px 0;
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.5), rgba(15, 23, 42, 0.5));
          backdrop-filter: blur(10px);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 32px;
        }

        .stat-card {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
          backdrop-filter: blur(20px);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 12px;
          padding: 32px 24px;
          text-align: center;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          border-color: rgba(59, 130, 246, 0.3);
        }

        .stat-number {
          font-size: 36px;
          font-weight: 700;
          color: white;
          margin: 0 0 8px 0;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .stat-label {
          font-size: 14px;
          color: #94a3b8;
          margin: 0;
        }

        .cta-section {
          padding: 100px 0;
        }

        .cta-content {
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.8));
          backdrop-filter: blur(20px);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 16px;
          padding: 64px 32px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .cta-content::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.5), transparent);
        }

        .cta-title {
          font-size: clamp(24px, 6vw, 28px);
          font-weight: 700;
          color: white;
          margin: 0 0 16px 0;
          background: linear-gradient(135deg, #ffffff, #e2e8f0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .cta-description {
          font-size: 16px;
          color: #cbd5e1;
          margin: 0 0 32px 0;
          line-height: 1.6;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
          margin-bottom: 32px;
        }

        .footer {
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9));
          backdrop-filter: blur(20px);
          border-top: 1px solid rgba(148, 163, 184, 0.1);
          padding: 32px 0;
        }

        .footer-content {
          text-align: center;
        }

        .footer-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .footer-links {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 16px;
          font-size: 14px;
        }

        .footer-separator {
          color: #64748b;
        }

        .footer-icon {
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .footer-logo span {
          font-size: 16px;
          font-weight: 600;
          color: white;
        }

        .footer-text {
          font-size: 14px;
          color: #94a3b8;
          margin: 0;
        }

        .footer-link {
          color: #93c5fd;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.2s;
          opacity: 0.9;
        }

        .footer-link:hover {
          color: #60a5fa;
          text-decoration: underline;
          opacity: 1;
        }

        .fade-in-section {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s ease;
        }

        .fade-in-section.animate-in {
          opacity: 1;
          transform: translateY(0);
        }

        @media (max-width: 768px) {
          .hero-content {
            padding: 0 16px;
            background: rgba(15, 23, 42, 0.6);
            padding: 24px;
            border-radius: 16px;
          }

          .container {
            padding: 0 16px;
          }

          .features-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .feature-card, .cta-content {
            padding: 24px;
          }

          .hero-buttons {
            flex-direction: column;
            align-items: center;
          }

          .cta-button {
            width: 100%;
            max-width: 300px;
            justify-content: center;
          }

          /* Fix background attachment for mobile */
          .hero-section {
            background-attachment: scroll !important;
          }
        }
      `}</style>
    </div>
  )
}