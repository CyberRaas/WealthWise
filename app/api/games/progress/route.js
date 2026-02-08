import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'

// GET - Fetch user's game progress
export async function GET(request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const user = await User.findById(session.user.id).select('gameProgress')

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Return default progress if none exists
    const defaultProgress = {
      totalXP: 0,
      level: 1,
      levelName: 'Financial Newbie',
      gamesPlayed: 0,
      gamesCompleted: [],
      achievements: [],
      streak: 0,
      lastPlayed: null,
      selectedTrack: null,
      gameStats: {
        scamBuster: { played: 0, bestScore: 0, totalCorrect: 0 },
        lifeDecisions: { played: 0, bestScore: 0, bestGrade: null },
        insuranceAcademy: { played: 0, quizBestScore: 0, calculatorUsed: false }
      }
    }

    return NextResponse.json({
      success: true,
      progress: user.gameProgress || defaultProgress
    })
  } catch (error) {
    console.error('Error fetching game progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Update user's game progress
export async function POST(request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      gameId,
      xpEarned,
      result,
      achievement,
      selectedTrack
    } = body

    await dbConnect()

    const user = await User.findById(session.user.id)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Initialize game progress if not exists
    if (!user.gameProgress) {
      user.gameProgress = {
        totalXP: 0,
        level: 1,
        levelName: 'Financial Newbie',
        gamesPlayed: 0,
        gamesCompleted: [],
        achievements: [],
        streak: 0,
        lastPlayed: null,
        selectedTrack: null,
        gameStats: {
          scamBuster: { played: 0, bestScore: 0, totalCorrect: 0 },
          lifeDecisions: { played: 0, bestScore: 0, bestGrade: null },
          insuranceAcademy: { played: 0, quizBestScore: 0, calculatorUsed: false }
        }
      }
    }

    // Update XP and calculate level
    if (xpEarned) {
      user.gameProgress.totalXP = (user.gameProgress.totalXP || 0) + xpEarned

      // Calculate new level
      const levels = [
        { level: 1, name: 'Financial Newbie', minXP: 0 },
        { level: 2, name: 'Budget Beginner', minXP: 100 },
        { level: 3, name: 'Savings Starter', minXP: 300 },
        { level: 4, name: 'Money Manager', minXP: 600 },
        { level: 5, name: 'Investment Initiate', minXP: 1000 },
        { level: 6, name: 'Finance Fighter', minXP: 1500 },
        { level: 7, name: 'Wealth Builder', minXP: 2200 },
        { level: 8, name: 'Portfolio Pro', minXP: 3000 },
        { level: 9, name: 'Financial Expert', minXP: 4000 },
        { level: 10, name: 'Money Master', minXP: 5500 },
        { level: 11, name: 'Wealth Wizard', minXP: 7500 },
        { level: 12, name: 'Financial Guru', minXP: 10000 }
      ]

      for (let i = levels.length - 1; i >= 0; i--) {
        if (user.gameProgress.totalXP >= levels[i].minXP) {
          user.gameProgress.level = levels[i].level
          user.gameProgress.levelName = levels[i].name
          break
        }
      }
    }

    // Update game stats
    if (gameId && result) {
      user.gameProgress.gamesPlayed = (user.gameProgress.gamesPlayed || 0) + 1

      // Mark game as completed
      if (!user.gameProgress.gamesCompleted) {
        user.gameProgress.gamesCompleted = []
      }
      if (!user.gameProgress.gamesCompleted.includes(gameId)) {
        user.gameProgress.gamesCompleted.push(gameId)
      }

      // Update specific game stats
      if (!user.gameProgress.gameStats) {
        user.gameProgress.gameStats = {}
      }

      switch (gameId) {
        case 'scam-buster':
          if (!user.gameProgress.gameStats.scamBuster) {
            user.gameProgress.gameStats.scamBuster = { played: 0, bestScore: 0, totalCorrect: 0 }
          }
          user.gameProgress.gameStats.scamBuster.played += 1
          user.gameProgress.gameStats.scamBuster.totalCorrect += result.correct || 0
          if (result.correct > user.gameProgress.gameStats.scamBuster.bestScore) {
            user.gameProgress.gameStats.scamBuster.bestScore = result.correct
          }
          break

        case 'life-decisions':
          if (!user.gameProgress.gameStats.lifeDecisions) {
            user.gameProgress.gameStats.lifeDecisions = { played: 0, bestScore: 0, bestGrade: null }
          }
          user.gameProgress.gameStats.lifeDecisions.played += 1
          if (result.score > user.gameProgress.gameStats.lifeDecisions.bestScore) {
            user.gameProgress.gameStats.lifeDecisions.bestScore = result.score
            user.gameProgress.gameStats.lifeDecisions.bestGrade = result.grade
          }
          break

        case 'insurance-academy':
          if (!user.gameProgress.gameStats.insuranceAcademy) {
            user.gameProgress.gameStats.insuranceAcademy = { played: 0, quizBestScore: 0, calculatorUsed: false }
          }
          user.gameProgress.gameStats.insuranceAcademy.played += 1
          if (result.correct && result.correct > user.gameProgress.gameStats.insuranceAcademy.quizBestScore) {
            user.gameProgress.gameStats.insuranceAcademy.quizBestScore = result.correct
          }
          break
      }
    }

    // Add achievement
    if (achievement) {
      if (!user.gameProgress.achievements) {
        user.gameProgress.achievements = []
      }
      if (!user.gameProgress.achievements.includes(achievement)) {
        user.gameProgress.achievements.push(achievement)
      }
    }

    // Update streak
    const now = new Date()
    const lastPlayed = user.gameProgress.lastPlayed ? new Date(user.gameProgress.lastPlayed) : null

    if (lastPlayed) {
      const daysSinceLastPlay = Math.floor((now - lastPlayed) / (1000 * 60 * 60 * 24))
      if (daysSinceLastPlay === 1) {
        user.gameProgress.streak = (user.gameProgress.streak || 0) + 1
      } else if (daysSinceLastPlay > 1) {
        user.gameProgress.streak = 1
      }
    } else {
      user.gameProgress.streak = 1
    }

    user.gameProgress.lastPlayed = now

    // Update selected track
    if (selectedTrack) {
      user.gameProgress.selectedTrack = selectedTrack
    }

    // Save to database
    user.markModified('gameProgress')
    await user.save()

    return NextResponse.json({
      success: true,
      progress: user.gameProgress
    })
  } catch (error) {
    console.error('Error updating game progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
