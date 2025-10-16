'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import {
  Target,
  Plus,
  Calendar,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Trophy,
  X,
  CheckCircle,
  Clock,
  Edit,
  Trash2,
  MoreVertical,
  Zap,
  Award,
  Star,
  Sparkles,
  PartyPopper,
  Flame,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import toast from 'react-hot-toast'

// Achievement Badges
const ACHIEVEMENTS = {
  first_goal: { id: 'first_goal', name: 'First Step', icon: '🎯', description: 'Created your first goal', color: 'bg-blue-500' },
  goal_completed: { id: 'goal_completed', name: 'Goal Crusher', icon: '🏆', description: 'Completed a goal', color: 'bg-yellow-500' },
  streak_7: { id: 'streak_7', name: '7 Day Streak', icon: '🔥', description: 'Saved for 7 days straight', color: 'bg-orange-500' },
  milestone_25: { id: 'milestone_25', name: 'Quarter Way', icon: '⭐', description: 'Reached 25% of goal', color: 'bg-purple-500' },
  milestone_50: { id: 'milestone_50', name: 'Halfway Hero', icon: '🌟', description: 'Reached 50% of goal', color: 'bg-indigo-500' },
  milestone_75: { id: 'milestone_75', name: 'Almost There', icon: '💫', description: 'Reached 75% of goal', color: 'bg-pink-500' },
  overachiever: { id: 'overachiever', name: 'Overachiever', icon: '🚀', description: 'Completed goal ahead of schedule', color: 'bg-green-500' }
}

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
  const [celebratingGoalId, setCelebratingGoalId] = useState(null)
  const [achievements, setAchievements] = useState([])
  const [showAchievement, setShowAchievement] = useState(null)

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

  // Trigger confetti celebration
  const triggerConfetti = () => {
    const duration = 3000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 }

    const randomInRange = (min, max) => Math.random() * (max - min) + min

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      })
    }, 250)
  }

  // Check and award achievements
  const checkAchievements = (goal, previousProgress, currentProgress) => {
    const newAchievements = []

    // First goal
    if (goals.length === 1) {
      newAchievements.push(ACHIEVEMENTS.first_goal)
    }

    // Milestone achievements
    if (previousProgress < 25 && currentProgress >= 25) {
      newAchievements.push(ACHIEVEMENTS.milestone_25)
    }
    if (previousProgress < 50 && currentProgress >= 50) {
      newAchievements.push(ACHIEVEMENTS.milestone_50)
    }
    if (previousProgress < 75 && currentProgress >= 75) {
      newAchievements.push(ACHIEVEMENTS.milestone_75)
    }

    // Goal completed
    if (currentProgress >= 100) {
      newAchievements.push(ACHIEVEMENTS.goal_completed)

      // Check if completed ahead of schedule
      const now = new Date()
      const targetDate = new Date(goal.targetDate)
      if (now < targetDate) {
        newAchievements.push(ACHIEVEMENTS.overachiever)
      }
    }

    // Show achievements
    if (newAchievements.length > 0) {
      newAchievements.forEach((achievement, index) => {
        setTimeout(() => {
          setShowAchievement(achievement)
          setTimeout(() => setShowAchievement(null), 3000)
        }, index * 3500)
      })
    }
  }

  const calculateGoalProgress = (goal) => {
    const progress = (goal.currentAmount / goal.targetAmount) * 100
    const elapsedTime = new Date() - new Date(goal.createdAt)
    const totalTime = new Date(goal.targetDate) - new Date(goal.createdAt)
    const expectedProgress = (elapsedTime / totalTime) * 100

    const monthsRemaining = goal.targetMonths - ((new Date() - new Date(goal.createdAt)) / (1000 * 60 * 60 * 24 * 30))
    const monthlySavingRequired = goal.targetAmount / goal.targetMonths
    const isOnTrack = progress >= expectedProgress
    const daysRemaining = Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24))

    // Calculate current savings pace
    const daysSinceCreated = Math.max((new Date() - new Date(goal.createdAt)) / (1000 * 60 * 60 * 24), 1)
    const currentDailyRate = goal.currentAmount / daysSinceCreated
    const predictedCompletionDays = (goal.targetAmount - goal.currentAmount) / currentDailyRate
    const predictedDate = new Date(Date.now() + predictedCompletionDays * 24 * 60 * 60 * 1000)

    return {
      progress: Math.min(progress, 100),
      monthsRemaining: Math.max(monthsRemaining, 0),
      daysRemaining,
      monthlySavingRequired,
      isOnTrack,
      expectedProgress: Math.min(expectedProgress, 100),
      aheadBy: progress - expectedProgress,
      predictedDate,
      dailySavingRate: currentDailyRate,
      status: progress >= 100 ? 'completed' : isOnTrack ? 'on_track' : 'behind'
    }
  }

  const addToGoal = async (goalId, amount) => {
    const goal = goals.find(g => g.id === goalId)
    if (!goal) return

    // Check if goal is already completed
    if (goal.status === 'completed' || goal.currentAmount >= goal.targetAmount) {
      toast.error('Goal already completed! 🎉')
      return
    }

    const previousProgress = (goal.currentAmount / goal.targetAmount) * 100

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
        const updatedGoal = data.goal
        const currentProgress = (updatedGoal.currentAmount / updatedGoal.targetAmount) * 100

        // Update local state
        setGoals(prev => prev.map(g =>
          g.id === goalId ? updatedGoal : g
        ))

        // Check for completion
        if (updatedGoal.status === 'completed' || currentProgress >= 100) {
          setCelebratingGoalId(goalId)
          triggerConfetti()
          toast.success('🎉 Goal Achieved! Congratulations!', { duration: 5000 })
          setTimeout(() => setCelebratingGoalId(null), 5000)
        } else {
          toast.success(`₹${amount.toLocaleString('en-IN')} added to goal!`)
        }

        // Check achievements
        checkAchievements(updatedGoal, previousProgress, currentProgress)
      } else {
        toast.error(data.error || 'Failed to update goal')
      }
    } catch (error) {
      toast.error('Failed to update goal')
      console.error('Add to goal error:', error)
    }
  }

  const deleteGoal = async (goalId) => {
    if (!confirm('Are you sure you want to delete this goal?')) return

    try {
      const response = await fetch('/api/goals', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalId })
      })

      const data = await response.json()

      if (data.success) {
        setGoals(prev => prev.filter(g => g.id !== goalId))
        toast.success('Goal deleted successfully')
      } else {
        toast.error(data.error || 'Failed to delete goal')
      }
    } catch (error) {
      toast.error('Failed to delete goal')
      console.error('Delete goal error:', error)
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

  const completedGoals = goals.filter(g => g.status === 'completed').length
  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0)

  return (
    <div className="space-y-8 relative">
      {/* Achievement Notification */}
      <AnimatePresence>
        {showAchievement && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[9999] pointer-events-none"
          >
            <Card className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white border-0 shadow-2xl">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="text-5xl">{showAchievement.icon}</div>
                <div>
                  <h3 className="text-xl font-bold">Achievement Unlocked!</h3>
                  <p className="text-lg">{showAchievement.name}</p>
                  <p className="text-sm text-white/80">{showAchievement.description}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Goals Overview with Stats */}
      <Card className="group bg-gradient-to-br from-emerald-600 via-teal-600 to-blue-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-xl rounded-2xl ring-2 ring-white/20">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-xl rounded-full px-4 py-2 mb-4">
                <Target className="w-4 h-4 text-white" />
                <span className="text-white font-medium text-sm">{t('goals.goalProgress')}</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-3">🎯 {t('goals.financialGoals')}</h2>
              <p className="text-emerald-100 text-lg font-medium">
                {goals.length} {t('goals.activeGoals')} • ₹{totalSaved.toLocaleString('en-IN')} saved
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

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 text-center">
              <Trophy className="w-8 h-8 mx-auto mb-2" />
              <p className="text-2xl font-bold">{completedGoals}</p>
              <p className="text-sm text-emerald-100">Completed</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2" />
              <p className="text-2xl font-bold">{goals.length - completedGoals}</p>
              <p className="text-sm text-emerald-100">In Progress</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 text-center">
              <Sparkles className="w-8 h-8 mx-auto mb-2" />
              <p className="text-2xl font-bold">{Object.keys(achievements).length}</p>
              <p className="text-sm text-emerald-100">Achievements</p>
            </div>
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
            const isCelebrating = celebratingGoalId === goal.id
            const isCompleted = goal.status === 'completed' || analysis.progress >= 100
            const remainingAmount = Math.max(goal.targetAmount - goal.currentAmount, 0)

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card className={`group ${isCelebrating ? 'ring-4 ring-yellow-400 animate-pulse' : ''} bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/30 hover:from-white hover:via-emerald-50/50 hover:to-teal-50/50 border-2 ${isCompleted ? 'border-yellow-400' : 'border-emerald-200/40'} hover:border-emerald-300/60 shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-xl rounded-2xl ring-1 ring-white/50`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className={`w-14 h-14 ${template?.color || 'bg-gray-500'} rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg ${isCelebrating ? 'animate-bounce' : ''}`}>
                          {isCompleted ? '🏆' : template?.icon || '🎯'}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-800 via-emerald-700 to-slate-800 bg-clip-text text-transparent">
                            {goal.name}
                            {isCelebrating && <PartyPopper className="inline-block ml-2 w-5 h-5 text-yellow-500 animate-spin" />}
                          </CardTitle>
                          <CardDescription className="text-slate-600 text-base">{goal.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          analysis.status === 'completed' ? 'default' :
                            analysis.status === 'on_track' ? 'secondary' : 'destructive'
                        } className="flex items-center gap-1">
                          {analysis.status === 'completed' ? (
                            <>
                              <Trophy className="w-3 h-3" />
                              {t('goals.status.completed')}
                            </>
                          ) : analysis.status === 'on_track' ? (
                            <>
                              <TrendingUp className="w-3 h-3" />
                              {t('goals.status.onTrack')}
                            </>
                          ) : (
                            <>
                              <TrendingDown className="w-3 h-3" />
                              {t('goals.status.behind')}
                            </>
                          )}
                        </Badge>
                        {!isCompleted && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteGoal(goal.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      {/* Progress with Animation */}
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-medium">{t('goals.progress')}</span>
                          <span className="font-bold text-emerald-600">{analysis.progress.toFixed(1)}%</span>
                        </div>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 0.5 }}
                        >
                          <Progress value={analysis.progress} className="h-3" />
                        </motion.div>
                        <div className="flex justify-between text-sm mt-2 text-gray-600">
                          <span>₹{goal.currentAmount.toLocaleString('en-IN')}</span>
                          <span>₹{goal.targetAmount.toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      {/* AI Insights */}
                      {!isCompleted && (
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                          <div className="flex items-start gap-3">
                            <Sparkles className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                            <div className="space-y-2 text-sm">
                              <p className="font-semibold text-slate-800">Smart Insights</p>
                              {analysis.isOnTrack ? (
                                <>
                                  <p className="text-green-700 flex items-center gap-2">
                                    <ArrowUp className="w-4 h-4" />
                                    You&apos;re ahead by ₹{(goal.currentAmount - (goal.targetAmount * analysis.expectedProgress / 100)).toLocaleString('en-IN')}!
                                  </p>
                                  <p className="text-slate-600">
                                    At current pace, you&apos;ll complete this <span className="font-semibold text-green-600">{Math.ceil((new Date(goal.targetDate) - analysis.predictedDate) / (1000 * 60 * 60 * 24))} days early</span>
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p className="text-orange-700 flex items-center gap-2">
                                    <ArrowDown className="w-4 h-4" />
                                    Behind schedule by ₹{Math.abs(goal.currentAmount - (goal.targetAmount * analysis.expectedProgress / 100)).toLocaleString('en-IN')}
                                  </p>
                                  <p className="text-slate-600">
                                    Save <span className="font-semibold text-blue-600">₹{Math.ceil((goal.targetAmount - goal.currentAmount) / analysis.daysRemaining).toLocaleString('en-IN')}/day</span> to reach your goal on time
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Timeline Info */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-white/50 rounded-lg p-3">
                          <p className="text-gray-600 flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {t('goals.targetDate')}
                          </p>
                          <p className="font-bold text-slate-800 mt-1">
                            {new Date(goal.targetDate).toLocaleDateString('en-IN')}
                          </p>
                          {!isCompleted && (
                            <p className="text-xs text-gray-500 mt-1">{analysis.daysRemaining} days left</p>
                          )}
                        </div>
                        <div className="bg-white/50 rounded-lg p-3">
                          <p className="text-gray-600 flex items-center gap-1">
                            <PiggyBank className="w-4 h-4" />
                            {isCompleted ? 'Saved' : t('goals.monthlyTarget')}
                          </p>
                          <p className="font-bold text-slate-800 mt-1">
                            ₹{(isCompleted ? goal.currentAmount : analysis.monthlySavingRequired).toLocaleString('en-IN')}
                          </p>
                          {!isCompleted && (
                            <p className="text-xs text-gray-500 mt-1">per month</p>
                          )}
                        </div>
                      </div>

                      {/* Completed Goal Message */}
                      {isCompleted ? (
                        <div className="bg-gradient-to-r from-yellow-50 via-orange-50 to-yellow-50 rounded-xl p-4 border-2 border-yellow-400 text-center">
                          <div className="flex items-center justify-center gap-2 text-yellow-700">
                            <Trophy className="w-6 h-6" />
                            <p className="text-lg font-bold">🎉 Goal Achieved! 🎉</p>
                            <Trophy className="w-6 h-6" />
                          </div>
                          <p className="text-sm text-slate-600 mt-2">
                            Completed on {new Date(goal.completedAt || goal.updatedAt).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                      ) : (
                        /* Quick Action Buttons */
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => addToGoal(goal.id, 1000)}
                              className="flex-1 hover:bg-emerald-50 hover:border-emerald-500 transition-all"
                              disabled={isCompleted}
                            >
                              <Zap className="w-4 h-4 mr-1" />
                              +₹1K
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => addToGoal(goal.id, 5000)}
                              className="flex-1 hover:bg-blue-50 hover:border-blue-500 transition-all"
                              disabled={isCompleted}
                            >
                              <Zap className="w-4 h-4 mr-1" />
                              +₹5K
                            </Button>
                            {remainingAmount > 0 && remainingAmount <= 50000 && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => addToGoal(goal.id, remainingAmount)}
                                className="flex-1 hover:bg-purple-50 hover:border-purple-500 transition-all font-bold"
                                disabled={isCompleted}
                              >
                                <Trophy className="w-4 h-4 mr-1" />
                                Finish! ₹{(remainingAmount / 1000).toFixed(1)}K
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
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
  const { t } = useTranslation()
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Target className="w-7 h-7 text-emerald-600" />
              Create Financial Goal
            </h2>
            <p className="text-sm text-gray-600 mt-1">Set your target and watch your dreams become reality</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Goal Templates */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Choose a Goal Template
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {getGoalTemplates(t).map((template) => (
              <motion.button
                key={template.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleTemplateSelect(template)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${selectedTemplate?.id === template.id
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
              >
                <div className="text-2xl mb-2">{template.icon}</div>
                <h4 className="font-medium text-sm">{template.name}</h4>
                <p className="text-xs text-gray-600 mt-1">{template.category}</p>
              </motion.button>
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
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200"
            >
              <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Goal Summary
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-blue-700">Monthly Savings Needed</p>
                  <p className="font-bold text-blue-900 text-lg">
                    ₹{(parseFloat(formData.targetAmount) / parseInt(formData.targetMonths)).toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <p className="text-blue-700">Target Date</p>
                  <p className="font-bold text-blue-900 text-lg">
                    {new Date(Date.now() + (formData.targetMonths * 30 * 24 * 60 * 60 * 1000)).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>
            </motion.div>
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
              className="flex-1 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700"
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
      </motion.div>
    </motion.div>
  )
}
