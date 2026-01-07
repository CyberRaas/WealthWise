'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Plus,
  ChevronRight,
  Home,
  Plane,
  Heart,
  Calendar,
  Briefcase,
  MoreHorizontal,
  IndianRupee,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import toast from 'react-hot-toast'
import CreateGroupModal from './CreateGroupModal'

const GROUP_TYPE_ICONS = {
  trip: Plane,
  home: Home,
  couple: Heart,
  event: Calendar,
  project: Briefcase,
  other: Users
}

const GROUP_TYPE_COLORS = {
  trip: 'bg-blue-500',
  home: 'bg-green-500',
  couple: 'bg-pink-500',
  event: 'bg-purple-500',
  project: 'bg-orange-500',
  other: 'bg-gray-500'
}

export default function GroupList({ onSelectGroup }) {
  const { t } = useTranslation()
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    fetchGroups()
  }, [])

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/split/groups')
      const data = await response.json()

      if (data.success) {
        setGroups(data.groups || [])
      }
    } catch (error) {
      console.error('Failed to fetch groups:', error)
      toast.error('Failed to load groups')
    } finally {
      setLoading(false)
    }
  }

  const handleGroupCreated = (newGroup) => {
    setGroups(prev => [newGroup, ...prev])
    setShowCreateModal(false)
    toast.success('Group created successfully!')
  }

  const formatBalance = (balance) => {
    const absBalance = Math.abs(balance)
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(absBalance)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Split Expenses</h2>
          <p className="text-muted-foreground">Manage shared expenses with friends & family</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Group
        </Button>
      </div>

      {/* Groups List */}
      {groups.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No groups yet</h3>
            <p className="text-muted-foreground mb-4">
              Create a group to start splitting expenses with friends and family
            </p>
            <Button onClick={() => setShowCreateModal(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Group
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          <AnimatePresence>
            {groups.map((group, index) => {
              const IconComponent = GROUP_TYPE_ICONS[group.type] || Users
              const colorClass = GROUP_TYPE_COLORS[group.type] || 'bg-gray-500'
              
              return (
                <motion.div
                  key={group._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card 
                    className="cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => onSelectGroup?.(group)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Group Icon */}
                        <div className={`w-12 h-12 rounded-full ${colorClass} flex items-center justify-center`}>
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>

                        {/* Group Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold truncate">{group.name}</h3>
                            <Badge variant={group.status === 'active' ? 'default' : 'secondary'}>
                              {group.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {group.memberCount} member{group.memberCount !== 1 ? 's' : ''}
                            {group.stats?.expenseCount > 0 && (
                              <> • {group.stats.expenseCount} expense{group.stats.expenseCount !== 1 ? 's' : ''}</>
                            )}
                          </p>
                        </div>

                        {/* Balance */}
                        <div className="text-right">
                          {group.userBalance !== 0 ? (
                            <div className={`flex items-center gap-1 ${
                              group.userBalance > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {group.userBalance > 0 ? (
                                <>
                                  <TrendingUp className="h-4 w-4" />
                                  <span className="font-semibold">
                                    {formatBalance(group.userBalance)}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <TrendingDown className="h-4 w-4" />
                                  <span className="font-semibold">
                                    {formatBalance(group.userBalance)}
                                  </span>
                                </>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">Settled</span>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {group.userBalance > 0 ? 'you get back' : group.userBalance < 0 ? 'you owe' : ''}
                          </p>
                        </div>

                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Overall Summary */}
      {groups.length > 0 && (
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overall Balance</p>
                <div className="flex items-center gap-2">
                  <IndianRupee className="h-5 w-5" />
                  <span className="text-2xl font-bold">
                    {formatBalance(
                      groups.reduce((sum, g) => sum + (g.userBalance || 0), 0)
                    )}
                  </span>
                </div>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <p>{groups.length} group{groups.length !== 1 ? 's' : ''}</p>
                <p>{groups.filter(g => g.userBalance !== 0).length} with pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onGroupCreated={handleGroupCreated}
      />
    </div>
  )
}
