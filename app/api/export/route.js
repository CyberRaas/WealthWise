/**
 * Data Export API
 *
 * GET /api/export - Export user financial data
 * Query params:
 *   - format: 'csv' | 'json' (default: 'csv')
 *   - type: 'expenses' | 'goals' | 'all' (default: 'all')
 */

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import dbConnect from '@/lib/dbConnect'
import UserProfile from '@/models/UserProfile'
import Debt from '@/models/Debt'

export async function GET(request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv'
    const type = searchParams.get('type') || 'all'

    await dbConnect()

    // Fetch user profile
    const profile = await UserProfile.findOne({ userId: session.user.id })

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Fetch debts separately
    const debts = await Debt.find({ userId: session.user.id }).lean()

    // Prepare data based on type
    const exportData = {
      exportDate: new Date().toISOString(),
      user: {
        name: session.user.name,
        email: session.user.email
      }
    }

    if (type === 'all' || type === 'expenses') {
      exportData.expenses = profile.expenses || []
    }

    if (type === 'all' || type === 'goals') {
      exportData.goals = profile.goals || []
    }

    if (type === 'all') {
      exportData.debts = debts
      exportData.profile = {
        monthlyIncome: profile.monthlyIncome,
        city: profile.city,
        familySize: profile.familySize,
        age: profile.age,
        occupation: profile.occupation
      }
      exportData.budget = profile.generatedBudget || null
    }

    // Return JSON format
    if (format === 'json') {
      return NextResponse.json({
        success: true,
        ...exportData
      })
    }

    // Generate CSV format
    if (format === 'csv') {
      let csv = ''

      // Expenses CSV
      if (type === 'all' || type === 'expenses') {
        csv += 'EXPENSES\n'
        csv += 'Date,Category,Amount,Description,Merchant,Entry Method\n'

        const expenses = profile.expenses || []
        expenses.forEach(expense => {
          const row = [
            expense.date || '',
            escapeCSV(expense.category || ''),
            expense.amount || 0,
            escapeCSV(expense.description || ''),
            escapeCSV(expense.merchant || ''),
            expense.entryMethod || 'manual'
          ]
          csv += row.join(',') + '\n'
        })

        csv += '\n'
      }

      // Goals CSV
      if (type === 'all' || type === 'goals') {
        csv += 'GOALS\n'
        csv += 'Name,Target Amount,Current Amount,Progress %,Target Date,Status,Priority\n'

        const goals = profile.goals || []
        goals.forEach(goal => {
          const progress = goal.targetAmount > 0
            ? Math.round((goal.currentAmount / goal.targetAmount) * 100)
            : 0

          const row = [
            escapeCSV(goal.name || ''),
            goal.targetAmount || 0,
            goal.currentAmount || 0,
            progress,
            goal.targetDate || '',
            goal.status || 'active',
            goal.priority || 'Medium'
          ]
          csv += row.join(',') + '\n'
        })

        csv += '\n'
      }

      // Debts CSV (only for 'all' type)
      if (type === 'all' && debts.length > 0) {
        csv += 'DEBTS\n'
        csv += 'Name,Type,Original Amount,Remaining Balance,Interest Rate,Due Date,Status\n'

        debts.forEach(debt => {
          const row = [
            escapeCSV(debt.name || ''),
            debt.type || '',
            debt.amount || 0,
            debt.remainingBalance || 0,
            debt.interestRate || 0,
            debt.dueDate ? new Date(debt.dueDate).toISOString().split('T')[0] : '',
            debt.status || 'active'
          ]
          csv += row.join(',') + '\n'
        })

        csv += '\n'
      }

      // Summary section
      if (type === 'all') {
        csv += 'SUMMARY\n'
        csv += 'Total Expenses,' + (profile.expenses?.length || 0) + '\n'
        csv += 'Total Goals,' + (profile.goals?.length || 0) + '\n'
        csv += 'Total Debts,' + debts.length + '\n'
        csv += 'Monthly Income,' + (profile.monthlyIncome || 0) + '\n'
        csv += 'Export Date,' + new Date().toISOString() + '\n'
      }

      const filename = `wealthwise-${type}-${new Date().toISOString().split('T')[0]}.csv`

      return new Response(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-cache'
        }
      })
    }

    // Invalid format
    return NextResponse.json(
      { error: 'Invalid format. Use "csv" or "json"' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    )
  }
}

/**
 * Escape CSV special characters
 */
function escapeCSV(str) {
  if (str === null || str === undefined) return ''
  const escaped = String(str).replace(/"/g, '""')
  // Wrap in quotes if contains comma, quote, or newline
  if (escaped.includes(',') || escaped.includes('"') || escaped.includes('\n')) {
    return `"${escaped}"`
  }
  return escaped
}
