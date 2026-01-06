/**
 * Admin Single User API
 *
 * GET /api/admin/users/[userId] - Get user details
 * PUT /api/admin/users/[userId] - Update user
 * DELETE /api/admin/users/[userId] - Delete user
 */

import { ObjectId } from 'mongodb'
import { connectToDatabase } from '@/lib/database'
import { withAdminAuth, logAdminAction, adminSuccessResponse, adminErrorResponse } from '@/lib/admin/middleware'
import { PERMISSIONS, canManageRole, ROLES } from '@/lib/admin/permissions'

/**
 * GET /api/admin/users/[userId]
 * Get detailed user information
 */
async function getUserHandler(request, { params, admin }) {
  try {
    const { userId } = await params

    if (!ObjectId.isValid(userId)) {
      return adminErrorResponse('Invalid user ID', 'INVALID_ID', 400)
    }

    const db = await connectToDatabase()

    const user = await db.collection('users').findOne(
      { _id: new ObjectId(userId) },
      {
        projection: {
          password: 0 // Exclude password
        }
      }
    )

    if (!user) {
      return adminErrorResponse('User not found', 'NOT_FOUND', 404)
    }

    // Get user statistics
    const [expenseCount, incomeCount, goalCount, budgetCount] = await Promise.all([
      db.collection('expenses').countDocuments({ userId: new ObjectId(userId) }),
      db.collection('incomes').countDocuments({ userId: new ObjectId(userId) }),
      db.collection('goals').countDocuments({ userId: new ObjectId(userId) }),
      db.collection('budgets').countDocuments({ userId: new ObjectId(userId) })
    ])

    // Format user for response
    const formattedUser = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      image: user.image || user.avatar,
      role: user.role || 'user',
      status: user.status || 'active',
      emailVerified: user.emailVerified || user.isEmailVerified,
      subscription: user.subscription || { plan: 'free', status: 'active' },
      preferences: user.preferences || {},
      profile: user.profile || {},
      activity: user.activity || {},
      onboarding: user.onboarding || { completed: false },
      security: {
        lastLogin: user.security?.lastLogin,
        loginCount: user.security?.loginCount || 0,
        twoFactorEnabled: user.security?.twoFactorEnabled || false
      },
      adminProfile: user.role !== 'user' ? {
        permissions: user.adminProfile?.permissions || [],
        department: user.adminProfile?.department || '',
        adminCreatedAt: user.adminProfile?.adminCreatedAt
      } : null,
      statistics: {
        expenses: expenseCount,
        incomes: incomeCount,
        goals: goalCount,
        budgets: budgetCount
      },
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }

    // Log the action
    await logAdminAction({
      admin,
      action: 'user:view',
      targetType: 'user',
      targetId: user._id,
      targetEmail: user.email,
      description: `Viewed user details: ${user.email}`,
      status: 'success'
    })

    return adminSuccessResponse(formattedUser, 'User retrieved successfully')

  } catch (error) {
    console.error('Error fetching user:', error)
    return adminErrorResponse('Failed to fetch user', 'FETCH_ERROR', 500)
  }
}

/**
 * PUT /api/admin/users/[userId]
 * Update user information
 */
async function updateUserHandler(request, { params, admin }) {
  try {
    const { userId } = await params

    if (!ObjectId.isValid(userId)) {
      return adminErrorResponse('Invalid user ID', 'INVALID_ID', 400)
    }

    const body = await request.json()

    // Allowed fields for update
    const allowedFields = ['name', 'status', 'preferences', 'profile', 'subscription']
    const updateData = {}

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return adminErrorResponse('No valid fields to update', 'NO_FIELDS', 400)
    }

    const db = await connectToDatabase()

    // Get current user data for audit
    const currentUser = await db.collection('users').findOne(
      { _id: new ObjectId(userId) },
      { projection: { email: 1, name: 1, status: 1, preferences: 1, profile: 1, subscription: 1, role: 1 } }
    )

    if (!currentUser) {
      return adminErrorResponse('User not found', 'NOT_FOUND', 404)
    }

    // Check if admin can manage this user's role
    const targetRole = currentUser.role || 'user'
    if (!canManageRole(admin.adminRole, targetRole)) {
      return adminErrorResponse('Cannot modify user with equal or higher privileges', 'INSUFFICIENT_PRIVILEGES', 403)
    }

    // Prepare previous value for audit
    const previousValue = {}
    for (const field of Object.keys(updateData)) {
      previousValue[field] = currentUser[field]
    }

    // Update user
    updateData.updatedAt = new Date()

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    )

    if (result.modifiedCount === 0) {
      return adminErrorResponse('Failed to update user', 'UPDATE_FAILED', 500)
    }

    // Log the action
    await logAdminAction({
      admin,
      action: 'user:update',
      targetType: 'user',
      targetId: currentUser._id,
      targetEmail: currentUser.email,
      description: `Updated user: ${currentUser.email} (fields: ${Object.keys(updateData).join(', ')})`,
      previousValue,
      newValue: updateData,
      status: 'success'
    })

    return adminSuccessResponse({ updated: true }, 'User updated successfully')

  } catch (error) {
    console.error('Error updating user:', error)
    return adminErrorResponse('Failed to update user', 'UPDATE_ERROR', 500)
  }
}

/**
 * DELETE /api/admin/users/[userId]
 * Soft delete user (mark as deleted)
 */
async function deleteUserHandler(request, { params, admin }) {
  try {
    const { userId } = await params

    if (!ObjectId.isValid(userId)) {
      return adminErrorResponse('Invalid user ID', 'INVALID_ID', 400)
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

    // Check if admin can delete this user
    const targetRole = currentUser.role || 'user'
    if (!canManageRole(admin.adminRole, targetRole)) {
      return adminErrorResponse('Cannot delete user with equal or higher privileges', 'INSUFFICIENT_PRIVILEGES', 403)
    }

    // Prevent deleting super_admin
    if (targetRole === ROLES.SUPER_ADMIN) {
      return adminErrorResponse('Cannot delete super admin accounts', 'PROTECTED_USER', 403)
    }

    // Soft delete - mark as deleted
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          status: 'deleted',
          deletedAt: new Date(),
          deletedBy: admin.adminId,
          updatedAt: new Date()
        }
      }
    )

    if (result.modifiedCount === 0) {
      return adminErrorResponse('Failed to delete user', 'DELETE_FAILED', 500)
    }

    // Log the action
    await logAdminAction({
      admin,
      action: 'user:delete',
      targetType: 'user',
      targetId: currentUser._id,
      targetEmail: currentUser.email,
      description: `Deleted user: ${currentUser.email}`,
      previousValue: { status: currentUser.status },
      newValue: { status: 'deleted' },
      status: 'success'
    })

    return adminSuccessResponse({ deleted: true }, 'User deleted successfully')

  } catch (error) {
    console.error('Error deleting user:', error)
    return adminErrorResponse('Failed to delete user', 'DELETE_ERROR', 500)
  }
}

export const GET = withAdminAuth(getUserHandler, {
  requiredPermissions: [PERMISSIONS.USERS_READ]
})

export const PUT = withAdminAuth(updateUserHandler, {
  requiredPermissions: [PERMISSIONS.USERS_WRITE]
})

export const DELETE = withAdminAuth(deleteUserHandler, {
  requiredPermissions: [PERMISSIONS.USERS_DELETE]
})
