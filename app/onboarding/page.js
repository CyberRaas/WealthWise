'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import OnboardingFlow from '@/components/onboarding/OnboardingFlow'
import Logo from '@/components/ui/Logo'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function OnboardingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [checkingOnboarding, setCheckingOnboarding] = useState(true)
  const [onboardingComplete, setOnboardingComplete] = useState(false)

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        console.log('Checking onboarding status...')
        const response = await fetch('/api/onboarding', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          console.log('Onboarding API response:', { status: response.status, data })
          
          if (data.profile) {
            // Check if onboarding is complete
            const isComplete = data.profile.onboardingCompleted && data.profile.onboardingProgress >= 100
            
            if (isComplete) {
              console.log('Onboarding is complete, redirecting to dashboard')
              router.replace('/dashboard')
              return
            }
          }
        } else {
          console.log('Onboarding API returned error status:', response.status)
        }
      } catch (error) {
        console.error('Failed to check onboarding status:', error)
      }
      setCheckingOnboarding(false)
    }

    if (status === 'unauthenticated') {
      router.push('/auth/signin?message=login-required')
      return
    }

    if (status === 'authenticated' && session?.user) {
      checkOnboardingStatus()
    }
  }, [status, session, router])

  if (status === 'loading' || checkingOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">
            {checkingOnboarding ? 'Checking your profile...' : 'Setting up your experience...'}
          </h2>
          <p className="text-slate-600">Please wait while we prepare your profile</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated' || onboardingComplete) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Modern Header with Glass Effect */}
      <div className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex items-center justify-between">
            {/* Logo Section */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl blur-sm opacity-50"></div>
                <Logo size="xlarge" className="relative" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base sm:text-lg font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                  WealthWise
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">Smart Financial Planning</p>
              </div>
            </div>

            {/* User Welcome Section */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="text-right">
                <p className="text-xs sm:text-sm text-slate-600 hidden sm:block">Welcome back,</p>
                <p className="text-sm sm:text-base font-semibold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                  {session?.user?.name?.split(' ')[0] || 'User'}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg">
                {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section - Only show on first step */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-6 sm:pb-8">
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-100 to-blue-100 text-emerald-700 rounded-full px-4 sm:px-6 py-2 sm:py-2.5 mb-4 sm:mb-6 shadow-sm">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-xs sm:text-sm font-semibold">Let's Get Started</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-6">
            <span className="bg-gradient-to-r from-emerald-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Your Financial Journey
            </span>
            <br className="hidden sm:block" />
            <span className="text-gray-800">Starts Here</span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-6 sm:mb-8 leading-relaxed px-4">
            Answer a few quick questions and let our AI create a personalized budget 
            that fits your lifestyle and helps you achieve your financial goals.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-10 px-4">
            <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-3 sm:px-4 py-2 shadow-sm border border-gray-200">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-xs sm:text-sm font-medium text-gray-700">AI-Powered</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-3 sm:px-4 py-2 shadow-sm border border-gray-200">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-xs sm:text-sm font-medium text-gray-700">Personalized</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-3 sm:px-4 py-2 shadow-sm border border-gray-200">
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              <span className="text-xs sm:text-sm font-medium text-gray-700">Takes 2 Minutes</span>
            </div>
          </div>

          {/* Visual Progress Indicator */}
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">Setup Progress</span>
              <span className="text-sm font-bold text-emerald-600">0%</span>
            </div>
            <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full transition-all duration-500" style={{ width: '0%' }}></div>
            </div>
          </div>
        </div>
      </div>
      
      <OnboardingFlow />
    </div>
  )
}
