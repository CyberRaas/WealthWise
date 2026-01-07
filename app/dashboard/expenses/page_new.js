'use client'

import { useState } from 'react'
import { useTranslation } from '@/lib/i18n'
import DashboardLayout from '@/components/layout/DashboardLayout'
import OnboardingGuard from '@/components/OnboardingGuard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Wallet, Users } from 'lucide-react'

// Import existing expense component (to be wrapped)
import ExpensesContent from '@/components/expenses/ExpensesContent'

// Import new split expenses component
import SplitExpensesContent from '@/components/split/SplitExpensesContent'

function ExpensesPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('personal')

  return (
    <DashboardLayout>
      <OnboardingGuard>
        <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                {t('expenses.title', 'Expenses')}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {t('expenses.subtitle', 'Track and manage all your expenses')}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-slate-100 dark:bg-slate-800 p-1">
              <TabsTrigger 
                value="personal" 
                className="gap-2 data-[state=active]:bg-white data-[state=active]:text-emerald-600 dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-emerald-400"
              >
                <Wallet className="h-4 w-4" />
                <span>Personal Expenses</span>
              </TabsTrigger>
              <TabsTrigger 
                value="split" 
                className="gap-2 data-[state=active]:bg-white data-[state=active]:text-emerald-600 dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-emerald-400"
              >
                <Users className="h-4 w-4" />
                <span>Split Expenses</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4 mt-6">
              <ExpensesContent />
            </TabsContent>

            <TabsContent value="split" className="space-y-4 mt-6">
              <SplitExpensesContent />
            </TabsContent>
          </Tabs>
        </div>
      </OnboardingGuard>
    </DashboardLayout>
  )
}

export default ExpensesPage
