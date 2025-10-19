/**
 * AgentManager - Orchestrates all autonomous agents
 *
 * Responsibilities:
 * - Register and manage agents
 * - Schedule agent execution
 * - Handle multi-agent collaboration
 * - Coordinate agent priorities
 */

import { getRedisClient } from '../redis';
import { connectToDatabase } from '../database';

export class AgentManager {
  constructor() {
    this.agents = new Map();
    this.runningAgents = new Set();
  }

  /**
   * Register an agent
   */
  registerAgent(agent) {
    this.agents.set(agent.name, agent);
    console.log(`✓ Registered agent: ${agent.name}`);
  }

  /**
   * Unregister an agent
   */
  unregisterAgent(agentName) {
    this.agents.delete(agentName);
    console.log(`✗ Unregistered agent: ${agentName}`);
  }

  /**
   * Execute a specific agent for a user
   */
  async executeAgent(agentName, userId, context = {}) {
    const agent = this.agents.get(agentName);

    if (!agent) {
      throw new Error(`Agent ${agentName} not found`);
    }

    const executionId = `${agentName}:${userId}:${Date.now()}`;

    if (this.runningAgents.has(executionId)) {
      console.log(`Agent ${agentName} already running for user ${userId}`);
      return null;
    }

    this.runningAgents.add(executionId);

    try {
      const result = await agent.execute(userId, context);
      return result;
    } finally {
      this.runningAgents.delete(executionId);
    }
  }

  /**
   * Execute all agents for a user
   */
  async executeAllAgents(userId, context = {}) {
    console.log(`\n[AgentManager] Executing all agents for user ${userId}`);

    // Sort agents by priority
    const sortedAgents = Array.from(this.agents.values())
      .filter(agent => agent.config.enabled)
      .sort((a, b) => b.config.priority - a.config.priority);

    const results = [];

    for (const agent of sortedAgents) {
      try {
        const result = await this.executeAgent(agent.name, userId, context);
        if (result) {
          results.push({
            agent: agent.name,
            result
          });
        }
      } catch (error) {
        console.error(`Failed to execute ${agent.name}:`, error);
        results.push({
          agent: agent.name,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Execute agents that need to run based on their schedule
   */
  async executeScheduledAgents(userId) {
    const now = Date.now();
    const agentsToRun = [];

    for (const [name, agent] of this.agents.entries()) {
      if (!agent.config.enabled) continue;

      // Check if agent should run based on interval
      const lastRun = agent.state.lastRun ? new Date(agent.state.lastRun).getTime() : 0;
      const timeSinceLastRun = now - lastRun;

      if (timeSinceLastRun >= agent.config.runInterval) {
        agentsToRun.push(name);
      }
    }

    if (agentsToRun.length > 0) {
      console.log(`[AgentManager] Running scheduled agents: ${agentsToRun.join(', ')}`);

      for (const agentName of agentsToRun) {
        await this.executeAgent(agentName, userId);
      }
    }
  }

  /**
   * Multi-agent collaboration
   * Allows agents to communicate and coordinate actions
   */
  async coordinateAgents(userId, trigger, data) {
    console.log(`[AgentManager] Coordinating agents for trigger: ${trigger}`);

    const coordination = {
      trigger,
      data,
      timestamp: new Date(),
      agentResponses: []
    };

    // Notify all agents about the trigger
    for (const [name, agent] of this.agents.entries()) {
      if (!agent.config.enabled) continue;

      // Give each agent a chance to respond to the trigger
      if (agent.respondToTrigger) {
        try {
          const response = await agent.respondToTrigger(trigger, data, userId);
          if (response) {
            coordination.agentResponses.push({
              agent: name,
              response
            });
          }
        } catch (error) {
          console.error(`Agent ${name} failed to respond:`, error);
        }
      }
    }

    // Execute coordinated action if multiple agents agree
    if (coordination.agentResponses.length > 1) {
      await this.executeCoordinatedAction(coordination, userId);
    }

    return coordination;
  }

  /**
   * Execute a coordinated action from multiple agents
   */
  async executeCoordinatedAction(coordination, userId) {
    console.log(`[AgentManager] Executing coordinated action for ${coordination.trigger}`);

    // Example: If both IncomeAgent and BudgetAgent detect income drop,
    // send a consolidated notification instead of two separate ones

    const { db } = await connectToDatabase();

    await db.collection('agent_coordinations').insertOne({
      userId,
      ...coordination,
      executed: true,
      executedAt: new Date()
    });
  }

  /**
   * Get agent status and statistics
   */
  async getAgentStatus() {
    const status = [];

    for (const [name, agent] of this.agents.entries()) {
      status.push({
        name,
        enabled: agent.config.enabled,
        priority: agent.config.priority,
        runInterval: agent.config.runInterval,
        lastRun: agent.state.lastRun,
        runCount: agent.state.runCount,
        successCount: agent.state.successCount,
        errorCount: agent.state.errorCount,
        successRate: agent.state.runCount > 0
          ? ((agent.state.successCount / agent.state.runCount) * 100).toFixed(2) + '%'
          : 'N/A'
      });
    }

    return status;
  }

  /**
   * Get user's agent activity history
   */
  async getUserAgentHistory(userId, limit = 50) {
    const { db } = await connectToDatabase();

    const interactions = await db.collection('agent_interactions')
      .find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();

    return interactions;
  }

  /**
   * Enable/disable an agent
   */
  setAgentEnabled(agentName, enabled) {
    const agent = this.agents.get(agentName);
    if (agent) {
      agent.config.enabled = enabled;
      console.log(`${agentName} ${enabled ? 'enabled' : 'disabled'}`);
    }
  }

  /**
   * Get all registered agents
   */
  getAgents() {
    return Array.from(this.agents.values());
  }
}

// Singleton instance
let managerInstance = null;

export function getAgentManager() {
  if (!managerInstance) {
    managerInstance = new AgentManager();
  }
  return managerInstance;
}

export default AgentManager;
