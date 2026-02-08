'use client'

import { useState, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen, Share2, Download, CheckCircle, Lightbulb,
  Shield, Wallet, Heart, Target, X, Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * WhatILearned
 * 
 * A shareable post-game summary card showing 3-4 key financial concepts
 * the user learned from the game they just played. Can be shared via
 * Web Share API or downloaded as an image.
 */

const GAME_LEARNINGS = {
  'scam-buster': {
    title: 'Scam Safety Learnings',
    emoji: '🛡️',
    color: 'from-red-500 to-orange-500',
    borderColor: 'border-red-200 dark:border-red-500/30',
    bgAccent: 'bg-red-50 dark:bg-red-500/10',
    lessons: [
      { text: 'Never share OTP with anyone — banks never ask for it', icon: Shield },
      { text: 'Verify UPI IDs before paying — scammers use look-alike names', icon: Shield },
      { text: 'KYC updates happen at bank branches, not via SMS links', icon: Shield },
      { text: 'If an offer seems too good to be true, it probably is', icon: Shield },
      { text: 'TRAI DND 3.0 app can block spam calls and SMS', icon: Shield },
    ],
    shareText: 'I just completed Scam Buster on WealthWise and learned to spot financial scams! 🛡️ Key lesson: Never share OTP and always verify before paying. #FinancialLiteracy #NCFE',
  },
  'life-decisions': {
    title: 'Money Decision Learnings',
    emoji: '💰',
    color: 'from-emerald-500 to-green-500',
    borderColor: 'border-emerald-200 dark:border-emerald-500/30',
    bgAccent: 'bg-emerald-50 dark:bg-emerald-500/10',
    lessons: [
      { text: 'Emergency fund should cover 3-6 months of expenses', icon: Wallet },
      { text: 'Needs vs Wants: Always pay needs first, then save, then wants', icon: Wallet },
      { text: 'EMIs should not exceed 30% of your monthly income', icon: Wallet },
      { text: 'Comparing prices before big purchases saves 15-25%', icon: Wallet },
      { text: 'Insurance is a need, not a want — get it before you need it', icon: Heart },
    ],
    shareText: 'I practiced real-life money decisions on WealthWise! 💰 Built savings, avoided debt traps, and learned budgeting. #FinancialLiteracy #NCFE',
  },
  'insurance-academy': {
    title: 'Insurance Learnings',
    emoji: '🏥',
    color: 'from-blue-500 to-indigo-500',
    borderColor: 'border-blue-200 dark:border-blue-500/30',
    bgAccent: 'bg-blue-50 dark:bg-blue-500/10',
    lessons: [
      { text: 'Health insurance should be at least ₹5 lakh cover per family member', icon: Heart },
      { text: 'Term insurance gives highest cover at lowest premium', icon: Heart },
      { text: 'PM Fasal Bima Yojana protects farmers against crop loss', icon: Heart },
      { text: 'Claim settlement ratio matters more than brand name', icon: Heart },
      { text: 'Always disclose pre-existing conditions — hiding them voids claims', icon: Heart },
    ],
    shareText: 'Completed Insurance Academy on WealthWise! 🏥 Now I understand health, term, and crop insurance. #FinancialLiteracy #NCFE',
  },
  'fitness-test': {
    title: 'Financial Fitness Learnings',
    emoji: '🏋️',
    color: 'from-violet-500 to-purple-500',
    borderColor: 'border-violet-200 dark:border-violet-500/30',
    bgAccent: 'bg-violet-50 dark:bg-violet-500/10',
    lessons: [
      { text: 'Compound interest turns small SIPs into crores over decades', icon: Target },
      { text: 'The 50/30/20 rule is the simplest effective budget strategy', icon: Wallet },
      { text: 'EPF + NPS + PPF form the 3 pillars of Indian retirement planning', icon: Target },
      { text: 'Consumer Protection Act 2019 gives you 6 powerful rights', icon: Shield },
      { text: 'Starting to invest at 25 vs 35 can mean 3x more wealth at 60', icon: Target },
    ],
    shareText: 'Tested my Financial Fitness on WealthWise! 🏋️ Learned about budgeting, investing, consumer rights & more. #FinancialLiteracy #NCFE',
  },
}

export default function WhatILearned({ gameId, result, onDismiss }) {
  const [visible, setVisible] = useState(true)
  const cardRef = useRef(null)
  const gameData = GAME_LEARNINGS[gameId]

  // Pick 3 random lessons (deterministic per session via result)
  const selectedLessons = useMemo(() => {
    if (!gameData) return []
    const lessons = [...gameData.lessons]
    // Simple shuffle with seed from result
    const seed = result?.correct || result?.savings || 42
    for (let i = lessons.length - 1; i > 0; i--) {
      const j = (seed * (i + 1) + 7) % (i + 1)
      ;[lessons[i], lessons[j]] = [lessons[j], lessons[i]]
    }
    return lessons.slice(0, 3)
  }, [gameData, result])

  if (!gameData || !visible) return null

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `WealthWise — ${gameData.title}`,
          text: gameData.shareText,
          url: window.location.origin,
        })
      } catch (e) {
        // User cancelled share
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(gameData.shareText + '\n' + window.location.origin)
        alert('Copied to clipboard!')
      } catch (e) {}
    }
  }

  const handleDismiss = () => {
    setVisible(false)
    setTimeout(() => onDismiss?.(), 300)
  }

  const scoreLabel = result?.correct !== undefined 
    ? `Score: ${result.correct}/${result.total}`
    : result?.grade 
      ? `Grade: ${result.grade}`
      : result?.score
        ? `Score: ${result.score}%`
        : null

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={cardRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ delay: 0.3 }}
          className={`mt-4 bg-white dark:bg-slate-900 border-2 ${gameData.borderColor} rounded-2xl overflow-hidden shadow-lg`}
        >
          {/* Header gradient */}
          <div className={`bg-gradient-to-r ${gameData.color} px-5 py-3 flex items-center justify-between`}>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-white" />
              <h3 className="text-sm font-bold text-white">What I Learned {gameData.emoji}</h3>
            </div>
            <div className="flex items-center gap-2">
              {scoreLabel && (
                <span className="text-xs font-medium bg-white/20 text-white px-2 py-0.5 rounded-full">
                  {scoreLabel}
                </span>
              )}
              <button onClick={handleDismiss} className="text-white/70 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Lessons */}
          <div className="p-4 space-y-3">
            {selectedLessons.map((lesson, idx) => {
              const Icon = lesson.icon
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + idx * 0.2 }}
                  className="flex items-start gap-3"
                >
                  <div className={`w-7 h-7 rounded-lg ${gameData.bgAccent} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {lesson.text}
                  </p>
                </motion.div>
              )
            })}
          </div>

          {/* Share footer */}
          <div className="px-4 pb-4 flex items-center gap-2">
            <Button
              onClick={handleShare}
              size="sm"
              className={`flex-1 bg-gradient-to-r ${gameData.color} text-white border-0 gap-2 text-xs`}
            >
              <Share2 className="w-3.5 h-3.5" />
              Share My Learnings
            </Button>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              WealthWise by NCFE
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
