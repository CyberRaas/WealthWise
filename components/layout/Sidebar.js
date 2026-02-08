'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useTranslation } from '@/lib/i18n'
import {
  Wallet,
  Target,
  TrendingUp,
  PieChart,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  BarChart3,
  X,
  LogOut,
  CircleDollarSign,
  BookOpen,
  Sparkles,
  LayoutDashboard,
  Gamepad2
} from 'lucide-react'

const navigationGroups = [
  {
    title: 'Overview',
    items: [
      { name: 'sidebar.dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'sidebar.analytics', href: '/dashboard/analytics', icon: BarChart3 },
      { name: 'AI Insights', href: '/dashboard/insights', icon: Sparkles },
    ]
  },
  {
    title: 'Finance',
    items: [
      { name: 'Omni-Channel Model', href: '/dashboard/financial-model', icon: TrendingUp },
      { name: 'Investment', href: '/dashboard/investment', icon: CircleDollarSign },
      { name: 'sidebar.expenses', href: '/dashboard/expenses', icon: Wallet },
      { name: 'sidebar.budget', href: '/dashboard/budget', icon: PieChart },
      { name: 'sidebar.debt', href: '/dashboard/debt', icon: CreditCard },
    ]
  },
  {
    title: 'Growth',
    items: [
      { name: 'sidebar.goals', href: '/dashboard/goals', icon: Target },
      { name: 'Financial Games', href: '/dashboard/games', icon: Gamepad2 },
      { name: 'Learning Hub', href: '/dashboard/learning', icon: BookOpen },
    ]
  }
]

export default function Sidebar({ isOpen, onClose }) {
  const { t } = useTranslation()
  const { data: session } = useSession()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
          <div className="relative w-72 max-w-[80vw] h-full bg-white dark:bg-slate-950 shadow-2xl animate-in slide-in-from-left duration-200 flex flex-col">
            <div className="flex items-center justify-between h-16 px-5 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-slate-900 dark:text-white tracking-tight">
                  Wealth<span className="text-emerald-500">Wise</span>
                </span>
              </div>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/5 dark:hover:text-white transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-4 px-3">
              {navigationGroups.map((group, idx) => (
                <div key={idx} className={idx > 0 ? 'mt-6' : ''}>
                  <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-2">{group.title}</p>
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const isActive = pathname === item.href
                      const Icon = item.icon
                      return (
                        <Link key={item.href} href={item.href} onClick={onClose}>
                          <div className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'}`}>
                            {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-emerald-500 rounded-r-full" />}
                            <Icon className={`h-[18px] w-[18px] flex-shrink-0 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`} />
                            <span>{t(item.name)}</span>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
            </nav>
            <div className="p-4 border-t border-slate-100 dark:border-white/5">
              <button onClick={() => { signOut({ callbackUrl: window.location.origin }); onClose() }} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className={`hidden lg:flex flex-col h-screen bg-white dark:bg-slate-950 border-r border-slate-100 dark:border-white/5 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-[68px]' : 'w-64'}`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100 dark:border-white/5">
          {!isCollapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-sm">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <span className="text-[15px] font-bold tracking-tight">
                <span className="text-slate-900 dark:text-white">Wealth</span>
                <span className="text-emerald-500">Wise</span>
              </span>
            </div>
          )}
          {isCollapsed && (
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center mx-auto shadow-sm">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
          )}
          <button onClick={() => setIsCollapsed(!isCollapsed)} className={`w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/5 dark:hover:text-white transition-colors ${isCollapsed ? 'mx-auto mt-0' : ''}`}>
            {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {navigationGroups.map((group, idx) => (
            <div key={idx} className={idx > 0 ? 'mt-6' : ''}>
              {!isCollapsed && <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-2">{group.title}</p>}
              {isCollapsed && idx > 0 && <div className="mx-3 mb-3 border-t border-slate-100 dark:border-white/5" />}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href
                  const Icon = item.icon
                  return (
                    <Link key={item.href} href={item.href}>
                      <div className={`relative flex items-center gap-3 rounded-lg transition-all duration-150 cursor-pointer ${isCollapsed ? 'px-0 py-2.5 justify-center' : 'px-3 py-2'} ${isActive ? 'bg-slate-900 dark:bg-white/10 text-white dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'}`} title={isCollapsed ? t(item.name) : undefined}>
                        <Icon className={`h-[18px] w-[18px] flex-shrink-0 ${isActive ? 'text-white dark:text-white' : ''}`} />
                        {!isCollapsed && <span className="text-sm">{t(item.name)}</span>}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-slate-100 dark:border-white/5 p-3">
          {!isCollapsed ? (
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-sm font-semibold text-slate-600 dark:text-slate-300">
                {session?.user?.name?.[0] || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{session?.user?.name?.split(' ')[0] || 'User'}</p>
              </div>
              <button onClick={() => signOut({ callbackUrl: window.location.origin })} className="w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors" title="Sign Out">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button onClick={() => signOut({ callbackUrl: window.location.origin })} className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 mx-auto transition-colors" title="Sign Out">
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </>
  )
}
