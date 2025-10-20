'use client'

import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Home,
  Wallet,
  Target,
  BarChart3,
  Plus
} from 'lucide-react'

// Haptic Feedback
const triggerHaptic = (intensity = 'medium') => {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    const patterns = {
      light: 10,
      medium: 20,
      heavy: 30
    }
    navigator.vibrate(patterns[intensity] || 20)
  }
}

const NAV_ITEMS = [
  {
    id: 'dashboard',
    name: 'Home',
    icon: Home,
    href: '/dashboard',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'expenses',
    name: 'Expenses',
    icon: Wallet,
    href: '/dashboard/expenses',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'goals',
    name: 'Goals',
    icon: Target,
    href: '/dashboard/goals',
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 'analytics',
    name: 'Analytics',
    icon: BarChart3,
    href: '/dashboard/analytics',
    color: 'from-indigo-500 to-purple-500'
  }
]

export default function MobileBottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  const handleNavClick = (item) => {
    triggerHaptic('medium')
    if (item.href) {
      router.push(item.href)
    }
  }

  const isActive = (href) => {
    if (!href) return false
    return pathname === href
  }

  return (
    <>
      {/* Safe area spacer for content */}
      <div className="h-20 lg:hidden" />

      {/* Bottom Navigation Bar */}
      <motion.div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 safe-area-bottom"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* iOS Safe Area Bottom Padding */}
        <div className="bg-white pb-safe">
          <nav className="flex items-center justify-around h-16 px-2 relative">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)

              return (
                <motion.button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  className="flex flex-col items-center justify-center min-w-[60px] py-1 relative"
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Active Indicator Background */}
                  {active && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}

                  {/* Icon Container */}
                  <div className="relative z-10">
                    <motion.div
                      animate={{
                        scale: active ? 1.1 : 1,
                        y: active ? -2 : 0
                      }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      {active ? (
                        <div className={`p-2 rounded-xl bg-gradient-to-r ${item.color}`}>
                          <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                        </div>
                      ) : (
                        <Icon className="w-6 h-6 text-slate-400" strokeWidth={2} />
                      )}
                    </motion.div>
                  </div>

                  {/* Label */}
                  <motion.span
                    className={`text-xs font-medium mt-1 relative z-10 ${active
                        ? 'text-transparent bg-gradient-to-r bg-clip-text from-emerald-600 to-teal-600'
                        : 'text-slate-500'
                      }`}
                    animate={{
                      scale: active ? 1.05 : 1,
                      fontWeight: active ? 600 : 500
                    }}
                  >
                    {item.name}
                  </motion.span>

                  {/* Active Dot Indicator */}
                  {active && (
                    <motion.div
                      className="absolute bottom-0 w-1 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                      layoutId="activeDot"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.button>
              )
            })}
          </nav>
        </div>
      </motion.div>

      {/* Add custom CSS for safe areas */}
      <style jsx global>{`
        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }

        .pb-safe {
          padding-bottom: max(0px, env(safe-area-inset-bottom));
        }

        /* Prevent scrolling behind nav on mobile */
        @media (max-width: 1024px) {
          body {
            padding-bottom: env(safe-area-inset-bottom);
          }
        }
      `}</style>
    </>
  )
}
