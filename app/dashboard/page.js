'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/lib/i18n'
import DashboardLayout from '@/components/layout/DashboardLayout'
import OnboardingGuard from '@/components/OnboardingGuard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { WorthItWizard } from "@/components/tools/WorthItWizard"
import {
  TrendingUp,
  Wallet,
  Target,
  Plus,
  BarChart3,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight
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
import GameProgressWidget from '@/components/games/GameProgressWidget'
import FinancialHealthScore from '@/components/dashboard/FinancialHealthScore'
import PredictiveBalanceAlert from '@/components/tools/PredictiveBalanceAlert'
import SubscriptionAudit from '@/components/tools/SubscriptionAudit'
import SmartNudgeEngine from '@/components/tools/SmartNudgeEngine'
import FinancialLiteracyScore from '@/components/dashboard/FinancialLiteracyScore'
import TrackGreeting from '@/components/dashboard/TrackGreeting'
import BehavioralInsightsBridge from '@/components/dashboard/BehavioralInsightsBridge'
import TrackAdaptiveWidget from '@/components/dashboard/TrackAdaptiveWidget'
import DailyMicroChallenge from '@/components/dashboard/DailyMicroChallenge'

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
    totalIncome: 0, totalExpenses: 0, totalSaved: 0, savingsRate: 0
  })

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  useEffect(() => { fetchAllData() }, [])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [budgetRes, expensesRes, goalsRes] = await Promise.all([
        fetch('/api/budget/generate'),
        fetch('/api/expenses?limit=10'),
        fetch('/api/goals')
      ])
      const budgetData = await budgetRes.json()
      const expensesData = await expensesRes.json()
      const goalsData = await goalsRes.json()

      if (budgetData.success && budgetData.budget) setBudget(budgetData.budget)
      if (expensesData.success) {
        setExpenses(expensesData.expenses || [])
        const currentMonth = new Date().toISOString().substring(0, 7)
        const monthExpenses = expensesData.expenses?.filter(e => e.date?.substring(0, 7) === currentMonth) || []
        const totalExpenses = monthExpenses.reduce((sum, e) => sum + e.amount, 0)
        const totalIncome = budgetData.budget?.totalBudget || 0
        const totalSaved = totalIncome - totalExpenses
        const savingsRate = totalIncome > 0 ? Math.round((totalSaved / totalIncome) * 100) : 0
        setMonthlyData({ totalIncome, totalExpenses, totalSaved, savingsRate: Math.max(0, savingsRate) })
      }
      if (goalsData.success) setGoals(goalsData.goals || [])
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleExpenseAdded = (expense) => {
    toast.success('Expense added successfully!')
    setExpenses(prev => [expense, ...prev].slice(0, 10))
    setShowExpenseEntry(false)
    fetchAllData()
  }

  const getFinancialHealthScore = () => {
    if (!budget || !monthlyData.totalIncome) return 50
    let score = 0
    const savingsRate = monthlyData.savingsRate
    if (savingsRate >= 30) score += 40
    else if (savingsRate >= 20) score += 30
    else if (savingsRate >= 10) score += 20
    else score += 10
    if (budget.healthScore) score += Math.round((budget.healthScore / 100) * 30)
    else score += 20
    if (goals.length > 0) {
      const avgProgress = goals.reduce((sum, goal) => sum + Math.min((goal.currentAmount / goal.targetAmount) * 100, 100), 0) / goals.length
      score += Math.round((avgProgress / 100) * 30)
    } else score += 15
    return Math.min(Math.max(score, 0), 100)
  }

  const financialHealthScore = getFinancialHealthScore()

  if (loading) {
    return (
      <DashboardLayout title="Overview">
        <div className="space-y-6 animate-pulse">
          <div className="h-8 w-48 bg-slate-200 dark:bg-white/5 rounded-lg" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-32 bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="h-64 bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5" />
            <div className="h-64 bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5" />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title={t('dashboard.overview')}>
      <div className="space-y-8">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {getGreeting()}, {session?.user?.name?.split(' ')[0]}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
              Here&apos;s your financial overview for this month.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <DailyMicroChallenge compact={true} />
            <FinancialLiteracyScore compact={true} />
            <Button
              onClick={() => setShowExpenseEntry(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm h-9 px-4 text-sm rounded-lg"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Expense
            </Button>
          </div>
        </div>

        {/* ── Track-Specific Tip ── */}
        <TrackGreeting userName={session?.user?.name?.split(' ')[0]} />

        {/* ── Metric Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Income */}
          <MetricCard
            label="Total Income"
            value={`\u20B9${monthlyData.totalIncome.toLocaleString('en-IN')}`}
            icon={<TrendingUp className="w-4 h-4" />}
            iconBg="bg-emerald-50 dark:bg-emerald-500/10"
            iconColor="text-emerald-600 dark:text-emerald-400"
          />
          {/* Total Expenses */}
          <MetricCard
            label="Expenses"
            value={`\u20B9${monthlyData.totalExpenses.toLocaleString('en-IN')}`}
            icon={<ArrowDownRight className="w-4 h-4" />}
            iconBg="bg-red-50 dark:bg-red-500/10"
            iconColor="text-red-500 dark:text-red-400"
          />
          {/* Savings */}
          <MetricCard
            label="Saved"
            value={`\u20B9${monthlyData.totalSaved > 0 ? monthlyData.totalSaved.toLocaleString('en-IN') : '0'}`}
            sub={`${monthlyData.savingsRate}% of income`}
            icon={<ArrowUpRight className="w-4 h-4" />}
            iconBg="bg-blue-50 dark:bg-blue-500/10"
            iconColor="text-blue-600 dark:text-blue-400"
          />
          {/* Health Score */}
          <div className="bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-2xl p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Health Score</span>
            </div>
            <div className="flex items-end gap-3">
              <div className="relative w-14 h-14">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" className="text-slate-100 dark:text-white/5" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor"
                    className={financialHealthScore >= 70 ? 'text-emerald-500' : financialHealthScore >= 40 ? 'text-amber-500' : 'text-red-500'}
                    strokeWidth="3" strokeLinecap="round"
                    strokeDasharray={`${(financialHealthScore / 100) * 97.4} 97.4`}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-900 dark:text-white">
                  {financialHealthScore}
                </span>
              </div>
              <span className={`text-xs font-medium mb-1 ${financialHealthScore >= 70 ? 'text-emerald-600 dark:text-emerald-400' : financialHealthScore >= 40 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
                {financialHealthScore >= 70 ? 'Great' : financialHealthScore >= 40 ? 'Fair' : 'Needs Work'}
              </span>
            </div>
          </div>
        </div>

        {/* ── Quick Actions Row ── */}
        <div className="grid grid-cols-3 gap-3">
          <button onClick={() => router.push('/dashboard/budget')}
            className="bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-xl p-4 text-left hover:border-slate-200 dark:hover:border-white/10 transition-all group">
            <BarChart3 className="w-5 h-5 text-blue-500 mb-2" />
            <p className="text-sm font-medium text-slate-900 dark:text-white">Budget</p>
            <p className="text-xs text-slate-400 mt-0.5">{budget ? `${Math.round((monthlyData.totalExpenses / (budget.totalBudget || 1)) * 100)}% used` : 'Set up'}</p>
          </button>
          <button onClick={() => router.push('/dashboard/goals')}
            className="bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-xl p-4 text-left hover:border-slate-200 dark:hover:border-white/10 transition-all group">
            <Target className="w-5 h-5 text-purple-500 mb-2" />
            <p className="text-sm font-medium text-slate-900 dark:text-white">Goals</p>
            <p className="text-xs text-slate-400 mt-0.5">{goals.length > 0 ? `${goals.length} active` : 'Create one'}</p>
          </button>
          <WorthItWizard customTrigger={
            <button className="bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-xl p-4 text-left hover:border-slate-200 dark:hover:border-white/10 transition-all group w-full">
              <Sparkles className="w-5 h-5 text-amber-500 mb-2" />
              <p className="text-sm font-medium text-slate-900 dark:text-white">Worth It?</p>
              <p className="text-xs text-slate-400 mt-0.5">AI advisor</p>
            </button>
          } />
        </div>

        {/* ── Alerts ── */}
        <PredictiveBalanceAlert budget={budget} expenses={expenses} />
        <SmartNudgeEngine budget={budget} expenses={expenses} goals={goals} />

        {/* ── Tabs ── */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-slate-100/80 dark:bg-white/5 p-1 rounded-lg h-auto">
            <TabsTrigger value="overview" className="rounded-md text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm px-4 py-2">
              Overview
            </TabsTrigger>
            <TabsTrigger value="ai-agents" className="rounded-md text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm px-4 py-2">
              AI Agents
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-0">
            {/* Literacy Score + Behavioral Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <FinancialLiteracyScore />
              <BehavioralInsightsBridge />
            </div>

            {/* Daily Micro-Challenge */}
            <DailyMicroChallenge />

            {/* Games + Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <GameProgressWidget />
              </div>
              <Card className="border-slate-100 dark:border-white/5 dark:bg-white/[0.03] flex flex-col justify-center items-center text-center p-6">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-3">
                  <Target className="w-6 h-6 text-emerald-500" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">Play & Learn</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Master money skills through interactive games</p>
                <Button onClick={() => router.push('/dashboard/games')} className="bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 text-white w-full rounded-lg">
                  Start Playing
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Card>
            </div>

            {/* Insights + Budget */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <FinancialInsightsWidget compact={true} />
              <Card className="border-slate-100 dark:border-white/5 dark:bg-white/[0.03]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-blue-500" />
                      Budget Overview
                    </span>
                    <button onClick={() => router.push('/dashboard/budget')} className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline">
                      View all
                    </button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {budget && budget.categories ? (
                    <div className="space-y-4">
                      {Object.entries(budget.categories)
                        .sort(([, a], [, b]) => b.amount - a.amount)
                        .slice(0, 4)
                        .map(([key, category]) => {
                          const catExpenses = expenses.filter(e => e.category === category.englishName)
                          const spent = catExpenses.reduce((sum, e) => sum + e.amount, 0)
                          const pct = category.amount > 0 ? Math.min((spent / category.amount) * 100, 100) : 0
                          return (
                            <div key={key}>
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-sm text-slate-700 dark:text-slate-300">{category.englishName}</span>
                                <span className="text-xs text-slate-400 tabular-nums">
                                  {`\u20B9`}{spent.toLocaleString('en-IN')} / {`\u20B9`}{category.amount.toLocaleString('en-IN')}
                                </span>
                              </div>
                              <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-1.5">
                                <div className={`h-1.5 rounded-full transition-all ${pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                  style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BarChart3 className="h-8 w-8 text-slate-200 dark:text-white/10 mx-auto mb-2" />
                      <p className="text-sm text-slate-400 mb-3">No budget data yet</p>
                      <Button onClick={() => router.push('/dashboard/budget')} size="sm" variant="outline" className="text-xs">Create Budget</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Health + Track-Specific Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <TrackAdaptiveWidget />
              <div className="space-y-4">
                <FinancialHealthScore
                  income={monthlyData.totalIncome}
                  expenses={monthlyData.totalExpenses}
                  savings={monthlyData.totalSaved}
                  debt={0}
                  emergencyFund={monthlyData.totalSaved}
                  goalProgress={goals.length > 0 ? Math.round(goals.reduce((sum, g) => sum + Math.min((g.currentAmount / g.targetAmount) * 100, 100), 0) / goals.length) : 0}
                />
                <SeasonalPlanningWidget compact={true} onViewAll={() => router.push('/dashboard/budget#seasonal')} />
              </div>
            </div>

            {/* Income + Subscriptions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <IncomeRecommendations compact={true} />
              <SubscriptionAudit expenses={expenses} />
            </div>

            {/* Goals */}
            <Card className="border-slate-100 dark:border-white/5 dark:bg-white/[0.03]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-purple-500" />
                    Savings Goals
                  </span>
                  <button onClick={() => router.push('/dashboard/goals')} className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline">
                    Manage goals
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {goals.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {goals.slice(0, 4).map((goal) => {
                      const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
                      const done = goal.status === 'completed' || progress >= 100
                      return (
                        <div key={goal.id} className={`p-3 rounded-xl border ${done ? 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20' : 'bg-slate-50 dark:bg-white/[0.02] border-slate-100 dark:border-white/5'}`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-800 dark:text-white truncate">{goal.name}</span>
                            {done && <span className="text-emerald-500 text-xs">Done</span>}
                          </div>
                          <div className="w-full bg-white dark:bg-white/5 rounded-full h-1.5 mb-1.5">
                            <div className={`h-1.5 rounded-full ${done ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${progress}%` }} />
                          </div>
                          <div className="flex justify-between text-xs text-slate-400">
                            <span>{`\u20B9`}{(goal.currentAmount / 1000).toFixed(0)}k</span>
                            <span>{progress.toFixed(0)}%</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="h-8 w-8 text-slate-200 dark:text-white/10 mx-auto mb-2" />
                    <p className="text-sm text-slate-400 mb-3">No goals set yet</p>
                    <Button onClick={() => router.push('/dashboard/goals')} size="sm" className="bg-purple-600 hover:bg-purple-700 text-white text-xs">
                      Create First Goal
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-agents" className="space-y-6">
            <AgentDashboard />
          </TabsContent>
        </Tabs>
      </div>

      <ExpenseEntryModal isOpen={showExpenseEntry} onClose={() => setShowExpenseEntry(false)} onExpenseAdded={handleExpenseAdded} />
      <SmartNudgeToast />
    </DashboardLayout>
  )
}

function MetricCard({ label, value, sub, icon, iconBg, iconColor }) {
  return (
    <div className="bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</span>
        <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center ${iconColor}`}>{icon}</div>
      </div>
      <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight tabular-nums">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <OnboardingGuard>
      <DashboardContent />
    </OnboardingGuard>
  )
}
