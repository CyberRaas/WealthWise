/**
 * IncomeAnalyzerAgent - Detects and adapts to income variability
 *
 * Critical for gig workers, freelancers, and informal sector employees
 * with irregular income patterns
 */

import { BaseAgent } from './BaseAgent';
import { connectToDatabase } from '../database';
import { ObjectId } from 'mongodb';

export class IncomeAnalyzerAgent extends BaseAgent {
  constructor() {
    super('IncomeAnalyzer', {
      enabled: true,
      runInterval: 86400000, // Run once per day
      priority: 10 // Highest priority
    });
  }

  /**
   * OBSERVE: Collect income data and patterns
   */
  async observe(userId, context) {
    const { db } = await connectToDatabase();

    // Get last 6 months of income data
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Fetch income transactions (positive amounts from various sources)
    const incomeTransactions = await db.collection('transactions').find({
      userId: new ObjectId(userId),
      type: 'income',
      date: { $gte: sixMonthsAgo }
    }).sort({ date: 1 }).toArray();

    // Also check expenses for income entries
    const incomeExpenses = await db.collection('expenses').find({
      userId: new ObjectId(userId),
      category: { $in: ['Salary', 'Income', 'Freelance', 'Business', 'Gig'] },
      date: { $gte: sixMonthsAgo }
    }).sort({ date: 1 }).toArray();

    // Get user profile for baseline income
    const profile = await db.collection('userprofiles').findOne({
      userId: new ObjectId(userId)
    });

    const allIncome = [...incomeTransactions, ...incomeExpenses.map(e => ({
      amount: e.amount,
      date: e.date,
      source: e.merchant || e.category,
      description: e.description
    }))];

    if (allIncome.length === 0) {
      return null;
    }

    return {
      incomeHistory: allIncome,
      baselineIncome: profile?.monthlyIncome || 0,
      currentMonth: this.getCurrentMonthIncome(allIncome),
      previousMonth: this.getPreviousMonthIncome(allIncome),
      profile
    };
  }

  /**
   * DECIDE: Analyze income patterns and make decisions
   */
  async decide(observations, userId) {
    const { incomeHistory, baselineIncome, currentMonth, previousMonth } = observations;

    // Calculate income variability metrics
    const analysis = this.analyzeIncomeVariability(incomeHistory, baselineIncome);

    const decisions = [];

    // Decision 1: Classify income type
    if (analysis.type !== 'unknown') {
      decisions.push({
        type: 'income_classification',
        classification: analysis.type,
        confidence: analysis.confidence,
        data: analysis
      });
    }

    // Decision 2: Income drop detected
    if (currentMonth.total < previousMonth.total * 0.75) {
      decisions.push({
        type: 'income_drop_alert',
        severity: 'high',
        dropPercentage: ((previousMonth.total - currentMonth.total) / previousMonth.total * 100).toFixed(1),
        previousAmount: previousMonth.total,
        currentAmount: currentMonth.total,
        message: `Income dropped by ${((previousMonth.total - currentMonth.total) / previousMonth.total * 100).toFixed(1)}% this month`
      });
    }

    // Decision 3: Income volatility warning
    if (analysis.volatilityScore > 0.3) {
      decisions.push({
        type: 'high_volatility_warning',
        volatilityScore: analysis.volatilityScore,
        recommendation: 'Build emergency fund to cover 3-6 months of expenses'
      });
    }

    // Decision 4: Predict next month income
    const prediction = this.predictNextMonthIncome(incomeHistory, analysis);
    decisions.push({
      type: 'income_prediction',
      predictedRange: prediction,
      confidence: analysis.confidence
    });

    // Decision 5: Budget adjustment needed
    if (analysis.type === 'variable' || analysis.type === 'hybrid') {
      decisions.push({
        type: 'budget_adjustment_required',
        strategy: 'conservative', // Spend based on minimum expected income
        recommendedBudget: prediction.minimum * 0.9 // 90% of minimum expected
      });
    }

    return decisions;
  }

  /**
   * ACT: Execute decisions and notify user
   */
  async act(decisions, userId) {
    const actions = [];

    for (const decision of decisions) {
      switch (decision.type) {
        case 'income_classification':
          await this.updateIncomeProfile(userId, decision);
          actions.push({ action: 'profile_updated', decision });
          break;

        case 'income_drop_alert':
          await this.sendNotification(userId, {
            type: 'income_alert',
            title: '⚠️ Income Drop Detected',
            message: `Your income this month is ${decision.dropPercentage}% lower than last month (₹${decision.currentAmount.toLocaleString('en-IN')} vs ₹${decision.previousAmount.toLocaleString('en-IN')}). Consider reducing discretionary spending.`,
            priority: 'high',
            actionRequired: true,
            data: decision
          });
          actions.push({ action: 'notification_sent', decision });

          // Trigger budget adjustment agent
          await this.triggerAgentCollaboration('income_drop', decision, userId);
          break;

        case 'high_volatility_warning':
          await this.sendNotification(userId, {
            type: 'volatility_warning',
            title: '📊 Income Variability Detected',
            message: `Your income varies significantly. We recommend building an emergency fund covering 3-6 months of expenses (approx ₹${(decision.volatilityScore * 100000).toLocaleString('en-IN')}).`,
            priority: 'medium',
            data: decision
          });
          actions.push({ action: 'notification_sent', decision });
          break;

        case 'income_prediction':
          await this.savePrediction(userId, decision);
          actions.push({ action: 'prediction_saved', decision });
          break;

        case 'budget_adjustment_required':
          await this.sendNotification(userId, {
            type: 'budget_recommendation',
            title: '💰 Budget Adjustment Recommended',
            message: `Based on your income pattern, we suggest a conservative budget of ₹${decision.recommendedBudget.toLocaleString('en-IN')} for next month.`,
            priority: 'medium',
            actionRequired: true,
            data: decision
          });
          actions.push({ action: 'notification_sent', decision });
          break;
      }

      // Log interaction
      await this.logInteraction(userId, {
        type: decision.type,
        decision,
        timestamp: new Date()
      });
    }

    return {
      success: true,
      actions,
      timestamp: new Date()
    };
  }

  /**
   * Analyze income variability and classify income type
   */
  analyzeIncomeVariability(incomeHistory, baselineIncome) {
    if (incomeHistory.length < 2) {
      return {
        type: 'unknown',
        confidence: 0,
        volatilityScore: 0
      };
    }

    // Group income by month
    const monthlyIncome = this.groupByMonth(incomeHistory);
    const monthlyAmounts = Object.values(monthlyIncome).map(m => m.total);

    // Calculate statistics
    const mean = monthlyAmounts.reduce((a, b) => a + b, 0) / monthlyAmounts.length;
    const variance = monthlyAmounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / monthlyAmounts.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = stdDev / mean;

    // Detect income frequency pattern
    const frequency = this.detectIncomeFrequency(incomeHistory);

    // Classify income type
    let type = 'unknown';
    let confidence = 0;

    if (coefficientOfVariation < 0.15) {
      type = 'fixed'; // Stable salaried income
      confidence = 0.9;
    } else if (coefficientOfVariation < 0.35) {
      type = 'hybrid'; // Mix of fixed and variable
      confidence = 0.7;
    } else {
      type = 'variable'; // Gig/freelance income
      confidence = 0.85;
    }

    return {
      type,
      confidence,
      volatilityScore: coefficientOfVariation,
      mean,
      stdDev,
      frequency,
      monthlyBreakdown: monthlyIncome,
      trend: this.detectTrend(monthlyAmounts)
    };
  }

  /**
   * Group income by month
   */
  groupByMonth(incomeHistory) {
    const grouped = {};

    incomeHistory.forEach(income => {
      const date = new Date(income.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!grouped[key]) {
        grouped[key] = {
          total: 0,
          count: 0,
          sources: new Set()
        };
      }

      grouped[key].total += income.amount;
      grouped[key].count++;
      if (income.source) {
        grouped[key].sources.add(income.source);
      }
    });

    return grouped;
  }

  /**
   * Detect income frequency (daily, weekly, bi-weekly, monthly)
   */
  detectIncomeFrequency(incomeHistory) {
    if (incomeHistory.length < 2) return 'unknown';

    const gaps = [];
    for (let i = 1; i < incomeHistory.length; i++) {
      const gap = (new Date(incomeHistory[i].date) - new Date(incomeHistory[i - 1].date)) / (1000 * 60 * 60 * 24);
      gaps.push(gap);
    }

    const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;

    if (avgGap <= 2) return 'daily';
    if (avgGap <= 8) return 'weekly';
    if (avgGap <= 16) return 'bi-weekly';
    if (avgGap <= 35) return 'monthly';
    return 'irregular';
  }

  /**
   * Detect income trend (increasing, decreasing, stable)
   */
  detectTrend(monthlyAmounts) {
    if (monthlyAmounts.length < 3) return 'unknown';

    const recent = monthlyAmounts.slice(-3);
    const older = monthlyAmounts.slice(-6, -3);

    if (older.length === 0) return 'unknown';

    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

    const change = (recentAvg - olderAvg) / olderAvg;

    if (change > 0.1) return 'increasing';
    if (change < -0.1) return 'decreasing';
    return 'stable';
  }

  /**
   * Predict next month's income range
   */
  predictNextMonthIncome(incomeHistory, analysis) {
    const monthlyIncome = Object.values(analysis.monthlyBreakdown).map(m => m.total);

    if (monthlyIncome.length === 0) {
      return { minimum: 0, maximum: 0, expected: 0 };
    }

    const mean = analysis.mean;
    const stdDev = analysis.stdDev;

    // Conservative prediction: use confidence intervals
    return {
      minimum: Math.max(0, mean - 1.5 * stdDev),
      expected: mean,
      maximum: mean + 1.5 * stdDev,
      confidence: analysis.confidence
    };
  }

  /**
   * Get current month income
   */
  getCurrentMonthIncome(incomeHistory) {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const current = incomeHistory.filter(income => {
      const date = new Date(income.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      return key === currentMonth;
    });

    return {
      total: current.reduce((sum, i) => sum + i.amount, 0),
      count: current.length
    };
  }

  /**
   * Get previous month income
   */
  getPreviousMonthIncome(incomeHistory) {
    const now = new Date();
    now.setMonth(now.getMonth() - 1);
    const previousMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const previous = incomeHistory.filter(income => {
      const date = new Date(income.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      return key === previousMonth;
    });

    return {
      total: previous.reduce((sum, i) => sum + i.amount, 0),
      count: previous.length
    };
  }

  /**
   * Update user's income profile
   */
  async updateIncomeProfile(userId, decision) {
    const { db } = await connectToDatabase();

    await db.collection('userprofiles').updateOne(
      { userId: new ObjectId(userId) },
      {
        $set: {
          incomeType: decision.classification,
          incomeAnalysis: decision.data,
          updatedAt: new Date()
        }
      }
    );
  }

  /**
   * Save income prediction
   */
  async savePrediction(userId, decision) {
    const { db } = await connectToDatabase();

    await db.collection('income_predictions').insertOne({
      userId: new ObjectId(userId),
      prediction: decision.predictedRange,
      confidence: decision.confidence,
      createdAt: new Date(),
      forMonth: new Date(new Date().setMonth(new Date().getMonth() + 1))
    });
  }

  /**
   * Trigger collaboration with other agents
   */
  async triggerAgentCollaboration(trigger, data, userId) {
    const { db } = await connectToDatabase();

    await db.collection('agent_triggers').insertOne({
      trigger,
      data,
      userId: new ObjectId(userId),
      sourceAgent: this.name,
      createdAt: new Date(),
      processed: false
    });
  }

  /**
   * Respond to triggers from other agents
   */
  async respondToTrigger(trigger, data, userId) {
    if (trigger === 'new_income_entry') {
      // Re-analyze income immediately when new income is recorded
      return {
        action: 'reanalyze_income',
        priority: 'high'
      };
    }

    return null;
  }
}

export default IncomeAnalyzerAgent;
