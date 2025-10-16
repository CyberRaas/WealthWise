'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useTranslation } from 'react-i18next'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import LanguageSelector from '@/components/ui/LanguageSelector'
import {
  ArrowRight,
  ArrowLeft,
  Coins,
  MapPin,
  Users,
  User,
  Briefcase,
  Loader2,
  CheckCircle,
  TrendingUp,
  PieChart,
  Target
} from 'lucide-react'
import toast from 'react-hot-toast'

// Indian cities for autocomplete
const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Ahmedabad',
  'Kolkata', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane',
  'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara', 'Ghaziabad'
]

const INCOME_SOURCES = [
  { value: 'salary', label: 'Salary (Job)' },
  { value: 'business', label: 'Business' },
  { value: 'freelance', label: 'Freelancing' },
  { value: 'other', label: 'Other' }
]

const ONBOARDING_STEPS = [
  { key: 'language', title: 'Language', shortTitle: 'Language', icon: '🌐' },
  { key: 'income', title: 'Income Details', shortTitle: 'Income', icon: '💰' },
  { key: 'demographics', title: 'Personal Info', shortTitle: 'Personal', icon: '👤' },
  { key: 'budget_generation', title: 'AI Budget', shortTitle: 'Budget', icon: '🤖' },
  { key: 'review', title: 'Review', shortTitle: 'Review', icon: '✓' }
]

export default function OnboardingFlow() {
  const { data: session, status } = useSession()
  const { t } = useTranslation()
  const { currentLanguage, changeLanguage } = useLanguage()
  const router = useRouter()

  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState({
    monthlyIncome: '',
    incomeSource: 'salary',
    city: '',
    familySize: '',
    age: '',
    occupation: '',
    budgetPreferences: {
      language: 'hinglish',
      notifications: true
    }
  })
  const [generatedBudget, setGeneratedBudget] = useState(null)
  const [isGeneratingBudget, setIsGeneratingBudget] = useState(false)

  // Load existing profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch('/api/onboarding')
        if (response.ok) {
          const profile = await response.json()
          if (profile) {
            setProfile(profile)
            // Skip to the last incomplete step
            const lastStep = ONBOARDING_STEPS.findIndex(step => !profile[step.key + '_completed'])
            if (lastStep !== -1) {
              setCurrentStep(lastStep)
            } else {
              // All steps completed, go to review
              setCurrentStep(ONBOARDING_STEPS.length - 1)
            }
          }
        }
      } catch (error) {
        console.error('Failed to load profile:', error)
        // Continue with onboarding if loading fails
      } finally {
        setLoading(false)
      }
    }

    if (status === 'authenticated') {
      loadProfile()
    }
  }, [status])

  const updateProfile = async (stepKey, stepData) => {
    setLoading(true)
    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: stepKey, data: stepData })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update profile')
      }

      setProfile(prev => ({ ...prev, ...result.profile }))
      return true
    } catch (error) {
      toast.error(error.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  const generateBudget = async () => {
    setIsGeneratingBudget(true)
    try {
      console.log('Generating budget for onboarding...')
      const response = await fetch('/api/budget/generate', {
        method: 'POST'
      })

      const result = await response.json()
      console.log('Budget generation response:', { success: response.ok, hasBudget: !!result.budget, hasCategories: !!result.budget?.categories })

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate budget')
      }

      if (!result.budget || !result.budget.categories) {
        throw new Error('Invalid budget structure received')
      }

      setGeneratedBudget(result.budget)
      toast.success('Budget generated successfully! 🎉')
      return true
    } catch (error) {
      console.error('Budget generation error:', error)
      toast.error(`Budget generation failed: ${error.message}`)
      return false
    } finally {
      setIsGeneratingBudget(false)
    }
  }

  const handleNext = async () => {
    const step = ONBOARDING_STEPS[currentStep]

    switch (step.key) {
      case 'language':
        // Language selection is handled by the LanguageSelector component
        // Just move to the next step
        setCurrentStep(1)
        break

      case 'income':
        if (!profile.monthlyIncome || profile.monthlyIncome < 1000) {
          toast.error(t('income.validation'))
          return
        }

        const incomeSuccess = await updateProfile('income', {
          monthlyIncome: parseInt(profile.monthlyIncome),
          incomeSource: profile.incomeSource
        })

        if (incomeSuccess) {
          setCurrentStep(2)
        }
        break

      case 'demographics':
        if (!profile.city || !profile.familySize || !profile.age) {
          toast.error(t('demographics.validation'))
          return
        }

        const demoSuccess = await updateProfile('demographics', {
          city: profile.city,
          familySize: parseInt(profile.familySize),
          age: parseInt(profile.age),
          occupation: profile.occupation
        })

        if (demoSuccess) {
          setCurrentStep(3)
        }
        break

      case 'budget_generation':
        const budgetSuccess = await generateBudget()
        if (budgetSuccess) {
          setCurrentStep(4)
        }
        break

      case 'review':
        const completeSuccess = await updateProfile('complete', {})
        if (completeSuccess) {
          toast.success('Onboarding completed! Welcome to WealthWise! 🎉')
          router.push('/dashboard')
        }
        break
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin')
    return null
  }

  const progressPercentage = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Progress Header */}
        {/* Modern Progress Stepper */}
        <div className="mb-12">
          {/* Header with Step Counter */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent mb-2">
                {ONBOARDING_STEPS[currentStep].title}
              </h1>
              <p className="text-slate-600 text-sm sm:text-base">Complete your profile in just a few steps</p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 text-sm font-bold rounded-full shadow-lg">
                Step {currentStep + 1} of {ONBOARDING_STEPS.length}
              </Badge>
            </div>
          </div>

          {/* Interactive Step Indicator */}
          <div className="relative">
            {/* Progress Bar Background */}
            <div className="absolute top-6 left-0 right-0 h-1 bg-slate-200 rounded-full"></div>
            {/* Animated Progress Bar */}
            <div
              className="absolute top-6 left-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 rounded-full transition-all duration-700 ease-out shadow-lg"
              style={{ width: `${progressPercentage}%` }}
            ></div>

            {/* Step Nodes */}
            <div className="relative flex justify-between">
              {ONBOARDING_STEPS.map((step, index) => {
                const isCompleted = index < currentStep
                const isCurrent = index === currentStep
                const isUpcoming = index > currentStep

                return (
                  <div key={step.key} className="flex flex-col items-center group">
                    {/* Step Circle */}
                    <div
                      className={`
                        relative w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold
                        transition-all duration-500 transform
                        ${isCurrent ? 'scale-125 shadow-2xl' : 'scale-100'}
                        ${isCompleted
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-xl ring-4 ring-emerald-100'
                          : isCurrent
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-2xl ring-4 ring-blue-200 animate-pulse'
                            : 'bg-white border-2 border-slate-300 text-slate-400'
                        }
                      `}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <span>{step.icon}</span>
                      )}

                      {/* Pulse Animation for Current Step */}
                      {isCurrent && (
                        <span className="absolute inset-0 rounded-full bg-blue-400 opacity-75 animate-ping"></span>
                      )}
                    </div>

                    {/* Step Label */}
                    <div className="mt-3 text-center">
                      <p
                        className={`
                          text-xs sm:text-sm font-semibold transition-all duration-300
                          ${isCurrent
                            ? 'text-blue-600 scale-105'
                            : isCompleted
                              ? 'text-emerald-600'
                              : 'text-slate-400'
                          }
                        `}
                      >
                        {step.shortTitle}
                      </p>
                      {/* Active Indicator */}
                      {isCurrent && (
                        <div className="mt-1 w-1 h-1 bg-blue-500 rounded-full mx-auto animate-bounce"></div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Step Content Card */}
        <Card className="shadow-2xl border-0 bg-white backdrop-blur-xl rounded-3xl overflow-hidden transform transition-all duration-300 hover:shadow-3xl">
          <CardContent className="p-8 sm:p-12">
            <div className="min-h-[400px]">
              {currentStep === 0 && <LanguageStep />}
              {currentStep === 1 && <IncomeStep profile={profile} setProfile={setProfile} />}
              {currentStep === 2 && <DemographicsStep profile={profile} setProfile={setProfile} />}
              {currentStep === 3 && <BudgetGenerationStep isGenerating={isGeneratingBudget} />}
              {currentStep === 4 && <ReviewStep profile={profile} budget={generatedBudget} />}
            </div>
          </CardContent>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center px-8 sm:px-12 pb-8 sm:pb-10 border-t border-slate-100 pt-6">
            <Button
              onClick={handleBack}
              disabled={currentStep === 0 || loading}
              variant="outline"
              className="group border-2 border-slate-300 hover:border-emerald-500 text-slate-700 hover:text-emerald-600 font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
              Back
            </Button>

            <Button
              onClick={handleNext}
              disabled={loading || isGeneratingBudget}
              className="group bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-700 hover:via-teal-700 hover:to-blue-700 text-white font-bold px-8 py-3 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading || isGeneratingBudget ? (
                <div className="flex items-center">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  <span>{isGeneratingBudget ? 'Generating...' : 'Processing...'}</span>
                </div>
              ) : (
                <>
                  <span>{currentStep === ONBOARDING_STEPS.length - 1 ? 'Complete Setup' : 'Next Step'}</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

// Language Step Component
function LanguageStep() {
  return <LanguageSelector variant="onboarding" />
}

// Income Step Component
function IncomeStep({ profile, setProfile }) {
  const { t } = useTranslation()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
          <div className="relative w-full h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-xl">
            <Coins className="w-10 h-10 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-3">Income Details</h2>
        <p className="text-slate-600 text-lg">Tell us about your monthly earnings</p>
      </div>

      {/* Form Fields */}
      <div className="space-y-6 max-w-2xl mx-auto">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            💰 Monthly Income (Required)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg font-semibold">₹</span>
            <Input
              type="number"
              placeholder="50,000"
              value={profile.monthlyIncome}
              onChange={(e) => setProfile(prev => ({ ...prev, monthlyIncome: e.target.value }))}
              className="h-14 pl-10 text-lg font-medium border-2 border-slate-200 focus:border-emerald-500 rounded-xl transition-all duration-300 hover:border-slate-300"
              min="1000"
              step="1000"
            />
          </div>
          <p className="text-xs text-slate-500 mt-2 flex items-center">
            <span className="w-1 h-1 bg-slate-400 rounded-full mr-2"></span>
            Minimum ₹1,000 required
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            💼 Income Source
          </label>
          <Select value={profile.incomeSource} onValueChange={(value) => setProfile(prev => ({ ...prev, incomeSource: value }))}>
            <SelectTrigger className="h-14 border-2 border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-xl transition-all duration-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {INCOME_SOURCES.map(source => (
                <SelectItem
                  key={source.value}
                  value={source.value}
                  className="cursor-pointer hover:bg-emerald-50 rounded-lg"
                >
                  {source.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Info Card */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm">ℹ️</span>
            </div>
            <div>
              <p className="text-sm text-emerald-900 font-medium mb-1">Why we need this?</p>
              <p className="text-xs text-emerald-700">Your income helps us create a personalized budget that matches your financial situation and goals.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Demographics Step Component
function DemographicsStep({ profile, setProfile }) {
  const { t } = useTranslation()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-500 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
          <div className="relative w-full h-full bg-gradient-to-r from-teal-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-xl">
            <User className="w-10 h-10 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-3">Personal Information</h2>
        <p className="text-slate-600 text-lg">Help us personalize your experience</p>
      </div>

      {/* Form Fields */}
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* City */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              <MapPin className="w-4 h-4 inline mr-1" />
              City (Required)
            </label>
            <Select value={profile.city} onValueChange={(value) => setProfile(prev => ({ ...prev, city: value }))}>
              <SelectTrigger className="h-14 border-2 border-slate-200 hover:border-slate-300 focus:border-teal-500 rounded-xl transition-all duration-300">
                <SelectValue placeholder="Select your city" />
              </SelectTrigger>
              <SelectContent className="rounded-xl max-h-[300px]">
                {INDIAN_CITIES.map(city => (
                  <SelectItem
                    key={city}
                    value={city}
                    className="cursor-pointer hover:bg-teal-50 rounded-lg"
                  >
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Family Size */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              <Users className="w-4 h-4 inline mr-1" />
              Family Size (Required)
            </label>
            <Input
              type="number"
              placeholder="e.g., 4"
              value={profile.familySize}
              onChange={(e) => setProfile(prev => ({ ...prev, familySize: e.target.value }))}
              className="h-14 text-lg font-medium border-2 border-slate-200 focus:border-teal-500 rounded-xl transition-all duration-300 hover:border-slate-300"
              min="1"
              max="20"
            />
          </div>

          {/* Age */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              📅 Age (Required)
            </label>
            <Input
              type="number"
              placeholder="e.g., 30"
              value={profile.age}
              onChange={(e) => setProfile(prev => ({ ...prev, age: e.target.value }))}
              className="h-14 text-lg font-medium border-2 border-slate-200 focus:border-teal-500 rounded-xl transition-all duration-300 hover:border-slate-300"
              min="18"
              max="100"
            />
          </div>

          {/* Occupation */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              <Briefcase className="w-4 h-4 inline mr-1" />
              Occupation (Optional)
            </label>
            <Input
              type="text"
              placeholder="e.g., Software Engineer"
              value={profile.occupation}
              onChange={(e) => setProfile(prev => ({ ...prev, occupation: e.target.value }))}
              className="h-14 text-lg font-medium border-2 border-slate-200 focus:border-teal-500 rounded-xl transition-all duration-300 hover:border-slate-300"
            />
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-2xl p-4 mt-6">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm">🔒</span>
            </div>
            <div>
              <p className="text-sm text-teal-900 font-medium mb-1">Your data is secure</p>
              <p className="text-xs text-teal-700">We use this information only to create accurate financial recommendations tailored to your location and lifestyle.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Budget Generation Step Component
function BudgetGenerationStep({ isGenerating }) {
  const { t } = useTranslation()

  return (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto">
        {isGenerating ? (
          <Loader2 className="w-10 h-10 text-white animate-spin" />
        ) : (
          <PieChart className="w-10 h-10 text-white" />
        )}
      </div>

      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">{t('budget.title')}</h2>
        <p className="text-slate-600 mb-6">
          {isGenerating
            ? t('budget.generating')
            : t('budget.subtitle')
          }
        </p>
      </div>

      {isGenerating && (
        <div className="space-y-3">
          <div className="text-sm text-slate-500">{t('budget.understanding')}</div>
          <div className="text-sm text-slate-500">{t('budget.matching')}</div>
          <div className="text-sm text-slate-500">{t('budget.creating')}</div>
        </div>
      )}

      <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-6">
        <h3 className="font-semibold text-slate-800 mb-3">{t('budget.features.title')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-600">
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-emerald-600" />
            <span>{t('budget.features.categories')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <PieChart className="w-4 h-4 text-teal-600" />
            <span>{t('budget.features.breakdown')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span>{t('budget.features.recommendations')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{t('budget.features.explanations')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Review Step Component  
function ReviewStep({ profile, budget }) {
  const { t } = useTranslation()

  if (!budget) {
    return (
      <div className="text-center">
        <p className="text-slate-600">Budget not generated yet. Please go back and generate your budget.</p>
      </div>
    )
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">{t('review.title')}</h2>
        <p className="text-slate-600">{t('review.subtitle')}</p>
      </div>

      {/* Budget Overview */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">{t('review.overview')}</h3>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-sm text-slate-600">{t('review.total_budget')}</p>
            <p className="text-2xl font-bold text-slate-800">{formatCurrency(budget.totalBudget)}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600">{t('review.monthly_savings')}</p>
            <p className="text-2xl font-bold text-emerald-600">
              {formatCurrency(budget.categories?.savings?.amount || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-800">{t('review.category_breakdown')}</h3>
        {budget.categories && Object.entries(budget.categories).map(([key, category]) => (
          <div key={key} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{category.emoji}</span>
              <div>
                <p className="font-medium text-slate-800">{category.hinglishName}</p>
                <p className="text-sm text-slate-600">{category.englishName}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-slate-800">{formatCurrency(category.amount)}</p>
              <p className="text-sm text-slate-500">{category.percentage}%</p>
            </div>
          </div>
        ))}
      </div>

      {/* Profile Summary */}
      <div className="bg-slate-50 rounded-xl p-6 border">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">{t('review.profile_summary')}</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-600">{t('review.income')}</span>
            <span className="ml-2 font-medium">{formatCurrency(profile.monthlyIncome)}</span>
          </div>
          <div>
            <span className="text-slate-600">{t('review.city')}</span>
            <span className="ml-2 font-medium">{profile.city}</span>
          </div>
          <div>
            <span className="text-slate-600">{t('review.family_size')}</span>
            <span className="ml-2 font-medium">
              {t('review.members', { count: profile.familySize })}
              {profile.familySize > 1 ? t('review.members_plural', { count: profile.familySize }) : ''}
            </span>
          </div>
          <div>
            <span className="text-slate-600">{t('review.age')}</span>
            <span className="ml-2 font-medium">{t('review.years', { count: profile.age })}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
