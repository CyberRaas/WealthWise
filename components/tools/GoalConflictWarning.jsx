'use client'

import { useState, useEffect, useCallback } from 'react'
import { AlertTriangle, Target, TrendingDown, X, ShieldAlert } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * GoalConflictWarning - Phase 3 Feature
 * Shows a warning before purchases that may impact savings goals.
 * "Buying this decreases your probability of hitting your 'New Bike' goal by 15%."
 */
export default function GoalConflictWarning({ 
  purchaseAmount = 0, 
  isOpen = false, 
  onClose, 
  onProceed, 
  onCancel 
}) {
  const [goals, setGoals] = useState([])
  const [conflicts, setConflicts] = useState([])
  const [loading, setLoading] = useState(true)
  const [monthlyBudget, setMonthlyBudget] = useState(0)
  const [monthlySavings, setMonthlySavings] = useState(0)

  useEffect(() => {
    if (isOpen && purchaseAmount > 0) {
      fetchGoalsAndAnalyze()
    }
  }, [isOpen, purchaseAmount])

  const fetchGoalsAndAnalyze = async () => {
    setLoading(true)
    try {
      // Fetch goals
      const goalsRes = await fetch('/api/goals')
      const goalsData = await goalsRes.json()
      const activeGoals = (goalsData.goals || []).filter(g => g.status === 'active')
      setGoals(activeGoals)

      // Fetch budget for context
      const budgetRes = await fetch('/api/budget')
      const budgetData = await budgetRes.json()
      const totalBudget = budgetData.budget?.totalBudget || 0
      const totalIncome = budgetData.budget?.monthlyIncome || totalBudget * 1.2
      const savings = totalIncome - totalBudget
      setMonthlyBudget(totalBudget)
      setMonthlySavings(savings > 0 ? savings : 0)

      // Analyze conflicts
      const conflictResults = activeGoals.map(goal => {
        const remaining = goal.targetAmount - (goal.currentAmount || 0)
        const monthsLeft = goal.deadline 
          ? Math.max(1, Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24 * 30)))
          : 12
        const monthlyNeeded = remaining / monthsLeft
        
        // How much does this purchase eat into monthly savings capacity
        const currentProbability = savings > 0 
          ? Math.min(100, Math.round((savings / monthlyNeeded) * 100))
          : 0
        const newSavings = Math.max(0, savings - purchaseAmount)
        const newProbability = newSavings > 0 
          ? Math.min(100, Math.round((newSavings / monthlyNeeded) * 100))
          : 0
        const impactPercent = currentProbability - newProbability

        // Delay impact - how many extra months to reach goal
        const currentMonthsToGoal = savings > 0 ? Math.ceil(remaining / savings) : Infinity
        const newMonthsToGoal = newSavings > 0 ? Math.ceil((remaining + purchaseAmount) / newSavings) : Infinity
        const delayMonths = newMonthsToGoal - currentMonthsToGoal

        return {
          goalName: goal.name,
          goalEmoji: goal.emoji || '🎯',
          targetAmount: goal.targetAmount,
          currentAmount: goal.currentAmount || 0,
          progress: Math.round(((goal.currentAmount || 0) / goal.targetAmount) * 100),
          impactPercent: Math.max(0, impactPercent),
          delayMonths: isFinite(delayMonths) ? Math.max(0, delayMonths) : null,
          severity: impactPercent > 20 ? 'critical' : impactPercent > 10 ? 'warning' : 'low',
          remaining
        }
      }).filter(c => c.impactPercent > 0)

      setConflicts(conflictResults)
    } catch (err) {
      console.error('Goal conflict analysis failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      case 'warning': return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
      default: return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
    }
  }

  const overallSeverity = conflicts.some(c => c.severity === 'critical') 
    ? 'critical' 
    : conflicts.some(c => c.severity === 'warning') ? 'warning' : 'low'

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={e => e.stopPropagation()}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
        >
          {/* Header */}
          <div className={`px-6 py-4 flex items-center justify-between ${
            overallSeverity === 'critical' 
              ? 'bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-800' 
              : 'bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-800'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                overallSeverity === 'critical' ? 'bg-red-100 dark:bg-red-800' : 'bg-amber-100 dark:bg-amber-800'
              }`}>
                <ShieldAlert className={`w-5 h-5 ${
                  overallSeverity === 'critical' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'
                }`} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Goal Impact Warning</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  This purchase of ₹{purchaseAmount.toLocaleString('en-IN')} affects your goals
                </p>
              </div>
            </div>
            <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full" />
              </div>
            ) : conflicts.length === 0 ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-3">
                  <Target className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="font-medium text-slate-900 dark:text-white">No goal conflicts detected!</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">This purchase won't significantly impact your goals.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {conflicts.map((conflict, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`p-4 rounded-xl border ${getSeverityColor(conflict.severity)}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{conflict.goalEmoji}</span>
                        <span className="font-semibold text-sm text-slate-900 dark:text-white">{conflict.goalName}</span>
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        conflict.severity === 'critical' 
                          ? 'bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300'
                          : conflict.severity === 'warning'
                            ? 'bg-amber-100 dark:bg-amber-800 text-amber-700 dark:text-amber-300'
                            : 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300'
                      }`}>
                        -{conflict.impactPercent}%
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-2">
                      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                        <span>₹{(conflict.currentAmount / 1000).toFixed(0)}k saved</span>
                        <span>₹{(conflict.targetAmount / 1000).toFixed(0)}k goal</span>
                      </div>
                      <div className="w-full bg-white/50 dark:bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-emerald-500 h-2 rounded-full transition-all"
                          style={{ width: `${conflict.progress}%` }}
                        />
                      </div>
                    </div>

                    <p className="text-xs leading-relaxed">
                      <TrendingDown className="w-3 h-3 inline mr-1" />
                      Buying this decreases your probability of hitting <strong>"{conflict.goalName}"</strong> by <strong>{conflict.impactPercent}%</strong>
                      {conflict.delayMonths !== null && conflict.delayMonths > 0 && (
                        <span>, delaying it by <strong>~{conflict.delayMonths} month{conflict.delayMonths > 1 ? 's' : ''}</strong></span>
                      )}
                    </p>
                  </motion.div>
                ))}

                {/* Summary */}
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 mt-4">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    💡 <strong>Tip:</strong> Consider saving ₹{Math.round(purchaseAmount * 0.2).toLocaleString('en-IN')} instead — 
                    even a partial amount helps your goals stay on track.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors text-sm"
            >
              Skip Purchase & Save
            </button>
            <button
              onClick={onProceed}
              className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors text-sm"
            >
              Buy Anyway
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
