'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts'
import { 
  TrendingUp, 
  DollarSign, 
  PiggyBank, 
  Target,
  Lightbulb,
  Star,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Settings,
  Edit3
} from 'lucide-react'
import ExpenseTrackingDashboard from '@/components/dashboard/ExpenseTrackingDashboard'
import BudgetCustomizer from '@/components/budget/BudgetCustomizer'
import BudgetCustomizationGuide from '@/components/budget/BudgetCustomizationGuide'
import toast from 'react-hot-toast'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300']

export default function BudgetDisplay({ refreshTrigger }) {
  const [budget, setBudget] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [showCustomizer, setShowCustomizer] = useState(false)
  const [showGuide, setShowGuide] = useState(false)

  useEffect(() => {
    fetchBudget()
  }, [])

  const fetchBudget = async () => {
    try {
      console.log('Fetching budget data...')
      const response = await fetch('/api/budget/generate')
      const data = await response.json()
      
      console.log('Budget API response:', { success: data.success, hasBudget: !!data.budget, hasCategories: !!data.budget?.categories })
      
      if (data.success) {
        setBudget(data.budget)
      } else {
        console.log('No budget exists, showing generate button')
        // No budget exists, show generate button
        setBudget(null)
      }
    } catch (error) {
      console.error('Failed to fetch budget:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateBudget = async () => {
    setGenerating(true)
    try {
      const response = await fetch('/api/budget/generate', {
        method: 'POST'
      })
      const data = await response.json()
      
      if (data.success) {
        setBudget(data.budget)
        toast.success('🎉 Your personalized budget has been generated!')
      } else {
        toast.error(data.error || 'Failed to generate budget')
      }
    } catch (error) {
      toast.error('Failed to generate budget')
      console.error('Budget generation error:', error)
    } finally {
      setGenerating(false)
    }
  }

  const getHealthScoreColor = (score) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getHealthScoreBadge = (score) => {
    if (score >= 80) return { text: 'Excellent', variant: 'default', color: 'bg-green-100 text-green-800' }
    if (score >= 60) return { text: 'Good', variant: 'secondary', color: 'bg-yellow-100 text-yellow-800' }
    return { text: 'Needs Improvement', variant: 'destructive', color: 'bg-red-100 text-red-800' }
  }

  const handleCustomizeBudget = () => {
    setShowCustomizer(true)
  }

  const handleSaveCustomBudget = async (customizedBudget) => {
    try {
      const response = await fetch('/api/budget/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ budget: customizedBudget }),
      })

      const data = await response.json()
      
      if (data.success) {
        setBudget(customizedBudget)
        setShowCustomizer(false)
        toast.success('🎉 Custom budget saved successfully!')
      } else {
        throw new Error(data.error || 'Failed to save budget')
      }
    } catch (error) {
      console.error('Error saving custom budget:', error)
      toast.error('Failed to save custom budget')
    }
  }

  const handleCancelCustomization = () => {
    setShowCustomizer(false)
  }

  const handleShowGuide = () => {
    setShowGuide(true)
  }

  const handleStartCustomization = () => {
    setShowGuide(false)
    setShowCustomizer(true)
  }

  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your budget...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!budget) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Generate Your Smart Budget</CardTitle>
          <CardDescription className="text-lg">
            Get AI-powered budget recommendations tailored to your lifestyle and financial goals
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button 
            onClick={generateBudget}
            disabled={generating}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg"
          >
            {generating ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Generating Budget...
              </>
            ) : (
              <>
                <Star className="w-5 h-5 mr-2" />
                Generate My Budget
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Early return if budget is not properly loaded
  if (!budget || !budget.categories) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-gray-500">Budget data not available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Prepare chart data
  const pieData = Object.entries(budget.categories).map(([key, category]) => ({
    name: category.englishName,
    value: category.amount,
    percentage: category.percentage
  }))

  const barData = Object.entries(budget.categories).map(([key, category]) => ({
    name: category.englishName,
    amount: category.amount,
    percentage: category.percentage
  }))

  const healthBadge = getHealthScoreBadge(budget.healthScore)

  // Show Budget Customization Guide if requested
  if (showGuide) {
    return (
      <BudgetCustomizationGuide onStartCustomization={handleStartCustomization} />
    )
  }

  // Show Budget Customizer if user wants to customize
  if (showCustomizer) {
    return (
      <BudgetCustomizer
        budget={budget}
        onSave={handleSaveCustomBudget}
        onCancel={handleCancelCustomization}
      />
    )
  }

  return (
    <div className="space-y-8">
      {/* Budget Overview Header */}
      <Card className="group bg-gradient-to-br from-emerald-600 via-teal-600 to-blue-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-xl rounded-2xl ring-2 ring-white/20">
        <CardContent className="p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-xl rounded-full px-4 py-2 mb-4">
                <Star className="w-4 h-4 text-white" />
                <span className="text-white font-medium text-sm">
                  {budget.isCustomized ? 'Custom Budget' : 'Smart Budget AI'}
                </span>
                {budget.isCustomized && (
                  <Badge className="bg-white/30 text-white text-xs px-2 py-0.5 ml-2">
                    Customized
                  </Badge>
                )}
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-3">Your Smart Budget</h2>
              <p className="text-emerald-100 text-lg font-medium">
                Monthly Budget: ₹{budget.totalBudget.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-4 text-center">
                <div className="text-4xl font-bold mb-2 text-white">{budget.healthScore}%</div>
                <Badge className={`${healthBadge.color} font-bold text-sm px-3 py-1`}>
                  {healthBadge.text}
                </Badge>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleCustomizeBudget}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-xl px-4 py-2 rounded-xl transition-all duration-300"
                  variant="outline"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Customize Budget
                </Button>
                <Button
                  onClick={handleShowGuide}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-xl px-4 py-1 rounded-lg transition-all duration-300 text-sm"
                  variant="outline"
                  size="sm"
                >
                  <Lightbulb className="w-3 h-3 mr-1" />
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expense Tracking Dashboard - Main Feature */}
      <ExpenseTrackingDashboard budget={budget} refreshTrigger={refreshTrigger} />

      {/* Budget Charts - Secondary Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <Card className="group bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/30 hover:from-white hover:via-emerald-50/50 hover:to-teal-50/50 border-2 border-emerald-200/40 hover:border-emerald-300/60 shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-xl rounded-2xl ring-1 ring-white/50">
          <CardHeader>
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-800 via-emerald-700 to-slate-800 bg-clip-text text-transparent flex items-center">
              <PieChart className="w-6 h-6 mr-3 text-emerald-600" />
              Budget Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card className="group bg-gradient-to-br from-white via-teal-50/30 to-blue-50/30 hover:from-white hover:via-teal-50/50 hover:to-blue-50/50 border-2 border-teal-200/40 hover:border-teal-300/60 shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-xl rounded-2xl ring-1 ring-white/50">
          <CardHeader>
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-800 via-teal-700 to-slate-800 bg-clip-text text-transparent flex items-center">
              <BarChart3 className="w-6 h-6 mr-3 text-teal-600" />
              Category Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                  stroke="#64748b"
                />
                <YAxis formatter={(value) => `₹${(value/1000).toFixed(0)}k`} stroke="#64748b" />
                <Tooltip 
                  formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(20, 184, 166, 0.2)',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar 
                  dataKey="amount" 
                  fill="url(#tealGradient)"
                  radius={[6, 6, 0, 0]}
                />
                <defs>
                  <linearGradient id="tealGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#14b8a6" />
                    <stop offset="100%" stopColor="#0891b2" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Budget Categories */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                Budget Categories
                {budget.isCustomized && (
                  <Badge className="bg-blue-100 text-blue-800 ml-2">
                    <Edit3 className="w-3 h-3 mr-1" />
                    Customized
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {budget.isCustomized 
                  ? 'Your personalized budget allocation based on your preferences'
                  : 'AI-recommended breakdown of your monthly budget allocation'
                }
              </CardDescription>
            </div>
            <Button
              onClick={handleCustomizeBudget}
              variant="outline"
              size="sm"
              className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
            >
              <Settings className="w-4 h-4 mr-2" />
              {budget.isCustomized ? 'Modify Budget' : 'Customize Budget'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(budget.categories).map(([key, category]) => (
              <div key={key} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900">
                    {category.emoji} {category.englishName}
                  </span>
                  <Badge variant="outline">{category.percentage}%</Badge>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  ₹{category.amount.toLocaleString('en-IN')}
                </div>
                <Progress value={category.percentage} className="h-2 mb-2" />
                {budget.explanations?.categories?.[key] && (
                  <p className="text-sm text-gray-600">
                    {budget.explanations.categories[key]}
                  </p>
                )}
              </div>
            ))}
          </div>
          
          {budget.isCustomized && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Budget Customized Successfully!</h4>
                  <p className="text-sm text-blue-700">
                    Your budget has been tailored to your preferences. 
                    {budget.customizedAt && (
                      <span className="block mt-1 text-xs">
                        Last modified: {new Date(budget.customizedAt).toLocaleDateString('en-IN')} at {new Date(budget.customizedAt).toLocaleTimeString('en-IN')}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Tips */}
      {budget.tips && budget.tips.length > 0 && (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lightbulb className="w-5 h-5 mr-2 text-yellow-600" />
              AI-Powered Financial Tips
            </CardTitle>
            <CardDescription>Personalized recommendations to improve your financial health</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {budget.tips.map((tip, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">{tip}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Investment Recommendations */}
      {budget.recommendations && budget.recommendations.length > 0 && (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-5 h-5 mr-2 text-purple-600" />
              Investment Recommendations
            </CardTitle>
            <CardDescription>Smart investment suggestions based on your profile</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {budget.recommendations.map((rec, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">{rec.icon}</span>
                      <h3 className="font-semibold text-gray-900">{rec.type}</h3>
                    </div>
                    <Badge variant={rec.priority === 'Critical' ? 'destructive' : rec.priority === 'High' ? 'default' : 'secondary'}>
                      {rec.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                  {rec.amount && (
                    <p className="text-lg font-bold text-gray-900">
                      ₹{rec.amount.toLocaleString('en-IN')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Regenerate Budget */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="text-center p-6">
          <p className="text-gray-600 mb-4">
            Budget generated on {new Date(budget.generatedAt).toLocaleDateString('en-IN')}
          </p>
          <Button 
            onClick={generateBudget}
            disabled={generating}
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            {generating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Regenerating...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate Budget
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
