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
      enum: ['hindi', 'english', 'hinglish'],
      default: 'hinglish'
    },
    currency: {
      type: String,
      default: 'INR'
    },
    notifications: {
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

// Index for better query performance (removed duplicate userId index)
userProfileSchema.index({ city: 1 })
userProfileSchema.index({ onboardingCompleted: 1 })

// Pre-save middleware to update timestamps
userProfileSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

// Virtual for formatted income
userProfileSchema.virtual('formattedIncome').get(function() {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(this.monthlyIncome)
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

// Method to get user's preferred language content
userProfileSchema.methods.getLocalizedContent = function(content) {
  const language = this.budgetPreferences.language || 'hinglish'
  return content[language] || content.english || content
}

const UserProfile = mongoose.models.UserProfile || mongoose.model('UserProfile', userProfileSchema)

export default UserProfile
