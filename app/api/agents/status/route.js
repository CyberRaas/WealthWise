/**
 * API Route to get agent status
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAgentStatus, getAgentManager } from '@/lib/agents';
import { initializeAgents } from '@/lib/agents';

/**
 * GET /api/agents/status - Get status of all agents
 */
export async function GET(request) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Initialize agents first
    const manager = initializeAgents();
    const status = await getAgentStatus();

    // Get user's agent history
    const history = await manager.getUserAgentHistory(session.user.id, 20);

    return NextResponse.json({
      success: true,
      agents: status,
      recentActivity: history
    });

  } catch (error) {
    console.error('Get agent status error:', error);
    return NextResponse.json(
      { error: 'Failed to get agent status' },
      { status: 500 }
    );
  }
}
