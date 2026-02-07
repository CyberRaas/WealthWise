'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Bell, Target, ShieldCheck, MapPin, Clock, X, Volume2, VolumeX } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * SmartNudgeEngine - Phase 3 Feature (Impulse Intervention Mode)
 * Provides intelligent, context-aware nudges to prevent impulsive spending.
 * Triggers based on:
 *  - Time-based patterns (weekend spending spikes, late-night shopping)
 *  - Spending velocity (multiple transactions in short window)
 *  - Budget proximity (nearing limit)
 *  - Goal reminders
 */

const NUDGE_TYPES = {
  WEEKEND_SPLURGE: {
    icon: '🛍️',
    title: 'Weekend Spending Alert',
    color: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    iconBg: 'bg-amber-100 dark:bg-amber-800',
  },
  LATE_NIGHT: {
    icon: '🌙',
    title: 'Late Night Purchase?',
    color: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800',
    iconBg: 'bg-indigo-100 dark:bg-indigo-800',
  },
  RAPID_SPEND: {
    icon: '⚡',
    title: 'Rapid Spending Detected',
    color: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    iconBg: 'bg-red-100 dark:bg-red-800',
  },
  GOAL_REMINDER: {
    icon: '🎯',
    title: 'Remember Your Goal!',
    color: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
    iconBg: 'bg-emerald-100 dark:bg-emerald-800',
  },
  BUDGET_PROXIMITY: {
    icon: '⚠️',
    title: 'Budget Limit Approaching',
    color: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
    iconBg: 'bg-orange-100 dark:bg-orange-800',
  },
  PAYDAY_CAUTION: {
    icon: '💰',
    title: 'Payday Spending Caution',
    color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
    iconBg: 'bg-purple-100 dark:bg-purple-800',
  },
}

export default function SmartNudgeEngine({ 
  budget, 
  expenses = [], 
  goals = [],
  enabled = true,
  className = '' 
}) {
  const [activeNudges, setActiveNudges] = useState([])
  const [dismissedTypes, setDismissedTypes] = useState(new Set())
  const [nudgeHistory, setNudgeHistory] = useState([])
  const lastCheckRef = useRef(null)

  const generateNudges = useCallback(() => {
    if (!enabled) return

    const now = new Date()
    const nudges = []

    // 1. Weekend Splurge Detection
    const dayOfWeek = now.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    if (isWeekend) {
      // Check if user typically overspends on weekends
      const weekendExpenses = expenses.filter(e => {
        const d = new Date(e.date || e.createdAt)
        return d.getDay() === 0 || d.getDay() === 6
      })
      const weekdayExpenses = expenses.filter(e => {
        const d = new Date(e.date || e.createdAt)
        return d.getDay() >= 1 && d.getDay() <= 5
      })

      const avgWeekendSpend = weekendExpenses.length > 0
        ? weekendExpenses.reduce((s, e) => s + e.amount, 0) / Math.max(1, weekendExpenses.length) * 2
        : 0
      const avgWeekdaySpend = weekdayExpenses.length > 0
        ? weekdayExpenses.reduce((s, e) => s + e.amount, 0) / Math.max(1, weekdayExpenses.length) * 5
        : 0

      if (avgWeekendSpend > avgWeekdaySpend * 1.3) {
        nudges.push({
          type: 'WEEKEND_SPLURGE',
          message: `You typically spend ${Math.round(((avgWeekendSpend / avgWeekdaySpend) - 1) * 100)}% more on weekends. Think before ordering!`,
          priority: 2,
        })
      }
    }

    // 2. Late Night Shopping Detection
    const hour = now.getHours()
    if (hour >= 22 || hour <= 4) {
      nudges.push({
        type: 'LATE_NIGHT',
        message: "Research shows late-night purchases have 40% higher regret rates. Sleep on it — if you still want it tomorrow, buy it then.",
        priority: 3,
      })
    }

    // 3. Rapid Spending (multiple transactions in last 2 hours) 
    const twoHoursAgo = new Date(now - 2 * 60 * 60 * 1000)
    const recentTransactions = expenses.filter(e => new Date(e.date || e.createdAt) >= twoHoursAgo)
    if (recentTransactions.length >= 3) {
      const recentTotal = recentTransactions.reduce((s, e) => s + e.amount, 0)
      nudges.push({
        type: 'RAPID_SPEND',
        message: `${recentTransactions.length} transactions totaling ₹${recentTotal.toLocaleString('en-IN')} in the last 2 hours. Take a 10-minute cooling break.`,
        priority: 4,
      })
    }

    // 4. Goal Reminder
    if (goals.length > 0) {
      const topGoal = goals.find(g => g.status === 'active') || goals[0]
      if (topGoal) {
        const progress = topGoal.targetAmount > 0
          ? Math.round(((topGoal.currentAmount || 0) / topGoal.targetAmount) * 100)
          : 0
        nudges.push({
          type: 'GOAL_REMINDER',
          message: `Your "${topGoal.name}" goal is ${progress}% complete (₹${(topGoal.currentAmount || 0).toLocaleString('en-IN')} / ₹${topGoal.targetAmount.toLocaleString('en-IN')}). Every rupee saved counts!`,
          priority: 1,
          goalName: topGoal.name,
          goalProgress: progress,
        })
      }
    }

    // 5. Budget Proximity Alert
    if (budget) {
      const totalBudget = budget.totalBudget || budget.monthlyBudget || 0
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const thisMonthSpent = expenses
        .filter(e => new Date(e.date || e.createdAt) >= startOfMonth)
        .reduce((s, e) => s + e.amount, 0)
      const percentUsed = totalBudget > 0 ? (thisMonthSpent / totalBudget) * 100 : 0

      if (percentUsed >= 80 && percentUsed < 100) {
        nudges.push({
          type: 'BUDGET_PROXIMITY',
          message: `You've used ${Math.round(percentUsed)}% of your monthly budget. Only ₹${Math.round(totalBudget - thisMonthSpent).toLocaleString('en-IN')} remaining for the rest of the month.`,
          priority: 5,
        })
      }
    }

    // 6. Post-Payday Caution (1st-5th of month)
    const dayOfMonth = now.getDate()
    if (dayOfMonth >= 1 && dayOfMonth <= 5) {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const firstWeekSpend = expenses
        .filter(e => {
          const d = new Date(e.date || e.createdAt)
          return d >= startOfMonth && d.getDate() <= 5
        })
        .reduce((s, e) => s + e.amount, 0)
      
      if (budget && firstWeekSpend > (budget.totalBudget || 0) * 0.3) {
        nudges.push({
          type: 'PAYDAY_CAUTION',
          message: `You've spent ${Math.round((firstWeekSpend / (budget.totalBudget || 1)) * 100)}% of your budget in the first ${dayOfMonth} days. Pace yourself — you have ${30 - dayOfMonth} days to go!`,
          priority: 4,
        })
      }
    }

    // Filter out dismissed types and sort by priority
    const filtered = nudges
      .filter(n => !dismissedTypes.has(n.type))
      .sort((a, b) => b.priority - a.priority)

    setActiveNudges(filtered)
  }, [budget, expenses, goals, enabled, dismissedTypes])

  useEffect(() => {
    generateNudges()
    // Re-check every 30 minutes
    const interval = setInterval(generateNudges, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [generateNudges])

  const dismissNudge = (type) => {
    setDismissedTypes(prev => new Set([...prev, type]))
    setNudgeHistory(prev => [...prev, { type, dismissedAt: new Date() }])
  }

  if (!enabled || activeNudges.length === 0) return null

  return (
    <div className={`space-y-3 ${className}`}>
      <AnimatePresence mode="popLayout">
        {activeNudges.map((nudge, idx) => {
          const config = NUDGE_TYPES[nudge.type] || NUDGE_TYPES.GOAL_REMINDER
          
          return (
            <motion.div
              key={nudge.type}
              layout
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, x: 100 }}
              transition={{ delay: idx * 0.1 }}
              className={`rounded-xl border p-4 ${config.color}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${config.iconBg}`}>
                  <span className="text-lg">{config.icon}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{config.title}</h4>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      now
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {nudge.message}
                  </p>

                  {/* Goal progress mini-bar */}
                  {nudge.goalProgress !== undefined && (
                    <div className="mt-2">
                      <div className="w-full h-1.5 bg-white/50 dark:bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${nudge.goalProgress}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className="h-full bg-emerald-500 rounded-full"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => dismissNudge(nudge.type)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>

      {/* Compact summary if multiple nudges */}
      {activeNudges.length > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <p className="text-[10px] text-slate-400 dark:text-slate-500">
            🧠 WealthWise Guardian is watching {activeNudges.length} spending patterns
          </p>
        </motion.div>
      )}
    </div>
  )
}
