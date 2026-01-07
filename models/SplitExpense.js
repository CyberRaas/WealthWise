import mongoose from 'mongoose'

/**
 * SplitExpense Model
 * Represents an expense within a split group
 * 
 * @module models/SplitExpense
 */

const splitAmongSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  memberName: {
    type: String,
    required: true
  },
  // Share amount for this member
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount cannot be negative']
  },
  // Percentage (for percentage splits)
  percentage: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  // Whether this person has settled their share
  isPaid: {
    type: Boolean,
    default: false
  }
}, { _id: false })

const splitExpenseSchema = new mongoose.Schema({
  // Reference to the group
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SplitGroup',
    required: [true, 'Group ID is required'],
    index: true
  },
  
  // Expense description
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  
  // Total expense amount
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0']
  },
  
  // Expense category
  category: {
    type: String,
    enum: [
      'food',           // Food & Dining
      'transport',      // Transportation
      'accommodation',  // Hotels, stays
      'entertainment',  // Movies, games, activities
      'shopping',       // Shopping
      'utilities',      // Bills, utilities
      'groceries',      // Grocery shopping
      'fuel',           // Petrol, diesel
      'medical',        // Medical expenses
      'education',      // Education related
      'other'           // Miscellaneous
    ],
    default: 'other'
  },
  
  // Date of expense
  date: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  // Who paid for this expense
  paidBy: {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Payer member ID is required']
    },
    memberName: {
      type: String,
      required: [true, 'Payer name is required']
    }
  },
  
  // How to split the expense
  splitType: {
    type: String,
    enum: ['equal', 'exact', 'percentage'],
    default: 'equal'
  },
  
  // Who shares this expense and their amounts
  splitAmong: {
    type: [splitAmongSchema],
    validate: {
      validator: function(splits) {
        return splits.length >= 1
      },
      message: 'At least one person must be included in the split'
    }
  },
  
  // Receipt/proof image URL (optional)
  receipt: {
    url: {
      type: String,
      default: null
    },
    uploadedAt: {
      type: Date,
      default: null
    }
  },
  
  // Additional notes
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  
  // Who added this expense
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Currency
  currency: {
    type: String,
    enum: ['INR', 'USD', 'EUR', 'GBP'],
    default: 'INR'
  },
  
  // Whether this expense has been synced to personal expense tracker
  syncedToExpenses: {
    type: Boolean,
    default: false
  },
  
  // Reference to personal expense (if synced)
  personalExpenseId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  
  // Soft delete flag
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },
  
  deletedAt: {
    type: Date,
    default: null
  },
  
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
})

// Compound indexes for efficient queries
splitExpenseSchema.index({ groupId: 1, date: -1 })
splitExpenseSchema.index({ groupId: 1, isDeleted: 1 })
splitExpenseSchema.index({ 'paidBy.memberId': 1 })
splitExpenseSchema.index({ 'splitAmong.memberId': 1 })
splitExpenseSchema.index({ addedBy: 1, createdAt: -1 })

// Virtual: Check if split amounts equal total
splitExpenseSchema.virtual('isBalanced').get(function() {
  const splitTotal = this.splitAmong.reduce((sum, s) => sum + s.amount, 0)
  return Math.abs(splitTotal - this.amount) < 0.01
})

// Method: Calculate equal split
splitExpenseSchema.methods.calculateEqualSplit = function(memberIds, memberNames) {
  const perPerson = this.amount / memberIds.length
  const roundedPerPerson = Math.floor(perPerson * 100) / 100
  
  // Calculate remainder for rounding adjustment
  const remainder = this.amount - (roundedPerPerson * memberIds.length)
  
  this.splitAmong = memberIds.map((memberId, index) => ({
    memberId,
    memberName: memberNames[index],
    // Add remainder to first person to balance
    amount: index === 0 ? roundedPerPerson + remainder : roundedPerPerson,
    percentage: 100 / memberIds.length
  }))
  
  this.splitType = 'equal'
}

// Method: Set exact amounts split
splitExpenseSchema.methods.setExactSplit = function(splits) {
  const totalSplit = splits.reduce((sum, s) => sum + s.amount, 0)
  
  if (Math.abs(totalSplit - this.amount) > 0.01) {
    throw new Error(`Split amounts (${totalSplit}) don't match total (${this.amount})`)
  }
  
  this.splitAmong = splits.map(s => ({
    memberId: s.memberId,
    memberName: s.memberName,
    amount: s.amount,
    percentage: (s.amount / this.amount) * 100
  }))
  
  this.splitType = 'exact'
}

// Method: Set percentage split
splitExpenseSchema.methods.setPercentageSplit = function(splits) {
  const totalPercentage = splits.reduce((sum, s) => sum + s.percentage, 0)
  
  if (Math.abs(totalPercentage - 100) > 0.01) {
    throw new Error('Percentages must add up to 100%')
  }
  
  this.splitAmong = splits.map(s => ({
    memberId: s.memberId,
    memberName: s.memberName,
    amount: Math.round((this.amount * s.percentage / 100) * 100) / 100,
    percentage: s.percentage
  }))
  
  this.splitType = 'percentage'
  
  // Adjust for rounding
  const actualTotal = this.splitAmong.reduce((sum, s) => sum + s.amount, 0)
  if (Math.abs(actualTotal - this.amount) > 0) {
    this.splitAmong[0].amount += this.amount - actualTotal
  }
}

// Method: Get share for a specific member
splitExpenseSchema.methods.getMemberShare = function(memberId) {
  const share = this.splitAmong.find(
    s => s.memberId.toString() === memberId.toString()
  )
  return share ? share.amount : 0
}

// Method: Check if member paid
splitExpenseSchema.methods.didMemberPay = function(memberId) {
  return this.paidBy.memberId.toString() === memberId.toString()
}

// Method: Soft delete
splitExpenseSchema.methods.softDelete = function(userId) {
  this.isDeleted = true
  this.deletedAt = new Date()
  this.deletedBy = userId
}

// Static: Get expenses by group
splitExpenseSchema.statics.getByGroup = function(groupId, options = {}) {
  const query = {
    groupId,
    isDeleted: false
  }
  
  if (options.startDate) {
    query.date = { $gte: options.startDate }
  }
  
  if (options.endDate) {
    query.date = { ...query.date, $lte: options.endDate }
  }
  
  if (options.category) {
    query.category = options.category
  }
  
  return this.find(query)
    .sort({ date: -1 })
    .limit(options.limit || 100)
}

// Static: Get expenses by member (paid by)
splitExpenseSchema.statics.getByMember = function(groupId, memberId) {
  return this.find({
    groupId,
    'paidBy.memberId': memberId,
    isDeleted: false
  }).sort({ date: -1 })
}

// Static: Calculate total expenses for a group
splitExpenseSchema.statics.getGroupTotal = function(groupId) {
  return this.aggregate([
    { $match: { groupId: new mongoose.Types.ObjectId(groupId), isDeleted: false } },
    { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
  ])
}

// Pre-save validation
splitExpenseSchema.pre('save', function(next) {
  // Ensure split amounts equal total
  if (!this.isBalanced) {
    const splitTotal = this.splitAmong.reduce((sum, s) => sum + s.amount, 0)
    return next(new Error(`Split amounts (${splitTotal}) must equal total (${this.amount})`))
  }
  next()
})

// Ensure virtuals are included in JSON
splitExpenseSchema.set('toJSON', { virtuals: true })
splitExpenseSchema.set('toObject', { virtuals: true })

const SplitExpense = mongoose.models.SplitExpense || mongoose.model('SplitExpense', splitExpenseSchema)

export default SplitExpense
