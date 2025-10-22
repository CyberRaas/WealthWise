'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import DashboardLayout from '@/components/layout/DashboardLayout'
import LanguageSelector from '@/components/ui/LanguageSelector'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Plus,
  Receipt,
  TrendingDown,
  TrendingUp,
  Calendar,
  AlertCircle,
  CheckCircle,
  Edit,
  Trash2,
  Eye,
  DollarSign,
  PieChart,
  LineChart,
  Brain,

} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { PieChart as RechartsPieChart, Cell, ResponsiveContainer, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Pie } from 'recharts'

// Modal Component for Adding/Editing Debt
function DebtModal({ isOpen, onClose, onSave, debt = null, type = 'taken' }) {
  const [formData, setFormData] = useState({
    type: type,
    name: '',
    amount: '',
    interestRate: '',
    duration: '',
    monthlyInstallment: '',
    dueDate: '',
    description: ''
  })
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted (for portal)
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    // Cleanup function
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscapeKey)
    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [isOpen, onClose])

  // Calculate monthly installment and due date based on amount, interest rate, and duration
  const calculateLoanDetails = (amount, interestRate, duration) => {
    if (!amount || !duration || amount <= 0 || duration <= 0) {
      return { monthlyInstallment: '', dueDate: '' }
    }

    const principal = parseFloat(amount)
    const months = parseInt(duration)
    const monthlyRate = parseFloat(interestRate || 0) / 100 / 12

    let monthlyInstallment
    if (monthlyRate > 0) {
      // EMI calculation with interest
      monthlyInstallment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
    } else {
      // Simple division if no interest
      monthlyInstallment = principal / months
    }

    // Calculate due date (duration months from today)
    const today = new Date()
    const dueDate = new Date(today.getFullYear(), today.getMonth() + months, today.getDate())

    return {
      monthlyInstallment: monthlyInstallment.toFixed(2),
      dueDate: dueDate.toISOString().split('T')[0]
    }
  }

  // Auto-calculate when amount, interest rate, or duration changes
  useEffect(() => {
    const { monthlyInstallment, dueDate } = calculateLoanDetails(
      formData.amount,
      formData.interestRate,
      formData.duration
    )

    if (monthlyInstallment && dueDate) {
      setFormData(prev => ({
        ...prev,
        monthlyInstallment,
        dueDate
      }))
    }
  }, [formData.amount, formData.interestRate, formData.duration])

  useEffect(() => {
    if (debt) {
      // For existing debt, calculate duration from current date to due date
      const today = new Date()
      const existingDueDate = new Date(debt.dueDate)
      const monthsDiff = (existingDueDate.getFullYear() - today.getFullYear()) * 12 +
        (existingDueDate.getMonth() - today.getMonth())

      setFormData({
        type: debt.type,
        name: debt.name,
        amount: debt.amount.toString(),
        interestRate: debt.interestRate.toString(),
        duration: Math.max(1, monthsDiff).toString(),
        monthlyInstallment: debt.monthlyInstallment.toString(),
        dueDate: new Date(debt.dueDate).toISOString().split('T')[0],
        description: debt.description || ''
      })
    } else {
      setFormData({
        type: type,
        name: '',
        amount: '',
        interestRate: '',
        duration: '',
        monthlyInstallment: '',
        dueDate: '',
        description: ''
      })
    }
  }, [debt, type])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.amount || !formData.duration) {
      toast.error('Please fill in all required fields')
      return
    }

    const debtData = {
      ...formData,
      amount: parseFloat(formData.amount),
      interestRate: parseFloat(formData.interestRate) || 0,
      duration: parseInt(formData.duration),
      monthlyInstallment: parseFloat(formData.monthlyInstallment) || 0
    }

    await onSave(debtData)
  }

  if (!isOpen || !mounted) return null

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">
            {debt ? 'Edit' : 'Add'} {type === 'taken' ? 'Debt Taken' : 'Debt Given'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {type === 'taken' ? 'Lender Name' : 'Borrower Name'} *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder={type === 'taken' ? 'Enter lender name' : 'Enter borrower name'}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Enter amount"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate (% per annum)</label>
            <input
              type="number"
              value={formData.interestRate}
              onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Enter interest rate"
              min="0"
              max="100"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (months) *</label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Enter duration in months"
              min="1"
              max="600"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Monthly installment and due date will be calculated automatically
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Installment (Calculated)</label>
            <input
              type="number"
              value={formData.monthlyInstallment}
              className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
              placeholder="Auto-calculated"
              disabled
              step="0.01"
            />
            <p className="text-xs text-gray-500 mt-1">
              This is automatically calculated based on amount, interest rate, and duration
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Final Due Date (Calculated)</label>
            <input
              type="date"
              value={formData.dueDate}
              className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">
              Final payment due date based on duration
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Enter description (optional)"
              rows="3"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={`flex-1 ${type === 'taken'
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-green-500 hover:bg-green-600'
                } text-white`}
            >
              {debt ? 'Update' : 'Add'} Debt
            </Button>
          </div>
        </form>
      </div>
    </div>
  )

  // Use portal to render modal outside the component tree
  return createPortal(modalContent, document.body)
}

function DebtOverview() {
  const { t } = useTranslation()
  const [debts, setDebts] = useState([])
  const [summary, setSummary] = useState({ taken: {}, given: {} })
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('taken')
  const [editingDebt, setEditingDebt] = useState(null)
  const [userProfile, setUserProfile] = useState(null)

  useEffect(() => {
    fetchDebts()
    fetchUserProfile()
  }, [])

  const fetchDebts = async () => {
    try {
      const response = await fetch('/api/debt')
      const data = await response.json()

      if (response.ok) {
        setDebts(data.debts)
        setSummary(data.summary)
      } else {
        toast.error(data.error || 'Failed to fetch debts')
      }
    } catch (error) {
      console.error('Fetch error:', error)
      toast.error('Failed to fetch debts')
    } finally {
      setLoading(false)
    }
  }

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user')
      const data = await response.json()

      if (response.ok) {
        setUserProfile(data.user)
      }
    } catch (error) {
      console.error('Profile fetch error:', error)
    }
  }

  const handleAddDebt = (type) => {
    setModalType(type)
    setEditingDebt(null)
    setShowModal(true)
  }

  const handleEditDebt = (debt) => {
    setEditingDebt(debt)
    setModalType(debt.type)
    setShowModal(true)
  }

  const handleSaveDebt = async (debtData) => {
    try {
      const url = editingDebt ? `/api/debt/${editingDebt._id}` : '/api/debt'
      const method = editingDebt ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(debtData)
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(editingDebt ? 'Debt updated successfully' : 'Debt added successfully')
        setShowModal(false)
        setEditingDebt(null)
        fetchDebts()
      } else {
        toast.error(data.error || 'Failed to save debt')
      }
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Failed to save debt')
    }
  }

  const handleDeleteDebt = async (debtId) => {
    if (!confirm('Are you sure you want to delete this debt?')) return

    try {
      const response = await fetch(`/api/debt/${debtId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Debt deleted successfully')
        fetchDebts()
      } else {
        toast.error(data.error || 'Failed to delete debt')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete debt')
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getDaysUntilDue = (dueDate) => {
    const today = new Date()
    const due = new Date(dueDate)
    const timeDiff = due.getTime() - today.getTime()
    return Math.ceil(timeDiff / (1000 * 3600 * 24))
  }

  const calculateDebtScore = () => {
    const monthlyIncome = userProfile?.monthlyIncome || 0
    const totalDebtTaken = summary.taken.totalRemaining || 0
    const totalDebtGiven = summary.given.totalRemaining || 0
    const totalDebts = debts.length
    const overdueDebts = debts.filter(debt => {
      const dueDate = new Date(debt.dueDate)
      const today = new Date()
      return dueDate < today && debt.remainingBalance > 0
    }).length

    // If no debts at all, return excellent score
    if (totalDebts === 0) return 95

    let score = 50 // Base score

    // Factor 1: Debt-to-income ratio (40% weight) - only if income is available
    if (monthlyIncome > 0) {
      const debtRatio = (totalDebtTaken / monthlyIncome) * 100
      if (debtRatio <= 10) score += 40
      else if (debtRatio <= 20) score += 30
      else if (debtRatio <= 30) score += 20
      else if (debtRatio <= 40) score += 10
      else score -= 10
    } else {
      // If no income data, use debt amount as indicator
      if (totalDebtTaken <= 100000) score += 25      // Under 1L
      else if (totalDebtTaken <= 500000) score += 15 // Under 5L
      else if (totalDebtTaken <= 1000000) score += 5 // Under 10L
      else score -= 10 // Above 10L
    }

    // Factor 2: Debt diversity (20% weight)
    const debtBalance = totalDebtTaken > 0 && totalDebtGiven > 0
    if (debtBalance && totalDebtGiven >= totalDebtTaken * 0.5) {
      score += 20 // Good balance between lending and borrowing
    } else if (totalDebtTaken === 0 && totalDebtGiven > 0) {
      score += 15 // Only lending, no borrowing
    } else if (totalDebtTaken > 0 && totalDebtGiven === 0) {
      score += 5 // Only borrowing
    }

    // Factor 3: Overdue payments (20% weight)
    if (overdueDebts === 0) {
      score += 20 // No overdue payments
    } else {
      const overdueRatio = overdueDebts / totalDebts
      if (overdueRatio <= 0.1) score += 10      // Less than 10% overdue
      else if (overdueRatio <= 0.25) score += 5 // Less than 25% overdue
      else score -= 15 // More than 25% overdue
    }

    // Factor 4: Number of active debts (10% weight)
    if (totalDebts <= 2) score += 10        // Few debts to manage
    else if (totalDebts <= 5) score += 5    // Moderate number
    else score -= 5 // Too many debts

    // Factor 5: Average debt size (10% weight)
    const avgDebtSize = totalDebts > 0 ? totalDebtTaken / debts.filter(d => d.type === 'taken').length : 0
    if (avgDebtSize <= 50000) score += 10      // Small average debt
    else if (avgDebtSize <= 200000) score += 5 // Medium average debt
    else score -= 5 // Large average debt

    return Math.max(0, Math.min(100, Math.round(score)))
  }

  const getDebtScoreColor = (score) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-blue-600'
    if (score >= 40) return 'text-yellow-600'
    if (score >= 20) return 'text-orange-600'
    return 'text-red-600'
  }

  const getDebtScoreLabel = (score) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    if (score >= 20) return 'Poor'
    return 'Critical'
  }

  const getDebtScoreDescription = (score) => {
    if (score >= 80) return 'Your debt management is excellent! Keep it up.'
    if (score >= 60) return 'Good debt management with room for minor improvements.'
    if (score >= 40) return 'Fair debt situation. Consider optimizing your strategy.'
    if (score >= 20) return 'Poor debt management. Immediate action recommended.'
    return 'Critical debt situation. Seek professional financial advice.'
  }

  // Data for charts
  const pieChartData = [
    { name: 'Debt Taken', value: summary.taken.totalRemaining || 0, color: '#ef4444' },
    { name: 'Debt Given', value: summary.given.totalRemaining || 0, color: '#22c55e' }
  ]

  const lineChartData = debts.reduce((acc, debt) => {
    const month = new Date(debt.createdAt).toISOString().slice(0, 7)
    const existing = acc.find(item => item.month === month)

    if (existing) {
      if (debt.type === 'taken') {
        existing.taken += debt.amount
      } else {
        existing.given += debt.amount
      }
    } else {
      acc.push({
        month,
        taken: debt.type === 'taken' ? debt.amount : 0,
        given: debt.type === 'given' ? debt.amount : 0
      })
    }

    return acc
  }, []).sort((a, b) => a.month.localeCompare(b.month)).slice(-6)

  const debtScore = calculateDebtScore()

  return (
    <DashboardLayout title={t('debt.title')}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-600 mt-1">
              {t('debt.subtitle')}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Debt Summary Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Debt Taken Section */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h2 className="text-lg sm:text-xl font-semibold text-red-600 flex items-center">
                    <TrendingDown className="w-5 h-5 mr-2" />
                    {t('debt.debtsTaken')} ({t('debt.liabilities')})
                  </h2>
                  <Button
                    onClick={() => handleAddDebt('taken')}
                    className="bg-red-500 hover:bg-red-600 text-white w-full sm:w-auto"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    {t('debt.addDebt')}
                  </Button>
                </div>

                <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm">
                    <div>
                      <p className="text-red-600 font-medium">{t('debt.totalAmount')}</p>
                      <p className="text-red-800 font-bold text-base sm:text-lg">
                        {formatCurrency(summary.taken.totalAmount || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-red-600 font-medium">{t('debt.remainingAmount')}</p>
                      <p className="text-red-800 font-bold text-base sm:text-lg">
                        {formatCurrency(summary.taken.totalRemaining || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-red-600 font-medium">{t('debt.monthlyPayments')}</p>
                      <p className="text-red-800 font-bold text-sm sm:text-base">
                        {formatCurrency(summary.taken.totalMonthlyPayments || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-red-600 font-medium">{t('debt.activeDebts')}</p>
                      <p className="text-red-800 font-bold text-sm sm:text-base">{summary.taken.count || 0}</p>
                    </div>
                  </div>
                </div>              <div className="space-y-3">
                  {debts.filter(debt => debt.type === 'taken').slice(0, 3).map((debt) => {
                    const daysUntilDue = getDaysUntilDue(debt.dueDate)
                    const completionPercentage = ((debt.amount - debt.remainingBalance) / debt.amount) * 100

                    return (
                      <div key={debt._id} className="bg-white border border-red-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-slate-800">{debt.name}</h3>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleEditDebt(debt)}
                              variant="ghost"
                              size="sm"
                              className="text-slate-500 hover:text-slate-700"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteDebt(debt._id)}
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Remaining:</span>
                            <span className="font-medium text-red-600">
                              {formatCurrency(debt.remainingBalance)}
                            </span>
                          </div>

                          <div className="w-full bg-red-100 rounded-full h-2">
                            <div
                              className="bg-red-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${completionPercentage}%` }}
                            />
                          </div>

                          <div className="flex justify-between text-xs text-slate-500">
                            <span>Due: {formatDate(debt.dueDate)}</span>
                            <span className={daysUntilDue < 30 ? 'text-red-600 font-medium' : ''}>
                              {daysUntilDue > 0 ? `${daysUntilDue} days left` : 'Overdue'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  {debts.filter(debt => debt.type === 'taken').length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      <Receipt className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                      <p>No debts taken yet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Debt Given Section */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h2 className="text-lg sm:text-xl font-semibold text-green-600 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Debt Given (Assets)
                  </h2>
                  <Button
                    onClick={() => handleAddDebt('given')}
                    className="bg-green-500 hover:bg-green-600 text-white w-full sm:w-auto"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Debt
                  </Button>
                </div>

                <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm">
                    <div>
                      <p className="text-green-600 font-medium">Total Amount</p>
                      <p className="text-green-800 font-bold text-base sm:text-lg">
                        {formatCurrency(summary.given.totalAmount || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-green-600 font-medium">Remaining</p>
                      <p className="text-green-800 font-bold text-base sm:text-lg">
                        {formatCurrency(summary.given.totalRemaining || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-green-600 font-medium">Monthly Payments</p>
                      <p className="text-green-800 font-bold text-sm sm:text-base">
                        {formatCurrency(summary.given.totalMonthlyPayments || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-green-600 font-medium">Active Debts</p>
                      <p className="text-green-800 font-bold text-sm sm:text-base">{summary.given.count || 0}</p>
                    </div>
                  </div>
                </div>              <div className="space-y-3">
                  {debts.filter(debt => debt.type === 'given').slice(0, 3).map((debt) => {
                    const daysUntilDue = getDaysUntilDue(debt.dueDate)
                    const completionPercentage = ((debt.amount - debt.remainingBalance) / debt.amount) * 100

                    return (
                      <div key={debt._id} className="bg-white border border-green-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-slate-800">{debt.name}</h3>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleEditDebt(debt)}
                              variant="ghost"
                              size="sm"
                              className="text-slate-500 hover:text-slate-700"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteDebt(debt._id)}
                              variant="ghost"
                              size="sm"
                              className="text-green-500 hover:text-green-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Remaining:</span>
                            <span className="font-medium text-green-600">
                              {formatCurrency(debt.remainingBalance)}
                            </span>
                          </div>

                          <div className="w-full bg-green-100 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${completionPercentage}%` }}
                            />
                          </div>

                          <div className="flex justify-between text-xs text-slate-500">
                            <span>Due: {formatDate(debt.dueDate)}</span>
                            <span className={daysUntilDue < 30 ? 'text-green-600 font-medium' : ''}>
                              {daysUntilDue > 0 ? `${daysUntilDue} days left` : 'Overdue'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  {debts.filter(debt => debt.type === 'given').length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      <DollarSign className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                      <p>No debts given yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Debt Score */}
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-emerald-500" />
                  Debt Score
                </h3>

                <div className="text-center">
                  <div className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4">
                    <svg className="w-24 h-24 sm:w-32 sm:h-32 transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke={
                          debtScore >= 80 ? '#22c55e' :
                            debtScore >= 60 ? '#3b82f6' :
                              debtScore >= 40 ? '#f59e0b' :
                                debtScore >= 20 ? '#f97316' : '#ef4444'
                        }
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${debtScore * 2.51} 251`}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className={`text-xl sm:text-2xl font-bold ${getDebtScoreColor(debtScore)}`}>
                          {Math.round(debtScore)}
                        </div>
                        <div className="text-xs text-slate-500">out of 100</div>
                      </div>
                    </div>
                  </div>

                  <div className={`text-base sm:text-lg font-semibold ${getDebtScoreColor(debtScore)}`}>
                    {getDebtScoreLabel(debtScore)}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2">
                    {getDebtScoreDescription(debtScore)}
                  </p>
                </div>

                {/* Score Factors */}
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Total Debts:</span>
                      <span className="font-medium">{debts.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Total Borrowed:</span>
                      <span className="font-medium text-red-600">
                        ₹{(summary.taken.totalRemaining || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Total Lent:</span>
                      <span className="font-medium text-green-600">
                        ₹{(summary.given.totalRemaining || 0).toLocaleString()}
                      </span>
                    </div>
                    {userProfile?.monthlyIncome && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Debt-to-Income:</span>
                        <span className="font-medium">
                          {((summary.taken.totalRemaining || 0) / userProfile.monthlyIncome * 100).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Debt Distribution Pie Chart */}
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-4 flex items-center">
                  <PieChart className="w-5 h-5 mr-2 text-emerald-500" />
                  Debt Distribution
                </h3>

                {pieChartData.some(item => item.value > 0) ? (
                  <div className="h-36 sm:h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={pieChartData.filter(item => item.value > 0)}
                          cx="50%"
                          cy="50%"
                          innerRadius={30}
                          outerRadius={60}
                          dataKey="value"
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-36 sm:h-48 text-slate-500">
                    <div className="text-center">
                      <PieChart className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 text-slate-300" />
                      <p className="text-xs sm:text-sm">No debt data available</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Debt Trend Line Chart */}
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-4 flex items-center">
                  <LineChart className="w-5 h-5 mr-2 text-emerald-500" />
                  Debt Trends
                </h3>

                {lineChartData.length > 0 ? (
                  <div className="h-36 sm:h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart data={lineChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" fontSize={10} />
                        <YAxis fontSize={10} />
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Line type="monotone" dataKey="taken" stroke="#ef4444" strokeWidth={2} />
                        <Line type="monotone" dataKey="given" stroke="#22c55e" strokeWidth={2} />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-36 sm:h-48 text-slate-500">
                    <div className="text-center">
                      <LineChart className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 text-slate-300" />
                      <p className="text-xs sm:text-sm">No trend data available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* AI Recommendations Card */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl shadow-lg border border-purple-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <Brain className="w-5 h-5 mr-2 text-purple-500" />
                AI Debt Recommendations
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-3 sm:p-4 border border-purple-100">
                  <h4 className="font-medium text-purple-800 mb-2 text-sm sm:text-base">Debt Consolidation</h4>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Consider consolidating high-interest debts to reduce monthly payments and save on interest.
                  </p>
                </div>

                <div className="bg-white rounded-lg p-3 sm:p-4 border border-purple-100">
                  <h4 className="font-medium text-purple-800 mb-2 text-sm sm:text-base">Payment Priority</h4>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Focus on paying off highest interest rate debts first to minimize total interest paid.
                  </p>
                </div>

                <div className="bg-white rounded-lg p-3 sm:p-4 border border-purple-100 md:col-span-2 lg:col-span-1">
                  <h4 className="font-medium text-purple-800 mb-2 text-sm sm:text-base">Emergency Fund</h4>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Build an emergency fund to avoid taking on additional debt during unexpected expenses.
                  </p>
                </div>
              </div>

              <div className="mt-4 text-xs text-slate-500">
                * These are general recommendations. Consult with a financial advisor for personalized advice.
              </div>
            </div>
          </>
        )}

        {/* Debt Modal */}
        <DebtModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleSaveDebt}
          debt={editingDebt}
          type={modalType}
        />
      </div>
    </DashboardLayout>
  )
}

export default function DebtOverviewPage() {
  return <DebtOverview />
}
