'use client'

import { useState, useEffect, useCallback } from 'react'
import { Scissors, AlertTriangle, CreditCard, Calendar, TrendingDown, X, ChevronRight, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * SubscriptionAudit - Phase 3 Feature
 * AI-powered subscription audit that identifies unused or underutilized subscriptions.
 * "You haven't used Netflix in 28 days. Cancel now to save ₹649?"
 */

const COMMON_SUBSCRIPTIONS = [
  { pattern: /netflix/i, name: 'Netflix', icon: '🎬', category: 'Entertainment' },
  { pattern: /spotify/i, name: 'Spotify', icon: '🎵', category: 'Entertainment' },
  { pattern: /amazon\s*prime/i, name: 'Amazon Prime', icon: '📦', category: 'Shopping' },
  { pattern: /hotstar|disney/i, name: 'Disney+ Hotstar', icon: '⭐', category: 'Entertainment' },
  { pattern: /youtube\s*(premium|music)/i, name: 'YouTube Premium', icon: '▶️', category: 'Entertainment' },
  { pattern: /swiggy\s*(one|super)/i, name: 'Swiggy One', icon: '🍔', category: 'Food' },
  { pattern: /zomato\s*(pro|gold)/i, name: 'Zomato Pro', icon: '🍕', category: 'Food' },
  { pattern: /gym|fitness|cult\.fit|cultfit/i, name: 'Gym/Fitness', icon: '💪', category: 'Health' },
  { pattern: /apple\s*(music|tv|one|icloud)/i, name: 'Apple Services', icon: '🍎', category: 'Tech' },
  { pattern: /microsoft|office\s*365/i, name: 'Microsoft 365', icon: '💼', category: 'Productivity' },
  { pattern: /jio/i, name: 'Jio', icon: '📱', category: 'Telecom' },
  { pattern: /airtel/i, name: 'Airtel', icon: '📱', category: 'Telecom' },
  { pattern: /vi\b|vodafone|idea/i, name: 'Vi', icon: '📱', category: 'Telecom' },
  { pattern: /zee5/i, name: 'ZEE5', icon: '📺', category: 'Entertainment' },
  { pattern: /sony\s*liv/i, name: 'SonyLIV', icon: '📺', category: 'Entertainment' },
  { pattern: /linkedin\s*premium/i, name: 'LinkedIn Premium', icon: '💼', category: 'Career' },
  { pattern: /medium/i, name: 'Medium', icon: '📝', category: 'Reading' },
  { pattern: /notion/i, name: 'Notion', icon: '📓', category: 'Productivity' },
  { pattern: /chatgpt|openai/i, name: 'ChatGPT Plus', icon: '🤖', category: 'AI' },
  { pattern: /dropbox/i, name: 'Dropbox', icon: '📁', category: 'Storage' },
]

export default function SubscriptionAudit({ expenses = [], className = '' }) {
  const [subscriptions, setSubscriptions] = useState([])
  const [totalWaste, setTotalWaste] = useState(0)
  const [loading, setLoading] = useState(true)
  const [dismissed, setDismissed] = useState(false)
  const [expandedSub, setExpandedSub] = useState(null)
  const [actionedSubs, setActionedSubs] = useState(new Set())

  useEffect(() => {
    if (expenses.length > 0) {
      analyzeSubscriptions()
    } else {
      setLoading(false)
    }
  }, [expenses])

  const analyzeSubscriptions = useCallback(() => {
    setLoading(true)

    const now = new Date()
    const threeMonthsAgo = new Date(now)
    threeMonthsAgo.setMonth(now.getMonth() - 3)

    // Group recurring expenses that look like subscriptions
    const subscriptionMap = new Map()

    const recentExpenses = expenses.filter(e => new Date(e.date || e.createdAt) >= threeMonthsAgo)

    recentExpenses.forEach(expense => {
      const desc = (expense.description || expense.note || '').toLowerCase()
      const category = (expense.category || '').toLowerCase()
      
      // Match against known subscription patterns
      let matchedSub = null
      for (const sub of COMMON_SUBSCRIPTIONS) {
        if (sub.pattern.test(desc) || sub.pattern.test(category)) {
          matchedSub = sub
          break
        }
      }

      // Also detect by recurring category keywords
      if (!matchedSub && (
        desc.includes('subscription') || 
        desc.includes('monthly') || 
        desc.includes('recurring') ||
        desc.includes('renewal') ||
        desc.includes('membership') ||
        category === 'subscription' ||
        category === 'subscriptions'
      )) {
        matchedSub = {
          name: expense.description || 'Unknown Subscription',
          icon: '🔄',
          category: expense.category || 'Other',
          pattern: null
        }
      }

      if (matchedSub) {
        const key = matchedSub.name
        if (!subscriptionMap.has(key)) {
          subscriptionMap.set(key, {
            ...matchedSub,
            payments: [],
            totalSpent: 0,
            lastPayment: null,
          })
        }
        const entry = subscriptionMap.get(key)
        entry.payments.push({
          amount: expense.amount,
          date: new Date(expense.date || expense.createdAt),
        })
        entry.totalSpent += expense.amount
        const paymentDate = new Date(expense.date || expense.createdAt)
        if (!entry.lastPayment || paymentDate > entry.lastPayment) {
          entry.lastPayment = paymentDate
        }
      }
    })

    // Analyze each subscription for waste potential
    const analyzed = Array.from(subscriptionMap.values()).map(sub => {
      const daysSinceLastUse = Math.floor((now - sub.lastPayment) / (1000 * 60 * 60 * 24))
      const avgMonthlyAmount = sub.payments.length > 0
        ? Math.round(sub.totalSpent / Math.max(1, sub.payments.length))
        : 0
      const annualCost = avgMonthlyAmount * 12

      // Determine if this is potentially wasteful
      let status = 'active'
      let recommendation = ''
      let savingsIfCancelled = 0

      if (daysSinceLastUse > 45) {
        status = 'unused'
        recommendation = `You haven't used ${sub.name} in ${daysSinceLastUse} days. Cancel now to save ₹${avgMonthlyAmount.toLocaleString('en-IN')}/month.`
        savingsIfCancelled = annualCost
      } else if (daysSinceLastUse > 25) {
        status = 'underused'
        recommendation = `${sub.name} last used ${daysSinceLastUse} days ago. Consider downgrading or pausing.`
        savingsIfCancelled = Math.round(annualCost * 0.5)
      } else if (sub.payments.length >= 2) {
        // Check if amount is increasing
        const amounts = sub.payments.map(p => p.amount).sort((a, b) => a - b)
        const latest = amounts[amounts.length - 1]
        const earliest = amounts[0]
        if (latest > earliest * 1.1) {
          status = 'price-hike'
          recommendation = `${sub.name} has increased from ₹${earliest.toLocaleString('en-IN')} to ₹${latest.toLocaleString('en-IN')}. Still worth it?`
          savingsIfCancelled = Math.round(annualCost * 0.3)
        }
      }

      return {
        ...sub,
        daysSinceLastUse,
        avgMonthlyAmount,
        annualCost,
        status,
        recommendation,
        savingsIfCancelled,
      }
    })

    // Sort: unused first, then underused, then price-hikes
    const statusOrder = { unused: 0, underused: 1, 'price-hike': 2, active: 3 }
    analyzed.sort((a, b) => (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3))

    const flagged = analyzed.filter(s => s.status !== 'active')
    const waste = flagged.reduce((sum, s) => sum + s.savingsIfCancelled, 0)

    setSubscriptions(analyzed)
    setTotalWaste(waste)
    setLoading(false)
  }, [expenses])

  const handleAction = (subName) => {
    setActionedSubs(prev => new Set([...prev, subName]))
  }

  const flaggedSubs = subscriptions.filter(s => s.status !== 'active' && !actionedSubs.has(s.name))
  
  if (dismissed || loading || flaggedSubs.length === 0) return null

  const statusConfig = {
    unused: {
      label: 'Unused',
      color: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300',
      icon: '🚫',
    },
    underused: {
      label: 'Underused',
      color: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300',
      icon: '⚠️',
    },
    'price-hike': {
      label: 'Price Hike',
      color: 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300',
      icon: '📈',
    },
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm ${className}`}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Scissors className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Subscription Audit</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {flaggedSubs.length} subscription{flaggedSubs.length > 1 ? 's' : ''} need{flaggedSubs.length === 1 ? 's' : ''} attention
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-xs text-slate-400 dark:text-slate-500">Potential savings</p>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  ₹{Math.round(totalWaste / 12).toLocaleString('en-IN')}/mo
                </p>
              </div>
              <button
                onClick={() => setDismissed(true)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Subscription List */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {flaggedSubs.map((sub, idx) => {
            const cfg = statusConfig[sub.status] || statusConfig.underused
            const isExpanded = expandedSub === sub.name

            return (
              <motion.div
                key={sub.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <button
                  onClick={() => setExpandedSub(isExpanded ? null : sub.name)}
                  className="w-full px-5 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
                >
                  <span className="text-xl">{sub.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-slate-900 dark:text-white truncate">{sub.name}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      {sub.recommendation}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      ₹{sub.avgMonthlyAmount.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] text-slate-400">/month</p>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </button>

                {/* Expanded details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-4 pt-1">
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-3">
                          <div className="grid grid-cols-3 gap-3 text-center">
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Last Used</p>
                              <p className="text-sm font-bold text-slate-900 dark:text-white">{sub.daysSinceLastUse}d ago</p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Annual Cost</p>
                              <p className="text-sm font-bold text-slate-900 dark:text-white">₹{sub.annualCost.toLocaleString('en-IN')}</p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Payments</p>
                              <p className="text-sm font-bold text-slate-900 dark:text-white">{sub.payments.length}x</p>
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleAction(sub.name) }}
                              className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-colors"
                            >
                              Cancel & Save ₹{sub.avgMonthlyAmount.toLocaleString('en-IN')}/mo
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleAction(sub.name) }}
                              className="px-3 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg transition-colors"
                            >
                              Keep
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>

        {/* Footer insight */}
        <div className="px-5 py-3 bg-emerald-50 dark:bg-emerald-900/20 border-t border-emerald-100 dark:border-emerald-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <p className="text-xs text-emerald-700 dark:text-emerald-300">
              <strong>Annual impact:</strong> Cancelling flagged subscriptions saves you up to ₹{totalWaste.toLocaleString('en-IN')}/year — that's ₹{Math.round(totalWaste / 12).toLocaleString('en-IN')}/month back in your pocket.
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
