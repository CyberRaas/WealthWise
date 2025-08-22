'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import OnboardingGuard from '@/components/OnboardingGuard'
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
    <DashboardLayout title="Expense Management">
      <div className="space-y-4 sm:space-y-6">
        {/* Summary Cards - Real Data */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-red-600">
                {loading ? '...' : `₹${thisMonthExpenses.toLocaleString('en-IN')}`}
              </div>
              <p className="text-xs text-slate-500">Monthly expenses</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-blue-600">
                {loading ? '...' : `₹${totalExpenses.toLocaleString('en-IN')}`}
              </div>
              <p className="text-xs text-slate-500">All time</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-500 sm:col-span-2 lg:col-span-1">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-emerald-600">{loading ? '...' : expenses.length}
              </div>
              <p className="text-xs text-slate-500">Total entries</p>
            </CardContent>
          </Card>
        </div>

        {/* Add Expense Form */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <CardTitle className="text-lg sm:text-xl font-bold text-slate-800">Add New Expense</CardTitle>
                <CardDescription>Record your expenses quickly and easily</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={() => setShowVoiceEntry(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
                >
                  <Mic className="h-4 w-4 mr-2" />
                  Voice Entry
                </Button>
                <Button
                  onClick={() => setShowForm(!showForm)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {showForm ? 'Hide Form' : 'Manual Entry'}
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
                      Amount (₹) *
                    </label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.amount}
                        onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                        placeholder="0.00"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date *
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
                      Description
                    </label>
                    <Input
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="What was this expense for?"
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
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Expense
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
                    placeholder="Search transactions..."
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
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <Button onClick={handleExport} variant="outline" size="sm" className="w-full lg:w-auto">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Expenses - Real Data with Enhanced Voice Entry Display */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Expenses</span>
              <Badge variant="secondary">
                {loading ? 'Loading...' : `${filteredExpenses.length} transactions`}
              </Badge>
            </CardTitle>
            <CardDescription>
              Your latest expense entries with voice recognition details
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-3 text-slate-600">Loading expenses...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredExpenses.length > 0 ? (
                  filteredExpenses.map((expense) => (
                    <div key={expense.id} className={`p-4 rounded-lg transition-colors border group ${
                      expense.entryMethod === 'voice' 
                        ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' 
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className={`w-3 h-3 rounded-full mt-2 ${
                            expense.entryMethod === 'voice' ? 'bg-blue-500' : 'bg-red-500'
                          }`}></div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-slate-800 flex items-center gap-2">
                                {expense.description || `${expense.category} expense`}
                                <button
                                  onClick={async () => {
                                    try {
                                      const res = await fetch(`/api/expenses?id=${expense.id}`, { method: 'DELETE' })
                                      const data = await res.json()
                                      if (data.success) {
                                        setExpenses(prev => prev.filter(e => e.id !== expense.id))
                                        toast.success('Expense deleted')
                                      } else {
                                        toast.error(data.error || 'Delete failed')
                                      }
                                    } catch (err) {
                                      console.error('Delete failed', err)
                                      toast.error('Delete failed')
                                    }
                                  }}
                                  className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 text-xs transition-opacity"
                                  title="Delete expense"
                                >
                                  ✕
                                </button>
                              </p>
                              {expense.entryMethod === 'voice' && (
                                <Badge variant="default" className="text-xs bg-blue-500">
                                  🎤 Voice
                                </Badge>
                              )}
                              {expense.entryMethod === 'manual' && (
                                <Badge variant="outline" className="text-xs">
                                  ✍️ Manual
                                </Badge>
                              )}
                            </div>
                            
                            {/* Enhanced details for voice entries */}
                            {expense.entryMethod === 'voice' && expense.originalText && (
                              <div className="mb-2 p-2 bg-blue-100 rounded border-l-4 border-blue-400">
                                <p className="text-xs text-blue-600 font-medium mb-1">
                                  Original voice input:
                                </p>
                                <p className="text-sm text-blue-800 italic">
                                  &quot;{expense.originalText}&quot;
                                </p>
                                {expense.confidence && (
                                  <p className="text-xs text-blue-600 mt-1">
                                    Confidence: {Math.round(expense.confidence * 100)}%
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Merchant information */}
                            {expense.merchant && (
                              <div className="flex items-center gap-1 mb-2">
                                <span className="text-xs text-slate-500">at</span>
                                <Badge variant="secondary" className="text-xs">
                                  🏪 {expense.merchant}
                                </Badge>
                              </div>
                            )}

                            <div className="flex items-center space-x-3 mt-2">
                              <Badge variant="secondary" className="text-xs">
                                {expense.category}
                              </Badge>
                              <span className="text-xs text-slate-500">
                                {new Date(expense.date).toLocaleDateString('en-IN')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className={`font-bold text-lg ${
                            expense.entryMethod === 'voice' ? 'text-blue-600' : 'text-red-600'
                          }`}>
                            -₹{expense.amount.toLocaleString('en-IN')}
                          </p>
                          <p className="text-xs text-slate-400">
                            {new Date(expense.timestamp || expense.date).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Wallet className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">
                      {expenses.length === 0 
                        ? 'No expenses recorded yet' 
                        : 'No transactions found matching your filters'
                      }
                    </p>
                    <p className="text-sm text-slate-400">
                      {expenses.length === 0 
                        ? 'Start by adding your first expense above' 
                        : 'Try adjusting your search or filters'
                      }
                    </p>
                    {expenses.length === 0 && (
                      <div className="mt-4 space-y-2">
                        <Button
                          onClick={() => setShowForm(true)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white mr-2"
                        >
                          Add Manual Expense
                        </Button>
                      </div>
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
