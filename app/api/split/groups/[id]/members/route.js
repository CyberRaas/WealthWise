/**
 * Group Members API
 * Endpoints for managing group members
 */

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import dbConnect from '@/lib/dbConnect'
import SplitGroup from '@/models/SplitGroup'
import User from '@/models/User'
import { emailService } from '@/lib/emailService'

/**
 * POST /api/split/groups/[id]/members
 * Add a member to the group
 */
export async function POST(request, { params }) {
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
    const currentMember = group.members.find(
      m => m.user?.toString() === session.user.id
    )

    if (!currentMember || currentMember.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only group admin can add members' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { email, name } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check if already a member
    const existingMember = group.members.find(
      m => (m.user && m.email === normalizedEmail) || m.email === normalizedEmail
    )

    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a member of this group' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await User.findOne({ email: normalizedEmail })

    if (user) {
      // Add as registered user
      group.members.push({
        user: user._id,
        role: 'member',
        joinedAt: new Date(),
        balance: 0
      })
    } else {
      // Add as pending member (email-only, for users not yet registered)
      group.members.push({
        email: normalizedEmail,
        name: name || email.split('@')[0],
        role: 'member',
        status: 'pending',
        balance: 0
      })
    }

    await group.save()
    await group.populate({ path: 'members.user', select: 'name email avatar', options: { virtuals: false } })

    // Send invitation email to non-registered member
    if (!user && normalizedEmail) {
      await group.populate({ path: 'createdBy', select: 'name email avatar', options: { virtuals: false } })

      emailService.sendSplitGroupInvitation({
        email: normalizedEmail,
        groupName: group.name,
        invitedBy: group.createdBy?.name || 'Someone',
        groupId: group._id.toString()
      }).catch(err => console.error('Failed to send invitation email:', err))
    }

    return NextResponse.json({
      success: true,
      group,
      message: user ? 'Member added successfully' : 'Member invited (pending registration)'
    })
  } catch (error) {
    console.error('Error adding member:', error)
    return NextResponse.json(
      { error: 'Failed to add member' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/split/groups/[id]/members
 * Remove a member from the group
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
    const { searchParams } = new URL(request.url)
    const memberUserId = searchParams.get('userId')
    const memberEmail = searchParams.get('email')

    if (!memberUserId && !memberEmail) {
      return NextResponse.json(
        { error: 'userId or email is required' },
        { status: 400 }
      )
    }

    await dbConnect()

    const group = await SplitGroup.findById(id)

    if (!group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      )
    }

    // Check if requester is admin or removing themselves
    const currentMember = group.members.find(
      m => m.user?.toString() === session.user.id
    )

    const isAdmin = currentMember?.role === 'admin'
    const isRemovingSelf = memberUserId === session.user.id

    if (!isAdmin && !isRemovingSelf) {
      return NextResponse.json(
        { error: 'Only admin can remove members' },
        { status: 403 }
      )
    }

    // Find member to remove
    const memberIndex = group.members.findIndex(m => {
      if (memberUserId) {
        return m.user?.toString() === memberUserId
      }
      return m.email === memberEmail
    })

    if (memberIndex === -1) {
      return NextResponse.json(
        { error: 'Member not found in group' },
        { status: 404 }
      )
    }

    const memberToRemove = group.members[memberIndex]

    // Cannot remove member with non-zero balance
    if (Math.abs(memberToRemove.balance) > 0.01) {
      return NextResponse.json(
        { error: 'Cannot remove member with unsettled balance' },
        { status: 400 }
      )
    }

    // Cannot remove last admin
    if (memberToRemove.role === 'admin') {
      const adminCount = group.members.filter(m => m.role === 'admin').length
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot remove the only admin. Transfer admin role first.' },
          { status: 400 }
        )
      }
    }

    // Remove member
    group.members.splice(memberIndex, 1)
    await group.save()

    return NextResponse.json({
      success: true,
      message: 'Member removed successfully'
    })
  } catch (error) {
    console.error('Error removing member:', error)
    return NextResponse.json(
      { error: 'Failed to remove member' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/split/groups/[id]/members
 * Update member role
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
    const currentMember = group.members.find(
      m => m.user?.toString() === session.user.id
    )

    if (!currentMember || currentMember.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admin can update member roles' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { userId, role } = body

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'userId and role are required' },
        { status: 400 }
      )
    }

    if (!['admin', 'member'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    const memberToUpdate = group.members.find(
      m => m.user?.toString() === userId
    )

    if (!memberToUpdate) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    // Cannot demote last admin
    if (memberToUpdate.role === 'admin' && role === 'member') {
      const adminCount = group.members.filter(m => m.role === 'admin').length
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot demote the only admin' },
          { status: 400 }
        )
      }
    }

    memberToUpdate.role = role
    await group.save()

    return NextResponse.json({
      success: true,
      message: 'Member role updated successfully'
    })
  } catch (error) {
    console.error('Error updating member:', error)
    return NextResponse.json(
      { error: 'Failed to update member' },
      { status: 500 }
    )
  }
}
