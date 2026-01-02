'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

const LanguageContext = createContext()

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

// Supported languages
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' }
]

// Get all domain variations for cookie setting
const getDomainVariations = () => {
  if (typeof window === 'undefined') return ['']

  const hostname = window.location.hostname

  // For localhost, just use empty domain
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return ['']
  }

  // For production domains, set cookies on multiple variations
  // Google Translate checks cookies on: hostname, .hostname, and root domain
  const parts = hostname.split('.')
  const domains = ['', hostname]

  // Add root domain with dot prefix (e.g., .mywealthwise.tech)
  if (parts.length >= 2) {
    const rootDomain = parts.slice(-2).join('.')
    domains.push('.' + rootDomain)
    domains.push(rootDomain)
  }

  // Add full hostname with dot prefix
  domains.push('.' + hostname)

  return [...new Set(domains)] // Remove duplicates
}

// Clear all Google Translate cookies on all domain variations
const clearGoogleTranslateCookies = () => {
  if (typeof document === 'undefined') return

  const domains = getDomainVariations()
  const paths = ['/', '']

  domains.forEach(domain => {
    paths.forEach(path => {
      const domainPart = domain ? ` domain=${domain};` : ''
      const pathPart = path ? ` path=${path};` : ' path=/;'
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC;${pathPart}${domainPart}`
    })
  })

  // Also try to clear without any domain/path
  document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC;'
}

// Set Google Translate cookie on all necessary domain variations
const setGoogleTranslateCookie = (langCode) => {
  if (typeof document === 'undefined') return

  const cookieValue = `/en/${langCode}`
  const domains = getDomainVariations()

  // Set cookie on all domain variations
  domains.forEach(domain => {
    const domainPart = domain ? ` domain=${domain};` : ''
    document.cookie = `googtrans=${cookieValue}; path=/;${domainPart}`
  })

  // Also set without domain for maximum compatibility
  document.cookie = `googtrans=${cookieValue}; path=/;`
}

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en')
  const [isLoaded, setIsLoaded] = useState(false)

  // Initialize - restore saved language and set up cookies
  useEffect(() => {
    const saved = localStorage.getItem('wealthwise-language')

    if (saved && saved !== 'en') {
      setCurrentLanguage(saved)
      // Ensure the cookie is set correctly for the saved language
      setGoogleTranslateCookie(saved)
    } else {
      // Default to English - clear any existing translation cookies
      clearGoogleTranslateCookies()
      localStorage.setItem('wealthwise-language', 'en')
    }

    setIsLoaded(true)
  }, [])

  // Load Google Translate script only when needed (not English)
  useEffect(() => {
    if (!isLoaded || currentLanguage === 'en') return

    // Remove existing script if language changed
    const existingScript = document.getElementById('gt-script')
    if (existingScript) {
      existingScript.remove()
    }

    // Ensure cookie is set before loading script
    setGoogleTranslateCookie(currentLanguage)

    const script = document.createElement('script')
    script.id = 'gt-script'
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
    script.async = true

    window.googleTranslateElementInit = () => {
      if (window.google?.translate) {
        new window.google.translate.TranslateElement({
          pageLanguage: 'en',
          includedLanguages: 'hi,ta,te,bn,mr,gu,kn,ml,pa',
          autoDisplay: false
        }, 'gt-element')
      }
    }

    document.body.appendChild(script)

    return () => {
      // Cleanup on unmount
      const scriptToRemove = document.getElementById('gt-script')
      if (scriptToRemove) {
        scriptToRemove.remove()
      }
    }
  }, [isLoaded, currentLanguage])

  // Function to change language
  const changeLanguage = (langCode) => {
    if (langCode === currentLanguage) return

    // Save to localStorage first
    localStorage.setItem('wealthwise-language', langCode)

    if (langCode === 'en') {
      // Clear all cookies for English
      clearGoogleTranslateCookies()
    } else {
      // First clear old cookies, then set new ones
      clearGoogleTranslateCookies()

      // Small delay to ensure cookies are cleared before setting new ones
      setTimeout(() => {
        setGoogleTranslateCookie(langCode)
        // Reload after cookies are set
        window.location.reload()
      }, 100)
      return // Don't reload immediately, wait for setTimeout
    }

    window.location.reload()
  }

  const value = {
    currentLanguage,
    changeLanguage,
    isLoaded,
    languages: SUPPORTED_LANGUAGES
  }

  return (
    <LanguageContext.Provider value={value}>
      {/* Hidden container for Google Translate - DO NOT REMOVE */}
      <div id="gt-element" style={{ display: 'none', position: 'absolute', left: '-9999px' }} />

      {children}

      {/* CSS to hide ALL Google Translate UI */}
      <style jsx global>{`
        /* HIDE EVERYTHING FROM GOOGLE TRANSLATE */
        #google_translate_element,
        .goog-te-banner-frame,
        .goog-te-balloon-frame,
        .goog-te-menu-frame,
        .goog-te-spinner-pos,
        .goog-te-gadget,
        .goog-te-gadget-simple,
        .goog-te-combo,
        #goog-gt-tt,
        .goog-tooltip,
        .skiptranslate,
        .VIpgJd-ZVi9od-ORHb-OEVmcd,
        .VIpgJd-ZVi9od-l4eHX-hSRGPd,
        .VIpgJd-ZVi9od-aZ2wEe-wOHMyf,
        .VIpgJd-ZVi9od-SmfZ-OEVmcd,
        .VIpgJd-suEOdc,
        [id^="goog-"],
        [class^="goog-"],
        [class*="skiptranslate"],
        iframe.goog-te-banner-frame,
        iframe.skiptranslate {
          display: none !important;
          visibility: hidden !important;
          height: 0 !important;
          width: 0 !important;
          opacity: 0 !important;
          position: absolute !important;
          top: -9999px !important;
          left: -9999px !important;
          pointer-events: none !important;
        }

        /* Fix body positioning */
        body {
          top: 0 !important;
          position: static !important;
          margin-top: 0 !important;
        }

        /* Fix translated text styling */
        font[style], font {
          background-color: transparent !important;
          box-shadow: none !important;
        }
      `}</style>
    </LanguageContext.Provider>
  )
}
