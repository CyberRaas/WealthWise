import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import dbConnect from '@/lib/dbConnect'
import LiteracyAssessment from '@/models/LiteracyAssessment'
import User from '@/models/User'

// POST - Save assessment result
export async function POST(request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    
    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const data = await request.json()
    const { type, score, totalQuestions, correctAnswers, themeScores, timeTaken, earnedXP, userTrack } = data

    // Validate required fields
    if (!type || !['pre', 'post'].includes(type)) {
      return NextResponse.json({ error: 'Invalid assessment type. Must be "pre" or "post".' }, { status: 400 })
    }
    if (score === undefined || totalQuestions === undefined || correctAnswers === undefined) {
      return NextResponse.json({ error: 'Missing required fields: score, totalQuestions, correctAnswers' }, { status: 400 })
    }

    const assessment = await LiteracyAssessment.create({
      userId: user._id,
      email: session.user.email,
      type,
      userTrack: userTrack || '',
      score: Math.round(score),
      totalQuestions,
      correctAnswers,
      themeScores: themeScores || [],
      timeTaken: timeTaken || 0,
      earnedXP: earnedXP || 0
    })

    // Get improvement metrics
    const metrics = await LiteracyAssessment.getImprovementMetrics(user._id)

    return NextResponse.json({
      success: true,
      assessment: {
        id: assessment._id,
        type: assessment.type,
        score: assessment.score,
        literacyLevel: assessment.literacyLevel,
        themeScores: assessment.themeScores
      },
      metrics
    })
  } catch (error) {
    console.error('Assessment save error:', error)
    return NextResponse.json(
      { error: 'Failed to save assessment', details: error.message },
      { status: 500 }
    )
  }
}

// GET - Retrieve assessment history and improvement metrics
export async function GET(request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const metrics = await LiteracyAssessment.getImprovementMetrics(user._id)

    return NextResponse.json({
      success: true,
      metrics
    })
  } catch (error) {
    console.error('Assessment fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assessments', details: error.message },
      { status: 500 }
    )
  }
}
