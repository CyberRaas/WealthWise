/**
 * Admin Authentication and Authorization Middleware
 *
 * Provides secure access control for admin API routes with:
 * - Role-based permission checking
 * - Rate limiting
 * - Audit logging
 * - Request metadata extraction
 */

import { auth } from '@/lib/auth'
import { connectToDatabase } from '@/lib/database'
import { NextResponse } from 'next/server'
import { hasPermission, hasAllPermissions, isAdminRole, ROLES } from './permissions'
import AdminAuditLog from '@/models/AdminAuditLog'

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 60 // 60 requests per minute for admin routes

// In-memory rate limit store (use Redis in production for multi-instance)
const rateLimitStore = new Map()

/**
 * Extract client IP from request
 * @param {Request} request - Next.js request object
 * @returns {string}
 */
export function getClientIP(request) {
  // Check various headers for IP address
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  // Fallback
  return 'unknown'
}

/**
 * Extract user agent from request
 * @param {Request} request - Next.js request object
 * @returns {string}
 */
export function getUserAgent(request) {
  return request.headers.get('user-agent') || ''
}

/**
 * Generate a unique request ID
 * @returns {string}
 */
export function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Check rate limit for a given identifier
 * @param {string} identifier - Unique identifier (usually IP or user ID)
 * @returns {{ allowed: boolean, remaining: number, resetAt: number }}
 */
function checkRateLimit(identifier) {
  const now = Date.now()
  const windowStart = now - RATE_LIMIT_WINDOW

  // Get or initialize rate limit data
  let data = rateLimitStore.get(identifier)

  if (!data || data.windowStart < windowStart) {
    data = { windowStart: now, count: 0 }
  }

  // Clean up old entries periodically
  if (rateLimitStore.size > 10000) {
    const cutoff = now - RATE_LIMIT_WINDOW * 2
    for (const [key, value] of rateLimitStore.entries()) {
      if (value.windowStart < cutoff) {
        rateLimitStore.delete(key)
      }
    }
  }

  data.count++
  rateLimitStore.set(identifier, data)

  const remaining = Math.max(0, RATE_LIMIT_MAX_REQUESTS - data.count)
  const resetAt = data.windowStart + RATE_LIMIT_WINDOW

  return {
    allowed: data.count <= RATE_LIMIT_MAX_REQUESTS,
    remaining,
    resetAt
  }
}

/**
 * Create admin authentication and authorization middleware wrapper
 *
 * @param {Function} handler - The API route handler
 * @param {Object} options - Configuration options
 * @param {string[]} options.requiredPermissions - Required permissions (AND logic)
 * @param {string[]} options.anyPermissions - Required permissions (OR logic)
 * @param {string[]} options.allowedRoles - Specific roles allowed (bypasses permission check)
 * @param {boolean} options.skipRateLimit - Skip rate limiting for this route
 * @param {boolean} options.skipAuditLog - Skip audit logging for this route
 * @returns {Function}
 */
export function withAdminAuth(handler, options = {}) {
  const {
    requiredPermissions = [],
    anyPermissions = [],
    allowedRoles = null,
    skipRateLimit = false,
    skipAuditLog = false
  } = options

  return async function adminAuthHandler(request, context) {
    const requestId = generateRequestId()
    const ipAddress = getClientIP(request)
    const userAgent = getUserAgent(request)

    try {
      // Rate limiting check
      if (!skipRateLimit) {
        const rateLimit = checkRateLimit(ipAddress)

        if (!rateLimit.allowed) {
          return NextResponse.json(
            {
              success: false,
              error: 'Rate limit exceeded',
              code: 'RATE_LIMIT_EXCEEDED',
              retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000)
            },
            {
              status: 429,
              headers: {
                'X-RateLimit-Limit': String(RATE_LIMIT_MAX_REQUESTS),
                'X-RateLimit-Remaining': '0',
                'X-RateLimit-Reset': String(rateLimit.resetAt),
                'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000))
              }
            }
          )
        }
      }

      // Get session using NextAuth
      const session = await auth()

      // Check authentication
      if (!session?.user?.id) {
        return NextResponse.json(
          {
            success: false,
            error: 'Authentication required',
            code: 'UNAUTHENTICATED'
          },
          { status: 401 }
        )
      }

      // Fetch full user data including role from database
      const db = await connectToDatabase()
      const user = await db.collection('users').findOne(
        { email: session.user.email },
        { projection: { _id: 1, email: 1, name: 1, role: 1, adminProfile: 1, status: 1 } }
      )

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            error: 'User not found',
            code: 'USER_NOT_FOUND'
          },
          { status: 401 }
        )
      }

      // Check if user account is active
      if (user.status === 'suspended' || user.status === 'deleted') {
        return NextResponse.json(
          {
            success: false,
            error: 'Account is suspended or deleted',
            code: 'ACCOUNT_INACTIVE'
          },
          { status: 403 }
        )
      }

      // Check if user has admin role
      const userRole = user.role || ROLES.USER
      if (!isAdminRole(userRole)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Admin access required',
            code: 'NOT_ADMIN'
          },
          { status: 403 }
        )
      }

      // Check specific role requirement
      if (allowedRoles && !allowedRoles.includes(userRole)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Insufficient role privileges',
            code: 'INSUFFICIENT_ROLE'
          },
          { status: 403 }
        )
      }

      // Get custom permissions from adminProfile
      const customPermissions = user.adminProfile?.permissions || []

      // Check required permissions (AND logic)
      if (requiredPermissions.length > 0) {
        const hasAll = requiredPermissions.every(p =>
          hasPermission(userRole, p, customPermissions)
        )

        if (!hasAll) {
          return NextResponse.json(
            {
              success: false,
              error: 'Insufficient permissions',
              code: 'INSUFFICIENT_PERMISSIONS',
              required: requiredPermissions
            },
            { status: 403 }
          )
        }
      }

      // Check any permissions (OR logic)
      if (anyPermissions.length > 0) {
        const hasAny = anyPermissions.some(p =>
          hasPermission(userRole, p, customPermissions)
        )

        if (!hasAny) {
          return NextResponse.json(
            {
              success: false,
              error: 'Insufficient permissions',
              code: 'INSUFFICIENT_PERMISSIONS',
              requiredAny: anyPermissions
            },
            { status: 403 }
          )
        }
      }

      // Attach admin context to request for downstream use
      const adminContext = {
        adminId: user._id,
        adminEmail: user.email,
        adminName: user.name,
        adminRole: userRole,
        permissions: customPermissions,
        ipAddress,
        userAgent,
        requestId
      }

      // Call the actual handler with admin context
      const response = await handler(request, { ...context, admin: adminContext })

      return response

    } catch (error) {
      console.error('Admin middleware error:', error)

      return NextResponse.json(
        {
          success: false,
          error: 'Internal server error',
          code: 'INTERNAL_ERROR',
          requestId
        },
        { status: 500 }
      )
    }
  }
}

/**
 * Log admin action to audit log
 *
 * @param {Object} params - Audit log parameters
 * @param {Object} params.admin - Admin context from middleware
 * @param {string} params.action - Action performed
 * @param {string} params.targetType - Type of target
 * @param {string} params.targetId - ID of target (optional)
 * @param {string} params.targetEmail - Email of target (optional)
 * @param {string} params.description - Human-readable description
 * @param {*} params.previousValue - Previous value (for changes)
 * @param {*} params.newValue - New value (for changes)
 * @param {string} params.status - Action status (success/failure/partial)
 * @param {string} params.errorMessage - Error message if failed
 */
export async function logAdminAction(params) {
  try {
    await AdminAuditLog.logAction({
      adminId: params.admin.adminId,
      adminEmail: params.admin.adminEmail,
      adminRole: params.admin.adminRole,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId || null,
      targetEmail: params.targetEmail || null,
      description: params.description,
      previousValue: params.previousValue || null,
      newValue: params.newValue || null,
      ipAddress: params.admin.ipAddress,
      userAgent: params.admin.userAgent,
      requestId: params.admin.requestId,
      status: params.status || 'success',
      errorMessage: params.errorMessage || null
    })
  } catch (error) {
    console.error('Failed to create audit log:', error)
    // Don't throw - audit logging failure shouldn't break the main operation
  }
}

/**
 * Create a success response with standard format
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @param {number} status - HTTP status code
 * @returns {NextResponse}
 */
export function adminSuccessResponse(data = null, message = 'Success', status = 200) {
  return NextResponse.json(
    {
      success: true,
      message,
      ...(data !== null && { data })
    },
    { status }
  )
}

/**
 * Create an error response with standard format
 * @param {string} error - Error message
 * @param {string} code - Error code
 * @param {number} status - HTTP status code
 * @param {Object} extra - Extra data to include
 * @returns {NextResponse}
 */
export function adminErrorResponse(error, code = 'ERROR', status = 400, extra = {}) {
  return NextResponse.json(
    {
      success: false,
      error,
      code,
      ...extra
    },
    { status }
  )
}

export default {
  withAdminAuth,
  logAdminAction,
  adminSuccessResponse,
  adminErrorResponse,
  getClientIP,
  getUserAgent,
  generateRequestId
}
