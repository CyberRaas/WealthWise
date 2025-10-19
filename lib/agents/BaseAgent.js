/**
 * BaseAgent - Abstract base class for all autonomous agents
 *
 * All agents follow the observe-decide-act-learn cycle
 */

import { getRedisClient } from '../redis';
import { connectToDatabase } from '../database';

export class BaseAgent {
  constructor(name, config = {}) {
    this.name = name;
    this.config = {
      enabled: true,
      runInterval: 3600000, // 1 hour default
      priority: 5, // 1-10, higher = more important
      ...config
    };

    this.state = {
      lastRun: null,
      runCount: 0,
      successCount: 0,
      errorCount: 0,
      learningData: {}
    };
  }

  /**
   * Main execution cycle
   */
  async execute(userId, context = {}) {
    if (!this.config.enabled) {
      console.log(`[${this.name}] Agent is disabled`);
      return null;
    }

    console.log(`[${this.name}] Starting execution for user ${userId}`);

    try {
      // Load agent state from Redis
      await this.loadState(userId);

      // OBSERVE: Gather data about user's financial situation
      const observations = await this.observe(userId, context);

      if (!observations) {
        console.log(`[${this.name}] No observations to process`);
        return null;
      }

      // DECIDE: Make autonomous decisions based on observations
      const decisions = await this.decide(observations, userId);

      if (!decisions || decisions.length === 0) {
        console.log(`[${this.name}] No decisions to make`);
        return null;
      }

      // ACT: Execute the decisions
      const results = await this.act(decisions, userId);

      // LEARN: Update behavior based on outcomes
      await this.learn(results, userId);

      // Update state
      this.state.lastRun = new Date();
      this.state.runCount++;
      this.state.successCount++;
      await this.saveState(userId);

      console.log(`[${this.name}] Execution completed successfully`);
      return results;

    } catch (error) {
      console.error(`[${this.name}] Execution failed:`, error);
      this.state.errorCount++;
      await this.saveState(userId);
      throw error;
    }
  }

  /**
   * OBSERVE: Collect and analyze data
   * Must be implemented by child classes
   */
  async observe(userId, context) {
    throw new Error(`${this.name} must implement observe() method`);
  }

  /**
   * DECIDE: Make autonomous decisions based on observations
   * Must be implemented by child classes
   */
  async decide(observations, userId) {
    throw new Error(`${this.name} must implement decide() method`);
  }

  /**
   * ACT: Execute the decisions
   * Must be implemented by child classes
   */
  async act(decisions, userId) {
    throw new Error(`${this.name} must implement act() method`);
  }

  /**
   * LEARN: Update behavior based on outcomes
   * Can be overridden by child classes
   */
  async learn(results, userId) {
    // Default implementation: track success/failure patterns
    if (results && results.userResponse) {
      const feedback = results.userResponse;

      // Update learning data
      if (!this.state.learningData[userId]) {
        this.state.learningData[userId] = {
          preferences: {},
          responsePatterns: {},
          effectiveStrategies: []
        };
      }

      // Track what works
      if (feedback.positive) {
        this.state.learningData[userId].effectiveStrategies.push({
          decision: results.decision,
          timestamp: new Date(),
          context: results.context
        });
      }
    }
  }

  /**
   * Load agent state from Redis
   */
  async loadState(userId) {
    try {
      const redis = await getRedisClient();
      const key = `agent:${this.name}:${userId}:state`;
      const savedState = await redis.get(key);

      if (savedState) {
        this.state = { ...this.state, ...JSON.parse(savedState) };
      }
    } catch (error) {
      console.error(`[${this.name}] Failed to load state:`, error);
    }
  }

  /**
   * Save agent state to Redis
   */
  async saveState(userId) {
    try {
      const redis = await getRedisClient();
      const key = `agent:${this.name}:${userId}:state`;
      await redis.set(key, JSON.stringify(this.state), 'EX', 86400 * 30); // 30 days
    } catch (error) {
      console.error(`[${this.name}] Failed to save state:`, error);
    }
  }

  /**
   * Get user's financial data from database
   */
  async getUserFinancialData(userId) {
    const { db } = await connectToDatabase();

    const [user, profile, expenses, goals, debts] = await Promise.all([
      db.collection('users').findOne({ _id: userId }),
      db.collection('userprofiles').findOne({ userId }),
      db.collection('expenses').find({ userId }).sort({ date: -1 }).limit(100).toArray(),
      db.collection('goals').find({ userId }).toArray(),
      db.collection('debts').find({ userId }).toArray()
    ]);

    return { user, profile, expenses, goals, debts };
  }

  /**
   * Send notification to user
   */
  async sendNotification(userId, notification) {
    const { db } = await connectToDatabase();

    await db.collection('notifications').insertOne({
      userId,
      agentName: this.name,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      priority: notification.priority || 'medium',
      actionRequired: notification.actionRequired || false,
      data: notification.data || {},
      read: false,
      createdAt: new Date()
    });

    // Also send email if high priority
    if (notification.priority === 'high') {
      // TODO: Integrate with emailService
    }

    return true;
  }

  /**
   * Log agent interaction for analytics
   */
  async logInteraction(userId, interaction) {
    const { db } = await connectToDatabase();

    await db.collection('agent_interactions').insertOne({
      userId,
      agentName: this.name,
      ...interaction,
      timestamp: new Date()
    });
  }
}

export default BaseAgent;
