import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  // NextAuth fields (these will be managed by NextAuth adapter)
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  image: {
    type: String,
    default: null
  },
  
  // Email verification
  emailVerified: {
    type: Date,
    default: null
  },
  
  // Enhanced user preferences
  preferences: {
    // Language and localization
    language: {
      type: String,
      enum: ['en', 'hi', 'hinglish'],
      default: 'en',
      index: true
    },
    
    // Regional settings
    currency: {
      type: String,
      enum: ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD'],
      default: 'INR'
    },
    
    timezone: {
      type: String,
      default: 'Asia/Kolkata'
    },
    
    dateFormat: {
      type: String,
      enum: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'],
      default: 'DD/MM/YYYY'
    },
    
    numberFormat: {
      type: String,
      enum: ['indian', 'international'],
      default: 'indian' // 1,00,000 vs 100,000
    },
    
    // Notification preferences
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      budgetAlerts: {
        type: Boolean,
        default: true
      },
      goalReminders: {
        type: Boolean,
        default: true
      },
      weeklyReports: {
        type: Boolean,
        default: true
      },
      monthlyReports: {
        type: Boolean,
        default: true
      }
    },
    
    // Privacy settings
    privacy: {
      shareData: {
        type: Boolean,
        default: false
      },
      analytics: {
        type: Boolean,
        default: true
      },
      profileVisibility: {
        type: String,
        enum: ['public', 'private', 'friends'],
        default: 'private'
      }
    },
    
    // UI preferences
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    
    // Dashboard preferences
    dashboard: {
      defaultView: {
        type: String,
        enum: ['overview', 'budget', 'expenses', 'goals'],
        default: 'overview'
      },
      compactMode: {
        type: Boolean,
        default: false
      }
    }
  },
  
  // User profile information
  profile: {
    city: {
      type: String,
      trim: true,
      default: ''
    },
    
    country: {
      type: String,
      trim: true,
      default: 'India'
    },
    
    familySize: {
      type: Number,
      min: 1,
      max: 20,
      default: 1
    },
    
    ageRange: {
      type: String,
      enum: ['18-25', '26-35', '36-45', '46-55', '56-65', '65+'],
      default: '26-35'
    },
    
    occupation: {
      type: String,
      trim: true,
      default: ''
    },
    
    financialExperience: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    
    bio: {
      type: String,
      maxlength: 500,
      default: ''
    },
    
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    
    dateOfBirth: {
      type: Date,
      default: null
    }
  },
  
  // Subscription information
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'premium', 'family'],
      default: 'free'
    },
    
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled', 'expired'],
      default: 'active'
    },
    
    startDate: {
      type: Date,
      default: null
    },
    
    endDate: {
      type: Date,
      default: null
    },
    
    features: {
      type: [String],
      default: ['basic_budgeting', 'expense_tracking']
    }
  },
  
  // Security and authentication
  security: {
    lastLogin: {
      type: Date,
      default: null
    },
    
    loginCount: {
      type: Number,
      default: 0
    },
    
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },
    
    passwordChangedAt: {
      type: Date,
      default: null
    }
  },
  
  // Onboarding and user journey
  onboarding: {
    completed: {
      type: Boolean,
      default: false
    },
    
    currentStep: {
      type: String,
      enum: ['welcome', 'profile', 'preferences', 'budget_setup', 'completed'],
      default: 'welcome'
    },
    
    completedSteps: {
      type: [String],
      default: []
    },
    
    skippedSteps: {
      type: [String],
      default: []
    }
  },
  
  // User activity and engagement
  activity: {
    lastActiveAt: {
      type: Date,
      default: Date.now
    },
    
    totalSessions: {
      type: Number,
      default: 0
    },
    
    averageSessionDuration: {
      type: Number,
      default: 0 // in minutes
    },
    
    featuresUsed: {
      type: [String],
      default: []
    }
  },
  
  // Account status
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'deleted'],
    default: 'active',
    index: true
  },

  // Role-based access control for admin panel
  role: {
    type: String,
    enum: ['user', 'moderator', 'admin', 'super_admin'],
    default: 'user',
    index: true
  },

  // Admin-specific profile (only populated for admin roles)
  adminProfile: {
    // Custom permissions beyond role defaults
    permissions: {
      type: [String],
      default: []
    },
    // Department for organizational structure
    department: {
      type: String,
      trim: true,
      default: ''
    },
    // Internal notes about the admin
    adminNotes: {
      type: String,
      maxlength: 1000,
      default: ''
    },
    // Tracking admin activity
    lastAdminAction: {
      type: Date,
      default: null
    },
    // When admin privileges were granted
    adminCreatedAt: {
      type: Date,
      default: null
    },
    // Who granted admin privileges
    adminCreatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for performance
// Note: email and preferences.language indexes are already defined in the schema with `index: true`
userSchema.index({ 'preferences.currency': 1 })
userSchema.index({ status: 1, createdAt: -1 })
userSchema.index({ 'onboarding.completed': 1 })
userSchema.index({ 'activity.lastActiveAt': -1 })
userSchema.index({ 'subscription.plan': 1, 'subscription.status': 1 })
// Admin-related indexes
userSchema.index({ role: 1, status: 1 })
userSchema.index({ 'adminProfile.department': 1 })

// Virtual for full name
userSchema.virtual('displayName').get(function() {
  return this.name || this.email.split('@')[0]
})

// Virtual for subscription status
userSchema.virtual('isSubscriptionActive').get(function() {
  if (!this.subscription) return false
  return this.subscription.status === 'active' && 
         (!this.subscription.endDate || this.subscription.endDate > new Date())
})

// Virtual for onboarding progress
userSchema.virtual('onboardingProgress').get(function() {
  const totalSteps = 4 // welcome, profile, preferences, budget_setup
  const completedSteps = this.onboarding?.completedSteps?.length || 0
  return Math.round((completedSteps / totalSteps) * 100)
})

// Virtual for checking if user is admin (moderator or higher)
userSchema.virtual('isAdmin').get(function() {
  if (!this.role) return false
  return ['moderator', 'admin', 'super_admin'].includes(this.role)
})

// Virtual for checking if user is super admin
userSchema.virtual('isSuperAdmin').get(function() {
  if (!this.role) return false
  return this.role === 'super_admin'
})

// Pre-save middleware
userSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  
  // Update activity
  if (this.isModified() && !this.isNew) {
    this.activity.lastActiveAt = new Date()
  }
  
  next()
})

// Instance methods
userSchema.methods.updateActivity = function(feature) {
  this.activity.lastActiveAt = new Date()
  this.activity.totalSessions += 1
  
  if (feature && !this.activity.featuresUsed.includes(feature)) {
    this.activity.featuresUsed.push(feature)
  }
  
  return this.save()
}

userSchema.methods.completeOnboardingStep = function(step) {
  if (!this.onboarding.completedSteps.includes(step)) {
    this.onboarding.completedSteps.push(step)
  }
  
  // Remove from skipped if it was there
  this.onboarding.skippedSteps = this.onboarding.skippedSteps.filter(s => s !== step)
  
  // Check if onboarding is complete
  const requiredSteps = ['profile', 'preferences', 'budget_setup']
  const isComplete = requiredSteps.every(step => this.onboarding.completedSteps.includes(step))
  
  if (isComplete) {
    this.onboarding.completed = true
    this.onboarding.currentStep = 'completed'
  }
  
  return this.save()
}

userSchema.methods.getLocalizedContent = function(content) {
  const language = this.preferences.language || 'en'
  return content[language] || content.en || content
}

userSchema.methods.formatCurrency = function(amount) {
  const currency = this.preferences.currency || 'INR'
  const locale = this.preferences.language === 'hi' ? 'hi-IN' : 'en-IN'
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0
  }).format(amount)
}

userSchema.methods.formatNumber = function(number) {
  const format = this.preferences.numberFormat || 'indian'
  const locale = format === 'indian' ? 'en-IN' : 'en-US'
  
  return new Intl.NumberFormat(locale).format(number)
}

// Static methods
userSchema.statics.findByLanguage = function(language) {
  return this.find({ 'preferences.language': language, status: 'active' })
}

userSchema.statics.getActiveUsers = function() {
  return this.find({ status: 'active' })
}

userSchema.statics.getUserStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        activeUsers: {
          $sum: {
            $cond: [{ $eq: ['$status', 'active'] }, 1, 0]
          }
        },
        completedOnboarding: {
          $sum: {
            $cond: ['$onboarding.completed', 1, 0]
          }
        },
        languageDistribution: {
          $push: '$preferences.language'
        }
      }
    }
  ])
}

const User = mongoose.models.User || mongoose.model('User', userSchema)

export default User