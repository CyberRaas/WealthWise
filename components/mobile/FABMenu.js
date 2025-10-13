'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Wallet,
  Camera,
  Target,
  Mic,
  X,
  Receipt
} from 'lucide-react'
import toast from 'react-hot-toast'

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

const MENU_ITEMS = [
  {
    id: 'add-expense',
    name: 'Add Expense',
    icon: Wallet,
    color: 'from-purple-500 to-pink-500',
    action: 'expense'
  },
  {
    id: 'scan-receipt',
    name: 'Scan Receipt',
    icon: Camera,
    color: 'from-blue-500 to-cyan-500',
    action: 'scan'
  },
  {
    id: 'add-goal',
    name: 'Add to Goal',
    icon: Target,
    color: 'from-orange-500 to-red-500',
    action: 'goal'
  },
  {
    id: 'voice-entry',
    name: 'Voice Entry',
    icon: Mic,
    color: 'from-green-500 to-emerald-500',
    action: 'voice'
  }
]

export default function FABMenu({ isOpen, onClose }) {
  const router = useRouter()

  const handleAction = (action) => {
    triggerHaptic('heavy')
    onClose()

    switch (action) {
      case 'expense':
        router.push('/dashboard/expenses?action=add')
        break
      case 'scan':
        toast.success('Opening camera...')
        // TODO: Implement receipt scanning
        break
      case 'goal':
        router.push('/dashboard/goals?action=add')
        break
      case 'voice':
        toast.success('Voice entry activated')
        // TODO: Implement voice input
        break
      default:
        break
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Menu Items - Radial Layout */}
          <div className="lg:hidden fixed inset-0 z-50 pointer-events-none">
            <div className="absolute bottom-20 left-0 right-0 flex justify-center">
              <div className="relative w-64 h-64">
                {MENU_ITEMS.map((item, index) => {
                  const Icon = item.icon
                  const angle = (index * 90) - 135 // Spread in arc
                  const radius = 100
                  const x = Math.cos((angle * Math.PI) / 180) * radius
                  const y = Math.sin((angle * Math.PI) / 180) * radius

                  return (
                    <motion.button
                      key={item.id}
                      initial={{ scale: 0, x: 0, y: 0, opacity: 0 }}
                      animate={{
                        scale: 1,
                        x: x,
                        y: y,
                        opacity: 1
                      }}
                      exit={{ scale: 0, x: 0, y: 0, opacity: 0 }}
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 20,
                        delay: index * 0.05
                      }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleAction(item.action)}
                      className="absolute pointer-events-auto left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className={`w-14 h-14 rounded-full bg-gradient-to-r ${item.color} shadow-xl flex items-center justify-center`}>
                          <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
                        </div>
                        <span className="text-xs font-semibold text-white bg-black/70 px-2 py-1 rounded-full whitespace-nowrap">
                          {item.name}
                        </span>
                      </div>
                    </motion.button>
                  )
                })}

                {/* Center Close Button */}
                <motion.button
                  initial={{ scale: 0, rotate: 0 }}
                  animate={{ scale: 1, rotate: 45 }}
                  exit={{ scale: 0, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
                >
                  <div className="w-14 h-14 rounded-full bg-gradient-to-r from-red-500 to-pink-500 shadow-2xl flex items-center justify-center">
                    <Plus className="w-7 h-7 text-white" strokeWidth={3} />
                  </div>
                </motion.button>
              </div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
