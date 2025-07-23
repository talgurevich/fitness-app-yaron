// src/components/LanguageToggle.tsx - Modern styled language toggle
'use client'
import { useState, useEffect } from 'react'

export default function LanguageToggle() {
  const [language, setLanguage] = useState('en')
  
  useEffect(() => {
    // Get saved language from localStorage or default to English
    const savedLang = localStorage.getItem('language') || 'en'
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
    
    // Reload page to apply translations
    window.location.reload()
  }

  return (
    <button
      onClick={toggleLanguage}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 10px',
        fontSize: '12px',
        fontWeight: '500',
        color: '#6b7280',
        backgroundColor: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        minWidth: '70px',
        justifyContent: 'center'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.backgroundColor = '#f3f4f6'
        e.currentTarget.style.borderColor = '#d1d5db'
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = '#f9fafb'
        e.currentTarget.style.borderColor = '#e5e7eb'
      }}
      title={`Switch to ${language === 'he' ? 'English' : 'Hebrew'}`}
    >
      <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
      </svg>
      {language === 'he' ? 'EN' : 'עב'}
    </button>
  )
}

// Translation hook
export function useTranslations() {
  const [language, setLanguage] = useState('en')

  useEffect(() => {
    const savedLang = localStorage.getItem('language') || 'en'
    setLanguage(savedLang)

    const handleLanguageChange = (event: CustomEvent) => {
      setLanguage(event.detail.language)
    }

    window.addEventListener('languageChanged', handleLanguageChange as EventListener)
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange as EventListener)
    }
  }, [])

  const translations = {
    en: {
      // Login page
      'trainer_dashboard': 'Trainer Dashboard',
      'professional_fitness': 'Professional fitness scheduling platform for trainers',
      'welcome_back': 'Welcome Back',
      'sign_in_access': 'Sign in to access your trainer dashboard',
      'continue_google': 'Continue with Google',
      'secure_login': 'SECURE LOGIN',
      'what_youll_get': 'What you\'ll get:',
      'calendar_integration': 'Calendar integration & scheduling',
      'client_management': 'Client management system',
      'session_tracking': 'Session tracking & analytics',
      'personal_booking': 'Personal booking link',
      'terms_service': 'Terms of Service',
      'privacy_policy': 'Privacy Policy',
      'help_center': 'Help Center',
      'contact_us': 'Contact Us',
      'about': 'About',
      'redirecting': 'Redirecting to dashboard...',

      // Dashboard
      'welcome_back_trainer': 'Welcome back!',
      'business_today': 'Here\'s what\'s happening with your training business today',
      'set_availability': 'Set Availability',
      'view_clients': 'View Clients',
      'todays_sessions': 'Today\'s Sessions',
      'this_week': 'This Week',
      'active_clients': 'Active Clients',
      'upcoming_sessions': 'Upcoming Sessions',
      'scheduled': 'scheduled',
      'no_upcoming': 'No upcoming sessions',
      'new_appointments': 'New appointments will appear here when clients book',
      'share_booking_link': 'Share booking link',
      'quick_actions': 'Quick Actions',
      'manage_clients': 'Manage Clients',
      'share_link': 'Share Link',
      'sign_out': 'Sign Out',
      'profile_info': 'Profile Info',
      'name': 'Name',
      'email': 'Email',
      'booking_url': 'Booking URL',
      'not_set': 'Not set',

      // Clients
      'client_management': 'Client Management',
      'registered_clients': 'registered clients',
      'dashboard': 'Dashboard',
      'schedule_session': 'Schedule Session',
      'your_clients': 'Your Clients',
      'manage_relationships': 'Manage your client relationships and track their progress',
      'total_clients': 'Total Clients',
      'active_this_month': 'Active This Month',
      'total_sessions': 'Total Sessions',
      'client_directory': 'Client Directory',
      'find_manage': 'Find and manage your clients',
      'search_clients': 'Search clients by name or email...',
      'no_clients_found': 'No clients found',
      'no_clients_yet': 'No clients yet',
      'no_match_search': 'No clients match your search. Try a different search term.',
      'auto_added': 'Clients will be automatically added when they book sessions',
      'share_booking': 'Share your booking link',
      'joined': 'Joined',
      'last': 'Last',
      'goals': 'Goals',
      'total': 'Total',
      'done': 'Done',
      'upcoming': 'Upcoming',

      // Booking
      'book_session': 'Book a session with',
      'select_date_time': 'Select a date and time that works for you',
      'select_date': 'Select Date',
      'available_times': 'Available Times',
      'loading_times': 'Loading available times...',
      'no_times_available': 'No times available on this date',
      'booking_details': 'Booking Details',
      'session_summary': 'Session Summary:',
      'date': 'Date',
      'time': 'Time',
      'trainer': 'Trainer',
      'full_name': 'Full Name',
      'your_name': 'Your name',
      'email_address': 'Email Address',
      'phone_number': 'Phone Number',
      'book_session_btn': 'Book Session',
      'sending_booking': 'Sending booking...',
      'booking_sent': 'Booking sent successfully!',
      'booking_confirmation': 'Your booking for {date} at {time} has been sent to the trainer',
      'email_confirmation': 'You will receive confirmation shortly at: {email}',

      // Availability
      'availability_settings': 'Availability Settings',
      'working_hours': 'Working hours and sessions',
      'back': 'Back',
      'session_settings': 'Session Settings',
      'session_duration': 'Session Duration',
      'break_between': 'Break Between Sessions',
      'weekly_schedule': 'Weekly Schedule',
      'working_hours_week': 'Set working hours for each day of the week',
      'available': 'Available',
      'unavailable': 'Unavailable',
      'add_hours': 'Add Hours',
      'from': 'From:',
      'to': 'To:',
      'remove_hours': 'Remove hours',
      'cancel': 'Cancel',
      'save_settings': 'Save Settings',
      'saving': 'Saving...',
      'settings_saved': 'Availability settings saved successfully!',
      'error_saving': 'Error saving settings',

      // Days
      'sunday': 'Sunday',
      'monday': 'Monday',
      'tuesday': 'Tuesday',
      'wednesday': 'Wednesday',
      'thursday': 'Thursday',
      'friday': 'Friday',
      'saturday': 'Saturday',

      // Status
      'completed': 'Completed',
      'booked': 'Scheduled',
      'cancelled': 'Cancelled',
      'active': 'Active',
      'existing': 'Existing',
      'new': 'New'
    },
    he: {
      // Login page
      'trainer_dashboard': 'מערכת המאמן',
      'professional_fitness': 'פלטפורמה מקצועית לתיאום אימונים למאמנים',
      'welcome_back': 'ברוכים השבים',
      'sign_in_access': 'התחברו כדי לגשת למערכת המאמן שלכם',
      'continue_google': 'המשך עם Google',
      'secure_login': 'התחברות מאובטחת',
      'what_youll_get': 'מה תקבלו:',
      'calendar_integration': 'אינטגרציה עם יומן ותיאום',
      'client_management': 'מערכת ניהול לקוחות',
      'session_tracking': 'מעקב אחר אימונים וניתוחים',
      'personal_booking': 'קישור הזמנה אישי',
      'terms_service': 'תנאי השירות',
      'privacy_policy': 'מדיניות פרטיות',
      'help_center': 'מרכז עזרה',
      'contact_us': 'צרו קשר',
      'about': 'אודות',
      'redirecting': 'מפנה לדשבורד...',

      // Dashboard
      'welcome_back_trainer': 'ברוכים השבים!',
      'business_today': 'הנה מה שקורה עם עסק האימונים שלכם היום',
      'set_availability': 'הגדר זמינות',
      'view_clients': 'צפה בלקוחות',
      'todays_sessions': 'אימוני היום',
      'this_week': 'השבוע',
      'active_clients': 'לקוחות פעילים',
      'upcoming_sessions': 'אימונים קרובים',
      'scheduled': 'מתוזמנים',
      'no_upcoming': 'אין אימונים קרובים',
      'new_appointments': 'פגישות חדשות יופיעו כאן כשלקוחות יזמינו',
      'share_booking_link': 'שתף קישור הזמנה',
      'quick_actions': 'פעולות מהירות',
      'manage_clients': 'נהל לקוחות',
      'share_link': 'שתף קישור',
      'sign_out': 'התנתק',
      'profile_info': 'פרטי פרופיל',
      'name': 'שם',
      'email': 'אימייל',
      'booking_url': 'כתובת הזמנה',
      'not_set': 'לא הוגדר',

      // Clients
      'client_management': 'ניהול לקוחות',
      'registered_clients': 'לקוחות רשומים',
      'dashboard': 'דשבורד',
      'schedule_session': 'תזמן אימון',
      'your_clients': 'הלקוחות שלכם',
      'manage_relationships': 'נהלו את יחסי הלקוחות שלכם ועקבו אחר ההתקדמות',
      'total_clients': 'סך לקוחות',
      'active_this_month': 'פעילים החודש',
      'total_sessions': 'סך אימונים',
      'client_directory': 'ספריית לקוחות',
      'find_manage': 'מצאו ונהלו את הלקוחות שלכם',
      'search_clients': 'חפש לקוחות לפי שם או אימייל...',
      'no_clients_found': 'לא נמצאו לקוחות',
      'no_clients_yet': 'עדיין אין לקוחות',
      'no_match_search': 'אין לקוחות התואמים לחיפוש. נסו מילת חיפוש אחרת.',
      'auto_added': 'לקוחות יתווספו אוטומטית כשהם יזמינו אימונים',
      'share_booking': 'שתפו את קישור ההזמנה שלכם',
      'joined': 'הצטרף',
      'last': 'אחרון',
      'goals': 'מטרות',
      'total': 'סך הכל',
      'done': 'בוצע',
      'upcoming': 'קרוב',

      // Booking
      'book_session': 'הזמן אימון עם',
      'select_date_time': 'בחר תאריך ושעה המתאימים לך',
      'select_date': 'בחר תאריך',
      'available_times': 'שעות זמינות',
      'loading_times': 'טוען שעות זמינות...',
      'no_times_available': 'אין שעות זמינות בתאריך זה',
      'booking_details': 'פרטי ההזמנה',
      'session_summary': 'סיכום הפגישה:',
      'date': 'תאריך',
      'time': 'שעה',
      'trainer': 'מאמן',
      'full_name': 'שם מלא',
      'your_name': 'השם שלך',
      'email_address': 'כתובת אימייל',
      'phone_number': 'מספר טלפון',
      'book_session_btn': 'הזמן אימון',
      'sending_booking': 'שולח הזמנה...',
      'booking_sent': 'ההזמנה נשלחה בהצלחה!',
      'booking_confirmation': 'ההזמנה שלך ל-{date} בשעה {time} נשלחה למאמן',
      'email_confirmation': 'תקבל אישור בקרוב למייל: {email}',

      // Availability
      'availability_settings': 'הגדרות זמינות',
      'working_hours': 'שעות עבודה ואימונים',
      'back': 'חזור',
      'session_settings': 'הגדרות אימון',
      'session_duration': 'משך אימון',
      'break_between': 'הפסקה בין אימונים',
      'weekly_schedule': 'לוח שבועי',
      'working_hours_week': 'הגדרת שעות עבודה לכל יום בשבוע',
      'available': 'זמין',
      'unavailable': 'לא זמין',
      'add_hours': 'הוסף שעות',
      'from': 'מ:',
      'to': 'עד:',
      'remove_hours': 'הסר שעות',
      'cancel': 'ביטול',
      'save_settings': 'שמור הגדרות',
      'saving': 'שומר...',
      'settings_saved': 'הגדרות הזמינות נשמרו בהצלחה!',
      'error_saving': 'שגיאה בשמירת ההגדרות',

      // Days
      'sunday': 'ראשון',
      'monday': 'שני',
      'tuesday': 'שלישי',
      'wednesday': 'רביעי',
      'thursday': 'חמישי',
      'friday': 'שישי',
      'saturday': 'שבת',

      // Status
      'completed': 'הושלם',
      'booked': 'מתוזמן',
      'cancelled': 'בוטל',
      'active': 'פעיל',
      'existing': 'קיים',
      'new': 'חדש'
    }
  }

  const t = (key: string, params?: Record<string, string>) => {
    let text = translations[language as keyof typeof translations]?.[key as keyof typeof translations.en] || key
    
    if (params) {
      Object.keys(params).forEach(param => {
        text = text.replace(`{${param}}`, params[param])
      })
    }
    
    return text
  }

  return { t, language }
}