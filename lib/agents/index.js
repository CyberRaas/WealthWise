/**
 * Agent System Initialization
 *
 * Registers and initializes all autonomous agents
 */

import { getAgentManager } from './AgentManager';
import { IncomeAnalyzerAgent } from './IncomeAnalyzerAgent';
import { FinancialCoachAgent } from './FinancialCoachAgent';
import { SmartSavingsAgent } from './SmartSavingsAgent';
import { FinancialHealthMonitorAgent } from './FinancialHealthMonitorAgent';

let initialized = false;

/**
 * Initialize all agents
 */
export function initializeAgents() {
  if (initialized) {
    console.log('Agents already initialized');
    return getAgentManager();
  }

  console.log('\n🤖 Initializing WealthWise Agent System...\n');

  const manager = getAgentManager();

  // Register all agents
  manager.registerAgent(new IncomeAnalyzerAgent());
  manager.registerAgent(new FinancialCoachAgent());
  manager.registerAgent(new SmartSavingsAgent());
  manager.registerAgent(new FinancialHealthMonitorAgent());

  initialized = true;

  console.log('✅ Agent system initialized successfully\n');

  // Log registered agents
  const status = manager.getAgents().map(agent => ({
    name: agent.name,
    enabled: agent.config.enabled,
    priority: agent.config.priority
  }));

  console.table(status);

  return manager;
}

/**
 * Execute all agents for a user
 */
export async function runAgentsForUser(userId, context = {}) {
  const manager = initializeAgents();
  return await manager.executeAllAgents(userId, context);
}

/**
 * Execute scheduled agents for a user
 */
export async function runScheduledAgents(userId) {
  const manager = initializeAgents();
  return await manager.executeScheduledAgents(userId);
}

/**
 * Execute a specific agent for a user
 */
export async function runSpecificAgent(agentName, userId, context = {}) {
  const manager = initializeAgents();
  return await manager.executeAgent(agentName, userId, context);
}

/**
 * Get agent status
 */
export async function getAgentStatus() {
  const manager = initializeAgents();
  return await manager.getAgentStatus();
}

/**
 * Enable/disable an agent
 */
export function setAgentEnabled(agentName, enabled) {
  const manager = initializeAgents();
  manager.setAgentEnabled(agentName, enabled);
}

/**
 * Trigger multi-agent collaboration
 */
export async function triggerAgentCollaboration(userId, trigger, data) {
  const manager = initializeAgents();
  return await manager.coordinateAgents(userId, trigger, data);
}

const agentSystem = {
  initializeAgents,
  runAgentsForUser,
  runScheduledAgents,
  runSpecificAgent,
  getAgentStatus,
  setAgentEnabled,
  triggerAgentCollaboration
};

export default agentSystem;
