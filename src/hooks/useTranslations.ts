// src/hooks/useTranslations.ts
'use client'
import { useState, useEffect } from 'react'

const translations = {
  he: {
    // Header
    'fitness_coach': 'מאמן כושר',
    
    // Home page
    'booking_system': 'מערכת הזמנות למאמני כושר',
    'simple_platform': 'פלטפורמה פשוטה לניהול הזמנות עם לקוחות',
    'trainer_login': 'כניסה למאמנים',
    
    // Login page
    'trainer_login_title': 'התחברות למאמנים',
    'email': 'אימייל',
    'password': 'סיסמה',
    'login': 'התחבר',
    'login_with_google': 'התחבר עם Google',
    'logging_in': 'מתחבר...',
    'wrong_credentials': 'אימייל או סיסמה שגויים',
    
    // Dashboard
    'trainer_dashboard': 'לוח בקרה למאמן',
    'hello': 'שלום',
    'logout': 'התנתק',
    'google_calendar': 'יומן Google',
    'connected': 'מחובר',
    'not_connected': 'לא מחובר',
    'connect_google_calendar': 'חבר יומן Google',
    'booking_link': 'קישור הזמנה',
    'copy_link': 'העתק קישור',
    'view_page': 'צפה בדף',
    'todays_appointments': 'הזמנות היום',
    'recent_appointments': 'הזמנות אחרונות',
    'no_appointments': 'אין הזמנות עדיין',
    'share_link_message': 'שתף את קישור ההזמנה שלך עם לקוחות כדי להתחיל לקבל הזמנות',
    'delete': 'מחק',
    'confirm_delete': 'האם אתה בטוח שברצונך למחוק את ההזמנה של',
  },
  en: {
    // Header
    'fitness_coach': 'Fitness Coach',
    
    // Home page
    'booking_system': 'Fitness Coach Booking System',
    'simple_platform': 'Simple platform for managing appointments with clients',
    'trainer_login': 'Trainer Login',
    
    // Login page
    'trainer_login_title': 'Trainer Login',
    'email': 'Email',
    'password': 'Password',
    'login': 'Login',
    'login_with_google': 'Login with Google',
    'logging_in': 'Logging in...',
    'wrong_credentials': 'Wrong email or password',
    
    // Dashboard
    'trainer_dashboard': 'Trainer Dashboard',
    'hello': 'Hello',
    'logout': 'Logout',
    'google_calendar': 'Google Calendar',
    'connected': 'Connected',
    'not_connected': 'Not Connected',
    'connect_google_calendar': 'Connect Google Calendar',
    'booking_link': 'Booking Link',
    'copy_link': 'Copy Link',
    'view_page': 'View Page',
    'todays_appointments': "Today's Appointments",
    'recent_appointments': 'Recent Appointments',
    'no_appointments': 'No appointments yet',
    'share_link_message': 'Share your booking link with clients to start receiving appointments',
    'delete': 'Delete',
    'confirm_delete': 'Are you sure you want to delete the appointment for',
  }
}

export function useTranslations() {
  const [language, setLanguage] = useState('he')
  
  useEffect(() => {
    // Get saved language from localStorage
    const savedLang = localStorage.getItem('language') || 'he'
    setLanguage(savedLang)
    
    // Listen for custom language change events
    const handleLanguageChange = (event: CustomEvent) => {
      setLanguage(event.detail.language)
    }
    
    window.addEventListener('languageChanged' as any, handleLanguageChange)
    
    return () => {
      window.removeEventListener('languageChanged' as any, handleLanguageChange)
    }
  }, [])
  
  const t = (key: string) => {
    return translations[language as keyof typeof translations]?.[key as keyof typeof translations.he] || key
  }
  
  return { t, language }
}