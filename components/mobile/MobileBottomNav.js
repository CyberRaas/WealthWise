'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useProfile } from '@/contexts/ProfileContext'
import { motion } from 'framer-motion'
import Image from 'next/image'
import {
  Home,
  Wallet,
  PieChart,
  BarChart3,
  User
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
    href: '/dashboard'
  },
  {
    id: 'expenses',
    name: 'Expenses',
    icon: Wallet,
    href: '/dashboard/expenses'
  },
  {
    id: 'budget',
    name: 'Budget',
    icon: PieChart,
    href: '/dashboard/budget'
  },
  {
    id: 'analytics',
    name: 'Analytics',
    icon: BarChart3,
    href: '/dashboard/analytics'
  },
  {
    id: 'profile',
    name: 'Profile',
    icon: User,
    href: '/dashboard/profile'
  }
]

export default function MobileBottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const { profileImage, profileData } = useProfile()

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
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 safe-area-bottom transition-colors duration-200"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* iOS Safe Area Bottom Padding */}
        <div className="bg-white dark:bg-slate-900 pb-safe transition-colors duration-200">
          <nav className="flex items-center justify-around h-16 px-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              const isProfileIcon = item.id === 'profile'

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  className="flex flex-col items-center justify-center min-w-[56px] py-2 transition-colors"
                >
                  {/* Icon */}
                  {isProfileIcon ? (
                    <div className={`relative w-7 h-7 rounded-full overflow-hidden ${
                      active ? 'ring-2 ring-emerald-500' : ''
                    }`}>
                      {profileImage ? (
                        <Image
                          src={profileImage}
                          alt={session?.user?.name || 'Profile'}
                          fill
                          className="object-cover"
                          sizes="28px"
                          priority
                        />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center text-white font-medium text-xs ${
                          active ? 'bg-emerald-500' : 'bg-slate-400 dark:bg-slate-600'
                        }`}>
                          {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Icon
                      className={`w-5 h-5 ${
                        active
                          ? 'text-emerald-500 dark:text-emerald-400'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                      strokeWidth={active ? 2.5 : 2}
                    />
                  )}

                  {/* Label */}
                  <span
                    className={`text-[10px] mt-1 ${
                      active
                        ? 'text-emerald-500 dark:text-emerald-400 font-medium'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {item.name}
                  </span>
                </button>
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
