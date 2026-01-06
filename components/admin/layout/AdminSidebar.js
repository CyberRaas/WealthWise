'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useAdmin } from '@/contexts/AdminContext'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  FileText,
  Bell,
  Shield,
  ChevronLeft,
  ChevronRight,
  X,
  LogOut,
  Activity,
  Home
} from 'lucide-react'

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    description: 'Overview & Stats',
    permission: null // All admins can access
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: Users,
    description: 'Manage users',
    permission: 'users:read'
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    description: 'Platform metrics',
    permission: 'analytics:read'
  },
  {
    name: 'Notifications',
    href: '/admin/notifications',
    icon: Bell,
    description: 'Send notifications',
    permission: 'notifications:read'
  },
  {
    name: 'Audit Logs',
    href: '/admin/audit-logs',
    icon: FileText,
    description: 'Activity history',
    permission: 'audit:read'
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    description: 'System config',
    permission: 'config:read'
  }
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const {
    sidebarOpen,
    sidebarCollapsed,
    closeSidebar,
    toggleSidebarCollapsed,
    hasPermission,
    adminInfo
  } = useAdmin()

  // Filter navigation items based on permissions
  const visibleNavItems = navigationItems.filter(item =>
    !item.permission || hasPermission(item.permission)
  )

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Background overlay */}
          <div
            className="absolute inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm"
            onClick={closeSidebar}
          />

          {/* Sidebar panel */}
          <div className="relative w-80 max-w-[85vw] h-full bg-white dark:bg-slate-900 shadow-2xl animate-in slide-in-from-left duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 h-16">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col justify-center">
                  <h1 className="text-xl font-bold leading-tight">
                    <span className="text-slate-800 dark:text-white">Admin</span>
                    <span className="bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent">Panel</span>
                  </h1>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={closeSidebar}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg w-8 h-8 p-0"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Navigation for mobile */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {visibleNavItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
                const Icon = item.icon

                return (
                  <Link key={item.name} href={item.href} onClick={closeSidebar}>
                    <div
                      className={`group relative flex items-center px-3 py-3 rounded-lg transition-all duration-150 cursor-pointer ${
                        isActive
                          ? 'bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-400'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 bg-violet-500 rounded-r-full" />
                      )}

                      <Icon className={`h-5 w-5 ${
                        isActive
                          ? 'text-violet-600 dark:text-violet-400'
                          : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                      } transition-colors flex-shrink-0`} />

                      <div className="ml-3 flex-1 min-w-0">
                        <p className={`text-sm font-medium ${
                          isActive ? 'text-violet-700 dark:text-violet-400' : 'text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white'
                        }`}>
                          {item.name}
                        </p>
                        <p className={`text-xs ${
                          isActive ? 'text-violet-600/70 dark:text-violet-500/70' : 'text-slate-400 dark:text-slate-500'
                        }`}>
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </nav>

            {/* Bottom Section */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
              {/* Back to Dashboard */}
              <Link href="/dashboard" onClick={closeSidebar}>
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all duration-200"
                >
                  <Home className="w-5 h-5" />
                  <span className="font-medium">Back to App</span>
                </Button>
              </Link>

              {/* Sign Out */}
              <Button
                onClick={() => {
                  signOut({ callbackUrl: window.location.origin })
                  closeSidebar()
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

      {/* Desktop Sidebar */}
      <div className={`
        hidden lg:flex
        bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700
        transition-all duration-300 ease-in-out
        ${sidebarCollapsed ? 'w-20' : 'w-72'}
        h-screen
        flex-col
      `}>
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 h-16 flex items-center">
          <div className="flex items-center justify-between w-full">
            {!sidebarCollapsed && (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-700">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col justify-center">
                  <h1 className="text-xl font-bold leading-tight">
                    <span className="text-slate-800 dark:text-white">Admin</span>
                    <span className="bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent">Panel</span>
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight capitalize">{adminInfo?.role?.replace('_', ' ') || 'Admin'}</p>
                </div>
              </div>
            )}

            {sidebarCollapsed && (
              <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-700 mx-auto">
                <Shield className="w-6 h-6 text-white" />
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebarCollapsed}
              className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg w-8 h-8 p-0 flex-shrink-0"
            >
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            const Icon = item.icon

            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={`group relative flex items-center px-3 py-2.5 rounded-lg transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-400'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                  title={sidebarCollapsed ? item.name : undefined}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-violet-500 rounded-r-full" />
                  )}

                  <Icon className={`h-5 w-5 ${
                    isActive
                      ? 'text-violet-600 dark:text-violet-400'
                      : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                  } transition-colors flex-shrink-0`} />

                  {!sidebarCollapsed && (
                    <div className="ml-3 flex-1 min-w-0">
                      <p className={`text-sm font-medium ${
                        isActive ? 'text-violet-700 dark:text-violet-400' : 'text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white'
                      }`}>
                        {item.name}
                      </p>
                      <p className={`text-xs ${
                        isActive ? 'text-violet-600/70 dark:text-violet-500/70' : 'text-slate-400 dark:text-slate-500'
                      }`}>
                        {item.description}
                      </p>
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Bottom Section */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
            <Link href="/dashboard">
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all duration-200"
              >
                <Home className="w-5 h-5" />
                <span className="font-medium">Back to App</span>
              </Button>
            </Link>

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

        {sidebarCollapsed && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
            <Link href="/dashboard">
              <Button
                variant="outline"
                className="w-12 h-12 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl mx-auto flex items-center justify-center transition-all duration-200"
                title="Back to App"
              >
                <Home className="w-6 h-6" />
              </Button>
            </Link>

            <Button
              onClick={() => signOut({ callbackUrl: window.location.origin })}
              variant="outline"
              className="w-12 h-12 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-300 dark:hover:border-red-800 rounded-xl mx-auto flex items-center justify-center transition-all duration-200"
              title="Sign Out"
            >
              <LogOut className="w-6 h-6" />
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
