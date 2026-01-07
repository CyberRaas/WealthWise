/**
 * Individual Split Expense API
 * Endpoints for single expense operations
 */

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import dbConnect from '@/lib/dbConnect'
import SplitGroup from '@/models/SplitGroup'
import SplitExpense from '@/models/SplitExpense'

/**
 * GET /api/split/expenses/[id]
 * Get a single expense
 */
export async function GET(request, { params }) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    await dbConnect()

    const expense = await SplitExpense.findById(id)
      .populate({ path: 'addedBy', select: 'name email avatar', options: { virtuals: false } })
      .lean()

    if (!expense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      )
    }

    // Verify user is a member of the group
    const group = await SplitGroup.findById(expense.groupId)
    const isMember = group?.members.some(
      m => m.user?.toString() === session.user.id
    )

    if (!isMember) {
      return NextResponse.json(
        { error: 'You are not authorized to view this expense' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      expense
    })
  } catch (error) {
    console.error('Error fetching expense:', error)
    return NextResponse.json(
      { error: 'Failed to fetch expense' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/split/expenses/[id]
 * Update an expense
 */
export async function PATCH(request, { params }) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    await dbConnect()

    const expense = await SplitExpense.findById(id)

    if (!expense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      )
    }

    // Only creator or payer can update
    const isAuthorized = 
      expense.addedBy.toString() === session.user.id ||
      expense.paidBy.memberId.toString() === session.user.id

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Only the creator or payer can update this expense' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { description, amount, category, splitType, splits, date, notes } = body

    const group = await SplitGroup.findById(expense.groupId)
    const oldAmount = expense.amount
    const oldSplits = [...expense.splitAmong]
    const oldPayerId = expense.paidBy.memberId.toString()

    // Update fields
    if (description) expense.description = description.trim()
    if (category) expense.category = category
    if (date) expense.date = new Date(date)
    if (notes !== undefined) expense.notes = notes?.trim()

    // Handle amount/split changes
    if (amount !== undefined && amount !== oldAmount) {
      expense.amount = amount
      
      // Recalculate splits
      if (expense.splitType === 'equal') {
        const memberIds = oldSplits.map(s => s.memberId.toString())
        const memberNames = oldSplits.map(s => s.memberName)
        expense.calculateEqualSplit(memberIds, memberNames)
      }
    }

    if (splitType && splitType !== expense.splitType) {
      expense.splitType = splitType
      if (splits) {
        // Convert frontend format to model format
        const formattedSplits = splits.map(s => {
          const member = group.members.find(m => m.user?._id.toString() === s.user)
          return {
            memberId: s.user,
            memberName: member?.user?.name || s.memberName || 'Unknown',
            amount: s.amount,
            percentage: s.percentage
          }
        })
        
        if (splitType === 'exact') {
          expense.setExactSplit(formattedSplits)
        } else if (splitType === 'percentage') {
          expense.setPercentageSplit(formattedSplits)
        }
      }
    }

    await expense.save()

    // Update group stats and balances
    if (amount !== oldAmount || JSON.stringify(splits) !== JSON.stringify(oldSplits)) {
      // Reverse old balances
      oldSplits.forEach(split => {
        const member = group.members.find(
          m => m.user?.toString() === split.memberId.toString()
        )
        if (member) {
          if (member.user.toString() === oldPayerId) {
            member.balance -= (oldAmount - split.amount)
          } else {
            member.balance += split.amount
          }
        }
      })

      // Apply new balances
      const newPayerId = expense.paidBy.memberId.toString()
      expense.splitAmong.forEach(split => {
        const member = group.members.find(
          m => m.user?.toString() === split.memberId.toString()
        )
        if (member) {
          if (member.user.toString() === newPayerId) {
            member.balance += (expense.amount - split.amount)
          } else {
            member.balance -= split.amount
          }
        }
      })

      // Update total expenses
      group.stats.totalExpenses = group.stats.totalExpenses - oldAmount + expense.amount

      await group.save()
    }

    // Reload with populated data
    const updatedExpense = await SplitExpense.findById(id)
      .populate({ path: 'addedBy', select: 'name email avatar', options: { virtuals: false } })
      .lean()

    return NextResponse.json({
      success: true,
      expense: updatedExpense,
      message: 'Expense updated successfully'
    })
  } catch (error) {
    console.error('Error updating expense:', error)
    return NextResponse.json(
      { error: 'Failed to update expense' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/split/expenses/[id]
 * Delete an expense
 */
export async function DELETE(request, { params }) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    await dbConnect()

    const expense = await SplitExpense.findById(id)

    if (!expense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      )
    }

    // Get group to check permissions
    const group = await SplitGroup.findById(expense.groupId)

    // Check if user is creator, payer, or admin
    const isCreator = expense.addedBy.toString() === session.user.id
    const isPayer = expense.paidBy.memberId.toString() === session.user.id
    const isAdmin = group?.members.find(
      m => m.user?.toString() === session.user.id && m.role === 'admin'
    )

    if (!isCreator && !isPayer && !isAdmin) {
      return NextResponse.json(
        { error: 'Not authorized to delete this expense' },
        { status: 403 }
      )
    }

    // Reverse balances
    const payerId = expense.paidBy.memberId.toString()
    expense.splitAmong.forEach(split => {
      const member = group.members.find(
        m => m.user?.toString() === split.memberId.toString()
      )
      if (member) {
        if (member.user.toString() === payerId) {
          member.balance -= (expense.amount - split.amount)
        } else {
          member.balance += split.amount
        }
      }
    })

    // Update group stats
    group.stats.totalExpenses -= expense.amount
    group.stats.expenseCount -= 1

    await group.save()
    await expense.deleteOne()

    return NextResponse.json({
      success: true,
      message: 'Expense deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting expense:', error)
    return NextResponse.json(
      { error: 'Failed to delete expense' },
      { status: 500 }
    )
  }
}
