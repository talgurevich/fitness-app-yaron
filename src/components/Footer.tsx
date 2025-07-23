// src/components/Footer.tsx
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          
          {/* Left side - Branding */}
          <div className="flex items-center mb-4 md:mb-0">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Trainer Booking</h3>
              <p className="text-sm text-gray-500">Professional fitness scheduling</p>
            </div>
          </div>

          {/* Center - Links */}
          <div className="flex flex-wrap justify-center gap-6 mb-4 md:mb-0">
            <Link 
              href="/privacy" 
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link 
              href="/terms" 
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Terms of Service
            </Link>
            <Link 
              href="/contact" 
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Contact
            </Link>
            <Link 
              href="/help" 
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Help
            </Link>
          </div>

          {/* Right side - Copyright */}
          <div className="text-center md:text-right">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Trainer Booking. All rights reserved.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Built with ❤️ for fitness professionals
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}