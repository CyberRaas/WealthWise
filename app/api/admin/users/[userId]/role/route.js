/**
 * Admin User Role API
 *
 * PUT /api/admin/users/[userId]/role - Change user role
 */

import { ObjectId } from 'mongodb'
import { connectToDatabase } from '@/lib/database'
import { withAdminAuth, logAdminAction, adminSuccessResponse, adminErrorResponse } from '@/lib/admin/middleware'
import { PERMISSIONS, ROLES, ROLE_HIERARCHY, canManageRole, isSuperAdmin } from '@/lib/admin/permissions'

/**
 * PUT /api/admin/users/[userId]/role
 * Change user's role
 *
 * Body: { role: 'user' | 'moderator' | 'admin' | 'super_admin', permissions?: string[] }
 */
async function changeRoleHandler(request, { params, admin }) {
  try {
    const { userId } = await params
    const body = await request.json()

    if (!ObjectId.isValid(userId)) {
      return adminErrorResponse('Invalid user ID', 'INVALID_ID', 400)
    }

    const { role: newRole, permissions: customPermissions } = body

    // Validate new role
    const validRoles = Object.values(ROLES)
    if (!newRole || !validRoles.includes(newRole)) {
      return adminErrorResponse(`Invalid role. Must be one of: ${validRoles.join(', ')}`, 'INVALID_ROLE', 400)
    }

    const db = await connectToDatabase()

    // Get current user
    const currentUser = await db.collection('users').findOne(
      { _id: new ObjectId(userId) },
      { projection: { email: 1, name: 1, role: 1, adminProfile: 1 } }
    )

    if (!currentUser) {
      return adminErrorResponse('User not found', 'NOT_FOUND', 404)
    }

    const currentRole = currentUser.role || ROLES.USER

    // Check if admin can manage both current and new roles
    if (!canManageRole(admin.adminRole, currentRole)) {
      return adminErrorResponse('Cannot modify user with equal or higher privileges', 'INSUFFICIENT_PRIVILEGES', 403)
    }

    // Check if admin can assign the new role (must be lower than admin's role)
    const adminLevel = ROLE_HIERARCHY[admin.adminRole]
    const newRoleLevel = ROLE_HIERARCHY[newRole]

    if (newRoleLevel >= adminLevel) {
      return adminErrorResponse('Cannot assign role equal to or higher than your own', 'INSUFFICIENT_PRIVILEGES', 403)
    }

    // Only super_admin can create other super_admins
    if (newRole === ROLES.SUPER_ADMIN && !isSuperAdmin(admin.adminRole)) {
      return adminErrorResponse('Only super admin can create other super admins', 'FORBIDDEN', 403)
    }

    // Prevent self-demotion for super_admin
    if (admin.adminId.toString() === userId && admin.adminRole === ROLES.SUPER_ADMIN) {
      return adminErrorResponse('Super admin cannot demote themselves', 'SELF_DEMOTION', 403)
    }

    // Build update data
    const updateData = {
      role: newRole,
      updatedAt: new Date()
    }

    // If promoting to admin role, add admin profile
    if (newRole !== ROLES.USER && currentRole === ROLES.USER) {
      updateData.adminProfile = {
        permissions: customPermissions || [],
        department: '',
        adminNotes: '',
        lastAdminAction: null,
        adminCreatedAt: new Date(),
        adminCreatedBy: admin.adminId
      }
    } else if (newRole !== ROLES.USER) {
      // Update existing admin profile
      updateData['adminProfile.permissions'] = customPermissions || currentUser.adminProfile?.permissions || []
    } else if (newRole === ROLES.USER) {
      // Demoting to user - clear admin profile
      updateData.adminProfile = null
    }

    // Update permissions if provided for existing admin
    if (customPermissions && Array.isArray(customPermissions) && newRole !== ROLES.USER) {
      updateData['adminProfile.permissions'] = customPermissions
    }

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    )

    if (result.modifiedCount === 0 && currentRole === newRole) {
      return adminSuccessResponse({ unchanged: true }, 'Role unchanged')
    }

    // Determine action type for audit
    let actionType = 'user:role_change'
    let actionDesc = `Changed role for ${currentUser.email}: ${currentRole} → ${newRole}`

    if (newRole !== ROLES.USER && currentRole === ROLES.USER) {
      actionType = 'admin:create'
      actionDesc = `Granted admin privileges to ${currentUser.email} (role: ${newRole})`
    } else if (newRole === ROLES.USER && currentRole !== ROLES.USER) {
      actionType = 'admin:revoke'
      actionDesc = `Revoked admin privileges from ${currentUser.email}`
    }

    // Log the action
    await logAdminAction({
      admin,
      action: actionType,
      targetType: 'user',
      targetId: currentUser._id,
      targetEmail: currentUser.email,
      description: actionDesc,
      previousValue: {
        role: currentRole,
        permissions: currentUser.adminProfile?.permissions || []
      },
      newValue: {
        role: newRole,
        permissions: customPermissions || []
      },
      status: 'success'
    })

    return adminSuccessResponse(
      {
        userId: userId,
        previousRole: currentRole,
        newRole: newRole,
        permissions: customPermissions || []
      },
      `User role changed successfully to ${newRole}`
    )

  } catch (error) {
    console.error('Error changing user role:', error)
    return adminErrorResponse('Failed to change user role', 'UPDATE_ERROR', 500)
  }
}

export const PUT = withAdminAuth(changeRoleHandler, {
  requiredPermissions: [PERMISSIONS.ADMIN_UPDATE]
})
