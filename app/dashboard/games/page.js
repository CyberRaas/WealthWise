'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { XP_CONFIG } from '@/lib/gameEngine'
import { useProfile } from '@/contexts/ProfileContext'
import ScamBusterGame from '@/components/games/ScamBusterGame'
import LifeDecisionsGame from '@/components/games/LifeDecisionsGame'
import InsuranceModule from '@/components/games/InsuranceModule'
import FinancialFitnessTest from '@/components/games/FinancialFitnessTest'
import LearningJourneyMap from '@/components/games/LearningJourneyMap'
import {
  Shield, Wallet, Trophy, Zap, ChevronLeft, Target,
  Award, Play, BookOpen, Heart, Sparkles, CheckCircle, Gamepad2
} from 'lucide-react'
import confetti from 'canvas-confetti'
import PostGameActionBridge from '@/components/games/PostGameActionBridge'
import WhatILearned from '@/components/games/WhatILearned'

const GAMES = [
  {
    id: 'scam-buster', name: 'Scam Buster',
    description: 'Learn to spot and avoid financial frauds',
    icon: Shield, emoji: '\uD83D\uDD75\uFE0F',
    gradient: 'from-red-500 to-orange-500', color: 'bg-red-500',
    xpReward: '50-150 XP', duration: '5-10 min', difficulty: 'Medium',
    skills: ['Fraud Detection', 'Digital Safety', 'Critical Thinking'],
  },
  {
    id: 'life-decisions', name: 'Life Decisions',
    description: 'Make smart money choices each month',
    icon: Wallet, emoji: '\uD83C\uDFAE',
    gradient: 'from-violet-500 to-purple-500', color: 'bg-violet-500',
    xpReward: '100-300 XP', duration: '10-15 min', difficulty: 'Medium',
    skills: ['Budgeting', 'Savings', 'Investment', 'Debt Management'],
  },
  {
    id: 'insurance-academy', name: 'Insurance Academy',
    description: 'Master insurance basics with quizzes',
    icon: Heart, emoji: '\uD83D\uDEE1\uFE0F',
    gradient: 'from-emerald-500 to-teal-500', color: 'bg-emerald-500',
    xpReward: '75-200 XP', duration: '10-15 min', difficulty: 'Easy',
    skills: ['Insurance Basics', 'Risk Assessment', 'Coverage Planning'],
  },
  {
    id: 'fitness-test', name: 'Financial Fitness Test',
    description: 'Assess your financial literacy level',
    icon: Target, emoji: '\uD83C\uDFCB\uFE0F',
    gradient: 'from-amber-500 to-orange-500', color: 'bg-amber-500',
    xpReward: '25-100 XP', duration: '5-8 min', difficulty: 'Adaptive',
    skills: ['All Financial Themes', 'Self-Assessment'],
  }
]

export default function GamesPage() {
  const { userTrack: profileTrack } = useProfile()
  const userTrack = profileTrack || 'young_adult'
  const [activeView, setActiveView] = useState('home')
  const [selectedGame, setSelectedGame] = useState(null)
  const [lastGameResult, setLastGameResult] = useState(null)
  const [showActionBridge, setShowActionBridge] = useState(false)

  const [userProgress, setUserProgress] = useState({
    totalXP: 0, level: 1, levelName: 'Financial Newbie',
    gamesPlayed: 0, gamesCompleted: [], achievements: [],
    streak: 0, lastPlayed: null
  })

  useEffect(() => {
    const saved = localStorage.getItem('wealthwise_game_progress')
    if (saved) { try { setUserProgress(JSON.parse(saved)) } catch(e) {} }
  }, [])

  useEffect(() => {
    if (userProgress.totalXP > 0 || userProgress.gamesPlayed > 0)
      localStorage.setItem('wealthwise_game_progress', JSON.stringify(userProgress))
  }, [userProgress])

  const calculateLevel = (xp) => {
    for (let i = XP_CONFIG.levels.length - 1; i >= 0; i--)
      if (xp >= XP_CONFIG.levels[i].minXP) return XP_CONFIG.levels[i]
    return XP_CONFIG.levels[0]
  }

  const currentLevel = calculateLevel(userProgress.totalXP)
  const nextLevel = XP_CONFIG.levels[currentLevel.level] || XP_CONFIG.levels[XP_CONFIG.levels.length - 1]
  const xpInLevel = userProgress.totalXP - currentLevel.minXP
  const xpNeeded = nextLevel.minXP - currentLevel.minXP
  const progressPct = xpNeeded > 0 ? Math.min(100, (xpInLevel / xpNeeded) * 100) : 100

  const handleXPEarned = (xp, gameId) => {
    const newXP = userProgress.totalXP + xp
    const newLvl = calculateLevel(newXP)
    const oldLvl = calculateLevel(userProgress.totalXP)
    if (newLvl.level > oldLvl.level) confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 } })
    setUserProgress(prev => ({
      ...prev, totalXP: newXP, level: newLvl.level, levelName: newLvl.name,
      gamesPlayed: prev.gamesPlayed + 1,
      gamesCompleted: prev.gamesCompleted.includes(gameId) ? prev.gamesCompleted : [...prev.gamesCompleted, gameId],
      lastPlayed: new Date().toISOString()
    }))
  }

  const handleGameComplete = (gameId, result) => {
    const newAch = [...userProgress.achievements]
    if (userProgress.gamesPlayed === 0 && !newAch.includes('first_game')) newAch.push('first_game')
    if (gameId === 'scam-buster' && result.correct === result.total && !newAch.includes('scam_master')) newAch.push('scam_master')
    if (gameId === 'insurance-academy' && !newAch.includes('insurance_pro')) newAch.push('insurance_pro')
    if (newAch.length > userProgress.achievements.length)
      setUserProgress(prev => ({ ...prev, achievements: newAch }))

    // Save game-specific behavioral data for cross-feature insights
    try {
      if (gameId === 'life-decisions' && result) {
        localStorage.setItem('wealthwise_life_decisions_result', JSON.stringify({
          grade: result.grade,
          behaviorTags: result.behaviorTags || result.tags || [],
          savings: result.savings,
          debt: result.debt,
          completedAt: new Date().toISOString()
        }))
      }
      if (gameId === 'scam-buster' && result) {
        localStorage.setItem('wealthwise_scam_buster_result', JSON.stringify({
          correct: result.correct,
          total: result.total,
          completedAt: new Date().toISOString()
        }))
      }
    } catch (e) {}

    // Show the post-game action bridge
    setLastGameResult({ gameId, result })
    setShowActionBridge(true)
  }

  const startGame = (id) => { setSelectedGame(id); setActiveView('game'); setShowActionBridge(false); setLastGameResult(null) }
  const goHome = () => { setActiveView('home'); setSelectedGame(null) }

  return (
    <DashboardLayout title="Financial Games">
      {activeView === 'game' ? (
        <div>
          <button onClick={goHome} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-6 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Back to Games
          </button>
          {selectedGame === 'scam-buster' && <ScamBusterGame userTrack={userTrack} onComplete={(r) => handleGameComplete('scam-buster', r)} onXPEarned={(xp) => handleXPEarned(xp, 'scam-buster')} />}
          {selectedGame === 'life-decisions' && <LifeDecisionsGame userTrack={userTrack} onComplete={(r) => handleGameComplete('life-decisions', r)} onXPEarned={(xp) => handleXPEarned(xp, 'life-decisions')} />}
          {selectedGame === 'insurance-academy' && <InsuranceModule userTrack={userTrack} onComplete={(r) => handleGameComplete('insurance-academy', r)} onXPEarned={(xp) => handleXPEarned(xp, 'insurance-academy')} />}
          {selectedGame === 'fitness-test' && <FinancialFitnessTest userTrack={userTrack} isPreTest={!userProgress.gamesCompleted?.includes('fitness-test')} onComplete={(r) => { handleGameComplete('fitness-test', r); if (r.earnedXP) handleXPEarned(r.earnedXP, 'fitness-test') }} />}

          {/* Post-Game Action Bridge */}
          {showActionBridge && lastGameResult && (
            <PostGameActionBridge
              gameId={lastGameResult.gameId}
              result={lastGameResult.result}
              onDismiss={() => setShowActionBridge(false)}
            />
          )}

          {/* What I Learned Summary */}
          {showActionBridge && lastGameResult && (
            <WhatILearned
              gameId={lastGameResult.gameId}
              result={lastGameResult.result}
              onDismiss={() => {}}
            />
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Learn Finance Through Games
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
              Build real-world money skills with interactive challenges
            </p>
          </div>

          {/* Progress Bar */}
          <div className="bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-2xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                  <Gamepad2 className="w-6 h-6 text-emerald-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">Level {currentLevel.level}</span>
                    <span className="text-xs text-slate-400">{currentLevel.name}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6 text-center">
                <div>
                  <p className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">{userProgress.totalXP}</p>
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider">XP</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">{userProgress.gamesPlayed}</p>
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider">Played</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">{userProgress.achievements.length}</p>
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider">Awards</p>
                </div>
              </div>
            </div>
          </div>

          {/* New User Welcome */}
          {userProgress.gamesPlayed === 0 && (
            <div className="bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 mb-1">Welcome! Here&apos;s how it works</p>
                  <p className="text-sm text-emerald-700 dark:text-emerald-400">
                    Choose any game below to start learning. Earn XP for correct answers, level up, and unlock achievements. Start with Scam Buster — it&apos;s quick and fun!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Learning Journey */}
          <LearningJourneyMap userTrack={userTrack} />

          {/* Game Grid */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Choose a Game</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {GAMES.map((game, idx) => {
                const Icon = game.icon
                const done = userProgress.gamesCompleted.includes(game.id)
                return (
                  <motion.div key={game.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.06 }}>
                    <button onClick={() => startGame(game.id)} className="w-full text-left bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-2xl overflow-hidden hover:border-slate-200 dark:hover:border-white/10 hover:shadow-md transition-all group">
                      <div className={`h-20 bg-gradient-to-r ${game.gradient} flex items-center justify-center relative`}>
                        <span className="text-4xl">{game.emoji}</span>
                        {done && (
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-white/90 text-emerald-700 text-[10px]">
                              <CheckCircle className="w-3 h-3 mr-1" /> Done
                            </Badge>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{game.name}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">{game.description}</p>
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-amber-500" />{game.xpReward}</span>
                          <span>{game.duration}</span>
                        </div>
                      </div>
                    </button>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Skills */}
          <Card className="border-slate-100 dark:border-white/5 dark:bg-white/[0.03]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-500" />
                Skills You&apos;ll Master
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['Fraud Prevention', 'Budgeting', 'Savings', 'Insurance', 'Investments', 'Debt Management', 'Tax Planning', 'Digital Safety'].map(skill => (
                  <div key={skill} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-white/[0.03] text-sm text-slate-600 dark:text-slate-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {skill}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  )
}
