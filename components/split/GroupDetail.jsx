'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Plus,
  Users,
  Receipt,
  HandCoins,
  Settings,
  TrendingUp,
  TrendingDown,
  IndianRupee,
  MoreVertical,
  ChevronRight,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import AddExpenseModal from './AddExpenseModal'
import SettleUpModal from './SettleUpModal'

export default function GroupDetail({ group, onBack }) {
  const [groupData, setGroupData] = useState(group)
  const [expenses, setExpenses] = useState([])
  const [settlements, setSettlements] = useState([])
  const [simplifiedDebts, setSimplifiedDebts] = useState([])
  const [balances, setBalances] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [showSettleUp, setShowSettleUp] = useState(false)
  const [activeTab, setActiveTab] = useState('expenses')

  useEffect(() => {
    fetchGroupDetails()
  }, [group._id])

  const fetchGroupDetails = async () => {
    try {
      const [groupRes, settlementsRes] = await Promise.all([
        fetch(`/api/split/groups/${group._id}`),
        fetch(`/api/split/settlements?groupId=${group._id}&simplified=true`)
      ])

      const groupData = await groupRes.json()
      const settlementsData = await settlementsRes.json()

      if (groupData.success) {
        setGroupData(groupData.group)
        setExpenses(groupData.recentExpenses || [])
      }

      if (settlementsData.success) {
        setSettlements(settlementsData.settlements || [])
        setSimplifiedDebts(settlementsData.simplifiedDebts || [])
        setBalances(settlementsData.balances || [])
      }
    } catch (error) {
      console.error('Failed to fetch group details:', error)
      toast.error('Failed to load group details')
    } finally {
      setLoading(false)
    }
  }

  const handleExpenseAdded = (expense) => {
    setExpenses(prev => [expense, ...prev])
    setShowAddExpense(false)
    fetchGroupDetails() // Refresh balances
    toast.success('Expense added!')
  }

  const handleSettlementRecorded = () => {
    setShowSettleUp(false)
    fetchGroupDetails()
    toast.success('Settlement recorded!')
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(Math.abs(amount))
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short'
    })
  }

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-24 bg-muted animate-pulse rounded-lg" />
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">{groupData.name}</h2>
          <p className="text-muted-foreground">
            {groupData.members?.length} members • {groupData.stats?.expenseCount || 0} expenses
          </p>
        </div>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      {/* Balance Summary */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-2xl font-bold">
                {formatCurrency(groupData.stats?.totalExpenses || 0)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Your Balance</p>
              <p className={`text-2xl font-bold ${
                groupData.userBalance > 0 ? 'text-green-600' : 
                groupData.userBalance < 0 ? 'text-red-600' : ''
              }`}>
                {groupData.userBalance > 0 ? '+' : ''}{formatCurrency(groupData.userBalance || 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Simplified Debts */}
      {simplifiedDebts.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <HandCoins className="h-5 w-5" />
              Settle Up
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {simplifiedDebts.map((debt, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={debt.from?.avatar} />
                      <AvatarFallback>{getInitials(debt.from?.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{debt.from?.name}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{debt.to?.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-red-600">
                      {formatCurrency(debt.amount)}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                      onClick={() => setShowSettleUp(true)}
                    >
                      Settle
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="expenses" className="gap-2">
            <Receipt className="h-4 w-4" />
            Expenses
          </TabsTrigger>
          <TabsTrigger value="balances" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Balances
          </TabsTrigger>
          <TabsTrigger value="members" className="gap-2">
            <Users className="h-4 w-4" />
            Members
          </TabsTrigger>
        </TabsList>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white">Recent Expenses</h3>
            <Button size="sm" onClick={() => setShowAddExpense(true)} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
              <Plus className="h-4 w-4" />
              Add Expense
            </Button>
          </div>

          {expenses.length === 0 ? (
            <Card className="text-center py-8">
              <CardContent>
                <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No expenses yet</p>
                <Button
                  className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => setShowAddExpense(true)}
                >
                  Add First Expense
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {expenses.map((expense, index) => (
                  <motion.div
                    key={expense._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Receipt className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{expense.description}</p>
                            <p className="text-sm text-muted-foreground">
                              Paid by {expense.paidBy?.name} • {formatDate(expense.date)}
                            </p>
                          </div>
                          <p className="font-semibold">
                            {formatCurrency(expense.amount)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>

        {/* Balances Tab */}
        <TabsContent value="balances" className="mt-4">
          <div className="space-y-3">
            {balances.map((balance, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={balance.user?.avatar} />
                      <AvatarFallback>{getInitials(balance.user?.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{balance.user?.name}</p>
                      <p className="text-sm text-muted-foreground">{balance.user?.email}</p>
                    </div>
                    <div className={`text-right ${
                      balance.balance > 0 ? 'text-green-600' :
                      balance.balance < 0 ? 'text-red-600' : ''
                    }`}>
                      <div className="flex items-center gap-1">
                        {balance.balance > 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : balance.balance < 0 ? (
                          <TrendingDown className="h-4 w-4" />
                        ) : null}
                        <span className="font-semibold">
                          {balance.balance > 0 ? '+' : ''}{formatCurrency(balance.balance)}
                        </span>
                      </div>
                      <p className="text-xs">
                        {balance.balance > 0 ? 'gets back' : 
                         balance.balance < 0 ? 'owes' : 'settled'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="mt-4">
          <div className="space-y-3">
            {groupData.members?.map((member, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={member.user?.avatar} />
                      <AvatarFallback>
                        {getInitials(member.user?.name || member.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {member.user?.name || member.email}
                        </p>
                        {member.role === 'admin' && (
                          <Badge variant="secondary">Admin</Badge>
                        )}
                        {member.status === 'pending' && (
                          <Badge variant="outline">Pending</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {member.user?.email || 'Invitation sent'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={showAddExpense}
        onClose={() => setShowAddExpense(false)}
        group={groupData}
        onExpenseAdded={handleExpenseAdded}
      />

      {/* Settle Up Modal */}
      <SettleUpModal
        isOpen={showSettleUp}
        onClose={() => setShowSettleUp(false)}
        group={groupData}
        simplifiedDebts={simplifiedDebts}
        onSettlementRecorded={handleSettlementRecorded}
      />
    </div>
  )
}
