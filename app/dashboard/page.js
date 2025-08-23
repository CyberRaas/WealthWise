// app/dashboard/page.js
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import OnboardingGuard from '@/components/OnboardingGuard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  Wallet,
  Target,
  PiggyBank,
  Plus,
  Mic,
  BarChart3,
  DollarSign
} from 'lucide-react'
import toast from 'react-hot-toast'
import BudgetDisplay from '@/components/dashboard/BudgetDisplay'
import ExpenseEntryModal from '@/components/expenses/ExpenseEntryModal'

function DashboardContent() {
  const { data: session } = useSession()
  const router = useRouter()
  const [showExpenseEntry, setShowExpenseEntry] = useState(false)
  const [refreshBudget, setRefreshBudget] = useState(0)
  const [expenses, setExpenses] = useState([])

  // Handle expense added
  const handleExpenseAdded = (expense) => {
    console.log('Expense added:', expense)
    toast.success('Expense added successfully!')
    setExpenses(prev => [expense, ...prev])
    setRefreshBudget(prev => prev + 1)
    setShowExpenseEntry(false)
  }

  // Quick action handlers
  const handleVoiceEntry = () => {
    setShowExpenseEntry(true)
  }

  const handleAddExpense = () => {
    router.push('/dashboard/expenses?mode=manual')
  }

  const handleViewBudget = () => {
    router.push('/dashboard/budget')
  }

  const handleViewGoals = () => {
    router.push('/dashboard/goals')
  }

  return (
    <DashboardLayout title="Dashboard Overview">
      <div className="space-y-8">
        {/* Welcome Section */}
        {/* <div className="text-center">
          <div className="inline-flex items-center space-x-2 bg-emerald-100 rounded-full px-4 py-2 mb-4">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span className="text-emerald-700 font-medium text-sm">Financial Command Center</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">
            Welcome back! 👋
          </h2>
          <p className="text-slate-600 text-lg">
            Ready to manage your finances with ease?
          </p>
        </div> */}

        {/* Budget Display - Real User Data */}
        <div className="mb-8">
          <BudgetDisplay key={refreshBudget} refreshTrigger={refreshBudget} />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl font-bold text-slate-800">Quick Actions</CardTitle>
            <CardDescription>Get started with your financial planning journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Button
                onClick={handleVoiceEntry}
                className="flex flex-col items-center p-4 sm:p-6 h-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl"
              >
                <Mic className="h-6 w-6 sm:h-8 sm:w-8 mb-2" />
                <span className="font-bold text-sm sm:text-base">Voice Entry</span>
                <span className="text-xs opacity-90">Add expenses by voice</span>
              </Button>

              <Button
                onClick={handleAddExpense}
                variant="outline"
                className="flex flex-col items-center p-4 sm:p-6 h-auto border-2 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 rounded-xl"
              >
                <Plus className="h-6 w-6 sm:h-8 sm:w-8 mb-2 text-slate-600" />
                <span className="font-bold text-slate-700 text-sm sm:text-base">Add Expense</span>
                <span className="text-xs text-slate-500">Manual entry</span>
              </Button>

              <Button
                onClick={handleViewBudget}
                variant="outline"
                className="flex flex-col items-center p-4 sm:p-6 h-auto border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 rounded-xl"
              >
                <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 mb-2 text-slate-600" />
                <span className="font-bold text-slate-700 text-sm sm:text-base">View Budget</span>
                <span className="text-xs text-slate-500">Budget overview</span>
              </Button>

              <Button
                onClick={handleViewGoals}
                variant="outline"
                className="flex flex-col items-center p-4 sm:p-6 h-auto border-2 border-slate-200 hover:border-purple-300 hover:bg-purple-50 rounded-xl"
              >
                <Target className="h-6 w-6 sm:h-8 sm:w-8 mb-2 text-slate-600" />
                <span className="font-bold text-slate-700 text-sm sm:text-base">Goals</span>
                <span className="text-xs text-slate-500">Financial goals</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Real Data Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-800">Quick Access</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  onClick={() => router.push('/dashboard/expenses')}
                  variant="outline"
                  className="w-full justify-start text-left p-3 sm:p-4"
                >
                  <Wallet className="h-4 w-4 mr-3 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-sm sm:text-base">Manage Expenses</div>
                    <div className="text-xs sm:text-sm text-slate-500">View and add expenses</div>
                  </div>
                </Button>
                <Button
                  onClick={() => router.push('/dashboard/goals')}
                  variant="outline"
                  className="w-full justify-start text-left"
                >
                  <Target className="h-4 w-4 mr-3" />
                  <div>
                    <div className="font-medium">Financial Goals</div>
                    <div className="text-sm text-slate-500">Track your savings goals</div>
                  </div>
                </Button>
                <Button
                  onClick={() => router.push('/dashboard/analytics')}
                  variant="outline"
                  className="w-full justify-start text-left"
                >
                  <BarChart3 className="h-4 w-4 mr-3" />
                  <div>
                    <div className="font-medium">Analytics</div>
                    <div className="text-sm text-slate-500">View spending insights</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-800">Getting Started</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-emerald-50 rounded-lg p-4">
                  <h4 className="font-medium text-emerald-900 mb-2">💡 Start Your Journey</h4>
                  <p className="text-sm text-emerald-700 mb-3">
                    Set up your first budget and start tracking expenses to get personalized insights.
                  </p>
                  <Button
                    onClick={handleViewBudget}
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Set Up Budget
                  </Button>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">🎯 Create Goals</h4>
                  <p className="text-sm text-blue-700 mb-3">
                    Define your financial goals and track progress automatically.
                  </p>
                  <Button
                    onClick={handleViewGoals}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Create Goal
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Expense Entry Modal */}
      <ExpenseEntryModal
        isOpen={showExpenseEntry}
        onClose={() => setShowExpenseEntry(false)}
        onExpenseAdded={handleExpenseAdded}
      />
    </DashboardLayout>
  )
}

export default function DashboardPage() {
  return (
    <OnboardingGuard>
      <DashboardContent />
    </OnboardingGuard>
  )
}
