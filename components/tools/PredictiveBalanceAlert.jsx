'use client'

import { useState, useEffect, useCallback } from 'react'
import { TrendingDown, Calendar, AlertCircle, ChevronRight, Zap, ShieldCheck, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * PredictiveBalanceAlert - Phase 3 Feature
 * Predicts when the user will run out of budget based on current spending velocity.
 * "Based on your spending speed, you will run out of budget by the 22nd. Slow down now."
 */
export default function PredictiveBalanceAlert({ budget, expenses = [], className = '' }) {
  const [prediction, setPrediction] = useState(null)
  const [dismissed, setDismissed] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const analyzeBurnRate = useCallback(() => {
    if (!budget || !expenses.length) return null

    const now = new Date()
    const currentDay = now.getDate()
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const daysRemaining = daysInMonth - currentDay

    // Calculate total budget and spent
    const totalBudget = budget.totalBudget || budget.monthlyBudget || 0
    const monthlyIncome = budget.monthlyIncome || totalBudget * 1.2

    // Filter expenses to current month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const thisMonthExpenses = expenses.filter(e => new Date(e.date || e.createdAt) >= startOfMonth)
    const totalSpent = thisMonthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0)
    const remaining = Math.max(0, totalBudget - totalSpent)

    // Daily burn rate (average over days elapsed)
    const daysElapsed = Math.max(1, currentDay)
    const dailyBurnRate = totalSpent / daysElapsed

    // Projected total spend by end of month
    const projectedTotal = dailyBurnRate * daysInMonth
    const overBudgetAmount = projectedTotal - totalBudget

    // Predict when budget runs out
    const daysUntilBroke = dailyBurnRate > 0 ? Math.floor(remaining / dailyBurnRate) : daysRemaining + 1
    const brokeDate = new Date(now)
    brokeDate.setDate(now.getDate() + daysUntilBroke)
    const brokeDateStr = brokeDate.getDate()
    const brokeMonth = brokeDate.toLocaleString('en-IN', { month: 'short' })

    // Spending velocity trend (last 7 days vs previous 7 days)
    const sevenDaysAgo = new Date(now)
    sevenDaysAgo.setDate(now.getDate() - 7)
    const fourteenDaysAgo = new Date(now)
    fourteenDaysAgo.setDate(now.getDate() - 14)

    const recentWeekSpend = thisMonthExpenses
      .filter(e => new Date(e.date || e.createdAt) >= sevenDaysAgo)
      .reduce((sum, e) => sum + (e.amount || 0), 0)

    const priorWeekSpend = thisMonthExpenses
      .filter(e => {
        const d = new Date(e.date || e.createdAt)
        return d >= fourteenDaysAgo && d < sevenDaysAgo
      })
      .reduce((sum, e) => sum + (e.amount || 0), 0)

    const velocityTrend = priorWeekSpend > 0
      ? Math.round(((recentWeekSpend - priorWeekSpend) / priorWeekSpend) * 100)
      : 0

    // Safe daily budget for remaining days
    const safeDailyBudget = daysRemaining > 0 ? Math.round(remaining / daysRemaining) : 0

    // Severity level
    const spentPercent = (totalSpent / totalBudget) * 100
    const timePercent = (currentDay / daysInMonth) * 100
    const burnRatio = spentPercent / (timePercent || 1)

    let severity = 'safe'
    let message = ''

    if (daysUntilBroke <= 0) {
      severity = 'critical'
      message = `You've already exceeded your budget by ₹${Math.abs(remaining).toLocaleString('en-IN')}!`
    } else if (burnRatio > 1.5 && daysRemaining > 5) {
      severity = 'critical'
      message = `At this pace, you'll run out of budget by ${brokeMonth} ${brokeDateStr}. Slow down now!`
    } else if (burnRatio > 1.2) {
      severity = 'warning'
      message = `Spending is ${Math.round((burnRatio - 1) * 100)}% faster than ideal. Budget may run short by ${brokeMonth} ${brokeDateStr}.`
    } else if (burnRatio > 1.0) {
      severity = 'caution'
      message = `Slightly ahead of budget pace. You have ₹${safeDailyBudget.toLocaleString('en-IN')}/day remaining.`
    } else {
      severity = 'safe'
      message = `On track! You're spending within budget at ₹${safeDailyBudget.toLocaleString('en-IN')}/day.`
    }

    return {
      severity,
      message,
      totalBudget,
      totalSpent,
      remaining,
      dailyBurnRate: Math.round(dailyBurnRate),
      safeDailyBudget,
      projectedTotal: Math.round(projectedTotal),
      overBudgetAmount: Math.round(Math.max(0, overBudgetAmount)),
      daysUntilBroke,
      brokeDate: `${brokeMonth} ${brokeDateStr}`,
      brokeDateDay: brokeDateStr,
      burnRatio: Math.round(burnRatio * 100) / 100,
      velocityTrend,
      daysRemaining,
      currentDay,
      daysInMonth,
      spentPercent: Math.round(spentPercent),
      timePercent: Math.round(timePercent),
    }
  }, [budget, expenses])

  useEffect(() => {
    const result = analyzeBurnRate()
    setPrediction(result)
  }, [analyzeBurnRate])

  if (!prediction || dismissed || prediction.severity === 'safe') return null

  const severityConfig = {
    critical: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      icon: 'bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-400',
      text: 'text-red-700 dark:text-red-300',
      bar: 'bg-red-500',
      badge: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300',
    },
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-amber-200 dark:border-amber-800',
      icon: 'bg-amber-100 dark:bg-amber-800 text-amber-600 dark:text-amber-400',
      text: 'text-amber-700 dark:text-amber-300',
      bar: 'bg-amber-500',
      badge: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300',
    },
    caution: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      icon: 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400',
      text: 'text-blue-700 dark:text-blue-300',
      bar: 'bg-blue-500',
      badge: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',
    },
  }

  const config = severityConfig[prediction.severity] || severityConfig.caution

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`rounded-2xl border ${config.bg} ${config.border} overflow-hidden ${className}`}
      >
        {/* Main Alert */}
        <div className="px-4 py-3 flex items-start gap-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${config.icon}`}>
            {prediction.severity === 'critical' ? (
              <AlertCircle className="w-5 h-5" />
            ) : (
              <TrendingDown className="w-5 h-5" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Predictive Balance Alert
              </h4>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${config.badge}`}>
                {prediction.severity === 'critical' ? 'URGENT' : prediction.severity === 'warning' ? 'WARNING' : 'NOTICE'}
              </span>
            </div>
            <p className={`text-sm ${config.text}`}>
              {prediction.message}
            </p>

            {/* Mini progress comparison */}
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Budget used: {prediction.spentPercent}%</span>
                <span>Month elapsed: {prediction.timePercent}%</span>
              </div>
              <div className="relative w-full h-2 bg-white/50 dark:bg-slate-700 rounded-full overflow-hidden">
                {/* Time marker */}
                <div
                  className="absolute top-0 h-full w-0.5 bg-slate-400 dark:bg-slate-500 z-10"
                  style={{ left: `${prediction.timePercent}%` }}
                />
                {/* Budget bar */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, prediction.spentPercent)}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className={`h-full rounded-full ${config.bar}`}
                />
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                ▏= where you should be &nbsp;•&nbsp; bar = where you are
              </p>
            </div>
          </div>

          <button
            onClick={() => setDismissed(true)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Expandable Details */}
        <div className="px-4 pb-1">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1 mb-2"
          >
            <ChevronRight className={`w-3 h-3 transition-transform ${showDetails ? 'rotate-90' : ''}`} />
            {showDetails ? 'Hide' : 'Show'} spending breakdown
          </button>
        </div>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 grid grid-cols-2 gap-3">
                <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-3">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Daily Burn Rate</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    ₹{prediction.dailyBurnRate.toLocaleString('en-IN')}
                    <span className="text-xs font-normal text-slate-400">/day</span>
                  </p>
                </div>
                <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-3">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Safe Budget</p>
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{prediction.safeDailyBudget.toLocaleString('en-IN')}
                    <span className="text-xs font-normal text-slate-400">/day</span>
                  </p>
                </div>
                <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-3">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Projected Overspend</p>
                  <p className="text-lg font-bold text-red-600 dark:text-red-400">
                    {prediction.overBudgetAmount > 0 
                      ? `₹${prediction.overBudgetAmount.toLocaleString('en-IN')}`
                      : 'None'
                    }
                  </p>
                </div>
                <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-3">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Week Trend</p>
                  <p className={`text-lg font-bold ${prediction.velocityTrend > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {prediction.velocityTrend > 0 ? '+' : ''}{prediction.velocityTrend}%
                  </p>
                </div>
              </div>

              {/* Actionable tip */}
              <div className="px-4 pb-4">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3 flex items-start gap-2">
                  <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-700 dark:text-emerald-300">
                    <strong>Quick fix:</strong> Reduce daily spending to ₹{prediction.safeDailyBudget.toLocaleString('en-IN')} 
                    for the next {prediction.daysRemaining} days to stay on track.
                    {prediction.overBudgetAmount > 0 && (
                      <span> Cut ₹{Math.round(prediction.overBudgetAmount / prediction.daysRemaining).toLocaleString('en-IN')}/day to avoid going over.</span>
                    )}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  )
}
