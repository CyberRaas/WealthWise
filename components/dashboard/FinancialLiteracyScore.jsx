'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, TrendingUp, Gamepad2, BookOpen, Brain, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { XP_CONFIG } from '@/lib/gameEngine'

/**
 * Financial Literacy Score
 * 
 * Derives a 0-100 score from:
 *  - Game XP / level progress       (40%)
 *  - Games completed                (30%)
 *  - Learning modules completed     (20%)
 *  - Quiz accuracy (from games)     (10%)
 * 
 * This is the single measurable metric that proves "learning happened."
 */

const LITERACY_LEVELS = [
  { min: 0,  label: 'Beginner',     labelHi: 'शुरुआती',    color: 'text-red-500',    ring: 'text-red-500',    bg: 'bg-red-50 dark:bg-red-500/10' },
  { min: 20, label: 'Basic',        labelHi: 'बुनियादी',   color: 'text-orange-500', ring: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10' },
  { min: 40, label: 'Intermediate', labelHi: 'मध्यवर्ती',  color: 'text-amber-500',  ring: 'text-amber-500',  bg: 'bg-amber-50 dark:bg-amber-500/10' },
  { min: 60, label: 'Proficient',   labelHi: 'कुशल',       color: 'text-blue-500',   ring: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-500/10' },
  { min: 80, label: 'Advanced',     labelHi: 'उन्नत',      color: 'text-emerald-500',ring: 'text-emerald-500',bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
  { min: 95, label: 'Expert',       labelHi: 'विशेषज्ञ',   color: 'text-violet-500', ring: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-500/10' },
]

function getLiteracyLevel(score) {
  for (let i = LITERACY_LEVELS.length - 1; i >= 0; i--) {
    if (score >= LITERACY_LEVELS[i].min) return LITERACY_LEVELS[i]
  }
  return LITERACY_LEVELS[0]
}

// Theme coverage assessment
const ALL_THEMES = ['budgeting', 'savings', 'insurance', 'investments', 'fraud_prevention', 'digital_finance', 'credit', 'taxes']

function getThemesCoveredFromGames(gamesCompleted = []) {
  const themeMap = {
    'scam-buster': ['fraud_prevention', 'digital_finance'],
    'life-decisions': ['budgeting', 'savings', 'investments', 'insurance', 'taxes'],
    'insurance-academy': ['insurance'],
    'fitness-test': ['budgeting', 'savings', 'insurance', 'investments', 'fraud_prevention'],
  }
  const covered = new Set()
  gamesCompleted.forEach(g => (themeMap[g] || []).forEach(t => covered.add(t)))
  return covered
}

export function calculateLiteracyScore(gameProgress, learningProgress = {}) {
  // Defaults
  const totalXP = gameProgress?.totalXP || 0
  const gamesCompleted = gameProgress?.gamesCompleted || []
  const gamesPlayed = gameProgress?.gamesPlayed || 0
  const achievements = gameProgress?.achievements || []
  const modulesCompleted = learningProgress?.modulesCompleted || 0
  const totalModules = learningProgress?.totalModules || 10

  // --- Component 1: XP & Level Progress (40 pts) ---
  // Max XP we consider = 5000 (Level 10 - Money Master)
  const maxXP = 5000
  const xpScore = Math.min(totalXP / maxXP, 1) * 40

  // --- Component 2: Game Coverage (30 pts) ---
  // How many of 4 games completed?
  const totalGames = 4
  const gameCompletionScore = (gamesCompleted.length / totalGames) * 15
  // Theme coverage — how many of 8 themes touched?
  const themesCovered = getThemesCoveredFromGames(gamesCompleted)
  const themeCoverageScore = (themesCovered.size / ALL_THEMES.length) * 15

  // --- Component 3: Learning Modules (20 pts) ---
  const moduleScore = totalModules > 0 ? (modulesCompleted / totalModules) * 20 : 0

  // --- Component 4: Engagement & Mastery (10 pts) ---
  // Achievements earned (max 5 counted) + replays
  const achievementScore = Math.min(achievements.length / 5, 1) * 5
  const replayScore = Math.min(gamesPlayed / 8, 1) * 5 // Playing 8+ games shows commitment

  const total = Math.round(xpScore + gameCompletionScore + themeCoverageScore + moduleScore + achievementScore + replayScore)
  return Math.min(Math.max(total, 0), 100)
}

export default function FinancialLiteracyScore({ compact = false }) {
  const router = useRouter()
  const [score, setScore] = useState(0)
  const [breakdown, setBreakdown] = useState(null)
  const [animatedScore, setAnimatedScore] = useState(0)

  useEffect(() => {
    // Read game progress from localStorage
    let gameProgress = { totalXP: 0, gamesCompleted: [], gamesPlayed: 0, achievements: [] }
    try {
      const saved = localStorage.getItem('wealthwise_game_progress')
      if (saved) gameProgress = JSON.parse(saved)
    } catch (e) {}

    // Read learning progress
    let learningProgress = { modulesCompleted: 0, totalModules: 10 }
    try {
      const savedLearning = localStorage.getItem('wealthwise_learning_progress')
      if (savedLearning) learningProgress = JSON.parse(savedLearning)
    } catch (e) {}

    const computed = calculateLiteracyScore(gameProgress, learningProgress)
    setScore(computed)

    // Build breakdown
    const totalXP = gameProgress.totalXP || 0
    const gamesCompleted = gameProgress.gamesCompleted || []
    const themesCovered = getThemesCoveredFromGames(gamesCompleted)

    setBreakdown({
      xp: totalXP,
      gamesCompleted: gamesCompleted.length,
      totalGames: 4,
      themesCovered: themesCovered.size,
      totalThemes: ALL_THEMES.length,
      modulesCompleted: learningProgress.modulesCompleted,
      totalModules: learningProgress.totalModules,
      achievements: (gameProgress.achievements || []).length,
    })
  }, [])

  // Animate score on mount
  useEffect(() => {
    if (score <= 0) return
    let current = 0
    const step = Math.max(1, Math.floor(score / 40))
    const timer = setInterval(() => {
      current += step
      if (current >= score) {
        current = score
        clearInterval(timer)
      }
      setAnimatedScore(current)
    }, 30)
    return () => clearInterval(timer)
  }, [score])

  const level = getLiteracyLevel(score)
  const circumference = 2 * Math.PI * 42
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference

  if (compact) {
    return (
      <button
        onClick={() => router.push('/dashboard/games')}
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-500/10 dark:to-indigo-500/10 border border-violet-100 dark:border-violet-500/20 hover:shadow-md transition-all group"
      >
        <div className="relative w-10 h-10 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" className="text-violet-100 dark:text-white/5" strokeWidth="2.5" />
            <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" className={level.ring}
              strokeWidth="2.5" strokeLinecap="round"
              strokeDasharray={`${(animatedScore / 100) * 94.2} 94.2`}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-slate-900 dark:text-white">
            {animatedScore}
          </span>
        </div>
        <div className="text-left">
          <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Literacy Score</p>
          <p className={`text-[10px] font-semibold ${level.color}`}>{level.label}</p>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 ml-auto group-hover:translate-x-0.5 transition-transform" />
      </button>
    )
  }

  return (
    <Card className="border-slate-100 dark:border-white/5 dark:bg-white/[0.03] overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-violet-500" />
          Financial Literacy Score
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="flex items-center gap-6">
          {/* Big Ring */}
          <div className="relative w-24 h-24 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" className="text-slate-100 dark:text-white/5" strokeWidth="6" />
              <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor"
                className={level.ring}
                strokeWidth="6" strokeLinecap="round"
                style={{ strokeDasharray: circumference, strokeDashoffset, transition: 'stroke-dashoffset 1s ease-out' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">{animatedScore}</span>
              <span className="text-[9px] text-slate-400 font-medium mt-0.5">/100</span>
            </div>
          </div>

          {/* Breakdown */}
          <div className="flex-1 space-y-2 min-w-0">
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${level.bg} ${level.color}`}>
              {level.label} · {level.labelHi}
            </div>

            {breakdown && (
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                <div className="flex items-center gap-1.5">
                  <Gamepad2 className="w-3 h-3 text-violet-400" />
                  <span className="text-slate-500 dark:text-slate-400">Games</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200 ml-auto">{breakdown.gamesCompleted}/{breakdown.totalGames}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Brain className="w-3 h-3 text-blue-400" />
                  <span className="text-slate-500 dark:text-slate-400">Themes</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200 ml-auto">{breakdown.themesCovered}/{breakdown.totalThemes}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                  <span className="text-slate-500 dark:text-slate-400">XP</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200 ml-auto">{breakdown.xp.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-3 h-3 text-amber-400" />
                  <span className="text-slate-500 dark:text-slate-400">Modules</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200 ml-auto">{breakdown.modulesCompleted}/{breakdown.totalModules}</span>
                </div>
              </div>
            )}

            <button
              onClick={() => router.push('/dashboard/games')}
              className="flex items-center gap-1 text-[11px] font-bold text-violet-600 dark:text-violet-400 hover:underline mt-1"
            >
              Improve your score <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
