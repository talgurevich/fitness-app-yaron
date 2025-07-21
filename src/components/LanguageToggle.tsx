// src/components/LanguageToggle.tsx
'use client'
import { useState, useEffect } from 'react'

export default function LanguageToggle() {
  const [language, setLanguage] = useState('he')
  
  useEffect(() => {
    // Get saved language from localStorage or default to Hebrew
    const savedLang = localStorage.getItem('language') || 'he'
    setLanguage(savedLang)
    updateLanguage(savedLang)
  }, [])

  const updateLanguage = (lang: string) => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr'
    localStorage.setItem('language', lang)
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('languageChanged', { 
      detail: { language: lang } 
    }))
  }
  
  const toggleLanguage = () => {
    const newLang = language === 'he' ? 'en' : 'he'
    setLanguage(newLang)
    updateLanguage(newLang)
  }

  return (
    <button
      onClick={toggleLanguage}
      className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
      style={{
        padding: '0.25rem 0.75rem',
        borderRadius: '0.25rem',
        backgroundColor: '#2563eb',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: '500',
        transition: 'background-color 0.2s'
      }}
      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
      onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
    >
      {language === 'he' ? 'English' : 'עברית'}
    </button>
  )
}