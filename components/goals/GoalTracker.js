'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Target,
  Plus,
  Calendar,
  TrendingUp,
  PiggyBank,
  Home,
  Car,
  GraduationCap,
  Heart,
  Plane,
  Gift,
  X,
  CheckCircle,
  Clock
} from 'lucide-react'
import toast from 'react-hot-toast'

const getGoalTemplates = (t) => [
  {
    id: 'emergency_fund',
    name: t('goals.templates.emergencyFund.name'),
    icon: '🛡️',
    description: t('goals.templates.emergencyFund.description'),
    category: t('goals.categories.safety'),
    color: 'bg-blue-500',
    defaultMonths: 12
  },
  {
    id: 'home_purchase',
    name: t('goals.templates.homePurchase.name'),
    icon: '🏠',
    description: t('goals.templates.homePurchase.description'),
    category: t('goals.categories.property'),
    color: 'bg-green-500',
    defaultMonths: 36
  },
  {
    id: 'car_purchase',
    name: t('goals.templates.carPurchase.name'),
    icon: '🚗',
    description: t('goals.templates.carPurchase.description'),
    category: t('goals.categories.vehicle'),
    color: 'bg-yellow-500',
    defaultMonths: 24
  },
  {
    id: 'vacation',
    name: t('goals.templates.vacation.name'),
    icon: '✈️',
    description: t('goals.templates.vacation.description'),
    category: t('goals.categories.travel'),
    color: 'bg-purple-500',
    defaultMonths: 12
  },
  {
    id: 'education',
    name: t('goals.templates.education.name'),
    icon: '🎓',
    description: t('goals.templates.education.description'),
    category: t('goals.categories.education'),
    color: 'bg-indigo-500',
    defaultMonths: 18
  },
  {
    id: 'wedding',
    name: t('goals.templates.wedding.name'),
    icon: '💍',
    description: t('goals.templates.wedding.description'),
    category: t('goals.categories.lifeEvent'),
    color: 'bg-pink-500',
    defaultMonths: 24
  }
]

export default function GoalTracker({ userSavings = 0 }) {
  const { t, ready } = useTranslation()
  const [goals, setGoals] = useState([])
  const [showCreateGoal, setShowCreateGoal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    try {
      const response = await fetch('/api/goals')
      const data = await response.json()
      
      if (data.success) {
        setGoals(data.goals || [])
      }
    } catch (error) {
      console.error('Failed to fetch goals:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateGoalProgress = (goal) => {
    const progress = (goal.currentAmount / goal.targetAmount) * 100
    const monthsRemaining = goal.targetMonths - ((new Date() - new Date(goal.createdAt)) / (1000 * 60 * 60 * 24 * 30))
    const monthlySavingRequired = goal.targetAmount / goal.targetMonths
    const isOnTrack = goal.currentAmount >= (goal.targetAmount * (goal.targetMonths - monthsRemaining) / goal.targetMonths)
    
    return {
      progress: Math.min(progress, 100),
      monthsRemaining: Math.max(monthsRemaining, 0),
      monthlySavingRequired,
      isOnTrack,
      status: progress >= 100 ? 'completed' : isOnTrack ? 'on_track' : 'behind'
    }
  }

  const addToGoal = async (goalId, amount) => {
    try {
      const response = await fetch('/api/goals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goalId: goalId,
          updateType: 'add_money',
          amount: amount
        })
      })

      const data = await response.json()

      if (data.success) {
        // Update local state
        setGoals(prev => prev.map(goal => 
          goal.id === goalId 
            ? { ...goal, currentAmount: goal.currentAmount + amount }
            : goal
        ))
        toast.success(`₹${amount.toLocaleString('en-IN')} added to goal!`)
      } else {
        toast.error(data.error || 'Failed to update goal')
      }
    } catch (error) {
      toast.error('Failed to update goal')
      console.error('Add to goal error:', error)
    }
  }

  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">{t('goals.loading')}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {/* Goals Overview */}
      <Card className="group bg-gradient-to-br from-emerald-600 via-teal-600 to-blue-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-xl rounded-2xl ring-2 ring-white/20">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-xl rounded-full px-4 py-2 mb-4">
                <Target className="w-4 h-4 text-white" />
                <span className="text-white font-medium text-sm">{t('goals.goalProgress')}</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-3">🎯 {t('goals.financialGoals')}</h2>
              <p className="text-emerald-100 text-lg font-medium">
                {goals.length} {t('goals.activeGoals')} • {t('goals.totalTarget')}: ₹{goals.reduce((sum, goal) => sum + goal.targetAmount, 0).toLocaleString('en-IN')}
              </p>
            </div>
            <Button
              onClick={() => setShowCreateGoal(true)}
              className="group bg-white/20 hover:bg-white/30 text-white border-white/30 px-6 py-3 rounded-2xl backdrop-blur-xl font-bold transition-all duration-300 hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              {t('goals.addGoal')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Goals List */}
      {goals.length === 0 ? (
        <Card className="group bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/30 hover:from-white hover:via-emerald-50/50 hover:to-teal-50/50 border-2 border-emerald-200/40 hover:border-emerald-300/60 shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-xl rounded-2xl ring-1 ring-white/50">
          <CardContent className="text-center p-12">
            <Target className="w-20 h-20 text-emerald-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-emerald-700 to-slate-800 bg-clip-text text-transparent mb-4">{t('goals.noGoalsYet')}</h3>
            <p className="text-slate-600 mb-8 text-lg">
              {t('goals.startJourney')}
            </p>
            <Button
              onClick={() => setShowCreateGoal(true)}
              className="group bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-700 hover:via-teal-700 hover:to-blue-700 text-white px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 ring-2 ring-white/20 text-lg font-bold"
            >
              <Plus className="w-6 mr-3 group-hover:rotate-90 transition-transform duration-300" />
              {t('goals.createFirstGoal')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {goals.map((goal) => {
            const analysis = calculateGoalProgress(goal)
            const template = ready ? getGoalTemplates(t).find(tmpl => tmpl.id === goal.templateId) : null
            
            return (
              <Card key={goal.id} className="group bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/30 hover:from-white hover:via-emerald-50/50 hover:to-teal-50/50 border-2 border-emerald-200/40 hover:border-emerald-300/60 shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-xl rounded-2xl ring-1 ring-white/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-14 h-14 ${template?.color || 'bg-gray-500'} rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg`}>
                        {template?.icon || '🎯'}
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-800 via-emerald-700 to-slate-800 bg-clip-text text-transparent">{goal.name}</CardTitle>
                        <CardDescription className="text-slate-600 text-base">{goal.description}</CardDescription>
                      </div>
                    </div>
                    <Badge variant={
                      analysis.status === 'completed' ? 'default' :
                      analysis.status === 'on_track' ? 'secondary' : 'destructive'
                    }>
                      {analysis.status === 'completed' ? t('goals.status.completed') :
                       analysis.status === 'on_track' ? t('goals.status.onTrack') : t('goals.status.behind')}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {/* Progress */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>{t('goals.progress')}</span>
                        <span>{analysis.progress.toFixed(1)}%</span>
                      </div>
                      <Progress value={analysis.progress} className="h-3" />
                      <div className="flex justify-between text-sm mt-2 text-gray-600">
                        <span>₹{goal.currentAmount.toLocaleString('en-IN')}</span>
                        <span>₹{goal.targetAmount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">{t('goals.targetDate')}</p>
                        <p className="font-medium">
                          {new Date(goal.targetDate).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">{t('goals.monthlyTarget')}</p>
                        <p className="font-medium">
                          ₹{analysis.monthlySavingRequired.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>

                    {/* Status Message */}
                    <div className={`p-3 rounded-lg ${
                      analysis.status === 'completed' ? 'bg-green-50 text-green-700' :
                      analysis.status === 'on_track' ? 'bg-blue-50 text-blue-700' : 
                      'bg-red-50 text-red-700'
                    }`}>
                      <div className="flex items-center">
                        {analysis.status === 'completed' ? <CheckCircle className="w-4 h-4 mr-2" /> :
                         analysis.status === 'on_track' ? <TrendingUp className="w-4 h-4 mr-2" /> :
                         <Clock className="w-4 h-4 mr-2" />}
                        <p className="text-sm">
                          {analysis.status === 'completed' ? t('goals.goalAchieved') :
                           analysis.status === 'on_track' ? t('goals.monthsRemaining', { months: analysis.monthsRemaining.toFixed(1) }) :
                           t('goals.increaseSavings')}
                        </p>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => addToGoal(goal.id, 1000)}
                        className="flex-1"
                      >
                        +₹1K
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => addToGoal(goal.id, 5000)}
                        className="flex-1"
                      >
                        +₹5K
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create Goal Modal */}
      {showCreateGoal && (
        <CreateGoalModal
          onClose={() => setShowCreateGoal(false)}
          onGoalCreated={(newGoal) => {
            setGoals(prev => [newGoal, ...prev])
            setShowCreateGoal(false)
            toast.success('Goal created successfully!')
          }}
        />
      )}
    </div>
  )
}

// Create Goal Modal Component
function CreateGoalModal({ onClose, onGoalCreated }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetAmount: '',
    targetMonths: 12
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template)
    setFormData({
      name: template.name,
      description: template.description,
      targetAmount: '',
      targetMonths: template.defaultMonths
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.targetAmount) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)

    try {
      const goalData = {
        name: formData.name,
        description: formData.description,
        targetAmount: parseFloat(formData.targetAmount),
        targetMonths: parseInt(formData.targetMonths),
        templateId: selectedTemplate?.id || 'custom',
        targetDate: new Date(Date.now() + (formData.targetMonths * 30 * 24 * 60 * 60 * 1000)).toISOString(),
        currentAmount: 0
      }

      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goalData)
      })

      const data = await response.json()

      if (data.success) {
        onGoalCreated(data.goal)
      } else {
        toast.error(data.error || 'Failed to create goal')
      }
    } catch (error) {
      toast.error('Failed to create goal')
      console.error('Create goal error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Create Financial Goal</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Goal Templates */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Choose a Goal Template</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {ready && getGoalTemplates(t).map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  selectedTemplate?.id === template.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-2">{template.icon}</div>
                <h4 className="font-medium text-sm">{template.name}</h4>
                <p className="text-xs text-gray-600 mt-1">{template.category}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Goal Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Goal Name *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Emergency Fund"
              className="w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of your goal"
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Amount (₹) *
              </label>
              <Input
                type="number"
                value={formData.targetAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, targetAmount: e.target.value }))}
                placeholder="100000"
                className="w-full"
                required
                min="1000"
                step="1000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Frame (months) *
              </label>
              <Input
                type="number"
                value={formData.targetMonths}
                onChange={(e) => setFormData(prev => ({ ...prev, targetMonths: e.target.value }))}
                placeholder="12"
                className="w-full"
                required
                min="1"
                max="120"
              />
            </div>
          </div>

          {/* Goal Summary */}
          {formData.targetAmount && formData.targetMonths && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Goal Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-blue-700">Monthly Savings Needed</p>
                  <p className="font-bold text-blue-900">
                    ₹{(parseFloat(formData.targetAmount) / parseInt(formData.targetMonths)).toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <p className="text-blue-700">Target Date</p>
                  <p className="font-bold text-blue-900">
                    {new Date(Date.now() + (formData.targetMonths * 30 * 24 * 60 * 60 * 1000)).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-blue-600 to-emerald-600"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Goal
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
