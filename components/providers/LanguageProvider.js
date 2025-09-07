'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import '../../lib/i18n'

const LanguageContext = createContext()

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation()
  const [currentLanguage, setCurrentLanguage] = useState('en')

  useEffect(() => {
    // Load language from localStorage on mount
    const savedLanguage = localStorage.getItem('preferred-language')
    if (savedLanguage && ['en', 'hi'].includes(savedLanguage)) {
      setCurrentLanguage(savedLanguage)
      i18n.changeLanguage(savedLanguage)
    }
  }, [i18n])

  const changeLanguage = (language) => {
    if (['en', 'hi'].includes(language)) {
      setCurrentLanguage(language)
      i18n.changeLanguage(language)
      localStorage.setItem('preferred-language', language)
    }
  }

  const value = {
    currentLanguage,
    changeLanguage,
    isHindi: currentLanguage === 'hi',
    isEnglish: currentLanguage === 'en'
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}
