'use client'

import Link from 'next/link'
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  PartyPopper,
  ArrowRight,
  Sparkles
} from 'lucide-react'

const typeConfig = {
  spending: {
    icon: TrendingUp,
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    border: 'border-blue-200 dark:border-blue-800',
    iconBg: 'bg-blue-100 dark:bg-blue-900/60',
    iconColor: 'text-blue-600 dark:text-blue-400',
    titleColor: 'text-blue-900 dark:text-blue-200'
  },
  achievement: {
    icon: CheckCircle2,
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-200 dark:border-emerald-800',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/60',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    titleColor: 'text-emerald-900 dark:text-emerald-200'
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    border: 'border-amber-200 dark:border-amber-800',
    iconBg: 'bg-amber-100 dark:bg-amber-900/60',
    iconColor: 'text-amber-600 dark:text-amber-400',
    titleColor: 'text-amber-900 dark:text-amber-200'
  },
  recommendation: {
    icon: Lightbulb,
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    border: 'border-purple-200 dark:border-purple-800',
    iconBg: 'bg-purple-100 dark:bg-purple-900/60',
    iconColor: 'text-purple-600 dark:text-purple-400',
    titleColor: 'text-purple-900 dark:text-purple-200'
  },
  celebration: {
    icon: PartyPopper,
    bg: 'bg-gradient-to-r from-pink-50 to-orange-50 dark:from-pink-950/40 dark:to-orange-950/40',
    border: 'border-pink-200 dark:border-pink-800',
    iconBg: 'bg-gradient-to-r from-pink-100 to-orange-100 dark:from-pink-900/60 dark:to-orange-900/60',
    iconColor: 'text-pink-600 dark:text-pink-400',
    titleColor: 'text-pink-900 dark:text-pink-200'
  }
}

const priorityBadge = {
  high: 'bg-red-100 dark:bg-red-900/60 text-red-700 dark:text-red-300',
  medium: 'bg-yellow-100 dark:bg-yellow-900/60 text-yellow-700 dark:text-yellow-300',
  low: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
}

export default function InsightCard({ insight, compact = false }) {
  const config = typeConfig[insight.type] || typeConfig.recommendation
  const Icon = config.icon

  if (compact) {
    return (
      <div className={`flex items-start gap-3 p-3 rounded-xl ${config.bg} ${config.border} border`}>
        <div className={`p-1.5 rounded-lg ${config.iconBg}`}>
          <Icon className={`w-4 h-4 ${config.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-medium text-sm ${config.titleColor} truncate`}>
            {insight.title}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">
            {insight.message}
          </p>
        </div>
        {insight.actionUrl && (
          <Link
            href={insight.actionUrl}
            className={`p-1.5 rounded-lg hover:bg-white/50 transition-colors ${config.iconColor}`}
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl ${config.bg} ${config.border} border-2 p-4 transition-all hover:shadow-md`}>
      {/* Priority Badge */}
      {insight.priority === 'high' && (
        <div className="absolute top-3 right-3">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityBadge[insight.priority]}`}>
            Important
          </span>
        </div>
      )}

      {/* AI Badge */}
      {insight.source === 'ai' && (
        <div className="absolute top-3 right-3">
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/60 dark:to-purple-900/60 text-purple-700 dark:text-purple-300 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            AI
          </span>
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`p-3 rounded-xl ${config.iconBg} flex-shrink-0`}>
          <Icon className={`w-6 h-6 ${config.iconColor}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold ${config.titleColor} pr-16`}>
            {insight.title}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
            {insight.message}
          </p>

          {/* Action Button */}
          {insight.actionLabel && insight.actionUrl && (
            <Link
              href={insight.actionUrl}
              className={`inline-flex items-center gap-1 mt-3 text-sm font-medium ${config.iconColor} hover:underline`}
            >
              {insight.actionLabel}
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
