'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import DashboardLayout from '@/components/layout/DashboardLayout'
import OnboardingGuard from '@/components/OnboardingGuard'
import LanguageSelector from '@/components/ui/LanguageSelector'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import ExpenseEntryModal from '@/components/expenses/ExpenseEntryModal'
import {
  Wallet,
  Plus,
  Search,
  Filter,
  Calendar,
  Download,
  IndianRupee,
  Mic
} from 'lucide-react'
import toast from 'react-hot-toast'

function ExpensesContent() {
  const { t } = useTranslation()
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [showVoiceEntry, setShowVoiceEntry] = useState(false)
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  })
  const [submitting, setSubmitting] = useState(false)

  const categories = ['Food & Dining', 'Transportation', 'Housing', 'Entertainment', 'Healthcare', 'Shopping', 'Utilities', 'Other']

  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    try {
      const response = await fetch('/api/expenses')
      const data = await response.json()

      if (data.success) {
        setExpenses(data.expenses || [])
      }
    } catch (error) {
      console.error('Failed to fetch expenses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExpenseAdded = (expense) => {
    console.log('Expense added:', expense)
    setExpenses(prev => [expense, ...prev])
    toast.success('Expense added successfully!')
    setShowVoiceEntry(false)
    setShowForm(false)
  }
  const handleFormSubmit = async (e) => {
    e.preventDefault()

    if (!formData.amount || !formData.category) {
      toast.error('Please fill in all required fields')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          entryMethod: 'manual'
        })
      })

      const data = await response.json()

      if (data.success) {
        handleExpenseAdded(data.expense)
        setFormData({
          amount: '',
          category: '',
          description: '',
          date: new Date().toISOString().split('T')[0]
        })
      } else {
        toast.error(data.error || 'Failed to add expense')
      }
    } catch (error) {
      toast.error('Failed to add expense')
      console.error('Add expense error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || expense.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
  const thisMonthExpenses = expenses.filter(e => {
    const expenseMonth = new Date(e.date).toISOString().substring(0, 7)
    const currentMonth = new Date().toISOString().substring(0, 7)
    return expenseMonth === currentMonth
  }).reduce((sum, e) => sum + e.amount, 0)

  const handleExport = async () => {
    if (expenses.length === 0) {
      toast.error('No expenses to export')
      return
    }
    try {
      const xlsx = await import('xlsx')
      // Prepare data rows
      const rows = expenses.map(e => ({
        ID: e.id,
        Date: e.date,
        Timestamp: e.timestamp ? new Date(e.timestamp).toLocaleString('en-IN') : '',
        Category: e.category,
        Amount: e.amount,
        Description: e.description || '',
        Merchant: e.merchant || '',
        Method: e.entryMethod || '',
        OriginalVoiceText: e.originalText || '',
        Confidence: e.confidence != null ? e.confidence : ''
      }))
      const ws = xlsx.utils.json_to_sheet(rows)
      // Auto width
      const colWidths = Object.keys(rows[0]).map(key => ({ wch: Math.min(40, Math.max(key.length, ...rows.map(r => String(r[key]).length)) + 2) }))
      ws['!cols'] = colWidths
      const wb = xlsx.utils.book_new()
      xlsx.utils.book_append_sheet(wb, ws, 'Expenses')
      const wbout = xlsx.write(wb, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const dateStr = new Date().toISOString().split('T')[0]
      a.href = url
      a.download = `expenses_${dateStr}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Exported expenses to Excel')
    } catch (err) {
      console.error('Export failed', err)
      toast.error('Export failed')
    }
  }

  return (
    <DashboardLayout title={t('expenses.title')}>
      <div className="space-y-4 sm:space-y-6">
        {/* Summary Cards - Real Data */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">{t('expenses.thisMonth')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-red-600">
                {loading ? '...' : `₹${thisMonthExpenses.toLocaleString('en-IN')}`}
              </div>
              <p className="text-xs text-slate-500">{t('expenses.monthlyExpenses')}</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">{t('expenses.total')} {t('expenses.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-blue-600">
                {loading ? '...' : `₹${totalExpenses.toLocaleString('en-IN')}`}
              </div>
              <p className="text-xs text-slate-500">{t('common.allTime')}</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-500 sm:col-span-2 lg:col-span-1">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">{t('common.transactions')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-emerald-600">{loading ? '...' : expenses.length}
              </div>
              <p className="text-xs text-slate-500">{t('common.totalEntries')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Add Expense Form */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <CardTitle className="text-lg sm:text-xl font-bold text-slate-800">{t('expenses.addNewExpense')}</CardTitle>
                <CardDescription>{t('expenses.subtitle')}</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={() => setShowVoiceEntry(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
                >
                  <Mic className="h-4 w-4 mr-2" />
                  {t('expenses.voiceEntry')}
                </Button>
                <Button
                  onClick={() => setShowForm(!showForm)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {showForm ? t('common.hide') + ' ' + t('common.form') : t('expenses.manualEntry')}
                </Button>
              </div>
            </div>
          </CardHeader>

          {showForm && (
            <CardContent className="pt-0">
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('expenses.amount')} (₹) *
                    </label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.amount}
                        onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                        placeholder={t('expenses.amountPlaceholder')}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('expenses.category')} *
                    </label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('expenses.categoryPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {['food', 'transportation', 'housing', 'entertainment', 'healthcare', 'shopping', 'utilities', 'other'].map(key => (
                          <SelectItem key={key} value={t(`expenses.categories.${key}`)}>
                            {t(`expenses.categories.${key}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('expenses.date')} *
                    </label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('expenses.description')}
                    </label>
                    <Input
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder={t('expenses.descriptionPlaceholder')}
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    className="w-full sm:w-auto"
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        {t('common.adding')}...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        {t('expenses.addExpense')}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          )}
        </Card>

        {/* Search and Filter Bar */}
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder={t('expenses.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-md text-sm min-w-0 sm:min-w-fit"
                >
                  <option value="all">{t('expenses.allCategories')}</option>
                  {['food', 'transportation', 'housing', 'entertainment', 'healthcare', 'shopping', 'utilities', 'other'].map(key => (
                    <option key={key} value={t(`expenses.categories.${key}`)}>
                      {t(`expenses.categories.${key}`)}
                    </option>
                  ))}
                </select>
              </div>

              <Button onClick={handleExport} variant="outline" size="sm" className="w-full lg:w-auto">
                <Download className="h-4 w-4 mr-2" />
                {t('common.export')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Expenses - Minimal Clean Design */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">Recent Expenses</CardTitle>
                <CardDescription className="text-sm mt-1">
                  Your latest expense entries with voice recognition details
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-xs font-medium">
                {loading ? 'Loading...' : `${filteredExpenses.length} Transactions`}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="px-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-3 text-sm text-slate-600">Loading expenses...</span>
              </div>
            ) : (
              <div className="max-h-[600px] overflow-y-auto">
                {filteredExpenses.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {filteredExpenses.map((expense) => (
                      <div
                        key={expense.id}
                        className="group px-6 py-4 hover:bg-slate-50 transition-all duration-150 relative"
                      >
                        {/* Main Content Row */}
                        <div className="flex items-center justify-between gap-4">
                          {/* Left: Description & Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <h4 className="font-medium text-slate-900 truncate">
                                {expense.description || `${expense.category} expense`}
                              </h4>
                              {expense.entryMethod === 'voice' && (
                                <Badge variant="default" className="text-[10px] px-1.5 py-0 h-5 bg-blue-500 hover:bg-blue-600">
                                  🎤 Voice
                                </Badge>
                              )}
                            </div>

                            {/* Voice Input Details - Collapsible */}
                            {expense.entryMethod === 'voice' && expense.originalText && (
                              <div className="mb-2 p-2.5 bg-blue-50 rounded-md border border-blue-100">
                                <p className="text-[11px] text-blue-600 font-medium mb-1">
                                  Original voice input:
                                </p>
                                <p className="text-sm text-blue-800 italic leading-relaxed">
                                  &quot;{expense.originalText}&quot;
                                </p>
                                {expense.confidence && (
                                  <p className="text-[11px] text-blue-500 mt-1.5">
                                    Confidence: {Math.round(expense.confidence * 100)}%
                                  </p>
                                )}
                              </div>
                            )}

                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <span className="font-medium text-slate-700">{expense.category}</span>
                              <span className="text-slate-300">•</span>
                              <span>{new Date(expense.date).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}</span>
                              <span className="text-slate-300">•</span>
                              <span>{new Date(expense.timestamp || expense.date).toLocaleTimeString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}</span>
                              {expense.merchant && (
                                <>
                                  <span className="text-slate-300">•</span>
                                  <span>🏪 {expense.merchant}</span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Right: Amount & Delete */}
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="font-semibold text-lg text-red-600">
                                -₹{expense.amount.toLocaleString('en-IN')}
                              </p>
                            </div>

                            {/* Delete Button */}
                            <button
                              onClick={async () => {
                                if (!confirm('Are you sure you want to delete this expense?')) return
                                try {
                                  const res = await fetch(`/api/expenses?id=${expense.id}`, { method: 'DELETE' })
                                  const data = await res.json()
                                  if (data.success) {
                                    setExpenses(prev => prev.filter(e => e.id !== expense.id))
                                    toast.success('Expense deleted successfully')
                                  } else {
                                    toast.error(data.error || 'Failed to delete expense')
                                  }
                                } catch (err) {
                                  console.error('Delete failed:', err)
                                  toast.error('Failed to delete expense')
                                }
                              }}
                              className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-all duration-150"
                              title="Delete expense"
                              aria-label="Delete expense"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 px-6">
                    <Wallet className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600 font-medium mb-1">
                      {expenses.length === 0
                        ? 'No expenses recorded yet'
                        : 'No transactions found'
                      }
                    </p>
                    <p className="text-sm text-slate-400 mb-4">
                      {expenses.length === 0
                        ? 'Start by adding your first expense above'
                        : 'Try adjusting your search or filters'
                      }
                    </p>
                    {expenses.length === 0 && (
                      <Button
                        onClick={() => setShowForm(true)}
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        Add Manual Expense
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Voice Entry Statistics */}
        {expenses.some(e => e.entryMethod === 'voice') && (
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-700">🎤 Voice Entry Insights</CardTitle>
              <CardDescription>
                Statistics about your voice-recorded expenses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {expenses.filter(e => e.entryMethod === 'voice').length}
                  </p>
                  <p className="text-sm text-blue-600">Voice Entries</p>
                </div>
                <div className="text-center p-3 bg-emerald-50 rounded-lg">
                  <p className="text-2xl font-bold text-emerald-600">
                    {expenses.filter(e => e.entryMethod === 'voice' && e.confidence && e.confidence > 0.8).length}
                  </p>
                  <p className="text-sm text-emerald-600">High Confidence</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">
                    ₹{expenses
                      .filter(e => e.entryMethod === 'voice')
                      .reduce((sum, e) => sum + e.amount, 0)
                      .toLocaleString('en-IN')
                    }
                  </p>
                  <p className="text-sm text-purple-600">Via Voice</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Voice Entry Modal */}
      <ExpenseEntryModal
        isOpen={showVoiceEntry}
        onClose={() => setShowVoiceEntry(false)}
        onExpenseAdded={handleExpenseAdded}
      />
    </DashboardLayout>
  )
}


export default function ExpensesPage() {
  return (
    <OnboardingGuard>
      <ExpensesContent />
    </OnboardingGuard>
  )
}
