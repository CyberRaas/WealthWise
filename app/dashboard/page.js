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

  // Get dynamic greeting based on time and day
  const getGreeting = () => {
    const hour = new Date().getHours()
    const day = new Date().getDay()
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    
    let timeGreeting = ''
    if (hour < 12) timeGreeting = 'Good morning'
    else if (hour < 17) timeGreeting = 'Good afternoon'
    else timeGreeting = 'Good evening'
    
    const dayMessages = {
      0: 'Perfect Sunday to plan your finances!', // Sunday
      1: 'Let\'s start this Monday with smart money moves!', // Monday
      2: 'Tuesday motivation: Check your savings progress!', // Tuesday
      3: 'Midweek check-in: How are your expenses?', // Wednesday
      4: 'Thursday thoughts: Any investment opportunities?', // Thursday
      5: 'TGIF! Time to review your week\'s spending!', // Friday
      6: 'Saturday vibes: Plan your weekend budget!' // Saturday
    }
    
    return {
      greeting: `${timeGreeting}! ${dayMessages[day]}`,
      day: dayNames[day]
    }
  }

  const greetingData = getGreeting()

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
        {/* Welcome Message */}
        <div className="bg-gradient-to-r from-emerald-50 via-blue-50 to-purple-50 rounded-2xl p-6 border border-emerald-100">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
                Welcome back, {session?.user?.name || 'Friend'}! 👋
              </h1>
              <p className="text-slate-600 text-base sm:text-lg mb-3">
                {greetingData.greeting}
              </p>
              
              {/* Dynamic motivational message */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-emerald-700 font-medium bg-emerald-100 px-3 py-1 rounded-full">
                  💡 Your financial health score improved by 15% this month!
                </span>
              </div>
              
              <p className="text-sm text-slate-500">
                💪 Keep it up! You're on track to save ₹15 lakh this year.
              </p>
            </div>
            
            <div className="hidden sm:block ml-6">
              <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg animate-pulse-subtle">
                {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : '😊'}
              </div>
            </div>
          </div>
          
          {/* Quick stats row */}
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-emerald-200">
            <div className="text-center">
              <div className="text-lg font-bold text-emerald-600">₹1.26L</div>
              <div className="text-xs text-slate-600">Saved This Month</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">82%</div>
              <div className="text-xs text-slate-600">Budget On Track</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">4/5</div>
              <div className="text-xs text-slate-600">Goals Achieved</div>
            </div>
          </div>
        </div>
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

        {/* Financial Health Score & Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                Financial Health Score
              </CardTitle>
              <CardDescription>Your overall financial wellness this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center">
                  <div className="relative inline-flex items-center justify-center w-32 h-32 mx-auto mb-4">
                    <svg className="transform -rotate-90 w-32 h-32">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-slate-200"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - 0.78)}`}
                        className="text-emerald-500"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold text-slate-800">78</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Good Financial Health</h3>
                  <p className="text-slate-600">You're on track with your financial goals</p>
                </div>
                
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-lg font-bold text-emerald-600">+15%</div>
                    <div className="text-sm text-slate-600">vs Last Month</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">82%</div>
                    <div className="text-sm text-slate-600">Budget on Track</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">4</div>
                    <div className="text-sm text-slate-600">Active Goals</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-emerald-600" />
                This Month Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                  <div>
                    <div className="text-sm text-emerald-700">Total Income</div>
                    <div className="text-lg font-bold text-emerald-800">₹4,20,000</div>
                  </div>
                  <TrendingUp className="h-6 w-6 text-emerald-600" />
                </div>
                
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <div>
                    <div className="text-sm text-red-700">Total Expenses</div>
                    <div className="text-lg font-bold text-red-800">₹2,94,000</div>
                  </div>
                  <Wallet className="h-6 w-6 text-red-600" />
                </div>
                
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <div>
                    <div className="text-sm text-blue-700">Money Saved</div>
                    <div className="text-lg font-bold text-blue-800">₹1,26,000</div>
                  </div>
                  <PiggyBank className="h-6 w-6 text-blue-600" />
                </div>
                
                <div className="text-center pt-2 border-t">
                  <div className="text-xs text-slate-500">Savings Rate</div>
                  <div className="text-lg font-bold text-purple-600">30%</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest spending and income</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-xs">🍕</span>
                    </div>
                    <div>
                      <div className="font-medium text-sm">Domino's Pizza</div>
                      <div className="text-xs text-slate-500">Food • 2 hours ago</div>
                    </div>
                  </div>
                  <div className="text-red-600 font-medium">-₹480</div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs">🚗</span>
                    </div>
                    <div>
                      <div className="font-medium text-sm">Petrol Pump</div>
                      <div className="text-xs text-slate-500">Fuel • Yesterday</div>
                    </div>
                  </div>
                  <div className="text-red-600 font-medium">-₹3,200</div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-xs">🛒</span>
                    </div>
                    <div>
                      <div className="font-medium text-sm">BigBasket</div>
                      <div className="text-xs text-slate-500">Groceries • 2 days ago</div>
                    </div>
                  </div>
                  <div className="text-red-600 font-medium">-₹2,800</div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                      <span className="text-xs">💰</span>
                    </div>
                    <div>
                      <div className="font-medium text-sm">Salary Credited</div>
                      <div className="text-xs text-slate-500">Income • 5 days ago</div>
                    </div>
                  </div>
                  <div className="text-emerald-600 font-medium">+₹85,000</div>
                </div>
                
                <Button 
                  onClick={() => router.push('/dashboard/expenses')}
                  variant="outline" 
                  className="w-full mt-4"
                >
                  View All Transactions
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Smart Money Tips</CardTitle>
              <CardDescription>Personalized advice for your finances</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 rounded-lg border-l-4 border-emerald-500">
                  <div className="flex items-start gap-3">
                    <div className="text-emerald-600">✅</div>
                    <div>
                      <h4 className="font-medium text-emerald-800">Great Savings!</h4>
                      <p className="text-sm text-emerald-700 mt-1">
                        You're saving ₹1.26 lakhs this month. Keep up the excellent work with your emergency fund!
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-500">
                  <div className="flex items-start gap-3">
                    <div className="text-amber-600">⚠️</div>
                    <div>
                      <h4 className="font-medium text-amber-800">Food Budget Alert</h4>
                      <p className="text-sm text-amber-700 mt-1">
                        You've spent ₹18,000 of ₹20,000 food budget. Try cooking at home to save money.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <div className="flex items-start gap-3">
                    <div className="text-blue-600">💡</div>
                    <div>
                      <h4 className="font-medium text-blue-800">Investment Tip</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Consider SIP in mutual funds or invest in PPF for tax benefits and long-term growth.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl font-bold text-slate-800">Quick Actions</CardTitle>
            <CardDescription>Fast access to your most-used features</CardDescription>
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
                <span className="text-xs text-slate-500">Detailed budget view</span>
              </Button>

              <Button
                onClick={handleViewGoals}
                variant="outline"
                className="flex flex-col items-center p-4 sm:p-6 h-auto border-2 border-slate-200 hover:border-purple-300 hover:bg-purple-50 rounded-xl"
              >
                <Target className="h-6 w-6 sm:h-8 sm:w-8 mb-2 text-slate-600" />
                <span className="font-bold text-slate-700 text-sm sm:text-base">Goals</span>
                <span className="text-xs text-slate-500">Track progress</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Spending Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Monthly Spending
              </CardTitle>
              <CardDescription>Where your money goes each month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Food & Dining</span>
                  <span className="text-sm text-slate-600">₹28,000/month</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: '70%' }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Transportation</span>
                  <span className="text-sm text-slate-600">₹15,000/month</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '38%' }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Shopping</span>
                  <span className="text-sm text-slate-600">₹18,000/month</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Entertainment</span>
                  <span className="text-sm text-slate-600">₹8,000/month</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '20%' }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Bills & Utilities</span>
                  <span className="text-sm text-slate-600">₹12,000/month</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                Savings Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-emerald-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-sm text-emerald-800">Emergency Fund</span>
                    <span className="text-xs text-emerald-600">85%</span>
                  </div>
                  <div className="w-full bg-emerald-200 rounded-full h-2">
                    <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  <div className="text-xs text-emerald-700 mt-1">₹8.5 lakh / ₹10 lakh</div>
                </div>
                
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-sm text-blue-800">Home Down Payment</span>
                    <span className="text-xs text-blue-600">40%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '40%' }}></div>
                  </div>
                  <div className="text-xs text-blue-700 mt-1">₹8 lakh / ₹20 lakh</div>
                </div>
                
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-sm text-purple-800">Vacation Fund</span>
                    <span className="text-xs text-purple-600">60%</span>
                  </div>
                  <div className="w-full bg-purple-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                  <div className="text-xs text-purple-700 mt-1">₹1.8 lakh / ₹3 lakh</div>
                </div>
                
                <div className="p-3 bg-orange-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-sm text-orange-800">New Bike</span>
                    <span className="text-xs text-orange-600">25%</span>
                  </div>
                  <div className="w-full bg-orange-200 rounded-full h-2">
                    <div className="bg-orange-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                  <div className="text-xs text-orange-700 mt-1">₹37,500 / ₹1.5 lakh</div>
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
