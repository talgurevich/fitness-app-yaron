'use client'
import { useTranslations } from '@/hooks/useTranslations'
import LanguageToggle from './LanguageToggle'

export default function Header() {
  const { t } = useTranslations()

  return (
    <header className="bg-white shadow-sm border px-3 py-3 sm:px-4 sm:py-4 flex justify-between items-center min-h-[56px] sm:min-h-[64px]">
      <div className="flex-1 min-w-0 mr-3">
        <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
          {t('fitness_coach')}
        </h1>
      </div>
      <div className="flex-shrink-0">
        <LanguageToggle />
      </div>
    </header>
  )
}