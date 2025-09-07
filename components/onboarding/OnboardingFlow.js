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
  { key: 'language', title: 'Language Selection', hindi: 'भाषा चुनें' },
  { key: 'income', title: 'Income Details', hindi: 'आय की जानकारी' },
  { key: 'demographics', title: 'Personal Details', hindi: 'व्यक्तिगत जानकारी' },
  { key: 'budget_generation', title: 'AI Budget Generation', hindi: 'AI बजट जेनरेशन' },
  { key: 'review', title: 'Review & Complete', hindi: 'समीक्षा और पूर्ण करें' }
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
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-emerald-700 to-blue-800 bg-clip-text text-transparent">
              {t('onboarding.title')}
            </h1>
            <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50/50 px-4 py-2 text-sm font-semibold rounded-full">
              {t('onboarding.step', { current: currentStep + 1, total: ONBOARDING_STEPS.length })}
            </Badge>
          </div>
          
          <Progress value={progressPercentage} className="h-4 bg-emerald-100 rounded-full shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-700 ease-out rounded-full shadow-sm"
              style={{ width: `${progressPercentage}%` }}
            />
          </Progress>
          
          <div className="flex justify-between mt-4 text-sm">
            {ONBOARDING_STEPS.map((step, index) => (
              <span 
                key={step.key}
                className={`transition-all duration-300 ${
                  index <= currentStep 
                    ? 'text-emerald-600 font-semibold' 
                    : 'text-slate-400 font-medium'
                }`}
              >
                {step.hindi}
              </span>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-xl ring-1 ring-slate-200/50 rounded-3xl overflow-hidden">
          <CardContent className="p-10">
            {currentStep === 0 && <LanguageStep />}
            {currentStep === 1 && <IncomeStep profile={profile} setProfile={setProfile} />}
            {currentStep === 2 && <DemographicsStep profile={profile} setProfile={setProfile} />}
            {currentStep === 3 && <BudgetGenerationStep isGenerating={isGeneratingBudget} />}
            {currentStep === 4 && <ReviewStep profile={profile} budget={generatedBudget} />}
          </CardContent>
          
          {/* Navigation */}
          <div className="flex justify-between items-center px-10 pb-10">
            <Button
              onClick={handleBack}
              disabled={currentStep === 0 || loading}
              variant="outline"
              className="border-2 border-slate-200 hover:border-emerald-300 text-slate-600 hover:text-emerald-600 font-semibold px-6 py-3 rounded-xl transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('onboarding.back')}
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={loading || isGeneratingBudget}
              className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-700 hover:via-teal-700 hover:to-blue-700 text-white font-bold px-8 py-3 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading || isGeneratingBudget ? (
                <div className="flex items-center">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  <span>{isGeneratingBudget ? t('onboarding.generating') : t('onboarding.processing')}</span>
                </div>
              ) : (
                <>
                  {currentStep === ONBOARDING_STEPS.length - 1 ? t('onboarding.complete') : t('onboarding.next')}
                  <ArrowRight className="w-4 h-4 ml-2" />
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
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Coins className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">{t('income.title')}</h2>
        <p className="text-slate-600">{t('income.subtitle')}</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            {t('income.monthly_income_required')}
          </label>
          <Input
            type="number"
            placeholder={t('income.placeholder')}
            value={profile.monthlyIncome}
            onChange={(e) => setProfile(prev => ({ ...prev, monthlyIncome: e.target.value }))}
            className="h-12 text-lg"
            min="1000"
            step="1000"
          />
          <p className="text-xs text-slate-500 mt-1">{t('income.minimum')}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            {t('income.income_source')}
          </label>
          <Select value={profile.incomeSource} onValueChange={(value) => setProfile(prev => ({ ...prev, incomeSource: value }))}>
            <SelectTrigger className="h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INCOME_SOURCES.map(source => (
                <SelectItem key={source.value} value={source.value}>
                  <div className="flex items-center space-x-2">
                    <span>{t(`income.sources.${source.value}`)}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

// Demographics Step Component
function DemographicsStep({ profile, setProfile }) {
  const { t } = useTranslation()
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">{t('demographics.title')}</h2>
        <p className="text-slate-600">{t('demographics.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            {t('demographics.city_required')}
          </label>
          <Select value={profile.city} onValueChange={(value) => setProfile(prev => ({ ...prev, city: value }))}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder={t('demographics.city_placeholder')} />
            </SelectTrigger>
            <SelectContent>
              {INDIAN_CITIES.map(city => (
                <SelectItem key={city} value={city}>{city}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <Users className="w-4 h-4 inline mr-1" />
            {t('demographics.family_size_required')}
          </label>
          <Input
            type="number"
            placeholder={t('demographics.family_placeholder')}
            value={profile.familySize}
            onChange={(e) => setProfile(prev => ({ ...prev, familySize: e.target.value }))}
            className="h-12"
            min="1"
            max="20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            {t('demographics.age_required')}
          </label>
          <Input
            type="number"
            placeholder={t('demographics.age_placeholder')}
            value={profile.age}
            onChange={(e) => setProfile(prev => ({ ...prev, age: e.target.value }))}
            className="h-12"
            min="18"
            max="100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <Briefcase className="w-4 h-4 inline mr-1" />
            {t('demographics.occupation')}
          </label>
          <Input
            type="text"
            placeholder={t('demographics.occupation_placeholder')}
            value={profile.occupation}
            onChange={(e) => setProfile(prev => ({ ...prev, occupation: e.target.value }))}
            className="h-12"
          />
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
