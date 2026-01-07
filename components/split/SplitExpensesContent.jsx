'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  Plus,
  TrendingUp,
  TrendingDown,
  Receipt,
  Loader2,
  ArrowRight
} from 'lucide-react'
import toast from 'react-hot-toast'
import CreateGroupModal from './CreateGroupModal'
import GroupDetail from './GroupDetail'

export default function SplitExpensesContent() {
  const { t } = useTranslation()
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState(null)

  useEffect(() => {
    fetchGroups()
  }, [])

  const fetchGroups = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/split/groups')
      const data = await response.json()
      
      if (data.success) {
        setGroups(data.groups || [])
      } else {
        toast.error(data.error || 'Failed to fetch groups')
      }
    } catch (error) {
      console.error('Error fetching groups:', error)
      toast.error('Failed to fetch groups')
    } finally {
      setLoading(false)
    }
  }

  const handleGroupCreated = (newGroup) => {
    setGroups(prev => [newGroup, ...prev])
    setShowCreateModal(false)
    toast.success('Group created successfully!')
  }

  const handleGroupClick = (group) => {
    setSelectedGroup(group)
  }

  const handleBackToList = () => {
    setSelectedGroup(null)
    fetchGroups() // Refresh to get updated balances
  }

  // Show group detail if one is selected
  if (selectedGroup) {
    return (
      <GroupDetail 
        group={selectedGroup} 
        onBack={handleBackToList}
        onUpdate={fetchGroups}
      />
    )
  }

  // Calculate stats
  const activeGroups = groups.filter(g => g.status !== 'archived')
  const totalOwed = groups.reduce((sum, g) => 
    g.userBalance > 0 ? sum + g.userBalance : sum, 0
  )
  const totalOwe = groups.reduce((sum, g) => 
    g.userBalance < 0 ? sum + Math.abs(g.userBalance) : sum, 0
  )

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200 dark:border-slate-700">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">
                  {t('split.activeGroups', 'Active Groups')}
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {loading ? '-' : activeGroups.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/40 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">
                  {t('split.youAreOwed', 'You are owed')}
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {loading ? '-' : `₹${totalOwed.toLocaleString('en-IN')}`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/40 flex items-center justify-center flex-shrink-0">
                <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">
                  {t('split.youOwe', 'You owe')}
                </p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {loading ? '-' : `₹${totalOwe.toLocaleString('en-IN')}`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {t('split.groups', 'Your Groups')}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {t('split.groupsDesc', 'Manage shared expenses with friends and family')}
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">{t('split.newGroup', 'New Group')}</span>
          <span className="sm:hidden">New</span>
        </Button>
      </div>

      {/* Groups List */}
      {loading ? (
        <Card className="border-slate-200 dark:border-slate-700">
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 text-emerald-500 animate-spin mb-4" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t('common.loading', 'Loading...')}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : groups.length === 0 ? (
        <Card className="border-2 border-dashed border-slate-300 dark:border-slate-700">
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-slate-400 dark:text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                {t('split.noGroups', 'No groups yet')}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-sm">
                {t('split.noGroupsDesc', 'Create your first group to start splitting expenses with friends and family')}
              </p>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('split.createFirstGroup', 'Create First Group')}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => {
            const balance = group.userBalance || 0
            const isOwed = balance > 0
            const owes = balance < 0

            return (
              <Card
                key={group._id}
                className="border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => handleGroupClick(group)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white truncate">
                        {group.name}
                      </CardTitle>
                      {group.description && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {group.description}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant="secondary"
                      className="ml-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 flex-shrink-0"
                    >
                      {group.memberCount} {group.memberCount === 1 ? 'member' : 'members'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Balance */}
                    {balance === 0 ? (
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <Receipt className="h-4 w-4" />
                        <span className="text-sm">{t('split.settled', 'All settled up')}</span>
                      </div>
                    ) : isOwed ? (
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {t('split.youGetBack', 'You get back')} ₹{Math.abs(balance).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                        <TrendingDown className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {t('split.youOwe', 'You owe')} ₹{Math.abs(balance).toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}

                    {/* Group Stats */}
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>
                        {group.stats?.expenseCount || 0} {t('split.expenses', 'expenses')}
                      </span>
                      <span>
                        ₹{(group.stats?.totalExpenses || 0).toLocaleString('en-IN')} {t('split.total', 'total')}
                      </span>
                    </div>

                    {/* View Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/30 group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
                    >
                      {t('split.viewDetails', 'View Details')}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
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
