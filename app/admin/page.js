'use client'

import { useState, useEffect } from 'react'
import { useAdmin } from '@/contexts/AdminContext'
import AdminLayout from '@/components/admin/layout/AdminLayout'
import { motion } from 'framer-motion'
import {
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  Activity,
  Target,
  Wallet,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Shield
} from 'lucide-react'

export default function AdminDashboard() {
  const { adminInfo, isSuperAdmin } = useAdmin()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/analytics/overview?days=30')
      const data = await response.json()

      if (data.success) {
        setStats(data.data)
      } else {
        setError(data.error || 'Failed to fetch analytics')
      }
    } catch (err) {
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="space-y-6">
          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 animate-pulse">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-3"></div>
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout title="Dashboard">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center">
          <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </AdminLayout>
    )
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.summary?.totalUsers || 0,
      icon: Users,
      color: 'violet',
      change: stats?.summary?.growthRate || 0,
      changeLabel: 'vs last period'
    },
    {
      title: 'Active Users',
      value: stats?.summary?.activeUsers || 0,
      icon: UserCheck,
      color: 'emerald',
      subtitle: `${stats?.activity?.activeUsersInPeriod || 0} active this month`
    },
    {
      title: 'New Signups',
      value: stats?.summary?.newUsersInPeriod || 0,
      icon: TrendingUp,
      color: 'blue',
      change: stats?.summary?.growthRate || 0,
      changeLabel: 'growth rate'
    },
    {
      title: 'Suspended',
      value: stats?.summary?.suspendedUsers || 0,
      icon: UserX,
      color: 'red',
      subtitle: 'accounts'
    }
  ]

  const platformStats = [
    { label: 'Expenses Tracked', value: stats?.platform?.totalExpenses || 0, icon: Wallet },
    { label: 'Budgets Created', value: stats?.platform?.totalBudgets || 0, icon: BarChart3 },
    { label: 'Goals Set', value: stats?.platform?.totalGoals || 0, icon: Target },
    { label: 'Users Onboarded', value: stats?.summary?.onboardedUsers || 0, icon: UserCheck }
  ]

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">
                Welcome back, {adminInfo?.name?.split(' ')[0] || 'Admin'}!
              </h2>
              <p className="text-violet-100">
                Here is what is happening on your platform today.
              </p>
            </div>
            <div className="hidden sm:flex items-center space-x-2 bg-white/10 rounded-xl px-4 py-2">
              <Shield className="w-5 h-5" />
              <span className="font-medium capitalize">{adminInfo?.role?.replace('_', ' ') || 'Admin'}</span>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <StatCard key={stat.title} stat={stat} index={index} />
          ))}
        </div>

        {/* Distribution & Platform Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700"
          >
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">User Distribution</h3>
            <div className="space-y-4">
              <DistributionBar
                label="By Role"
                items={[
                  { label: 'Users', value: stats?.distribution?.byRole?.user || 0, color: 'bg-slate-400' },
                  { label: 'Moderators', value: stats?.distribution?.byRole?.moderator || 0, color: 'bg-blue-500' },
                  { label: 'Admins', value: stats?.distribution?.byRole?.admin || 0, color: 'bg-violet-500' },
                  { label: 'Super Admins', value: stats?.distribution?.byRole?.super_admin || 0, color: 'bg-red-500' }
                ]}
                total={stats?.summary?.totalUsers || 1}
              />
              <DistributionBar
                label="By Plan"
                items={[
                  { label: 'Free', value: stats?.distribution?.byPlan?.free || 0, color: 'bg-slate-400' },
                  { label: 'Premium', value: stats?.distribution?.byPlan?.premium || 0, color: 'bg-amber-500' },
                  { label: 'Family', value: stats?.distribution?.byPlan?.family || 0, color: 'bg-emerald-500' }
                ]}
                total={stats?.summary?.totalUsers || 1}
              />
              <DistributionBar
                label="By Language"
                items={[
                  { label: 'English', value: stats?.distribution?.byLanguage?.en || 0, color: 'bg-blue-500' },
                  { label: 'Hindi', value: stats?.distribution?.byLanguage?.hi || 0, color: 'bg-orange-500' },
                  { label: 'Hinglish', value: stats?.distribution?.byLanguage?.hinglish || 0, color: 'bg-purple-500' }
                ]}
                total={stats?.summary?.totalUsers || 1}
              />
            </div>
          </motion.div>

          {/* Platform Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700"
          >
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Platform Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              {platformStats.map((item) => (
                <div
                  key={item.label}
                  className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-800 dark:text-white">
                        {item.value.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Recent Signups Chart Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Signup Trend (Last 30 Days)</h3>
            <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
              <Clock className="w-4 h-4" />
              <span>Updated just now</span>
            </div>
          </div>

          {/* Simple Bar Chart */}
          <div className="h-48 flex items-end justify-between gap-1">
            {(stats?.trends?.signups || []).slice(-14).map((day, index) => {
              const maxCount = Math.max(...(stats?.trends?.signups || []).map(d => d.count), 1)
              const height = (day.count / maxCount) * 100

              return (
                <div
                  key={day.date}
                  className="flex-1 flex flex-col items-center group"
                >
                  <div className="relative w-full">
                    <div
                      className="w-full bg-violet-500 dark:bg-violet-600 rounded-t-sm transition-all duration-300 hover:bg-violet-600 dark:hover:bg-violet-500"
                      style={{ height: `${Math.max(height, 4)}%`, minHeight: '4px' }}
                    />
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-800 dark:bg-slate-700 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                      {day.count} signups
                      <br />
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* X-axis labels */}
          <div className="flex justify-between mt-2 text-xs text-slate-400">
            {(stats?.trends?.signups || []).slice(-14).filter((_, i) => i % 2 === 0).map((day) => (
              <span key={day.date}>
                {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  )
}

// Stat Card Component
function StatCard({ stat, index }) {
  const colorClasses = {
    violet: {
      bg: 'bg-violet-100 dark:bg-violet-900/30',
      icon: 'text-violet-600 dark:text-violet-400',
      badge: 'bg-violet-500'
    },
    emerald: {
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
      icon: 'text-emerald-600 dark:text-emerald-400',
      badge: 'bg-emerald-500'
    },
    blue: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      icon: 'text-blue-600 dark:text-blue-400',
      badge: 'bg-blue-500'
    },
    red: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      icon: 'text-red-600 dark:text-red-400',
      badge: 'bg-red-500'
    }
  }

  const colors = colorClasses[stat.color] || colorClasses.violet

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center`}>
          <stat.icon className={`w-6 h-6 ${colors.icon}`} />
        </div>
        {stat.change !== undefined && (
          <div className={`flex items-center space-x-1 text-sm ${stat.change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {stat.change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            <span>{Math.abs(stat.change).toFixed(1)}%</span>
          </div>
        )}
      </div>

      <p className="text-3xl font-bold text-slate-800 dark:text-white mb-1">
        {stat.value.toLocaleString()}
      </p>

      <p className="text-sm text-slate-500 dark:text-slate-400">{stat.title}</p>

      {stat.subtitle && (
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{stat.subtitle}</p>
      )}

      {stat.changeLabel && stat.change !== undefined && (
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{stat.changeLabel}</p>
      )}
    </motion.div>
  )
}

// Distribution Bar Component
function DistributionBar({ label, items, total }) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">{label}</p>
      <div className="flex h-3 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700">
        {items.map((item, index) => {
          const percentage = (item.value / total) * 100
          if (percentage === 0) return null

          return (
            <div
              key={index}
              className={`${item.color} transition-all duration-300`}
              style={{ width: `${percentage}%` }}
              title={`${item.label}: ${item.value} (${percentage.toFixed(1)}%)`}
            />
          )
        })}
      </div>
      <div className="flex flex-wrap gap-3 mt-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center space-x-1.5 text-xs">
            <div className={`w-2 h-2 rounded-full ${item.color}`} />
            <span className="text-slate-500 dark:text-slate-400">
              {item.label}: {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
