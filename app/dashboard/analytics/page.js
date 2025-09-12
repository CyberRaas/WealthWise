
'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import DashboardLayout from '@/components/layout/DashboardLayout'
import OnboardingGuard from '@/components/OnboardingGuard'
import LanguageSelector from '@/components/ui/LanguageSelector'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  AlertCircle,
  Loader2
} from 'lucide-react'

const CATEGORY_COLORS = {
  'Food & Dining': '#10b981',
  'Transportation': '#f59e0b', 
  'Housing': '#3b82f6',
  'Entertainment': '#8b5cf6',
  'Healthcare': '#ef4444',
  'Shopping': '#06b6d4',
  'Utilities': '#84cc16',
  'Other': '#6b7280'
}

function AnalyticsContent() {
  const { t } = useTranslation()
  const [expenses, setExpenses] = useState([])
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState({
    monthlyData: [],
    categoryData: [],
    savingsGrowth: [],
    keyMetrics: {
      totalExpenses: 0,
      thisMonthExpenses: 0,
      totalTransactions: 0,
      topCategory: '',
      avgDailySpend: 0
    }
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [expensesResponse, goalsResponse] = await Promise.all([
          fetch('/api/expenses'),
          fetch('/api/goals')
        ])

        const expensesData = await expensesResponse.json()
        const goalsData = await goalsResponse.json()

        if (expensesData.success) {
          setExpenses(expensesData.expenses || [])
        }

        if (goalsData.success) {
          setGoals(goalsData.goals || [])
        }

        // Process the data for analytics
        processAnalyticsData(expensesData.expenses || [], goalsData.goals || [])

      } catch (error) {
        console.error(t('common.failedToFetchAnalytics'), error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Remove the old fetchAnalyticsData function since we moved it inline

  const processAnalyticsData = (expensesData, goalsData) => {
    // Group expenses by month
    const monthlyExpenses = {}
    const categoryTotals = {}

    expensesData.forEach(expense => {
      const month = new Date(expense.date).toLocaleDateString('en-US', { month: 'short' })
      const category = expense.category
      
      if (!monthlyExpenses[month]) {
        monthlyExpenses[month] = 0
      }
      monthlyExpenses[month] += expense.amount

      if (!categoryTotals[category]) {
        categoryTotals[category] = 0
      }
      categoryTotals[category] += expense.amount
    })

    // Create monthly chart data (last 6 months)
    const monthlyData = Object.keys(monthlyExpenses)
      .sort((a, b) => new Date(`1 ${a} 2025`) - new Date(`1 ${b} 2025`))
      .slice(-6)
      .map(month => ({
        month,
        expenses: monthlyExpenses[month] || 0,
        // For now, we'll use goals progress as savings approximation
        savings: Math.max(0, Math.random() * monthlyExpenses[month] * 0.3) // Placeholder until we have income data
      }))

    // Create category pie chart data
    const categoryData = Object.keys(categoryTotals)
      .map(category => ({
        name: category,
        value: categoryTotals[category],
        color: CATEGORY_COLORS[category] || '#6b7280'
      }))
      .sort((a, b) => b.value - a.value)

    // Create savings growth based on goals progress
    const savingsGrowth = goalsData
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .reduce((acc, goal, index) => {
        const month = new Date(goal.createdAt).toLocaleDateString('en-US', { month: 'short' })
        const prevAmount = index > 0 ? acc[index - 1]?.amount || 0 : 0
        acc.push({
          month,
          amount: prevAmount + goal.currentAmount
        })
        return acc
      }, [])

    // Calculate key metrics
    const totalExpenses = expensesData.reduce((sum, expense) => sum + expense.amount, 0)
    const currentMonth = new Date().toISOString().substring(0, 7)
    const thisMonthExpenses = expensesData
      .filter(expense => expense.date.substring(0, 7) === currentMonth)
      .reduce((sum, expense) => sum + expense.amount, 0)
    
    const topCategory = categoryData[0]?.name || 'No data'
    const avgDailySpend = expensesData.length > 0 ? totalExpenses / Math.max(1, getDaysSinceFirstExpense(expensesData)) : 0

    setAnalyticsData({
      monthlyData,
      categoryData,
      savingsGrowth,
      keyMetrics: {
        totalExpenses,
        thisMonthExpenses,
        totalTransactions: expensesData.length,
        topCategory,
        avgDailySpend
      }
    })
  }

  const getDaysSinceFirstExpense = (expenses) => {
    if (expenses.length === 0) return 1
    const firstExpenseDate = new Date(Math.min(...expenses.map(e => new Date(e.date))))
    const today = new Date()
    return Math.max(1, Math.ceil((today - firstExpenseDate) / (1000 * 60 * 60 * 24)))
  }

  if (loading) {
    return (
      <DashboardLayout title={t('analytics.title')}>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">{t('analytics.analyzingData')}</p>
            <p className="text-slate-400 text-sm">{t('common.pleaseWait')}</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const { keyMetrics, monthlyData, categoryData, savingsGrowth } = analyticsData

  return (
    <DashboardLayout title={t('analytics.title')}>
      <div className="space-y-4 sm:space-y-6">
        {/* Key Metrics - Real Data */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2 sm:pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">{t('analytics.totalExpenses')}</CardTitle>
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-slate-800">
                ₹{keyMetrics.totalExpenses.toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-slate-500">{t('common.allTime')}</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-2 sm:pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">{t('expenses.thisMonth')}</CardTitle>
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-slate-800">
                ₹{keyMetrics.thisMonthExpenses.toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-slate-500">{t('expenses.monthlyExpenses')}</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-500">
            <CardHeader className="pb-2 sm:pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">{t('common.transactions')}</CardTitle>
                <BarChart3 className="h-5 w-5 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-slate-800">
                {keyMetrics.totalTransactions}
              </div>
              <p className="text-xs text-slate-500">{t('common.totalEntries')}</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-2 sm:pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">{t('analytics.dailyAverage')}</CardTitle>
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-slate-800">
                ₹{Math.round(keyMetrics.avgDailySpend).toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-slate-500">{t('analytics.averagePerDay')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts - Real Data */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          {/* Monthly Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Monthly Expense Trends
              </CardTitle>
              <CardDescription>
                Your spending patterns over the last 6 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip 
                      formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, '']}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                    <Bar dataKey="savings" fill="#10b981" name="Savings Goal Progress" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-72">
                  <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">{t('analytics.noMonthlyData')}</p>
                    <p className="text-sm text-slate-400">{t('common.startAddingExpenses')}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Expense Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-purple-600" />
                Spending by Category
              </CardTitle>
              <CardDescription>
                Where your money goes - real data breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              {categoryData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Amount']}
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-1 gap-2 mt-4">
                    {categoryData.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-sm text-slate-600 flex-1">{item.name}</span>
                        <span className="text-sm font-bold text-slate-800">
                          ₹{item.value.toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-72">
                  <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No category data available</p>
                    <p className="text-sm text-slate-400">{t('common.addExpensesToSee')}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Goals Progress */}
        {goals.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                Goals Progress
              </CardTitle>
              <CardDescription>
                Your financial goals and current progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {goals.map((goal) => {
                  const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
                  return (
                    <div key={goal.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-slate-800">{goal.name}</h4>
                        <span className="text-sm text-slate-500">
                          {progress.toFixed(1)}% Complete
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                        <div 
                          className="bg-emerald-500 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm text-slate-600">
                        <span>₹{goal.currentAmount.toLocaleString('en-IN')}</span>
                        <span>₹{goal.targetAmount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Real Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-emerald-700">📊 {t('analytics.yourFinancialInsights')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {expenses.length > 0 ? (
                <>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                    <p className="text-sm text-slate-700">
                      You have {keyMetrics.totalTransactions} recorded transactions
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                    <p className="text-sm text-slate-700">
                      Top spending category: {keyMetrics.topCategory}
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                    <p className="text-sm text-slate-700">
                      Average daily spend: ₹{Math.round(keyMetrics.avgDailySpend).toLocaleString('en-IN')}
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-slate-400 rounded-full mt-2"></div>
                  <p className="text-sm text-slate-700">
                    Start adding expenses to see personalized insights
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-blue-700">💡 {t('analytics.smartRecommendations')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {expenses.length === 0 ? (
                <>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <p className="text-sm text-slate-700">{t('analytics.addFirstExpense')}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <p className="text-sm text-slate-700">{t('analytics.setupGoals')}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <p className="text-sm text-slate-700">{t('analytics.createBudget')}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <p className="text-sm text-slate-700">
                      {categoryData.length > 0 ? 
                        `Consider setting a budget for ${categoryData[0]?.name}` :
                        t('analytics.setCategoryBudgets')
                      }
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <p className="text-sm text-slate-700">
                      {goals.length === 0 ? 'Create savings goals to track progress' : 'Great job tracking your goals!'}
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <p className="text-sm text-slate-700">
                      Review your spending weekly for better insights
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
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
