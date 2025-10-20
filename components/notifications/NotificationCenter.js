// components/notifications/NotificationCenter.js
'use client'

import { useState, useRef, useEffect } from 'react'
import { useNotifications } from '@/contexts/NotificationContext'
import { Bell, Check, CheckCheck, X, TrendingUp, AlertCircle, Info, Target, Wallet } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

const PRIORITY_COLORS = {
    critical: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-800',
        icon: 'text-red-600',
        badge: 'bg-red-600'
    },
    high: {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-800',
        icon: 'text-orange-600',
        badge: 'bg-orange-600'
    },
    medium: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-800',
        icon: 'text-blue-600',
        badge: 'bg-blue-600'
    },
    low: {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        text: 'text-gray-800',
        icon: 'text-gray-600',
        badge: 'bg-gray-600'
    }
}

const CATEGORY_ICONS = {
    spending: Wallet,
    savings: TrendingUp,
    goals: Target,
    bills: AlertCircle,
    ai_insights: Info,
    system: Info
}

export default function NotificationCenter() {
    const { notifications, unreadCount, markAsRead, markAllAsRead, dismiss, loading } = useNotifications()
    const [isOpen, setIsOpen] = useState(false)
    const [filter, setFilter] = useState('all') // 'all', 'unread', 'critical'
    const dropdownRef = useRef(null)

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
            return () => document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen])

    // Filter notifications
    const filteredNotifications = notifications.filter(notification => {
        if (filter === 'unread') return !notification.read
        if (filter === 'critical') return notification.priority === 'critical' || notification.priority === 'high'
        return true
    })

    const handleNotificationClick = (notification) => {
        if (!notification.read) {
            markAsRead(notification.id)
        }
    }

    const handleDismiss = (e, notificationId) => {
        e.stopPropagation()
        dismiss(notificationId)
    }

    const handleMarkAllRead = (e) => {
        e.stopPropagation()
        markAllAsRead()
    }

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                aria-label="Notifications"
            >
                <Bell className="h-6 w-6" />

                {/* Unread Badge */}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold">Notifications</h3>
                                <p className="text-xs text-emerald-100">
                                    {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                                </p>
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    className="flex items-center gap-1 px-3 py-1 text-xs font-medium bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                                >
                                    <CheckCheck className="h-3 w-3" />
                                    Mark all read
                                </button>
                            )}
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex gap-2 mt-3">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${filter === 'all'
                                        ? 'bg-white text-emerald-600'
                                        : 'bg-white/20 text-white hover:bg-white/30'
                                    }`}
                            >
                                All ({notifications.length})
                            </button>
                            <button
                                onClick={() => setFilter('unread')}
                                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${filter === 'unread'
                                        ? 'bg-white text-emerald-600'
                                        : 'bg-white/20 text-white hover:bg-white/30'
                                    }`}
                            >
                                Unread ({unreadCount})
                            </button>
                            <button
                                onClick={() => setFilter('critical')}
                                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${filter === 'critical'
                                        ? 'bg-white text-emerald-600'
                                        : 'bg-white/20 text-white hover:bg-white/30'
                                    }`}
                            >
                                Important
                            </button>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                            </div>
                        ) : filteredNotifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 px-4">
                                <Bell className="h-12 w-12 text-gray-300 mb-3" />
                                <p className="text-gray-500 text-sm font-medium">
                                    {filter === 'all' ? 'No notifications yet' :
                                        filter === 'unread' ? 'No unread notifications' :
                                            'No important notifications'}
                                </p>
                                <p className="text-gray-400 text-xs mt-1">
                                    {filter === 'all' ? 'You\'ll see important updates here' : 'Check back later'}
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {filteredNotifications.map((notification) => {
                                    const colors = PRIORITY_COLORS[notification.priority] || PRIORITY_COLORS.low
                                    const CategoryIcon = CATEGORY_ICONS[notification.category] || Info

                                    return (
                                        <div
                                            key={notification.id}
                                            className={`relative px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${!notification.read ? 'bg-blue-50/30' : ''
                                                }`}
                                            onClick={() => handleNotificationClick(notification)}
                                        >
                                            {/* Unread Indicator */}
                                            {!notification.read && (
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-600"></div>
                                            )}

                                            <div className="flex gap-3">
                                                {/* Icon */}
                                                <div className={`flex-shrink-0 w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center border ${colors.border}`}>
                                                    <CategoryIcon className={`h-5 w-5 ${colors.icon}`} />
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h4 className={`text-sm font-semibold ${colors.text} leading-tight`}>
                                                            {notification.title}
                                                        </h4>

                                                        {/* Dismiss Button */}
                                                        <button
                                                            onClick={(e) => handleDismiss(e, notification.id)}
                                                            className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors"
                                                            aria-label="Dismiss"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </div>

                                                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                                        {notification.message}
                                                    </p>

                                                    <div className="flex items-center justify-between mt-2">
                                                        <span className="text-xs text-gray-500">
                                                            {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                                                        </span>

                                                        {notification.actionUrl && (
                                                            <Link
                                                                href={notification.actionUrl}
                                                                className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
                                                                onClick={() => setIsOpen(false)}
                                                            >
                                                                {notification.actionLabel || 'View'}
                                                            </Link>
                                                        )}
                                                    </div>

                                                    {/* Priority Badge */}
                                                    {(notification.priority === 'critical' || notification.priority === 'high') && (
                                                        <div className="mt-2">
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white ${colors.badge}`}>
                                                                {notification.priority === 'critical' ? '🚨 Critical' : '⚠️ Important'}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {filteredNotifications.length > 0 && (
                        <div className="border-t border-gray-200 px-4 py-2 bg-gray-50">
                            <Link
                                href="/dashboard/notifications"
                                className="block text-center text-sm font-medium text-emerald-600 hover:text-emerald-700"
                                onClick={() => setIsOpen(false)}
                            >
                                View All Notifications
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
