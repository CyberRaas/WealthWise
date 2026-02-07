'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  XP_CONFIG,
  FINANCIAL_THEMES
} from '@/lib/gameEngine'
import { useProfile } from '@/contexts/ProfileContext'
import ScamBusterGame from '@/components/games/ScamBusterGame'
import LifeDecisionsGame from '@/components/games/LifeDecisionsGame'
import InsuranceModule from '@/components/games/InsuranceModule'
import FinancialFitnessTest from '@/components/games/FinancialFitnessTest'
import LearningJourneyMap from '@/components/games/LearningJourneyMap'
import {
  Gamepad2,
  Shield,
  Wallet,
  Trophy,
  Star,
  Zap,
  ChevronRight,
  Home,
  Target,
  Award,
  TrendingUp,
  Lock,
  CheckCircle,
  Play,
  BookOpen,
  Heart,
  AlertTriangle,
  Sparkles,
  Menu,
  X
} from 'lucide-react'
import confetti from 'canvas-confetti'

// Game definitions with clear purposes
const GAMES = [
  {
    id: 'scam-buster',
    name: 'Scam Buster',
    shortName: 'Scam Buster',
    description: 'Learn to spot and avoid financial frauds',
    longDescription: 'Test your ability to identify real-world scams including UPI fraud, phishing, fake loans, and more. Each scenario teaches you how to protect your money.',
    icon: Shield,
    emoji: '🕵️',
    color: 'bg-red-500',
    gradient: 'from-red-500 to-orange-500',
    xpReward: '50-150 XP',
    duration: '5-10 min',
    difficulty: 'Medium',
    skills: ['Fraud Detection', 'Digital Safety', 'Critical Thinking'],
    unlockLevel: 1
  },
  {
    id: 'life-decisions',
    name: 'Life Decisions',
    shortName: 'Life Choices',
    description: 'Make smart money choices each month',
    longDescription: 'Experience 6 months of real financial decisions. Manage your salary, handle emergencies, resist temptations, and build wealth. See how your choices impact your future.',
    icon: Wallet,
    emoji: '🎮',
    color: 'bg-violet-500',
    gradient: 'from-violet-500 to-purple-500',
    xpReward: '100-300 XP',
    duration: '10-15 min',
    difficulty: 'Medium',
    skills: ['Budgeting', 'Savings', 'Investment', 'Debt Management'],
    unlockLevel: 1
  },
  {
    id: 'insurance-academy',
    name: 'Insurance Academy',
    shortName: 'Insurance 101',
    description: 'Master insurance basics with quizzes',
    longDescription: 'Learn about life, health, vehicle, and home insurance. Take quizzes to test your knowledge and use calculators to find the right coverage for you.',
    icon: Heart,
    emoji: '🛡️',
    color: 'bg-emerald-500',
    gradient: 'from-emerald-500 to-teal-500',
    xpReward: '75-200 XP',
    duration: '10-15 min',
    difficulty: 'Easy',
    skills: ['Insurance Basics', 'Risk Assessment', 'Coverage Planning'],
    unlockLevel: 1
  },
  {
    id: 'fitness-test',
    name: 'Financial Fitness Test',
    shortName: 'Fitness Test',
    description: 'Assess your financial literacy level',
    longDescription: 'Take a 10-question assessment covering budgeting, savings, insurance, fraud prevention and more. Track your improvement over time. Questions adapt to your learning track.',
    icon: Target,
    emoji: '🏋️',
    color: 'bg-amber-500',
    gradient: 'from-amber-500 to-orange-500',
    xpReward: '25-100 XP',
    duration: '5-8 min',
    difficulty: 'Adaptive',
    skills: ['All Financial Themes', 'Self-Assessment', 'Knowledge Tracking'],
    unlockLevel: 1
  }
]

export default function GamesPage() {
  const { userTrack: profileTrack } = useProfile()
  const userTrack = profileTrack || 'young_adult'
  const [activeView, setActiveView] = useState('home') // home, game
  const [selectedGame, setSelectedGame] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // User progress state
  const [userProgress, setUserProgress] = useState({
    totalXP: 0,
    level: 1,
    levelName: 'Financial Newbie',
    gamesPlayed: 0,
    gamesCompleted: [],
    achievements: [],
    streak: 0,
    lastPlayed: null
  })

  // Load progress on mount
  useEffect(() => {
    const savedProgress = localStorage.getItem('wealthwise_game_progress')
    if (savedProgress) {
      try {
        setUserProgress(JSON.parse(savedProgress))
      } catch (e) {
        console.error('Error loading progress:', e)
      }
    }
  }, [])

  // Save progress when it changes
  useEffect(() => {
    if (userProgress.totalXP > 0 || userProgress.gamesPlayed > 0) {
      localStorage.setItem('wealthwise_game_progress', JSON.stringify(userProgress))
    }
  }, [userProgress])

  // Calculate level from XP
  const calculateLevel = (xp) => {
    for (let i = XP_CONFIG.levels.length - 1; i >= 0; i--) {
      if (xp >= XP_CONFIG.levels[i].minXP) {
        return XP_CONFIG.levels[i]
      }
    }
    return XP_CONFIG.levels[0]
  }

  const currentLevelInfo = calculateLevel(userProgress.totalXP)
  const nextLevel = XP_CONFIG.levels[currentLevelInfo.level] || XP_CONFIG.levels[XP_CONFIG.levels.length - 1]
  const xpForCurrentLevel = userProgress.totalXP - currentLevelInfo.minXP
  const xpNeededForNext = nextLevel.minXP - currentLevelInfo.minXP
  const progressPercent = xpNeededForNext > 0 ? Math.min(100, (xpForCurrentLevel / xpNeededForNext) * 100) : 100

  // Handle XP earned
  const handleXPEarned = (xp, gameId) => {
    const newXP = userProgress.totalXP + xp
    const newLevel = calculateLevel(newXP)
    const oldLevel = calculateLevel(userProgress.totalXP)

    if (newLevel.level > oldLevel.level) {
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 } })
    }

    setUserProgress(prev => ({
      ...prev,
      totalXP: newXP,
      level: newLevel.level,
      levelName: newLevel.name,
      gamesPlayed: prev.gamesPlayed + 1,
      gamesCompleted: prev.gamesCompleted.includes(gameId)
        ? prev.gamesCompleted
        : [...prev.gamesCompleted, gameId],
      lastPlayed: new Date().toISOString()
    }))
  }

  // Handle game completion
  const handleGameComplete = (gameId, result) => {
    const newAchievements = [...userProgress.achievements]

    if (userProgress.gamesPlayed === 0 && !newAchievements.includes('first_game')) {
      newAchievements.push('first_game')
    }

    if (gameId === 'scam-buster' && result.correct === result.total && !newAchievements.includes('scam_master')) {
      newAchievements.push('scam_master')
    }

    if (gameId === 'insurance-academy' && !newAchievements.includes('insurance_pro')) {
      newAchievements.push('insurance_pro')
    }

    if (newAchievements.length > userProgress.achievements.length) {
      setUserProgress(prev => ({ ...prev, achievements: newAchievements }))
    }
  }

  // Start a game
  const startGame = (gameId) => {
    setSelectedGame(gameId)
    setActiveView('game')
    setMobileMenuOpen(false)
  }

  // Go back to home
  const goHome = () => {
    setActiveView('home')
    setSelectedGame(null)
  }

  // Sidebar Component
  const Sidebar = ({ mobile = false }) => (
    <div className={`${mobile ? 'w-full' : 'w-64'} bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full`}>
      {/* Logo/Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <Gamepad2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Learn & Play</h2>
            <p className="text-xs text-slate-500">Financial Games</p>
          </div>
        </div>
      </div>

      {/* XP Progress */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Level {currentLevelInfo.level}</span>
          <span className="text-xs text-slate-500">{userProgress.totalXP} XP</span>
        </div>
        <Progress value={progressPercent} className="h-2 mb-1" />
        <p className="text-xs text-slate-500">{currentLevelInfo.name}</p>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 p-2">
        {/* Home */}
        <button
          onClick={goHome}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left mb-1 transition-colors ${activeView === 'home'
              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
              : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
        >
          <Home className="w-5 h-5" />
          <span className="font-medium">Home</span>
        </button>

        {/* Games Section */}
        <div className="mt-4 mb-2 px-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Games</p>
        </div>

        {GAMES.map((game) => {
          const Icon = game.icon
          const isActive = selectedGame === game.id && activeView === 'game'
          const isCompleted = userProgress.gamesCompleted.includes(game.id)

          return (
            <button
              key={game.id}
              onClick={() => startGame(game.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left mb-1 transition-colors ${isActive
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
            >
              <div className={`w-8 h-8 rounded-lg ${game.color} flex items-center justify-center`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-medium block truncate">{game.shortName}</span>
                <span className="text-xs text-slate-500">{game.duration}</span>
              </div>
              {isCompleted && (
                <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              )}
            </button>
          )
        })}

        {/* Stats */}
        <div className="mt-6 mb-2 px-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Your Stats</p>
        </div>

        <div className="px-3 space-y-2">
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              Games Played
            </span>
            <span className="font-semibold">{userProgress.gamesPlayed}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <Award className="w-4 h-4 text-violet-500" />
              Achievements
            </span>
            <span className="font-semibold">{userProgress.achievements.length}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-500" />
              Total XP
            </span>
            <span className="font-semibold">{userProgress.totalXP}</span>
          </div>
        </div>
      </ScrollArea>
    </div>
  )

  // Home View - Game Selection
  const HomeView = () => (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Learn Finance Through Games 🎮
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Build real-world money skills with interactive games. No boring lectures!
        </p>
      </div>

      {/* Quick Start Guide for New Users */}
      {userProgress.gamesPlayed === 0 && (
        <Card className="mb-8 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-emerald-800 dark:text-emerald-300 mb-1">
                  Welcome! Here&apos;s how it works
                </h3>
                <ul className="text-sm text-emerald-700 dark:text-emerald-400 space-y-1">
                  <li>🎯 Choose any game below to start learning</li>
                  <li>⭐ Earn XP points for correct answers</li>
                  <li>📈 Level up as you gain more knowledge</li>
                  <li>🏆 Unlock achievements for special accomplishments</li>
                </ul>
                <p className="mt-3 text-sm font-medium text-emerald-800 dark:text-emerald-300">
                  Start with <strong>Scam Buster</strong> - it&apos;s quick and fun!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Card (for returning users) */}
      {userProgress.gamesPlayed > 0 && (
        <Card className="mb-8 bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm">Your Progress</p>
                <h3 className="text-2xl font-bold">{currentLevelInfo.name}</h3>
                <p className="text-emerald-100 text-sm mt-1">
                  {userProgress.totalXP} XP • Level {currentLevelInfo.level}
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">{userProgress.gamesPlayed}</div>
                <p className="text-emerald-100 text-sm">Games Played</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress to Level {currentLevelInfo.level + 1}</span>
                <span>{Math.round(progressPercent)}%</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Learning Journey Map */}
      <div className="mb-8">
        <LearningJourneyMap userTrack={userTrack} />
      </div>

      {/* Games Grid */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Choose a Game</h2>
        <div className="grid gap-4 md:grid-cols-3" role="list" aria-label="Available games">
          {GAMES.map((game, idx) => {
            const Icon = game.icon
            const isCompleted = userProgress.gamesCompleted.includes(game.id)

            return (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card
                  className="h-full cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 overflow-hidden group"
                  onClick={() => startGame(game.id)}
                >
                  {/* Header with gradient */}
                  <div className={`h-24 bg-gradient-to-r ${game.gradient} relative`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-5xl">{game.emoji}</span>
                    </div>
                    {isCompleted && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-white/90 text-emerald-700">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Completed
                        </Badge>
                      </div>
                    )}
                  </div>

                  <CardContent className="pt-4">
                    <h3 className="font-bold text-lg mb-1">{game.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      {game.description}
                    </p>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-500" />
                        {game.xpReward}
                      </span>
                      <span>⏱️ {game.duration}</span>
                    </div>

                    <Button
                      className={`w-full mt-4 bg-gradient-to-r ${game.gradient} text-white group-hover:shadow-md transition-shadow`}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Play Now
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* What You'll Learn Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-500" />
            What You&apos;ll Learn
          </CardTitle>
          <CardDescription>
            Master these essential financial skills through our games
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { name: 'Fraud Prevention', icon: Shield, color: 'text-red-500' },
              { name: 'Budgeting', icon: Wallet, color: 'text-violet-500' },
              { name: 'Savings', icon: Target, color: 'text-emerald-500' },
              { name: 'Insurance', icon: Heart, color: 'text-pink-500' },
              { name: 'Investments', icon: TrendingUp, color: 'text-blue-500' },
              { name: 'Debt Management', icon: AlertTriangle, color: 'text-amber-500' },
              { name: 'Tax Planning', icon: BookOpen, color: 'text-indigo-500' },
              { name: 'Digital Safety', icon: Lock, color: 'text-slate-500' },
            ].map((skill) => (
              <div
                key={skill.name}
                className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800"
              >
                <skill.icon className={`w-4 h-4 ${skill.color}`} />
                <span className="text-sm font-medium">{skill.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // Game View
  const GameView = () => {
    const game = GAMES.find(g => g.id === selectedGame)
    if (!game) return null

    return (
      <div className="p-4 md:p-6">
        {selectedGame === 'scam-buster' && (
          <ScamBusterGame
            userTrack={userTrack}
            onComplete={(result) => handleGameComplete('scam-buster', result)}
            onXPEarned={(xp) => handleXPEarned(xp, 'scam-buster')}
          />
        )}

        {selectedGame === 'life-decisions' && (
          <LifeDecisionsGame
            userTrack={userTrack}
            onComplete={(result) => handleGameComplete('life-decisions', result)}
            onXPEarned={(xp) => handleXPEarned(xp, 'life-decisions')}
          />
        )}

        {selectedGame === 'insurance-academy' && (
          <InsuranceModule
            userTrack={userTrack}
            onComplete={(result) => handleGameComplete('insurance-academy', result)}
            onXPEarned={(xp) => handleXPEarned(xp, 'insurance-academy')}
          />
        )}

        {selectedGame === 'fitness-test' && (
          <FinancialFitnessTest
            userTrack={userTrack}
            isPreTest={!userProgress.gamesCompleted?.includes('fitness-test')}
            onComplete={(result) => {
              handleGameComplete('fitness-test', result)
              if (result.earnedXP) handleXPEarned(result.earnedXP, 'fitness-test')
            }}
          />
        )}
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950">
      {/* Desktop Sidebar */}
      <nav className="hidden md:block" aria-label="Game navigation">
        <Sidebar />
      </nav>

      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-50 md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 -ml-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Open game menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-emerald-500" />
            <span className="font-semibold">Learn & Play</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="font-medium">{userProgress.totalXP}</span>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-[280px] z-50 md:hidden"
            >
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-full bg-slate-100 dark:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <Sidebar mobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 overflow-auto md:pt-0 pt-14">
        <ScrollArea className="h-full">
          {activeView === 'home' && <HomeView />}
          {activeView === 'game' && <GameView />}
        </ScrollArea>
      </div>
    </div>
  )
}
