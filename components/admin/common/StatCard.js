'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

/**
 * Reusable Statistics Card Component
 *
 * @param {object} props
 * @param {string} props.title - Card title
 * @param {number} props.value - Main value to display
 * @param {React.ComponentType} props.icon - Lucide icon component
 * @param {string} props.color - Color theme (violet, emerald, blue, amber, red)
 * @param {number} props.change - Percentage change (optional)
 * @param {string} props.changeLabel - Label for change (optional)
 * @param {string} props.subtitle - Additional subtitle (optional)
 * @param {number} props.index - Animation delay index (optional)
 */
export default function StatCard({
  title,
  value,
  icon: Icon,
  color = 'violet',
  change,
  changeLabel,
  subtitle,
  index = 0
}) {
  const colorClasses = {
    violet: {
      bg: 'bg-violet-100 dark:bg-violet-900/30',
      icon: 'text-violet-600 dark:text-violet-400'
    },
    emerald: {
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
      icon: 'text-emerald-600 dark:text-emerald-400'
    },
    blue: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      icon: 'text-blue-600 dark:text-blue-400'
    },
    amber: {
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      icon: 'text-amber-600 dark:text-amber-400'
    },
    red: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      icon: 'text-red-600 dark:text-red-400'
    }
  }

  const colors = colorClasses[color] || colorClasses.violet

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center`}>
          {Icon && <Icon className={`w-6 h-6 ${colors.icon}`} />}
        </div>

        {change !== undefined && (
          <div className={`flex items-center space-x-1 text-sm ${change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {change >= 0 ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
            <span>{Math.abs(change).toFixed(1)}%</span>
          </div>
        )}
      </div>

      <p className="text-3xl font-bold text-slate-800 dark:text-white mb-1">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>

      <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>

      {subtitle && (
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtitle}</p>
      )}

      {changeLabel && change !== undefined && (
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{changeLabel}</p>
      )}
    </motion.div>
  )
}
