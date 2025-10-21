'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import DashboardLayout from '@/components/layout/DashboardLayout'
import OnboardingGuard from '@/components/OnboardingGuard'
import GoalTracker from '@/components/goals/GoalTracker'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Target,
  TrendingUp,
  Calendar,
  Trophy,
  Zap,
  CheckCircle,
  Clock
} from 'lucide-react'

function GoalsContent() {
  const { t } = useTranslation()
  const [goalsData, setGoalsData] = useState({
    goals: [],
    totalGoals: 0,
    totalTargetAmount: 0,
    totalCurrentAmount: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGoalsData()
  }, [])

  const fetchGoalsData = async () => {
    try {
      const response = await fetch('/api/goals')
      const data = await response.json()

      if (data.success) {
        setGoalsData({
          goals: data.goals || [],
          totalGoals: data.totalGoals || 0,
          totalTargetAmount: data.totalTargetAmount || 0,
          totalCurrentAmount: data.totalCurrentAmount || 0
        })
      }
    } catch (error) {
      console.error('Failed to fetch goals data:', error)
    } finally {
      setLoading(false)
    }
  }

  const activeGoals = goalsData.goals.filter(goal => goal.status === 'active').length
  const completedGoals = goalsData.goals.filter(goal => goal.status === 'completed').length
  const totalProgress = goalsData.totalTargetAmount > 0
    ? (goalsData.totalCurrentAmount / goalsData.totalTargetAmount) * 100
    : 0

  return (
    <DashboardLayout title={t('goals.title')}>
      <div className="space-y-6">
        {/* Simple Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {loading ? '...' : goalsData.totalGoals}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Total Goals</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {loading ? '...' : activeGoals}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                </div>
                <div className="min-w-0">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {loading ? '...' : completedGoals}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                </div>
                <div className="min-w-0">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {loading ? '...' : `${totalProgress.toFixed(0)}%`}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Card */}
        {goalsData.totalGoals > 0 && (
          <Card className="border-l-4 border-l-emerald-500">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Financial Progress</h3>
                  <p className="text-sm text-gray-600">
                    You&apos;ve saved <span className="font-semibold text-emerald-600">₹{goalsData.totalCurrentAmount.toLocaleString('en-IN')}</span> out of <span className="font-semibold">₹{goalsData.totalTargetAmount.toLocaleString('en-IN')}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-full sm:w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all"
                      style={{ width: `${Math.min(totalProgress, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">{totalProgress.toFixed(0)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Goal Tracker Component - Uses Real Data */}
        <GoalTracker userSavings={goalsData.totalCurrentAmount} />

        {/* Goal Timeline - Simple & Clean */}
        {goalsData.goals.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Your Goals</CardTitle>
                  <CardDescription className="mt-1">Track your progress</CardDescription>
                </div>
                <Calendar className="w-5 h-5 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {goalsData.goals
                  .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                  .map((goal) => {
                    const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
                    const isCompleted = goal.status === 'completed'

                    return (
                      <div
                        key={goal.id}
                        className="p-4 rounded-xl border-2 border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900 truncate">
                                {goal.name}
                              </h4>
                              {isCompleted && (
                                <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                  <CheckCircle className="w-3 h-3" />
                                  Done
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span>{new Date(goal.targetDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            {isCompleted ? (
                              <Trophy className="w-8 h-8 text-amber-500" />
                            ) : (
                              <div className="text-2xl font-bold text-gray-900">
                                {progress.toFixed(0)}%
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${isCompleted
                                  ? 'bg-emerald-500'
                                  : progress > 75
                                    ? 'bg-blue-500'
                                    : progress > 50
                                      ? 'bg-cyan-500'
                                      : 'bg-gray-400'
                                }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                              ₹{goal.currentAmount.toLocaleString('en-IN')}
                            </span>
                            <span className="text-gray-900 font-medium">
                              ₹{goal.targetAmount.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}

export default function GoalsPage() {
  return (
    <OnboardingGuard>
      <GoalsContent />
    </OnboardingGuard>
  )
}
