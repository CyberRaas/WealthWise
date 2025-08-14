'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
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
  { value: 'salary', label: 'Salary (Job)', hindi: 'नौकरी' },
  { value: 'business', label: 'Business', hindi: 'व्यापार' },
  { value: 'freelance', label: 'Freelancing', hindi: 'फ्रीलांसिंग' },
  { value: 'other', label: 'Other', hindi: 'अन्य' }
]

const ONBOARDING_STEPS = [
  { key: 'income', title: 'Income Details', hindi: 'आय की जानकारी' },
  { key: 'demographics', title: 'Personal Details', hindi: 'व्यक्तिगत जानकारी' },
  { key: 'budget_generation', title: 'AI Budget Generation', hindi: 'AI बजट जेनरेशन' },
  { key: 'review', title: 'Review & Complete', hindi: 'समीक्षा और पूर्ण करें' }
]

export default function OnboardingFlow() {
  const { data: session, status } = useSession()
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
      case 'income':
        if (!profile.monthlyIncome || profile.monthlyIncome < 1000) {
          toast.error('Please enter a valid monthly income (minimum ₹1,000)')
          return
        }
        
        const incomeSuccess = await updateProfile('income', {
          monthlyIncome: parseInt(profile.monthlyIncome),
          incomeSource: profile.incomeSource
        })
        
        if (incomeSuccess) {
          setCurrentStep(1)
        }
        break

      case 'demographics':
        if (!profile.city || !profile.familySize || !profile.age) {
          toast.error('Please fill all required fields')
          return
        }
        
        const demoSuccess = await updateProfile('demographics', {
          city: profile.city,
          familySize: parseInt(profile.familySize),
          age: parseInt(profile.age),
          occupation: profile.occupation
        })
        
        if (demoSuccess) {
          setCurrentStep(2)
        }
        break

      case 'budget_generation':
        const budgetSuccess = await generateBudget()
        if (budgetSuccess) {
          setCurrentStep(3)
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
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-emerald-700 to-blue-800 bg-clip-text text-transparent">
              Setup Your Smart Budget
            </h1>
            <Badge variant="outline" className="border-emerald-200 text-emerald-700">
              Step {currentStep + 1} of {ONBOARDING_STEPS.length}
            </Badge>
          </div>
          
          <Progress value={progressPercentage} className="h-3 bg-emerald-100">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </Progress>
          
          <div className="flex justify-between mt-2 text-sm text-slate-600">
            {ONBOARDING_STEPS.map((step, index) => (
              <span 
                key={step.key}
                className={`${index <= currentStep ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}
              >
                {step.hindi}
              </span>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="shadow-xl border border-emerald-100/50 bg-white/90 backdrop-blur-xl">
          <CardContent className="p-8">
            {currentStep === 0 && <IncomeStep profile={profile} setProfile={setProfile} />}
            {currentStep === 1 && <DemographicsStep profile={profile} setProfile={setProfile} />}
            {currentStep === 2 && <BudgetGenerationStep isGenerating={isGeneratingBudget} />}
            {currentStep === 3 && <ReviewStep profile={profile} budget={generatedBudget} />}
          </CardContent>
          
          {/* Navigation */}
          <div className="flex justify-between items-center px-8 pb-8">
            <Button
              onClick={handleBack}
              disabled={currentStep === 0 || loading}
              variant="outline"
              className="border-slate-200 hover:border-emerald-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={loading || isGeneratingBudget}
              className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-700 hover:via-teal-700 hover:to-blue-700"
            >
              {loading || isGeneratingBudget ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <>
                  {currentStep === ONBOARDING_STEPS.length - 1 ? 'Complete' : 'Next'}
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

// Income Step Component
function IncomeStep({ profile, setProfile }) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Coins className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">आपकी महीने की कमाई कितनी है?</h2>
        <p className="text-slate-600">Tell us your monthly income to create a personalized budget</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Monthly Income (₹) <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            placeholder="Enter your monthly income"
            value={profile.monthlyIncome}
            onChange={(e) => setProfile(prev => ({ ...prev, monthlyIncome: e.target.value }))}
            className="h-12 text-lg"
            min="1000"
            step="1000"
          />
          <p className="text-xs text-slate-500 mt-1">Minimum ₹1,000 required</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Income Source
          </label>
          <Select value={profile.incomeSource} onValueChange={(value) => setProfile(prev => ({ ...prev, incomeSource: value }))}>
            <SelectTrigger className="h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INCOME_SOURCES.map(source => (
                <SelectItem key={source.value} value={source.value}>
                  <div className="flex items-center space-x-2">
                    <span>{source.label}</span>
                    <span className="text-slate-500">({source.hindi})</span>
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
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">व्यक्तिगत जानकारी</h2>
        <p className="text-slate-600">Help us understand your lifestyle for better budgeting</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            City <span className="text-red-500">*</span>
          </label>
          <Select value={profile.city} onValueChange={(value) => setProfile(prev => ({ ...prev, city: value }))}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select your city" />
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
            Family Size <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            placeholder="Number of family members"
            value={profile.familySize}
            onChange={(e) => setProfile(prev => ({ ...prev, familySize: e.target.value }))}
            className="h-12"
            min="1"
            max="20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Age <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            placeholder="Your age"
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
            Occupation (Optional)
          </label>
          <Input
            type="text"
            placeholder="Your profession"
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
        <h2 className="text-2xl font-bold text-slate-800 mb-2">AI Budget Generation</h2>
        <p className="text-slate-600 mb-6">
          {isGenerating 
            ? 'Creating your personalized budget based on Indian spending patterns...'
            : 'Ready to generate your AI-powered budget tailored for your lifestyle'
          }
        </p>
      </div>

      {isGenerating && (
        <div className="space-y-3">
          <div className="text-sm text-slate-500">समझ रहे हैं आपकी जरूरतें...</div>
          <div className="text-sm text-slate-500">भारतीय डेटा से मिला रहे हैं...</div>
          <div className="text-sm text-slate-500">आपका स्मार्ट बजट बना रहे हैं...</div>
        </div>
      )}

      <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-6">
        <h3 className="font-semibold text-slate-800 mb-3">What you&apos;ll get:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-600">
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-emerald-600" />
            <span>Personalized categories</span>
          </div>
          <div className="flex items-center space-x-2">
            <PieChart className="w-4 h-4 text-teal-600" />
            <span>Visual budget breakdown</span>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span>Savings recommendations</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Hindi explanations</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Review Step Component  
function ReviewStep({ profile, budget }) {
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
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Your Smart Budget is Ready! 🎉</h2>
        <p className="text-slate-600">Review your personalized budget and start your financial journey</p>
      </div>

      {/* Budget Overview */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">📊 Budget Overview</h3>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-sm text-slate-600">Total Budget</p>
            <p className="text-2xl font-bold text-slate-800">{formatCurrency(budget.totalBudget)}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Monthly Savings</p>
            <p className="text-2xl font-bold text-emerald-600">
              {formatCurrency(budget.categories?.savings?.amount || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-800">Category Breakdown</h3>
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
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Profile Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-600">Income:</span>
            <span className="ml-2 font-medium">{formatCurrency(profile.monthlyIncome)}</span>
          </div>
          <div>
            <span className="text-slate-600">City:</span>
            <span className="ml-2 font-medium">{profile.city}</span>
          </div>
          <div>
            <span className="text-slate-600">Family Size:</span>
            <span className="ml-2 font-medium">{profile.familySize} member{profile.familySize > 1 ? 's' : ''}</span>
          </div>
          <div>
            <span className="text-slate-600">Age:</span>
            <span className="ml-2 font-medium">{profile.age} years</span>
          </div>
        </div>
      </div>
    </div>
  )
}
