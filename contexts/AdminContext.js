'use client'

import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { useSession } from 'next-auth/react'

const AdminContext = createContext(null)

/**
 * Admin Context Provider
 *
 * Provides admin-specific state and utilities across admin pages
 */
export function AdminProvider({ children }) {
  const { data: session, status } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Check if user has admin access
  const isAdmin = useMemo(() => {
    if (!session?.user?.role) return false
    return ['moderator', 'admin', 'super_admin'].includes(session.user.role)
  }, [session?.user?.role])

  const isSuperAdmin = useMemo(() => {
    return session?.user?.role === 'super_admin'
  }, [session?.user?.role])

  const isLoading = status === 'loading'

  // Admin info
  const adminInfo = useMemo(() => {
    if (!session?.user) return null
    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
      role: session.user.role || 'user'
    }
  }, [session?.user])

  // Toggle sidebar (mobile)
  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev)
  }, [])

  // Close sidebar (mobile)
  const closeSidebar = useCallback(() => {
    setSidebarOpen(false)
  }, [])

  // Toggle sidebar collapsed state (desktop)
  const toggleSidebarCollapsed = useCallback(() => {
    setSidebarCollapsed(prev => !prev)
  }, [])

  // Check permission helper
  const hasPermission = useCallback((permission) => {
    if (!isAdmin) return false
    if (isSuperAdmin) return true

    // Basic role-based check
    const rolePermissions = {
      moderator: ['users:read', 'moderation:read', 'moderation:action', 'notifications:read'],
      admin: [
        'users:read', 'users:write', 'users:suspend',
        'analytics:read', 'analytics:export',
        'notifications:read', 'notifications:write', 'notifications:send',
        'config:read', 'system:read', 'audit:read',
        'moderation:read', 'moderation:action'
      ]
    }

    const userRole = session?.user?.role
    const permissions = rolePermissions[userRole] || []
    return permissions.includes(permission)
  }, [isAdmin, isSuperAdmin, session?.user?.role])

  const value = {
    // State
    sidebarOpen,
    sidebarCollapsed,
    isAdmin,
    isSuperAdmin,
    isLoading,
    adminInfo,

    // Actions
    toggleSidebar,
    closeSidebar,
    toggleSidebarCollapsed,
    hasPermission
  }

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  )
}

/**
 * Hook to access admin context
 */
export function useAdmin() {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
}

export default AdminContext
