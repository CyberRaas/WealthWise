'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/layout/AdminLayout'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  Users,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar,
  RefreshCw,
  Download,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [timeRange, setTimeRange] = useState('30')

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/admin/analytics/overview?days=${timeRange}`)
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

    fetchAnalytics()
  }, [timeRange])

  if (loading) {
    return (
      <AdminLayout title="Analytics">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 text-violet-500 animate-spin" />
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout title="Analytics">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center">
          <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
          <Button onClick={fetchAnalytics} className="mt-4">Retry</Button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Analytics">
      <div className="space-y-6">
        {/* Time Range Selector */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Platform Analytics</h2>
          <div className="flex items-center gap-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white text-sm"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
            <Button variant="outline" onClick={fetchAnalytics} className="gap-2">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Users"
            value={stats?.summary?.totalUsers || 0}
            icon={Users}
            color="violet"
          />
          <MetricCard
            title="New Users"
            value={stats?.summary?.newUsersInPeriod || 0}
            icon={TrendingUp}
            color="emerald"
            change={stats?.summary?.growthRate}
          />
          <MetricCard
            title="Active Users"
            value={stats?.activity?.activeUsersInPeriod || 0}
            icon={BarChart3}
            color="blue"
          />
          <MetricCard
            title="Onboarded"
            value={stats?.summary?.onboardedUsers || 0}
            icon={Users}
            color="amber"
            subtitle={`${Math.round((stats?.summary?.onboardedUsers / stats?.summary?.totalUsers) * 100) || 0}% completion`}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Signup Trend Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700"
          >
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Signup Trend</h3>
            <div className="h-64 flex items-end justify-between gap-1">
              {(stats?.trends?.signups || []).slice(-14).map((day, index) => {
                const maxCount = Math.max(...(stats?.trends?.signups || []).map(d => d.count), 1)
                const height = (day.count / maxCount) * 100

                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center group">
                    <div className="relative w-full">
                      <div
                        className="w-full bg-gradient-to-t from-violet-500 to-violet-400 rounded-t-sm transition-all duration-300 hover:from-violet-600 hover:to-violet-500"
                        style={{ height: `${Math.max(height, 4)}%`, minHeight: '4px' }}
                      />
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
          </motion.div>

          {/* Distribution Charts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700"
          >
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">User Distribution</h3>
            <div className="space-y-6">
              {/* By Status */}
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">By Status</p>
                <div className="flex h-4 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700">
                  {Object.entries(stats?.distribution?.byStatus || {}).map(([status, count], index) => {
                    const total = stats?.summary?.totalUsers || 1
                    const percentage = (count / total) * 100
                    const colors = {
                      active: 'bg-emerald-500',
                      suspended: 'bg-red-500',
                      deleted: 'bg-slate-400',
                      inactive: 'bg-yellow-500'
                    }
                    return (
                      <div
                        key={status}
                        className={colors[status] || 'bg-slate-400'}
                        style={{ width: `${percentage}%` }}
                        title={`${status}: ${count} (${percentage.toFixed(1)}%)`}
                      />
                    )
                  })}
                </div>
                <div className="flex flex-wrap gap-4 mt-2">
                  {Object.entries(stats?.distribution?.byStatus || {}).map(([status, count]) => (
                    <div key={status} className="flex items-center space-x-1.5 text-xs">
                      <div className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-emerald-500' : status === 'suspended' ? 'bg-red-500' : 'bg-slate-400'}`} />
                      <span className="text-slate-600 dark:text-slate-400 capitalize">{status}: {count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* By Plan */}
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">By Subscription Plan</p>
                <div className="flex h-4 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700">
                  {Object.entries(stats?.distribution?.byPlan || {}).map(([plan, count]) => {
                    const total = stats?.summary?.totalUsers || 1
                    const percentage = (count / total) * 100
                    const colors = {
                      free: 'bg-slate-400',
                      premium: 'bg-amber-500',
                      family: 'bg-emerald-500'
                    }
                    return (
                      <div
                        key={plan}
                        className={colors[plan] || 'bg-slate-400'}
                        style={{ width: `${percentage}%` }}
                        title={`${plan}: ${count} (${percentage.toFixed(1)}%)`}
                      />
                    )
                  })}
                </div>
                <div className="flex flex-wrap gap-4 mt-2">
                  {Object.entries(stats?.distribution?.byPlan || {}).map(([plan, count]) => (
                    <div key={plan} className="flex items-center space-x-1.5 text-xs">
                      <div className={`w-2 h-2 rounded-full ${plan === 'premium' ? 'bg-amber-500' : plan === 'family' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      <span className="text-slate-600 dark:text-slate-400 capitalize">{plan}: {count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Platform Usage Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700"
        >
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Platform Usage</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <UsageStat label="Total Expenses" value={stats?.platform?.totalExpenses || 0} />
            <UsageStat label="Total Budgets" value={stats?.platform?.totalBudgets || 0} />
            <UsageStat label="Total Goals" value={stats?.platform?.totalGoals || 0} />
            <UsageStat label="Total Incomes" value={stats?.platform?.totalIncomes || 0} />
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  )
}

function MetricCard({ title, value, icon: Icon, color, change, subtitle }) {
  const colorClasses = {
    violet: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400',
    emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-12 h-12 ${colorClasses[color]} rounded-xl flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center space-x-1 text-sm ${change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            <span>{Math.abs(change).toFixed(1)}%</span>
          </div>
        )}
      </div>
      <p className="text-3xl font-bold text-slate-800 dark:text-white mb-1">
        {value.toLocaleString()}
      </p>
      <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
      {subtitle && (
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtitle}</p>
      )}
    </motion.div>
  )
}

function UsageStat({ label, value }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 text-center">
      <p className="text-2xl font-bold text-slate-800 dark:text-white">{value.toLocaleString()}</p>
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  )
}
