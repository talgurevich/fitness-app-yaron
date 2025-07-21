'use client'
import { useTranslations } from '@/hooks/useTranslations'
import LanguageToggle from './LanguageToggle'

export default function Header() {
  const { t } = useTranslations()

  return (
    <header className="bg-white shadow-sm border p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-gray-900">
        {t('fitness_coach')}
      </h1>
      <LanguageToggle />
    </header>
  )
}
