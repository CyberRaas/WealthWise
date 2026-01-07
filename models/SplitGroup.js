import mongoose from 'mongoose'

/**
 * SplitGroup Model
 * Represents a group for splitting expenses (like Splitwise)
 * 
 * @module models/SplitGroup
 */

const memberSchema = new mongoose.Schema({
  // Reference to registered user (null for non-registered members)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Member name (for non-registered members)
  name: {
    type: String,
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  
  // Email for invitations and identification
  email: {
    type: String,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  
  // Phone number (optional)
  phone: {
    type: String,
    trim: true,
    maxlength: 15
  },
  
  // Whether this member is a registered WealthWise user
  isRegistered: {
    type: Boolean,
    default: false
  },
  
  // Role in the group
  role: {
    type: String,
    enum: ['admin', 'member'],
    default: 'member'
  },
  
  // Member status
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'left'],
    default: 'active'
  },
  
  // Member's balance in this group
  // Positive = others owe this member, Negative = owes others
  balance: {
    type: Number,
    default: 0
  },
  
  // When they joined
  joinedAt: {
    type: Date,
    default: Date.now
  },
  
  // When they left (if applicable)
  leftAt: {
    type: Date,
    default: null
  }
}, { _id: true })

const balanceSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  memberName: {
    type: String,
    required: true
  },
  // Positive = others owe this member
  // Negative = this member owes others
  balance: {
    type: Number,
    default: 0
  }
}, { _id: false })

const splitGroupSchema = new mongoose.Schema({
  // Group name
  name: {
    type: String,
    required: [true, 'Group name is required'],
    trim: true,
    maxlength: [50, 'Group name cannot exceed 50 characters']
  },
  
  // Emoji icon for the group
  emoji: {
    type: String,
    default: '👥',
    maxlength: 10
  },
  
  // Group description
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  
  // Group type/category
  type: {
    type: String,
    enum: ['trip', 'home', 'couple', 'friends', 'family', 'event', 'work', 'project', 'other'],
    default: 'friends'
  },
  
  // Who created the group
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Group members
  members: {
    type: [memberSchema],
    validate: {
      validator: function(members) {
        return members.length >= 1
      },
      message: 'Group must have at least 1 member'
    }
  },
  
  // Calculated balances for quick access
  balances: [balanceSchema],
  
  // Running totals
  totalExpenses: {
    type: Number,
    default: 0,
    min: 0
  },
  
  expenseCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Default currency for the group
  currency: {
    type: String,
    enum: ['INR', 'USD', 'EUR', 'GBP'],
    default: 'INR'
  },
  
  // Group status
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  
  // Whether all debts are settled
  isSettled: {
    type: Boolean,
    default: true
  },
  
  // When group was settled (all balances zero)
  settledAt: {
    type: Date,
    default: null
  },
  
  // Cover image for the group (optional)
  coverImage: {
    type: String,
    default: null
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
  timestamps: true
})

// Indexes for efficient queries
splitGroupSchema.index({ createdBy: 1, isActive: 1 })
splitGroupSchema.index({ 'members.user': 1, isActive: 1 })
splitGroupSchema.index({ 'members.user': 1, createdAt: -1 })
splitGroupSchema.index({ 'members.email': 1 })
splitGroupSchema.index({ isSettled: 1, updatedAt: -1 })
splitGroupSchema.index({ createdAt: -1 })

// Virtual for member count
splitGroupSchema.virtual('memberCount').get(function() {
  return this.members.filter(m => m.status === 'active').length
})

// Method: Check if user is a member
splitGroupSchema.methods.isMember = function(userId) {
  return this.members.some(
    m => m.user?.toString() === userId.toString() && m.status === 'active'
  )
}

// Method: Check if user is admin
splitGroupSchema.methods.isAdmin = function(userId) {
  return this.members.some(
    m => m.user?.toString() === userId.toString() && m.role === 'admin' && m.status === 'active'
  )
}

// Method: Get member by ID
splitGroupSchema.methods.getMember = function(memberId) {
  return this.members.find(m => m._id.toString() === memberId.toString())
}

// Method: Add a member
splitGroupSchema.methods.addMember = function(memberData) {
  // Check if member already exists by email
  const existingMember = this.members.find(
    m => m.email && m.email === memberData.email && m.status === 'active'
  )
  
  if (existingMember) {
    throw new Error('Member with this email already exists in the group')
  }
  
  this.members.push({
    ...memberData,
    joinedAt: new Date()
  })
  
  // Initialize balance for new member
  this.balances.push({
    memberId: this.members[this.members.length - 1]._id,
    memberName: memberData.name,
    balance: 0
  })
  
  return this.members[this.members.length - 1]
}

// Method: Remove a member (soft delete)
splitGroupSchema.methods.removeMember = function(memberId) {
  const member = this.getMember(memberId)
  
  if (!member) {
    throw new Error('Member not found')
  }
  
  // Check if member has non-zero balance
  const balance = this.balances.find(b => b.memberId.toString() === memberId.toString())
  if (balance && balance.balance !== 0) {
    throw new Error('Cannot remove member with non-zero balance. Settle up first.')
  }
  
  member.status = 'left'
  member.leftAt = new Date()
  
  return member
}

// Method: Update balances after expense
splitGroupSchema.methods.recalculateStats = function(expenses) {
  // Reset
  this.totalExpenses = 0
  this.expenseCount = expenses.length
  
  // Reset all balances to 0
  this.balances = this.members
    .filter(m => m.status === 'active')
    .map(m => ({
      memberId: m._id,
      memberName: m.name,
      balance: 0
    }))
  
  // Calculate from expenses
  expenses.forEach(expense => {
    this.totalExpenses += expense.amount
    
    // Payer gets positive balance
    const payerBalance = this.balances.find(
      b => b.memberId.toString() === expense.paidBy.memberId.toString()
    )
    if (payerBalance) {
      payerBalance.balance += expense.amount
    }
    
    // Each person in split gets negative balance
    expense.splitAmong.forEach(split => {
      const memberBalance = this.balances.find(
        b => b.memberId.toString() === split.memberId.toString()
      )
      if (memberBalance) {
        memberBalance.balance -= split.amount
      }
    })
  })
  
  // Round balances to 2 decimal places
  this.balances.forEach(b => {
    b.balance = Math.round(b.balance * 100) / 100
  })
  
  // Check if settled
  this.isSettled = this.balances.every(b => Math.abs(b.balance) < 0.01)
  if (this.isSettled) {
    this.settledAt = new Date()
  } else {
    this.settledAt = null
  }
}

// Pre-save middleware
splitGroupSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

// Ensure virtuals are included in JSON
splitGroupSchema.set('toJSON', { virtuals: true })
splitGroupSchema.set('toObject', { virtuals: true })

const SplitGroup = mongoose.models.SplitGroup || mongoose.model('SplitGroup', splitGroupSchema)

export default SplitGroup
