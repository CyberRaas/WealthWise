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
import Logo from '@/components/ui/Logo'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LogOut,
  User,
  Settings,
  HelpCircle,
  ChevronDown,
  Bell
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

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Handle refresh
  const handleRefresh = async () => {
    if (onRefresh) {
      await onRefresh()
    } else {
      // Default refresh behavior
      return new Promise((resolve) => {
        setTimeout(() => {
          window.location.reload()
          resolve()
        }, 1000)
      })
    }
  }

  // Determine if current page should show mobile nav
  const showMobileNav = [
    '/dashboard',
    '/dashboard/expenses',
    '/dashboard/goals',
    '/dashboard/analytics',
    '/dashboard/budget',
    '/dashboard/profile',
    '/dashboard/notifications'
  ].some(path => pathname === path)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-200">
      <div className="flex">
        {/* Desktop Sidebar - Hidden on Mobile */}
        <div className="hidden lg:block">
          <div className="sticky top-0 h-screen border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
            <Sidebar />
          </div>
        </div>

        {/* Mobile Sidebar Overlay - Only show when sidebarOpen is true */}
        {sidebarOpen && (
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Fixed Header with Consistent Height */}
          <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700/60 shadow-sm transition-colors duration-200">
            <div className="h-16 px-3 sm:px-4 lg:px-6">
              <div className="flex items-center justify-between h-full">
                {/* Left Section: Logo (Mobile) or Title (Desktop) */}
                <div className="flex items-center min-w-0 flex-1">
                  {/* Mobile Logo - Show only on mobile */}
                  <div className="lg:hidden mr-3">
                    <Logo size="medium" />
                  </div>

                  {/* Title Section - Hidden on mobile, shown on desktop */}
                  <div className="hidden lg:flex flex-col justify-center ml-4">
                    <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
                      {title}
                    </h1>
                  </div>
                </div>

                {/* Right Section: Actions */}
                <div className="flex items-center space-x-2">
                  {/* Theme Toggle */}
                  <ThemeToggle variant="icon" />

                  {/* Language Selector */}
                  <LanguageSelector variant="dashboard" />

                  {/* Notification Bell Button - Redirects to notifications page */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push('/dashboard/notifications')}
                    className="relative h-9 w-9 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                  >
                    <Bell className="h-[18px] w-[18px] text-slate-600 dark:text-slate-400" />
                    {/* Optional: Add notification badge */}
                    {/* <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span> */}
                  </Button>

                  {/* User Profile Dropdown - Hidden on mobile */}
                  <div className="relative hidden lg:block" ref={dropdownRef}>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-3 pl-2 pr-4 py-1.5 h-auto hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-all duration-200"
                      onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    >
                      <Avatar className="h-8 w-8 border border-slate-200 dark:border-slate-700">
                        <AvatarImage src={profileImage} />
                        <AvatarFallback className="text-sm bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold">
                          {session?.user?.name?.[0] || 'A'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden sm:block text-left">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate max-w-24 lg:max-w-none">
                          {session?.user?.name?.split(' ')[0] || 'User'}
                        </p>
                      </div>
                      <ChevronDown className={`h-4 w-4 text-slate-500 dark:text-slate-400 transition-transform duration-200 ${showProfileDropdown ? 'rotate-180' : ''} hidden sm:block`} />
                    </Button>

                    {/* Profile Dropdown Menu */}
                    <AnimatePresence>
                      {showProfileDropdown && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-64 sm:w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50"
                        >
                          {/* User Info Header */}
                          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-12 w-12 ring-2 ring-emerald-100 dark:ring-emerald-900">
                                <AvatarImage src={profileImage} />
                                <AvatarFallback className="text-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold">
                                  {session?.user?.name?.[0] || 'A'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-lg font-bold text-slate-900 dark:text-white truncate">
                                  {session?.user?.name || 'User'}
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                                  {session?.user?.email || 'user@example.com'}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Menu Items */}
                          <div className="py-2">
                            <MenuItem
                              icon={User}
                              label="Profile"
                              onClick={() => {
                                setShowProfileDropdown(false)
                                router.push('/dashboard/profile')
                              }}
                            />
                            <MenuItem
                              icon={Settings}
                              label="Settings"
                              onClick={() => {
                                setShowProfileDropdown(false)
                                router.push('/dashboard/settings')
                              }}
                            />
                            <MenuItem
                              icon={HelpCircle}
                              label="Help & Support"
                              onClick={() => {
                                setShowProfileDropdown(false)
                                router.push('/dashboard/help')
                              }}
                            />
                            <div className="border-t border-slate-100 dark:border-slate-700 my-2"></div>
                            <MenuItem
                              icon={LogOut}
                              label="Sign Out"
                              onClick={() => {
                                setShowProfileDropdown(false)
                                signOut({ callbackUrl: window.location.origin })
                              }}
                              className="text-red-600 hover:bg-red-50"
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content with Swipe Gestures & Pull to Refresh */}
          <main className="relative">
            <SwipeGestureHandler>
              <PullToRefresh onRefresh={handleRefresh}>
                <motion.div
                  key={pathname}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="p-3 sm:p-4 lg:p-6"
                  data-scrollable="true"
                >
                  {children}
                </motion.div>
              </PullToRefresh>
            </SwipeGestureHandler>
          </main>

          {/* Mobile Bottom Navigation */}
          {showMobileNav && (
            <MobileBottomNav />
          )}
        </div>
      </div>
    </div>
  )
}

// Menu Item Component
function MenuItem({ icon: Icon, label, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-3 px-4 py-3 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 active:bg-slate-100 dark:active:bg-slate-600 transition-colors duration-150 ${className}`}
    >
      <Icon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
      <span className="font-medium">{label}</span>
    </button>
  )
}
