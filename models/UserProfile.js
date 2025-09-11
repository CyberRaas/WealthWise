import mongoose from 'mongoose'

const userProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true  // This creates the index automatically, no need for separate schema.index()
  },
  
  // Basic Demographics
  monthlyIncome: {
    type: Number,
    min: [1000, 'Monthly income must be at least ₹1,000']
    // Removed required: true to allow initial profile creation
  },
  
  incomeSource: {
    type: String,
    enum: ['salary', 'business', 'freelance', 'other'],
    default: 'salary'
  },
  
  city: {
    type: String,
    trim: true
    // Removed required: true to allow initial profile creation
  },
  
  familySize: {
    type: Number,
    min: [1, 'Family size must be at least 1'],
    max: [20, 'Family size cannot exceed 20']
    // Removed required: true to allow initial profile creation
  },
  
  age: {
    type: Number,
    min: [18, 'Age must be at least 18'],
    max: [100, 'Age cannot exceed 100']
    // Removed required: true to allow initial profile creation
  },
  
  occupation: {
    type: String,
    trim: true,
    default: ''
  },
  
  // Additional Profile Fields
  name: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  dateOfBirth: {
    type: Date,
    default: null
  },
  profileImage: {
    type: String,
    default: ''
  },
  
  // Generated Budget
  generatedBudget: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  // Budget Health Score
  budgetHealthScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },

  // Last Budget Generated
  lastBudgetGenerated: {
    type: Date
  },
  
  // Budget Preferences
  budgetPreferences: {
    language: {
      type: String,
      enum: ['hindi', 'english', 'hinglish', 'en', 'hi'],
      default: 'hinglish'
    },
    currency: {
      type: String,
      enum: ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD'],
      default: 'INR'
    },
    notifications: {
      type: Boolean,
      default: true
    },
    // Enhanced localization preferences
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
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    // Notification preferences
    emailNotifications: {
      type: Boolean,
      default: true
    },
    pushNotifications: {
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
  
  // Expenses Data
  expenses: {
    type: mongoose.Schema.Types.Mixed,
    default: []
  },

  // Goals Data
  goals: {
    type: mongoose.Schema.Types.Mixed,
    default: []
  },

  // Onboarding Status
  onboardingCompleted: {
    type: Boolean,
    default: false
  },
  
  onboardingStep: {
    type: String,
    enum: ['income', 'demographics', 'budget_generation', 'review', 'completed'],
    default: 'income'
  },
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Enhanced indexes for better query performance
userProfileSchema.index({ city: 1 })
userProfileSchema.index({ onboardingCompleted: 1 })
userProfileSchema.index({ 'budgetPreferences.language': 1 })
userProfileSchema.index({ 'budgetPreferences.currency': 1 })
userProfileSchema.index({ 'budgetPreferences.timezone': 1 })
userProfileSchema.index({ monthlyIncome: 1 })
userProfileSchema.index({ age: 1 })
userProfileSchema.index({ incomeSource: 1 })
userProfileSchema.index({ createdAt: -1 })
userProfileSchema.index({ updatedAt: -1 })
// Compound indexes for common queries
userProfileSchema.index({ city: 1, monthlyIncome: 1 })
userProfileSchema.index({ 'budgetPreferences.language': 1, onboardingCompleted: 1 })
userProfileSchema.index({ age: 1, incomeSource: 1 })

// Pre-save middleware to update timestamps
userProfileSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

// Virtual for formatted income with localization support
userProfileSchema.virtual('formattedIncome').get(function() {
  const currency = this.budgetPreferences?.currency || 'INR'
  const language = this.budgetPreferences?.language || 'hinglish'
  
  // Map language to locale
  let locale = 'en-IN'
  if (language === 'hindi' || language === 'hi') {
    locale = 'hi-IN'
  } else if (language === 'english' || language === 'en') {
    locale = 'en-US'
  }
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0
  }).format(this.monthlyIncome || 0)
})

// Method to check if budget needs regeneration (if profile updated)
userProfileSchema.methods.needsBudgetRegeneration = function() {
  if (!this.generatedBudget || !this.generatedBudget.generatedAt) {
    return true
  }
  
  // Regenerate if profile updated after budget generation
  return this.updatedAt > this.generatedBudget.generatedAt
}

// Method to check if required onboarding fields are complete
userProfileSchema.methods.isOnboardingComplete = function() {
  return !!(this.monthlyIncome && this.city && this.familySize && this.age)
}

// Method to get onboarding completion percentage
userProfileSchema.methods.getOnboardingProgress = function() {
  const requiredFields = ['monthlyIncome', 'city', 'familySize', 'age']
  const completedFields = requiredFields.filter(field => this[field])
  return Math.round((completedFields.length / requiredFields.length) * 100)
}

// Enhanced method to get user's preferred language content
userProfileSchema.methods.getLocalizedContent = function(content) {
  const language = this.budgetPreferences?.language || 'hinglish'
  
  // Support both old and new language codes
  const languageMap = {
    'hindi': 'hi',
    'english': 'en',
    'hinglish': 'hinglish',
    'hi': 'hi',
    'en': 'en'
  }
  
  const mappedLanguage = languageMap[language] || 'en'
  
  return content[mappedLanguage] || content[language] || content.english || content.en || content
}

// Method to format currency with user preferences
userProfileSchema.methods.formatCurrency = function(amount) {
  const currency = this.budgetPreferences?.currency || 'INR'
  const language = this.budgetPreferences?.language || 'hinglish'
  
  let locale = 'en-IN'
  if (language === 'hindi' || language === 'hi') {
    locale = 'hi-IN'
  } else if (language === 'english' || language === 'en') {
    locale = 'en-US'
  }
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0
  }).format(amount || 0)
}

// Method to format numbers with user preferences
userProfileSchema.methods.formatNumber = function(number) {
  const format = this.budgetPreferences?.numberFormat || 'indian'
  const language = this.budgetPreferences?.language || 'hinglish'
  
  let locale = 'en-IN'
  if (format === 'international') {
    locale = 'en-US'
  } else if (language === 'hindi' || language === 'hi') {
    locale = 'hi-IN'
  }
  
  return new Intl.NumberFormat(locale).format(number || 0)
}

// Method to format date with user preferences
userProfileSchema.methods.formatDate = function(date) {
  const format = this.budgetPreferences?.dateFormat || 'DD/MM/YYYY'
  const language = this.budgetPreferences?.language || 'hinglish'
  
  let locale = 'en-IN'
  if (language === 'hindi' || language === 'hi') {
    locale = 'hi-IN'
  } else if (language === 'english' || language === 'en') {
    locale = 'en-US'
  }
  
  const dateObj = new Date(date)
  
  if (format === 'MM/DD/YYYY') {
    return dateObj.toLocaleDateString('en-US')
  } else if (format === 'YYYY-MM-DD') {
    return dateObj.toISOString().split('T')[0]
  } else {
    return dateObj.toLocaleDateString(locale)
  }
}

// Method to get user's timezone
userProfileSchema.methods.getTimezone = function() {
  return this.budgetPreferences?.timezone || 'Asia/Kolkata'
}

// Method to check notification preferences
userProfileSchema.methods.shouldSendNotification = function(type) {
  const prefs = this.budgetPreferences || {}
  
  switch (type) {
    case 'email':
      return prefs.emailNotifications !== false
    case 'push':
      return prefs.pushNotifications !== false
    case 'budget':
      return prefs.budgetAlerts !== false
    case 'goal':
      return prefs.goalReminders !== false
    case 'weekly':
      return prefs.weeklyReports !== false
    case 'monthly':
      return prefs.monthlyReports !== false
    default:
      return prefs.notifications !== false
  }
}

const UserProfile = mongoose.models.UserProfile || mongoose.model('UserProfile', userProfileSchema)

export default UserProfile
