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

const CATEGORY_COLORS = {
  'खाना-पीना': '#FF6B6B',
  'Food': '#FF6B6B',
  'घर का खर्च': '#4ECDC4', 
  'Home': '#4ECDC4',
  'यातायात': '#45B7D1',
  'Transport': '#45B7D1',
  'मनोरंजन': '#96CEB4',
  'Entertainment': '#96CEB4',
  'कपड़े-लत्ते': '#FECA57',
  'Shopping': '#FECA57',
  'दवाई-इलाज': '#FF9FF3',
  'Healthcare': '#FF9FF3',
  'बचत': '#54A0FF',
  'Savings': '#54A0FF'
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
      const spent = categorySpending[category.englishName] || categorySpending[category.hinglishName] || 0
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
      case 'over': return 'bg-red-50 border-red-200'
      case 'warning': return 'bg-yellow-50 border-yellow-200'
      default: return 'bg-green-50 border-green-200'
    }
  }

  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading expense data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Monthly Overview */}
      <Card className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">📊 Budget Overview</h3>
              <div className="text-3xl font-bold">₹{totalBudget.toLocaleString('en-IN')}</div>
              <p className="text-blue-100">Monthly Budget</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">💸 Total Spent</h3>
              <div className="text-3xl font-bold">₹{monthlyTotal.toLocaleString('en-IN')}</div>
              <p className="text-blue-100">{budgetUtilization.toFixed(1)}% of budget</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">💰 Remaining</h3>
              <div className="text-3xl font-bold">₹{Math.max(totalBudget - monthlyTotal, 0).toLocaleString('en-IN')}</div>
              <p className="text-blue-100">{Math.max(100 - budgetUtilization, 0).toFixed(1)}% remaining</p>
            </div>
          </div>
          
          {/* Overall Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Monthly Progress</span>
              <span>{budgetUtilization.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-300 ${
                  budgetUtilization > 100 ? 'bg-red-400' : 
                  budgetUtilization > 80 ? 'bg-yellow-400' : 'bg-white'
                }`}
                style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Spending Breakdown - As per App Flow */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
            📊 Category Spending ({new Date().toLocaleString('default', { month: 'long' })})
          </CardTitle>
          <CardDescription>
            Track your spending vs budget across all categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {spendingAnalysis.map((item) => (
              <div 
                key={item.key} 
                className={`p-4 rounded-lg border-2 ${getStatusColor(item.status)} transition-all duration-200`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{item.emoji}</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {item.hinglishName}: ₹{item.spent.toLocaleString('en-IN')} / ₹{item.budgeted.toLocaleString('en-IN')}
                      </h4>
                      <p className="text-sm text-gray-600">
                        ({item.percentageUsed.toFixed(0)}% used)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(item.status)}
                    <Badge variant={
                      item.status === 'over' ? 'destructive' : 
                      item.status === 'warning' ? 'secondary' : 'default'
                    }>
                      {item.percentageUsed.toFixed(0)}%
                    </Badge>
                  </div>
                </div>

                {/* Visual Progress Bar - App Flow Style */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>₹{item.remaining.toLocaleString('en-IN')} remaining</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`h-3 rounded-full transition-all duration-500 ${
                        item.status === 'over' ? 'bg-red-500' :
                        item.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ 
                        width: `${Math.min(item.percentageUsed, 100)}%`,
                        backgroundColor: item.color
                      }}
                    ></div>
                  </div>
                  
                  {/* Text-based progress bar like in app flow */}
                  <div className="text-xs text-gray-600 font-mono">
                    {Array.from({ length: 10 }, (_, i) => {
                      const threshold = (i + 1) * 10
                      return item.percentageUsed >= threshold ? '█' : '▁'
                    }).join('')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Expenses List */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-purple-600" />
            Recent Expenses
          </CardTitle>
          <CardDescription>
            Your latest expense entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No expenses recorded yet</p>
              <p className="text-sm text-gray-400">Start adding expenses with voice or manual entry!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {expenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full`} style={{ 
                      backgroundColor: CATEGORY_COLORS[expense.category] || '#95A5A6' 
                    }}></div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {expense.description || expense.category}
                      </p>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>{expense.category}</span>
                        <span>•</span>
                        <span>{new Date(expense.date).toLocaleDateString('en-IN')}</span>
                        {expense.entryMethod === 'voice' && (
                          <>
                            <span>•</span>
                            <Badge variant="outline" className="text-xs">Voice</Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ₹{expense.amount.toLocaleString('en-IN')}
                    </p>
                    {expense.merchant && (
                      <p className="text-xs text-gray-500">{expense.merchant}</p>
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
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg border-l-4 border-l-yellow-500">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-700">
              <AlertTriangle className="w-5 h-5 mr-2" />
              💡 Spending Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {spendingAnalysis
                .filter(item => item.status === 'over' || item.status === 'warning')
                .map((item) => (
                  <div key={item.key} className="p-3 bg-yellow-50 rounded-lg">
                    <p className="font-medium text-yellow-800">
                      {item.emoji} {item.hinglishName}: {
                        item.status === 'over' 
                          ? `₹${(item.spent - item.budgeted).toLocaleString('en-IN')} over budget!`
                          : `Approaching budget limit (${item.percentageUsed.toFixed(0)}%)`
                      }
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
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
