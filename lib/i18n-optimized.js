// Optimized i18n system with lazy loading
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Base common translations loaded immediately
const baseTranslations = {
  en: {
    translation: {
      // Navigation
      "nav.features": "Features",
      "nav.about": "About",
      "nav.contact": "Contact",
      "nav.signin": "Sign In",
      "nav.signup": "Get Started",
      "nav.dashboard": "Dashboard",
      "nav.language": "Language",

      // Common UI
      "common.save": "Save",
      "common.cancel": "Cancel",
      "common.loading": "Loading...",
      "common.error": "Error",
      "common.success": "Success",
      "common.close": "Close",
      "common.edit": "Edit",
      "common.delete": "Delete",
      "common.add": "Add",
      "common.submit": "Submit",
      "common.confirm": "Confirm",

      // Dashboard basics
      "dashboard.welcome": "Welcome",
      "dashboard.overview": "Overview",
      "dashboard.loading": "Loading your dashboard...",
    }
  },
  hi: {
    translation: {
      // Navigation
      "nav.features": "सुविधाएं",
      "nav.about": "हमारे बारे में",
      "nav.contact": "संपर्क",
      "nav.signin": "साइन इन करें",
      "nav.signup": "शुरू करें",
      "nav.dashboard": "डैशबोर्ड",
      "nav.language": "भाषा",

      // Common UI
      "common.save": "सहेजें",
      "common.cancel": "रद्द करें",
      "common.loading": "लोड हो रहा है...",
      "common.error": "त्रुटि",
      "common.success": "सफलता",
      "common.close": "बंद करें",
      "common.edit": "संपादित करें",
      "common.delete": "हटाएं",
      "common.add": "जोड़ें",
      "common.submit": "जमा करें",
      "common.confirm": "पुष्टि करें",

      // Dashboard basics
      "dashboard.welcome": "स्वागत है",
      "dashboard.overview": "अवलोकन",
      "dashboard.loading": "आपका डैशबोर्ड लोड हो रहा है...",
    }
  },
  hinglish: {
    translation: {
      // Navigation
      "nav.features": "Features",
      "nav.about": "About",
      "nav.contact": "Contact",
      "nav.signin": "Sign In",
      "nav.signup": "Shuru Kariye",
      "nav.dashboard": "Dashboard",
      "nav.language": "Language",

      // Common UI
      "common.save": "Save Kariye",
      "common.cancel": "Cancel",
      "common.loading": "Load ho raha hai...",
      "common.error": "Error",
      "common.success": "Success",
      "common.close": "Close",
      "common.edit": "Edit",
      "common.delete": "Delete",
      "common.add": "Add",
      "common.submit": "Submit",
      "common.confirm": "Confirm",

      // Dashboard basics
      "dashboard.welcome": "Welcome",
      "dashboard.overview": "Overview",
      "dashboard.loading": "Aapka dashboard load ho raha hai...",
    }
  }
}

// Lazy loading function for module-specific translations
const loadNamespaceTranslations = async (namespace, language = 'en') => {
  try {
    const module = await import(`../translations/${language}/${namespace}.js`)
    return module.default
  } catch (error) {
    console.warn(`Failed to load ${namespace} translations for ${language}:`, error)
    return {}
  }
}

// Add translations to existing i18n instance
export const addTranslations = async (namespace, language = 'en') => {
  const translations = await loadNamespaceTranslations(namespace, language)

  if (Object.keys(translations).length > 0) {
    i18n.addResourceBundle(language, 'translation', translations, true, true)
  }
}

// Initialize with base translations
i18n
  .use(initReactI18next)
  .init({
    resources: baseTranslations,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    }
  })

export default i18n