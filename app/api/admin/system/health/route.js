/**
 * Admin System Health API
 *
 * GET /api/admin/system/health - Get system health status
 */

import { connectToDatabase } from '@/lib/database'
import { withAdminAuth, adminSuccessResponse, adminErrorResponse } from '@/lib/admin/middleware'
import { PERMISSIONS } from '@/lib/admin/permissions'

/**
 * GET /api/admin/system/health
 * Get comprehensive system health status
 */
async function getSystemHealthHandler(request, { admin }) {
  try {
    const startTime = Date.now()
    const healthChecks = {}
    let overallStatus = 'healthy'

    // Check MongoDB connection
    try {
      const dbStart = Date.now()
      const db = await connectToDatabase()
      await db.command({ ping: 1 })
      const dbLatency = Date.now() - dbStart

      healthChecks.database = {
        status: dbLatency < 500 ? 'healthy' : dbLatency < 2000 ? 'degraded' : 'unhealthy',
        latency: dbLatency,
        message: `MongoDB responding (${dbLatency}ms)`
      }

      if (healthChecks.database.status === 'unhealthy') {
        overallStatus = 'unhealthy'
      } else if (healthChecks.database.status === 'degraded' && overallStatus !== 'unhealthy') {
        overallStatus = 'degraded'
      }
    } catch (dbError) {
      healthChecks.database = {
        status: 'unhealthy',
        latency: null,
        message: 'MongoDB connection failed',
        error: dbError.message
      }
      overallStatus = 'unhealthy'
    }

    // Get database statistics
    try {
      const db = await connectToDatabase()

      const [
        userCount,
        expenseCount,
        auditLogCount,
        recentAuditLogs
      ] = await Promise.all([
        db.collection('users').estimatedDocumentCount(),
        db.collection('expenses').estimatedDocumentCount(),
        db.collection('admin_audit_logs').estimatedDocumentCount(),
        db.collection('admin_audit_logs').find({})
          .sort({ createdAt: -1 })
          .limit(5)
          .toArray()
      ])

      healthChecks.collections = {
        status: 'healthy',
        stats: {
          users: userCount,
          expenses: expenseCount,
          auditLogs: auditLogCount
        }
      }

      healthChecks.recentActivity = {
        status: 'healthy',
        lastActions: recentAuditLogs.map(log => ({
          action: log.action,
          adminEmail: log.adminEmail,
          createdAt: log.createdAt
        }))
      }
    } catch (statsError) {
      healthChecks.collections = {
        status: 'degraded',
        message: 'Could not fetch collection statistics',
        error: statsError.message
      }
      if (overallStatus === 'healthy') {
        overallStatus = 'degraded'
      }
    }

    // Memory usage (process-level)
    const memoryUsage = process.memoryUsage()
    const heapUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024)
    const heapTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024)
    const heapUsagePercent = Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)

    healthChecks.memory = {
      status: heapUsagePercent < 80 ? 'healthy' : heapUsagePercent < 95 ? 'degraded' : 'unhealthy',
      heapUsed: `${heapUsedMB}MB`,
      heapTotal: `${heapTotalMB}MB`,
      usagePercent: heapUsagePercent,
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`
    }

    if (healthChecks.memory.status === 'unhealthy') {
      overallStatus = 'unhealthy'
    } else if (healthChecks.memory.status === 'degraded' && overallStatus !== 'unhealthy') {
      overallStatus = 'degraded'
    }

    // Uptime
    const uptimeSeconds = process.uptime()
    const uptimeFormatted = formatUptime(uptimeSeconds)

    healthChecks.process = {
      status: 'healthy',
      uptime: uptimeFormatted,
      uptimeSeconds: Math.floor(uptimeSeconds),
      nodeVersion: process.version,
      platform: process.platform,
      pid: process.pid
    }

    // Environment info
    healthChecks.environment = {
      status: 'healthy',
      nodeEnv: process.env.NODE_ENV || 'development',
      vercel: process.env.VERCEL ? true : false,
      region: process.env.VERCEL_REGION || 'local'
    }

    // Response time
    const responseTime = Date.now() - startTime

    const response = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      checks: healthChecks,
      version: process.env.npm_package_version || '2.0.0'
    }

    // Return appropriate status code based on health
    const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503

    return adminSuccessResponse(response, `System is ${overallStatus}`)

  } catch (error) {
    console.error('Error checking system health:', error)
    return adminErrorResponse('Health check failed', 'HEALTH_CHECK_ERROR', 500)
  }
}

/**
 * Format uptime to human-readable string
 */
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  const parts = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`)

  return parts.join(' ')
}

export const GET = withAdminAuth(getSystemHealthHandler, {
  requiredPermissions: [PERMISSIONS.SYSTEM_READ],
  skipAuditLog: true // Don't log health checks
})
