/**
 * Settlements API
 * Endpoints for managing settlements between group members
 */

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import dbConnect from '@/lib/dbConnect'
import SplitGroup from '@/models/SplitGroup'
import SplitExpense from '@/models/SplitExpense'
import Settlement from '@/models/Settlement'
import { simplifyDebts, calculateBalances } from '@/lib/debtSimplifier'

/**
 * GET /api/split/settlements
 * Get settlements for a group or get simplified debts
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
    const simplified = searchParams.get('simplified') === 'true'

    if (!groupId) {
      return NextResponse.json(
        { error: 'groupId is required' },
        { status: 400 }
      )
    }

    await dbConnect()

    // Verify membership
    const group = await SplitGroup.findById(groupId)
      .populate({ path: 'members.user', select: 'name email avatar', options: { virtuals: false } })
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

    // Get settlements
    const settlements = await Settlement.find({ group: groupId })
      .populate('from', 'name email avatar')
      .populate('to', 'name email avatar')
      .sort({ settledAt: -1 })
      .lean()

    // If simplified view is requested, calculate optimal settlements
    if (simplified) {
      const expenses = await SplitExpense.find({ group: groupId }).lean()
      
      const expenseData = expenses.map(e => ({
        paidBy: e.paidBy.toString(),
        amount: e.amount,
        splits: e.splits.map(s => ({
          user: s.user.toString(),
          amount: s.amount
        }))
      }))

      const confirmedSettlements = settlements
        .filter(s => s.status === 'confirmed')
        .map(s => ({
          from: s.from._id.toString(),
          to: s.to._id.toString(),
          amount: s.amount
        }))

      const memberIds = group.members
        .filter(m => m.user)
        .map(m => m.user._id.toString())

      const simplifiedDebts = simplifyDebts(expenseData, confirmedSettlements, memberIds)
      const balances = calculateBalances(expenseData, memberIds)

      // Map to user info
      const memberMap = {}
      group.members.forEach(m => {
        if (m.user) {
          memberMap[m.user._id.toString()] = m.user
        }
      })

      const debtsWithNames = simplifiedDebts.map(debt => ({
        from: memberMap[debt.from],
        to: memberMap[debt.to],
        amount: Math.round(debt.amount * 100) / 100
      }))

      const balancesWithNames = Object.entries(balances).map(([userId, balance]) => ({
        user: memberMap[userId],
        balance: Math.round(balance * 100) / 100
      }))

      return NextResponse.json({
        success: true,
        simplifiedDebts: debtsWithNames,
        balances: balancesWithNames,
        settlements
      })
    }

    return NextResponse.json({
      success: true,
      settlements
    })
  } catch (error) {
    console.error('Error fetching settlements:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settlements' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/split/settlements
 * Record a new settlement
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
    const { groupId, to, amount, paymentMethod, notes } = body

    // Validate required fields
    if (!groupId || !to || !amount) {
      return NextResponse.json(
        { error: 'groupId, to, and amount are required' },
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

    // Verify group and membership
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

    // Cannot settle with yourself
    if (to === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot settle with yourself' },
        { status: 400 }
      )
    }

    // Create settlement
    const settlement = new Settlement({
      group: groupId,
      from: session.user.id,
      to,
      amount,
      paymentMethod: paymentMethod || 'upi',
      notes: notes?.trim(),
      status: 'pending',
      settledAt: new Date()
    })

    await settlement.save()

    await settlement.populate('from', 'name email avatar')
    await settlement.populate('to', 'name email avatar')

    return NextResponse.json({
      success: true,
      settlement,
      message: 'Settlement recorded. Waiting for confirmation.'
    }, { status: 201 })
  } catch (error) {
    console.error('Error recording settlement:', error)
    return NextResponse.json(
      { error: 'Failed to record settlement' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/split/settlements
 * Confirm or reject a settlement
 */
export async function PATCH(request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { settlementId, action } = body

    if (!settlementId || !action) {
      return NextResponse.json(
        { error: 'settlementId and action are required' },
        { status: 400 }
      )
    }

    if (!['confirm', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'action must be "confirm" or "reject"' },
        { status: 400 }
      )
    }

    await dbConnect()

    const settlement = await Settlement.findById(settlementId)

    if (!settlement) {
      return NextResponse.json(
        { error: 'Settlement not found' },
        { status: 404 }
      )
    }

    // Only recipient can confirm/reject
    if (settlement.to.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the recipient can confirm or reject' },
        { status: 403 }
      )
    }

    if (settlement.status !== 'pending') {
      return NextResponse.json(
        { error: 'Settlement is not pending' },
        { status: 400 }
      )
    }

    if (action === 'confirm') {
      settlement.status = 'confirmed'
      settlement.confirmedAt = new Date()

      // Update group balances
      const group = await SplitGroup.findById(settlement.group)
      
      const fromMember = group.members.find(
        m => m.user?.toString() === settlement.from.toString()
      )
      const toMember = group.members.find(
        m => m.user?.toString() === settlement.to.toString()
      )

      if (fromMember) {
        fromMember.balance += settlement.amount
      }
      if (toMember) {
        toMember.balance -= settlement.amount
      }

      group.stats.totalSettled += settlement.amount
      await group.save()
    } else {
      settlement.status = 'rejected'
    }

    await settlement.save()
    await settlement.populate('from', 'name email avatar')
    await settlement.populate('to', 'name email avatar')

    return NextResponse.json({
      success: true,
      settlement,
      message: action === 'confirm' ? 'Settlement confirmed' : 'Settlement rejected'
    })
  } catch (error) {
    console.error('Error updating settlement:', error)
    return NextResponse.json(
      { error: 'Failed to update settlement' },
      { status: 500 }
    )
  }
}
