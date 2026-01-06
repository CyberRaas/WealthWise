/**
 * Admin Audit Logs API
 *
 * GET /api/admin/audit - Get audit logs with filtering and pagination
 */

import { connectToDatabase } from '@/lib/database'
import { withAdminAuth, logAdminAction, adminSuccessResponse, adminErrorResponse } from '@/lib/admin/middleware'
import { PERMISSIONS } from '@/lib/admin/permissions'
import {
  buildAdminQuery,
  formatListResponse,
  AUDIT_FILTER_CONFIG,
  AUDIT_SEARCH_FIELDS,
  AUDIT_SORT_FIELDS
} from '@/lib/admin/queryUtils'

/**
 * GET /api/admin/audit
 * List audit logs with filtering, pagination, and search
 */
async function getAuditLogsHandler(request, { admin }) {
  try {
    const { searchParams } = new URL(request.url)

    // Build query with all parameters
    const { query, pagination, sort, searchTerm, dateFrom, dateTo } = buildAdminQuery(searchParams, {
      searchFields: AUDIT_SEARCH_FIELDS,
      filterConfig: AUDIT_FILTER_CONFIG,
      sortFields: AUDIT_SORT_FIELDS,
      defaultSort: 'createdAt',
      dateField: 'createdAt',
      baseQuery: {}
    })

    const db = await connectToDatabase()

    // Get total count
    const total = await db.collection('admin_audit_logs').countDocuments(query)

    // Get paginated results
    const logs = await db.collection('admin_audit_logs')
      .find(query)
      .sort(sort.mongoSort)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .toArray()

    // Format logs for response
    const formattedLogs = logs.map(log => ({
      id: log._id.toString(),
      adminId: log.adminId?.toString(),
      adminEmail: log.adminEmail,
      adminRole: log.adminRole,
      action: log.action,
      targetType: log.targetType,
      targetId: log.targetId?.toString(),
      targetEmail: log.targetEmail,
      description: log.description,
      previousValue: log.previousValue,
      newValue: log.newValue,
      metadata: {
        ipAddress: log.metadata?.ipAddress,
        userAgent: log.metadata?.userAgent?.substring(0, 100), // Truncate user agent
        requestId: log.metadata?.requestId
      },
      status: log.status,
      errorMessage: log.errorMessage,
      createdAt: log.createdAt
    }))

    // Get aggregated statistics for the current filter
    const statsQuery = { ...query }
    delete statsQuery.createdAt // Remove date filter for overall stats

    const stats = await db.collection('admin_audit_logs').aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          success: { $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] } },
          failure: { $sum: { $cond: [{ $eq: ['$status', 'failure'] }, 1, 0] } },
          uniqueAdmins: { $addToSet: '$adminEmail' }
        }
      },
      {
        $project: {
          total: 1,
          success: 1,
          failure: 1,
          uniqueAdminCount: { $size: '$uniqueAdmins' }
        }
      }
    ]).toArray()

    const logStats = stats[0] || { total: 0, success: 0, failure: 0, uniqueAdminCount: 0 }

    // Log the action (don't log reading audit logs too frequently)
    // Only log if searching or filtering
    if (searchTerm || dateFrom || dateTo || searchParams.get('action') || searchParams.get('targetType')) {
      await logAdminAction({
        admin,
        action: 'audit:view',
        targetType: 'audit',
        description: `Viewed audit logs (page ${pagination.page})${searchTerm ? ` with search: "${searchTerm}"` : ''}`,
        status: 'success'
      })
    }

    const response = formatListResponse(formattedLogs, total, pagination, {
      stats: logStats,
      filters: {
        search: searchTerm,
        dateFrom,
        dateTo,
        ...Object.fromEntries(
          Object.keys(AUDIT_FILTER_CONFIG)
            .map(key => [key, searchParams.get(key)])
            .filter(([_, value]) => value)
        )
      }
    })

    return adminSuccessResponse(response, 'Audit logs retrieved successfully')

  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return adminErrorResponse('Failed to fetch audit logs', 'FETCH_ERROR', 500)
  }
}

export const GET = withAdminAuth(getAuditLogsHandler, {
  requiredPermissions: [PERMISSIONS.AUDIT_READ]
})
