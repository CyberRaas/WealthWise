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
  ArrowRight,
  DollarSign,
  BarChart3
} from 'lucide-react'
import toast from 'react-hot-toast'

function DashboardContent() {
  const { data: session } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalBalance: 12459,
    monthlySpent: 3240,
    savings: 8520,
    goalProgress: 67
  })

  // Quick action handlers
  const handleVoiceEntry = () => {
    router.push('/dashboard/expenses?mode=voice')
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
        <div className="text-center">
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
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-emerald-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">Total Balance</CardTitle>
                <DollarSign className="h-5 w-5 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">${stats.totalBalance.toLocaleString()}</div>
              <p className="text-xs text-emerald-600">+4.75% from last month</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">Monthly Spent</CardTitle>
                <Wallet className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">${stats.monthlySpent.toLocaleString()}</div>
              <p className="text-xs text-blue-600">-2.1% from last month</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-teal-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">Savings</CardTitle>
                <PiggyBank className="h-5 w-5 text-teal-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">${stats.savings.toLocaleString()}</div>
              <p className="text-xs text-teal-600">+12.5% this month</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">Goal Progress</CardTitle>
                <Target className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">{stats.goalProgress}%</div>
              <p className="text-xs text-purple-600">+5.4% this month</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-800">Quick Actions</CardTitle>
            <CardDescription>Get started with your financial planning journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                onClick={handleVoiceEntry}
                className="flex flex-col items-center p-6 h-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl"
              >
                <Mic className="h-8 w-8 mb-2" />
                <span className="font-bold">Voice Entry</span>
                <span className="text-xs opacity-90">Add expenses by voice</span>
              </Button>

              <Button
                onClick={handleAddExpense}
                variant="outline"
                className="flex flex-col items-center p-6 h-auto border-2 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 rounded-xl"
              >
                <Plus className="h-8 w-8 mb-2 text-slate-600" />
                <span className="font-bold text-slate-700">Add Expense</span>
                <span className="text-xs text-slate-500">Manual entry</span>
              </Button>

              <Button
                onClick={handleViewBudget}
                variant="outline"
                className="flex flex-col items-center p-6 h-auto border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 rounded-xl"
              >
                <BarChart3 className="h-8 w-8 mb-2 text-slate-600" />
                <span className="font-bold text-slate-700">View Budget</span>
                <span className="text-xs text-slate-500">Budget overview</span>
              </Button>

              <Button
                onClick={handleViewGoals}
                variant="outline"
                className="flex flex-col items-center p-6 h-auto border-2 border-slate-200 hover:border-purple-300 hover:bg-purple-50 rounded-xl"
              >
                <Target className="h-8 w-8 mb-2 text-slate-600" />
                <span className="font-bold text-slate-700">Goals</span>
                <span className="text-xs text-slate-500">Financial goals</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-800">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-sm font-medium text-slate-700">Salary credited</span>
                  </div>
                  <span className="text-emerald-600 font-bold">+$3,500</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm font-medium text-slate-700">Groceries</span>
                  </div>
                  <span className="text-red-600 font-bold">-$120</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-slate-700">Rent payment</span>
                  </div>
                  <span className="text-red-600 font-bold">-$1,200</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-800">Budget Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">Food & Dining</span>
                    <span className="font-medium">$320 / $500</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '64%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">Transportation</span>
                    <span className="font-medium">$180 / $300</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">Entertainment</span>
                    <span className="font-medium">$90 / $200</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
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
