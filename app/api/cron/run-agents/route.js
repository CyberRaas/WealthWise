/**
 * Vercel Cron Job - Run scheduled agents
 *
 * This endpoint is called by Vercel Cron to run agents periodically
 * Configure in vercel.json with schedule: "0 star-slash-6 * * *"
 * (Every 6 hours)
 */

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database';
import { runScheduledAgents } from '@/lib/agents';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max

/**
 * GET /api/cron/run-agents - Run agents for all active users
 */
export async function GET(request) {
  try {
    // Verify this is a Vercel Cron request
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🕒 [CRON] Starting scheduled agent execution...');

    const { db } = await connectToDatabase();

    // Get all active users who have completed onboarding
    const users = await db.collection('users').find({
      status: 'active',
      'onboarding.completed': true
    }).project({ _id: 1, email: 1 }).toArray();

    console.log(`Found ${users.length} active users`);

    const results = [];

    // Run agents for each user
    for (const user of users) {
      try {
        console.log(`Running agents for user: ${user.email}`);

        const userResults = await runScheduledAgents(user._id.toString());

        results.push({
          userId: user._id.toString(),
          email: user.email,
          success: true,
          results: userResults
        });

      } catch (error) {
        console.error(`Failed to run agents for ${user.email}:`, error);

        results.push({
          userId: user._id.toString(),
          email: user.email,
          success: false,
          error: error.message
        });
      }
    }

    // Log execution summary
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    console.log(`✅ [CRON] Completed: ${successCount} succeeded, ${failCount} failed`);

    return NextResponse.json({
      success: true,
      timestamp: new Date(),
      totalUsers: users.length,
      successCount,
      failCount,
      results
    });

  } catch (error) {
    console.error('[CRON] Agent execution failed:', error);

    return NextResponse.json(
      { error: error.message || 'Cron job failed' },
      { status: 500 }
    );
  }
}
