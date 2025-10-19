/**
 * API Route to manually run agents
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { runAgentsForUser, runSpecificAgent } from '@/lib/agents';

/**
 * POST /api/agents/run - Run agents for current user
 */
export async function POST(request) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { agent, context } = await request.json();

    let results;

    if (agent) {
      // Run specific agent
      results = await runSpecificAgent(agent, session.user.id, context);
    } else {
      // Run all agents
      results = await runAgentsForUser(session.user.id, context);
    }

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Run agents error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to run agents' },
      { status: 500 }
    );
  }
}
