"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { FINANCIAL_THEMES, USER_TRACKS, XP_CONFIG } from "@/lib/gameEngine"
import { useProfile } from "@/contexts/ProfileContext"
import {
  Map,
  CheckCircle,
  Lock,
  Star,
  ChevronRight,
  Trophy,
} from "lucide-react"

// Theme ordering for the journey path
const JOURNEY_THEMES = [
  'budgeting',
  'savings',
  'fraud_prevention',
  'digital_finance',
  'insurance',
  'credit',
  'investments',
  'taxes',
  'consumer_rights',
  'retirement',
]

const THEME_STATUS = {
  completed: { color: 'bg-emerald-500', ring: 'ring-emerald-300 dark:ring-emerald-700', text: 'text-emerald-600' },
  active: { color: 'bg-blue-500', ring: 'ring-blue-300 dark:ring-blue-700 animate-pulse', text: 'text-blue-600' },
  locked: { color: 'bg-slate-300 dark:bg-slate-600', ring: 'ring-slate-200 dark:ring-slate-700', text: 'text-slate-400' },
}

export default function LearningJourneyMap({ compact = false, className = "" }) {
  const router = useRouter()
  const { userTrack } = useProfile()
  const [progress, setProgress] = useState(null)
  const [themeProgress, setThemeProgress] = useState({})

  useEffect(() => {
    // Load game progress from localStorage
    const savedProgress = localStorage.getItem("wealthwise_game_progress")
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress)
        setProgress(parsed)
      } catch (e) {
        console.error("Error loading game progress:", e)
      }
    }

    // Load theme progress (which themes have been encountered in games)
    const savedThemes = localStorage.getItem("wealthwise_theme_progress")
    if (savedThemes) {
      try {
        setThemeProgress(JSON.parse(savedThemes))
      } catch (e) {
        console.error("Error loading theme progress:", e)
      }
    }
  }, [])

  // Determine current track themes
  const trackData = USER_TRACKS[userTrack] || USER_TRACKS.young_adult
  const trackThemes = trackData.financialThemes || []

  // Calculate theme status
  const getThemeStatus = (themeId) => {
    const tp = themeProgress[themeId]
    if (tp && tp.completed) return 'completed'
    if (tp && tp.encountered) return 'active'
    // If it's a track theme and the previous theme is completed, it's active
    const idx = JOURNEY_THEMES.indexOf(themeId)
    if (idx === 0) return 'active' // First theme always active
    const prevTheme = JOURNEY_THEMES[idx - 1]
    const prevStatus = themeProgress[prevTheme]
    if (prevStatus && prevStatus.completed) return 'active'
    return 'locked'
  }

  const completedCount = JOURNEY_THEMES.filter(t => getThemeStatus(t) === 'completed').length
  const totalThemes = JOURNEY_THEMES.length
  const progressPercent = Math.round((completedCount / totalThemes) * 100)

  // Get which themes are relevant for the user track
  const isTrackTheme = (themeId) => trackThemes.includes(themeId)

  if (compact) {
    return (
      <Card className={`${className}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Map className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            Learning Journey
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Progress bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>{completedCount}/{totalThemes} themes</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Compact theme dots */}
          <div className="flex items-center gap-1 flex-wrap mb-3" role="list" aria-label="Theme progress">
            {JOURNEY_THEMES.map((themeId, idx) => {
              const theme = FINANCIAL_THEMES[themeId]
              const status = getThemeStatus(themeId)
              const statusStyle = THEME_STATUS[status]
              const isTrack = isTrackTheme(themeId)

              return (
                <div
                  key={themeId}
                  className="relative group"
                  role="listitem"
                  title={`${theme?.name || themeId} ${status === 'completed' ? '(Completed)' : status === 'active' ? '(In Progress)' : '(Locked)'}`}
                  aria-label={`${theme?.name || themeId}: ${status === 'completed' ? 'Completed' : status === 'active' ? 'In Progress' : 'Locked'}`}
                >
                  <div className={`w-7 h-7 rounded-full ${statusStyle.color} ${isTrack ? 'ring-2 ' + statusStyle.ring : ''} flex items-center justify-center text-xs transition-transform hover:scale-110 cursor-pointer`}>
                    {status === 'completed' ? (
                      <CheckCircle className="w-4 h-4 text-white" />
                    ) : status === 'locked' ? (
                      <Lock className="w-3 h-3 text-white/60" />
                    ) : (
                      <span>{theme?.icon || '?'}</span>
                    )}
                  </div>
                  {/* Connector line */}
                  {idx < JOURNEY_THEMES.length - 1 && (
                    <div className={`absolute top-1/2 -right-1 w-1 h-0.5 ${status === 'completed' ? 'bg-emerald-400' : 'bg-slate-300 dark:bg-slate-600'}`} />
                  )}
                </div>
              )
            })}
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => router.push("/dashboard/games")}
            className="w-full text-xs"
          >
            <Map className="h-3 w-3 mr-1" />
            View Full Journey
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Full journey map view
  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Map className="h-5 w-5" />
            <span className="font-semibold">Your Financial Learning Journey</span>
          </div>
          <Badge className="bg-white/20 text-white border-0">
            {completedCount}/{totalThemes} themes
          </Badge>
        </div>
        <div className="mt-2 h-2 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-white rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </div>
        {trackData && (
          <p className="text-xs text-blue-100 mt-2">
            Track: {trackData.icon} {trackData.name} &middot; {trackData.skills.slice(0, 2).join(', ')}
          </p>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-2" role="list" aria-label="Financial themes learning path">
          {JOURNEY_THEMES.map((themeId, idx) => {
            const theme = FINANCIAL_THEMES[themeId]
            const status = getThemeStatus(themeId)
            const statusStyle = THEME_STATUS[status]
            const isTrack = isTrackTheme(themeId)

            return (
              <motion.div
                key={themeId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                role="listitem"
                aria-label={`${theme?.name || themeId}: ${status === 'completed' ? 'Completed' : status === 'active' ? 'In Progress' : 'Locked'}${isTrack ? ' (Your track theme)' : ''}`}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                  status === 'completed' 
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' 
                    : status === 'active'
                    ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                    : 'bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 opacity-60'
                }`}
              >
                {/* Theme icon */}
                <div className={`w-10 h-10 rounded-full ${statusStyle.color} flex items-center justify-center shrink-0 ${isTrack ? 'ring-2 ' + statusStyle.ring : ''}`}>
                  {status === 'completed' ? (
                    <CheckCircle className="w-5 h-5 text-white" />
                  ) : status === 'locked' ? (
                    <Lock className="w-4 h-4 text-white/60" />
                  ) : (
                    <span className="text-lg">{theme?.icon || '?'}</span>
                  )}
                </div>

                {/* Theme info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${status === 'locked' ? 'text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                      {theme?.name || themeId}
                    </span>
                    {isTrack && (
                      <Badge variant="outline" className="text-[10px] py-0 px-1 border-blue-300 text-blue-600 dark:border-blue-700 dark:text-blue-400">
                        Your Track
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {theme?.nameHindi || ''}
                  </p>
                </div>

                {/* Status */}
                <div className="shrink-0">
                  {status === 'completed' && (
                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-xs font-medium">Done</span>
                    </div>
                  )}
                  {status === 'active' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-blue-600 dark:text-blue-400 p-1 h-auto"
                      onClick={() => router.push("/dashboard/games")}
                    >
                      <span className="text-xs mr-1">Play</span>
                      <ChevronRight className="w-3 h-3" />
                    </Button>
                  )}
                  {status === 'locked' && (
                    <Lock className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Completion celebration */}
        {completedCount === totalThemes && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-center"
          >
            <Trophy className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <p className="font-bold text-amber-800 dark:text-amber-300">Financial Literacy Master! 🎉</p>
            <p className="text-sm text-amber-600 dark:text-amber-400">You have completed all 10 financial themes!</p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}
