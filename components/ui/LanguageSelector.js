'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { Button } from '@/components/ui/button'
import { Globe, Check, ChevronDown } from 'lucide-react'

const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' }
]

export default function LanguageSelector({ variant = 'nav' }) {
  const { t } = useTranslation()
  const { currentLanguage, changeLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const currentLang = languages.find(lang => lang.code === currentLanguage)

  if (variant === 'onboarding') {
    return (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Globe className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">{t('language.title')}</h2>
          <p className="text-slate-600">{t('language.subtitle')}</p>
        </div>
        
        <div className="space-y-3">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => changeLanguage(language.code)}
              className={`w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between ${
                currentLanguage === language.code
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full border-2 ${
                  currentLanguage === language.code
                    ? 'border-emerald-500 bg-emerald-500'
                    : 'border-slate-300'
                }`}>
                  {currentLanguage === language.code && (
                    <Check className="w-2 h-2 text-white m-0.5" />
                  )}
                </div>
                <div className="text-left">
                  <p className="font-medium">{language.nativeName}</p>
                  <p className="text-sm text-slate-500">{language.name}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (variant === 'mobile') {
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-600 mb-2">{t('nav.language')}</p>
        <div className="flex space-x-2">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => changeLanguage(language.code)}
              className={`flex-1 p-2 rounded-lg border transition-all duration-200 ${
                currentLanguage === language.code
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 hover:border-emerald-300'
              }`}
            >
              <div className="text-center">
                <p className="text-sm font-medium">{language.nativeName}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="ghost"
        size="sm"
        className={`flex items-center space-x-2 ${
          variant === 'nav' 
            ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            : 'border border-slate-200 hover:border-emerald-300'
        } rounded-lg px-3 py-2 transition-all duration-200`}
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline font-medium">{currentLang?.nativeName}</span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
          <div className="px-3 py-2 text-xs font-medium text-slate-500 border-b border-slate-100">
            {t('nav.language')}
          </div>
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => {
                changeLanguage(language.code)
                setIsOpen(false)
              }}
              className="w-full px-3 py-2 text-left hover:bg-slate-50 transition-colors duration-150 flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-slate-700">{language.nativeName}</p>
                <p className="text-xs text-slate-500">{language.name}</p>
              </div>
              {currentLanguage === language.code && (
                <Check className="w-4 h-4 text-emerald-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
