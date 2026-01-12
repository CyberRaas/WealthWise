import mongoose from 'mongoose'

/**
 * InvestmentRecommendation Model
 * Stores personalized investment recommendations for users
 * 
 * @module models/InvestmentRecommendation
 */

const recommendationItemSchema = new mongoose.Schema({
  // Scheme identifier
  schemeKey: {
    type: String,
    required: true
  },

  // Display name
  schemeName: {
    type: String,
    required: true
  },

  // Scheme type
  schemeType: {
    type: String,
    enum: ['government', 'fixed_income', 'mutual_fund', 'gold', 'liquid'],
    required: true
  },

  // Suggested monthly investment amount
  suggestedAmount: {
    type: Number,
    required: true,
    min: 0
  },

  // Investment frequency
  frequency: {
    type: String,
    enum: ['monthly', 'quarterly', 'yearly', 'lumpsum', 'monthly_sip'],
    default: 'monthly'
  },

  // Percentage of total investment
  percentage: {
    type: Number,
    min: 0,
    max: 100
  },

  // Expected return range
  expectedReturn: {
    min: Number,
    max: Number,
    average: Number
  },

  // Risk level for this scheme
  riskLevel: {
    type: String,
    enum: ['very_low', 'low', 'moderate', 'high', 'very_high'],
    default: 'moderate'
  },

  // Why this is recommended
  reasoning: {
    type: String,
    required: true
  },

  // Projected future values
  projectedValue: {
    year1: Number,
    year3: Number,
    year5: Number,
    year10: Number
  },

  // Benefits of this scheme
  benefits: [String],

  // Limitations/risks
  risks: [String],

  // Tax benefits if any
  taxBenefit: {
    type: String,
    default: null
  },

  // Lock-in period
  lockIn: {
    type: String,
    default: 'None'
  },

  // Liquidity
  liquidity: {
    type: String,
    enum: ['very_high', 'high', 'moderate', 'low', 'very_low'],
    default: 'moderate'
  },

  // Required disclaimer for this scheme
  disclaimer: {
    type: String,
    default: null
  },

  // Priority order
  priority: {
    type: Number,
    default: 0
  }
}, { _id: false })

const totalProjectionSchema = new mongoose.Schema({
  totalMonthlyInvestment: {
    type: Number,
    required: true
  },

  // Future value projections
  year1Value: Number,
  year3Value: Number,
  year5Value: Number,
  year10Value: Number,

  // Total investment over 10 years
  totalInvested: Number,

  // Wealth created (projected value - invested)
  wealthCreated: Number,

  // Effective return rate
  effectiveReturnRate: Number
}, { _id: false })

const aiInsightsSchema = new mongoose.Schema({
  // Summary of recommendations
  summary: {
    type: String,
    default: ''
  },

  // Actionable tips
  tips: [String],

  // Warnings/cautions
  warnings: [String],

  // Personalized insights based on profile
  personalizedInsights: [String],

  // Next steps
  nextSteps: [String]
}, { _id: false })

const investmentRecommendationSchema = new mongoose.Schema({
  // User reference
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Based on this savings amount
  basedOnSavings: {
    type: Number,
    required: true,
    min: 0
  },

  // User's risk profile at time of recommendation
  riskProfile: {
    type: String,
    enum: ['conservative', 'moderate', 'aggressive'],
    required: true
  },

  // Risk score
  riskScore: {
    type: Number,
    min: 1,
    max: 10
  },

  // Investment horizon used for calculations
  investmentHorizon: {
    type: String,
    enum: ['1_3_years', '3_5_years', '5_10_years', '10_plus'],
    default: '5_10_years'
  },

  // Individual recommendations
  recommendations: [recommendationItemSchema],

  // Total projection summary
  totalProjection: totalProjectionSchema,

  // AI-generated insights
  aiInsights: aiInsightsSchema,

  // Asset allocation used
  assetAllocation: {
    government: { type: Number, default: 0 },
    fixed_income: { type: Number, default: 0 },
    equity: { type: Number, default: 0 },
    gold: { type: Number, default: 0 },
    liquid: { type: Number, default: 0 }
  },

  // User's goal this recommendation is for
  forGoal: {
    type: String,
    enum: [
      'wealth_creation', 'retirement', 'tax_saving', 'child_education',
      'house_purchase', 'emergency_fund', 'short_term_goal', 'regular_income',
      'general'
    ],
    default: 'general'
  },

  // User interaction status
  status: {
    type: String,
    enum: ['generated', 'viewed', 'saved', 'acted', 'dismissed', 'expired'],
    default: 'generated',
    index: true
  },

  // When user first viewed
  viewedAt: {
    type: Date,
    default: null
  },

  // User rating (1-5)
  userRating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },

  // User feedback
  userFeedback: {
    type: String,
    maxlength: 500
  },

  // Source of recommendation
  source: {
    type: String,
    enum: ['auto', 'manual', 'prompt', 'goal_based'],
    default: 'auto'
  },

  // Validity
  generatedAt: {
    type: Date,
    default: Date.now
  },

  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 30 * 24 * 60 * 60 * 1000) // 30 days
  },

  // Version for tracking algorithm changes
  algorithmVersion: {
    type: String,
    default: '1.0'
  }
}, {
  timestamps: true
})

// Indexes
investmentRecommendationSchema.index({ user: 1, generatedAt: -1 })
investmentRecommendationSchema.index({ user: 1, status: 1 })
investmentRecommendationSchema.index({ expiresAt: 1 })

// Virtual: Is expired
investmentRecommendationSchema.virtual('isExpired').get(function () {
  return new Date() > this.expiresAt
})

// Virtual: Total schemes recommended
investmentRecommendationSchema.virtual('schemeCount').get(function () {
  return this.recommendations.length
})

// Virtual: Has tax saving options
investmentRecommendationSchema.virtual('hasTaxSaving').get(function () {
  return this.recommendations.some(r => r.taxBenefit)
})

// Method: Mark as viewed
investmentRecommendationSchema.methods.markViewed = function () {
  if (!this.viewedAt) {
    this.viewedAt = new Date()
    this.status = 'viewed'
  }
}

// Method: Mark as acted upon
investmentRecommendationSchema.methods.markActed = function () {
  this.status = 'acted'
}

// Method: Dismiss
investmentRecommendationSchema.methods.dismiss = function () {
  this.status = 'dismissed'
}

// Method: Save recommendation
investmentRecommendationSchema.methods.saveRecommendation = function () {
  this.status = 'saved'
}

// Method: Rate recommendation
investmentRecommendationSchema.methods.rate = function (rating, feedback = '') {
  this.userRating = rating
  if (feedback) {
    this.userFeedback = feedback
  }
}

// Method: Get recommendation for a specific scheme type
investmentRecommendationSchema.methods.getBySchemeType = function (schemeType) {
  return this.recommendations.filter(r => r.schemeType === schemeType)
}

// Static: Get latest recommendation for user
investmentRecommendationSchema.statics.getLatestForUser = function (userId) {
  return this.findOne({
    user: userId,
    status: { $nin: ['expired', 'dismissed'] },
    expiresAt: { $gt: new Date() }
  }).sort({ generatedAt: -1 })
}

// Static: Get recommendation history for user
investmentRecommendationSchema.statics.getHistoryForUser = function (userId, limit = 10) {
  return this.find({ user: userId })
    .sort({ generatedAt: -1 })
    .limit(limit)
}

// Static: Mark expired recommendations
investmentRecommendationSchema.statics.markExpired = async function () {
  return this.updateMany(
    {
      expiresAt: { $lt: new Date() },
      status: { $nin: ['expired', 'acted', 'dismissed'] }
    },
    {
      $set: { status: 'expired' }
    }
  )
}

// Pre-save: Calculate totals
investmentRecommendationSchema.pre('save', function (next) {
  if (this.recommendations.length > 0) {
    // Sort by priority
    this.recommendations.sort((a, b) => a.priority - b.priority)

    // Calculate total monthly investment
    const totalMonthly = this.recommendations.reduce((sum, r) => {
      if (r.frequency === 'lumpsum') {
        return sum + (r.suggestedAmount / 12) // Annualize lumpsum
      }
      return sum + r.suggestedAmount
    }, 0)

    this.totalProjection = this.totalProjection || {}
    this.totalProjection.totalMonthlyInvestment = Math.round(totalMonthly)
  }

  next()
})

// Ensure virtuals are included in JSON
investmentRecommendationSchema.set('toJSON', { virtuals: true })
investmentRecommendationSchema.set('toObject', { virtuals: true })

const InvestmentRecommendation = mongoose.models.InvestmentRecommendation ||
  mongoose.model('InvestmentRecommendation', investmentRecommendationSchema)

export default InvestmentRecommendation
