import mongoose from 'mongoose'

const systemConfigSchema = new mongoose.Schema({
  // Unique configuration key
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },

  // Configuration value (can be any type)
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },

  // Human-readable description
  description: {
    type: String,
    default: '',
    maxlength: 500
  },

  // Category for grouping configurations
  category: {
    type: String,
    enum: ['general', 'email', 'security', 'features', 'limits', 'maintenance', 'notifications'],
    default: 'general',
    index: true
  },

  // Whether this config contains sensitive data
  isSecret: {
    type: Boolean,
    default: false
  },

  // Whether this config can be edited via admin panel
  isEditable: {
    type: Boolean,
    default: true
  },

  // Data type hint for admin UI
  dataType: {
    type: String,
    enum: ['string', 'number', 'boolean', 'json', 'array'],
    default: 'string'
  },

  // Validation rules (for admin UI)
  validation: {
    min: Number,
    max: Number,
    pattern: String,
    options: [String] // For select/enum fields
  },

  // Who last updated this config
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'system_configs'
})

// Index for efficient category queries
systemConfigSchema.index({ category: 1, key: 1 })

/**
 * Static method to get a config value by key
 * @param {string} key - Configuration key
 * @param {*} defaultValue - Default value if not found
 * @returns {Promise<*>}
 */
systemConfigSchema.statics.getValue = async function(key, defaultValue = null) {
  const config = await this.findOne({ key })
  return config ? config.value : defaultValue
}

/**
 * Static method to set a config value
 * @param {string} key - Configuration key
 * @param {*} value - Value to set
 * @param {ObjectId} updatedBy - User ID who is updating
 * @returns {Promise<Document>}
 */
systemConfigSchema.statics.setValue = async function(key, value, updatedBy) {
  return this.findOneAndUpdate(
    { key },
    {
      value,
      updatedBy,
      updatedAt: new Date()
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  )
}

/**
 * Static method to get all configs by category
 * @param {string} category - Category name
 * @param {boolean} includeSecrets - Whether to include secret values
 * @returns {Promise<Document[]>}
 */
systemConfigSchema.statics.getByCategory = async function(category, includeSecrets = false) {
  const query = { category }
  const projection = includeSecrets ? {} : { value: { $cond: ['$isSecret', '***', '$value'] } }

  return this.find(query).select(projection).sort({ key: 1 })
}

/**
 * Static method to get all configs (for admin panel)
 * @param {boolean} includeSecrets - Whether to include secret values
 * @returns {Promise<Object>}
 */
systemConfigSchema.statics.getAll = async function(includeSecrets = false) {
  const configs = await this.find({}).sort({ category: 1, key: 1 })

  // Group by category
  const grouped = {}
  for (const config of configs) {
    if (!grouped[config.category]) {
      grouped[config.category] = []
    }

    const configObj = config.toObject()
    if (config.isSecret && !includeSecrets) {
      configObj.value = '***'
    }
    grouped[config.category].push(configObj)
  }

  return grouped
}

/**
 * Static method to initialize default configs
 * @returns {Promise<void>}
 */
systemConfigSchema.statics.initializeDefaults = async function() {
  const defaults = [
    // General settings
    {
      key: 'app.name',
      value: 'WealthWise',
      category: 'general',
      description: 'Application name',
      dataType: 'string'
    },
    {
      key: 'app.maintenance_mode',
      value: false,
      category: 'maintenance',
      description: 'Enable maintenance mode',
      dataType: 'boolean'
    },
    {
      key: 'app.maintenance_message',
      value: 'We are currently performing scheduled maintenance. Please try again later.',
      category: 'maintenance',
      description: 'Message shown during maintenance',
      dataType: 'string'
    },

    // Security settings
    {
      key: 'security.max_login_attempts',
      value: 5,
      category: 'security',
      description: 'Maximum login attempts before lockout',
      dataType: 'number',
      validation: { min: 3, max: 10 }
    },
    {
      key: 'security.lockout_duration',
      value: 15,
      category: 'security',
      description: 'Account lockout duration in minutes',
      dataType: 'number',
      validation: { min: 5, max: 60 }
    },
    {
      key: 'security.session_timeout',
      value: 30,
      category: 'security',
      description: 'Session timeout in days',
      dataType: 'number',
      validation: { min: 1, max: 90 }
    },

    // Feature flags
    {
      key: 'features.voice_input',
      value: true,
      category: 'features',
      description: 'Enable voice expense entry',
      dataType: 'boolean'
    },
    {
      key: 'features.ai_insights',
      value: true,
      category: 'features',
      description: 'Enable AI-powered insights',
      dataType: 'boolean'
    },
    {
      key: 'features.multi_language',
      value: true,
      category: 'features',
      description: 'Enable multi-language support',
      dataType: 'boolean'
    },
    {
      key: 'features.premium_features',
      value: true,
      category: 'features',
      description: 'Enable premium features',
      dataType: 'boolean'
    },

    // Limits
    {
      key: 'limits.max_expenses_per_month',
      value: 1000,
      category: 'limits',
      description: 'Maximum expenses per user per month',
      dataType: 'number',
      validation: { min: 100, max: 10000 }
    },
    {
      key: 'limits.max_goals',
      value: 20,
      category: 'limits',
      description: 'Maximum financial goals per user',
      dataType: 'number',
      validation: { min: 5, max: 100 }
    },
    {
      key: 'limits.max_income_sources',
      value: 10,
      category: 'limits',
      description: 'Maximum income sources per user',
      dataType: 'number',
      validation: { min: 3, max: 50 }
    },

    // Notification settings
    {
      key: 'notifications.email_enabled',
      value: true,
      category: 'notifications',
      description: 'Enable email notifications globally',
      dataType: 'boolean'
    },
    {
      key: 'notifications.daily_digest_time',
      value: '09:00',
      category: 'notifications',
      description: 'Time to send daily digest (24h format)',
      dataType: 'string'
    }
  ]

  for (const config of defaults) {
    await this.findOneAndUpdate(
      { key: config.key },
      { $setOnInsert: config },
      { upsert: true }
    )
  }
}

const SystemConfig = mongoose.models.SystemConfig || mongoose.model('SystemConfig', systemConfigSchema)

export default SystemConfig
