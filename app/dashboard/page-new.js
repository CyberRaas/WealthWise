'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useProfile } from '@/contexts/ProfileContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import OnboardingGuard from '@/components/OnboardingGuard'
import BudgetDisplay from '@/components/dashboard/BudgetDisplay'
import ExpenseEntryModal from '@/components/expenses/ExpenseEntryModal'
import InvestmentAlertModal from '@/components/investment/InvestmentAlertModal'
import WealthGrowthTracker from '@/components/investment/WealthGrowthTracker'
import GoalTracker from '@/components/goals/GoalTracker'
import { 
  TrendingUp, 
  PiggyBank, 
  Wallet,
  Bell,
  LogOut,
  Mic,
  Plus,
  BarChart3,
  MicOff,
  Star,
  ArrowRight
} from 'lucide-react'
import toast from 'react-hot-toast'

function DashboardContent() {
  const { data: session, status } = useSession()
  const { profileImage } = useProfile()
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [onboardingStatus, setOnboardingStatus] = useState(null)
  const [checkingOnboarding, setCheckingOnboarding] = useState(true)
  const [allowDashboard, setAllowDashboard] = useState(false)
  const [showExpenseEntry, setShowExpenseEntry] = useState(false)
  const [expenses, setExpenses] = useState([])
  const [refreshBudget, setRefreshBudget] = useState(0)
  const [investmentAlert, setInvestmentAlert] = useState(null)
  const [showInvestmentAlert, setShowInvestmentAlert] = useState(false)
  const [simulatedInvestments, setSimulatedInvestments] = useState([])
  const [showWealthTracker, setShowWealthTracker] = useState(false)

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const response = await fetch('/api/onboarding')
        const data = await response.json()
        
        if (response.ok && data.profile) {
          setOnboardingStatus(data.profile)
          
          if (!data.profile.onboardingCompleted || data.profile.onboardingProgress < 100) {
            toast.info(t('common.completeProfileFirst'))
            router.replace('/onboarding')
            return
          }
        } else {
          router.replace('/onboarding')
        }
      } catch (error) {
        console.error('Onboarding check failed:', error)
        router.replace('/onboarding')
      }
    }

    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated' && session?.user) {
      setUser(session.user)
      checkOnboardingStatus()
    }
  }, [status, router, session, checkOnboardingStatus])

  const checkOnboardingStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/onboarding')
      const data = await response.json()
      
      if (response.ok && data.profile) {
        setOnboardingStatus(data.profile)
        
        if (!data.profile.onboardingCompleted || data.profile.onboardingProgress < 100) {
          toast.info('Please complete your profile setup first')
          router.replace('/onboarding')
          return
        }
        
        setAllowDashboard(true)
      } else {
        toast.info('Please complete your profile setup')
        router.replace('/onboarding')
        return
      }
    } catch (error) {
      console.error('Failed to check onboarding status:', error)
      toast.info('Please complete your profile setup')
      router.replace('/onboarding')
    } finally {
      setCheckingOnboarding(false)
    }
  }, [router])

  const handleExpenseAdded = (expense) => {
    console.log('Expense added:', expense)
    toast.success(t('common.expenseAddedSuccess'))
    setExpenses(prev => [expense, ...prev])
    setRefreshBudget(prev => prev + 1)
    setShowExpenseEntry(false)
  }

  const openExpenseEntry = () => {
    setShowExpenseEntry(true)
  }

  // Check for investment opportunities
  const checkInvestmentOpportunities = async () => {
    try {
      const response = await fetch('/api/investment/alerts', {
        method: 'POST',
      })
      
      const data = await response.json()
      
      if (data.success && data.hasOpportunity) {
        setInvestmentAlert(data.alert)
        setShowInvestmentAlert(true)
      }
    } catch (error) {
      console.error('Error checking investment opportunities:', error)
    }
  }

  // Handle investment simulation
  const handleSimulateInvestment = (alert) => {
    const newInvestment = {
      id: Date.now(),
      date: new Date().toISOString(),
      amount: alert.metadata.userSavings,
      type: 'Market Opportunity',
      performance: 15 + Math.random() * 10, // Simulate 15-25% returns
      alert: alert
    }
    
    setSimulatedInvestments(prev => [newInvestment, ...prev])
    toast.success(t('common.investmentSimulatedSuccess'))
    
    // Show wealth tracker after first investment
    if (simulatedInvestments.length === 0) {
      setTimeout(() => setShowWealthTracker(true), 1000)
    }
  }

  // Auto-check for investment opportunities on load
  useEffect(() => {
    if (allowDashboard) {
      // Check for opportunities after a short delay
      setTimeout(checkInvestmentOpportunities, 3000)
    }
  }, [allowDashboard])

  if (checkingOnboarding || status === 'loading' || !allowDashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-emerald-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loadingDashboard')}</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-emerald-200 to-teal-200 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-20 w-80 h-80 bg-gradient-to-r from-teal-200 to-blue-200 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-r from-blue-200 to-emerald-200 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Modern Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-emerald-200/50 sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo & Title */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl transform hover:scale-110 transition-transform duration-300 ring-4 ring-white/50">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full animate-ping"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-emerald-700 to-blue-800 bg-clip-text text-transparent">
                  WealthWise Dashboard
                </h1>
                <p className="text-xs text-slate-500 -mt-1">Professional Wealth Management</p>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-all duration-200"
              >
                <Bell className="h-5 w-5" />
              </Button>
              
              <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm rounded-2xl px-4 py-2 border border-emerald-100/50 shadow-sm">
                <Avatar className="h-8 w-8 ring-2 ring-emerald-200">
                  <AvatarImage src={profileImage || user?.image} />
                  <AvatarFallback className="text-sm bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold">
                    {user?.name?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-slate-700">{user?.name?.split(' ')[0] || 'User'}</p>
                  <p className="text-xs text-slate-500">{t('common.premiumMember')}</p>
                </div>
              </div>

              <Button
                onClick={() => signOut()}
                variant="ghost"
                size="sm"
                className="text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Hero Section with Quick Actions */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-xl rounded-full px-6 py-3 border border-emerald-200/50 mb-6 shadow-lg">
              <Star className="w-5 h-5 text-emerald-600" />
              <span className="text-slate-700 font-medium">{t('common.financialCommandCenter')}</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
              <span className="block bg-gradient-to-r from-slate-800 via-emerald-700 to-slate-800 bg-clip-text text-transparent">
                Welcome back! 👋
              </span>
              <span className="block bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent text-2xl lg:text-3xl mt-2">
                Ready to manage your finances with voice commands?
              </span>
            </h2>
          </div>

          {/* Enhanced Quick Action Buttons */}
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <Button
              onClick={openExpenseEntry}
              className="group bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-700 hover:via-teal-700 hover:to-blue-700 text-white px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 ring-2 ring-white/20 text-lg font-bold"
            >
              <Mic className="h-6 w-6 mr-3 group-hover:animate-pulse" />
              Voice Entry
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button
              onClick={openExpenseEntry}
              variant="outline"
              className="group bg-white/80 backdrop-blur-xl hover:bg-white/90 text-emerald-700 hover:text-emerald-800 border-2 border-emerald-200 hover:border-emerald-300 px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-lg font-bold"
            >
              <Plus className="h-6 w-6 mr-3 group-hover:rotate-90 transition-transform duration-300" />
              {t('common.addExpense')}
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>

        {/* Budget Display */}
        <div className="mb-8">
          <BudgetDisplay key={refreshBudget} refreshTrigger={refreshBudget} />
        </div>

        {/* Goal Tracker */}
        <div className="mb-8">
          <GoalTracker userSavings={expenses.reduce((sum, expense) => sum + (expense.category === 'Savings' ? expense.amount : 0), 0)} />
        </div>

        {/* Wealth Growth Tracker */}
        {showWealthTracker && simulatedInvestments.length > 0 && (
          <div className="mb-8">
            <WealthGrowthTracker simulatedInvestments={simulatedInvestments} />
          </div>
        )}

        {/* Recent Activity */}
        <Card className="group bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/30 hover:from-white hover:via-emerald-50/50 hover:to-teal-50/50 border-2 border-emerald-200/40 hover:border-emerald-300/60 shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-xl rounded-2xl ring-1 ring-white/50">
          <CardHeader>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-emerald-700 to-slate-800 bg-clip-text text-transparent flex items-center">
              <BarChart3 className="h-6 w-6 mr-3 text-emerald-600" />
              Recent Activity
            </CardTitle>
            <CardDescription className="text-slate-600 text-lg">
              Your latest expense entries and budget updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-100 via-teal-100 to-blue-100 rounded-xl border border-emerald-200/50 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <span className="text-lg font-bold text-slate-800">{t('common.budgetGenerated')}</span>
                </div>
                <span className="text-sm text-slate-500 font-medium">Just now</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-teal-100 via-blue-100 to-emerald-100 rounded-xl border border-teal-200/50 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                  <span className="text-lg font-bold text-slate-800">Profile setup completed</span>
                </div>
                <span className="text-sm text-slate-500 font-medium">2 minutes ago</span>
              </div>
              
              <div className="text-center py-6">
                <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-xl rounded-full px-6 py-3 border border-emerald-200/50 shadow-lg">
                  <Star className="w-5 h-5 text-emerald-600" />
                  <p className="text-slate-600 font-medium">Start adding expenses to see more activity!</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Expense Entry Modal */}
      <ExpenseEntryModal
        isOpen={showExpenseEntry}
        onClose={() => setShowExpenseEntry(false)}
        onExpenseAdded={handleExpenseAdded}
      />

      {/* Investment Alert Modal */}
      <InvestmentAlertModal
        alert={investmentAlert}
        isOpen={showInvestmentAlert}
        onClose={() => setShowInvestmentAlert(false)}
        onSimulateInvestment={handleSimulateInvestment}
      />
    </div>
  )
}

// Main component with OnboardingGuard wrapper
export default function DashboardPage() {
  return (
    <OnboardingGuard>
      <DashboardContent />
    </OnboardingGuard>
  )
}
