
'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import DashboardLayout from '@/components/layout/DashboardLayout'
import OnboardingGuard from '@/components/OnboardingGuard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  AlertCircle,
  Loader2,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight
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
        console.error('Failed to fetch analytics data:', error)
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
      <div className="space-y-6">
        {/* Simple Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">
                    ₹{(keyMetrics.totalExpenses / 1000).toFixed(1)}k
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Total Spent</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                </div>
                <div className="min-w-0">
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">
                    ₹{(keyMetrics.thisMonthExpenses / 1000).toFixed(1)}k
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">This Month</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">
                    {keyMetrics.totalTransactions}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Transactions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                </div>
                <div className="min-w-0">
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">
                    ₹{Math.round(keyMetrics.avgDailySpend).toLocaleString('en-IN')}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Avg/Day</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interactive Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trends Chart - Enhanced */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Monthly Trends</CardTitle>
                  <CardDescription className="mt-1">Last 6 months spending pattern</CardDescription>
                </div>
                <BarChart3 className="w-5 h-5 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="month"
                      stroke="#6b7280"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis
                      stroke="#6b7280"
                      style={{ fontSize: '12px' }}
                      tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value, name) => [
                        `₹${value.toLocaleString('en-IN')}`,
                        name === 'expenses' ? 'Expenses' : 'Savings'
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="expenses"
                      stroke="#ef4444"
                      strokeWidth={2}
                      fill="url(#colorExpenses)"
                    />
                    <Area
                      type="monotone"
                      dataKey="savings"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#colorSavings)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px]">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <BarChart3 className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-900 font-medium mb-1">No data yet</p>
                    <p className="text-sm text-gray-600">Add expenses to see trends</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Category Pie Chart - Enhanced */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Spending by Category</CardTitle>
                  <CardDescription className="mt-1">Expense distribution</CardDescription>
                </div>
                <PieChartIcon className="w-5 h-5 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent>
              {categoryData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                            stroke="#fff"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        formatter={(value, name, props) => {
                          const percentage = ((value / keyMetrics.totalExpenses) * 100).toFixed(1)
                          return [`₹${value.toLocaleString('en-IN')} (${percentage}%)`, props.payload.name]
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Legend with interactive styling */}
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {categoryData.slice(0, 6).map((item, index) => {
                      const percentage = ((item.value / keyMetrics.totalExpenses) * 100).toFixed(1)
                      return (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 truncate">{item.name}</p>
                            <p className="text-xs text-gray-600">{percentage}%</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-[250px]">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <PieChartIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-900 font-medium mb-1">No categories yet</p>
                    <p className="text-sm text-gray-600">Add expenses to see breakdown</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Category Breakdown with Progress Bars */}
        {categoryData.length > 0 && (
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Detailed Category Breakdown</CardTitle>
              <CardDescription className="mt-1">Complete spending analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryData.map((item, index) => {
                  const percentage = ((item.value / keyMetrics.totalExpenses) * 100).toFixed(1)
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="font-medium text-gray-900 truncate text-sm">{item.name}</span>
                        </div>
                        <span className="text-sm text-gray-600 ml-2">{percentage}%</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500 hover:opacity-80"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: item.color
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                          ₹{item.value.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Monthly Trends - Interactive Cards */}
        {monthlyData.length > 0 && (
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Monthly Comparison</CardTitle>
                  <CardDescription className="mt-1">Month-over-month analysis</CardDescription>
                </div>
                <ShoppingBag className="w-5 h-5 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {monthlyData.map((month, index) => {
                  const isIncrease = index > 0 && month.expenses > monthlyData[index - 1].expenses
                  const change = index > 0
                    ? ((month.expenses - monthlyData[index - 1].expenses) / monthlyData[index - 1].expenses * 100).toFixed(1)
                    : 0

                  return (
                    <div
                      key={index}
                      className="p-4 rounded-xl border-2 border-gray-100 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">{month.month}</span>
                        {index > 0 && change != 0 && (
                          <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${isIncrease
                              ? 'bg-red-100 text-red-700'
                              : 'bg-emerald-100 text-emerald-700'
                            }`}>
                            {isIncrease ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {Math.abs(change)}%
                          </span>
                        )}
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        ₹{(month.expenses / 1000).toFixed(1)}k
                      </div>
                      <div className="text-xs text-gray-600">
                        Spent this month
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Goals Progress - Simplified */}
        {goals.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Goals Progress</CardTitle>
                  <CardDescription className="mt-1">{goals.length} active {goals.length === 1 ? 'goal' : 'goals'}</CardDescription>
                </div>
                <TrendingUp className="w-5 h-5 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {goals.map((goal) => {
                  const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
                  const isCompleted = goal.status === 'completed'

                  return (
                    <div key={goal.id} className="p-4 rounded-xl border-2 border-gray-100 hover:border-gray-200 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{goal.name}</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {progress.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                        <div
                          className={`h-full rounded-full transition-all ${isCompleted ? 'bg-emerald-500' :
                              progress > 75 ? 'bg-blue-500' :
                                progress > 50 ? 'bg-cyan-500' : 'bg-gray-400'
                            }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
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

        {/* Quick Insights */}
        {expenses.length > 0 && (
          <Card className="border-l-4 border-l-emerald-500">
            <CardHeader>
              <CardTitle className="text-lg">Quick Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm text-gray-700">
                    You have <span className="font-semibold">{keyMetrics.totalTransactions}</span> recorded transactions
                  </p>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm text-gray-700">
                    Top spending: <span className="font-semibold">{keyMetrics.topCategory}</span>
                  </p>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm text-gray-700">
                    Daily average: <span className="font-semibold">₹{Math.round(keyMetrics.avgDailySpend).toLocaleString('en-IN')}</span>
                  </p>
                </div>

                {categoryData.length > 0 && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <p className="text-sm text-gray-700">
                      💡 Consider setting a budget for <span className="font-semibold">{categoryData[0]?.name}</span>
                    </p>
                  </div>
                )}

                {goals.length === 0 && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <p className="text-sm text-gray-700">
                      💡 Create savings goals to track your progress
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
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
