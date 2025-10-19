/**
 * API Route for Gig Worker Insights
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/database';
import GigEarning from '@/models/GigEarning';

/**
 * GET /api/gig/insights - Get AI-powered insights for gig workers
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

    await connectToDatabase();

    const userId = session.user.id;

    // Get best earning timings
    const bestTimings = await GigEarning.getBestTimings(userId);

    // Get weekly target vs actual
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const weekSummary = await GigEarning.getSummary(userId, weekStart, new Date());

    // Get monthly summary
    const monthStart = new Date();
    monthStart.setMonth(monthStart.getMonth() - 1);
    const monthSummary = await GigEarning.getSummary(userId, monthStart, new Date());

    // Calculate earnings per platform efficiency
    const platformEfficiency = Object.entries(monthSummary.byPlatform).map(([platform, data]) => ({
      platform,
      earnings: data.earnings,
      trips: data.trips,
      avgPerTrip: data.trips > 0 ? data.earnings / data.trips : 0,
      expenses: data.expenses,
      netPerTrip: data.trips > 0 ? (data.earnings - data.expenses) / data.trips : 0
    })).sort((a, b) => b.netPerTrip - a.netPerTrip);

    // Generate insights
    const insights = [];

    // Insight 1: Best earning days
    if (bestTimings.bestDays.length > 0) {
      insights.push({
        type: 'best_days',
        title: 'Best Days to Work',
        message: `You earn ${bestTimings.bestDays[0].avgEarning > bestTimings.bestDays[6].avgEarning * 1.3 ? 'significantly' : ''} more on ${bestTimings.bestDays[0].day}s (avg ₹${bestTimings.bestDays[0].avgEarning.toFixed(0)}/day)`,
        data: bestTimings.bestDays.slice(0, 3)
      });
    }

    // Insight 2: Best earning hours
    if (bestTimings.bestHours.length > 0) {
      insights.push({
        type: 'best_hours',
        title: 'Peak Earning Hours',
        message: `Your best hours are ${bestTimings.bestHours[0].hour}:00 - ${bestTimings.bestHours[0].hour + 1}:00 (avg ₹${bestTimings.bestHours[0].avgEarning.toFixed(0)}/hour)`,
        data: bestTimings.bestHours
      });
    }

    // Insight 3: Platform comparison
    if (platformEfficiency.length > 1) {
      const best = platformEfficiency[0];
      const worst = platformEfficiency[platformEfficiency.length - 1];

      insights.push({
        type: 'platform_comparison',
        title: 'Platform Performance',
        message: `${best.platform.toUpperCase()} gives you ₹${best.netPerTrip.toFixed(0)}/trip while ${worst.platform.toUpperCase()} gives ₹${worst.netPerTrip.toFixed(0)}/trip`,
        data: platformEfficiency
      });
    }

    // Insight 4: Weekly target
    const weeklyTarget = 8000; // Default, can be customized
    const weeklyProgress = (weekSummary.totalEarnings / weeklyTarget) * 100;

    if (weeklyProgress < 100) {
      const remaining = weeklyTarget - weekSummary.totalEarnings;
      const tripsNeeded = weekSummary.avgEarningsPerTrip > 0
        ? Math.ceil(remaining / weekSummary.avgEarningsPerTrip)
        : 0;

      insights.push({
        type: 'weekly_target',
        title: 'Weekly Target Status',
        message: `You're ₹${remaining.toFixed(0)} short of your weekly target. Complete ${tripsNeeded} more trips.`,
        progress: weeklyProgress,
        data: {
          target: weeklyTarget,
          actual: weekSummary.totalEarnings,
          remaining,
          tripsNeeded
        }
      });
    } else {
      insights.push({
        type: 'weekly_target',
        title: 'Weekly Target Achieved! 🎉',
        message: `You've exceeded your weekly target by ₹${(weekSummary.totalEarnings - weeklyTarget).toFixed(0)}!`,
        progress: weeklyProgress,
        data: {
          target: weeklyTarget,
          actual: weekSummary.totalEarnings,
          excess: weekSummary.totalEarnings - weeklyTarget
        }
      });
    }

    // Insight 5: Expense optimization
    if (monthSummary.totalExpenses > 0) {
      const expenseRatio = (monthSummary.totalExpenses / monthSummary.totalEarnings) * 100;
      const avgExpensePerTrip = monthSummary.totalTrips > 0
        ? monthSummary.totalExpenses / monthSummary.totalTrips
        : 0;

      if (expenseRatio > 25) {
        insights.push({
          type: 'expense_warning',
          title: 'High Expenses Detected',
          message: `Your expenses are ${expenseRatio.toFixed(1)}% of earnings (₹${avgExpensePerTrip.toFixed(0)}/trip). Try to reduce to <20% for better profitability.`,
          data: {
            expenseRatio,
            avgExpensePerTrip,
            totalExpenses: monthSummary.totalExpenses
          }
        });
      } else {
        insights.push({
          type: 'expense_good',
          title: 'Expenses Under Control',
          message: `Great! Your expenses are only ${expenseRatio.toFixed(1)}% of earnings.`,
          data: {
            expenseRatio,
            avgExpensePerTrip
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      insights,
      bestTimings,
      weekSummary,
      monthSummary,
      platformEfficiency
    });

  } catch (error) {
    console.error('Gig insights error:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}
