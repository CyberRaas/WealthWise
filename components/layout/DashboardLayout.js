// components/layout/DashboardLayout.js
'use client'

import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Sidebar from '@/components/layout/Sidebar'
import { 
  Bell,
  LogOut,
  User,
  Search
} from 'lucide-react'

export default function DashboardLayout({ children, title = "Dashboard" }) {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <div className="flex-1">
          {/* Top Header */}
          <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-40 shadow-sm">
            <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
              <div className="flex items-center justify-between">
                {/* Title */}
                <div className="min-w-0 flex-1 mr-4">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent truncate">
                    {title}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 hidden sm:block">
                    Manage your finances smartly
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 sm:space-x-4">
                  {/* Search - hidden on small screens */}
                  <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-700 hidden md:flex">
                    <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                  
                  {/* Notifications */}
                  <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-700 relative">
                    <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-emerald-500 rounded-full"></div>
                  </Button>
                  
                  {/* User Profile */}
                  <div className="flex items-center space-x-2 sm:space-x-3 bg-slate-100/50 rounded-2xl px-2 sm:px-4 py-2">
                    <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                      <AvatarImage src={session?.user?.image} />
                      <AvatarFallback className="text-xs sm:text-sm bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold">
                        {session?.user?.name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden lg:block">
                      <p className="text-sm font-medium text-slate-700">
                        {session?.user?.name?.split(' ')[0] || 'User'}
                      </p>
                      <p className="text-xs text-slate-500">Premium</p>
                    </div>
                  </div>

                  {/* Logout */}
                  <Button
                    onClick={() => signOut()}
                    variant="ghost"
                    size="sm"
                    className="text-slate-500 hover:text-red-600"
                  >
                    <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
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
