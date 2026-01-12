import mongoose from 'mongoose'

/**
 * Settlement Model
 * Records payment/settlement between group members
 * 
 * @module models/Settlement
 */

const settlementSchema = new mongoose.Schema({
  // Reference to the group
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SplitGroup',
    required: [true, 'Group ID is required'],
    index: true
  },

  // Who is paying (the debtor)
  from: {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Payer member ID is required']
    },
    memberName: {
      type: String,
      required: [true, 'Payer name is required']
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },

  // Who is receiving (the creditor)
  to: {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Receiver member ID is required']
    },
    memberName: {
      type: String,
      required: [true, 'Receiver name is required']
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },

  // Settlement amount
  amount: {
    type: Number,
    required: [true, 'Settlement amount is required'],
    min: [0.01, 'Amount must be greater than 0']
  },

  // Currency
  currency: {
    type: String,
    enum: ['INR', 'USD', 'EUR', 'GBP'],
    default: 'INR'
  },

  // Payment method
  method: {
    type: String,
    enum: ['cash', 'upi', 'bank_transfer', 'gpay', 'phonepe', 'paytm', 'other'],
    default: 'cash'
  },

  // Payment reference (UPI transaction ID, etc.)
  reference: {
    type: String,
    trim: true,
    maxlength: 100
  },

  // Settlement status
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled', 'disputed'],
    default: 'completed',
    index: true
  },

  // Notes
  notes: {
    type: String,
    trim: true,
    maxlength: [300, 'Notes cannot exceed 300 characters']
  },

  // Who recorded this settlement
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // When the actual payment was made
  paidAt: {
    type: Date,
    default: Date.now
  },

  // Confirmation from receiver (optional)
  confirmedByReceiver: {
    type: Boolean,
    default: false
  },

  confirmedAt: {
    type: Date,
    default: null
  },

  // If cancelled or disputed
  cancellation: {
    reason: {
      type: String,
      default: null
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    cancelledAt: {
      type: Date,
      default: null
    }
  }
}, {
  timestamps: true
})

// Indexes
settlementSchema.index({ groupId: 1, status: 1 })
settlementSchema.index({ 'from.memberId': 1, status: 1 })
settlementSchema.index({ 'to.memberId': 1, status: 1 })
settlementSchema.index({ recordedBy: 1 })
settlementSchema.index({ paidAt: -1 })

// Virtual: Is confirmed
settlementSchema.virtual('isConfirmed').get(function () {
  return this.status === 'completed' && this.confirmedByReceiver
})

// Method: Confirm by receiver
settlementSchema.methods.confirm = function (userId) {
  if (this.to.userId?.toString() !== userId.toString()) {
    throw new Error('Only the receiver can confirm this settlement')
  }

  this.confirmedByReceiver = true
  this.confirmedAt = new Date()
}

// Method: Cancel settlement
settlementSchema.methods.cancel = function (userId, reason) {
  if (this.status !== 'pending' && this.status !== 'completed') {
    throw new Error('Cannot cancel this settlement')
  }

  this.status = 'cancelled'
  this.cancellation = {
    reason,
    cancelledBy: userId,
    cancelledAt: new Date()
  }
}

// Method: Mark as disputed
settlementSchema.methods.dispute = function (userId, reason) {
  this.status = 'disputed'
  this.cancellation = {
    reason,
    cancelledBy: userId,
    cancelledAt: new Date()
  }
}

// Static: Get settlements by group
settlementSchema.statics.getByGroup = function (groupId, options = {}) {
  const query = { groupId }

  if (options.status) {
    query.status = options.status
  }

  return this.find(query)
    .sort({ paidAt: -1 })
    .limit(options.limit || 50)
}

// Static: Get settlements for a member
settlementSchema.statics.getByMember = function (groupId, memberId) {
  return this.find({
    groupId,
    $or: [
      { 'from.memberId': memberId },
      { 'to.memberId': memberId }
    ]
  }).sort({ paidAt: -1 })
}

// Static: Get total settled amount in a group
settlementSchema.statics.getGroupSettledTotal = function (groupId) {
  return this.aggregate([
    {
      $match: {
        groupId: new mongoose.Types.ObjectId(groupId),
        status: 'completed'
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ])
}

// Static: Get pending settlements for a member
settlementSchema.statics.getPendingForMember = function (memberId) {
  return this.find({
    'from.memberId': memberId,
    status: 'pending'
  }).sort({ paidAt: -1 })
}

// Ensure virtuals are included in JSON
settlementSchema.set('toJSON', { virtuals: true })
settlementSchema.set('toObject', { virtuals: true })

const Settlement = mongoose.models.Settlement || mongoose.model('Settlement', settlementSchema)

export default Settlement
