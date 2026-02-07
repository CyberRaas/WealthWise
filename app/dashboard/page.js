// app/dashboard/page.js
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/lib/i18n'
import DashboardLayout from '@/components/layout/DashboardLayout'
import OnboardingGuard from '@/components/OnboardingGuard'
import LanguageSelector from '@/components/ui/LanguageSelector'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { WorthItWizard } from "@/components/tools/WorthItWizard";
import {
  TrendingUp,
  Wallet,
  Target,
  PiggyBank,
  Plus,
  Mic,
  BarChart3,
  DollarSign,
  AlertCircle,
  RefreshCw,
  Sparkles,
  CreditCard,
  Calculator,
  User,
  Settings,
  HelpCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import BudgetDisplay from '@/components/dashboard/BudgetDisplay'
import ExpenseEntryModal from '@/components/expenses/ExpenseEntryModal'
import { AgentDashboard } from '@/components/agents/AgentDashboard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SeasonalPlanningWidget } from '@/components/seasonal'
import IncomeRecommendations from '@/components/budget/IncomeRecommendations'
import { FinancialInsightsWidget } from '@/components/insights'
import SmartNudgeToast from '@/components/retention/SmartNudgeToast'
import { Trophy } from 'lucide-react'
import { AchievementsWidget } from '@/components/education/AchievementsWidget'
import GameProgressWidget from '@/components/games/GameProgressWidget'
import FinancialHealthScore from '@/components/dashboard/FinancialHealthScore'
import PredictiveBalanceAlert from '@/components/tools/PredictiveBalanceAlert'
import SubscriptionAudit from '@/components/tools/SubscriptionAudit'
import SmartNudgeEngine from '@/components/tools/SmartNudgeEngine'
import LiteracyImprovementWidget from '@/components/games/LiteracyImprovementWidget'
import LearningJourneyMap from '@/components/games/LearningJourneyMap'

function DashboardContent() {
  const { data: session } = useSession()
  const router = useRouter()
  const { t } = useTranslation()
  const [showExpenseEntry, setShowExpenseEntry] = useState(false)
  const [loading, setLoading] = useState(true)
  const [budget, setBudget] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [goals, setGoals] = useState([])
  const [monthlyData, setMonthlyData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    totalSaved: 0,
    savingsRate: 0
  })

  // Get dynamic greeting based on time
  const getGreeting = () => {
    const now = new Date()
    const hour = now.getHours()
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    let timeGreeting = ''
    if (hour < 12) timeGreeting = 'Good morning'
    else if (hour < 17) timeGreeting = 'Good afternoon'
    else timeGreeting = 'Good evening'

    const dateStr = `${dayNames[now.getDay()]}, ${monthNames[now.getMonth()]} ${now.getDate()}`

    return {
      greeting: timeGreeting,
      date: dateStr
    }
  }

  const greetingData = getGreeting()

  // Fetch all user data
  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      // Fetch budget, expenses, and goals in parallel
      const [budgetResponse, expensesResponse, goalsResponse] = await Promise.all([
        fetch('/api/budget/generate'),
        fetch('/api/expenses?limit=10'),
        fetch('/api/goals')
      ])

      const budgetData = await budgetResponse.json()
      const expensesData = await expensesResponse.json()
      const goalsData = await goalsResponse.json()

      // Set budget data
      if (budgetData.success && budgetData.budget) {
        setBudget(budgetData.budget)
      }

      // Set expenses data
      if (expensesData.success) {
        setExpenses(expensesData.expenses || [])

        // Calculate monthly financial data
        const currentMonth = new Date().toISOString().substring(0, 7)
        const currentMonthExpenses = expensesData.expenses?.filter(expense =>
          expense.date?.substring(0, 7) === currentMonth
        ) || []

        const totalExpenses = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0)
        const totalIncome = budgetData.budget?.totalBudget || 0
        const totalSaved = totalIncome - totalExpenses
        const savingsRate = totalIncome > 0 ? Math.round((totalSaved / totalIncome) * 100) : 0

        setMonthlyData({
          totalIncome,
          totalExpenses,
          totalSaved,
          savingsRate: Math.max(0, savingsRate)
        })
      }

      // Set goals data
      if (goalsData.success) {
        setGoals(goalsData.goals || [])
      }

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  // Handle expense added
  const handleExpenseAdded = (expense) => {
    console.log('Expense added:', expense)
    toast.success('Expense added successfully!')
    setExpenses(prev => [expense, ...prev].slice(0, 10)) // Keep only latest 10
    setShowExpenseEntry(false)
    // Refresh monthly data
    fetchAllData()
  }

  // Quick action handlers
  const handleVoiceEntry = () => {
    setShowExpenseEntry(true)
  }

  const handleAddExpense = () => {
    router.push('/dashboard/expenses?mode=manual')
  }

  const handleViewBudget = () => {
    router.push('/dashboard/budget')
  }

  const handleViewGoals = () => {
    router.push('/dashboard/goals')
  }

  // Calculate financial health score based on real data
  const getFinancialHealthScore = () => {
    if (!budget || !monthlyData.totalIncome) return 50

    let score = 0

    // Savings rate (40% of score)
    const savingsRate = monthlyData.savingsRate
    if (savingsRate >= 30) score += 40
    else if (savingsRate >= 20) score += 30
    else if (savingsRate >= 10) score += 20
    else score += 10

    // Budget adherence (30% of score)
    if (budget.healthScore) {
      score += Math.round((budget.healthScore / 100) * 30)
    } else {
      score += 20 // Default if no health score
    }

    // Goal progress (30% of score)
    if (goals.length > 0) {
      const avgProgress = goals.reduce((sum, goal) => {
        const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
        return sum + progress
      }, 0) / goals.length
      score += Math.round((avgProgress / 100) * 30)
    } else {
      score += 15 // Partial score if no goals set
    }

    return Math.min(Math.max(score, 0), 100)
  }

  const financialHealthScore = getFinancialHealthScore()

  if (loading) {
    return (
      <DashboardLayout title="Dashboard Overview">
        <div className="space-y-6 animate-pulse">
          {/* Header Skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
            <div>
              <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg mb-2" />
              <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded-full" />
              <div className="h-8 w-24 bg-slate-100 dark:bg-slate-800 rounded-full" />
              <div className="h-8 w-20 bg-slate-100 dark:bg-slate-800 rounded-full" />
            </div>
          </div>

          {/* Primary Action Row Skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Financial Summary Card Skeleton */}
            <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-emerald-500/80 to-teal-600/80 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="h-4 w-20 bg-white/30 rounded" />
                <div className="h-5 w-5 bg-white/30 rounded" />
              </div>
              <div className="h-8 w-32 bg-white/30 rounded mb-2" />
              <div className="h-4 w-40 bg-white/20 rounded mb-3" />
              <div className="h-2 w-full bg-white/20 rounded-full" />
            </div>

            {/* Quick Add Skeleton */}
            <div className="bg-white dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700" />
                <div>
                  <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded mb-1" />
                  <div className="h-3 w-24 bg-slate-100 dark:bg-slate-800 rounded" />
                </div>
              </div>
              <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800 rounded" />
            </div>

            {/* Budget Status Skeleton */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/40" />
                <div>
                  <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded mb-1" />
                  <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800 rounded" />
                </div>
              </div>
              <div className="h-3 w-24 bg-violet-100 dark:bg-violet-900/40 rounded" />
            </div>

            {/* Goals Status Skeleton */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/40" />
                <div>
                  <div className="h-4 w-14 bg-slate-200 dark:bg-slate-700 rounded mb-1" />
                  <div className="h-3 w-24 bg-slate-100 dark:bg-slate-800 rounded" />
                </div>
              </div>
              <div className="h-3 w-28 bg-purple-100 dark:bg-purple-900/40 rounded" />
            </div>
          </div>

          {/* Daily Engagement Row Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Daily Pulse Skeleton */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-4 w-16 bg-slate-100 dark:bg-slate-800 rounded" />
              </div>
              <div className="space-y-3">
                <div className="h-16 w-full bg-slate-100 dark:bg-slate-700 rounded-lg" />
                <div className="flex gap-2">
                  <div className="h-10 flex-1 bg-slate-100 dark:bg-slate-700 rounded-lg" />
                  <div className="h-10 flex-1 bg-slate-100 dark:bg-slate-700 rounded-lg" />
                </div>
              </div>
            </div>

            {/* Recent Activity Skeleton */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-4 w-16 bg-emerald-100 dark:bg-emerald-900/40 rounded" />
              </div>
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700" />
                      <div>
                        <div className="h-4 w-28 bg-slate-200 dark:bg-slate-700 rounded mb-1" />
                        <div className="h-3 w-16 bg-slate-100 dark:bg-slate-800 rounded" />
                      </div>
                    </div>
                    <div className="h-4 w-16 bg-red-100 dark:bg-red-900/30 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Daily Tip Skeleton */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-200 dark:bg-amber-800/50" />
              <div className="flex-1">
                <div className="h-4 w-24 bg-amber-200 dark:bg-amber-800/50 rounded mb-2" />
                <div className="h-4 w-full bg-amber-100 dark:bg-amber-900/30 rounded mb-1" />
                <div className="h-4 w-3/4 bg-amber-100 dark:bg-amber-900/30 rounded" />
              </div>
            </div>
          </div>

          {/* Tabs Skeleton */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="h-10 w-28 bg-slate-200 dark:bg-slate-700 rounded-lg" />
              <div className="h-10 w-28 bg-slate-100 dark:bg-slate-800 rounded-lg" />
            </div>

            {/* Overview Content Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* AI Insights Skeleton */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                <div className="h-5 w-36 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                      <div className="h-4 w-full bg-slate-200 dark:bg-slate-600 rounded mb-2" />
                      <div className="h-3 w-2/3 bg-slate-100 dark:bg-slate-700 rounded" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Budget Overview Skeleton */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i}>
                      <div className="flex justify-between mb-1">
                        <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                        <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800 rounded" />
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full">
                        <div className="h-1.5 bg-emerald-300 dark:bg-emerald-700 rounded-full" style={{ width: `${Math.random() * 60 + 20}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title={t('dashboard.overview')}>
      <div className="space-y-6">

        {/* Compact Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-1">
              {greetingData.greeting}, {session?.user?.name?.split(' ')[0]}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">{greetingData.date}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right mr-2">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Financial Health</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">{financialHealthScore}/100</div>
            </div>
            <div className="h-10 w-10 rounded-full border-2 border-emerald-500/20 flex items-center justify-center bg-emerald-50 dark:bg-emerald-900/10">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">{financialHealthScore}</span>
            </div>
          </div>
        </div>

        {/* Primary Action Row - 4 Column Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Financial Summary Card */}
          <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-5 text-white shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Wallet className="w-24 h-24 rotate-12" />
            </div>

            <div className="relative z-10">
              <div className="mb-4">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Savings</span>
                <div className="text-3xl font-bold mt-1 tracking-tight">
                  ₹{monthlyData.totalSaved > 0 ? monthlyData.totalSaved.toLocaleString('en-IN') : '0'}
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-300">
                <div className="flex-1 bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(monthlyData.savingsRate, 100)}%` }} />
                </div>
                <span className="font-medium text-emerald-400">{monthlyData.savingsRate}%</span>
              </div>
            </div>
          </div>

          {/* Quick Add Expense */}
          <button
            onClick={() => setShowExpenseEntry(true)}
            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-md hover:border-emerald-500/20 rounded-2xl p-5 text-left transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Plus className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="font-semibold text-slate-900 dark:text-white">Add Expense</div>
            <div className="text-xs text-slate-500 mt-1">Voice or manual entry</div>
          </button>

          {/* Budget Status */}
          <button
            onClick={handleViewBudget}
            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-md hover:border-blue-500/20 rounded-2xl p-5 text-left transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="font-semibold text-slate-900 dark:text-white">Budget</div>
            <div className="text-xs text-slate-500 mt-1">
              {budget ? `${Math.round((monthlyData.totalExpenses / budget.totalBudget) * 100)}% utilized` : 'Set up budget'}
            </div>
          </button>

          {/* Worth It Wizard */}
          <WorthItWizard
            customTrigger={
              <button className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-md hover:border-purple-500/20 rounded-2xl p-5 text-left transition-all group w-full h-full">
                <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="font-semibold text-slate-900 dark:text-white">Worth It?</div>
                <div className="text-xs text-slate-500 mt-1">AI Purchase Advisor</div>
              </button>
            }
          />
        </div>

        {/* Phase 3: Guardian Layer - Predictive Alerts & Smart Nudges */}
        <PredictiveBalanceAlert budget={budget} expenses={expenses} />
        <SmartNudgeEngine budget={budget} expenses={expenses} goals={goals} />

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <TabsTrigger value="overview" className="flex items-center gap-2 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm dark:text-slate-300 dark:data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="ai-agents" className="flex items-center gap-2 rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm dark:text-slate-300 dark:data-[state=active]:text-white">
              <Sparkles className="h-4 w-4" />
              <span>AI Agents</span>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded">
                BETA
              </span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 mt-0">
            {/* 🎮 Game-First: Learning Progress & Play CTA */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <GameProgressWidget />
              </div>
              <Card className="border-2 border-dashed border-emerald-300 dark:border-emerald-700 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="flex flex-col items-center justify-center h-full py-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-4 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/50">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                    Play & Learn 🎮
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Master money skills through fun games. Earn XP & level up!
                  </p>
                  <Button
                    onClick={() => router.push('/dashboard/games')}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md w-full"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Start Playing
                  </Button>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
                    4 games · 10 financial themes
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Literacy Assessment & Learning Journey */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <LiteracyImprovementWidget />
              <LearningJourneyMap compact={true} />
            </div>

            {/* Two Column Layout - AI Insights & Spending */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* AI-Powered Financial Insights */}
              <FinancialInsightsWidget compact={true} />

              {/* Budget Spending Overview */}
              <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-800/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center justify-between dark:text-white">
                    <span className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      Budget Overview
                    </span>
                    <button
                      onClick={handleViewBudget}
                      className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                    >
                      View all →
                    </button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {budget && budget.categories ? (
                    <div className="space-y-3">
                      {Object.entries(budget.categories)
                        .sort(([, a], [, b]) => b.amount - a.amount)
                        .slice(0, 4)
                        .map(([key, category]) => {
                          const categoryExpenses = expenses.filter(e => e.category === category.englishName)
                          const actualSpent = categoryExpenses.reduce((sum, e) => sum + e.amount, 0)
                          const budgetAmount = category.amount
                          const spentPercentage = budgetAmount > 0 ? Math.min((actualSpent / budgetAmount) * 100, 100) : 0

                          return (
                            <div key={key}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{category.englishName}</span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                  ₹{actualSpent.toLocaleString('en-IN')} / ₹{budgetAmount.toLocaleString('en-IN')}
                                </span>
                              </div>
                              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5">
                                <div
                                  className={`h-1.5 rounded-full transition-all ${spentPercentage > 90 ? 'bg-red-500' :
                                    spentPercentage > 70 ? 'bg-amber-500' :
                                      'bg-emerald-500'
                                    }`}
                                  style={{ width: `${Math.min(spentPercentage, 100)}%` }}
                                />
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <BarChart3 className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">No budget data</p>
                      <Button onClick={handleViewBudget} size="sm" variant="outline" className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">
                        Create Budget
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Financial Health & Achievements Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <FinancialHealthScore 
                income={monthlyData.totalIncome}
                expenses={monthlyData.totalExpenses}
                savings={monthlyData.totalSaved}
                debt={0}
                emergencyFund={monthlyData.totalSaved}
                goalProgress={goals.length > 0 ? Math.round(goals.reduce((sum, g) => sum + Math.min((g.currentAmount / g.targetAmount) * 100, 100), 0) / goals.length) : 0}
              />
              <AchievementsWidget />
              <SeasonalPlanningWidget
                compact={true}
                onViewAll={() => router.push('/dashboard/budget#seasonal')}
              />
            </div>

            {/* Income & Subscription Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <IncomeRecommendations compact={true} />
              <SubscriptionAudit expenses={expenses} />
            </div>

            {/* Goals Section */}
            <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-800/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center justify-between dark:text-white">
                  <span className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    Savings Goals
                  </span>
                  <button
                    onClick={handleViewGoals}
                    className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                  >
                    Manage goals →
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {goals.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {goals.slice(0, 4).map((goal) => {
                      const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
                      const isCompleted = goal.status === 'completed' || progress >= 100

                      return (
                        <div
                          key={goal.id}
                          className={`p-3 rounded-lg border ${isCompleted ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800' :
                            progress > 50 ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800' :
                              'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                            }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-800 dark:text-white truncate">{goal.name}</span>
                            {isCompleted && <span className="text-emerald-500 dark:text-emerald-400">✓</span>}
                          </div>
                          <div className="w-full bg-white dark:bg-slate-700 rounded-full h-1.5 mb-1">
                            <div
                              className={`h-1.5 rounded-full ${isCompleted ? 'bg-emerald-500' :
                                progress > 50 ? 'bg-blue-500' :
                                  'bg-slate-400'
                                }`}
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                            <span>₹{(goal.currentAmount / 1000).toFixed(0)}k</span>
                            <span>{progress.toFixed(0)}%</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Target className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">No goals set yet</p>
                    <Button onClick={handleViewGoals} size="sm" className="bg-purple-600 hover:bg-purple-700">
                      Create First Goal
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions - Compact Grid */}
            <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-800/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold dark:text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  <button
                    onClick={handleAddExpense}
                    className="flex flex-col items-center p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800/50 flex items-center justify-center mb-1 transition-colors">
                      <Plus className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-xs text-slate-600 dark:text-slate-400">Add</span>
                  </button>

                  <button
                    onClick={() => router.push('/dashboard/debt')}
                    className="flex flex-col items-center p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/40 group-hover:bg-red-200 dark:group-hover:bg-red-800/50 flex items-center justify-center mb-1 transition-colors">
                      <CreditCard className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <span className="text-xs text-slate-600 dark:text-slate-400">Debt</span>
                  </button>

                  <button
                    onClick={() => router.push('/dashboard/debt-calculator')}
                    className="flex flex-col items-center p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/40 group-hover:bg-amber-200 dark:group-hover:bg-amber-800/50 flex items-center justify-center mb-1 transition-colors">
                      <Calculator className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <span className="text-xs text-slate-600 dark:text-slate-400">Calculator</span>
                  </button>

                  <button
                    onClick={() => router.push('/dashboard/profile')}
                    className="flex flex-col items-center p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800/50 flex items-center justify-center mb-1 transition-colors">
                      <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <span className="text-xs text-slate-600 dark:text-slate-400">Profile</span>
                  </button>

                  <button
                    onClick={() => router.push('/dashboard/settings')}
                    className="flex flex-col items-center p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 group-hover:bg-slate-200 dark:group-hover:bg-slate-600 flex items-center justify-center mb-1 transition-colors">
                      <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </div>
                    <span className="text-xs text-slate-600 dark:text-slate-400">Settings</span>
                  </button>

                  <button
                    onClick={() => router.push('/dashboard/help')}
                    className="flex flex-col items-center p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/40 group-hover:bg-green-200 dark:group-hover:bg-green-800/50 flex items-center justify-center mb-1 transition-colors">
                      <HelpCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-xs text-slate-600 dark:text-slate-400">Help</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Agents Tab */}
          <TabsContent value="ai-agents" className="space-y-6">
            <AgentDashboard />
          </TabsContent>
        </Tabs>
      </div>

      {/* Expense Entry Modal */}
      <ExpenseEntryModal
        isOpen={showExpenseEntry}
        onClose={() => setShowExpenseEntry(false)}
        onExpenseAdded={handleExpenseAdded}
      />

      {/* Smart Nudge Toasts */}
      <SmartNudgeToast />
    </DashboardLayout>
  )
}

export default function DashboardPage() {
  return (
    <OnboardingGuard>
      <DashboardContent />
    </OnboardingGuard>
  )
}
