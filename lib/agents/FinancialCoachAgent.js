/**
 * FinancialCoachAgent - Proactive financial coaching and monitoring
 *
 * Monitors spending in real-time, learns user behavior patterns,
 * and sends preventive interventions before problems occur
 */

import { BaseAgent } from './BaseAgent';
import { connectToDatabase } from '../database';
import { ObjectId } from 'mongodb';
import { GoogleGenerativeAI } from '@google/generative-ai';

export class FinancialCoachAgent extends BaseAgent {
  constructor() {
    super('FinancialCoach', {
      enabled: true,
      runInterval: 21600000, // Run every 6 hours
      priority: 9
    });

    // Initialize Gemini AI
    this.genAI = process.env.GEMINI_API_KEY
      ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
      : null;
  }

  /**
   * OBSERVE: Monitor user's financial behavior and patterns
   */
  async observe(userId, context) {
    const { db } = await connectToDatabase();
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    // Fetch user data
    const [profile, expenses, budget, goals, recentExpenses, spendingPatterns] = await Promise.all([
      db.collection('userprofiles').findOne({ userId: new ObjectId(userId) }),
      db.collection('expenses').find({
        userId: new ObjectId(userId),
        date: { $gte: monthStart }
      }).toArray(),
      db.collection('userprofiles').findOne(
        { userId: new ObjectId(userId) },
        { projection: { generatedBudget: 1 } }
      ),
      db.collection('goals').find({ userId: new ObjectId(userId) }).toArray(),
      db.collection('expenses').find({
        userId: new ObjectId(userId),
        date: { $gte: weekAgo }
      }).sort({ date: -1 }).toArray(),
      this.analyzeSpendingPatterns(userId)
    ]);

    if (!profile) {
      return null;
    }

    // Calculate budget health
    const budgetHealth = this.calculateBudgetHealth(expenses, profile.generatedBudget);

    // Calculate weekly spending
    const weeklySpending = this.calculateWeeklySpending(recentExpenses);

    return {
      profile,
      expenses,
      budget: profile.generatedBudget,
      goals,
      budgetHealth,
      weeklySpending,
      spendingPatterns,
      recentExpenses
    };
  }

  /**
   * DECIDE: Make coaching decisions based on observations
   */
  async decide(observations, userId) {
    const { budgetHealth, weeklySpending, spendingPatterns, profile, goals } = observations;
    const decisions = [];

    // Decision 1: Overspending alert
    const overspendingCategories = Object.entries(budgetHealth.categoryStatus)
      .filter(([_, status]) => status.percentUsed > 80);

    if (overspendingCategories.length > 0) {
      for (const [category, status] of overspendingCategories) {
        const severity = status.percentUsed > 100 ? 'critical' :
                        status.percentUsed > 90 ? 'high' : 'medium';

        decisions.push({
          type: 'overspending_alert',
          category,
          severity,
          percentUsed: status.percentUsed,
          amountSpent: status.spent,
          budgetAmount: status.budget,
          remaining: status.remaining,
          daysRemaining: this.getDaysRemainingInMonth()
        });
      }
    }

    // Decision 2: Behavioral pattern alert (predictive)
    if (spendingPatterns.riskyPatterns.length > 0) {
      for (const pattern of spendingPatterns.riskyPatterns) {
        decisions.push({
          type: 'behavioral_warning',
          pattern: pattern.type,
          description: pattern.description,
          suggestion: pattern.suggestion,
          severity: 'medium'
        });
      }
    }

    // Decision 3: Budget health check
    if (budgetHealth.overallScore < 50) {
      decisions.push({
        type: 'budget_health_warning',
        score: budgetHealth.overallScore,
        message: 'Your budget health is poor. Immediate action needed.',
        severity: 'high'
      });
    } else if (budgetHealth.overallScore < 70) {
      decisions.push({
        type: 'budget_health_warning',
        score: budgetHealth.overallScore,
        message: 'Your budget health needs improvement.',
        severity: 'medium'
      });
    }

    // Decision 4: Weekly spending trend
    if (weeklySpending.trend === 'increasing' && weeklySpending.changePercent > 20) {
      decisions.push({
        type: 'spending_spike',
        changePercent: weeklySpending.changePercent,
        thisWeek: weeklySpending.thisWeek,
        lastWeek: weeklySpending.lastWeek,
        severity: 'medium'
      });
    }

    // Decision 5: Goal progress check
    const strugglingGoals = goals.filter(g => {
      const progress = (g.currentAmount / g.targetAmount) * 100;
      const timeProgress = this.calculateTimeProgress(g.startDate, g.targetDate);
      return progress < timeProgress - 20; // More than 20% behind schedule
    });

    if (strugglingGoals.length > 0) {
      decisions.push({
        type: 'goal_behind_schedule',
        goals: strugglingGoals.map(g => g.name),
        count: strugglingGoals.length,
        severity: 'low'
      });
    }

    // Decision 6: Positive reinforcement
    const surplusCategories = Object.entries(budgetHealth.categoryStatus)
      .filter(([_, status]) => status.percentUsed < 70 && status.budget > 0);

    if (surplusCategories.length > 0 && budgetHealth.overallScore > 70) {
      decisions.push({
        type: 'positive_reinforcement',
        categories: surplusCategories.map(([cat, _]) => cat),
        score: budgetHealth.overallScore,
        message: 'Great job staying within budget!',
        severity: 'low'
      });
    }

    return decisions;
  }

  /**
   * ACT: Execute coaching decisions
   */
  async act(decisions, userId) {
    const actions = [];

    for (const decision of decisions) {
      let notification;

      switch (decision.type) {
        case 'overspending_alert':
          notification = await this.createOverspendingNotification(decision, userId);
          await this.sendNotification(userId, notification);
          actions.push({ action: 'overspending_alert_sent', decision });
          break;

        case 'behavioral_warning':
          notification = await this.createBehavioralWarning(decision, userId);
          await this.sendNotification(userId, notification);
          actions.push({ action: 'behavioral_warning_sent', decision });
          break;

        case 'budget_health_warning':
          notification = {
            type: 'budget_health',
            title: decision.severity === 'high' ? '🚨 Budget Health Critical' : '⚠️ Budget Health Alert',
            message: decision.message + ` Your budget health score is ${decision.score}/100.`,
            priority: decision.severity,
            actionRequired: true,
            data: decision
          };
          await this.sendNotification(userId, notification);
          actions.push({ action: 'health_warning_sent', decision });
          break;

        case 'spending_spike':
          notification = {
            type: 'spending_trend',
            title: '📈 Spending Increased',
            message: `Your spending this week is ${decision.changePercent.toFixed(1)}% higher than last week (₹${decision.thisWeek.toLocaleString('en-IN')} vs ₹${decision.lastWeek.toLocaleString('en-IN')}). Consider reviewing your expenses.`,
            priority: 'medium',
            data: decision
          };
          await this.sendNotification(userId, notification);
          actions.push({ action: 'spike_alert_sent', decision });
          break;

        case 'goal_behind_schedule':
          notification = {
            type: 'goal_progress',
            title: '🎯 Goal Progress Update',
            message: `You're behind schedule on ${decision.count} goal(s): ${decision.goals.join(', ')}. Consider increasing your savings rate.`,
            priority: 'low',
            data: decision
          };
          await this.sendNotification(userId, notification);
          actions.push({ action: 'goal_alert_sent', decision });
          break;

        case 'positive_reinforcement':
          notification = {
            type: 'encouragement',
            title: '🎉 Great Job!',
            message: decision.message + ` You're staying within budget in ${decision.categories.join(', ')}. Keep it up!`,
            priority: 'low',
            data: decision
          };
          await this.sendNotification(userId, notification);
          actions.push({ action: 'encouragement_sent', decision });
          break;
      }

      await this.logInteraction(userId, {
        type: decision.type,
        decision,
        notification,
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
   * LEARN: Update coaching strategy based on user responses
   */
  async learn(results, userId) {
    await super.learn(results, userId);

    // Track which types of interventions work best
    if (results.actions) {
      for (const action of results.actions) {
        // Store in learning data for future personalization
        if (!this.state.learningData[userId]) {
          this.state.learningData[userId] = {
            effectiveInterventions: [],
            ignoredInterventions: [],
            userPreferences: {}
          };
        }
      }
    }
  }

  /**
   * Calculate budget health score
   */
  calculateBudgetHealth(expenses, budget) {
    if (!budget || !budget.categories) {
      return {
        overallScore: 0,
        categoryStatus: {}
      };
    }

    const categoryStatus = {};
    let totalScore = 0;
    let categoryCount = 0;

    // Calculate spending per category
    const categorySpending = {};
    expenses.forEach(expense => {
      const cat = expense.category || 'Other';
      categorySpending[cat] = (categorySpending[cat] || 0) + expense.amount;
    });

    // Compare against budget
    for (const [category, budgetData] of Object.entries(budget.categories)) {
      const spent = categorySpending[category] || 0;
      const budgetAmount = budgetData.amount || 0;
      const percentUsed = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;

      categoryStatus[category] = {
        spent,
        budget: budgetAmount,
        percentUsed,
        remaining: budgetAmount - spent
      };

      // Score: 100 if under budget, decrease as overspending increases
      let categoryScore = 100;
      if (percentUsed > 100) {
        categoryScore = Math.max(0, 100 - (percentUsed - 100));
      } else if (percentUsed > 80) {
        categoryScore = 80;
      }

      totalScore += categoryScore;
      categoryCount++;
    }

    const overallScore = categoryCount > 0 ? Math.round(totalScore / categoryCount) : 0;

    return {
      overallScore,
      categoryStatus
    };
  }

  /**
   * Calculate weekly spending
   */
  calculateWeeklySpending(expenses) {
    const today = new Date();
    const thisWeekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastWeekStart = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);

    const thisWeek = expenses.filter(e => new Date(e.date) >= thisWeekStart)
      .reduce((sum, e) => sum + e.amount, 0);

    const lastWeek = expenses.filter(e => {
      const date = new Date(e.date);
      return date >= lastWeekStart && date < thisWeekStart;
    }).reduce((sum, e) => sum + e.amount, 0);

    const changePercent = lastWeek > 0 ? ((thisWeek - lastWeek) / lastWeek) * 100 : 0;
    const trend = changePercent > 10 ? 'increasing' : changePercent < -10 ? 'decreasing' : 'stable';

    return {
      thisWeek,
      lastWeek,
      changePercent,
      trend
    };
  }

  /**
   * Analyze spending patterns
   */
  async analyzeSpendingPatterns(userId) {
    const { db } = await connectToDatabase();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const expenses = await db.collection('expenses').find({
      userId: new ObjectId(userId),
      date: { $gte: threeMonthsAgo }
    }).toArray();

    const patterns = {
      weekendSpending: 0,
      weekdaySpending: 0,
      eveningSpending: 0,
      morningSpending: 0,
      frequentMerchants: {},
      riskyPatterns: []
    };

    expenses.forEach(expense => {
      const date = new Date(expense.date);
      const dayOfWeek = date.getDay();
      const hour = date.getHours();

      // Weekend vs weekday
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        patterns.weekendSpending += expense.amount;
      } else {
        patterns.weekdaySpending += expense.amount;
      }

      // Time of day
      if (hour >= 18 || hour <= 6) {
        patterns.eveningSpending += expense.amount;
      } else {
        patterns.morningSpending += expense.amount;
      }

      // Frequent merchants
      if (expense.merchant) {
        patterns.frequentMerchants[expense.merchant] =
          (patterns.frequentMerchants[expense.merchant] || 0) + 1;
      }
    });

    // Identify risky patterns
    if (patterns.weekendSpending > patterns.weekdaySpending * 0.4) {
      patterns.riskyPatterns.push({
        type: 'weekend_overspending',
        description: 'You tend to overspend on weekends',
        suggestion: 'Set a weekend spending limit to control impulse purchases'
      });
    }

    if (patterns.eveningSpending > patterns.morningSpending * 0.6) {
      patterns.riskyPatterns.push({
        type: 'evening_overspending',
        description: 'You spend more in the evenings',
        suggestion: 'Avoid shopping apps after 6 PM to reduce impulse buying'
      });
    }

    return patterns;
  }

  /**
   * Create overspending notification with AI-generated message
   */
  async createOverspendingNotification(decision, userId) {
    const daysLeft = decision.daysRemaining;
    const overBudget = decision.percentUsed > 100;

    let message = '';

    if (overBudget) {
      message = `🚨 You've exceeded your ${decision.category} budget by ₹${Math.abs(decision.remaining).toLocaleString('en-IN')}. ${daysLeft} days remaining in the month. Consider cutting back on non-essential spending.`;
    } else {
      message = `⚠️ You've used ${decision.percentUsed.toFixed(0)}% of your ${decision.category} budget (₹${decision.amountSpent.toLocaleString('en-IN')}/₹${decision.budgetAmount.toLocaleString('en-IN')}). Only ₹${decision.remaining.toLocaleString('en-IN')} left for ${daysLeft} days.`;
    }

    // Add AI-generated personalized tip
    if (this.genAI) {
      try {
        const tip = await this.generatePersonalizedTip(decision, userId);
        if (tip) {
          message += `\n\n💡 Tip: ${tip}`;
        }
      } catch (error) {
        console.error('Failed to generate AI tip:', error);
      }
    }

    return {
      type: 'overspending',
      title: overBudget ? '🚨 Budget Exceeded' : '⚠️ Budget Alert',
      message,
      priority: decision.severity,
      actionRequired: true,
      data: decision
    };
  }

  /**
   * Create behavioral warning notification
   */
  async createBehavioralWarning(decision, userId) {
    return {
      type: 'behavioral',
      title: '💡 Spending Pattern Detected',
      message: `${decision.description}. ${decision.suggestion}`,
      priority: 'medium',
      data: decision
    };
  }

  /**
   * Generate personalized tip using AI
   */
  async generatePersonalizedTip(decision, userId) {
    if (!this.genAI) return null;

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `You are a financial coach. A user is overspending in the "${decision.category}" category.
      They've spent ₹${decision.amountSpent} out of ₹${decision.budgetAmount} budget with ${decision.daysRemaining} days left in the month.

      Provide ONE short, actionable tip (max 50 words) to help them reduce spending in this category.
      Be empathetic, practical, and specific to Indian context.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('AI tip generation failed:', error);
      return null;
    }
  }

  /**
   * Calculate time progress for goals
   */
  calculateTimeProgress(startDate, targetDate) {
    const now = new Date();
    const start = new Date(startDate);
    const target = new Date(targetDate);

    const totalTime = target - start;
    const elapsed = now - start;

    return (elapsed / totalTime) * 100;
  }

  /**
   * Get days remaining in current month
   */
  getDaysRemainingInMonth() {
    const today = new Date();
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return lastDay.getDate() - today.getDate();
  }

  /**
   * Respond to triggers from other agents
   */
  async respondToTrigger(trigger, data, userId) {
    if (trigger === 'new_expense' || trigger === 'income_drop') {
      // Re-run coaching analysis when expense added or income drops
      return {
        action: 'reanalyze_budget_health',
        priority: 'high'
      };
    }

    return null;
  }
}

export default FinancialCoachAgent;
