'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import DashboardLayout from '@/components/layout/DashboardLayout'
import OnboardingGuard from '@/components/OnboardingGuard'
import LanguageSelector from '@/components/ui/LanguageSelector'
import GoalTracker from '@/components/goals/GoalTracker'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Target,
  TrendingUp,
  Calendar,
  Trophy
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
      console.error(t('common.failedToFetchGoals'), error)
    } finally {
      setLoading(false)
    }
  }

  const activeGoals = goalsData.goals.filter(goal => goal.status === 'active').length
  const completedGoals = goalsData.goals.filter(goal => goal.status === 'completed').length

  return (
    <DashboardLayout title={t('goals.title')}>
      <div className="space-y-4 sm:space-y-6">
        {/* Goals Overview - Real Data */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="border-l-4 border-l-emerald-500">
            <CardHeader className="pb-2 sm:pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">{t('goals.activeGoals')}</CardTitle>
                <Target className="h-5 w-5 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-slate-800">
                {loading ? '...' : activeGoals}
              </div>
              <p className="text-xs text-slate-500">{t('goals.goalsInProgress')}</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2 sm:pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">{t('goals.totalTarget')}</CardTitle>
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-slate-800">
                {loading ? '...' : `₹${goalsData.totalTargetAmount.toLocaleString('en-IN')}`}
              </div>
              <p className="text-xs text-slate-500">{t('goals.combinedGoalAmount')}</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 sm:col-span-2 lg:col-span-1">
            <CardHeader className="pb-2 sm:pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">{t('goals.completedGoals')}</CardTitle>
                <Trophy className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-slate-800">
                {loading ? '...' : completedGoals}
              </div>
              <p className="text-xs text-slate-500">{t('goals.goalsAchieved')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Goal Tracker Component - Uses Real Data */}
        <GoalTracker userSavings={goalsData.totalCurrentAmount} />

        {/* Real Goal Timeline - Dynamic */}
        {goalsData.goals.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                {t('goals.goalTimeline')}
              </CardTitle>
              <CardDescription>
                {t('goals.trackProgress')}
              </CardDescription>
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
                        className={`flex items-center gap-4 p-4 rounded-lg ${
                          isCompleted 
                            ? 'bg-emerald-50' 
                            : progress > 50 
                            ? 'bg-blue-50' 
                            : 'bg-slate-50'
                        }`}
                      >
                        <div className={`w-3 h-3 rounded-full ${
                          isCompleted 
                            ? 'bg-emerald-500' 
                            : progress > 50 
                            ? 'bg-blue-500' 
                            : 'bg-slate-400'
                        }`}></div>
                        <div className="flex-1">
                          <p className={`font-medium ${
                            isCompleted 
                              ? 'text-emerald-800' 
                              : progress > 50 
                              ? 'text-blue-800' 
                              : 'text-slate-700'
                          }`}>
                            {goal.name} {isCompleted && `- ${t('goals.completed')} 🎉`}
                            {!isCompleted && ` - ${progress.toFixed(0)}% ${t('goals.complete')}`}
                          </p>
                          <p className={`text-sm ${
                            isCompleted 
                              ? 'text-emerald-600' 
                              : progress > 50 
                              ? 'text-blue-600' 
                              : 'text-slate-500'
                          }`}>
                            {t('goals.target')}: {new Date(goal.targetDate).toLocaleDateString('en-IN')} • 
                            ₹{goal.currentAmount.toLocaleString('en-IN')} {t('goals.of')} ₹{goal.targetAmount.toLocaleString('en-IN')}
                          </p>
                        </div>
                        {isCompleted ? (
                          <Trophy className="h-5 w-5 text-emerald-600" />
                        ) : (
                          <div className={`font-bold ${
                            progress > 50 ? 'text-blue-600' : 'text-slate-500'
                          }`}>
                            {progress.toFixed(0)}%
                          </div>
                        )}
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
