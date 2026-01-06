/**
 * Admin Analytics Overview API
 *
 * GET /api/admin/analytics/overview - Get platform analytics and statistics
 */

import { connectToDatabase } from '@/lib/database'
import { withAdminAuth, logAdminAction, adminSuccessResponse, adminErrorResponse } from '@/lib/admin/middleware'
import { PERMISSIONS } from '@/lib/admin/permissions'

/**
 * GET /api/admin/analytics/overview
 * Get comprehensive platform analytics
 */
async function getAnalyticsHandler(request, { admin }) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse date range (default to last 30 days)
    const daysParam = searchParams.get('days') || '30'
    const days = Math.min(Math.max(parseInt(daysParam, 10) || 30, 1), 365)

    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const db = await connectToDatabase()

    // Run all analytics queries in parallel
    const [
      userStats,
      recentUsers,
      usersByRole,
      usersByStatus,
      usersByPlan,
      usersByLanguage,
      signupTrend,
      activityStats,
      financialStats,
      debtStats
    ] = await Promise.all([
      // Total user statistics
      db.collection('users').aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
            suspended: { $sum: { $cond: [{ $eq: ['$status', 'suspended'] }, 1, 0] } },
            deleted: { $sum: { $cond: [{ $eq: ['$status', 'deleted'] }, 1, 0] } },
            verified: { $sum: { $cond: [{ $or: ['$emailVerified', '$isEmailVerified'] }, 1, 0] } },
            onboarded: { $sum: { $cond: ['$onboarding.completed', 1, 0] } }
          }
        }
      ]).toArray(),

      // New users in date range
      db.collection('users').countDocuments({
        createdAt: { $gte: startDate, $lte: endDate }
      }),

      // Users by role
      db.collection('users').aggregate([
        {
          $group: {
            _id: { $ifNull: ['$role', 'user'] },
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]).toArray(),

      // Users by status
      db.collection('users').aggregate([
        {
          $group: {
            _id: { $ifNull: ['$status', 'active'] },
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]).toArray(),

      // Users by subscription plan
      db.collection('users').aggregate([
        {
          $group: {
            _id: { $ifNull: ['$subscription.plan', 'free'] },
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]).toArray(),

      // Users by language preference
      db.collection('users').aggregate([
        {
          $group: {
            _id: { $ifNull: ['$preferences.language', 'en'] },
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]).toArray(),

      // Daily signup trend
      db.collection('users').aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]).toArray(),

      // Activity statistics
      db.collection('users').aggregate([
        {
          $match: {
            'activity.lastActiveAt': { $gte: startDate }
          }
        },
        {
          $group: {
            _id: null,
            activeInPeriod: { $sum: 1 },
            avgSessions: { $avg: '$activity.totalSessions' }
          }
        }
      ]).toArray(),

      // Financial data statistics (data is embedded in userprofiles collection)
      db.collection('userprofiles').aggregate([
        {
          $project: {
            expensesCount: { $cond: [{ $isArray: '$expenses' }, { $size: '$expenses' }, 0] },
            goalsCount: { $cond: [{ $isArray: '$goals' }, { $size: '$goals' }, 0] },
            hasBudget: { $cond: [{ $gt: ['$generatedBudget.totalBudget', 0] }, 1, 0] },
            hasIncome: { $cond: [{ $gt: ['$monthlyIncome', 0] }, 1, 0] },
            totalExpenseAmount: {
              $cond: [
                { $isArray: '$expenses' },
                { $sum: '$expenses.amount' },
                0
              ]
            }
          }
        },
        {
          $group: {
            _id: null,
            totalExpenses: { $sum: '$expensesCount' },
            totalGoals: { $sum: '$goalsCount' },
            totalBudgets: { $sum: '$hasBudget' },
            totalIncomes: { $sum: '$hasIncome' },
            totalExpenseAmount: { $sum: '$totalExpenseAmount' }
          }
        }
      ]).toArray(),

      // Debt statistics (stored in separate debts collection)
      db.collection('debts').aggregate([
        {
          $group: {
            _id: null,
            totalDebts: { $sum: 1 },
            activeDebts: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
            totalDebtAmount: { $sum: '$amount' },
            totalRemainingDebt: { $sum: '$remainingBalance' }
          }
        }
      ]).toArray()
    ])

    // Process results
    const stats = userStats[0] || {
      total: 0,
      active: 0,
      suspended: 0,
      deleted: 0,
      verified: 0,
      onboarded: 0
    }

    // Calculate growth rate
    const previousStartDate = new Date(startDate)
    previousStartDate.setDate(previousStartDate.getDate() - days)

    const previousPeriodUsers = await db.collection('users').countDocuments({
      createdAt: { $gte: previousStartDate, $lt: startDate }
    })

    const growthRate = previousPeriodUsers > 0
      ? ((recentUsers - previousPeriodUsers) / previousPeriodUsers * 100).toFixed(1)
      : recentUsers > 0 ? 100 : 0

    // Format response
    const analytics = {
      summary: {
        totalUsers: stats.total,
        activeUsers: stats.active,
        suspendedUsers: stats.suspended,
        deletedUsers: stats.deleted,
        verifiedUsers: stats.verified,
        onboardedUsers: stats.onboarded,
        newUsersInPeriod: recentUsers,
        growthRate: parseFloat(growthRate),
        period: { startDate, endDate, days }
      },
      distribution: {
        byRole: usersByRole.reduce((acc, item) => {
          acc[item._id] = item.count
          return acc
        }, {}),
        byStatus: usersByStatus.reduce((acc, item) => {
          acc[item._id] = item.count
          return acc
        }, {}),
        byPlan: usersByPlan.reduce((acc, item) => {
          acc[item._id] = item.count
          return acc
        }, {}),
        byLanguage: usersByLanguage.reduce((acc, item) => {
          acc[item._id] = item.count
          return acc
        }, {})
      },
      trends: {
        signups: signupTrend.map(item => ({
          date: item._id,
          count: item.count
        }))
      },
      activity: {
        activeUsersInPeriod: activityStats[0]?.activeInPeriod || 0,
        averageSessions: Math.round(activityStats[0]?.avgSessions || 0)
      },
      platform: {
        totalExpenses: financialStats[0]?.totalExpenses || 0,
        totalExpenseAmount: financialStats[0]?.totalExpenseAmount || 0,
        totalBudgets: financialStats[0]?.totalBudgets || 0,
        totalGoals: financialStats[0]?.totalGoals || 0,
        totalIncomes: financialStats[0]?.totalIncomes || 0,
        totalDebts: debtStats[0]?.totalDebts || 0,
        activeDebts: debtStats[0]?.activeDebts || 0,
        totalDebtAmount: debtStats[0]?.totalDebtAmount || 0,
        totalRemainingDebt: debtStats[0]?.totalRemainingDebt || 0
      }
    }

    // Log the action
    await logAdminAction({
      admin,
      action: 'analytics:view',
      targetType: 'analytics',
      description: `Viewed analytics overview (${days} days)`,
      status: 'success'
    })

    return adminSuccessResponse(analytics, 'Analytics retrieved successfully')

  } catch (error) {
    console.error('Error fetching analytics:', error)
    return adminErrorResponse('Failed to fetch analytics', 'FETCH_ERROR', 500)
  }
}

export const GET = withAdminAuth(getAnalyticsHandler, {
  requiredPermissions: [PERMISSIONS.ANALYTICS_READ]
})
