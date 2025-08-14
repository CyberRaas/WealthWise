'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  Home,
  Wallet,
  Target,
  TrendingUp,
  PieChart,
  Settings,
  ChevronLeft,
  ChevronRight,
  User,
  CreditCard,
  BarChart3
} from 'lucide-react'

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    description: 'Overview & Quick Actions'
  },
  {
    name: 'Expenses',
    href: '/dashboard/expenses',
    icon: Wallet,
    description: 'Track Your Spending'
  },
  {
    name: 'Budget',
    href: '/dashboard/budget',
    icon: PieChart,
    description: 'Budget Management'
  },
  {
    name: 'Goals',
    href: '/dashboard/goals',
    icon: Target,
    description: 'Financial Goals'
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
    description: 'Financial Insights'
  },
  {
    name: 'Profile',
    href: '/dashboard/profile',
    icon: User,
    description: 'Account Settings'
  }
]

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="bg-white/90 text-slate-700 hover:bg-white shadow-lg"
        >
          <Home className="h-4 w-4" />
        </Button>
      </div>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white transition-all duration-300 
        ${isCollapsed ? 'w-16' : 'w-64'} 
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        fixed md:relative z-50 min-h-screen border-r border-slate-700/50 backdrop-blur-xl `}>
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
                  WealthWise
                </h1>
                <p className="text-xs text-slate-400">Smart Finance</p>
              </div>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-slate-400 hover:text-white hover:bg-slate-700/50 hidden md:flex"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>

          {/* Mobile close button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileOpen(false)}
            className="text-slate-400 hover:text-white hover:bg-slate-700/50 md:hidden"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-2 space-y-1">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link key={item.name} href={item.href}>
              <div className={`group flex items-center px-3 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}>
                <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'} transition-colors`} />
                
                {!isCollapsed && (
                  <div className="ml-3 flex-1">
                    <p className={`font-medium ${isActive ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                      {item.name}
                    </p>
                    <p className={`text-xs ${isActive ? 'text-emerald-100' : 'text-slate-400'}`}>
                      {item.description}
                    </p>
                  </div>
                )}
                
                {isActive && (
                  <div className="w-2 h-2 bg-white rounded-full opacity-80" />
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Bottom Section */}
      {!isCollapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Premium Plan</p>
                <p className="text-xs text-slate-400">All features unlocked</p>
              </div>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-1">
              <div className="bg-gradient-to-r from-emerald-400 to-teal-400 h-1 rounded-full w-full" />
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  )
}
