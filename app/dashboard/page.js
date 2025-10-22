// app/dashboard/page.js
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import DashboardLayout from '@/components/layout/DashboardLayout'
import OnboardingGuard from '@/components/OnboardingGuard'
import LanguageSelector from '@/components/ui/LanguageSelector'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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

  // Get dynamic greeting based on time and day
  const getGreeting = () => {
    const hour = new Date().getHours()
    const day = new Date().getDay()
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    let timeGreeting = ''
    if (hour < 12) timeGreeting = t('greeting.goodMorning')
    else if (hour < 17) timeGreeting = t('greeting.goodAfternoon')
    else timeGreeting = t('greeting.goodEvening')

    const dayMessages = {
      0: t('greeting.sunday'), // Sunday
      1: t('greeting.monday'), // Monday
      2: t('greeting.tuesday'), // Tuesday
      3: t('greeting.wednesday'), // Wednesday
      4: t('greeting.thursday'), // Thursday
      5: t('greeting.friday'), // Friday
      6: t('greeting.saturday') // Saturday
    }

    return {
      greeting: `${timeGreeting}! ${dayMessages[day]}`,
      day: dayNames[day]
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
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-emerald-600 mx-auto mb-2" />
            <p className="text-slate-600">{t('common.loadingFinancialData')}</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title={t('dashboard.overview')}>
      <div className="space-y-8">

        {/*TODO: Implement Welcome Message with Real Data */}
        <div className="bg-gradient-to-r from-emerald-50 via-blue-50 to-purple-50 rounded-2xl p-6 border border-emerald-100">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
                {t('dashboard.welcome')} {session?.user?.name || 'Friend'}! 👋
              </h1>
              <p className="text-slate-600 text-base sm:text-lg mb-3">
                {greetingData.greeting}
              </p>

              {/* Dynamic motivational message based on real data */}
              {financialHealthScore >= 75 && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-emerald-700 font-medium bg-emerald-100 px-3 py-1 rounded-full">
                    {t('health.excellent')}
                  </span>
                </div>
              )}

              {financialHealthScore < 75 && financialHealthScore >= 50 && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-blue-700 font-medium bg-blue-100 px-3 py-1 rounded-full">
                    {t('health.good')}
                  </span>
                </div>
              )}

              {financialHealthScore < 50 && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-orange-700 font-medium bg-orange-100 px-3 py-1 rounded-full">
                    {t('health.needsImprovement')}
                  </span>
                </div>
              )}

              {monthlyData.savingsRate > 0 && (
                <p className="text-sm text-slate-500">
                  💰 You&apos;re saving {monthlyData.savingsRate}% of your income this month!
                </p>
              )}

              {monthlyData.savingsRate <= 0 && (
                <p className="text-sm text-slate-500">
                  🎯 Focus on reducing expenses to increase your savings rate.
                </p>
              )}
            </div>

            {/* <div className="hidden sm:block ml-6">
              <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg animate-pulse-subtle">
                {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : '😊'}
              </div>
            </div> */}
          </div>

          {/* Real quick stats row */}
          {monthlyData.totalIncome > 0 && (
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-emerald-200">
              <div className="text-center">
                <div className="text-lg font-bold text-emerald-600">
                  ₹{monthlyData.totalSaved > 0 ? (monthlyData.totalSaved / 100000).toFixed(1) : '0'}L
                </div>
                <div className="text-xs text-slate-600">{t('health.savedThisMonth')}</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{monthlyData.savingsRate}%</div>
                <div className="text-xs text-slate-600">{t('health.savingsRate')}</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">{goals.filter(g => g.status === 'active').length}</div>
                <div className="text-xs text-slate-600">{t('health.activeGoals')}</div>
              </div>
            </div>
          )}

          {/* No data state */}
          {monthlyData.totalIncome === 0 && (
            <div className="mt-4 pt-4 border-t border-emerald-200 text-center">
              <p className="text-sm text-slate-500 mb-2">{t('health.noDataAvailable')}</p>
              <Button
                onClick={() => router.push('/dashboard/budget')}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {t('health.generateBudget')}
              </Button>
            </div>
          )}
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-flex">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard Overview</span>
            </TabsTrigger>
            <TabsTrigger value="ai-agents" className="flex items-center gap-2 relative">
              <TrendingUp className="h-4 w-4" />
              <span>🤖 AI Agents</span>
              <span className="ml-1 px-1.5 py-0.5 text-[10px] font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md">
                BETA
              </span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Financial Health Score & Overview with Real Data */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                    {t('health.financialHealthScore')}
                  </CardTitle>
                  <CardDescription>{t('health.overallWellness')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="relative inline-flex items-center justify-center w-32 h-32 mx-auto mb-4">
                        <svg className="transform -rotate-90 w-32 h-32">
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            className="text-slate-200"
                          />
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={`${2 * Math.PI * 56}`}
                            strokeDashoffset={`${2 * Math.PI * 56 * (1 - financialHealthScore / 100)}`}
                            className="text-emerald-500"
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-3xl font-bold text-slate-800">{financialHealthScore}</span>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-2">
                        {financialHealthScore >= 75 ? 'Excellent Financial Health' :
                          financialHealthScore >= 50 ? 'Good Financial Health' :
                            'Needs Improvement'}
                      </h3>
                      <p className="text-slate-600">
                        {financialHealthScore >= 75 ? 'You\'re doing great with your finances!' :
                          financialHealthScore >= 50 ? 'You\'re on the right track' :
                            'Let\'s work together to improve your financial wellness'}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <div className="text-lg font-bold text-emerald-600">{monthlyData.savingsRate}%</div>
                        <div className="text-sm text-slate-600">Savings Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">
                          {budget ? Math.round((monthlyData.totalExpenses / budget.totalBudget) * 100) : 0}%
                        </div>
                        <div className="text-sm text-slate-600">Budget Used</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-600">{goals.length}</div>
                        <div className="text-sm text-slate-600">Goals Set</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-emerald-600" />
                    This Month Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {monthlyData.totalIncome > 0 ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                        <div>
                          <div className="text-sm text-emerald-700">Total Income</div>
                          <div className="text-lg font-bold text-emerald-800">
                            ₹{monthlyData.totalIncome.toLocaleString('en-IN')}
                          </div>
                        </div>
                        <TrendingUp className="h-6 w-6 text-emerald-600" />
                      </div>

                      <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                        <div>
                          <div className="text-sm text-red-700">Total Expenses</div>
                          <div className="text-lg font-bold text-red-800">
                            ₹{monthlyData.totalExpenses.toLocaleString('en-IN')}
                          </div>
                        </div>
                        <Wallet className="h-6 w-6 text-red-600" />
                      </div>

                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <div>
                          <div className="text-sm text-blue-700">Money Saved</div>
                          <div className="text-lg font-bold text-blue-800">
                            ₹{Math.max(0, monthlyData.totalSaved).toLocaleString('en-IN')}
                          </div>
                        </div>
                        <PiggyBank className="h-6 w-6 text-blue-600" />
                      </div>

                      <div className="text-center pt-2 border-t">
                        <div className="text-xs text-slate-500">Savings Rate</div>
                        <div className="text-lg font-bold text-purple-600">{monthlyData.savingsRate}%</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-500 text-sm mb-4">No financial data available</p>
                      <Button
                        onClick={() => router.push('/dashboard/budget')}
                        size="sm"
                        variant="outline"
                      >
                        Set Up Budget
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity & Insights with Real Data */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Your latest spending and income</CardDescription>
                </CardHeader>
                <CardContent>
                  {expenses.length > 0 ? (
                    <div className="space-y-3">
                      {expenses.slice(0, 4).map((expense) => (
                        <div key={expense.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                              <span className="text-xs">
                                {expense.category === 'Food & Dining' ? '🍕' :
                                  expense.category === 'Transportation' ? '🚗' :
                                    expense.category === 'Shopping' ? '🛒' :
                                      expense.category === 'Healthcare' ? '🏥' :
                                        expense.category === 'Entertainment' ? '🎬' :
                                          expense.category === 'Home & Utilities' ? '🏠' :
                                            '💰'}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-sm">
                                {expense.description || expense.merchant || expense.category}
                              </div>
                              <div className="text-xs text-slate-500">
                                {expense.category} • {new Date(expense.date).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="text-red-600 font-medium">
                            -₹{expense.amount.toLocaleString('en-IN')}
                          </div>
                        </div>
                      ))}

                      <Button
                        onClick={() => router.push('/dashboard/expenses')}
                        variant="outline"
                        className="w-full mt-4"
                      >
                        View All Transactions
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Wallet className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-500 text-sm mb-4">No transactions yet</p>
                      <Button
                        onClick={handleAddExpense}
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        Add Your First Expense
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Smart Money Tips</CardTitle>
                  <CardDescription>Personalized advice based on your data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Dynamic tips based on real data */}
                    {monthlyData.savingsRate >= 20 && (
                      <div className="p-4 bg-emerald-50 rounded-lg border-l-4 border-emerald-500">
                        <div className="flex items-start gap-3">
                          <div className="text-emerald-600">✅</div>
                          <div>
                            <h4 className="font-medium text-emerald-800">Great Savings!</h4>
                            <p className="text-sm text-emerald-700 mt-1">
                              You&apos;re saving {monthlyData.savingsRate}% this month. Excellent work with your financial discipline!
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {monthlyData.savingsRate < 10 && monthlyData.totalIncome > 0 && (
                      <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-500">
                        <div className="flex items-start gap-3">
                          <div className="text-amber-600">⚠️</div>
                          <div>
                            <h4 className="font-medium text-amber-800">Low Savings Alert</h4>
                            <p className="text-sm text-amber-700 mt-1">
                              Your savings rate is {monthlyData.savingsRate}%. Try to save at least 10-20% of your income.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Category-based tips */}
                    {expenses.length > 0 && (() => {
                      const categoryTotals = expenses.reduce((acc, expense) => {
                        acc[expense.category] = (acc[expense.category] || 0) + expense.amount
                        return acc
                      }, {})

                      const topCategory = Object.entries(categoryTotals).sort(([, a], [, b]) => b - a)[0]
                      const [categoryName, categoryAmount] = topCategory || ['', 0]

                      if (categoryAmount > (monthlyData.totalIncome * 0.3)) {
                        return (
                          <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                            <div className="flex items-start gap-3">
                              <div className="text-orange-600">📊</div>
                              <div>
                                <h4 className="font-medium text-orange-800">High Spending Alert</h4>
                                <p className="text-sm text-orange-700 mt-1">
                                  You&apos;ve spent ₹{categoryAmount.toLocaleString('en-IN')} on {categoryName}. Consider optimizing this category.
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      }
                    })()}

                    <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <div className="flex items-start gap-3">
                        <div className="text-blue-600">💡</div>
                        <div>
                          <h4 className="font-medium text-blue-800">Investment Tip</h4>
                          <p className="text-sm text-blue-700 mt-1">
                            Consider SIP in mutual funds or invest in PPF for tax benefits and long-term growth.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* No data tip */}
                    {expenses.length === 0 && monthlyData.totalIncome === 0 && (
                      <div className="p-4 bg-slate-50 rounded-lg border-l-4 border-slate-400">
                        <div className="flex items-start gap-3">
                          <div className="text-slate-600">📝</div>
                          <div>
                            <h4 className="font-medium text-slate-800">Get Started</h4>
                            <p className="text-sm text-slate-700 mt-1">
                              Set up your budget and start tracking expenses to get personalized financial advice.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl font-bold text-slate-800">Quick Actions</CardTitle>
                <CardDescription>Fast access to all features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                  {/* Voice Entry - Primary Action */}
                  <Button
                    onClick={handleVoiceEntry}
                    className="flex flex-col items-center p-4 sm:p-6 h-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl col-span-2 sm:col-span-1"
                  >
                    <Mic className="h-6 w-6 sm:h-8 sm:w-8 mb-2" />
                    <span className="font-bold text-sm sm:text-base">Voice Entry</span>
                    <span className="text-xs opacity-90">Add by voice</span>
                  </Button>

                  {/* Add Expense */}
                  <Button
                    onClick={handleAddExpense}
                    variant="outline"
                    className="flex flex-col items-center p-4 sm:p-6 h-auto border-2 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 rounded-xl"
                  >
                    <Plus className="h-6 w-6 sm:h-8 sm:w-8 mb-2 text-slate-600" />
                    <span className="font-bold text-slate-700 text-sm sm:text-base">Add Expense</span>
                    <span className="text-xs text-slate-500">Manual entry</span>
                  </Button>

                  {/* Budget Manager */}
                  <Button
                    onClick={handleViewBudget}
                    variant="outline"
                    className="flex flex-col items-center p-4 sm:p-6 h-auto border-2 border-slate-200 hover:border-violet-300 hover:bg-violet-50 rounded-xl"
                  >
                    <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 mb-2 text-slate-600" />
                    <span className="font-bold text-slate-700 text-sm sm:text-base">Budget</span>
                    <span className="text-xs text-slate-500">Track budget</span>
                  </Button>

                  {/* Goals */}
                  <Button
                    onClick={handleViewGoals}
                    variant="outline"
                    className="flex flex-col items-center p-4 sm:p-6 h-auto border-2 border-slate-200 hover:border-purple-300 hover:bg-purple-50 rounded-xl"
                  >
                    <Target className="h-6 w-6 sm:h-8 sm:w-8 mb-2 text-slate-600" />
                    <span className="font-bold text-slate-700 text-sm sm:text-base">Goals</span>
                    <span className="text-xs text-slate-500">Track progress</span>
                  </Button>

                  {/* Debt Manager */}
                  <Button
                    onClick={() => router.push('/dashboard/debt')}
                    variant="outline"
                    className="flex flex-col items-center p-4 sm:p-6 h-auto border-2 border-slate-200 hover:border-red-300 hover:bg-red-50 rounded-xl"
                  >
                    <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 mb-2 text-slate-600" />
                    <span className="font-bold text-slate-700 text-sm sm:text-base">Debt</span>
                    <span className="text-xs text-slate-500">Manage debts</span>
                  </Button>

                  {/* Debt Calculator */}
                  <Button
                    onClick={() => router.push('/dashboard/debt-calculator')}
                    variant="outline"
                    className="flex flex-col items-center p-4 sm:p-6 h-auto border-2 border-slate-200 hover:border-orange-300 hover:bg-orange-50 rounded-xl"
                  >
                    <Calculator className="h-6 w-6 sm:h-8 sm:w-8 mb-2 text-slate-600" />
                    <span className="font-bold text-slate-700 text-sm sm:text-base">Calculator</span>
                    <span className="text-xs text-slate-500">Calculate payments</span>
                  </Button>

                  {/* Profile */}
                  <Button
                    onClick={() => router.push('/dashboard/profile')}
                    variant="outline"
                    className="flex flex-col items-center p-4 sm:p-6 h-auto border-2 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 rounded-xl"
                  >
                    <User className="h-6 w-6 sm:h-8 sm:w-8 mb-2 text-slate-600" />
                    <span className="font-bold text-slate-700 text-sm sm:text-base">Profile</span>
                    <span className="text-xs text-slate-500">Manage account</span>
                  </Button>

                  {/* Settings */}
                  <Button
                    onClick={() => router.push('/dashboard/settings')}
                    variant="outline"
                    className="flex flex-col items-center p-4 sm:p-6 h-auto border-2 border-slate-200 hover:border-slate-400 hover:bg-slate-50 rounded-xl"
                  >
                    <Settings className="h-6 w-6 sm:h-8 sm:w-8 mb-2 text-slate-600" />
                    <span className="font-bold text-slate-700 text-sm sm:text-base">Settings</span>
                    <span className="text-xs text-slate-500">Preferences</span>
                  </Button>

                  {/* Help & Support */}
                  <Button
                    onClick={() => router.push('/dashboard/help')}
                    variant="outline"
                    className="flex flex-col items-center p-4 sm:p-6 h-auto border-2 border-slate-200 hover:border-green-300 hover:bg-green-50 rounded-xl"
                  >
                    <HelpCircle className="h-6 w-6 sm:h-8 sm:w-8 mb-2 text-slate-600" />
                    <span className="font-bold text-slate-700 text-sm sm:text-base">Help</span>
                    <span className="text-xs text-slate-500">Get support</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Spending Trends and Goals with Real Data */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Monthly Spending
                  </CardTitle>
                  <CardDescription>Where your money goes each month</CardDescription>
                </CardHeader>
                <CardContent>
                  {budget && budget.categories ? (
                    <div className="space-y-4">
                      {Object.entries(budget.categories)
                        .sort(([, a], [, b]) => b.amount - a.amount)
                        .slice(0, 5)
                        .map(([key, category]) => {
                          // Calculate actual spending for this category
                          const categoryExpenses = expenses.filter(e => e.category === category.englishName)
                          const actualSpent = categoryExpenses.reduce((sum, e) => sum + e.amount, 0)
                          const budgetAmount = category.amount
                          const spentPercentage = budgetAmount > 0 ? Math.min((actualSpent / budgetAmount) * 100, 100) : 0

                          return (
                            <div key={key}>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">{category.englishName}</span>
                                <span className="text-sm text-slate-600">
                                  ₹{actualSpent.toLocaleString('en-IN')} / ₹{budgetAmount.toLocaleString('en-IN')}
                                </span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-2 mb-1">
                                <div
                                  className={`h-2 rounded-full ${spentPercentage > 90 ? 'bg-red-500' :
                                    spentPercentage > 70 ? 'bg-orange-500' :
                                      'bg-emerald-500'
                                    }`}
                                  style={{ width: `${Math.min(spentPercentage, 100)}%` }}
                                ></div>
                              </div>
                              <div className="text-xs text-slate-500">
                                {spentPercentage.toFixed(0)}% of budget used
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-500 text-sm mb-4">No budget data available</p>
                      <Button
                        onClick={() => router.push('/dashboard/budget')}
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        Create Your Budget
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-600" />
                    Savings Goals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {goals.length > 0 ? (
                    <div className="space-y-4">
                      {goals.slice(0, 4).map((goal) => {
                        const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
                        const isCompleted = goal.status === 'completed' || progress >= 100

                        return (
                          <div key={goal.id} className={`p-3 rounded-lg ${isCompleted ? 'bg-emerald-50' :
                            progress > 50 ? 'bg-blue-50' : 'bg-slate-50'
                            }`}>
                            <div className="flex justify-between items-center mb-2">
                              <span className={`font-medium text-sm ${isCompleted ? 'text-emerald-800' :
                                progress > 50 ? 'text-blue-800' : 'text-slate-800'
                                }`}>
                                {goal.name}
                              </span>
                              <span className={`text-xs ${isCompleted ? 'text-emerald-600' :
                                progress > 50 ? 'text-blue-600' : 'text-slate-600'
                                }`}>
                                {progress.toFixed(0)}%
                              </span>
                            </div>
                            <div className={`w-full rounded-full h-2 ${isCompleted ? 'bg-emerald-200' :
                              progress > 50 ? 'bg-blue-200' : 'bg-slate-200'
                              }`}>
                              <div
                                className={`h-2 rounded-full ${isCompleted ? 'bg-emerald-600' :
                                  progress > 50 ? 'bg-blue-600' : 'bg-slate-600'
                                  }`}
                                style={{ width: `${Math.min(progress, 100)}%` }}
                              ></div>
                            </div>
                            <div className={`text-xs mt-1 ${isCompleted ? 'text-emerald-700' :
                              progress > 50 ? 'text-blue-700' : 'text-slate-700'
                              }`}>
                              ₹{goal.currentAmount.toLocaleString('en-IN')} / ₹{goal.targetAmount.toLocaleString('en-IN')}
                              {isCompleted && ' ✅'}
                            </div>
                          </div>
                        )
                      })}

                      <Button
                        onClick={() => router.push('/dashboard/goals')}
                        variant="outline"
                        size="sm"
                        className="w-full mt-2"
                      >
                        View All Goals
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Target className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-500 text-sm mb-4">No goals set yet</p>
                      <Button
                        onClick={() => router.push('/dashboard/goals')}
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        Set Your First Goal
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
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
