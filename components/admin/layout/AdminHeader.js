'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import { useAdmin } from '@/contexts/AdminContext'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu,
  LogOut,
  User,
  ChevronDown,
  Shield,
  Bell,
  Search,
  Home
} from 'lucide-react'

export default function AdminHeader({ title = "Admin Panel" }) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const { toggleSidebar, adminInfo } = useAdmin()
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
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

  // Get role badge color
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'admin':
        return 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400'
      case 'moderator':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700/60 shadow-sm transition-colors duration-200">
      <div className="h-16 px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-full">
          {/* Left Section */}
          <div className="flex items-center min-w-0 flex-1">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="lg:hidden mr-3 h-10 w-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </Button>

            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center space-x-2 mr-3">
              <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
            </div>

            {/* Title Section - Desktop */}
            <div className="min-w-0 flex-1 hidden lg:block">
              <motion.h1
                key={pathname}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 dark:text-white truncate"
              >
                {title}
              </motion.h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 hidden sm:block truncate">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            <ThemeToggle variant="icon" />

            {/* Back to App Button - Desktop only */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="hidden sm:flex items-center gap-2 h-10 px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
            >
              <Home className="h-4 w-4" />
              <span className="text-sm font-medium">Back to App</span>
            </Button>

            {/* User Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <Button
                variant="ghost"
                className="flex items-center space-x-2 bg-slate-100/50 dark:bg-slate-800/50 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 rounded-xl px-3 py-2 h-10 transition-all duration-200 active:scale-95"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              >
                <Avatar className="h-7 w-7 sm:h-8 sm:w-8 ring-2 ring-violet-100 dark:ring-violet-900">
                  <AvatarImage src={session?.user?.image} />
                  <AvatarFallback className="text-sm bg-gradient-to-r from-violet-500 to-purple-500 text-white font-bold">
                    {session?.user?.name?.[0] || 'A'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate max-w-24 lg:max-w-none">
                    {session?.user?.name?.split(' ')[0] || 'Admin'}
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
                        <Avatar className="h-12 w-12 ring-2 ring-violet-100 dark:ring-violet-900">
                          <AvatarImage src={session?.user?.image} />
                          <AvatarFallback className="text-lg bg-gradient-to-r from-violet-500 to-purple-500 text-white font-bold">
                            {session?.user?.name?.[0] || 'A'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-lg font-bold text-slate-900 dark:text-white truncate">
                            {session?.user?.name || 'Admin User'}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                            {session?.user?.email || 'admin@example.com'}
                          </p>
                          {/* Role Badge */}
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${getRoleBadgeColor(adminInfo?.role)}`}>
                            {adminInfo?.role?.replace('_', ' ').toUpperCase() || 'ADMIN'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <MenuItem
                        icon={User}
                        label="My Profile"
                        onClick={() => {
                          setShowProfileDropdown(false)
                          router.push('/dashboard/profile')
                        }}
                      />
                      <MenuItem
                        icon={Home}
                        label="Back to Dashboard"
                        onClick={() => {
                          setShowProfileDropdown(false)
                          router.push('/dashboard')
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
                        className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
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
