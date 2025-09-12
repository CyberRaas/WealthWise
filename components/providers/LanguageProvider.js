'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { detectUserLanguage } from '../../lib/languageDetection'
import { applyRTLStyles, isRTL } from '../../lib/rtlUtils'
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
    const initializeLanguage = async () => {
      // Load saved language from localStorage
      const savedLanguage = localStorage.getItem('language')
      if (savedLanguage && ['en', 'hi', 'es', 'fr', 'de', 'ja', 'zh', 'ar', 'he'].includes(savedLanguage)) {
         setCurrentLanguage(savedLanguage)
         i18n.changeLanguage(savedLanguage)
         applyRTLStyles(savedLanguage)
       } else {
        // Auto-detect language if no saved preference
        try {
          const detectedLanguage = await detectUserLanguage()
          if (detectedLanguage && ['en', 'hi', 'es', 'fr', 'de', 'ja', 'zh', 'ar', 'he'].includes(detectedLanguage)) {
             setCurrentLanguage(detectedLanguage)
             i18n.changeLanguage(detectedLanguage)
             localStorage.setItem('language', detectedLanguage)
             applyRTLStyles(detectedLanguage)
           }
        } catch (error) {
          console.log('Language detection failed, using default:', error)
          // Fallback to English if detection fails
           setCurrentLanguage('en')
           i18n.changeLanguage('en')
           applyRTLStyles('en')
        }
      }
    }

    initializeLanguage()
   }, [i18n])

  const changeLanguage = (language) => {
    if (['en', 'hi', 'es', 'fr', 'de', 'ja', 'zh', 'ar', 'he'].includes(language)) {
      setCurrentLanguage(language)
      i18n.changeLanguage(language)
      localStorage.setItem('language', language)
      
      // Apply RTL styles if needed
      if (typeof window !== 'undefined') {
        applyRTLStyles(language)
      }
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
