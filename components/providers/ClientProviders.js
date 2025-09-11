'use client'

import { SessionProvider } from 'next-auth/react'
import { LanguageProvider } from '@/components/providers/LanguageProvider'
import { ProfileProvider } from '@/contexts/ProfileContext'
import ToastProvider from '@/components/providers/ToastProvider'

export default function ClientProviders({ children }) {
  return (
    <SessionProvider>
      <LanguageProvider>
        <ProfileProvider>
          {children}
          <ToastProvider />
        </ProfileProvider>
      </LanguageProvider>
    </SessionProvider>
  )
}
