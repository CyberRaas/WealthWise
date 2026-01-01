'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Briefcase,
  Building2,
  Laptop,
  Home,
  TrendingUp,
  Wallet,
  MoreHorizontal,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'

// Income type icons and colors
const INCOME_TYPE_CONFIG = {
  salary: {
    icon: Briefcase,
    label: 'Salary',
    color: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700',
    iconColor: 'text-blue-600 dark:text-blue-400'
  },
  business: {
    icon: Building2,
    label: 'Business',
    color: 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700',
    iconColor: 'text-purple-600 dark:text-purple-400'
  },
  freelance: {
    icon: Laptop,
    label: 'Freelance',
    color: 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700',
    iconColor: 'text-orange-600 dark:text-orange-400'
  },
  rental: {
    icon: Home,
    label: 'Rental',
    color: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700',
    iconColor: 'text-green-600 dark:text-green-400'
  },
  investment: {
    icon: TrendingUp,
    label: 'Investment',
    color: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700',
    iconColor: 'text-emerald-600 dark:text-emerald-400'
  },
  pension: {
    icon: Wallet,
    label: 'Pension',
    color: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700',
    iconColor: 'text-indigo-600 dark:text-indigo-400'
  },
  side_hustle: {
    icon: Laptop,
    label: 'Side Hustle',
    color: 'bg-pink-100 dark:bg-pink-900/50 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-700',
    iconColor: 'text-pink-600 dark:text-pink-400'
  },
  other: {
    icon: Wallet,
    label: 'Other',
    color: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600',
    iconColor: 'text-slate-600 dark:text-slate-400'
  }
}

// Frequency labels
const FREQUENCY_LABELS = {
  weekly: 'Weekly',
  'bi-weekly': 'Bi-weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  annually: 'Annual',
  irregular: 'Irregular'
}

// Normalize amount to monthly
function normalizeToMonthly(amount, frequency) {
  const multipliers = {
    weekly: 4.33,
    'bi-weekly': 2.17,
    monthly: 1,
    quarterly: 0.33,
    annually: 0.083,
    irregular: 1
  }
  return Math.round(amount * (multipliers[frequency] || 1))
}

export default function IncomeSourceCard({
  source,
  onEdit,
  onDelete,
  isEditable = true,
  showMonthlyEquivalent = true,
  compact = false
}) {
  const [showActions, setShowActions] = useState(false)

  const typeConfig = INCOME_TYPE_CONFIG[source.type] || INCOME_TYPE_CONFIG.other
  const IconComponent = typeConfig.icon
  const monthlyAmount = normalizeToMonthly(source.amount, source.frequency)

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${typeConfig.color}`}>
            <IconComponent className={`h-4 w-4 ${typeConfig.iconColor}`} />
          </div>
          <div>
            <p className="font-medium text-sm text-slate-900 dark:text-white">{source.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{typeConfig.label}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold text-slate-900 dark:text-white">{formatCurrency(source.amount)}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{FREQUENCY_LABELS[source.frequency]}</p>
        </div>
      </div>
    )
  }

  return (
    <Card
      className={`relative overflow-hidden transition-all hover:shadow-md dark:bg-slate-800 dark:border-slate-700 ${
        !source.isStable ? 'border-dashed border-2 dark:border-slate-600' : ''
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left: Icon and Info */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`p-3 rounded-xl ${typeConfig.color} shrink-0`}>
              <IconComponent className={`h-5 w-5 ${typeConfig.iconColor}`} />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-slate-900 dark:text-white truncate">{source.name}</h3>

              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge variant="outline" className={`text-xs ${typeConfig.color}`}>
                  {typeConfig.label}
                </Badge>

                <Badge variant="outline" className="text-xs dark:border-slate-600 dark:text-slate-300">
                  {FREQUENCY_LABELS[source.frequency]}
                </Badge>

                {source.isStable ? (
                  <Badge variant="outline" className="text-xs bg-green-50 dark:bg-green-900/50 text-green-700 dark:text-green-400 border-green-200 dark:border-green-700">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Stable
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs bg-amber-50 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-700">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Variable
                  </Badge>
                )}
              </div>

              {source.description && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">{source.description}</p>
              )}
            </div>
          </div>

          {/* Right: Amount */}
          <div className="text-right shrink-0">
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(source.amount)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {FREQUENCY_LABELS[source.frequency]}
            </p>

            {showMonthlyEquivalent && source.frequency !== 'monthly' && (
              <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                ≈ {formatCurrency(monthlyAmount)}/mo
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        {isEditable && (
          <div
            className={`absolute top-2 right-2 flex items-center gap-1 transition-opacity ${
              showActions ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
              onClick={() => onEdit?.(source)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
              onClick={() => onDelete?.(source)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>

      {/* Stability indicator bar */}
      {!source.isStable && (
        <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-400" />
      )}
    </Card>
  )
}

// Export config for reuse
export { INCOME_TYPE_CONFIG, FREQUENCY_LABELS, normalizeToMonthly }
