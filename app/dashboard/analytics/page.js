'use client'

import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from '@/lib/i18n'
import DashboardLayout from '@/components/layout/DashboardLayout'
import OnboardingGuard from '@/components/OnboardingGuard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  BarChart3,
  TrendingUp,
  Target,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  PieChart,
  Calendar,
  Sparkles,
  Brain
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend
} from 'recharts'

// Skeleton Component
function AnalyticsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Stats Row Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
            <div className="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        ))}
      </div>

      {/* Tabs Skeleton */}
      <div className="h-10 w-64 bg-slate-200 dark:bg-slate-700 rounded-lg" />

      {/* Charts Skeleton */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 h-80">
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
          <div className="h-60 bg-slate-100 dark:bg-slate-700 rounded" />
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 h-80">
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
          <div className="h-60 bg-slate-100 dark:bg-slate-700 rounded" />
        </div>
      </div>
    </div>
  )
}

// Category colors - expanded with more categories and variations
const CATEGORY_COLORS = {
  // Food & Dining
  food: '#10B981',
  dining: '#10B981',
  groceries: '#059669',
  restaurant: '#34D399',
  'food & dining': '#10B981',

  // Transportation
  transportation: '#3B82F6',
  transport: '#3B82F6',
  travel: '#60A5FA',
  fuel: '#2563EB',
  gas: '#2563EB',

  // Housing & Home
  housing: '#8B5CF6',
  rent: '#8B5CF6',
  home: '#A78BFA',
  mortgage: '#7C3AED',

  // Entertainment
  entertainment: '#F59E0B',
  leisure: '#F59E0B',
  movies: '#FBBF24',
  subscriptions: '#D97706',

  // Healthcare
  healthcare: '#EF4444',
  health: '#EF4444',
  medical: '#F87171',
  medicine: '#DC2626',

  // Shopping
  shopping: '#EC4899',
  clothing: '#F472B6',
  personal: '#DB2777',

  // Utilities
  utilities: '#06B6D4',
  bills: '#06B6D4',
  electricity: '#22D3EE',
  water: '#0891B2',
  internet: '#14B8A6',
  phone: '#0D9488',

  // Education
  education: '#6366F1',
  books: '#818CF8',
  courses: '#4F46E5',

  // Savings & Investment
  savings: '#84CC16',
  investment: '#65A30D',

  // Insurance
  insurance: '#F97316',

  // Other
  other: '#6B7280',
  miscellaneous: '#9CA3AF'
}

// Fallback color palette for categories not in CATEGORY_COLORS
const FALLBACK_COLORS = [
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#6366F1', // Indigo
  '#84CC16', // Lime
  '#F97316', // Orange
  '#14B8A6', // Teal
  '#A855F7', // Fuchsia
]

// Budget category key to expense canonical name mapping
// Budget uses keys like "food_dining", expenses use "Food & Dining"
const BUDGET_TO_EXPENSE_CATEGORY = {
  'food_dining': 'Food & Dining',
  'food': 'Food & Dining',
  'transportation': 'Transportation',
  'transport': 'Transportation',
  'home_utilities': 'Home & Utilities',
  'housing': 'Home & Utilities',
  'utilities': 'Home & Utilities',
  'entertainment': 'Entertainment',
  'shopping': 'Shopping',
  'healthcare': 'Healthcare',
  'health': 'Healthcare',
  'savings': 'Savings',
  'investment': 'Savings',
  'other': 'Other'
}

// Function to convert budget category key to expense category name
const budgetKeyToExpenseCategory = (budgetKey) => {
  const key = budgetKey?.toLowerCase().trim()
  return BUDGET_TO_EXPENSE_CATEGORY[key] || budgetKey
}

// Function to get category color with case-insensitive matching and fallback
const getCategoryColor = (categoryName, index = 0) => {
  const normalizedName = categoryName.toLowerCase().trim()
  if (CATEGORY_COLORS[normalizedName]) {
    return CATEGORY_COLORS[normalizedName]
  }
  // Use fallback color based on index to ensure unique colors
  return FALLBACK_COLORS[index % FALLBACK_COLORS.length]
}

function AnalyticsContent() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [budget, setBudget] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [goals, setGoals] = useState([])
  const [insights, setInsights] = useState([])
  const [activeTab, setActiveTab] = useState('overview')

  // Fetch data
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [budgetRes, expensesRes, goalsRes, insightsRes] = await Promise.all([
        fetch('/api/budget/generate'),
        fetch('/api/expenses?limit=1000'),
        fetch('/api/goals'),
        fetch('/api/insights')
      ])

      const [budgetData, expensesData, goalsData, insightsData] = await Promise.all([
        budgetRes.json(),
        expensesRes.json(),
        goalsRes.json(),
        insightsRes.json()
      ])

      if (budgetData.success) setBudget(budgetData.budget)
      if (expensesData.success) setExpenses(expensesData.expenses || [])
      if (goalsData.success) setGoals(goalsData.goals || [])
      if (insightsData.success) setInsights(insightsData.insights || [])
    } catch (error) {
      console.error('Failed to fetch analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate metrics
  const metrics = useMemo(() => {
    const currentMonth = new Date().toISOString().substring(0, 7)
    const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().substring(0, 7)

    const currentExpenses = expenses
      .filter(e => e.date?.startsWith(currentMonth))
      .reduce((sum, e) => sum + (e.amount || 0), 0)

    const lastExpenses = expenses
      .filter(e => e.date?.startsWith(lastMonth))
      .reduce((sum, e) => sum + (e.amount || 0), 0)

    const totalIncome = budget?.totalBudget || 0
    const savings = Math.max(0, totalIncome - currentExpenses)
    const savingsRate = totalIncome > 0 ? Math.round((savings / totalIncome) * 100) : 0

    const expenseChange = lastExpenses > 0
      ? Math.round(((currentExpenses - lastExpenses) / lastExpenses) * 100)
      : 0

    return {
      totalIncome,
      totalExpenses: currentExpenses,
      savings,
      savingsRate,
      expenseChange,
      activeGoals: goals.length,
      goalsOnTrack: goals.filter(g => (g.currentAmount / g.targetAmount) >= 0.5).length
    }
  }, [budget, expenses, goals])

  // Category data for pie chart
  const categoryData = useMemo(() => {
    const currentMonth = new Date().toISOString().substring(0, 7)
    const monthExpenses = expenses.filter(e => e.date?.startsWith(currentMonth))

    const grouped = monthExpenses.reduce((acc, e) => {
      const cat = (e.category || 'other').toLowerCase().trim()
      acc[cat] = (acc[cat] || 0) + (e.amount || 0)
      return acc
    }, {})

    // First sort by value, then assign colors so top categories get primary colors
    const sorted = Object.entries(grouped)
      .map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        originalName: name,
        value
      }))
      .sort((a, b) => b.value - a.value)

    // Assign colors after sorting - top categories get most distinct colors
    return sorted.map((item, index) => ({
      name: item.name,
      value: item.value,
      color: getCategoryColor(item.originalName, index)
    }))
  }, [expenses])

  // Budget vs Actual data
  const budgetVsActualData = useMemo(() => {
    if (!budget?.categories) return []

    const currentMonth = new Date().toISOString().substring(0, 7)
    const monthExpenses = expenses.filter(e => e.date?.startsWith(currentMonth))

    return Object.entries(budget.categories)
      .filter(([_, data]) => data.amount > 0)
      .map(([budgetKey, data]) => {
        // Convert budget key (e.g., "food_dining") to expense category (e.g., "Food & Dining")
        const expenseCategory = budgetKeyToExpenseCategory(budgetKey)

        // Match expenses by comparing with the canonical expense category name
        const spent = monthExpenses
          .filter(e => {
            const expenseCat = e.category?.toLowerCase().trim()
            const targetCat = expenseCategory?.toLowerCase().trim()
            return expenseCat === targetCat
          })
          .reduce((sum, e) => sum + (e.amount || 0), 0)

        // Use the englishName from budget data if available, otherwise format the key
        const displayName = data.englishName ||
          budgetKey.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

        return {
          name: displayName,
          budget: data.amount,
          spent
        }
      })
      .slice(0, 6)
  }, [budget, expenses])

  // Monthly trend data
  const trendData = useMemo(() => {
    const months = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthKey = date.toISOString().substring(0, 7)
      const monthName = date.toLocaleDateString('en-IN', { month: 'short' })

      const monthExpenses = expenses
        .filter(e => e.date?.startsWith(monthKey))
        .reduce((sum, e) => sum + (e.amount || 0), 0)

      const income = budget?.totalBudget || 0

      months.push({
        name: monthName,
        expenses: monthExpenses,
        savings: Math.max(0, income - monthExpenses)
      })
    }
    return months
  }, [expenses, budget])

  if (loading) {
    return (
      <DashboardLayout title={t('analytics.title')}>
        <AnalyticsSkeleton />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title={t('analytics.title')}>
      <div className="space-y-4 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              {t('analytics.financialAnalytics')}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t('analytics.insightsFor')} {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchData} className="gap-2 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">
            <RefreshCw className="w-4 h-4" />
            {t('analytics.refresh')}
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/50 rounded-lg">
                  <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t('analytics.monthlyIncome')}</p>
                  <p className="text-lg font-semibold text-slate-800 dark:text-white">
                    ₹{metrics.totalIncome.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
                  <ArrowDownRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t('analytics.totalExpenses')}</p>
                  <p className="text-lg font-semibold text-slate-800 dark:text-white">
                    ₹{metrics.totalExpenses.toLocaleString('en-IN')}
                  </p>
                  {metrics.expenseChange !== 0 && (
                    <p className={`text-xs ${metrics.expenseChange > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                      {metrics.expenseChange > 0 ? '↑' : '↓'} {Math.abs(metrics.expenseChange)}%
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/50 rounded-lg">
                  <ArrowUpRight className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t('analytics.savings')}</p>
                  <p className="text-lg font-semibold text-slate-800 dark:text-white">
                    ₹{metrics.savings.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-slate-400">{metrics.savingsRate}% {t('analytics.saved')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 dark:bg-amber-900/50 rounded-lg">
                  <Target className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t('analytics.activeGoals')}</p>
                  <p className="text-lg font-semibold text-slate-800 dark:text-white">{metrics.activeGoals}</p>
                  <p className="text-xs text-slate-400">{metrics.goalsOnTrack} {t('analytics.onTrack')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-slate-100 dark:bg-slate-800 p-1">
            <TabsTrigger value="overview" className="gap-2 text-sm data-[state=active]:dark:bg-slate-700 data-[state=active]:dark:text-white dark:text-slate-400">
              <BarChart3 className="w-4 h-4" />
              {t('analytics.overview')}
            </TabsTrigger>
            <TabsTrigger value="spending" className="gap-2 text-sm data-[state=active]:dark:bg-slate-700 data-[state=active]:dark:text-white dark:text-slate-400">
              <PieChart className="w-4 h-4" />
              {t('analytics.spending')}
            </TabsTrigger>
            <TabsTrigger value="trends" className="gap-2 text-sm data-[state=active]:dark:bg-slate-700 data-[state=active]:dark:text-white dark:text-slate-400">
              <TrendingUp className="w-4 h-4" />
              {t('analytics.trends')}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Budget vs Actual */}
              <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    {t('analytics.budgetVsActual')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {budgetVsActualData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={budgetVsActualData} layout="vertical">
                        <XAxis type="number" tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} fontSize={10} tick={{ fill: '#94a3b8' }} />
                        <YAxis type="category" dataKey="name" width={80} fontSize={10} tick={{ fill: '#94a3b8' }} />
                        <Tooltip
                          formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, '']}
                          contentStyle={{ fontSize: 12, backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                          labelStyle={{ color: '#f1f5f9' }}
                          itemStyle={{ color: '#f1f5f9' }}
                        />
                        <Bar dataKey="budget" fill="#10B981" name="Budget" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="spent" fill="#3B82F6" name="Spent" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-60 flex items-center justify-center text-slate-400 text-sm">
                      {t('analytics.noData')}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Savings Progress */}
              <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    {t('analytics.savingsProgress')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center h-60">
                    {/* Circular Progress */}
                    <div className="relative w-36 h-36">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="72"
                          cy="72"
                          r="60"
                          className="stroke-slate-200 dark:stroke-slate-700"
                          strokeWidth="12"
                          fill="none"
                        />
                        <circle
                          cx="72"
                          cy="72"
                          r="60"
                          stroke={metrics.savingsRate >= 100 ? '#10B981' : '#10B981'}
                          strokeWidth="12"
                          fill="none"
                          strokeDasharray={`${Math.min(metrics.savingsRate, 100) * 3.77} 377`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                          {Math.min(metrics.savingsRate, 100)}%
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{t('analytics.ofTarget')}</span>
                      </div>
                    </div>

                    {metrics.savingsRate >= 100 && (
                      <div className="mt-3 flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-sm font-medium">{t('analytics.targetExceeded')}</span>
                      </div>
                    )}

                    <div className="mt-4 grid grid-cols-2 gap-6 text-center">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{t('analytics.currentSavings')}</p>
                        <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                          ₹{metrics.savings.toLocaleString('en-IN')}
                        </p>
                        <p className="text-xs text-slate-400">{metrics.savingsRate}% {t('analytics.ofIncome')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{t('analytics.targetSavings')}</p>
                        <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                          ₹{Math.round(metrics.totalIncome * 0.15).toLocaleString('en-IN')}
                        </p>
                        <p className="text-xs text-slate-400">15% {t('analytics.ofIncome')}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Trend */}
            <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  {t('analytics.trends')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" fontSize={10} tick={{ fill: '#94a3b8' }} />
                    <YAxis tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} fontSize={10} tick={{ fill: '#94a3b8' }} />
                    <Tooltip
                      formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, '']}
                      contentStyle={{ fontSize: 12, backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      labelStyle={{ color: '#f1f5f9' }}
                      itemStyle={{ color: '#f1f5f9' }}
                    />
                    <Legend wrapperStyle={{ color: '#94a3b8' }} />
                    <Area
                      type="monotone"
                      dataKey="expenses"
                      stroke="#3B82F6"
                      fillOpacity={1}
                      fill="url(#colorExpenses)"
                      name="Expenses"
                    />
                    <Area
                      type="monotone"
                      dataKey="savings"
                      stroke="#10B981"
                      fillOpacity={1}
                      fill="url(#colorSavings)"
                      name="Savings"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Spending Tab */}
          <TabsContent value="spending" className="space-y-4 mt-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Category Pie */}
              <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    {t('analytics.spending')} by Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {categoryData.length > 0 ? (
                    <div className="relative">
                      <ResponsiveContainer width="100%" height={280}>
                        <RechartsPie>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={3}
                            dataKey="value"
                            stroke="none"
                          >
                            {categoryData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={entry.color}
                                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value, name, props) => [
                              `₹${value.toLocaleString('en-IN')}`,
                              props.payload.name
                            ]}
                            contentStyle={{
                              fontSize: 12,
                              backgroundColor: '#1e293b',
                              border: '1px solid #334155',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                            }}
                            labelStyle={{ color: '#f1f5f9', fontWeight: 600 }}
                            itemStyle={{ color: '#f1f5f9' }}
                          />
                        </RechartsPie>
                      </ResponsiveContainer>
                      {/* Center total */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                          <p className="text-xs text-slate-500 dark:text-slate-400">Total</p>
                          <p className="text-lg font-bold text-slate-800 dark:text-white">
                            ₹{categoryData.reduce((sum, c) => sum + c.value, 0).toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-72 flex items-center justify-center text-slate-400 text-sm">
                      {t('analytics.noData')}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Category List */}
              <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Category Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {categoryData.slice(0, 6).map((cat, i) => {
                      const total = categoryData.reduce((sum, c) => sum + c.value, 0)
                      const percent = total > 0 ? Math.round((cat.value / total) * 100) : 0

                      return (
                        <div key={i} className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: cat.color }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-700 dark:text-slate-200 truncate">{cat.name}</span>
                              <span className="text-slate-500 dark:text-slate-400 ml-2">₹{cat.value.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="mt-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${percent}%`, backgroundColor: cat.color }}
                              />
                            </div>
                          </div>
                          <span className="text-xs text-slate-400 w-10 text-right">{percent}%</span>
                        </div>
                      )
                    })}
                    {categoryData.length === 0 && (
                      <p className="text-center text-slate-400 text-sm py-8">{t('analytics.noData')}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-4 mt-4">
            <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  {t('analytics.monthlySummary')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[0, 1, 2, 3, 4, 5].map((i) => {
                    const date = new Date()
                    date.setMonth(date.getMonth() - i)
                    const monthKey = date.toISOString().substring(0, 7)
                    const monthExpenses = expenses.filter(e => e.date?.startsWith(monthKey))
                    const total = monthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0)
                    const income = budget?.totalBudget || 0
                    const saved = income - total
                    const hasData = monthExpenses.length > 0

                    return (
                      <div key={monthKey} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-700 dark:text-slate-200 text-sm">
                            {date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                          </p>
                          <p className="text-xs text-slate-400">
                            {hasData ? `${monthExpenses.length} ${t('analytics.transactions').toLowerCase()}` : t('analytics.noTransactions')}
                          </p>
                        </div>
                        <div className="text-right">
                          {hasData ? (
                            <>
                              <p className="font-semibold text-slate-700 dark:text-slate-200 text-sm">
                                ₹{total.toLocaleString('en-IN')}
                              </p>
                              <p className={`text-xs ${saved >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                                {saved >= 0 ? '+' : ''}₹{saved.toLocaleString('en-IN')} saved
                              </p>
                            </>
                          ) : (
                            <p className="text-sm text-slate-400">{t('analytics.noData')}</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  {t('analytics.aiPoweredInsights')}
                  {insights.length > 0 && (
                    <span className="text-xs bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full">
                      {insights.length} {t('analytics.new')}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {insights.length > 0 ? (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {insights.slice(0, 6).map((insight, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${
                          insight.type === 'warning'
                            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
                            : insight.type === 'success'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
                            : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800'
                        }`}
                      >
                        <p className="text-sm text-slate-700 dark:text-slate-200">{insight.message}</p>
                        {insight.suggestion && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{insight.suggestion}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Sparkles className="w-10 h-10 text-slate-200 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">{t('analytics.addMoreData')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

export default function AnalyticsPage() {
  return (
    <OnboardingGuard>
      <AnalyticsContent />
    </OnboardingGuard>
  )
}
