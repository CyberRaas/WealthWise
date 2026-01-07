/**
 * Individual Split Group API
 * Endpoints for single group operations
 */

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import dbConnect from '@/lib/dbConnect'
import SplitGroup from '@/models/SplitGroup'
import SplitExpense from '@/models/SplitExpense'
import Settlement from '@/models/Settlement'
import User from '@/models/User'
import { simplifyDebts, calculateBalances } from '@/lib/debtSimplifier'

/**
 * GET /api/split/groups/[id]
 * Get a single group with all details
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

    const group = await SplitGroup.findById(id)
      .populate({ path: 'createdBy', select: 'name email avatar', options: { virtuals: false } })
      .populate({ path: 'members.user', select: 'name email avatar', options: { virtuals: false } })
      .lean()

    if (!group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      )
    }

    // Check if user is a member
    const isMember = group.members.some(
      m => m.user?._id?.toString() === session.user.id
    )

    if (!isMember) {
      return NextResponse.json(
        { error: 'You are not a member of this group' },
        { status: 403 }
      )
    }

    // Get recent expenses
    const recentExpenses = await SplitExpense.find({ groupId: id })
      .populate('paidBy', 'name email avatar')
      .sort({ date: -1 })
      .limit(10)
      .lean()

    // Get settlements
    const settlements = await Settlement.find({ group: id })
      .populate('from', 'name email avatar')
      .populate('to', 'name email avatar')
      .sort({ settledAt: -1 })
      .lean()

    // Calculate simplified debts
    const expenses = await SplitExpense.find({ groupId: id }).lean()
    const expenseData = expenses.map(e => ({
      paidBy: e.paidBy.memberId.toString(),
      amount: e.amount,
      splits: (e.splitAmong || []).map(s => ({
        user: s.memberId.toString(),
        amount: s.amount
      }))
    }))

    const settlementData = settlements
      .filter(s => s.status === 'confirmed')
      .map(s => ({
        from: s.from._id.toString(),
        to: s.to._id.toString(),
        amount: s.amount
      }))

    const memberIds = group.members
      .filter(m => m.user)
      .map(m => m.user._id.toString())

    const balances = calculateBalances(expenseData, memberIds)
    const simplifiedDebts = simplifyDebts(expenseData, settlementData, memberIds)

    // Map user IDs to user info
    const memberMap = {}
    group.members.forEach(m => {
      if (m.user) {
        memberMap[m.user._id.toString()] = m.user
      }
    })

    const debtsWithNames = simplifiedDebts.map(debt => ({
      from: memberMap[debt.from],
      to: memberMap[debt.to],
      amount: debt.amount
    }))

    return NextResponse.json({
      success: true,
      group,
      recentExpenses,
      settlements,
      simplifiedDebts: debtsWithNames,
      balances: Object.entries(balances).map(([userId, balance]) => ({
        user: memberMap[userId],
        balance
      }))
    })
  } catch (error) {
    console.error('Error fetching group:', error)
    return NextResponse.json(
      { error: 'Failed to fetch group' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/split/groups/[id]
 * Update a group
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

    const group = await SplitGroup.findById(id)

    if (!group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      )
    }

    // Check if user is admin
    const member = group.members.find(
      m => m.user?.toString() === session.user.id
    )

    if (!member || member.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only group admin can update the group' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, description, type, status } = body

    // Update allowed fields
    if (name) group.name = name.trim()
    if (description !== undefined) group.description = description.trim()
    if (type) group.type = type
    if (status && ['active', 'settled', 'archived'].includes(status)) {
      group.status = status
    }

    await group.save()
    
    await group.populate({ path: 'createdBy', select: 'name email avatar', options: { virtuals: false } })
    await group.populate({ path: 'members.user', select: 'name email avatar', options: { virtuals: false } })

    return NextResponse.json({
      success: true,
      group,
      message: 'Group updated successfully'
    })
  } catch (error) {
    console.error('Error updating group:', error)
    return NextResponse.json(
      { error: 'Failed to update group' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/split/groups/[id]
 * Delete a group
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

    const group = await SplitGroup.findById(id)

    if (!group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      )
    }

    // Check if user is creator
    if (group.createdBy.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Only group creator can delete the group' },
        { status: 403 }
      )
    }

    // Check for unsettled balances
    const hasUnsettledBalances = group.members.some(m => Math.abs(m.balance) > 0.01)
    
    if (hasUnsettledBalances) {
      return NextResponse.json(
        { error: 'Cannot delete group with unsettled balances' },
        { status: 400 }
      )
    }

    // Delete related expenses and settlements
    await SplitExpense.deleteMany({ group: id })
    await Settlement.deleteMany({ group: id })
    await group.deleteOne()

    return NextResponse.json({
      success: true,
      message: 'Group deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting group:', error)
    return NextResponse.json(
      { error: 'Failed to delete group' },
      { status: 500 }
    )
  }
}
