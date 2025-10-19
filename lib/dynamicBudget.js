/**
 * Dynamic Budget Adjustment for Variable Income
 *
 * Automatically adjusts budget based on actual income for gig workers
 */

import { connectToDatabase } from './database';

/**
 * Adjust budget based on actual income
 */
export async function adjustBudgetForIncome(userId, actualIncome, originalBudget) {
  if (!originalBudget || !originalBudget.categories) {
    return null;
  }

  const originalIncome = originalBudget.totalBudget || actualIncome;
  const adjustmentRatio = actualIncome / originalIncome;

  // Define essential vs discretionary categories
  const essentialCategories = [
    'Food & Dining',
    'Housing & Utilities',
    'Healthcare',
    'Transportation'
  ];

  const adjustedBudget = {
    ...originalBudget,
    totalBudget: actualIncome,
    categories: {},
    adjustmentRatio,
    adjustedAt: new Date()
  };

  // Calculate adjusted allocations
  for (const [category, data] of Object.entries(originalBudget.categories)) {
    const isEssential = essentialCategories.includes(category);

    let adjustedAmount;

    if (adjustmentRatio < 1) {
      // Income decreased - protect essentials
      if (isEssential) {
        // Reduce essentials by max 20%
        adjustedAmount = data.amount * Math.max(0.8, adjustmentRatio);
      } else {
        // Cut discretionary spending more aggressively
        adjustedAmount = data.amount * adjustmentRatio * 0.7;
      }
    } else {
      // Income increased - scale proportionally
      adjustedAmount = data.amount * Math.min(1.3, adjustmentRatio); // Cap at 30% increase
    }

    adjustedBudget.categories[category] = {
      ...data,
      amount: Math.round(adjustedAmount),
      originalAmount: data.amount,
      adjustment: adjustedAmount - data.amount,
      adjustmentPercent: ((adjustedAmount - data.amount) / data.amount) * 100
    };
  }

  // Recalculate savings
  const totalAllocated = Object.values(adjustedBudget.categories)
    .reduce((sum, cat) => sum + cat.amount, 0);

  adjustedBudget.totalAllocated = totalAllocated;
  adjustedBudget.savings = {
    amount: actualIncome - totalAllocated,
    percentage: ((actualIncome - totalAllocated) / actualIncome) * 100
  };

  return adjustedBudget;
}

/**
 * Get income smoothing recommendation
 */
export async function getIncomeSmoothingStrategy(userId, incomeHistory) {
  if (!incomeHistory || incomeHistory.length < 3) {
    return null;
  }

  // Calculate income statistics
  const amounts = incomeHistory.map(i => i.amount);
  const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const min = Math.min(...amounts);
  const max = Math.max(...amounts);
  const variance = amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / amounts.length;
  const stdDev = Math.sqrt(variance);

  // Smoothing strategy
  const strategy = {
    recommendedMonthlyBudget: min * 0.9, // Budget based on 90% of minimum income
    bufferFundTarget: stdDev * 2, // Save 2 standard deviations as buffer
    goodMonthSavings: max - (min * 0.9), // Save excess in good months
    strategy: 'Save extra in high-income months to cover lean periods',
    details: {
      avgIncome: mean,
      minIncome: min,
      maxIncome: max,
      volatility: (stdDev / mean) * 100
    }
  };

  // Generate specific recommendations
  if (strategy.details.volatility > 30) {
    strategy.recommendations = [
      `Your income varies by ${strategy.details.volatility.toFixed(0)}% - this is high volatility`,
      `Budget conservatively at ₹${strategy.recommendedMonthlyBudget.toFixed(0)}/month`,
      `Build a buffer fund of ₹${strategy.bufferFundTarget.toFixed(0)}`,
      `In months when you earn above ₹${mean.toFixed(0)}, save the excess`
    ];
  }

  return strategy;
}

/**
 * Weekly budget for gig workers
 */
export async function calculateWeeklyBudget(monthlyBudget, weekNumber = 1) {
  if (!monthlyBudget || !monthlyBudget.categories) {
    return null;
  }

  const weeklyBudget = {
    week: weekNumber,
    categories: {},
    totalWeekly: 0
  };

  // Divide monthly budget into weekly chunks
  for (const [category, data] of Object.entries(monthlyBudget.categories)) {
    const weeklyAmount = data.amount / 4.33; // Average weeks per month

    weeklyBudget.categories[category] = {
      amount: Math.round(weeklyAmount),
      percentage: data.percentage,
      monthlyTotal: data.amount
    };

    weeklyBudget.totalWeekly += Math.round(weeklyAmount);
  }

  return weeklyBudget;
}

/**
 * Auto-adjust budget when income changes
 */
export async function autoAdjustBudget(userId) {
  const { db } = await connectToDatabase();

  // Get user's current budget
  const profile = await db.collection('userprofiles').findOne(
    { userId },
    { projection: { generatedBudget: 1, monthlyIncome: 1 } }
  );

  if (!profile || !profile.generatedBudget) {
    return null;
  }

  // Get actual income this month
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const actualIncomeData = await db.collection('income_predictions').findOne({
    userId,
    forMonth: { $gte: monthStart }
  });

  const actualIncome = actualIncomeData?.prediction?.expected || profile.monthlyIncome;

  // Check if adjustment needed (>10% difference)
  const difference = Math.abs(actualIncome - profile.monthlyIncome);
  const percentDiff = (difference / profile.monthlyIncome) * 100;

  if (percentDiff < 10) {
    return {
      adjusted: false,
      reason: 'Income change too small (<10%)',
      difference
    };
  }

  // Adjust budget
  const adjustedBudget = await adjustBudgetForIncome(
    userId,
    actualIncome,
    profile.generatedBudget
  );

  if (adjustedBudget) {
    // Save adjusted budget
    await db.collection('userprofiles').updateOne(
      { userId },
      {
        $set: {
          'generatedBudget.adjusted': adjustedBudget,
          'generatedBudget.adjustedAt': new Date(),
          'generatedBudget.adjustmentReason': `Income ${actualIncome > profile.monthlyIncome ? 'increased' : 'decreased'} by ${percentDiff.toFixed(1)}%`
        }
      }
    );

    return {
      adjusted: true,
      originalIncome: profile.monthlyIncome,
      actualIncome,
      percentChange: percentDiff,
      adjustedBudget
    };
  }

  return null;
}

const dynamicBudgetSystem = {
  adjustBudgetForIncome,
  getIncomeSmoothingStrategy,
  calculateWeeklyBudget,
  autoAdjustBudget
};

export default dynamicBudgetSystem;
