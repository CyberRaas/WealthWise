"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"
import {
  TrendingUp,
  TrendingDown,
  Target,
  ArrowRight,
  Trophy,
  BookOpen,
  Sparkles,
} from "lucide-react"

const LEVEL_COLORS = {
  beginner: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  basic: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  intermediate: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  advanced: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  expert: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
}

const LEVEL_LABELS = {
  beginner: "Beginner",
  basic: "Basic",
  intermediate: "Intermediate",
  advanced: "Advanced",
  expert: "Expert",
}

export default function LiteracyImprovementWidget({ className = "" }) {
  const router = useRouter()
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch("/api/assessment")
        const data = await res.json()
        if (data.success) {
          setMetrics(data.metrics)
        }
      } catch (err) {
        console.error("Failed to fetch assessment metrics:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchMetrics()
  }, [])

  if (loading) {
    return (
      <Card className={`animate-pulse ${className}`}>
        <CardContent className="p-6">
          <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-lg" />
        </CardContent>
      </Card>
    )
  }

  // No assessment taken yet
  if (!metrics || !metrics.hasPreTest) {
    return (
      <Card className={`border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 ${className}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            Financial Literacy Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
            Take the Financial Fitness Test to measure your financial literacy level.
          </p>
          <Button
            size="sm"
            onClick={() => router.push("/dashboard/games")}
            className="bg-amber-600 hover:bg-amber-700 text-white w-full"
          >
            <Target className="h-4 w-4 mr-2" />
            Take Pre-Test
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Has pre-test but no post-test
  if (!metrics.hasPostTest) {
    return (
      <Card className={`border-blue-200 dark:border-blue-800 ${className}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            Your Literacy Baseline
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-400">Pre-Test Score</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-slate-900 dark:text-white">{metrics.preTest.score}%</span>
              <Badge className={LEVEL_COLORS[metrics.preTest.literacyLevel]}>
                {LEVEL_LABELS[metrics.preTest.literacyLevel]}
              </Badge>
            </div>
          </div>
          
          <Progress value={metrics.preTest.score} className="h-2" />
          
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Play more games to learn, then take the post-test to measure improvement!
          </p>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.push("/dashboard/games")}
            className="w-full"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Play Games & Learn
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Has both pre and post test - show improvement
  const { improvement } = metrics
  const isImproved = improvement.scoreChange > 0

  return (
    <Card className={`border-emerald-200 dark:border-emerald-800 ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          {isImproved ? (
            <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
          Literacy Improvement
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {/* Score comparison */}
        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
          <div className="text-center">
            <p className="text-xs text-slate-500 mb-1">Pre-Test</p>
            <p className="text-lg font-bold text-slate-700 dark:text-slate-300">{metrics.preTest.score}%</p>
            <Badge className={`text-xs ${LEVEL_COLORS[metrics.preTest.literacyLevel]}`}>
              {LEVEL_LABELS[metrics.preTest.literacyLevel]}
            </Badge>
          </div>
          
          <div className="flex flex-col items-center">
            <ArrowRight className="h-5 w-5 text-slate-400" />
            <span className={`text-sm font-bold ${isImproved ? "text-emerald-600" : "text-red-500"}`}>
              {isImproved ? "+" : ""}{improvement.scoreChange}%
            </span>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-slate-500 mb-1">Post-Test</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{metrics.postTest.score}%</p>
            <Badge className={`text-xs ${LEVEL_COLORS[metrics.postTest.literacyLevel]}`}>
              {LEVEL_LABELS[metrics.postTest.literacyLevel]}
            </Badge>
          </div>
        </div>

        {/* Level change celebration */}
        {improvement.levelChange && isImproved && (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 text-center">
            <Trophy className="h-5 w-5 text-amber-500 mx-auto mb-1" />
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
              Level Up! {LEVEL_LABELS[improvement.fromLevel]} → {LEVEL_LABELS[improvement.toLevel]}
            </p>
          </div>
        )}

        {/* Theme improvements */}
        {improvement.themeImprovements && improvement.themeImprovements.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">By Theme</p>
            {improvement.themeImprovements.slice(0, 4).map((theme) => (
              <div key={theme.theme} className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400 capitalize">
                  {theme.theme.replace(/_/g, " ")}
                </span>
                <span className={`font-medium ${theme.change > 0 ? "text-emerald-600" : theme.change < 0 ? "text-red-500" : "text-slate-400"}`}>
                  {theme.change > 0 ? "+" : ""}{theme.change}%
                </span>
              </div>
            ))}
          </div>
        )}

        <Button
          size="sm"
          variant="outline"
          onClick={() => router.push("/dashboard/games")}
          className="w-full"
        >
          <Target className="h-4 w-4 mr-2" />
          Retake Assessment
        </Button>
      </CardContent>
    </Card>
  )
}
