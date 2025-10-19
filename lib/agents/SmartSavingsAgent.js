/**
 * SmartSavingsAgent - Automatically detects and allocates savings opportunities
 *
 * Features:
 * - Micro-savings (round-ups, surplus detection)
 * - Goal-oriented allocation
 * - Intelligent savings recommendations
 * - Cashback/refund tracking
 */

import { BaseAgent } from './BaseAgent';
import { connectToDatabase } from '../database';
import { ObjectId } from 'mongodb';

export class SmartSavingsAgent extends BaseAgent {
  constructor() {
    super('SmartSavings', {
      enabled: true,
      runInterval: 86400000, // Run once per day
      priority: 8
    });
  }

  /**
   * OBSERVE: Detect savings opportunities
   */
  async observe(userId, context) {
    const { db } = await connectToDatabase();
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const [profile, expenses, goals, transactions] = await Promise.all([
      db.collection('userprofiles').findOne({ userId: new ObjectId(userId) }),
      db.collection('expenses').find({
        userId: new ObjectId(userId),
        date: { $gte: monthStart }
      }).toArray(),
      db.collection('goals').find({
        userId: new ObjectId(userId),
        status: { $ne: 'completed' }
      }).toArray(),
      db.collection('transactions').find({
        userId: new ObjectId(userId),
        date: { $gte: monthStart }
      }).toArray()
    ]);

    if (!profile || !profile.generatedBudget) {
      return null;
    }

    // Calculate budget surplus
    const budgetSurplus = this.calculateBudgetSurplus(expenses, profile.generatedBudget);

    // Detect round-up opportunities
    const roundUpSavings = this.calculateRoundUpSavings(expenses);

    // Find unallocated funds
    const unallocatedFunds = this.findUnallocatedFunds(transactions, expenses);

    // Calculate savings potential
    const savingsPotential = this.calculateSavingsPotential(profile, expenses);

    return {
      profile,
      expenses,
      goals,
      budgetSurplus,
      roundUpSavings,
      unallocatedFunds,
      savingsPotential
    };
  }

  /**
   * DECIDE: Make savings allocation decisions
   */
  async decide(observations, userId) {
    const { budgetSurplus, roundUpSavings, unallocatedFunds, goals, savingsPotential } = observations;
    const decisions = [];

    // Decision 1: Auto-save budget surplus
    if (budgetSurplus.total > 0) {
      const allocation = this.allocateSurplus(budgetSurplus.total, goals);

      decisions.push({
        type: 'auto_save_surplus',
        amount: budgetSurplus.total,
        categoryBreakdown: budgetSurplus.byCategory,
        allocation,
        priority: 'medium'
      });
    }

    // Decision 2: Round-up savings
    if (roundUpSavings.total > 50) { // Minimum ₹50 to suggest round-up
      decisions.push({
        type: 'round_up_savings',
        amount: roundUpSavings.total,
        transactionCount: roundUpSavings.count,
        suggestion: 'Enable automatic round-up savings',
        priority: 'low'
      });
    }

    // Decision 3: Unallocated funds
    if (unallocatedFunds > 0) {
      decisions.push({
        type: 'unallocated_funds',
        amount: unallocatedFunds,
        suggestion: 'Move unallocated funds to goals',
        priority: 'medium'
      });
    }

    // Decision 4: Goal progress boost
    const strugglingGoals = goals.filter(g => {
      const progress = (g.currentAmount / g.targetAmount) * 100;
      return progress < 50 && g.priority === 'high';
    });

    if (strugglingGoals.length > 0 && budgetSurplus.total > 0) {
      decisions.push({
        type: 'goal_boost_suggestion',
        goals: strugglingGoals.map(g => ({
          id: g._id,
          name: g.name,
          currentAmount: g.currentAmount,
          targetAmount: g.targetAmount,
          suggestedBoost: Math.min(budgetSurplus.total * 0.5, g.targetAmount - g.currentAmount)
        })),
        priority: 'medium'
      });
    }

    // Decision 5: Savings rate improvement
    if (savingsPotential.currentRate < savingsPotential.recommendedRate) {
      decisions.push({
        type: 'improve_savings_rate',
        currentRate: savingsPotential.currentRate,
        recommendedRate: savingsPotential.recommendedRate,
        potentialIncrease: savingsPotential.potentialIncrease,
        suggestions: savingsPotential.suggestions,
        priority: 'low'
      });
    }

    // Decision 6: Celebrate milestones
    const recentMilestones = this.detectGoalMilestones(goals);
    if (recentMilestones.length > 0) {
      decisions.push({
        type: 'celebrate_milestone',
        milestones: recentMilestones,
        priority: 'low'
      });
    }

    return decisions;
  }

  /**
   * ACT: Execute savings decisions
   */
  async act(decisions, userId) {
    const actions = [];

    for (const decision of decisions) {
      switch (decision.type) {
        case 'auto_save_surplus':
          // Option 1: Auto-allocate (if user has enabled auto-save)
          const autoSaveEnabled = await this.isAutoSaveEnabled(userId);

          if (autoSaveEnabled) {
            await this.allocateToGoals(userId, decision.allocation);
            await this.sendNotification(userId, {
              type: 'auto_save',
              title: '💰 Savings Allocated!',
              message: `Great job! I've automatically saved ₹${decision.amount.toLocaleString('en-IN')} from your budget surplus and allocated it to your goals.`,
              priority: 'medium',
              data: decision
            });
            actions.push({ action: 'surplus_allocated', decision });
          } else {
            // Option 2: Suggest allocation
            await this.sendNotification(userId, {
              type: 'savings_suggestion',
              title: '🎉 Savings Opportunity!',
              message: `You have ₹${decision.amount.toLocaleString('en-IN')} surplus this month! Should I allocate it to your goals?`,
              priority: 'medium',
              actionRequired: true,
              data: decision
            });
            actions.push({ action: 'surplus_suggestion_sent', decision });
          }
          break;

        case 'round_up_savings':
          await this.sendNotification(userId, {
            type: 'round_up',
            title: '💡 Round-Up Savings Tip',
            message: `You could have saved ₹${decision.amount.toLocaleString('en-IN')} this month with round-up savings! Enable it to automatically save small amounts from each transaction.`,
            priority: 'low',
            data: decision
          });
          actions.push({ action: 'round_up_suggestion_sent', decision });
          break;

        case 'unallocated_funds':
          await this.sendNotification(userId, {
            type: 'unallocated',
            title: '💵 Unallocated Funds',
            message: `You have ₹${decision.amount.toLocaleString('en-IN')} sitting idle. Move it to your goals to make your money work for you!`,
            priority: 'medium',
            actionRequired: true,
            data: decision
          });
          actions.push({ action: 'unallocated_alert_sent', decision });
          break;

        case 'goal_boost_suggestion':
          const goalNames = decision.goals.map(g => g.name).join(', ');
          await this.sendNotification(userId, {
            type: 'goal_boost',
            title: '🎯 Boost Your Goals',
            message: `You're behind on: ${goalNames}. Consider allocating some of your surplus to catch up!`,
            priority: 'medium',
            actionRequired: true,
            data: decision
          });
          actions.push({ action: 'goal_boost_sent', decision });
          break;

        case 'improve_savings_rate':
          await this.sendNotification(userId, {
            type: 'savings_rate',
            title: '📊 Improve Your Savings',
            message: `Your savings rate is ${decision.currentRate}%. Aim for ${decision.recommendedRate}% to build wealth faster. ${decision.suggestions.join(' ')}`,
            priority: 'low',
            data: decision
          });
          actions.push({ action: 'savings_rate_tip_sent', decision });
          break;

        case 'celebrate_milestone':
          for (const milestone of decision.milestones) {
            await this.sendNotification(userId, {
              type: 'milestone',
              title: '🎉 Milestone Achieved!',
              message: `Congratulations! You've reached ${milestone.percent}% of your "${milestone.goalName}" goal! Keep going! 💪`,
              priority: 'low',
              data: milestone
            });
          }
          actions.push({ action: 'milestone_celebration_sent', decision });
          break;
      }

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
   * Calculate budget surplus by category
   */
  calculateBudgetSurplus(expenses, budget) {
    if (!budget || !budget.categories) {
      return { total: 0, byCategory: {} };
    }

    const categorySpending = {};
    expenses.forEach(expense => {
      const cat = expense.category || 'Other';
      categorySpending[cat] = (categorySpending[cat] || 0) + expense.amount;
    });

    const byCategory = {};
    let total = 0;

    for (const [category, budgetData] of Object.entries(budget.categories)) {
      const spent = categorySpending[category] || 0;
      const budgetAmount = budgetData.amount || 0;
      const surplus = budgetAmount - spent;

      if (surplus > 0) {
        byCategory[category] = surplus;
        total += surplus;
      }
    }

    return { total, byCategory };
  }

  /**
   * Calculate potential round-up savings
   */
  calculateRoundUpSavings(expenses) {
    let total = 0;
    let count = 0;

    expenses.forEach(expense => {
      const amount = expense.amount;
      const roundedUp = Math.ceil(amount / 10) * 10; // Round to nearest ₹10
      const roundUpAmount = roundedUp - amount;

      if (roundUpAmount > 0) {
        total += roundUpAmount;
        count++;
      }
    });

    return { total, count };
  }

  /**
   * Find unallocated funds
   */
  findUnallocatedFunds(transactions, expenses) {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    const unallocated = totalIncome - totalExpenses;

    return unallocated > 0 ? unallocated : 0;
  }

  /**
   * Calculate savings potential
   */
  calculateSavingsPotential(profile, expenses) {
    const monthlyIncome = profile.monthlyIncome || 0;
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const currentSavings = monthlyIncome - totalExpenses;
    const currentRate = monthlyIncome > 0 ? (currentSavings / monthlyIncome) * 100 : 0;

    // Recommended savings rate: 20% for beginners, 30% for advanced
    const recommendedRate = profile.financialExperience === 'beginner' ? 20 : 30;
    const potentialIncrease = (monthlyIncome * (recommendedRate / 100)) - currentSavings;

    const suggestions = [];

    if (currentRate < 10) {
      suggestions.push('Start by saving at least 10% of your income.');
    }

    if (currentRate < recommendedRate) {
      suggestions.push(`Try to reduce discretionary spending by ₹${(potentialIncrease / 2).toLocaleString('en-IN')}.`);
    }

    return {
      currentRate: currentRate.toFixed(1),
      recommendedRate,
      potentialIncrease: Math.max(0, potentialIncrease),
      suggestions
    };
  }

  /**
   * Allocate surplus to goals based on priority
   */
  allocateSurplus(surplusAmount, goals) {
    if (!goals || goals.length === 0) {
      return { emergency_fund: surplusAmount };
    }

    const allocation = {};
    let remaining = surplusAmount;

    // Sort goals by priority and progress
    const sortedGoals = goals
      .filter(g => g.status !== 'completed')
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      });

    // Allocate proportionally to high-priority goals
    const highPriorityGoals = sortedGoals.filter(g => g.priority === 'high');

    if (highPriorityGoals.length > 0) {
      const perGoal = remaining / highPriorityGoals.length;

      highPriorityGoals.forEach(goal => {
        const needed = goal.targetAmount - (goal.currentAmount || 0);
        const allocatedAmount = Math.min(perGoal, needed);

        allocation[goal._id.toString()] = {
          goalName: goal.name,
          amount: allocatedAmount
        };

        remaining -= allocatedAmount;
      });
    } else {
      // Distribute equally among all active goals
      const perGoal = remaining / sortedGoals.length;

      sortedGoals.forEach(goal => {
        const needed = goal.targetAmount - (goal.currentAmount || 0);
        const allocatedAmount = Math.min(perGoal, needed);

        allocation[goal._id.toString()] = {
          goalName: goal.name,
          amount: allocatedAmount
        };
      });
    }

    return allocation;
  }

  /**
   * Actually allocate funds to goals
   */
  async allocateToGoals(userId, allocation) {
    const { db } = await connectToDatabase();

    for (const [goalId, data] of Object.entries(allocation)) {
      await db.collection('goals').updateOne(
        { _id: new ObjectId(goalId) },
        {
          $inc: { currentAmount: data.amount },
          $push: {
            transactions: {
              amount: data.amount,
              type: 'auto_save',
              date: new Date(),
              source: 'SmartSavingsAgent'
            }
          }
        }
      );
    }
  }

  /**
   * Check if user has auto-save enabled
   */
  async isAutoSaveEnabled(userId) {
    const { db } = await connectToDatabase();

    const user = await db.collection('users').findOne(
      { _id: new ObjectId(userId) },
      { projection: { 'preferences.autoSave': 1 } }
    );

    return user?.preferences?.autoSave || false;
  }

  /**
   * Detect goal milestones (25%, 50%, 75%, 100%)
   */
  detectGoalMilestones(goals) {
    const milestones = [];
    const milestoneThresholds = [25, 50, 75, 100];

    goals.forEach(goal => {
      const progress = (goal.currentAmount / goal.targetAmount) * 100;

      milestoneThresholds.forEach(threshold => {
        // Check if just crossed this milestone (within last update)
        const previousProgress = ((goal.currentAmount - (goal.lastUpdate || 0)) / goal.targetAmount) * 100;

        if (progress >= threshold && previousProgress < threshold) {
          milestones.push({
            goalName: goal.name,
            percent: threshold,
            currentAmount: goal.currentAmount,
            targetAmount: goal.targetAmount
          });
        }
      });
    });

    return milestones;
  }

  /**
   * Respond to triggers from other agents
   */
  async respondToTrigger(trigger, data, userId) {
    if (trigger === 'budget_surplus_detected' || trigger === 'goal_updated') {
      return {
        action: 'reanalyze_savings_opportunities',
        priority: 'medium'
      };
    }

    return null;
  }
}

export default SmartSavingsAgent;
