// components/layout/DashboardLayout.js
'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Sidebar from '@/components/layout/Sidebar'
import { 
  Bell,
  LogOut,
  User,
  Search,
  Settings,
  CreditCard,
  FileText,
  HelpCircle,
  ChevronDown,
  Menu
} from 'lucide-react'

export default function DashboardLayout({ children, title = "Dashboard" }) {
  const { data: session } = useSession()
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <div className="flex">
        {/* Desktop Sidebar - Hidden on Mobile */}
        <div className="hidden lg:block">
          <div className="sticky top-0 h-screen">
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
          <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
            <div className="h-16 px-3 sm:px-4 lg:px-6">
              <div className="flex items-center justify-between h-full">
                {/* Left Section: Mobile Menu + Title */}
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  {/* Mobile Menu Button */}
                  <button 
                    className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl border-2 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all duration-200 shadow-sm hover:shadow-md"
                    onClick={() => setSidebarOpen(true)}
                  >
                    <Menu className="w-5 h-5 text-slate-600" />
                  </button>

                  {/* Title Section */}
                  <div className="min-w-0 flex-1">
                    <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 truncate">
                      {title}
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 hidden sm:block truncate">
                      {new Date().toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                {/* Right Section: Actions */}
                <div className="flex items-center space-x-2">
                  {/* Notifications - Hidden on small mobile */}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-slate-500 hover:text-slate-700 relative hover:bg-slate-100 rounded-xl w-10 h-10 p-0 hidden sm:flex"
                  >
                    <Bell className="h-5 w-5" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full border-2 border-white"></div>
                  </Button>
                  
                  {/* User Profile Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <Button
                      variant="ghost"
                      className="flex items-center space-x-2 bg-slate-100/50 hover:bg-slate-200/50 rounded-xl px-3 py-2 h-10 transition-all duration-200"
                      onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    >
                      <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                        <AvatarImage src={session?.user?.image} />
                        <AvatarFallback className="text-sm bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold">
                          {session?.user?.name?.[0] || 'A'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden sm:block text-left">
                        <p className="text-sm font-semibold text-slate-700 truncate max-w-24 lg:max-w-none">
                          {session?.user?.name?.split(' ')[0] || 'AKASH'}
                        </p>
                      </div>
                      <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${showProfileDropdown ? 'rotate-180' : ''} hidden sm:block`} />
                    </Button>

                    {/* Profile Dropdown Menu */}
                    {showProfileDropdown && (
                      <div className="absolute right-0 mt-2 w-64 sm:w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                        {/* User Info Header */}
                        <div className="px-4 py-3 border-b border-slate-100">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={session?.user?.image} />
                              <AvatarFallback className="text-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold">
                                {session?.user?.name?.[0] || 'A'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-lg font-bold text-slate-900 truncate">
                                {session?.user?.name || 'AKASH'}
                              </p>
                              <p className="text-sm text-slate-500 truncate">
                                {session?.user?.email || 'vishwakarmaakashavi7@gmail.com'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                          <MenuItem 
                            icon={User} 
                            label="Profile" 
                            onClick={() => setShowProfileDropdown(false)}
                          />
                          <MenuItem 
                            icon={Settings} 
                            label="Edit Profile" 
                            onClick={() => setShowProfileDropdown(false)}
                          />
                          <MenuItem 
                            icon={CreditCard} 
                            label="Profile Card" 
                            onClick={() => setShowProfileDropdown(false)}
                          />
                          <MenuItem 
                            icon={FileText} 
                            label="My Sheets" 
                            onClick={() => setShowProfileDropdown(false)}
                          />
                          
                          <div className="border-t border-slate-100 my-2"></div>
                          
                          <MenuItem 
                            icon={HelpCircle} 
                            label="Help & Support" 
                            onClick={() => setShowProfileDropdown(false)}
                          />
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
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="p-3 sm:p-4 lg:p-6">
            {children}
          </main>
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
      className={`w-full flex items-center space-x-3 px-4 py-3 text-left text-slate-700 hover:bg-slate-50 transition-colors duration-150 ${className}`}
    >
      <Icon className="h-5 w-5 text-slate-500" />
      <span className="font-medium">{label}</span>
    </button>
  )
}
