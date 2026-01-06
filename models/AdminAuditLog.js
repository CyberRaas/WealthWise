import mongoose from 'mongoose'

const adminAuditLogSchema = new mongoose.Schema({
  // Admin who performed the action
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  adminEmail: {
    type: String,
    required: true,
    index: true
  },

  adminRole: {
    type: String,
    enum: ['moderator', 'admin', 'super_admin'],
    required: true
  },

  // Action details
  action: {
    type: String,
    required: true,
    enum: [
      // User management
      'user:view',
      'user:list',
      'user:update',
      'user:suspend',
      'user:unsuspend',
      'user:delete',
      'user:restore',
      'user:role_change',
      // Analytics
      'analytics:view',
      'analytics:export',
      // Notifications
      'notification:create',
      'notification:send_bulk',
      'notification:delete',
      // Configuration
      'config:view',
      'config:update',
      // System
      'system:health_check',
      'system:maintenance_mode',
      'system:cache_clear',
      // Admin management
      'admin:create',
      'admin:update',
      'admin:revoke',
      // Moderation
      'moderation:warn',
      'moderation:flag',
      'moderation:clear',
      // Audit
      'audit:view',
      'audit:export'
    ],
    index: true
  },

  // Target of the action
  targetType: {
    type: String,
    enum: ['user', 'notification', 'config', 'system', 'admin', 'analytics', 'audit'],
    required: true,
    index: true
  },

  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
    index: true
  },

  targetEmail: {
    type: String,
    default: null
  },

  // Action description
  description: {
    type: String,
    required: true,
    maxlength: 500
  },

  // For tracking changes
  previousValue: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },

  newValue: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },

  // Request metadata for security audit
  metadata: {
    ipAddress: {
      type: String,
      required: true
    },
    userAgent: {
      type: String,
      default: ''
    },
    sessionId: {
      type: String,
      default: ''
    },
    requestId: {
      type: String,
      default: ''
    }
  },

  // Outcome of the action
  status: {
    type: String,
    enum: ['success', 'failure', 'partial'],
    default: 'success',
    index: true
  },

  errorMessage: {
    type: String,
    default: null
  },

  // Timestamp
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: false, // We manage createdAt manually
  collection: 'admin_audit_logs'
})

// Compound indexes for efficient querying
adminAuditLogSchema.index({ adminId: 1, createdAt: -1 })
adminAuditLogSchema.index({ action: 1, createdAt: -1 })
adminAuditLogSchema.index({ targetType: 1, targetId: 1, createdAt: -1 })
adminAuditLogSchema.index({ createdAt: -1 })
adminAuditLogSchema.index({ 'metadata.ipAddress': 1, createdAt: -1 })

// TTL index - keep logs for 2 years (730 days)
adminAuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 63072000 })

/**
 * Static method to create an audit log entry
 * @param {Object} data - Audit log data
 * @returns {Promise<Document>}
 */
adminAuditLogSchema.statics.logAction = async function(data) {
  return this.create({
    adminId: data.adminId,
    adminEmail: data.adminEmail,
    adminRole: data.adminRole,
    action: data.action,
    targetType: data.targetType,
    targetId: data.targetId || null,
    targetEmail: data.targetEmail || null,
    description: data.description,
    previousValue: data.previousValue || null,
    newValue: data.newValue || null,
    metadata: {
      ipAddress: data.ipAddress || 'unknown',
      userAgent: data.userAgent || '',
      sessionId: data.sessionId || '',
      requestId: data.requestId || crypto.randomUUID()
    },
    status: data.status || 'success',
    errorMessage: data.errorMessage || null
  })
}

/**
 * Static method to get logs for a specific admin
 * @param {ObjectId} adminId - Admin user ID
 * @param {Object} options - Query options
 * @returns {Promise<Document[]>}
 */
adminAuditLogSchema.statics.getByAdmin = async function(adminId, options = {}) {
  const { limit = 50, skip = 0, action, status } = options
  const query = { adminId }

  if (action) query.action = action
  if (status) query.status = status

  return this.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
}

/**
 * Static method to get logs for a specific target
 * @param {string} targetType - Type of target
 * @param {ObjectId} targetId - Target ID
 * @param {Object} options - Query options
 * @returns {Promise<Document[]>}
 */
adminAuditLogSchema.statics.getByTarget = async function(targetType, targetId, options = {}) {
  const { limit = 50, skip = 0 } = options

  return this.find({ targetType, targetId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
}

/**
 * Static method to get audit statistics
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Object>}
 */
adminAuditLogSchema.statics.getStats = async function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        successful: {
          $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
        },
        failed: {
          $sum: { $cond: [{ $eq: ['$status', 'failure'] }, 1, 0] }
        },
        byAction: {
          $push: '$action'
        },
        uniqueAdmins: {
          $addToSet: '$adminId'
        }
      }
    },
    {
      $project: {
        total: 1,
        successful: 1,
        failed: 1,
        uniqueAdminCount: { $size: '$uniqueAdmins' }
      }
    }
  ])
}

const AdminAuditLog = mongoose.models.AdminAuditLog || mongoose.model('AdminAuditLog', adminAuditLogSchema)

export default AdminAuditLog
