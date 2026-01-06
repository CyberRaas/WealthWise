'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { AdminProvider } from '@/contexts/AdminContext'
import AdminLayout from '@/components/admin/layout/AdminLayout'

/**
 * Admin Root Layout
 *
 * Wraps all admin pages with:
 * - Authentication check
 * - Admin role verification
 * - AdminContext provider
 * - AdminLayout
 */
export default function AdminRootLayout({ children }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Check authentication and admin access
  useEffect(() => {
    if (status === 'loading') return

    // Redirect if not authenticated
    if (!session) {
      router.push('/auth/signin?callbackUrl=/admin')
      return
    }

    // Redirect if not admin
    const userRole = session.user?.role
    const isAdmin = ['moderator', 'admin', 'super_admin'].includes(userRole)

    if (!isAdmin) {
      router.push('/dashboard?error=unauthorized')
      return
    }
  }, [session, status, router])

  // Show loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg mx-auto mb-4 animate-pulse">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">Loading Admin Panel...</p>
        </div>
      </div>
    )
  }

  // Check if user has admin access
  const userRole = session?.user?.role
  const isAdmin = ['moderator', 'admin', 'super_admin'].includes(userRole)

  if (!session || !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Access Denied</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-4">You do not have permission to access the admin panel.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <AdminProvider>
      {children}
    </AdminProvider>
  )
}
