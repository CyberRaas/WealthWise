/**
 * FinancialHealthMonitorAgent - Continuous monitoring of overall financial health
 *
 * Monitors:
 * - Debt-to-Income ratio
 * - Savings rate
 * - Emergency fund coverage
 * - Budget adherence
 * - Financial stress indicators
 */

import { BaseAgent } from './BaseAgent';
import { connectToDatabase } from '../database';
import { ObjectId } from 'mongodb';

export class FinancialHealthMonitorAgent extends BaseAgent {
  constructor() {
    super('FinancialHealthMonitor', {
      enabled: true,
      runInterval: 21600000, // Run every 6 hours
      priority: 7
    });
  }

  /**
   * OBSERVE: Gather comprehensive financial data
   */
  async observe(userId, context) {
    const { db } = await connectToDatabase();
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const [profile, expenses, debts, goals, income] = await Promise.all([
      db.collection('userprofiles').findOne({ userId: new ObjectId(userId) }),
      db.collection('expenses').find({
        userId: new ObjectId(userId),
        date: { $gte: monthStart }
      }).toArray(),
      db.collection('debts').find({
        userId: new ObjectId(userId),
        status: 'active'
      }).toArray(),
      db.collection('goals').find({
        userId: new ObjectId(userId)
      }).toArray(),
      db.collection('income_predictions').findOne({
        userId: new ObjectId(userId),
        forMonth: { $gte: monthStart }
      })
    ]);

    if (!profile) {
      return null;
    }

    return {
      profile,
      expenses,
      debts,
      goals,
      income: income || { prediction: { expected: profile.monthlyIncome } }
    };
  }

  /**
   * DECIDE: Analyze financial health metrics
   */
  async decide(observations, userId) {
    const { profile, expenses, debts, goals, income } = observations;
    const decisions = [];

    // Calculate all health metrics
    const healthMetrics = {
      debtToIncome: this.calculateDebtToIncome(debts, profile.monthlyIncome),
      savingsRate: this.calculateSavingsRate(profile, expenses),
      emergencyFund: this.assessEmergencyFund(goals, profile, expenses),
      budgetAdherence: this.calculateBudgetAdherence(expenses, profile.generatedBudget),
      financialStress: this.calculateFinancialStress(debts, expenses, profile)
    };

    // Overall health score (0-100)
    const overallScore = this.calculateOverallHealthScore(healthMetrics);

    decisions.push({
      type: 'health_score',
      score: overallScore,
      metrics: healthMetrics,
      timestamp: new Date()
    });

    // Debt-to-Income warnings
    if (healthMetrics.debtToIncome.ratio > 0.4) {
      decisions.push({
        type: 'high_debt_warning',
        severity: healthMetrics.debtToIncome.ratio > 0.5 ? 'critical' : 'high',
        ratio: healthMetrics.debtToIncome.ratio,
        totalDebt: healthMetrics.debtToIncome.totalDebt,
        monthlyIncome: profile.monthlyIncome,
        recommendation: 'Focus on debt reduction before new expenses'
      });
    }

    // Savings rate warnings
    if (healthMetrics.savingsRate < 10) {
      decisions.push({
        type: 'low_savings_warning',
        severity: 'high',
        currentRate: healthMetrics.savingsRate,
        targetRate: 20,
        recommendation: 'Aim to save at least 20% of your income'
      });
    }

    // Emergency fund warnings
    if (healthMetrics.emergencyFund.monthsCovered < 3) {
      decisions.push({
        type: 'insufficient_emergency_fund',
        severity: healthMetrics.emergencyFund.monthsCovered < 1 ? 'critical' : 'high',
        monthsCovered: healthMetrics.emergencyFund.monthsCovered,
        targetMonths: 6,
        currentAmount: healthMetrics.emergencyFund.currentAmount,
        targetAmount: healthMetrics.emergencyFund.targetAmount,
        recommendation: 'Build an emergency fund covering 6 months of expenses'
      });
    }

    // Budget adherence warnings
    if (healthMetrics.budgetAdherence < 60) {
      decisions.push({
        type: 'poor_budget_adherence',
        severity: 'medium',
        score: healthMetrics.budgetAdherence,
        recommendation: 'Review and adjust your budget to match actual spending'
      });
    }

    // Financial stress alerts
    if (healthMetrics.financialStress > 70) {
      decisions.push({
        type: 'high_financial_stress',
        severity: 'high',
        stressLevel: healthMetrics.financialStress,
        factors: healthMetrics.stressFactors,
        recommendation: 'Consider consulting a financial advisor'
      });
    }

    // Positive reinforcement
    if (overallScore > 80) {
      decisions.push({
        type: 'excellent_health',
        severity: 'low',
        score: overallScore,
        message: 'Your financial health is excellent! Keep up the great work!'
      });
    }

    return decisions;
  }

  /**
   * ACT: Send health notifications and recommendations
   */
  async act(decisions, userId) {
    const actions = [];

    for (const decision of decisions) {
      switch (decision.type) {
        case 'health_score':
          await this.saveHealthScore(userId, decision);
          actions.push({ action: 'health_score_saved', decision });
          break;

        case 'high_debt_warning':
          await this.sendNotification(userId, {
            type: 'debt_warning',
            title: decision.severity === 'critical' ? '🚨 Critical Debt Level' : '⚠️ High Debt Alert',
            message: `Your debt-to-income ratio is ${(decision.ratio * 100).toFixed(0)}% (₹${decision.totalDebt.toLocaleString('en-IN')} debt on ₹${decision.monthlyIncome.toLocaleString('en-IN')} income). ${decision.recommendation}`,
            priority: decision.severity,
            actionRequired: true,
            data: decision
          });
          actions.push({ action: 'debt_warning_sent', decision });
          break;

        case 'low_savings_warning':
          await this.sendNotification(userId, {
            type: 'savings_warning',
            title: '💰 Low Savings Rate',
            message: `You're only saving ${decision.currentRate.toFixed(1)}% of your income. ${decision.recommendation}`,
            priority: 'high',
            data: decision
          });
          actions.push({ action: 'savings_warning_sent', decision });
          break;

        case 'insufficient_emergency_fund':
          await this.sendNotification(userId, {
            type: 'emergency_fund',
            title: decision.severity === 'critical' ? '🚨 No Emergency Fund' : '⚠️ Build Emergency Fund',
            message: `Your emergency fund covers only ${decision.monthsCovered.toFixed(1)} months of expenses. ${decision.recommendation}. You need ₹${decision.targetAmount.toLocaleString('en-IN')}.`,
            priority: decision.severity,
            actionRequired: true,
            data: decision
          });
          actions.push({ action: 'emergency_fund_alert_sent', decision });
          break;

        case 'poor_budget_adherence':
          await this.sendNotification(userId, {
            type: 'budget_adherence',
            title: '📊 Budget Review Needed',
            message: `Your budget adherence score is ${decision.score}/100. ${decision.recommendation}`,
            priority: 'medium',
            data: decision
          });
          actions.push({ action: 'budget_adherence_alert_sent', decision });
          break;

        case 'high_financial_stress':
          await this.sendNotification(userId, {
            type: 'financial_stress',
            title: '😰 High Financial Stress Detected',
            message: `Your financial stress level is high (${decision.stressLevel}/100). ${decision.recommendation}`,
            priority: 'high',
            actionRequired: true,
            data: decision
          });
          actions.push({ action: 'stress_alert_sent', decision });
          break;

        case 'excellent_health':
          await this.sendNotification(userId, {
            type: 'positive',
            title: '🎉 Excellent Financial Health!',
            message: decision.message + ` Your financial health score is ${decision.score}/100.`,
            priority: 'low',
            data: decision
          });
          actions.push({ action: 'positive_sent', decision });
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
   * Calculate debt-to-income ratio
   */
  calculateDebtToIncome(debts, monthlyIncome) {
    const totalDebt = debts
      .filter(d => d.type === 'taken')
      .reduce((sum, d) => sum + (d.remainingBalance || d.amount), 0);

    const monthlyDebtPayments = debts
      .filter(d => d.type === 'taken' && d.monthlyPayment)
      .reduce((sum, d) => sum + d.monthlyPayment, 0);

    const ratio = monthlyIncome > 0 ? monthlyDebtPayments / monthlyIncome : 0;

    return {
      totalDebt,
      monthlyDebtPayments,
      ratio,
      status: ratio > 0.4 ? 'high' : ratio > 0.2 ? 'moderate' : 'healthy'
    };
  }

  /**
   * Calculate savings rate
   */
  calculateSavingsRate(profile, expenses) {
    const monthlyIncome = profile.monthlyIncome || 0;
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const savings = monthlyIncome - totalExpenses;
    const savingsRate = monthlyIncome > 0 ? (savings / monthlyIncome) * 100 : 0;

    return Math.max(0, savingsRate);
  }

  /**
   * Assess emergency fund status
   */
  assessEmergencyFund(goals, profile, expenses) {
    // Find emergency fund goal
    const emergencyGoal = goals.find(g =>
      g.name.toLowerCase().includes('emergency') ||
      g.category === 'emergency_fund'
    );

    const monthlyExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const currentAmount = emergencyGoal?.currentAmount || 0;
    const targetAmount = monthlyExpenses * 6; // 6 months of expenses

    const monthsCovered = monthlyExpenses > 0 ? currentAmount / monthlyExpenses : 0;

    return {
      currentAmount,
      targetAmount,
      monthsCovered,
      status: monthsCovered >= 6 ? 'excellent' :
              monthsCovered >= 3 ? 'good' :
              monthsCovered >= 1 ? 'fair' : 'poor'
    };
  }

  /**
   * Calculate budget adherence score
   */
  calculateBudgetAdherence(expenses, budget) {
    if (!budget || !budget.categories) {
      return 0;
    }

    const categorySpending = {};
    expenses.forEach(expense => {
      const cat = expense.category || 'Other';
      categorySpending[cat] = (categorySpending[cat] || 0) + expense.amount;
    });

    let totalScore = 0;
    let categoryCount = 0;

    for (const [category, budgetData] of Object.entries(budget.categories)) {
      const spent = categorySpending[category] || 0;
      const budgetAmount = budgetData.amount || 0;

      if (budgetAmount === 0) continue;

      const percentUsed = (spent / budgetAmount) * 100;

      let score = 100;
      if (percentUsed > 100) {
        score = Math.max(0, 100 - (percentUsed - 100));
      } else if (percentUsed > 90) {
        score = 90;
      }

      totalScore += score;
      categoryCount++;
    }

    return categoryCount > 0 ? Math.round(totalScore / categoryCount) : 0;
  }

  /**
   * Calculate financial stress level
   */
  calculateFinancialStress(debts, expenses, profile) {
    let stressScore = 0;
    const stressFactors = [];

    // High debt
    const debtRatio = this.calculateDebtToIncome(debts, profile.monthlyIncome).ratio;
    if (debtRatio > 0.4) {
      stressScore += 30;
      stressFactors.push('High debt burden');
    } else if (debtRatio > 0.2) {
      stressScore += 15;
      stressFactors.push('Moderate debt');
    }

    // Low savings
    const savingsRate = this.calculateSavingsRate(profile, expenses);
    if (savingsRate < 10) {
      stressScore += 25;
      stressFactors.push('Low savings rate');
    }

    // No emergency fund
    const emergencyFund = this.assessEmergencyFund([], profile, expenses);
    if (emergencyFund.monthsCovered < 1) {
      stressScore += 25;
      stressFactors.push('No emergency fund');
    }

    // Overspending
    const adherence = this.calculateBudgetAdherence(expenses, profile.generatedBudget);
    if (adherence < 50) {
      stressScore += 20;
      stressFactors.push('Consistent overspending');
    }

    return stressScore;
  }

  /**
   * Calculate overall health score
   */
  calculateOverallHealthScore(metrics) {
    let score = 100;

    // Debt impact (max -30)
    if (metrics.debtToIncome.ratio > 0.5) score -= 30;
    else if (metrics.debtToIncome.ratio > 0.4) score -= 20;
    else if (metrics.debtToIncome.ratio > 0.2) score -= 10;

    // Savings rate impact (max -25)
    if (metrics.savingsRate < 10) score -= 25;
    else if (metrics.savingsRate < 15) score -= 15;
    else if (metrics.savingsRate < 20) score -= 5;

    // Emergency fund impact (max -25)
    if (metrics.emergencyFund.monthsCovered < 1) score -= 25;
    else if (metrics.emergencyFund.monthsCovered < 3) score -= 15;
    else if (metrics.emergencyFund.monthsCovered < 6) score -= 5;

    // Budget adherence impact (max -20)
    score -= (100 - metrics.budgetAdherence) * 0.2;

    return Math.max(0, Math.round(score));
  }

  /**
   * Save health score to database
   */
  async saveHealthScore(userId, decision) {
    const { db } = await connectToDatabase();

    await db.collection('financial_health_history').insertOne({
      userId: new ObjectId(userId),
      score: decision.score,
      metrics: decision.metrics,
      timestamp: decision.timestamp
    });

    // Update user profile with latest score
    await db.collection('userprofiles').updateOne(
      { userId: new ObjectId(userId) },
      {
        $set: {
          financialHealthScore: decision.score,
          lastHealthCheck: decision.timestamp
        }
      }
    );
  }

  /**
   * Respond to triggers
   */
  async respondToTrigger(trigger, data, userId) {
    if (trigger === 'debt_added' || trigger === 'income_drop' || trigger === 'major_expense') {
      return {
        action: 'recheck_financial_health',
        priority: 'high'
      };
    }

    return null;
  }
}

export default FinancialHealthMonitorAgent;
