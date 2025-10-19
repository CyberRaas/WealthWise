/**
 * GigEarning Model - Track gig worker earnings across platforms
 */

import mongoose from 'mongoose';

const gigEarningSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  platform: {
    type: String,
    enum: ['uber', 'ola', 'swiggy', 'zomato', 'urban_company', 'dunzo', 'rapido', 'porter', 'other'],
    required: true
  },

  amount: {
    type: Number,
    required: true,
    min: 0
  },

  date: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },

  // Trip/Order details
  tripCount: {
    type: Number,
    default: 1
  },

  distance: {
    type: Number, // in kilometers
    default: 0
  },

  duration: {
    type: Number, // in minutes
    default: 0
  },

  // Expenses related to this earning
  expenses: {
    fuel: { type: Number, default: 0 },
    maintenance: { type: Number, default: 0 },
    toll: { type: Number, default: 0 },
    parking: { type: Number, default: 0 },
    other: { type: Number, default: 0 }
  },

  // Net earnings after expenses
  netEarnings: {
    type: Number
  },

  // Peak/surge earnings
  peakHours: {
    type: Boolean,
    default: false
  },

  incentive: {
    type: Number,
    default: 0
  },

  tips: {
    type: Number,
    default: 0
  },

  // Location
  city: String,
  area: String,

  // Notes
  notes: String,

  // Entry method
  entryMethod: {
    type: String,
    enum: ['manual', 'voice', 'sms', 'csv_import', 'screenshot'],
    default: 'manual'
  },

  // Status
  status: {
    type: String,
    enum: ['pending', 'completed', 'disputed'],
    default: 'completed'
  }

}, {
  timestamps: true
});

// Calculate net earnings before save
gigEarningSchema.pre('save', function(next) {
  const totalExpenses =
    (this.expenses.fuel || 0) +
    (this.expenses.maintenance || 0) +
    (this.expenses.toll || 0) +
    (this.expenses.parking || 0) +
    (this.expenses.other || 0);

  this.netEarnings = this.amount - totalExpenses;
  next();
});

// Indexes for performance
gigEarningSchema.index({ userId: 1, date: -1 });
gigEarningSchema.index({ userId: 1, platform: 1, date: -1 });
gigEarningSchema.index({ date: -1 });

// Virtual for total income (gross + incentives + tips)
gigEarningSchema.virtual('totalIncome').get(function() {
  return this.amount + (this.incentive || 0) + (this.tips || 0);
});

// Static method: Get earnings summary for a user
gigEarningSchema.statics.getSummary = async function(userId, startDate, endDate) {
  const earnings = await this.find({
    userId,
    date: { $gte: startDate, $lte: endDate }
  });

  const summary = {
    totalEarnings: 0,
    totalExpenses: 0,
    netEarnings: 0,
    totalTrips: 0,
    totalDistance: 0,
    totalIncentives: 0,
    totalTips: 0,
    byPlatform: {},
    avgEarningsPerTrip: 0,
    avgEarningsPerDay: 0
  };

  earnings.forEach(earning => {
    summary.totalEarnings += earning.amount;
    summary.totalIncentives += earning.incentive || 0;
    summary.totalTips += earning.tips || 0;
    summary.totalTrips += earning.tripCount || 0;
    summary.totalDistance += earning.distance || 0;

    const totalExpenses =
      (earning.expenses.fuel || 0) +
      (earning.expenses.maintenance || 0) +
      (earning.expenses.toll || 0) +
      (earning.expenses.parking || 0) +
      (earning.expenses.other || 0);

    summary.totalExpenses += totalExpenses;

    // By platform
    if (!summary.byPlatform[earning.platform]) {
      summary.byPlatform[earning.platform] = {
        earnings: 0,
        trips: 0,
        expenses: 0
      };
    }

    summary.byPlatform[earning.platform].earnings += earning.amount;
    summary.byPlatform[earning.platform].trips += earning.tripCount || 0;
    summary.byPlatform[earning.platform].expenses += totalExpenses;
  });

  summary.netEarnings = summary.totalEarnings - summary.totalExpenses;
  summary.avgEarningsPerTrip = summary.totalTrips > 0
    ? summary.totalEarnings / summary.totalTrips
    : 0;

  const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  summary.avgEarningsPerDay = days > 0 ? summary.totalEarnings / days : 0;

  return summary;
};

// Static method: Get best earning hours/days
gigEarningSchema.statics.getBestTimings = async function(userId) {
  const earnings = await this.find({ userId }).sort({ date: -1 }).limit(100);

  const byDayOfWeek = Array(7).fill(0).map(() => ({ count: 0, total: 0 }));
  const byHour = Array(24).fill(0).map(() => ({ count: 0, total: 0 }));

  earnings.forEach(earning => {
    const date = new Date(earning.date);
    const day = date.getDay();
    const hour = date.getHours();

    byDayOfWeek[day].count++;
    byDayOfWeek[day].total += earning.amount;

    byHour[hour].count++;
    byHour[hour].total += earning.amount;
  });

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const bestDays = byDayOfWeek
    .map((data, index) => ({
      day: dayNames[index],
      avgEarning: data.count > 0 ? data.total / data.count : 0
    }))
    .sort((a, b) => b.avgEarning - a.avgEarning);

  const bestHours = byHour
    .map((data, index) => ({
      hour: index,
      avgEarning: data.count > 0 ? data.total / data.count : 0
    }))
    .sort((a, b) => b.avgEarning - a.avgEarning)
    .slice(0, 5);

  return { bestDays, bestHours };
};

const GigEarning = mongoose.models.GigEarning || mongoose.model('GigEarning', gigEarningSchema);

export default GigEarning;
