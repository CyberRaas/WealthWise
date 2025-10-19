/**
 * API Routes for Gig Worker Earnings
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/database';
import GigEarning from '@/models/GigEarning';

/**
 * GET /api/gig/earnings - Fetch gig earnings
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

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month'; // day, week, month, all
    const platform = searchParams.get('platform');

    // Calculate date range
    let startDate = new Date();
    const endDate = new Date();

    switch (period) {
      case 'day':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'all':
        startDate = new Date(0); // Beginning of time
        break;
    }

    // Build query
    const query = {
      userId: session.user.id,
      date: { $gte: startDate, $lte: endDate }
    };

    if (platform && platform !== 'all') {
      query.platform = platform;
    }

    // Fetch earnings
    const earnings = await GigEarning.find(query).sort({ date: -1 });

    // Get summary
    const summary = await GigEarning.getSummary(
      session.user.id,
      startDate,
      endDate
    );

    return NextResponse.json({
      success: true,
      earnings,
      summary,
      period
    });

  } catch (error) {
    console.error('Fetch gig earnings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch earnings' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/gig/earnings - Add new gig earning
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

    await connectToDatabase();

    const data = await request.json();

    // Validate required fields
    if (!data.platform || !data.amount) {
      return NextResponse.json(
        { error: 'Platform and amount are required' },
        { status: 400 }
      );
    }

    // Create new earning
    const earning = new GigEarning({
      userId: session.user.id,
      platform: data.platform,
      amount: parseFloat(data.amount),
      date: data.date ? new Date(data.date) : new Date(),
      tripCount: parseInt(data.tripCount) || 1,
      distance: parseFloat(data.distance) || 0,
      duration: parseInt(data.duration) || 0,
      expenses: {
        fuel: parseFloat(data.expenses?.fuel) || 0,
        maintenance: parseFloat(data.expenses?.maintenance) || 0,
        toll: parseFloat(data.expenses?.toll) || 0,
        parking: parseFloat(data.expenses?.parking) || 0,
        other: parseFloat(data.expenses?.other) || 0
      },
      peakHours: data.peakHours || false,
      incentive: parseFloat(data.incentive) || 0,
      tips: parseFloat(data.tips) || 0,
      city: data.city,
      area: data.area,
      notes: data.notes,
      entryMethod: data.entryMethod || 'manual',
      status: data.status || 'completed'
    });

    await earning.save();

    // Trigger income analyzer agent
    try {
      const { db } = await connectToDatabase();
      await db.collection('agent_triggers').insertOne({
        trigger: 'new_income_entry',
        data: {
          type: 'gig_earning',
          amount: earning.amount,
          platform: earning.platform
        },
        userId: session.user.id,
        sourceAgent: 'GigEarningAPI',
        createdAt: new Date(),
        processed: false
      });
    } catch (triggerError) {
      console.error('Failed to trigger agent:', triggerError);
    }

    return NextResponse.json({
      success: true,
      earning
    });

  } catch (error) {
    console.error('Add gig earning error:', error);
    return NextResponse.json(
      { error: 'Failed to add earning' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/gig/earnings - Delete a gig earning
 */
export async function DELETE(request) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Earning ID is required' },
        { status: 400 }
      );
    }

    const result = await GigEarning.findOneAndDelete({
      _id: id,
      userId: session.user.id
    });

    if (!result) {
      return NextResponse.json(
        { error: 'Earning not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Earning deleted successfully'
    });

  } catch (error) {
    console.error('Delete gig earning error:', error);
    return NextResponse.json(
      { error: 'Failed to delete earning' },
      { status: 500 }
    );
  }
}
