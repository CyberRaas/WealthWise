'use client'

import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'

export default function AdminLayout({ children, title = "Admin Panel" }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-200">
      <div className="flex">
        {/* Sidebar - handles both mobile and desktop views internally */}
        <AdminSidebar />

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <AdminHeader title={title} />

          {/* Page Content */}
          <main className="relative">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="p-3 sm:p-4 lg:p-6"
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  )
}
