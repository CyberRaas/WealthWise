/**
 * Admin User Suspend API
 *
 * POST /api/admin/users/[userId]/suspend - Suspend or unsuspend user
 */

import { ObjectId } from 'mongodb'
import { connectToDatabase } from '@/lib/database'
import { withAdminAuth, logAdminAction, adminSuccessResponse, adminErrorResponse } from '@/lib/admin/middleware'
import { PERMISSIONS, canManageRole, ROLES } from '@/lib/admin/permissions'

/**
 * POST /api/admin/users/[userId]/suspend
 * Toggle user suspension status
 *
 * Body: { action: 'suspend' | 'unsuspend', reason?: string }
 */
async function suspendUserHandler(request, { params, admin }) {
  try {
    const { userId } = await params
    const body = await request.json()

    if (!ObjectId.isValid(userId)) {
      return adminErrorResponse('Invalid user ID', 'INVALID_ID', 400)
    }

    const { action, reason } = body

    if (!action || !['suspend', 'unsuspend'].includes(action)) {
      return adminErrorResponse('Invalid action. Must be "suspend" or "unsuspend"', 'INVALID_ACTION', 400)
    }

    const db = await connectToDatabase()

    // Get current user
    const currentUser = await db.collection('users').findOne(
      { _id: new ObjectId(userId) },
      { projection: { email: 1, name: 1, status: 1, role: 1 } }
    )

    if (!currentUser) {
      return adminErrorResponse('User not found', 'NOT_FOUND', 404)
    }

    // Check if admin can manage this user
    const targetRole = currentUser.role || 'user'
    if (!canManageRole(admin.adminRole, targetRole)) {
      return adminErrorResponse('Cannot suspend user with equal or higher privileges', 'INSUFFICIENT_PRIVILEGES', 403)
    }

    // Prevent suspending super_admin
    if (targetRole === ROLES.SUPER_ADMIN) {
      return adminErrorResponse('Cannot suspend super admin accounts', 'PROTECTED_USER', 403)
    }

    // Check current status
    const currentStatus = currentUser.status || 'active'

    if (action === 'suspend' && currentStatus === 'suspended') {
      return adminErrorResponse('User is already suspended', 'ALREADY_SUSPENDED', 400)
    }

    if (action === 'unsuspend' && currentStatus !== 'suspended') {
      return adminErrorResponse('User is not suspended', 'NOT_SUSPENDED', 400)
    }

    // Update user status
    const newStatus = action === 'suspend' ? 'suspended' : 'active'
    const updateData = {
      status: newStatus,
      updatedAt: new Date()
    }

    if (action === 'suspend') {
      updateData.suspendedAt = new Date()
      updateData.suspendedBy = admin.adminId
      updateData.suspensionReason = reason || 'No reason provided'
    } else {
      updateData.unsuspendedAt = new Date()
      updateData.unsuspendedBy = admin.adminId
    }

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    )

    if (result.modifiedCount === 0) {
      return adminErrorResponse('Failed to update user status', 'UPDATE_FAILED', 500)
    }

    // Log the action
    await logAdminAction({
      admin,
      action: action === 'suspend' ? 'user:suspend' : 'user:unsuspend',
      targetType: 'user',
      targetId: currentUser._id,
      targetEmail: currentUser.email,
      description: action === 'suspend'
        ? `Suspended user: ${currentUser.email}${reason ? ` (Reason: ${reason})` : ''}`
        : `Unsuspended user: ${currentUser.email}`,
      previousValue: { status: currentStatus },
      newValue: { status: newStatus, reason: reason || null },
      status: 'success'
    })

    return adminSuccessResponse(
      {
        userId: userId,
        previousStatus: currentStatus,
        newStatus: newStatus,
        action: action
      },
      action === 'suspend' ? 'User suspended successfully' : 'User unsuspended successfully'
    )

  } catch (error) {
    console.error('Error suspending/unsuspending user:', error)
    return adminErrorResponse('Failed to update user status', 'UPDATE_ERROR', 500)
  }
}

export const POST = withAdminAuth(suspendUserHandler, {
  requiredPermissions: [PERMISSIONS.USERS_SUSPEND]
})
