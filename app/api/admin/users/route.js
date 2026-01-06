/**
 * Admin Users API
 *
 * GET /api/admin/users - List all users with pagination, filtering, and search
 */

import { connectToDatabase } from '@/lib/database'
import { withAdminAuth, logAdminAction, adminSuccessResponse, adminErrorResponse } from '@/lib/admin/middleware'
import { PERMISSIONS } from '@/lib/admin/permissions'
import {
  buildAdminQuery,
  formatListResponse,
  USER_FILTER_CONFIG,
  USER_SEARCH_FIELDS,
  USER_SORT_FIELDS
} from '@/lib/admin/queryUtils'

/**
 * GET /api/admin/users
 * List users with pagination, filtering, sorting, and search
 */
async function getUsersHandler(request, { admin }) {
  try {
    const { searchParams } = new URL(request.url)

    // Build query with all parameters
    const { query, pagination, sort, searchTerm, dateFrom, dateTo } = buildAdminQuery(searchParams, {
      searchFields: USER_SEARCH_FIELDS,
      filterConfig: USER_FILTER_CONFIG,
      sortFields: USER_SORT_FIELDS,
      defaultSort: 'createdAt',
      dateField: 'createdAt',
      baseQuery: {}
    })

    const db = await connectToDatabase()

    // Get total count
    const total = await db.collection('users').countDocuments(query)

    // Get paginated results
    const users = await db.collection('users')
      .find(query)
      .project({
        // Exclude sensitive fields
        password: 0,
        'adminProfile.adminNotes': 0
      })
      .sort(sort.mongoSort)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .toArray()

    // Format users for response
    const formattedUsers = users.map(user => ({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      image: user.image || user.avatar,
      role: user.role || 'user',
      status: user.status || 'active',
      emailVerified: user.emailVerified || user.isEmailVerified,
      subscription: {
        plan: user.subscription?.plan || 'free',
        status: user.subscription?.status || 'active'
      },
      preferences: {
        language: user.preferences?.language || 'en',
        currency: user.preferences?.currency || 'INR'
      },
      activity: {
        lastActiveAt: user.activity?.lastActiveAt,
        totalSessions: user.activity?.totalSessions || 0
      },
      onboarding: {
        completed: user.onboarding?.completed || false
      },
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }))

    // Log the action
    await logAdminAction({
      admin,
      action: 'user:list',
      targetType: 'user',
      description: `Listed users (page ${pagination.page}, ${users.length} results)${searchTerm ? ` with search: "${searchTerm}"` : ''}`,
      status: 'success'
    })

    return adminSuccessResponse(
      formatListResponse(formattedUsers, total, pagination, {
        filters: {
          search: searchTerm,
          dateFrom,
          dateTo,
          ...Object.fromEntries(
            Object.keys(USER_FILTER_CONFIG)
              .map(key => [key, searchParams.get(key)])
              .filter(([_, value]) => value)
          )
        }
      }).data,
      'Users retrieved successfully'
    )

  } catch (error) {
    console.error('Error fetching users:', error)
    return adminErrorResponse('Failed to fetch users', 'FETCH_ERROR', 500)
  }
}

export const GET = withAdminAuth(getUsersHandler, {
  requiredPermissions: [PERMISSIONS.USERS_READ]
})
