/**
 * Risk Profile API
 * Endpoints for risk assessment and profile management
 */

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import dbConnect from '@/lib/dbConnect'
import RiskProfile from '@/models/RiskProfile'

/**
 * GET /api/investment/risk-profile
 * Get user's risk profile
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

    await dbConnect()

    // Get most recent risk profile
    const profile = await RiskProfile.findOne({ user: session.user.id })
      .sort({ assessmentDate: -1 })
      .lean()

    if (!profile) {
      return NextResponse.json({
        success: true,
        profile: null,
        message: 'No risk profile found. Please complete the assessment.'
      })
    }

    // Check if profile is outdated (more than 6 months old)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    const isOutdated = new Date(profile.assessmentDate) < sixMonthsAgo

    return NextResponse.json({
      success: true,
      profile,
      isOutdated,
      message: isOutdated ? 'Your risk profile may be outdated. Consider retaking the assessment.' : null
    })
  } catch (error) {
    console.error('Error fetching risk profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch risk profile' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/investment/risk-profile
 * Submit risk assessment and calculate profile
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
    const { answers, financialDetails } = body

    // Validate answers
    if (!answers || typeof answers !== 'object') {
      return NextResponse.json(
        { error: 'Assessment answers are required' },
        { status: 400 }
      )
    }

    // Validate required questions
    const requiredQuestions = [
      'investmentHorizon',
      'riskTolerance',
      'incomeStability',
      'emergencyFund',
      'investmentExperience',
      'lossReaction',
      'primaryGoal'
    ]

    const missingQuestions = requiredQuestions.filter(q => !answers[q])
    if (missingQuestions.length > 0) {
      return NextResponse.json(
        { error: `Missing answers: ${missingQuestions.join(', ')}` },
        { status: 400 }
      )
    }

    await dbConnect()

    // Use static method to calculate profile
    const calculatedProfile = RiskProfile.calculateProfile(answers)

    // Create or update profile
    const profile = await RiskProfile.findOneAndUpdate(
      { user: session.user.id },
      {
        user: session.user.id,
        answers,
        ...calculatedProfile,
        financialDetails: financialDetails || {},
        assessmentDate: new Date()
      },
      { upsert: true, new: true }
    )

    return NextResponse.json({
      success: true,
      profile,
      message: `Your risk profile is: ${calculatedProfile.profileType.charAt(0).toUpperCase() + calculatedProfile.profileType.slice(1)}`
    }, { status: 201 })
  } catch (error) {
    console.error('Error saving risk profile:', error)
    return NextResponse.json(
      { error: 'Failed to save risk profile' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/investment/risk-profile
 * Delete user's risk profile
 */
export async function DELETE(request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await dbConnect()

    await RiskProfile.deleteMany({ user: session.user.id })

    return NextResponse.json({
      success: true,
      message: 'Risk profile deleted'
    })
  } catch (error) {
    console.error('Error deleting risk profile:', error)
    return NextResponse.json(
      { error: 'Failed to delete risk profile' },
      { status: 500 }
    )
  }
}
