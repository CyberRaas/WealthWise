'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Brain, AlertTriangle, ShieldCheck, TrendingUp, Zap,
  ChevronRight, Gamepad2, Lightbulb
} from 'lucide-react'

/**
 * BehavioralInsightsBridge
 * 
 * Reads game behavioral data (impulsive, planned, scammed tags from Life Decisions,
 * scam accuracy from Scam Buster, etc.) and generates cross-feature insights
 * that appear on the dashboard.
 *
 * This is the critical missing link: games → dashboard feedback loop.
 */

function analyzeGameBehavior(gameProgress) {
  const insights = []
  const gamesCompleted = gameProgress?.gamesCompleted || []
  const totalXP = gameProgress?.totalXP || 0
  const gamesPlayed = gameProgress?.gamesPlayed || 0

  // Read behavioral tags from Life Decisions results
  let lifeDecisionsData = null
  try {
    const saved = localStorage.getItem('wealthwise_life_decisions_result')
    if (saved) lifeDecisionsData = JSON.parse(saved)
  } catch (e) {}

  // Read Scam Buster results
  let scamBusterData = null
  try {
    const saved = localStorage.getItem('wealthwise_scam_buster_result')
    if (saved) scamBusterData = JSON.parse(saved)
  } catch (e) {}

  // --- Insight 1: Impulsive behavior detected ---
  if (lifeDecisionsData?.behaviorTags?.includes('impulsive') || lifeDecisionsData?.behaviorTags?.includes('fomo')) {
    insights.push({
      type: 'warning',
      icon: AlertTriangle,
      title: 'Impulse spending tendency detected',
      titleHi: 'आवेगी खर्च की प्रवृत्ति पाई गई',
      description: 'In Life Decisions, you made impulsive choices. Consider adding a "30-day rule" — wait 30 days before any purchase over ₹2,000.',
      action: '/dashboard/budget',
      actionLabel: 'Review your budget',
      color: 'amber',
      priority: 1,
    })
  }

  // --- Insight 2: Good planner ---
  if (lifeDecisionsData?.behaviorTags?.includes('planned') || lifeDecisionsData?.behaviorTags?.includes('optimal')) {
    insights.push({
      type: 'success',
      icon: TrendingUp,
      title: 'You\'re a smart planner! 🎯',
      titleHi: 'आप एक स्मार्ट योजनाकार हैं!',
      description: 'Your Life Decisions game shows disciplined financial habits. Take the next step and set up SIP investments.',
      action: '/dashboard/investment',
      actionLabel: 'Explore investments',
      color: 'emerald',
      priority: 3,
    })
  }

  // --- Insight 3: Scam vulnerability ---
  if (scamBusterData && scamBusterData.correct < scamBusterData.total * 0.6) {
    insights.push({
      type: 'critical',
      icon: ShieldCheck,
      title: 'Scam awareness needs improvement',
      titleHi: 'स्कैम जागरूकता में सुधार ज़रूरी',
      description: `You identified only ${scamBusterData.correct}/${scamBusterData.total} scams correctly. Re-play Scam Buster to protect yourself and your family.`,
      action: '/dashboard/games',
      actionLabel: 'Re-play Scam Buster',
      color: 'red',
      priority: 0,
    })
  }

  // --- Insight 4: Scam master ---
  if (scamBusterData && scamBusterData.correct === scamBusterData.total) {
    insights.push({
      type: 'success',
      icon: ShieldCheck,
      title: 'Scam Master! Perfect score 🏆',
      titleHi: 'स्कैम मास्टर! परफेक्ट स्कोर!',
      description: 'You spotted every scam. Share this knowledge with your family to keep them safe too.',
      action: null,
      actionLabel: 'Share with family',
      shareText: 'I scored 100% on WealthWise Scam Buster! 🛡️ Key learning: Never share OTP, even with bank callers. #FinancialLiteracy',
      color: 'emerald',
      priority: 4,
    })
  }

  // --- Insight 5: Debt tendency ---
  if (lifeDecisionsData?.behaviorTags?.includes('debt')) {
    insights.push({
      type: 'warning',
      icon: AlertTriangle,
      title: 'Watch out for debt traps',
      titleHi: 'कर्ज के जाल से सावधान',
      description: 'In Life Decisions, you took on debt. Remember: EMIs over 40% of income are a red flag. Track your real debt.',
      action: '/dashboard/debt',
      actionLabel: 'Manage debt',
      color: 'red',
      priority: 1,
    })
  }

  // --- Insight 6: No games played yet ---
  if (gamesPlayed === 0) {
    insights.push({
      type: 'info',
      icon: Gamepad2,
      title: 'Start your financial learning journey!',
      titleHi: 'अपनी वित्तीय शिक्षा यात्रा शुरू करें!',
      description: 'Play your first game to get personalized financial insights based on your decision-making style.',
      action: '/dashboard/games',
      actionLabel: 'Play your first game',
      color: 'violet',
      priority: 2,
    })
  }

  // --- Insight 7: Insurance not explored ---
  if (gamesPlayed > 0 && !gamesCompleted.includes('insurance-academy')) {
    insights.push({
      type: 'suggestion',
      icon: Lightbulb,
      title: 'Insurance knowledge gap',
      titleHi: 'बीमा ज्ञान की कमी',
      description: 'You haven\'t explored Insurance Academy yet. 80% of Indian families are underinsured — learn what coverage you need.',
      action: '/dashboard/games',
      actionLabel: 'Play Insurance Academy',
      color: 'blue',
      priority: 2,
    })
  }

  // Sort by priority (lower = more urgent)
  return insights.sort((a, b) => a.priority - b.priority).slice(0, 3)
}

const COLOR_MAP = {
  amber: {
    card: 'bg-amber-50/50 dark:bg-amber-500/5 border-amber-100 dark:border-amber-500/10',
    icon: 'text-amber-500',
    iconBg: 'bg-amber-100 dark:bg-amber-500/20',
    text: 'text-amber-800 dark:text-amber-200',
    link: 'text-amber-700 dark:text-amber-300',
  },
  red: {
    card: 'bg-red-50/50 dark:bg-red-500/5 border-red-100 dark:border-red-500/10',
    icon: 'text-red-500',
    iconBg: 'bg-red-100 dark:bg-red-500/20',
    text: 'text-red-800 dark:text-red-200',
    link: 'text-red-700 dark:text-red-300',
  },
  emerald: {
    card: 'bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/10',
    icon: 'text-emerald-500',
    iconBg: 'bg-emerald-100 dark:bg-emerald-500/20',
    text: 'text-emerald-800 dark:text-emerald-200',
    link: 'text-emerald-700 dark:text-emerald-300',
  },
  violet: {
    card: 'bg-violet-50/50 dark:bg-violet-500/5 border-violet-100 dark:border-violet-500/10',
    icon: 'text-violet-500',
    iconBg: 'bg-violet-100 dark:bg-violet-500/20',
    text: 'text-violet-800 dark:text-violet-200',
    link: 'text-violet-700 dark:text-violet-300',
  },
  blue: {
    card: 'bg-blue-50/50 dark:bg-blue-500/5 border-blue-100 dark:border-blue-500/10',
    icon: 'text-blue-500',
    iconBg: 'bg-blue-100 dark:bg-blue-500/20',
    text: 'text-blue-800 dark:text-blue-200',
    link: 'text-blue-700 dark:text-blue-300',
  },
}

export default function BehavioralInsightsBridge() {
  const router = useRouter()
  const [insights, setInsights] = useState([])

  useEffect(() => {
    let gameProgress = { totalXP: 0, gamesCompleted: [], gamesPlayed: 0, achievements: [] }
    try {
      const saved = localStorage.getItem('wealthwise_game_progress')
      if (saved) gameProgress = JSON.parse(saved)
    } catch (e) {}

    setInsights(analyzeGameBehavior(gameProgress))
  }, [])

  if (insights.length === 0) return null

  const handleAction = (insight) => {
    if (insight.shareText && navigator.share) {
      navigator.share({ title: 'WealthWise', text: insight.shareText }).catch(() => {})
    } else if (insight.action) {
      router.push(insight.action)
    }
  }

  return (
    <Card className="border-slate-100 dark:border-white/5 dark:bg-white/[0.03]">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Brain className="w-4 h-4 text-violet-500" />
          Behavioral Insights from Your Games
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2 space-y-2">
        {insights.map((insight, idx) => {
          const Icon = insight.icon
          const colors = COLOR_MAP[insight.color] || COLOR_MAP.violet
          return (
            <button
              key={idx}
              onClick={() => handleAction(insight)}
              className={`w-full flex items-start gap-3 p-3 rounded-xl border ${colors.card} text-left transition-all hover:shadow-sm group`}
            >
              <div className={`w-8 h-8 rounded-lg ${colors.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <Icon className={`w-4 h-4 ${colors.icon}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${colors.text}`}>{insight.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{insight.description}</p>
                <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${colors.link} mt-1`}>
                  {insight.actionLabel} <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </button>
          )
        })}
      </CardContent>
    </Card>
  )
}
