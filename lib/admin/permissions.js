/**
 * Admin Role-Based Access Control (RBAC) System
 *
 * Role Hierarchy: super_admin > admin > moderator > user
 * Each role includes all permissions of lower roles plus additional ones.
 */

// Role definitions
export const ROLES = {
  USER: 'user',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
}

// Role hierarchy (higher number = more privileges)
export const ROLE_HIERARCHY = {
  [ROLES.USER]: 0,
  [ROLES.MODERATOR]: 1,
  [ROLES.ADMIN]: 2,
  [ROLES.SUPER_ADMIN]: 3
}

// Permission definitions
export const PERMISSIONS = {
  // User Management
  USERS_READ: 'users:read',
  USERS_WRITE: 'users:write',
  USERS_DELETE: 'users:delete',
  USERS_SUSPEND: 'users:suspend',

  // Analytics
  ANALYTICS_READ: 'analytics:read',
  ANALYTICS_EXPORT: 'analytics:export',

  // Notifications
  NOTIFICATIONS_READ: 'notifications:read',
  NOTIFICATIONS_WRITE: 'notifications:write',
  NOTIFICATIONS_SEND: 'notifications:send',

  // Configuration
  CONFIG_READ: 'config:read',
  CONFIG_WRITE: 'config:write',

  // System
  SYSTEM_READ: 'system:read',
  SYSTEM_MANAGE: 'system:manage',

  // Audit Logs
  AUDIT_READ: 'audit:read',
  AUDIT_EXPORT: 'audit:export',

  // Moderation
  MODERATION_READ: 'moderation:read',
  MODERATION_ACTION: 'moderation:action',

  // Admin Management
  ADMIN_CREATE: 'admin:create',
  ADMIN_UPDATE: 'admin:update',
  ADMIN_REVOKE: 'admin:revoke'
}

// Default permissions by role
export const ROLE_PERMISSIONS = {
  [ROLES.USER]: [],

  [ROLES.MODERATOR]: [
    PERMISSIONS.USERS_READ,
    PERMISSIONS.NOTIFICATIONS_READ,
    PERMISSIONS.MODERATION_READ,
    PERMISSIONS.MODERATION_ACTION
  ],

  [ROLES.ADMIN]: [
    // All moderator permissions
    PERMISSIONS.USERS_READ,
    PERMISSIONS.NOTIFICATIONS_READ,
    PERMISSIONS.MODERATION_READ,
    PERMISSIONS.MODERATION_ACTION,
    // Plus admin-specific permissions
    PERMISSIONS.USERS_WRITE,
    PERMISSIONS.USERS_SUSPEND,
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.ANALYTICS_EXPORT,
    PERMISSIONS.NOTIFICATIONS_WRITE,
    PERMISSIONS.NOTIFICATIONS_SEND,
    PERMISSIONS.CONFIG_READ,
    PERMISSIONS.SYSTEM_READ,
    PERMISSIONS.AUDIT_READ
  ],

  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS) // All permissions
}

// Permission descriptions for UI
export const PERMISSION_DESCRIPTIONS = {
  [PERMISSIONS.USERS_READ]: 'View user accounts and details',
  [PERMISSIONS.USERS_WRITE]: 'Edit user account information',
  [PERMISSIONS.USERS_DELETE]: 'Permanently delete user accounts',
  [PERMISSIONS.USERS_SUSPEND]: 'Suspend or unsuspend user accounts',
  [PERMISSIONS.ANALYTICS_READ]: 'View platform analytics and statistics',
  [PERMISSIONS.ANALYTICS_EXPORT]: 'Export analytics data',
  [PERMISSIONS.NOTIFICATIONS_READ]: 'View notification history',
  [PERMISSIONS.NOTIFICATIONS_WRITE]: 'Create notifications',
  [PERMISSIONS.NOTIFICATIONS_SEND]: 'Send broadcast notifications',
  [PERMISSIONS.CONFIG_READ]: 'View system configuration',
  [PERMISSIONS.CONFIG_WRITE]: 'Modify system configuration',
  [PERMISSIONS.SYSTEM_READ]: 'View system health and metrics',
  [PERMISSIONS.SYSTEM_MANAGE]: 'Manage system (maintenance mode, cache)',
  [PERMISSIONS.AUDIT_READ]: 'View audit logs',
  [PERMISSIONS.AUDIT_EXPORT]: 'Export audit logs',
  [PERMISSIONS.MODERATION_READ]: 'View moderation queue',
  [PERMISSIONS.MODERATION_ACTION]: 'Take moderation actions (warn, flag)',
  [PERMISSIONS.ADMIN_CREATE]: 'Create new admin accounts',
  [PERMISSIONS.ADMIN_UPDATE]: 'Update admin permissions',
  [PERMISSIONS.ADMIN_REVOKE]: 'Revoke admin privileges'
}

/**
 * Check if a role has a specific permission
 * @param {string} role - User role
 * @param {string} permission - Permission to check
 * @param {string[]} customPermissions - Additional custom permissions
 * @returns {boolean}
 */
export function hasPermission(role, permission, customPermissions = []) {
  const rolePermissions = ROLE_PERMISSIONS[role] || []
  const allPermissions = [...rolePermissions, ...customPermissions]
  return allPermissions.includes(permission)
}

/**
 * Check if a role has all specified permissions
 * @param {string} role - User role
 * @param {string[]} permissions - Permissions to check
 * @param {string[]} customPermissions - Additional custom permissions
 * @returns {boolean}
 */
export function hasAllPermissions(role, permissions, customPermissions = []) {
  return permissions.every(p => hasPermission(role, p, customPermissions))
}

/**
 * Check if a role has any of the specified permissions
 * @param {string} role - User role
 * @param {string[]} permissions - Permissions to check
 * @param {string[]} customPermissions - Additional custom permissions
 * @returns {boolean}
 */
export function hasAnyPermission(role, permissions, customPermissions = []) {
  return permissions.some(p => hasPermission(role, p, customPermissions))
}

/**
 * Check if one role can manage another role
 * @param {string} managerRole - Role of the manager
 * @param {string} targetRole - Role of the target user
 * @returns {boolean}
 */
export function canManageRole(managerRole, targetRole) {
  const managerLevel = ROLE_HIERARCHY[managerRole] ?? 0
  const targetLevel = ROLE_HIERARCHY[targetRole] ?? 0
  return managerLevel > targetLevel
}

/**
 * Check if user has admin privileges (moderator or higher)
 * @param {string} role - User role
 * @returns {boolean}
 */
export function isAdminRole(role) {
  const level = ROLE_HIERARCHY[role] ?? 0
  return level >= ROLE_HIERARCHY[ROLES.MODERATOR]
}

/**
 * Check if user is super admin
 * @param {string} role - User role
 * @returns {boolean}
 */
export function isSuperAdmin(role) {
  return role === ROLES.SUPER_ADMIN
}

/**
 * Get all permissions for a role
 * @param {string} role - User role
 * @param {string[]} customPermissions - Additional custom permissions
 * @returns {string[]}
 */
export function getAllPermissions(role, customPermissions = []) {
  const rolePermissions = ROLE_PERMISSIONS[role] || []
  return [...new Set([...rolePermissions, ...customPermissions])]
}

/**
 * Get missing permissions for a role
 * @param {string} role - User role
 * @param {string[]} requiredPermissions - Required permissions
 * @param {string[]} customPermissions - Additional custom permissions
 * @returns {string[]}
 */
export function getMissingPermissions(role, requiredPermissions, customPermissions = []) {
  const allPermissions = getAllPermissions(role, customPermissions)
  return requiredPermissions.filter(p => !allPermissions.includes(p))
}

/**
 * Get role display name
 * @param {string} role - User role
 * @returns {string}
 */
export function getRoleDisplayName(role) {
  const names = {
    [ROLES.USER]: 'User',
    [ROLES.MODERATOR]: 'Moderator',
    [ROLES.ADMIN]: 'Administrator',
    [ROLES.SUPER_ADMIN]: 'Super Administrator'
  }
  return names[role] || 'Unknown'
}

/**
 * Get available roles for assignment by a given role
 * @param {string} assignerRole - Role of the user assigning roles
 * @returns {string[]}
 */
export function getAssignableRoles(assignerRole) {
  const assignerLevel = ROLE_HIERARCHY[assignerRole] ?? 0

  return Object.entries(ROLE_HIERARCHY)
    .filter(([_, level]) => level < assignerLevel)
    .map(([role]) => role)
}
