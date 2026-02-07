import mongoose from 'mongoose'

const literacyAssessmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    index: true
  },
  
  // Assessment type
  type: {
    type: String,
    enum: ['pre', 'post'],
    required: true
  },
  
  // User track at time of assessment
  userTrack: {
    type: String,
    enum: ['farmer', 'woman', 'student', 'young_adult', ''],
    default: ''
  },

  // Overall results
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  correctAnswers: {
    type: Number,
    required: true
  },
  
  // Theme-wise breakdown
  themeScores: [{
    theme: String,
    correct: Number,
    total: Number,
    percentage: Number
  }],
  
  // Time taken in seconds
  timeTaken: {
    type: Number,
    default: 0
  },
  
  // XP earned
  earnedXP: {
    type: Number,
    default: 0
  },

  // Literacy level classification
  literacyLevel: {
    type: String,
    enum: ['beginner', 'basic', 'intermediate', 'advanced', 'expert'],
    default: 'beginner'
  }
}, {
  timestamps: true
})

// Calculate literacy level from score
literacyAssessmentSchema.pre('save', function(next) {
  if (this.score >= 90) this.literacyLevel = 'expert'
  else if (this.score >= 75) this.literacyLevel = 'advanced'
  else if (this.score >= 55) this.literacyLevel = 'intermediate'
  else if (this.score >= 35) this.literacyLevel = 'basic'
  else this.literacyLevel = 'beginner'
  next()
})

// Static method to get improvement metrics
literacyAssessmentSchema.statics.getImprovementMetrics = async function(userId) {
  const assessments = await this.find({ userId }).sort({ createdAt: 1 })
  
  const preTests = assessments.filter(a => a.type === 'pre')
  const postTests = assessments.filter(a => a.type === 'post')
  
  if (preTests.length === 0) {
    return { hasPreTest: false, hasPostTest: false, improvement: null }
  }

  const latestPre = preTests[preTests.length - 1]
  const latestPost = postTests.length > 0 ? postTests[postTests.length - 1] : null
  
  const result = {
    hasPreTest: true,
    hasPostTest: !!latestPost,
    preTest: {
      score: latestPre.score,
      literacyLevel: latestPre.literacyLevel,
      themeScores: latestPre.themeScores,
      date: latestPre.createdAt
    },
    improvement: null
  }
  
  if (latestPost) {
    result.postTest = {
      score: latestPost.score,
      literacyLevel: latestPost.literacyLevel,
      themeScores: latestPost.themeScores,
      date: latestPost.createdAt
    }
    result.improvement = {
      scoreChange: latestPost.score - latestPre.score,
      percentageChange: Math.round(((latestPost.score - latestPre.score) / Math.max(latestPre.score, 1)) * 100),
      levelChange: latestPost.literacyLevel !== latestPre.literacyLevel,
      fromLevel: latestPre.literacyLevel,
      toLevel: latestPost.literacyLevel,
      themeImprovements: latestPost.themeScores.map(postTheme => {
        const preTheme = latestPre.themeScores.find(t => t.theme === postTheme.theme)
        return {
          theme: postTheme.theme,
          before: preTheme ? preTheme.percentage : 0,
          after: postTheme.percentage,
          change: postTheme.percentage - (preTheme ? preTheme.percentage : 0)
        }
      })
    }
  }
  
  result.totalAssessments = assessments.length
  return result
}

export default mongoose.models.LiteracyAssessment || 
  mongoose.model('LiteracyAssessment', literacyAssessmentSchema)
