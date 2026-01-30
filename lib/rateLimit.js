/**
 * General API Rate Limiting Utility
 *
 * Provides rate limiting for all API routes with configurable limits per route type.
 * Uses in-memory storage (suitable for single instance, use Redis for multi-instance).
 */

import { NextResponse } from 'next/server'

// Rate limit configuration per route pattern
const RATE_LIMITS = {
  // Authentication routes - strict to prevent brute force
  '/api/auth/signin': { windowMs: 60000, max: 5 },
  '/api/auth/register': { windowMs: 60000, max: 5 },
  '/api/auth/send-otp': { windowMs: 60000, max: 3 },
  '/api/auth/verify-otp': { windowMs: 60000, max: 10 },
  '/api/auth/forgot-password': { windowMs: 60000, max: 3 },

  // AI-powered routes - expensive operations
  '/api/budget/generate': { windowMs: 60000, max: 5 },
  '/api/insights': { windowMs: 60000, max: 10 },
  '/api/voice': { windowMs: 60000, max: 20 },

  // Standard data routes
  '/api/expenses': { windowMs: 60000, max: 100 },
  '/api/goals': { windowMs: 60000, max: 60 },
  '/api/debt': { windowMs: 60000, max: 60 },
  '/api/income-sources': { windowMs: 60000, max: 30 },
  '/api/profile': { windowMs: 60000, max: 30 },
  '/api/onboarding': { windowMs: 60000, max: 30 },
  '/api/notifications': { windowMs: 60000, max: 60 },

  // Admin routes - moderate limits
  '/api/admin': { windowMs: 60000, max: 60 },

  // Export routes - prevent abuse
  '/api/export': { windowMs: 60000, max: 10 },

  // Health checks - relaxed
  '/api/health': { windowMs: 60000, max: 120 },

  // Default for any other API route
  'default': { windowMs: 60000, max: 60 }
}

// In-memory store for rate limiting
const rateLimitStore = new Map()

// Cleanup interval (every 5 minutes)
let lastCleanup = Date.now()
const CLEANUP_INTERVAL = 5 * 60 * 1000

/**
 * Get rate limit config for a path
 */
function getRateLimitConfig(path) {
  // Check for exact match first
  if (RATE_LIMITS[path]) {
    return RATE_LIMITS[path]
  }

  // Check for prefix match
  for (const [pattern, config] of Object.entries(RATE_LIMITS)) {
    if (pattern !== 'default' && path.startsWith(pattern)) {
      return config
    }
  }

  return RATE_LIMITS['default']
}

/**
 * Extract client IP from request
 */
export function getClientIP(request) {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  if (cfConnectingIP) {
    return cfConnectingIP
  }

  return 'unknown'
}

/**
 * Cleanup old entries from the rate limit store
 */
function cleanupStore() {
  const now = Date.now()

  // Only cleanup every CLEANUP_INTERVAL
  if (now - lastCleanup < CLEANUP_INTERVAL) {
    return
  }

  lastCleanup = now
  const cutoff = now - 120000 // Remove entries older than 2 minutes

  for (const [key, data] of rateLimitStore.entries()) {
    if (data.windowStart < cutoff) {
      rateLimitStore.delete(key)
    }
  }
}

/**
 * Check rate limit for a request
 * @param {string} identifier - Unique identifier (IP + path)
 * @param {object} config - Rate limit configuration
 * @returns {{ allowed: boolean, remaining: number, resetAt: number, retryAfter: number }}
 */
export function checkRateLimit(identifier, config) {
  const now = Date.now()
  const windowStart = now - config.windowMs

  // Get or initialize rate limit data
  let data = rateLimitStore.get(identifier)

  if (!data || data.windowStart < windowStart) {
    data = { windowStart: now, count: 0 }
  }

  // Periodic cleanup
  cleanupStore()

  data.count++
  rateLimitStore.set(identifier, data)

  const remaining = Math.max(0, config.max - data.count)
  const resetAt = data.windowStart + config.windowMs
  const retryAfter = Math.ceil((resetAt - now) / 1000)

  return {
    allowed: data.count <= config.max,
    remaining,
    resetAt,
    retryAfter: Math.max(1, retryAfter)
  }
}

/**
 * Apply rate limiting to an API request
 * @param {Request} request - Next.js request object
 * @returns {{ allowed: boolean, response?: NextResponse, headers: object }}
 */
export function applyRateLimit(request) {
  const url = new URL(request.url)
  const path = url.pathname

  // Skip rate limiting for non-API routes
  if (!path.startsWith('/api')) {
    return { allowed: true, headers: {} }
  }

  // Skip rate limiting for NextAuth internal routes
  if (path.startsWith('/api/auth/') && (
    path.includes('callback') ||
    path.includes('session') ||
    path.includes('csrf') ||
    path.includes('providers')
  )) {
    return { allowed: true, headers: {} }
  }

  const ip = getClientIP(request)
  const config = getRateLimitConfig(path)
  const identifier = `${ip}:${path.split('/').slice(0, 4).join('/')}` // Group by route prefix

  const result = checkRateLimit(identifier, config)

  const headers = {
    'X-RateLimit-Limit': String(config.max),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(result.resetAt),
  }

  if (!result.allowed) {
    return {
      allowed: false,
      headers: {
        ...headers,
        'Retry-After': String(result.retryAfter)
      },
      response: NextResponse.json(
        {
          error: 'Too many requests',
          message: 'Please wait a moment before trying again.',
          code: 'RATE_LIMIT_ERROR',
          retryAfter: result.retryAfter
        },
        {
          status: 429,
          headers: {
            ...headers,
            'Retry-After': String(result.retryAfter)
          }
        }
      )
    }
  }

  return { allowed: true, headers }
}

/**
 * Get current rate limit status for monitoring
 */
export function getRateLimitStats() {
  return {
    activeIdentifiers: rateLimitStore.size,
    lastCleanup: new Date(lastCleanup).toISOString()
  }
}

const rateLimit = {
  applyRateLimit,
  checkRateLimit,
  getClientIP,
  getRateLimitStats
}

export default rateLimit
