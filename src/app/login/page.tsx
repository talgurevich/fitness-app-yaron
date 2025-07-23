// src/app/login/page.tsx - Complete redesign with modern styling and small icons
'use client'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) {
      router.push('/dashboard')
    }
  }, [session, router])

  if (session) {
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
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        opacity: 0.1,
        zIndex: 0
      }}></div>

      {/* Main Content */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px'
      }}>
        
        {/* Logo & Branding Section */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.4)'
          }}>
            <svg width="36" height="36" fill="white" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: '700', 
            color: '#111827', 
            margin: '0 0 8px 0',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Trainer Dashboard
          </h1>
          
          <p style={{ 
            fontSize: '16px', 
            color: '#6b7280', 
            margin: 0,
            maxWidth: '400px'
          }}>
            Professional fitness scheduling platform for trainers
          </p>
        </div>

        {/* Login Card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '40px',
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          border: '1px solid #e5e7eb'
        }}>
          
          {/* Card Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: '600', 
              color: '#111827', 
              margin: '0 0 8px 0' 
            }}>
              Welcome Back
            </h2>
            <p style={{ 
              fontSize: '14px', 
              color: '#6b7280', 
              margin: 0 
            }}>
              Sign in to access your trainer dashboard
            </p>
          </div>

          {/* Google Sign In Button */}
          <button
            onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: '14px 20px',
              fontSize: '15px',
              fontWeight: '500',
              color: '#374151',
              backgroundColor: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb'
              e.currentTarget.style.borderColor = '#9ca3af'
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'white'
              e.currentTarget.style.borderColor = '#d1d5db'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            {/* Google Logo SVG */}
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            margin: '24px 0',
            gap: '12px'
          }}>
            <div style={{ 
              flex: 1, 
              height: '1px', 
              backgroundColor: '#e5e7eb' 
            }}></div>
            <span style={{ 
              fontSize: '12px', 
              color: '#9ca3af',
              fontWeight: '500'
            }}>
              SECURE LOGIN
            </span>
            <div style={{ 
              flex: 1, 
              height: '1px', 
              backgroundColor: '#e5e7eb' 
            }}></div>
          </div>

          {/* Features List */}
          <div style={{ 
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            padding: '16px',
            marginTop: '24px'
          }}>
            <h4 style={{ 
              fontSize: '13px', 
              fontWeight: '600', 
              color: '#374151', 
              margin: '0 0 12px 0' 
            }}>
              What you'll get:
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { icon: '📅', text: 'Calendar integration & scheduling' },
                { icon: '👥', text: 'Client management system' },
                { icon: '📊', text: 'Session tracking & analytics' },
                { icon: '🔗', text: 'Personal booking link' }
              ].map((feature, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px' 
                }}>
                  <span style={{ fontSize: '14px' }}>{feature.icon}</span>
                  <span style={{ 
                    fontSize: '13px', 
                    color: '#6b7280' 
                  }}>
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy Notice */}
          <div style={{ 
            textAlign: 'center', 
            marginTop: '24px',
            padding: '16px 0',
            borderTop: '1px solid #f3f4f6'
          }}>
            <p style={{ 
              fontSize: '11px', 
              color: '#9ca3af', 
              lineHeight: '1.5',
              margin: 0
            }}>
              By continuing, you agree to our{' '}
              <Link 
                href="/terms" 
                style={{ 
                  color: '#3b82f6',
                  textDecoration: 'none',
                  fontWeight: '500'
                }}
                onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
              >
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link 
                href="/privacy" 
                style={{ 
                  color: '#3b82f6',
                  textDecoration: 'none',
                  fontWeight: '500'
                }}
                onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Links */}
        <div style={{ 
          marginTop: '32px',
          display: 'flex',
          gap: '20px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {[
            { href: '/help', text: 'Help Center' },
            { href: '/contact', text: 'Contact Us' },
            { href: '/about', text: 'About' }
          ].map((link, index) => (
            <Link
              key={index}
              href={link.href}
              style={{
                fontSize: '13px',
                color: '#6b7280',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = '#3b82f6'}
              onMouseOut={(e) => e.currentTarget.style.color = '#6b7280'}
            >
              {link.text}
            </Link>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}