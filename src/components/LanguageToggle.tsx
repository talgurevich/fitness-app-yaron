// src/components/LanguageToggle.tsx
'use client'
import { useState, createContext, useContext, ReactNode, useEffect } from 'react'

type Language = 'he' | 'en'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const translations = {
  he: {
    // Dashboard translations
    'trainer_dashboard': 'לוח בקרה למאמן',
    'set_availability': 'הגדרת זמינות',
    'view_clients': 'צפייה בלקוחות',
    'share_link': 'שיתוף קישור',
    'sign_out': 'התנתקות',
    'welcome_back_trainer': 'ברוכים השובים מאמן',
    'business_today': 'איך העסק שלכם היום?',
    'loading_dashboard': 'טוען לוח בקרה...',
    'refresh': 'רענון',
    'updating': 'מעדכן...',
    'todays_sessions': 'אימונים היום',
    'this_week': 'השבוע',
    'active_clients': 'לקוחות פעילים',
    'upcoming_sessions': 'אימונים קרובים',
    'scheduled': 'מתוזמנים',
    'quick_actions': 'פעולות מהירות',
    'manage_clients': 'ניהול לקוחות',
    'profile_info': 'פרטי פרופיל',
    'name': 'שם',
    'email': 'אימייל',
    'booking_url': 'כתובת הזמנות',
    'not_set': 'לא הוגדר',
    'no_upcoming_sessions': 'אין אימונים קרובים',
    'new_appointments_appear_here': 'הזמנות חדשות יופיעו כאן כשלקוחות יזמינו',
    'share_booking_link': 'שתף קישור הזמנות',
    'completed': 'הושלם',
    'scheduled_status': 'מתוזמן',
    'cancelled': 'בוטל',
    'privacy_policy': 'מדיניות פרטיות',
    'terms_of_service': 'תנאי שימוש',
    'login_for_trainers': 'התחברות למאמנים',
    'join_now': 'הצטרפו עכשיו',
    'want_to_register': 'רוצה להירשם',
    
    // Onboarding translations
    'welcome_to_system': 'ברוכים הבאים למערכת!',
    'lets_get_started': 'בואו נתחיל',
    'onboarding_intro': 'בכמה צעדים פשוטים תוכלו להתחיל לקבל הזמנות מלקוחות',
    'step': 'שלב',
    'set_your_availability': 'הגדירו את הזמינות שלכם',
    'set_availability_desc': 'הגדירו באילו ימים ושעות אתם זמינים לאימונים. המערכת תאפשר ללקוחות להזמין רק בזמנים אלו.',
    'test_calendar_connection': 'בדקו את החיבור ליומן',
    'test_calendar_desc': 'וודאו שהחיבור ליומן Google שלכם עובד כראוי. כל הזמנה תתווסף אוטומטית ליומן.',
    'share_your_link': 'שתפו את הקישור שלכם',
    'share_link_desc': 'שתפו את הקישור האישי שלכם עם לקוחות והם יוכלו להזמין אימונים ישירות.',
    'got_it': 'הבנתי!',
    'start_setup': 'התחל הגדרות',
    'skip_tutorial': 'דלג על ההדרכה',
    
    // Auth translations
    'signup': 'הרשמה',
    'create_account': 'יצירת חשבון',
    'already_have_account': 'כבר יש לך חשבון?',
    'dont_have_account': 'אין לך חשבון?',
    'full_name': 'שם מלא',
    'password': 'סיסמה',
    'confirm_password': 'אישור סיסמה',
    'or': 'או',
    'sign_in_with_email': 'התחבר עם אימייל',
    'sign_up_with_email': 'הירשם עם אימייל',
    'password_min_length': 'הסיסמה חייבת להכיל לפחות 8 תווים',
    'passwords_dont_match': 'הסיסמאות לא תואמות',
    'email_required': 'אימייל נדרש',
    'name_required': 'שם נדרש',
    'password_required': 'סיסמה נדרשת',
    'creating_account': 'יוצר חשבון...',
    'signing_in': 'מתחבר...',
    'account_created_successfully': 'החשבון נוצר בהצלחה!',
    'invalid_credentials': 'פרטי התחברות שגויים',
    'email_already_exists': 'משתמש עם אימייל זה כבר קיים',
    'email_password_required': 'אימייל וסיסמה נדרשים',
    'use_google_signin': 'אנא התחבר עם Google עבור חשבון זה',
    'redirecting': 'מפנה...',
    'professional_fitness': 'פלטפורמה מקצועית לניהול הזמנות אימונים',
    'sign_in_access': 'התחברו כדי לגשת ללוח הבקרה שלכם',
    'terms_service': 'תנאי השירות',
    'help_center': 'מרכז עזרה',
    'contact_us': 'צור קשר',
    'about': 'אודות',
    'personal_booking': 'קישור הזמנה אישי',
    'get_started': 'בואו נתחיל',
    'contact_form_description': 'השאירו פרטים ונחזור אליכם עם כל המידע על המערכת',
    'contact_success_message': 'תודה על פנייתכם! נחזור אליכם תוך 24 שעות.',
    'contact_error_message': 'אירעה שגיאה בשליחת הבקשה. אנא נסו שוב מאוחר יותר.',
    
    // Homepage translations
    'fitness_booking_system': 'מערכת הזמנות למאמני כושר',
    'login': 'התחברות',
    'advanced_booking_system': 'מערכת הזמנות פשוטה',
    'for_fitness_trainers': 'למאמני כושר',
    'homepage_description': 'פלטפורמה מקצועית לניהול הזמנות עם חיבור ליומן Google ומעקב אחר לקוחות. הפכו את ניהול האימונים שלכם לפשוט ויעיל יותר מתמיד.',
    'why_choose_our_system': 'למה לבחור במערכת שלנו?',
    'everything_trainer_needs': 'כל מה שמאמן כושר צריך במקום אחד',
    'google_calendar_integration': 'חיבור ליומן Google',
    'google_calendar_description': 'סנכרון אוטומטי עם יומן Google שלכם. כל הזמנה חדשה תופיע מיד ביומן הפרטי שלכם עם כל הפרטים הרלוונטיים.',
    'personal_booking_link': 'קישור הזמנה אישי',
    'personal_link_description': 'כל מאמן מקבל קישור אישי ויוניק. שתפו אותו עם הלקוחות שלכם והם יוכלו להזמין פגישות ישירות ללא צורך ברישום.',
    'advanced_management': 'ניהול מתקדם',
    'advanced_management_description': 'לוח בקרה מקצועי עם מעקב אחר כל ההזמנות, פרטי לקוחות, וניהול זמינות. הכל במקום אחד ונגיש.',
    'registered_trainers': 'מאמנים רשומים',
    'workouts_completed': 'אימונים בוצעו',
    'satisfaction_rate': 'שביעות רצון',
    'start_today': 'התחילו עוד היום!',
    'join_many_trainers': 'הצטרפו למאמנים רבים שכבר משתמשים במערכת ומנהלים את העסק שלהם ביעילות מקסימלית',
    'join_now_free': 'הצטרפו עכשיו - בחינם',
    'copyright_2024': '© 2024 FitnessPro. כל הזכויות שמורות.',
    
    // Testimonial translations
    'what_trainers_say': 'מה המאמנים אומרים',
    'testimonial_text': 'המערכת הזו שינתה לי את החיים! הלקוחות שלי יכולים להזמין אימונים ישירות דרך הקישור, הכל מתעדכן באלקטרוניקה שלי, וזה חוסך לי שעות של תיאום. הכי פשוט ויעיל שיש!',
    'testimonial_name': 'ירון הוכמן',
    'testimonial_title': 'מאמן כושר, MVMNT Factory עכו',
    
    // Login page translations
    'continue_google': 'המשך עם Google',
    'secure_login': 'התחברות מאובטחת',
    'what_youll_get': 'מה תקבלו',
    'calendar_integration': 'סנכרון יומן אוטומטי',
    'client_management': 'ניהול לקוחות מתקדם',
    'session_tracking': 'מעקב אחר אימונים',
    'trainer_login': 'התחברות מאמנים',
    'welcome_back': 'ברוכים השובים',
    'sign_in_continue': 'התחברו כדי להמשיך',
    'google_calendar_sync': 'סנכרון עם יומן Google',
    'manage_appointments': 'ניהול הזמנות',
    'track_clients': 'מעקב אחר לקוחות',
    'easy_scheduling': 'תזמון קל ופשוט',
    'professional_dashboard': 'לוח בקרה מקצועי',
    'instant_notifications': 'התראות מיידיות',
    'secure_data': 'נתונים מאובטחים',
    'mobile_friendly': 'ידידותי לנייד',
    'quick_setup': 'הגדרה מהירה',
    'already_registered': 'כבר רשומים? נהדר!',
    'new_here': 'חדשים כאן?',
    'get_started': 'בואו נתחיל',
    'loading': 'טוען...',
    'error': 'שגיאה',
    'try_again': 'נסו שוב',
    'contact_support': 'צרו קשר עם התמיכה',
    
    // Booking page translations
    'book_session_with': 'הזמן אימון עם',
    'select_date_time': 'בחר תאריך ושעה המתאימים לך',
    'booking_appointment': 'הזמנת אימון',
    'select_time_start_training': 'בחר את הזמן המתאים לך ונתחיל להתאמן יחד!',
    'click_desired_date_time': 'לחץ על התאריך והשעה הרצויים',
    'date': 'תאריך',
    'available_times': 'שעות זמינות',
    'loading_available_times': 'טוען שעות זמינות...',
    'no_available_times': 'אין שעות זמינות בתאריך זה',
    'booking_details': 'פרטי ההזמנה',
    'fill_details_complete': 'מלא את הפרטים כדי להשלים את ההזמנה',
    'session_summary': 'סיכום הפגישה',
    'time': 'שעה',
    'trainer': 'מאמן',
    'full_name': 'שם מלא',
    'your_name': 'השם שלך',
    'email_address': 'כתובת אימייל',
    'phone_number': 'מספר טלפון',
    'phone_placeholder': '050-1234567',
    'sending_booking': 'שולח הזמנה...',
    'book_session': 'הזמן אימון',
    'booking_success': 'הזמנה נשלחה בהצלחה!',
    'booking_success_message': 'ההזמנה שלך ל-',
    'at_time': 'בשעה',
    'sent_to_trainer': 'נשלחה למאמן',
    'confirmation_email': 'תקבל אישור בקרוב למייל',
    'booking_error': 'שגיאה ביצירת הזמנה'
  },
  en: {
    // Dashboard translations
    'trainer_dashboard': 'Trainer Dashboard',
    'set_availability': 'Set Availability',
    'view_clients': 'View Clients',
    'share_link': 'Share Link',
    'sign_out': 'Sign Out',
    'welcome_back_trainer': 'Welcome Back Trainer',
    'business_today': 'How\'s your business today?',
    'loading_dashboard': 'Loading dashboard...',
    'refresh': 'Refresh',
    'updating': 'Updating...',
    'todays_sessions': 'Today\'s Sessions',
    'this_week': 'This Week',
    'active_clients': 'Active Clients',
    'upcoming_sessions': 'Upcoming Sessions',
    'scheduled': 'scheduled',
    'quick_actions': 'Quick Actions',
    'manage_clients': 'Manage Clients',
    'profile_info': 'Profile Info',
    'name': 'Name',
    'email': 'Email',
    'booking_url': 'Booking URL',
    'not_set': 'Not set',
    'no_upcoming_sessions': 'No upcoming sessions',
    'new_appointments_appear_here': 'New appointments will appear here when clients book',
    'share_booking_link': 'Share booking link',
    'completed': 'Completed',
    'scheduled_status': 'Scheduled',
    'cancelled': 'Cancelled',
    'privacy_policy': 'Privacy Policy',
    'terms_of_service': 'Terms of Service',
    'login_for_trainers': 'Login for Trainers',
    'join_now': 'Join Now',
    'want_to_register': 'Want to Register',
    
    // Onboarding translations
    'welcome_to_system': 'Welcome to the System!',
    'lets_get_started': 'Let\'s Get Started',
    'onboarding_intro': 'In a few simple steps, you\'ll be ready to receive bookings from clients',
    'step': 'Step',
    'set_your_availability': 'Set Your Availability',
    'set_availability_desc': 'Define which days and hours you\'re available for training. The system will only allow clients to book during these times.',
    'test_calendar_connection': 'Test Calendar Connection',
    'test_calendar_desc': 'Make sure your Google Calendar connection is working properly. Every booking will be automatically added to your calendar.',
    'share_your_link': 'Share Your Link',
    'share_link_desc': 'Share your personal link with clients and they can book sessions directly.',
    'got_it': 'Got it!',
    'start_setup': 'Start Setup',
    'skip_tutorial': 'Skip Tutorial',
    
    // Auth translations
    'signup': 'Sign Up',
    'create_account': 'Create Account',
    'already_have_account': 'Already have an account?',
    'dont_have_account': 'Don\'t have an account?',
    'full_name': 'Full Name',
    'password': 'Password',
    'confirm_password': 'Confirm Password',
    'or': 'OR',
    'sign_in_with_email': 'Sign in with Email',
    'sign_up_with_email': 'Sign up with Email',
    'password_min_length': 'Password must be at least 8 characters',
    'passwords_dont_match': 'Passwords don\'t match',
    'email_required': 'Email is required',
    'name_required': 'Name is required',
    'password_required': 'Password is required',
    'creating_account': 'Creating account...',
    'signing_in': 'Signing in...',
    'account_created_successfully': 'Account created successfully!',
    'invalid_credentials': 'Invalid credentials',
    'email_already_exists': 'User with this email already exists',
    'email_password_required': 'Email and password are required',
    'use_google_signin': 'Please sign in with Google for this account',
    'redirecting': 'Redirecting...',
    'professional_fitness': 'Professional platform for managing training appointments',
    'sign_in_access': 'Sign in to access your dashboard',
    'terms_service': 'Terms of Service',
    'help_center': 'Help Center',
    'contact_us': 'Contact Us',
    'about': 'About',
    'personal_booking': 'Personal Booking Link',
    'get_started': 'Get Started',
    'contact_form_description': 'Leave your details and we\'ll get back to you with all the information about the system',
    'contact_success_message': 'Thank you for your inquiry! We\'ll get back to you within 24 hours.',
    'contact_error_message': 'An error occurred while submitting the request. Please try again later.',
    
    // Homepage translations
    'fitness_booking_system': 'Fitness Trainer Booking System',
    'login': 'Login',
    'advanced_booking_system': 'Simple Booking System',
    'for_fitness_trainers': 'For Fitness Trainers',
    'homepage_description': 'Professional platform for managing appointments with Google Calendar integration and client tracking. Make your training management simpler and more efficient than ever.',
    'why_choose_our_system': 'Why Choose Our System?',
    'everything_trainer_needs': 'Everything a fitness trainer needs in one place',
    'google_calendar_integration': 'Google Calendar Integration',
    'google_calendar_description': 'Automatic sync with your Google Calendar. Every new appointment appears instantly in your personal calendar with all relevant details.',
    'personal_booking_link': 'Personal Booking Link',
    'personal_link_description': 'Each trainer gets a unique personal link. Share it with your clients and they can book sessions directly without needing to register.',
    'advanced_management': 'Advanced Management',
    'advanced_management_description': 'Professional dashboard with tracking of all appointments, client details, and availability management. Everything in one accessible place.',
    'registered_trainers': 'Registered Trainers',
    'workouts_completed': 'Workouts Completed',
    'satisfaction_rate': 'Satisfaction Rate',
    'start_today': 'Start Today!',
    'join_many_trainers': 'Join many trainers who are already using the system and managing their business with maximum efficiency',
    'join_now_free': 'Join Now - Free',
    'copyright_2024': '© 2024 FitnessPro. All rights reserved.',
    
    // Testimonial translations
    'what_trainers_say': 'What Trainers Say',
    'testimonial_text': 'This system has been a game-changer for my business! My clients can book sessions directly through my link, everything syncs with my calendar automatically, and it saves me hours of coordination. It\'s simply the best and most efficient solution out there!',
    'testimonial_name': 'Yaron Hochman',
    'testimonial_title': 'Fitness Trainer, MVMNT Factory Akko',
    
    // Login page translations
    'continue_google': 'Continue with Google',
    'secure_login': 'Secure Login',
    'what_youll_get': 'What You\'ll Get',
    'calendar_integration': 'Automatic Calendar Sync',
    'client_management': 'Advanced Client Management',
    'session_tracking': 'Session Tracking',
    'trainer_login': 'Trainer Login',
    'welcome_back': 'Welcome Back',
    'sign_in_continue': 'Sign in to continue',
    'google_calendar_sync': 'Google Calendar Sync',
    'manage_appointments': 'Manage Appointments',
    'track_clients': 'Track Clients',
    'easy_scheduling': 'Easy Scheduling',
    'professional_dashboard': 'Professional Dashboard',
    'instant_notifications': 'Instant Notifications',
    'secure_data': 'Secure Data',
    'mobile_friendly': 'Mobile Friendly',
    'quick_setup': 'Quick Setup',
    'already_registered': 'Already registered? Great!',
    'new_here': 'New here?',
    'get_started': 'Let\'s get started',
    'loading': 'Loading...',
    'error': 'Error',
    'try_again': 'Try again',
    'contact_support': 'Contact support',
    
    // Booking page translations
    'book_session_with': 'Book Session with',
    'select_date_time': 'Select a date and time that works for you',
    'booking_appointment': 'Booking Appointment',
    'select_time_start_training': 'Choose the time that suits you and let\'s start training together!',
    'click_desired_date_time': 'Click on your desired date and time',
    'date': 'Date',
    'available_times': 'Available Times',
    'loading_available_times': 'Loading available times...',
    'no_available_times': 'No available times on this date',
    'booking_details': 'Booking Details',
    'fill_details_complete': 'Fill in the details to complete your booking',
    'session_summary': 'Session Summary',
    'time': 'Time',
    'trainer': 'Trainer',
    'full_name': 'Full Name',
    'your_name': 'Your name',
    'email_address': 'Email Address',
    'phone_number': 'Phone Number',
    'phone_placeholder': '555-123-4567',
    'sending_booking': 'Sending booking...',
    'book_session': 'Book Session',
    'booking_success': 'Booking sent successfully!',
    'booking_success_message': 'Your booking for',
    'at_time': 'at',
    'sent_to_trainer': 'has been sent to the trainer',
    'confirmation_email': 'You will receive confirmation soon at',
    'booking_error': 'Error creating booking'
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('he')
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    // Load language from localStorage on client side
    const savedLanguage = localStorage.getItem('language') as Language
    if (savedLanguage && (savedLanguage === 'he' || savedLanguage === 'en')) {
      setLanguage(savedLanguage)
    }
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang)
    }
  }

  const t = (key: string): string => {
    const translation = translations[language][key as keyof typeof translations[typeof language]]
    if (!translation) {
      console.warn(`Missing translation for key: ${key} in language: ${language}`)
      return key
    }
    return translation
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useTranslations() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useTranslations must be used within a LanguageProvider')
  }
  return context
}

export default function LanguageToggle() {
  const { language, setLanguage } = useTranslations()

  const handleToggle = () => {
    const newLang = language === 'he' ? 'en' : 'he'
    setLanguage(newLang)
  }

  return (
    <button
      onClick={handleToggle}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 12px',
        fontSize: '13px',
        fontWeight: '500',
        color: '#374151',
        backgroundColor: '#f3f4f6',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'all 0.2s'
      }}
      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
      onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
    >
      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
      </svg>
      {language === 'he' ? 'EN' : 'עב'}
    </button>
  )
}