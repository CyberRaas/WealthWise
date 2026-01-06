'use client'

import { useState } from 'react'
import { useAdmin } from '@/contexts/AdminContext'
import AdminLayout from '@/components/admin/layout/AdminLayout'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  Bell,
  Send,
  Users,
  MessageSquare,
  AlertCircle,
  Info,
  CheckCircle
} from 'lucide-react'

export default function AdminNotificationsPage() {
  const { hasPermission } = useAdmin()
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    target: 'all'
  })
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState(null)

  const canSend = hasPermission('notifications:send')

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!canSend) {
      setResult({ success: false, message: 'You do not have permission to send notifications' })
      return
    }

    if (!formData.title || !formData.message) {
      setResult({ success: false, message: 'Please fill in all required fields' })
      return
    }

    setSending(true)
    setResult(null)

    // Simulate sending notification (in real app, this would call an API)
    setTimeout(() => {
      setSending(false)
      setResult({
        success: true,
        message: 'Notification sent successfully!'
      })
      setFormData({ title: '', message: '', type: 'info', target: 'all' })
    }, 1500)
  }

  const notificationTypes = [
    { value: 'info', label: 'Information', icon: Info, color: 'text-blue-500' },
    { value: 'success', label: 'Success', icon: CheckCircle, color: 'text-emerald-500' },
    { value: 'warning', label: 'Warning', icon: AlertCircle, color: 'text-amber-500' },
    { value: 'alert', label: 'Alert', icon: Bell, color: 'text-red-500' }
  ]

  return (
    <AdminLayout title="Notifications">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8 text-violet-600 dark:text-violet-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Send Notifications</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Broadcast messages to your users
          </p>
        </div>

        {/* Result Message */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl flex items-center gap-3 ${
              result.success
                ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}
          >
            {result.success ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            )}
            <p className={result.success ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
              {result.message}
            </p>
          </motion.div>
        )}

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Notification Type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Notification Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {notificationTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      formData.type === type.value
                        ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <type.icon className={`w-6 h-6 ${type.color} mx-auto mb-1`} />
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{type.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Target Audience */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Target Audience
              </label>
              <select
                value={formData.target}
                onChange={(e) => setFormData(prev => ({ ...prev, target: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-800 dark:text-white"
              >
                <option value="all">All Users</option>
                <option value="active">Active Users Only</option>
                <option value="premium">Premium Users</option>
                <option value="free">Free Users</option>
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter notification title"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-800 dark:text-white placeholder:text-slate-400"
                required
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Enter notification message"
                rows={4}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-800 dark:text-white placeholder:text-slate-400 resize-none"
                required
              />
            </div>

            {/* Preview */}
            {(formData.title || formData.message) && (
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Preview</p>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    formData.type === 'info' ? 'bg-blue-100 dark:bg-blue-900/30' :
                    formData.type === 'success' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                    formData.type === 'warning' ? 'bg-amber-100 dark:bg-amber-900/30' :
                    'bg-red-100 dark:bg-red-900/30'
                  }`}>
                    {formData.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
                    {formData.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                    {formData.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-500" />}
                    {formData.type === 'alert' && <Bell className="w-5 h-5 text-red-500" />}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800 dark:text-white">{formData.title || 'Notification Title'}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{formData.message || 'Notification message will appear here...'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={sending || !canSend}
              className="w-full py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400"
            >
              {sending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Send Notification
                </>
              )}
            </Button>

            {!canSend && (
              <p className="text-sm text-center text-amber-600 dark:text-amber-400">
                You do not have permission to send notifications
              </p>
            )}
          </form>
        </motion.div>
      </div>
    </AdminLayout>
  )
}
