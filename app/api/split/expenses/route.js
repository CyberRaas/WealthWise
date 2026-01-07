/**
 * Split Expenses API
 * Endpoints for managing expenses in a group
 */

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import dbConnect from '@/lib/dbConnect'
import SplitGroup from '@/models/SplitGroup'
import SplitExpense from '@/models/SplitExpense'
import { emailService } from '@/lib/emailService'

/**
 * GET /api/split/expenses
 * Get expenses for a group
 */
export async function GET(request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const groupId = searchParams.get('groupId')
    const limit = parseInt(searchParams.get('limit')) || 50
    const page = parseInt(searchParams.get('page')) || 1
    const skip = (page - 1) * limit

    if (!groupId) {
      return NextResponse.json(
        { error: 'groupId is required' },
        { status: 400 }
      )
    }

    await dbConnect()

    // Verify user is a member of the group
    const group = await SplitGroup.findById(groupId)
    if (!group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      )
    }

    const isMember = group.members.some(
      m => m.user?.toString() === session.user.id
    )

    if (!isMember) {
      return NextResponse.json(
        { error: 'You are not a member of this group' },
        { status: 403 }
      )
    }

    // Get expenses
    const expenses = await SplitExpense.find({ groupId: groupId })
      .populate({ path: 'addedBy', select: 'name email avatar', options: { virtuals: false } })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await SplitExpense.countDocuments({ groupId: groupId })

    return NextResponse.json({
      success: true,
      expenses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/split/expenses
 * Add a new expense to a group
 */
export async function POST(request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      groupId,
      description,
      amount,
      category,
      paidBy,
      splitType,
      splits,
      date,
      notes,
      receipt
    } = body

    // Validate required fields
    if (!groupId || !description || !amount) {
      return NextResponse.json(
        { error: 'groupId, description, and amount are required' },
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be positive' },
        { status: 400 }
      )
    }

    await dbConnect()

    // Get group and verify membership
    const group = await SplitGroup.findById(groupId)
      .populate({
        path: 'members.user',
        select: 'name email'
      })
      .lean()
      
    if (!group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      )
    }

    const isMember = group.members.some(
      m => m.user?._id?.toString() === session.user.id
    )

    if (!isMember) {
      return NextResponse.json(
        { error: 'You are not a member of this group' },
        { status: 403 }
      )
    }

    // Get payer info
    const payerMember = group.members.find(
      m => m.user?._id?.toString() === (paidBy || session.user.id)
    )
    
    if (!payerMember) {
      return NextResponse.json(
        { error: 'Payer must be a member of the group' },
        { status: 400 }
      )
    }

    // Create expense
    const expense = new SplitExpense({
      groupId: groupId,
      description: description.trim(),
      amount,
      category: category || 'other',
      paidBy: {
        memberId: payerMember.user._id,
        memberName: payerMember.user.name
      },
      splitType: splitType || 'equal',
      date: date ? new Date(date) : new Date(),
      notes: notes?.trim(),
      receipt,
      addedBy: session.user.id
    })

    // Calculate splits based on split type
    if (splitType === 'equal' || !splits) {
      // Equal split among all members
      const memberIds = group.members
        .filter(m => m.user)
        .map(m => m.user._id.toString())
      const memberNames = group.members
        .filter(m => m.user)
        .map(m => m.user.name)
      expense.calculateEqualSplit(memberIds, memberNames)
    } else if (splitType === 'exact' && splits) {
      // Convert frontend splits format to model format
      const formattedSplits = splits.map(s => {
        const member = group.members.find(m => m.user._id.toString() === s.user)
        return {
          memberId: s.user,
          memberName: member?.user?.name || 'Unknown',
          amount: s.amount
        }
      })
      expense.setExactSplit(formattedSplits)
    } else if (splitType === 'percentage' && splits) {
      // Convert frontend splits format to model format
      const formattedSplits = splits.map(s => {
        const member = group.members.find(m => m.user._id.toString() === s.user)
        return {
          memberId: s.user,
          memberName: member?.user?.name || 'Unknown',
          percentage: s.percentage
        }
      })
      expense.setPercentageSplit(formattedSplits)
    }

    await expense.save()

    // Reload group as document to update it
    const groupDoc = await SplitGroup.findById(groupId)
    
    // Update group stats
    groupDoc.totalExpenses = (groupDoc.totalExpenses || 0) + amount
    groupDoc.expenseCount = (groupDoc.expenseCount || 0) + 1

    // Update member balances
    // The payer's balance increases (others owe them)
    // Each participant's balance decreases (they owe)
    const payerId = payerMember.user._id.toString()
    
    expense.splitAmong.forEach(split => {
      const member = groupDoc.members.find(
        m => m.user?.toString() === split.memberId.toString()
      )
      if (member) {
        if (member.user.toString() === payerId) {
          // Payer paid for others
          member.balance += (amount - split.amount)
        } else {
          // Non-payer owes their share
          member.balance -= split.amount
        }
      }
    })

    await groupDoc.save()

    // Return lean expense
    const expenseResponse = await SplitExpense.findById(expense._id)
      .populate({ path: 'addedBy', select: 'name email avatar' })
      .lean()

    // Send notifications to group members (async, don't block response)
    const addedByUser = await SplitExpense.findById(expense._id).populate('addedBy', 'name').lean()
    const addedByName = addedByUser?.addedBy?.name || 'Someone'
    
    groupDoc.members.forEach(member => {
      // Skip the person who added the expense
      if (member.user?.toString() === session.user.id) return
      
      // Send email to registered users
      if (member.user && member.email) {
        emailService.sendExpenseAddedNotification({
          email: member.email,
          userName: member.name,
          groupName: groupDoc.name,
          expenseDescription: description,
          amount,
          addedBy: addedByName
        }).catch(err => console.error('Failed to send expense notification:', err))
      }
      // Send email to pending members
      else if (member.email && member.status === 'pending') {
        emailService.sendExpenseAddedNotification({
          email: member.email,
          userName: member.name,
          groupName: groupDoc.name,
          expenseDescription: description,
          amount,
          addedBy: addedByName
        }).catch(err => console.error('Failed to send expense notification:', err))
      }
    })

    return NextResponse.json({
      success: true,
      expense: expenseResponse,
      message: 'Expense added successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error adding expense:', error)
    return NextResponse.json(
      { error: 'Failed to add expense' },
      { status: 500 }
    )
  }
}
