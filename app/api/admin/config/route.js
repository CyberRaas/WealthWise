/**
 * Admin System Configuration API
 *
 * GET /api/admin/config - Get system configurations
 * PUT /api/admin/config - Update system configurations
 */

import { connectToDatabase } from '@/lib/database'
import { withAdminAuth, logAdminAction, adminSuccessResponse, adminErrorResponse } from '@/lib/admin/middleware'
import { PERMISSIONS, isSuperAdmin } from '@/lib/admin/permissions'
import SystemConfig from '@/models/SystemConfig'
import dbConnect from '@/lib/dbConnect'

/**
 * GET /api/admin/config
 * Get all system configurations grouped by category
 */
async function getConfigHandler(request, { admin }) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    // Ensure mongoose connection
    await dbConnect()

    // Only super_admin can see secret values
    const includeSecrets = isSuperAdmin(admin.adminRole)

    let configs

    if (category) {
      // Get configs for specific category
      const categoryConfigs = await SystemConfig.find({ category })
        .sort({ key: 1 })
        .lean()

      configs = {
        [category]: categoryConfigs.map(config => ({
          ...config,
          id: config._id.toString(),
          _id: undefined,
          value: config.isSecret && !includeSecrets ? '***' : config.value
        }))
      }
    } else {
      // Get all configs grouped by category
      const allConfigs = await SystemConfig.getAll(includeSecrets)
      configs = allConfigs
    }

    // Log the action
    await logAdminAction({
      admin,
      action: 'config:view',
      targetType: 'config',
      description: category ? `Viewed ${category} configurations` : 'Viewed all system configurations',
      status: 'success'
    })

    return adminSuccessResponse({
      configs,
      categories: ['general', 'email', 'security', 'features', 'limits', 'maintenance', 'notifications']
    }, 'Configurations retrieved successfully')

  } catch (error) {
    console.error('Error fetching configurations:', error)
    return adminErrorResponse('Failed to fetch configurations', 'FETCH_ERROR', 500)
  }
}

/**
 * PUT /api/admin/config
 * Update system configuration(s)
 *
 * Body: { key: string, value: any } or { updates: [{ key: string, value: any }] }
 */
async function updateConfigHandler(request, { admin }) {
  try {
    const body = await request.json()

    // Ensure mongoose connection
    await dbConnect()

    // Handle single update or batch updates
    const updates = body.updates || [{ key: body.key, value: body.value }]

    if (!updates.length || !updates[0].key) {
      return adminErrorResponse('Missing configuration key', 'MISSING_KEY', 400)
    }

    const results = []
    const db = await connectToDatabase()

    for (const update of updates) {
      const { key, value } = update

      if (!key) continue

      // Get current config
      const currentConfig = await SystemConfig.findOne({ key })

      if (!currentConfig) {
        results.push({
          key,
          success: false,
          error: 'Configuration not found'
        })
        continue
      }

      // Check if config is editable
      if (!currentConfig.isEditable) {
        results.push({
          key,
          success: false,
          error: 'Configuration is not editable'
        })
        continue
      }

      // Check if updating secret value requires super_admin
      if (currentConfig.isSecret && !isSuperAdmin(admin.adminRole)) {
        results.push({
          key,
          success: false,
          error: 'Insufficient permissions to modify secret configuration'
        })
        continue
      }

      // Validate value based on dataType
      let validatedValue = value
      let validationError = null

      switch (currentConfig.dataType) {
        case 'boolean':
          if (typeof value !== 'boolean') {
            validationError = 'Value must be a boolean'
          }
          break
        case 'number':
          if (typeof value !== 'number' || isNaN(value)) {
            validationError = 'Value must be a number'
          } else {
            // Check min/max validation
            if (currentConfig.validation?.min !== undefined && value < currentConfig.validation.min) {
              validationError = `Value must be at least ${currentConfig.validation.min}`
            }
            if (currentConfig.validation?.max !== undefined && value > currentConfig.validation.max) {
              validationError = `Value must be at most ${currentConfig.validation.max}`
            }
          }
          break
        case 'string':
          if (typeof value !== 'string') {
            validationError = 'Value must be a string'
          } else if (currentConfig.validation?.options?.length > 0) {
            if (!currentConfig.validation.options.includes(value)) {
              validationError = `Value must be one of: ${currentConfig.validation.options.join(', ')}`
            }
          }
          break
        case 'array':
          if (!Array.isArray(value)) {
            validationError = 'Value must be an array'
          }
          break
        case 'json':
          if (typeof value !== 'object') {
            validationError = 'Value must be an object'
          }
          break
      }

      if (validationError) {
        results.push({
          key,
          success: false,
          error: validationError
        })
        continue
      }

      // Store previous value for audit
      const previousValue = currentConfig.value

      // Update the configuration
      await SystemConfig.setValue(key, validatedValue, admin.adminId)

      // Log the action
      await logAdminAction({
        admin,
        action: 'config:update',
        targetType: 'config',
        description: `Updated configuration: ${key}`,
        previousValue: currentConfig.isSecret ? '***' : previousValue,
        newValue: currentConfig.isSecret ? '***' : validatedValue,
        status: 'success'
      })

      results.push({
        key,
        success: true,
        previousValue: currentConfig.isSecret ? undefined : previousValue,
        newValue: currentConfig.isSecret ? undefined : validatedValue
      })
    }

    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length

    return adminSuccessResponse(
      { results, successCount, failureCount },
      `Updated ${successCount} configuration(s)${failureCount > 0 ? `, ${failureCount} failed` : ''}`
    )

  } catch (error) {
    console.error('Error updating configurations:', error)
    return adminErrorResponse('Failed to update configurations', 'UPDATE_ERROR', 500)
  }
}

export const GET = withAdminAuth(getConfigHandler, {
  requiredPermissions: [PERMISSIONS.CONFIG_READ]
})

export const PUT = withAdminAuth(updateConfigHandler, {
  requiredPermissions: [PERMISSIONS.CONFIG_WRITE]
})
