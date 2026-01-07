/**
 * Investment Recommendations API
 * AI-powered investment suggestions
 */

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import dbConnect from '@/lib/dbConnect'
import RiskProfile from '@/models/RiskProfile'
import InvestmentRecommendation from '@/models/InvestmentRecommendation'
import UserProfile from '@/models/UserProfile'
import { generateRecommendations, getGoalBasedRecommendations } from '@/lib/investmentRecommendationEngine'
import { getDisclaimersForScheme, DISCLAIMERS } from '@/lib/investmentCompliance'

/**
 * GET /api/investment/recommendations
 * Get user's investment recommendations
 */
export async function GET(request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const forceRefresh = searchParams.get('refresh') === 'true'

    await dbConnect()

    // Get existing recommendations if not forcing refresh
    if (!forceRefresh) {
      const existingRecommendation = await InvestmentRecommendation.findOne({
        user: session.user.id,
        status: 'active'
      }).sort({ generatedAt: -1 }).lean()

      if (existingRecommendation) {
        // Check if recommendations are still valid (less than 30 days old)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        if (new Date(existingRecommendation.generatedAt) > thirtyDaysAgo) {
          return NextResponse.json({
            success: true,
            recommendation: existingRecommendation,
            cached: true,
            disclaimer: DISCLAIMERS.general.full
          })
        }
      }
    }

    // Check if user has a risk profile
    const riskProfile = await RiskProfile.findOne({ user: session.user.id })
      .sort({ assessmentDate: -1 })
      .lean()

    if (!riskProfile) {
      return NextResponse.json({
        success: false,
        error: 'Please complete the risk assessment first',
        requiresAssessment: true
      }, { status: 400 })
    }

    // Get user's financial data
    const userProfile = await UserProfile.findOne({ user: session.user.id }).lean()
    
    const financialData = {
      monthlyIncome: userProfile?.monthlyIncome || riskProfile.financialDetails?.monthlyIncome || 50000,
      monthlyExpenses: userProfile?.monthlyExpenses || riskProfile.financialDetails?.monthlyExpenses || 35000,
      existingSavings: userProfile?.savings || riskProfile.financialDetails?.existingSavings || 0,
      emergencyFund: riskProfile.financialDetails?.emergencyFund || 0,
      age: userProfile?.age || riskProfile.financialDetails?.age || 30,
      goals: userProfile?.goals || []
    }

    // Generate recommendations
    const result = await generateRecommendations(riskProfile, financialData, {
      useAI: true,
      includeProjections: true,
      timeHorizon: getTimeHorizon(riskProfile.answers?.investmentHorizon)
    })

    // Save recommendations
    const recommendation = await InvestmentRecommendation.findOneAndUpdate(
      { user: session.user.id, status: 'active' },
      {
        user: session.user.id,
        riskProfile: riskProfile._id,
        profileType: result.profileType,
        assetAllocation: result.allocation,
        recommendations: result.recommendations.map(r => ({
          schemeId: r.scheme.id,
          schemeName: r.scheme.name,
          allocation: r.allocation,
          monthlyAmount: r.monthlyAmount,
          reason: r.reason,
          type: r.type,
          riskLevel: r.scheme.riskLevel,
          expectedReturn: r.scheme.currentRate || 
            (r.scheme.returnRange ? (r.scheme.returnRange.min + r.scheme.returnRange.max) / 2 : 8),
          projection: result.projections?.scenarios?.expected ? {
            years: parseInt(result.projections.timeframe),
            estimatedValue: Math.round((r.allocation / 100) * result.projections.scenarios.expected.futureValue)
          } : null
        })),
        investmentCapacity: result.investmentCapacity,
        aiInsights: result.aiInsights,
        projections: result.projections,
        warnings: result.warnings,
        disclaimers: getDisclaimersForScheme('general'),
        generatedAt: new Date(),
        status: 'active'
      },
      { upsert: true, new: true }
    )

    return NextResponse.json({
      success: true,
      recommendation,
      cached: false,
      disclaimer: DISCLAIMERS.general.full
    })
  } catch (error) {
    console.error('Error getting recommendations:', error)
    return NextResponse.json(
      { error: 'Failed to get recommendations' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/investment/recommendations
 * Generate goal-based recommendations
 */
export async function POST(request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { goal, monthlyAmount, targetAmount, targetYears } = body

    if (!goal) {
      return NextResponse.json(
        { error: 'Goal is required' },
        { status: 400 }
      )
    }

    await dbConnect()

    // Get user's financial data
    const userProfile = await UserProfile.findOne({ user: session.user.id }).lean()
    
    const financialData = {
      monthlyIncome: userProfile?.monthlyIncome || 50000,
      monthlyExpenses: userProfile?.monthlyExpenses || 35000,
      age: userProfile?.age || 30
    }

    // Get goal-based recommendations
    const recommendations = getGoalBasedRecommendations(goal, financialData)

    // Calculate projections for the goal
    let projection = null
    if (monthlyAmount && targetYears) {
      projection = calculateGoalProjection(recommendations, monthlyAmount, targetYears)
    }

    return NextResponse.json({
      success: true,
      goal,
      recommendations: recommendations.map(r => ({
        schemeId: r.scheme.id,
        schemeName: r.scheme.name,
        allocation: r.allocation,
        monthlyAmount: monthlyAmount ? Math.round((r.allocation / 100) * monthlyAmount) : r.monthlyAmount,
        reason: r.reason,
        riskLevel: r.scheme.riskLevel
      })),
      projection,
      disclaimer: DISCLAIMERS.general.short
    })
  } catch (error) {
    console.error('Error generating goal recommendations:', error)
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    )
  }
}

/**
 * Helper: Get time horizon from assessment answer
 */
function getTimeHorizon(answer) {
  if (!answer) return 'medium'
  if (answer === 'short') return 'short'
  if (answer === 'long' || answer === 'veryLong') return 'long'
  return 'medium'
}

/**
 * Helper: Calculate goal projection
 */
function calculateGoalProjection(recommendations, monthlyAmount, years) {
  let totalFV = 0
  const months = years * 12

  recommendations.forEach(rec => {
    const monthlyInv = (rec.allocation / 100) * monthlyAmount
    const avgReturn = rec.scheme.currentRate || 
      (rec.scheme.returnRange ? (rec.scheme.returnRange.min + rec.scheme.returnRange.max) / 2 : 8)
    const monthlyRate = avgReturn / 100 / 12

    if (monthlyRate > 0) {
      const fv = monthlyInv * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate)
      totalFV += fv
    } else {
      totalFV += monthlyInv * months
    }
  })

  return {
    estimatedValue: Math.round(totalFV),
    totalInvested: monthlyAmount * months,
    estimatedGains: Math.round(totalFV - (monthlyAmount * months)),
    years,
    monthlyAmount
  }
}
