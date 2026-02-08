'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useTranslation } from '@/lib/i18n'
import { useProfile } from '@/contexts/ProfileContext'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Sidebar from '@/components/layout/Sidebar'
import MobileBottomNav from '@/components/mobile/MobileBottomNav'
import SwipeGestureHandler from '@/components/mobile/SwipeGestureHandler'
import PullToRefresh from '@/components/mobile/PullToRefresh'
import LanguageSelector from '@/components/ui/LanguageSelector'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LogOut,
  User,
  Settings,
  HelpCircle,
  ChevronDown,
  Bell,
  Menu
} from 'lucide-react'
import ThemeToggle from '@/components/ui/ThemeToggle'

export default function DashboardLayout({ children, title = "Dashboard", onRefresh }) {
  const { data: session } = useSession()
  const { profileImage } = useProfile()
  const { t } = useTranslation()
  const pathname = usePathname()
  const router = useRouter()
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleRefresh = async () => {
    if (onRefresh) {
      await onRefresh()
    } else {
      return new Promise((resolve) => {
        setTimeout(() => { window.location.reload(); resolve() }, 1000)
      })
    }
  }

  const showMobileNav = [
    '/dashboard', '/dashboard/expenses', '/dashboard/goals',
    '/dashboard/analytics', '/dashboard/budget', '/dashboard/profile',
    '/dashboard/notifications'
  ].some(path => pathname === path)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block sticky top-0 h-screen z-30">
          <Sidebar />
        </div>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-100 dark:border-white/5">
            <div className="h-16 px-4 lg:px-6">
              <div className="flex items-center justify-between h-full">
                {/* Left: Hamburger (mobile) + Title */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                  >
                    <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  </button>
                  <h1 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">{title}</h1>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1.5">
                  <ThemeToggle variant="icon" />
                  <LanguageSelector variant="dashboard" />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push('/dashboard/notifications')}
                    className="relative h-9 w-9 rounded-full hover:bg-slate-100 dark:hover:bg-white/5"
                  >
                    <Bell className="h-[18px] w-[18px] text-slate-500 dark:text-slate-400" />
                  </Button>

                  {/* Profile */}
                  <div className="relative hidden sm:block" ref={dropdownRef}>
                    <button
                      className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors"
                      onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    >
                      <Avatar className="h-7 w-7 border border-slate-200 dark:border-white/10">
                        <AvatarImage src={profileImage} />
                        <AvatarFallback className="text-xs bg-emerald-500 text-white font-semibold">
                          {session?.user?.name?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden md:block">
                        {session?.user?.name?.split(' ')[0] || 'User'}
                      </span>
                      <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${showProfileDropdown ? 'rotate-180' : ''} hidden md:block`} />
                    </button>

                    <AnimatePresence>
                      {showProfileDropdown && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -4 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -4 }}
                          transition={{ duration: 0.12 }}
                          className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-100 dark:border-white/5 py-1.5 z-50"
                        >
                          <div className="px-4 py-3 border-b border-slate-100 dark:border-white/5">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{session?.user?.name || 'User'}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{session?.user?.email || ''}</p>
                          </div>
                          <div className="py-1">
                            <DropdownItem icon={User} label="Profile" onClick={() => { setShowProfileDropdown(false); router.push('/dashboard/profile') }} />
                            <DropdownItem icon={Settings} label="Settings" onClick={() => { setShowProfileDropdown(false); router.push('/dashboard/settings') }} />
                            <DropdownItem icon={HelpCircle} label="Help" onClick={() => { setShowProfileDropdown(false); router.push('/dashboard/help') }} />
                          </div>
                          <div className="border-t border-slate-100 dark:border-white/5 pt-1">
                            <DropdownItem icon={LogOut} label="Sign Out" onClick={() => { setShowProfileDropdown(false); signOut({ callbackUrl: window.location.origin }) }} className="text-red-500" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="relative">
            <SwipeGestureHandler>
              <PullToRefresh onRefresh={handleRefresh}>
                <motion.div
                  key={pathname}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto"
                >
                  {children}
                </motion.div>
              </PullToRefresh>
            </SwipeGestureHandler>
          </main>

          {showMobileNav && <MobileBottomNav />}
        </div>
      </div>
    </div>
  )
}

function DropdownItem({ icon: Icon, label, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${className}`}
    >
      <Icon className="h-4 w-4 text-slate-400" />
      <span>{label}</span>
    </button>
  )
}
