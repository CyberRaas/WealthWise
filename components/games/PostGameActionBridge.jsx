'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, Wallet, Heart, Target, ArrowRight, X,
  PiggyBank, TrendingUp, AlertTriangle, CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * PostGameActionBridge
 * 
 * After a game completes, this component shows a contextual real-world
 * action the user can take based on what they just learned.
 * 
 * This bridges learning → behavior (a critical PS requirement).
 */

const GAME_ACTIONS = {
  'scam-buster': {
    title: 'You\'re scam-aware now! 🛡️',
    titleHi: 'अब आप स्कैम से जागरूक हैं!',
    actions: [
      {
        label: 'Set up a UPI safety reminder',
        description: 'Add a ₹0 "Verify Before Pay" reminder to your budget',
        icon: Shield,
        route: '/dashboard/budget',
        color: 'text-red-500',
        bg: 'bg-red-50 dark:bg-red-500/10',
      },
      {
        label: 'Share scam tips with family',
        description: 'Your family needs this knowledge too',
        icon: AlertTriangle,
        route: null, // share action
        color: 'text-amber-500',
        bg: 'bg-amber-50 dark:bg-amber-500/10',
        shareText: 'I just learned to spot 10 types of financial scams on WealthWise! 🛡️ Key tip: Never share OTP, even with bank callers. #FinancialLiteracy #NCFE',
      },
    ]
  },
  'life-decisions': {
    title: 'Great financial decisions! 💰',
    titleHi: 'शानदार वित्तीय निर्णय!',
    actions: [
      {
        label: 'Create an Emergency Fund goal',
        description: 'You saw how emergencies can hit — be prepared with 3-6 months expenses saved',
        icon: PiggyBank,
        route: '/dashboard/goals',
        color: 'text-emerald-500',
        bg: 'bg-emerald-50 dark:bg-emerald-500/10',
      },
      {
        label: 'Set up your real budget',
        description: 'Apply the 50/30/20 rule you just practiced in the game',
        icon: Wallet,
        route: '/dashboard/budget',
        color: 'text-blue-500',
        bg: 'bg-blue-50 dark:bg-blue-500/10',
      },
    ]
  },
  'insurance-academy': {
    title: 'Insurance basics unlocked! 🎓',
    titleHi: 'बीमा की बुनियादी बातें सीख लीं!',
    actions: [
      {
        label: 'Add ₹500/month insurance to your budget',
        description: 'Term insurance can cost as little as ₹500/month for ₹50L cover',
        icon: Heart,
        route: '/dashboard/budget',
        color: 'text-emerald-500',
        bg: 'bg-emerald-50 dark:bg-emerald-500/10',
      },
      {
        label: 'Explore health insurance options',
        description: '₹5L health cover starts from ₹300/month — protect your family',
        icon: Shield,
        route: '/dashboard/investment',
        color: 'text-teal-500',
        bg: 'bg-teal-50 dark:bg-teal-500/10',
      },
    ]
  },
  'fitness-test': {
    title: 'Your financial fitness level is set! 📊',
    titleHi: 'आपका वित्तीय फिटनेस स्तर निर्धारित!',
    actions: [
      {
        label: 'Strengthen weak areas',
        description: 'Play targeted games to improve on topics you missed',
        icon: Target,
        route: '/dashboard/games',
        color: 'text-amber-500',
        bg: 'bg-amber-50 dark:bg-amber-500/10',
      },
      {
        label: 'Start your investment journey',
        description: 'Learn about PPF, FD, ELSS and more Indian investment options',
        icon: TrendingUp,
        route: '/dashboard/investment',
        color: 'text-violet-500',
        bg: 'bg-violet-50 dark:bg-violet-500/10',
      },
    ]
  },
}

export default function PostGameActionBridge({ gameId, result, onDismiss }) {
  const router = useRouter()
  const [visible, setVisible] = useState(false)
  const gameData = GAME_ACTIONS[gameId]

  useEffect(() => {
    // Show after a brief delay for dramatic effect
    const timer = setTimeout(() => setVisible(true), 800)
    return () => clearTimeout(timer)
  }, [])

  if (!gameData) return null

  const handleAction = (action) => {
    if (action.shareText && navigator.share) {
      navigator.share({ title: 'WealthWise', text: action.shareText }).catch(() => {})
    } else if (action.route) {
      router.push(action.route)
    }
  }

  const handleDismiss = () => {
    setVisible(false)
    setTimeout(() => onDismiss?.(), 300)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          className="mt-6 bg-white dark:bg-slate-900 border-2 border-emerald-200 dark:border-emerald-500/30 rounded-2xl p-5 shadow-lg shadow-emerald-500/5"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                {gameData.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{gameData.titleHi}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                Now take a real action to apply what you learned:
              </p>
            </div>
            <button onClick={handleDismiss} className="text-slate-400 hover:text-slate-600 p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            {gameData.actions.map((action, idx) => {
              const Icon = action.icon
              return (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + idx * 0.15 }}
                  onClick={() => handleAction(action)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 border border-slate-100 dark:border-white/5 transition-all group text-left"
                >
                  <div className={`w-10 h-10 rounded-lg ${action.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${action.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{action.label}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{action.description}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
