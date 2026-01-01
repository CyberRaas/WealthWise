'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
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
  Cell
} from 'recharts'
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  BarChart3
} from 'lucide-react'

// Unified color map including lowercase category keys used by voice expenses
const CATEGORY_COLORS = {
  // Food
  'खाना-पीना': '#FF6B6B',
  'Food': '#FF6B6B',
  'Food & Dining': '#FF6B6B',
  'food': '#FF6B6B',
  'food & dining': '#FF6B6B',
  // Home / Utilities
  'घर का खर्च': '#4ECDC4', 
  'Home': '#4ECDC4',
  'Home & Utilities': '#4ECDC4',
  'Utilities': '#4ECDC4',
  'utilities': '#4ECDC4',
  'home': '#4ECDC4',
  'home & utilities': '#4ECDC4',
  // Transport
  'यातायात': '#45B7D1',
  'Transport': '#45B7D1',
  'Transportation': '#45B7D1',
  'transport': '#45B7D1',
  'transportation': '#45B7D1',
  // Entertainment
  'मनोरंजन': '#96CEB4',
  'Entertainment': '#96CEB4',
  'entertainment': '#96CEB4',
  // Shopping
  'कपड़े-लत्ते': '#FECA57',
  'Shopping': '#FECA57',
  'shopping': '#FECA57',
  // Healthcare
  'दवाई-इलाज': '#FF9FF3',
  'Healthcare': '#FF9FF3',
  'healthcare': '#FF9FF3',
  // Savings
  'बचत': '#54A0FF',
  'Savings': '#54A0FF',
  'savings': '#54A0FF',
  // Other fallback
  'other': '#64748B',
  'Other': '#64748B'
}

export default function ExpenseTrackingDashboard({ budget, refreshTrigger }) {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [categorySpending, setCategorySpending] = useState({})
  const [monthlyTotal, setMonthlyTotal] = useState(0)

  // Get current month in YYYY-MM format
  const currentMonth = new Date().toISOString().substring(0, 7)

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await fetch(`/api/expenses?month=${currentMonth}&limit=20`)
        const data = await response.json()
        
        if (data.success) {
          setExpenses(data.expenses)
          setCategorySpending(data.categoryTotals || {})
          setMonthlyTotal(data.monthlyTotal || 0)
        }
      } catch (error) {
        console.error('Failed to fetch expenses:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchExpenses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger]) // Refresh when refreshTrigger changes

  // Calculate spending vs budget for each category
  const getSpendingAnalysis = () => {
    if (!budget || !budget.categories) return []

    return Object.entries(budget.categories).map(([key, category]) => {
      // Canonical English name used in aggregation now
      const canonical = category.englishName
      const lookupKeys = [
        canonical,
        canonical.toLowerCase(),
        key,
        key.toLowerCase(),
        category.hinglishName,
        category?.hinglishName?.toLowerCase?.()
      ].filter(Boolean)
      const spent = lookupKeys.reduce((val, k) => (
        typeof categorySpending[k] === 'number' ? categorySpending[k] : val
      ), 0)
      const budget_amount = category.amount
      const percentage_used = budget_amount > 0 ? (spent / budget_amount) * 100 : 0
      const remaining = budget_amount - spent
      
      return {
        key,
        category: category.englishName,
        hinglishName: category.hinglishName,
        emoji: category.emoji,
        budgeted: budget_amount,
        spent: spent,
        remaining: Math.max(remaining, 0),
        percentageUsed: percentage_used,
        status: percentage_used > 100 ? 'over' : percentage_used > 80 ? 'warning' : 'good',
        color: CATEGORY_COLORS[category.englishName] || CATEGORY_COLORS[category.hinglishName] || '#95A5A6'
      }
    })
  }

  const spendingAnalysis = getSpendingAnalysis()
  const totalBudget = budget?.totalBudget || 0
  const budgetUtilization = totalBudget > 0 ? (monthlyTotal / totalBudget) * 100 : 0

  const getStatusIcon = (status) => {
    switch (status) {
      case 'over': return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'warning': return <Clock className="w-4 h-4 text-yellow-500" />
      default: return <CheckCircle className="w-4 h-4 text-green-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'over': return 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900'
      case 'warning': return 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-900'
      default: return 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900'
    }
  }

  if (loading) {
    return (
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 dark:border dark:border-slate-700 shadow-lg">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading expense data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Monthly Overview - Simplified */}
      <Card className="border dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800 rounded-xl">
        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border dark:border-slate-700">
              <div className="text-xl">📊</div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Budget</p>
                <p className="text-lg font-semibold text-slate-800 dark:text-white">₹{totalBudget.toLocaleString('en-IN')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border dark:border-slate-700">
              <div className="text-xl">💸</div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Spent</p>
                <p className="text-lg font-semibold text-slate-800 dark:text-white">₹{monthlyTotal.toLocaleString('en-IN')}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{budgetUtilization.toFixed(1)}% used</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border dark:border-slate-700">
              <div className="text-xl">💰</div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Remaining</p>
                <p className="text-lg font-semibold text-slate-800 dark:text-white">₹{Math.max(totalBudget - monthlyTotal, 0).toLocaleString('en-IN')}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{Math.max(100 - budgetUtilization, 0).toFixed(1)}% left</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border dark:border-slate-700">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full" style={{
                  background: `conic-gradient(${budgetUtilization > 100 ? '#dc2626' : '#0ea5e9'} ${Math.min(budgetUtilization,100)}%, #e2e8f0 ${Math.min(budgetUtilization,100)}%)`
                }}></div>
                <div className="absolute inset-[6px] bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-xs font-semibold text-slate-700 dark:text-white">
                  {budgetUtilization.toFixed(0)}%
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Progress</p>
                <div className="w-28 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-1">
                  <div className={`h-2 ${budgetUtilization>100?'bg-red-500':budgetUtilization>80?'bg-amber-500':'bg-emerald-500'}`} style={{width:`${Math.min(budgetUtilization,100)}%`}}></div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Monthly</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Spending Breakdown - Redesigned */}
      <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 dark:border dark:border-slate-700 shadow-lg">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center dark:text-white">
                <BarChart3 className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                Category Spending ({new Date().toLocaleString('default', { month: 'long' })})
              </CardTitle>
              <CardDescription className="dark:text-slate-400">
                Live view of spending vs budget (voice + manual)
              </CardDescription>
            </div>
            <div className="flex gap-2 text-xs">
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 rounded-full">Good &lt; 80%</span>
              <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 rounded-full">Watch 80-100%</span>
              <span className="px-2 py-1 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-full">Over &gt; 100%</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {spendingAnalysis.length === 0 && (
            <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">No categories to display</div>
          )}
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {spendingAnalysis.map(item => {
              const pct = Math.min(item.percentageUsed, 150) // allow overflow indication
              const ringPct = Math.min(item.percentageUsed, 100)
              const color = item.status === 'over' ? '#dc2626' : item.status === 'warning' ? '#f59e0b' : item.color
              return (
                <div key={item.key} className="relative group p-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl" style={{background: color + '20'}}>
                        {item.emoji}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white leading-tight">{item.hinglishName}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">₹{item.spent.toLocaleString('en-IN')} / ₹{item.budgeted.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="relative w-12 h-12">
                        <div className="absolute inset-0 rounded-full" style={{
                          background: `conic-gradient(${color} ${ringPct}%, #e5e7eb ${ringPct}%)`
                        }}></div>
                        <div className="absolute inset-[4px] bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-700 dark:text-white">
                          {Math.round(item.percentageUsed)}%
                        </div>
                      </div>
                      <div className="mt-1">
                        {getStatusIcon(item.status)}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Progress</span>
                      <span className={item.status === 'over' ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-600 dark:text-gray-400'}>
                        ₹{item.remaining.toLocaleString('en-IN')} left
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-2 rounded-full transition-all" style={{
                        width: `${Math.min(pct, 100)}%`,
                        background: item.status === 'over' ? 'linear-gradient(to right,#f87171,#dc2626)' : item.status === 'warning' ? 'linear-gradient(to right,#fbbf24,#f59e0b)' : `linear-gradient(to right,${color},#16a34a)`
                      }}></div>
                    </div>
                    {item.status === 'over' && (
                      <p className="text-xs text-red-600 dark:text-red-400 font-medium">Over by ₹{(item.spent - item.budgeted).toLocaleString('en-IN')}</p>
                    )}
                  </div>
                  <div className="absolute inset-0 rounded-xl ring-1 ring-transparent group-hover:ring-blue-200 dark:group-hover:ring-blue-800 pointer-events-none"></div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Expenses List */}
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 dark:border dark:border-slate-700 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center dark:text-white">
            <Calendar className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
            Recent Expenses
          </CardTitle>
          <CardDescription className="dark:text-slate-400">
            Your latest expense entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No expenses recorded yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Start adding expenses with voice or manual entry!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {expenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors group">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full`} style={{
                      backgroundColor: CATEGORY_COLORS[expense.category] || '#95A5A6'
                    }}></div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        {expense.description || expense.category}
                        <button
                          onClick={async () => {
                            try {
                              const res = await fetch(`/api/expenses?id=${expense.id}`, { method: 'DELETE' })
                              const data = await res.json()
                              if (data.success) {
                                setExpenses(prev => prev.filter(e => e.id !== expense.id))
                                // Recompute category spending after delete
                                const updatedCategoryTotals = {...categorySpending}
                                const cat = expense.category
                                if (typeof updatedCategoryTotals[cat] === 'number') {
                                  updatedCategoryTotals[cat] -= expense.amount
                                  if (updatedCategoryTotals[cat] <= 0) delete updatedCategoryTotals[cat]
                                }
                                setCategorySpending(updatedCategoryTotals)
                              }
                            } catch (err) {
                              console.error('Delete expense failed', err)
                            }
                          }}
                          className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-opacity text-xs"
                          title="Delete expense"
                        >
                          ✕
                        </button>
                      </p>
                      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                        <span>{expense.category}</span>
                        <span>•</span>
                        <span>{new Date(expense.date).toLocaleDateString('en-IN')}</span>
                        {expense.entryMethod === 'voice' && (
                          <>
                            <span>•</span>
                            <Badge variant="outline" className="text-xs dark:border-slate-600 dark:text-slate-300">Voice</Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      ₹{expense.amount.toLocaleString('en-IN')}
                    </p>
                    {expense.merchant && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">{expense.merchant}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Spending Insights */}
      {spendingAnalysis.some(item => item.status === 'over' || item.status === 'warning') && (
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 dark:border dark:border-slate-700 shadow-lg border-l-4 border-l-yellow-500">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-700 dark:text-yellow-400">
              <AlertTriangle className="w-5 h-5 mr-2" />
              💡 Spending Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {spendingAnalysis
                .filter(item => item.status === 'over' || item.status === 'warning')
                .map((item) => (
                  <div key={item.key} className="p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg">
                    <p className="font-medium text-yellow-800 dark:text-yellow-300">
                      {item.emoji} {item.hinglishName}: {
                        item.status === 'over'
                          ? `₹${(item.spent - item.budgeted).toLocaleString('en-IN')} over budget!`
                          : `Approaching budget limit (${item.percentageUsed.toFixed(0)}%)`
                      }
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                      {item.status === 'over'
                        ? 'Consider reducing expenses in this category'
                        : 'Monitor spending carefully for the rest of the month'
                      }
                    </p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
