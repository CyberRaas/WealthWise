import mongoose from 'mongoose'

/**
 * RiskProfile Model
 * Stores user's investment risk assessment and profile
 * 
 * @module models/RiskProfile
 */

const riskProfileSchema = new mongoose.Schema({
  // User reference (one profile per user)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  
  // Risk Assessment Answers
  assessment: {
    // Question 1: Age group
    ageGroup: {
      type: String,
      enum: ['18-25', '26-35', '36-45', '46-55', '55+'],
      required: true
    },
    
    // Question 2: Income stability
    incomeStability: {
      type: String,
      enum: [
        'very_stable',      // Government job, established business
        'stable',           // Private job, steady freelance
        'somewhat_stable',  // Contract work, variable income
        'unstable'          // Irregular income, starting out
      ],
      required: true
    },
    
    // Question 3: Investment time horizon
    investmentHorizon: {
      type: String,
      enum: [
        'less_than_1',   // Less than 1 year
        '1_3_years',     // 1-3 years
        '3_5_years',     // 3-5 years
        '5_10_years',    // 5-10 years
        '10_plus'        // More than 10 years
      ],
      required: true
    },
    
    // Question 4: Reaction to market drop
    riskTolerance: {
      type: String,
      enum: [
        'sell_immediately',   // Conservative - can't handle volatility
        'wait_and_watch',     // Moderate - wait for recovery
        'buy_more'            // Aggressive - sees opportunity
      ],
      required: true
    },
    
    // Question 5: Primary investment goal
    primaryGoal: {
      type: String,
      enum: [
        'wealth_creation',    // Long-term wealth building
        'retirement',         // Retirement planning
        'tax_saving',         // Save taxes under 80C, etc.
        'child_education',    // Children's education fund
        'house_purchase',     // Down payment for house
        'emergency_fund',     // Build emergency corpus
        'short_term_goal',    // Wedding, vacation, etc.
        'regular_income'      // Generate regular income
      ],
      required: true
    },
    
    // Question 6: Current investment experience
    investmentExperience: {
      type: String,
      enum: [
        'none',        // Never invested before
        'beginner',    // FDs, savings only
        'intermediate', // Mutual funds, PPF
        'advanced'     // Stocks, derivatives
      ],
      default: 'beginner'
    },
    
    // Question 7: Monthly investable amount
    monthlyInvestable: {
      type: String,
      enum: [
        'less_than_5000',    // < ₹5,000
        '5000_15000',        // ₹5,000 - ₹15,000
        '15000_30000',       // ₹15,000 - ₹30,000
        '30000_50000',       // ₹30,000 - ₹50,000
        'above_50000'        // > ₹50,000
      ],
      default: '5000_15000'
    },
    
    // Additional: Existing investments (multiple select)
    existingInvestments: [{
      type: String,
      enum: ['savings_account', 'fd', 'rd', 'ppf', 'nps', 'mutual_funds', 
             'stocks', 'gold', 'real_estate', 'crypto', 'insurance', 'none']
    }],
    
    // Additional: Has emergency fund?
    hasEmergencyFund: {
      type: Boolean,
      default: false
    },
    
    // Additional: Has dependents?
    hasDependents: {
      type: Boolean,
      default: false
    },
    
    // Additional: Has loans/EMIs?
    hasLoans: {
      type: Boolean,
      default: false
    }
  },
  
  // Calculated Risk Profile Type
  profileType: {
    type: String,
    enum: ['conservative', 'moderate', 'aggressive'],
    required: true,
    index: true
  },
  
  // Numeric risk score (1-10)
  riskScore: {
    type: Number,
    min: 1,
    max: 10,
    required: true
  },
  
  // Profile description
  profileDescription: {
    type: String,
    default: ''
  },
  
  // Recommended asset allocation percentages
  recommendedAllocation: {
    government: {      // PPF, NPS, SSY
      type: Number,
      min: 0,
      max: 100,
      default: 30
    },
    fixed_income: {    // FD, RD, Debt funds
      type: Number,
      min: 0,
      max: 100,
      default: 20
    },
    equity: {          // Mutual funds, stocks
      type: Number,
      min: 0,
      max: 100,
      default: 35
    },
    gold: {            // SGB, Gold ETF
      type: Number,
      min: 0,
      max: 100,
      default: 10
    },
    liquid: {          // Emergency fund, liquid funds
      type: Number,
      min: 0,
      max: 100,
      default: 5
    }
  },
  
  // Assessment completion status
  isComplete: {
    type: Boolean,
    default: false
  },
  
  // When assessment was completed
  assessedAt: {
    type: Date,
    default: null
  },
  
  // When profile was last updated
  lastUpdated: {
    type: Date,
    default: null
  },
  
  // Number of times assessment taken
  assessmentCount: {
    type: Number,
    default: 1
  },
  
  // Profile validity (suggest reassessment after 1 year)
  validUntil: {
    type: Date,
    default: () => new Date(+new Date() + 365 * 24 * 60 * 60 * 1000) // 1 year
  }
}, {
  timestamps: true
})

// Static method: Calculate risk profile from answers
riskProfileSchema.statics.calculateProfile = function(assessment) {
  let score = 0
  
  // Age scoring (younger = more risk capacity)
  const ageScores = {
    '18-25': 3,
    '26-35': 3,
    '36-45': 2,
    '46-55': 1,
    '55+': 0
  }
  score += ageScores[assessment.ageGroup] || 0
  
  // Income stability scoring
  const incomeScores = {
    'very_stable': 2,
    'stable': 2,
    'somewhat_stable': 1,
    'unstable': 0
  }
  score += incomeScores[assessment.incomeStability] || 0
  
  // Time horizon scoring (longer = more risk capacity)
  const horizonScores = {
    'less_than_1': 0,
    '1_3_years': 1,
    '3_5_years': 2,
    '5_10_years': 3,
    '10_plus': 4
  }
  score += horizonScores[assessment.investmentHorizon] || 0
  
  // Risk tolerance scoring
  const toleranceScores = {
    'sell_immediately': 0,
    'wait_and_watch': 2,
    'buy_more': 4
  }
  score += toleranceScores[assessment.riskTolerance] || 0
  
  // Experience scoring
  const experienceScores = {
    'none': 0,
    'beginner': 1,
    'intermediate': 2,
    'advanced': 3
  }
  score += experienceScores[assessment.investmentExperience] || 0
  
  // Normalize to 1-10 scale
  const maxScore = 16 // 3 + 2 + 4 + 4 + 3
  const normalizedScore = Math.round((score / maxScore) * 9) + 1
  
  // Determine profile type
  let profileType, profileDescription, allocation
  
  if (normalizedScore <= 3) {
    profileType = 'conservative'
    profileDescription = 'You prefer stability over high returns. Focus on guaranteed, low-risk investments.'
    allocation = {
      government: 50,
      fixed_income: 25,
      equity: 10,
      gold: 10,
      liquid: 5
    }
  } else if (normalizedScore <= 6) {
    profileType = 'moderate'
    profileDescription = 'You seek a balance between safety and growth. A diversified portfolio suits you.'
    allocation = {
      government: 30,
      fixed_income: 20,
      equity: 35,
      gold: 10,
      liquid: 5
    }
  } else {
    profileType = 'aggressive'
    profileDescription = 'You are comfortable with volatility for higher returns. Equity-heavy allocation is suitable.'
    allocation = {
      government: 15,
      fixed_income: 10,
      equity: 60,
      gold: 10,
      liquid: 5
    }
  }
  
  // Adjust for emergency fund
  if (!assessment.hasEmergencyFund) {
    allocation.liquid += 10
    allocation.equity -= 10
  }
  
  // Adjust for loans
  if (assessment.hasLoans) {
    allocation.government += 5
    allocation.equity -= 5
  }
  
  return {
    profileType,
    riskScore: normalizedScore,
    profileDescription,
    recommendedAllocation: allocation
  }
}

// Method: Update assessment
riskProfileSchema.methods.updateAssessment = function(newAssessment) {
  this.assessment = { ...this.assessment, ...newAssessment }
  
  // Recalculate profile
  const calculated = this.constructor.calculateProfile(this.assessment)
  
  this.profileType = calculated.profileType
  this.riskScore = calculated.riskScore
  this.profileDescription = calculated.profileDescription
  this.recommendedAllocation = calculated.recommendedAllocation
  
  this.lastUpdated = new Date()
  this.assessmentCount += 1
  this.validUntil = new Date(+new Date() + 365 * 24 * 60 * 60 * 1000)
  this.isComplete = true
  this.assessedAt = new Date()
}

// Method: Check if reassessment needed
riskProfileSchema.methods.needsReassessment = function() {
  if (!this.validUntil) return true
  return new Date() > this.validUntil
}

// Virtual: Is expired
riskProfileSchema.virtual('isExpired').get(function() {
  return this.needsReassessment()
})

// Virtual: Days until expiry
riskProfileSchema.virtual('daysUntilExpiry').get(function() {
  if (!this.validUntil) return 0
  const diff = this.validUntil - new Date()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
})

// Ensure virtuals are included in JSON
riskProfileSchema.set('toJSON', { virtuals: true })
riskProfileSchema.set('toObject', { virtuals: true })

const RiskProfile = mongoose.models.RiskProfile || mongoose.model('RiskProfile', riskProfileSchema)

export default RiskProfile
