/**
 * Admin Query Utilities
 *
 * Provides standardized utilities for:
 * - Pagination
 * - Sorting
 * - Filtering
 * - Search
 * - Date range queries
 */

/**
 * Default pagination settings
 */
export const DEFAULT_PAGE = 1
export const DEFAULT_LIMIT = 20
export const MAX_LIMIT = 100

/**
 * Parse pagination parameters from URL search params
 * @param {URLSearchParams} searchParams - URL search parameters
 * @returns {{ page: number, limit: number, skip: number }}
 */
export function parsePagination(searchParams) {
  let page = parseInt(searchParams.get('page') || String(DEFAULT_PAGE), 10)
  let limit = parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT), 10)

  // Validate and clamp values
  page = Math.max(1, page)
  limit = Math.min(Math.max(1, limit), MAX_LIMIT)

  const skip = (page - 1) * limit

  return { page, limit, skip }
}

/**
 * Parse sort parameters from URL search params
 * @param {URLSearchParams} searchParams - URL search parameters
 * @param {Object} allowedFields - Map of allowed sort fields to MongoDB field names
 * @param {string} defaultSort - Default sort field
 * @returns {{ sortBy: string, sortOrder: 1 | -1, mongoSort: Object }}
 */
export function parseSort(searchParams, allowedFields = {}, defaultSort = 'createdAt') {
  const sortBy = searchParams.get('sortBy') || defaultSort
  const sortOrder = searchParams.get('sortOrder')?.toLowerCase() === 'asc' ? 1 : -1

  // Map the sort field to MongoDB field name if mapping exists
  const mongoField = allowedFields[sortBy] || sortBy

  // Validate that the field is allowed
  const isAllowed = Object.keys(allowedFields).length === 0 ||
    Object.keys(allowedFields).includes(sortBy) ||
    Object.values(allowedFields).includes(sortBy)

  const finalField = isAllowed ? mongoField : (allowedFields[defaultSort] || defaultSort)

  return {
    sortBy,
    sortOrder: sortOrder === 1 ? 'asc' : 'desc',
    mongoSort: { [finalField]: sortOrder }
  }
}

/**
 * Parse date range parameters
 * @param {URLSearchParams} searchParams - URL search parameters
 * @param {string} fromParam - Parameter name for start date
 * @param {string} toParam - Parameter name for end date
 * @returns {{ dateFrom: Date | null, dateTo: Date | null, dateQuery: Object | null }}
 */
export function parseDateRange(searchParams, fromParam = 'dateFrom', toParam = 'dateTo') {
  const dateFromStr = searchParams.get(fromParam)
  const dateToStr = searchParams.get(toParam)

  let dateFrom = null
  let dateTo = null
  let dateQuery = null

  if (dateFromStr) {
    const parsed = new Date(dateFromStr)
    if (!isNaN(parsed.getTime())) {
      dateFrom = parsed
      // Set to start of day
      dateFrom.setHours(0, 0, 0, 0)
    }
  }

  if (dateToStr) {
    const parsed = new Date(dateToStr)
    if (!isNaN(parsed.getTime())) {
      dateTo = parsed
      // Set to end of day
      dateTo.setHours(23, 59, 59, 999)
    }
  }

  // Build MongoDB date query
  if (dateFrom || dateTo) {
    dateQuery = {}
    if (dateFrom) {
      dateQuery.$gte = dateFrom
    }
    if (dateTo) {
      dateQuery.$lte = dateTo
    }
  }

  return { dateFrom, dateTo, dateQuery }
}

/**
 * Parse search parameter and create regex query
 * @param {URLSearchParams} searchParams - URL search parameters
 * @param {string[]} searchFields - Fields to search in
 * @param {string} paramName - Search parameter name
 * @returns {{ searchTerm: string | null, searchQuery: Object | null }}
 */
export function parseSearch(searchParams, searchFields = [], paramName = 'search') {
  const searchTerm = searchParams.get(paramName)?.trim()

  if (!searchTerm || searchFields.length === 0) {
    return { searchTerm: null, searchQuery: null }
  }

  // Escape special regex characters
  const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  // Create case-insensitive regex search across multiple fields
  const searchQuery = {
    $or: searchFields.map(field => ({
      [field]: { $regex: escapedTerm, $options: 'i' }
    }))
  }

  return { searchTerm, searchQuery }
}

/**
 * Parse filter parameters and build MongoDB query
 * @param {URLSearchParams} searchParams - URL search parameters
 * @param {Object} filterConfig - Configuration for each filter
 * @returns {Object} MongoDB query object
 *
 * @example
 * const filterConfig = {
 *   status: { type: 'enum', values: ['active', 'suspended', 'deleted'] },
 *   role: { type: 'enum', values: ['user', 'moderator', 'admin', 'super_admin'] },
 *   verified: { type: 'boolean', field: 'isEmailVerified' },
 *   minAge: { type: 'number', field: 'age', operator: '$gte' }
 * }
 */
export function parseFilters(searchParams, filterConfig = {}) {
  const query = {}

  for (const [param, config] of Object.entries(filterConfig)) {
    const value = searchParams.get(param)

    if (value === null || value === undefined || value === '') {
      continue
    }

    const field = config.field || param

    switch (config.type) {
      case 'enum':
        if (config.values?.includes(value)) {
          query[field] = value
        }
        break

      case 'boolean':
        if (value === 'true' || value === '1') {
          query[field] = true
        } else if (value === 'false' || value === '0') {
          query[field] = false
        }
        break

      case 'number':
        const numValue = parseFloat(value)
        if (!isNaN(numValue)) {
          const operator = config.operator || '$eq'
          if (operator === '$eq') {
            query[field] = numValue
          } else {
            query[field] = { [operator]: numValue }
          }
        }
        break

      case 'string':
        query[field] = value
        break

      case 'objectId':
        // Validate ObjectId format (24 hex characters)
        if (/^[0-9a-fA-F]{24}$/.test(value)) {
          query[field] = value
        }
        break

      case 'array':
        // Handle comma-separated values
        const values = value.split(',').map(v => v.trim()).filter(Boolean)
        if (values.length > 0) {
          query[field] = { $in: values }
        }
        break

      default:
        // Default to string matching
        query[field] = value
    }
  }

  return query
}

/**
 * Build complete MongoDB query with all parameters
 * @param {URLSearchParams} searchParams - URL search parameters
 * @param {Object} options - Query building options
 * @returns {Object} Complete query configuration
 */
export function buildAdminQuery(searchParams, options = {}) {
  const {
    searchFields = [],
    filterConfig = {},
    sortFields = {},
    defaultSort = 'createdAt',
    dateField = 'createdAt',
    baseQuery = {}
  } = options

  // Parse all parameters
  const pagination = parsePagination(searchParams)
  const sort = parseSort(searchParams, sortFields, defaultSort)
  const { searchTerm, searchQuery } = parseSearch(searchParams, searchFields)
  const { dateFrom, dateTo, dateQuery } = parseDateRange(searchParams)
  const filterQuery = parseFilters(searchParams, filterConfig)

  // Build final query
  const finalQuery = { ...baseQuery }

  // Add filter conditions
  Object.assign(finalQuery, filterQuery)

  // Add search condition
  if (searchQuery) {
    if (finalQuery.$and) {
      finalQuery.$and.push(searchQuery)
    } else if (finalQuery.$or) {
      finalQuery.$and = [{ $or: finalQuery.$or }, searchQuery]
      delete finalQuery.$or
    } else {
      Object.assign(finalQuery, searchQuery)
    }
  }

  // Add date range condition
  if (dateQuery) {
    finalQuery[dateField] = dateQuery
  }

  return {
    query: finalQuery,
    pagination,
    sort,
    searchTerm,
    dateFrom,
    dateTo
  }
}

/**
 * Format pagination metadata for response
 * @param {number} total - Total number of items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {Object} Pagination metadata
 */
export function formatPaginationMeta(total, page, limit) {
  const totalPages = Math.ceil(total / limit)

  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    nextPage: page < totalPages ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null
  }
}

/**
 * Create a standardized list response
 * @param {Array} items - List of items
 * @param {number} total - Total count
 * @param {Object} pagination - Pagination parameters
 * @param {Object} extra - Extra metadata
 * @returns {Object} Formatted response
 */
export function formatListResponse(items, total, pagination, extra = {}) {
  return {
    success: true,
    data: items,
    pagination: formatPaginationMeta(total, pagination.page, pagination.limit),
    ...extra
  }
}

/**
 * Common filter configurations for users
 */
export const USER_FILTER_CONFIG = {
  status: {
    type: 'enum',
    values: ['active', 'inactive', 'suspended', 'deleted']
  },
  role: {
    type: 'enum',
    values: ['user', 'moderator', 'admin', 'super_admin']
  },
  plan: {
    type: 'enum',
    field: 'subscription.plan',
    values: ['free', 'premium', 'family']
  },
  language: {
    type: 'enum',
    field: 'preferences.language',
    values: ['en', 'hi', 'hinglish']
  },
  onboardingCompleted: {
    type: 'boolean',
    field: 'onboarding.completed'
  }
}

/**
 * Common search fields for users
 */
export const USER_SEARCH_FIELDS = ['name', 'email']

/**
 * Common sort fields for users
 */
export const USER_SORT_FIELDS = {
  name: 'name',
  email: 'email',
  createdAt: 'createdAt',
  lastActive: 'activity.lastActiveAt',
  status: 'status',
  role: 'role'
}

/**
 * Common filter configurations for audit logs
 */
export const AUDIT_FILTER_CONFIG = {
  action: {
    type: 'string'
  },
  targetType: {
    type: 'enum',
    values: ['user', 'notification', 'config', 'system', 'admin', 'analytics', 'audit']
  },
  status: {
    type: 'enum',
    values: ['success', 'failure', 'partial']
  },
  adminEmail: {
    type: 'string'
  }
}

/**
 * Common search fields for audit logs
 */
export const AUDIT_SEARCH_FIELDS = ['description', 'adminEmail', 'targetEmail']

/**
 * Common sort fields for audit logs
 */
export const AUDIT_SORT_FIELDS = {
  createdAt: 'createdAt',
  action: 'action',
  adminEmail: 'adminEmail'
}

const queryUtils = {
  parsePagination,
  parseSort,
  parseDateRange,
  parseSearch,
  parseFilters,
  buildAdminQuery,
  formatPaginationMeta,
  formatListResponse,
  USER_FILTER_CONFIG,
  USER_SEARCH_FIELDS,
  USER_SORT_FIELDS,
  AUDIT_FILTER_CONFIG,
  AUDIT_SEARCH_FIELDS,
  AUDIT_SORT_FIELDS,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT
}

export default queryUtils
