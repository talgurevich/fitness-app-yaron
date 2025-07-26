// Google Analytics utility functions
declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: any) => void;
    dataLayer: any[];
  }
}

export const GA_TRACKING_ID = 'G-X6PPGMRH81'

// Track page views
export const trackPageView = (url: string, title?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_location: url,
      page_title: title,
    })
  }
}

// Track custom events
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// Track contact form submissions
export const trackContactFormSubmission = (email: string) => {
  trackEvent('form_submit', 'engagement', 'contact_form')
}

// Track booking interactions
export const trackBookingInteraction = (action: 'started' | 'completed' | 'cancelled') => {
  trackEvent('booking_interaction', 'conversion', action)
}

// Track login events
export const trackLogin = (method: 'google' | 'email') => {
  trackEvent('login', 'authentication', method)
}