'use client'

import { useState, useCallback, useEffect } from 'react'

/**
 * Custom hook for fetching admin data with caching, pagination, and filtering
 *
 * @param {string} endpoint - API endpoint
 * @param {object} options - Hook options
 * @param {boolean} options.autoFetch - Auto fetch on mount (default: true)
 * @param {number} options.cacheTime - Cache time in ms (default: 60000)
 * @param {object} options.defaultFilters - Default filter values
 * @param {number} options.defaultLimit - Default pagination limit (default: 20)
 */
export function useAdminData(endpoint, options = {}) {
  const {
    autoFetch = true,
    cacheTime = 60000,
    defaultFilters = {},
    defaultLimit = 20
  } = options

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: defaultLimit,
    total: 0,
    totalPages: 0
  })
  const [filters, setFilters] = useState(defaultFilters)
  const [searchTerm, setSearchTerm] = useState('')
  const [lastFetched, setLastFetched] = useState(null)

  const buildUrl = useCallback(() => {
    const params = new URLSearchParams()
    params.append('page', pagination.page.toString())
    params.append('limit', pagination.limit.toString())

    if (searchTerm) {
      params.append('search', searchTerm)
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.append(key, value)
      }
    })

    return `${endpoint}?${params}`
  }, [endpoint, pagination.page, pagination.limit, searchTerm, filters])

  const fetchData = useCallback(async (force = false) => {
    // Check cache
    if (!force && lastFetched && Date.now() - lastFetched < cacheTime && data) {
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(buildUrl())
      const result = await response.json()

      if (result.success) {
        setData(result.data)
        if (result.pagination) {
          setPagination(prev => ({ ...prev, ...result.pagination }))
        }
        setLastFetched(Date.now())
      } else {
        setError(result.error || 'Failed to fetch data')
      }
    } catch (err) {
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }, [buildUrl, cacheTime, data, lastFetched])

  const refresh = useCallback(() => {
    fetchData(true)
  }, [fetchData])

  const setPage = useCallback((page) => {
    setPagination(prev => ({ ...prev, page }))
  }, [])

  const setLimit = useCallback((limit) => {
    setPagination(prev => ({ ...prev, page: 1, limit }))
  }, [])

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [])

  const search = useCallback((term) => {
    setSearchTerm(term)
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters(defaultFilters)
    setSearchTerm('')
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [defaultFilters])

  // Auto fetch on mount and when dependencies change
  useEffect(() => {
    if (autoFetch) {
      fetchData()
    }
  }, [pagination.page, pagination.limit, searchTerm, filters, autoFetch])

  return {
    // Data
    data,
    loading,
    error,
    pagination,
    filters,
    searchTerm,

    // Actions
    fetchData,
    refresh,
    setPage,
    setLimit,
    updateFilters,
    search,
    clearFilters,

    // Helpers
    hasNextPage: pagination.page < pagination.totalPages,
    hasPrevPage: pagination.page > 1,
    isEmpty: !loading && (!data || (Array.isArray(data) && data.length === 0))
  }
}

export default useAdminData
