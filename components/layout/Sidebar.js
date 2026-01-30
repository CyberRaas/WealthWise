'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useTranslation } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import {
  Home,
  Wallet,
  Target,
  TrendingUp,
  PieChart,
  ChevronLeft,
  ChevronRight,
  User,
  CreditCard,
  BarChart3,
  X,
  LogOut,
  Calculator,
  Shield,
  Users,
  CircleDollarSign,
  BookOpen,
  Sparkles,
  LayoutDashboard
} from 'lucide-react'
import Logo from '@/components/ui/Logo'

const navigationGroups = [
  {
    title: 'Overview',
    items: [
      {
        name: 'sidebar.dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        description: 'sidebar.dashboard_desc'
      },
      {
        name: 'sidebar.analytics',
        href: '/dashboard/analytics',
        icon: BarChart3,
        description: 'sidebar.analytics_desc'
      },
      {
        name: 'AI Insights',
        href: '/dashboard/insights',
        icon: Sparkles,
        description: 'AI-powered financial analysis'
      }
    ]
  },
  {
    title: 'Finance',
    items: [
      {
        name: 'Omni-Channel Model',
        href: '/dashboard/financial-model',
        icon: TrendingUp, // Using imported TrendingUp
        description: 'Advanced financial IQ'
      },
      {
        name: 'Investment',
        href: '/dashboard/investment',
        icon: CircleDollarSign,
        description: 'Plan & Visualize Wealth'
      },
      {
        name: 'sidebar.expenses',
        href: '/dashboard/expenses',
        icon: Wallet,
        description: 'sidebar.expenses_desc'
      },
      {
        name: 'sidebar.budget',
        href: '/dashboard/budget',
        icon: PieChart,
        description: 'sidebar.budget_desc'
      },
      {
        name: 'sidebar.debt',
        href: '/dashboard/debt',
        icon: CreditCard,
        description: 'sidebar.debt_desc'
      }
    ]
  },
  {
    title: 'Growth',
    items: [
      {
        name: 'sidebar.goals',
        href: '/dashboard/goals',
        icon: Target,
        description: 'sidebar.goals_desc'
      },
      {
        name: 'Learning Hub',
        href: '/dashboard/learning',
        icon: BookOpen,
        description: 'Master financial concepts'
      }
    ]
  },
  {
    title: 'Account',
    items: [
      {
        name: 'sidebar.profile',
        href: '/dashboard/profile',
        icon: User,
        description: 'sidebar.profile_desc'
      }
    ]
  }
]

export default function Sidebar({ isOpen, onClose }) {
  const { t } = useTranslation()
  const { data: session } = useSession()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  // Check if user is admin
  const isAdmin = ['moderator', 'admin', 'super_admin'].includes(session?.user?.role)

  return (
    <>
      {/* Mobile overlay - Full screen like Codolio */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Background overlay */}
          <div
            className="absolute inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sidebar panel - Full height, slides from left */}
          <div className="relative w-80 max-w-[85vw] h-full bg-white dark:bg-slate-900 shadow-2xl animate-in slide-in-from-left duration-300">
            {/* Header with close button */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 h-16">
              <Logo size="medium" textClassName="text-lg" />

              {/* Close button - Top right like Codolio */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg w-8 h-8 p-0"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Navigation for mobile */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon

                return (
                  <Link key={item.name} href={item.href} onClick={onClose}>
                    <div
                      className={`group relative flex items-center px-3 py-3 rounded-lg transition-all duration-150 cursor-pointer ${isActive
                        ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                    >
                      {/* Active indicator bar */}
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 bg-emerald-500 rounded-r-full" />
                      )}

                      <Icon className={`h-5 w-5 ${isActive
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                        } transition-colors flex-shrink-0`} />

                      <div className="ml-3 flex-1 min-w-0">
                        <p className={`text-sm font-medium ${isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white'
                          }`}>
                          {t(item.name)}
                        </p>
                        <p className={`text-xs ${isActive ? 'text-emerald-600/70 dark:text-emerald-500/70' : 'text-slate-400 dark:text-slate-500'
                          }`}>
                          {t(item.description)}
                        </p>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </nav>

            {/* Bottom Signout Section for mobile */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
              <Button
                onClick={() => {
                  signOut({ callbackUrl: window.location.origin })
                  onClose()
                }}
                variant="outline"
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-300 dark:hover:border-red-800 rounded-xl transition-all duration-200"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar - Sticky and Enhanced */}
      <div className={`
        hidden lg:flex
        bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-72'}
        h-screen
        flex-col
      `}>

        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 h-16 flex items-center">
          <div className="flex items-center justify-between w-full">
            {!isCollapsed && (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-700">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col justify-center">
                  <h1 className="text-xl font-bold leading-tight">
                    <span className="text-slate-800 dark:text-white">Wealth</span>
                    <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">Wise</span>
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">Smart Finance Platform</p>
                </div>
              </div>
            )}

            {/* Collapsed state - Show just the logo */}
            {isCollapsed && (
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-700 mx-auto">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            )}

            {/* Collapse Toggle - Desktop Only */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg w-8 h-8 p-0 flex-shrink-0"
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">
          {navigationGroups.map((group, index) => (
            <div key={index}>
              {!isCollapsed && group.title && (
                <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 px-2">
                  {group.title}
                </h3>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href
                  const Icon = item.icon

                  return (
                    <Link key={item.name} href={item.href}>
                      <div
                        className={`group relative flex items-center px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer ${isActive
                          ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white font-medium'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                          }`}
                      >
                        {/* Active indicator dot */}
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-blue-600 dark:bg-blue-500 rounded-r-full" />
                        )}

                        <Icon className={`h-[18px] w-[18px] ${isActive
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                          } transition-colors flex-shrink-0`} />

                        {!isCollapsed && (
                          <div className="ml-3 flex-1 min-w-0">
                            <span className="text-sm truncate">
                              {t(item.name)}
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Signout Section */}
        {!isCollapsed && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <Button
              onClick={() => signOut({ callbackUrl: window.location.origin })}
              variant="outline"
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-300 dark:hover:border-red-800 rounded-xl transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </Button>
          </div>
        )}

        {/* Collapsed Signout Indicator */}
        {isCollapsed && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <Button
              onClick={() => signOut({ callbackUrl: window.location.origin })}
              variant="outline"
              className="w-12 h-12 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-300 dark:hover:border-red-800 rounded-xl mx-auto flex items-center justify-center transition-all duration-200"
            >
              <LogOut className="w-6 h-6" />
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
