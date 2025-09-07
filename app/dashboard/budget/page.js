'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import DashboardLayout from '@/components/layout/DashboardLayout'
import OnboardingGuard from '@/components/OnboardingGuard'
import LanguageSelector from '@/components/ui/LanguageSelector'
import BudgetDisplay from '@/components/dashboard/BudgetDisplay'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  PieChart,
  RefreshCw,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

function BudgetContent() {
  const { t } = useTranslation()
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  
  const handleRefreshBudget = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <DashboardLayout title={t('budget.title')}>
      <div className="space-y-6">
        {/* Budget Overview */}
        {/* <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Budget Overview</h2>
            <p className="text-slate-600">Monitor your spending and stay on track</p>
          </div>
          <Button 
            onClick={handleRefreshBudget}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div> */}

        {/* Budget Display Component */}
        <BudgetDisplay key={refreshTrigger} refreshTrigger={refreshTrigger} />

        {/* Budget Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              Budget Tips & Insights
            </CardTitle>
            <CardDescription>
              Smart recommendations to improve your financial health
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-emerald-800">Great job on savings!</h4>
                  <p className="text-sm text-emerald-700">You&apos;re 12% ahead of your savings goal this month.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800">Watch your dining expenses</h4>
                  <p className="text-sm text-amber-700">You&apos;ve spent 80% of your food budget. Consider cooking more meals at home.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800">Investment opportunity</h4>
                  <p className="text-sm text-blue-700">You have extra savings. Consider investing in a diversified portfolio.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default function BudgetPage() {
  return (
    <OnboardingGuard>
      <BudgetContent />
    </OnboardingGuard>
  )
}
