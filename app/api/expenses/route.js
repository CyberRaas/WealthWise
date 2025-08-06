import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import dbConnect from '@/lib/dbConnect'
import UserProfile from '@/models/UserProfile'

// POST - Add new expense entry
export async function POST(request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const expenseData = await request.json()
    
    // Validate expense data
    if (!expenseData.amount || !expenseData.category) {
      return NextResponse.json(
        { error: 'Amount and category are required' },
        { status: 400 }
      )
    }

    await dbConnect()

    // Find user profile
    const userProfile = await UserProfile.findOne({ userId: session.user.id })
    
    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Create expense entry
    const expense = {
      id: Date.now().toString(), // Simple ID for now
      amount: Number(expenseData.amount),
      category: expenseData.category,
      description: expenseData.description || '',
      merchant: expenseData.merchant || null,
      date: expenseData.date || new Date().toISOString().split('T')[0],
      timestamp: new Date(),
      entryMethod: expenseData.entryMethod || 'manual', // 'voice' or 'manual'
      originalText: expenseData.originalText || null, // For voice entries
      confidence: expenseData.confidence || null // For voice entries
    }

    // Initialize expenses array if it doesn't exist
    if (!userProfile.expenses) {
      userProfile.expenses = []
    }

    // Add expense to user profile
    userProfile.expenses.push(expense)
    
    // Update user profile
    userProfile.markModified('expenses')
    await userProfile.save()

    console.log('Expense added successfully:', expense)

    return NextResponse.json({
      success: true,
      message: 'Expense added successfully',
      expense: expense,
      totalExpenses: userProfile.expenses.length
    })

  } catch (error) {
    console.error('Add expense error:', error)
    return NextResponse.json(
      { error: 'Failed to add expense', details: error.message },
      { status: 500 }
    )
  }
}

// GET - Get user expenses
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
    const month = searchParams.get('month') // Format: YYYY-MM
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit')) || 50

    await dbConnect()

    const userProfile = await UserProfile.findOne({ userId: session.user.id })
    
    if (!userProfile || !userProfile.expenses) {
      return NextResponse.json({
        success: true,
        expenses: [],
        totalExpenses: 0,
        monthlyTotal: 0
      })
    }

    let expenses = userProfile.expenses || []

    // Filter by month if specified
    if (month) {
      expenses = expenses.filter(expense => {
        const expenseMonth = expense.date.substring(0, 7) // Extract YYYY-MM
        return expenseMonth === month
      })
    }

    // Filter by category if specified
    if (category) {
      expenses = expenses.filter(expense => expense.category === category)
    }

    // Sort by date (newest first) and limit
    expenses = expenses
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit)

    // Calculate totals
    const monthlyTotal = expenses.reduce((sum, expense) => sum + expense.amount, 0)

    // Group expenses by category for summary
    const categoryTotals = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount
      return acc
    }, {})

    return NextResponse.json({
      success: true,
      expenses: expenses,
      totalExpenses: expenses.length,
      monthlyTotal: monthlyTotal,
      categoryTotals: categoryTotals,
      filters: {
        month: month,
        category: category,
        limit: limit
      }
    })

  } catch (error) {
    console.error('Get expenses error:', error)
    return NextResponse.json(
      { error: 'Failed to get expenses', details: error.message },
      { status: 500 }
    )
  }
}
