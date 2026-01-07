/**
 * Split Groups API
 * Endpoints for creating and managing expense splitting groups
 */

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import dbConnect from '@/lib/dbConnect'
import SplitGroup from '@/models/SplitGroup'
import User from '@/models/User'
import { emailService } from '@/lib/emailService'

/**
 * GET /api/split/groups
 * Get all groups for the current user
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

    await dbConnect()

    // Get URL params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // active, settled, archived
    const limit = parseInt(searchParams.get('limit')) || 20
    const page = parseInt(searchParams.get('page')) || 1
    const skip = (page - 1) * limit

    // Build query
    const query = {
      'members.user': session.user.id
    }

    if (status && ['active', 'settled', 'archived'].includes(status)) {
      query.status = status
    }

    // Get groups
    const groups = await SplitGroup.find(query)
      .populate({ path: 'createdBy', select: 'name email avatar', options: { virtuals: false } })
      .populate({ path: 'members.user', select: 'name email avatar', options: { virtuals: false } })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await SplitGroup.countDocuments(query)

    // Calculate user's balance in each group
    const groupsWithBalance = groups.map(group => {
      const userMember = group.members.find(
        m => m.user._id.toString() === session.user.id
      )
      return {
        ...group,
        userBalance: userMember?.balance || 0,
        memberCount: group.members.length
      }
    })

    return NextResponse.json({
      success: true,
      groups: groupsWithBalance,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching groups:', error)
    return NextResponse.json(
      { error: 'Failed to fetch groups' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/split/groups
 * Create a new split group
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

    await dbConnect()

    const body = await request.json()
    const { name, description, type, memberEmails, currency } = body

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Group name is required' },
        { status: 400 }
      )
    }

    // Validate group type
    const validTypes = ['trip', 'home', 'couple', 'event', 'project', 'other']
    if (type && !validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid group type' },
        { status: 400 }
      )
    }

    // Build members array (creator is always a member)
    const members = [{
      user: session.user.id,
      role: 'admin',
      joinedAt: new Date(),
      balance: 0
    }]

    // Add other members by email if provided
    if (memberEmails && Array.isArray(memberEmails)) {
      for (const email of memberEmails) {
        if (email === session.user.email) continue // Skip creator

        const user = await User.findOne({ email: email.toLowerCase() })
        if (user) {
          members.push({
            user: user._id,
            role: 'member',
            joinedAt: new Date(),
            balance: 0
          })
        } else {
          // Add as pending member (email-only)
          members.push({
            email: email.toLowerCase(),
            role: 'member',
            status: 'pending',
            balance: 0
          })
        }
      }
    }

    // Create group
    const group = new SplitGroup({
      name: name.trim(),
      description: description?.trim() || '',
      type: type || 'other',
      createdBy: session.user.id,
      members,
      currency: currency || 'INR',
      stats: {
        totalExpenses: 0,
        totalSettled: 0,
        expenseCount: 0
      }
    })

    await group.save()

    // Populate for response
    await group.populate({ path: 'createdBy', select: 'name email avatar', options: { virtuals: false } })
    await group.populate({ path: 'members.user', select: 'name email avatar', options: { virtuals: false } })

    // Send invitation emails to non-registered members (async, don't wait)
    const pendingMembers = group.members.filter(m => m.status === 'pending' && m.email)
    if (pendingMembers.length > 0) {
      const creatorName = group.createdBy.name || 'Someone'
      
      pendingMembers.forEach(member => {
        emailService.sendSplitGroupInvitation({
          email: member.email,
          groupName: group.name,
          invitedBy: creatorName,
          groupId: group._id.toString()
        }).catch(err => console.error('Failed to send invitation email:', err))
      })
    }

    return NextResponse.json({
      success: true,
      group,
      message: 'Group created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating group:', error)
    return NextResponse.json(
      { error: 'Failed to create group' },
      { status: 500 }
    )
  }
}
