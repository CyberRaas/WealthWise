'use client'

import { useState, useEffect } from 'react'
import { useAdmin } from '@/contexts/AdminContext'
import AdminLayout from '@/components/admin/layout/AdminLayout'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  Settings,
  Shield,
  Bell,
  Sliders,
  ToggleLeft,
  ToggleRight,
  Save,
  RefreshCw,
  AlertTriangle,
  Check,
  Lock
} from 'lucide-react'

export default function AdminSettingsPage() {
  const { hasPermission, isSuperAdmin } = useAdmin()
  const [configs, setConfigs] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [changes, setChanges] = useState({})

  const canEdit = hasPermission('config:write')

  useEffect(() => {
    fetchConfigs()
  }, [])

  const fetchConfigs = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/config')
      const data = await response.json()

      if (data.success) {
        setConfigs(data.data?.configs || {})
      } else {
        setError(data.error || 'Failed to fetch configurations')
      }
    } catch (err) {
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (key, value) => {
    setChanges(prev => ({ ...prev, [key]: value }))
    setSuccess(null)
  }

  const handleSave = async () => {
    if (Object.keys(changes).length === 0) return

    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      const updates = Object.entries(changes).map(([key, value]) => ({ key, value }))

      const response = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates })
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(`Updated ${data.data.successCount} configuration(s)`)
        setChanges({})
        fetchConfigs()
      } else {
        setError(data.error || 'Failed to update configurations')
      }
    } catch (err) {
      setError('Failed to connect to server')
    } finally {
      setSaving(false)
    }
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'security': return Shield
      case 'notifications': return Bell
      case 'features': return Sliders
      case 'maintenance': return AlertTriangle
      default: return Settings
    }
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case 'security': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30'
      case 'notifications': return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30'
      case 'features': return 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30'
      case 'maintenance': return 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30'
      default: return 'text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/30'
    }
  }

  const getValue = (config) => {
    const key = config.key
    return changes.hasOwnProperty(key) ? changes[key] : config.value
  }

  if (loading) {
    return (
      <AdminLayout title="Settings">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 text-violet-500 animate-spin" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Settings">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white">System Configuration</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Manage application settings and feature flags</p>
          </div>

          {Object.keys(changes).length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-amber-600 dark:text-amber-400">
                {Object.keys(changes).length} unsaved change(s)
              </span>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="gap-2 bg-violet-600 hover:bg-violet-700"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </Button>
            </div>
          )}
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 flex items-center gap-3">
            <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <p className="text-emerald-600 dark:text-emerald-400">{success}</p>
          </div>
        )}

        {/* Config Categories */}
        {Object.entries(configs).map(([category, categoryConfigs]) => {
          const Icon = getCategoryIcon(category)
          const colorClass = getCategoryColor(category)

          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              {/* Category Header */}
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-white capitalize">{category}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{categoryConfigs.length} settings</p>
                  </div>
                </div>
              </div>

              {/* Config Items */}
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {categoryConfigs.map((config) => (
                  <div key={config.key} className="px-6 py-4 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-800 dark:text-white">{config.key}</p>
                        {config.isSecret && (
                          <Lock className="w-3 h-3 text-slate-400" />
                        )}
                        {!config.isEditable && (
                          <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded">
                            Read only
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{config.description}</p>
                    </div>

                    <div className="flex-shrink-0">
                      {config.dataType === 'boolean' ? (
                        <button
                          onClick={() => config.isEditable && canEdit && handleChange(config.key, !getValue(config))}
                          disabled={!config.isEditable || !canEdit}
                          className={`w-12 h-7 rounded-full transition-colors relative ${
                            getValue(config)
                              ? 'bg-violet-500'
                              : 'bg-slate-300 dark:bg-slate-600'
                          } ${(!config.isEditable || !canEdit) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <div
                            className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                              getValue(config) ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      ) : config.dataType === 'number' ? (
                        <input
                          type="number"
                          value={getValue(config)}
                          onChange={(e) => handleChange(config.key, parseFloat(e.target.value))}
                          disabled={!config.isEditable || !canEdit}
                          min={config.validation?.min}
                          max={config.validation?.max}
                          className="w-24 px-3 py-1.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white text-right disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      ) : config.isSecret ? (
                        <span className="text-slate-400 dark:text-slate-500">***</span>
                      ) : (
                        <input
                          type="text"
                          value={getValue(config)}
                          onChange={(e) => handleChange(config.key, e.target.value)}
                          disabled={!config.isEditable || !canEdit}
                          className="w-48 px-3 py-1.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )
        })}

        {/* No configs message */}
        {Object.keys(configs).length === 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700 text-center">
            <Settings className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">No configurations found</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
              System configurations will appear here once they are initialized
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
