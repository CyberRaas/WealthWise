import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import dbConnect from '@/lib/dbConnect'
import UserProfile from '@/models/UserProfile'

/**
 * Guardian API - Phase 3: Proactive Intelligence
 * Provides predictive balance alerts, subscription audit, and smart nudges.
 * GET /api/guardian?type=predictive|subscriptions|nudges|all
 */
export async function GET(request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'

    await dbConnect()

    const profile = await UserProfile.findOne({ userId: session.user.id })
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const threeMonthsAgo = new Date(now)
    threeMonthsAgo.setMonth(now.getMonth() - 3)

    // Get expenses for analysis
    const expenses = profile.expenses || []
    const budget = profile.budget || {}
    const goals = profile.goals || []

    const result = {}

    // ---- PREDICTIVE BALANCE ----
    if (type === 'predictive' || type === 'all') {
      const currentDay = now.getDate()
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
      const daysRemaining = daysInMonth - currentDay

      const thisMonthExpenses = expenses.filter(e => new Date(e.date || e.createdAt) >= startOfMonth)
      const totalSpent = thisMonthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0)
      const totalBudget = budget.totalBudget || budget.monthlyBudget || 0
      const remaining = Math.max(0, totalBudget - totalSpent)
      const dailyBurnRate = totalSpent / Math.max(1, currentDay)
      const safeDailyBudget = daysRemaining > 0 ? Math.round(remaining / daysRemaining) : 0
      const projectedTotal = dailyBurnRate * daysInMonth
      const daysUntilBroke = dailyBurnRate > 0 ? Math.floor(remaining / dailyBurnRate) : daysRemaining + 1

      const burnRatio = (totalSpent / (totalBudget || 1)) / ((currentDay / daysInMonth) || 1)
      let severity = 'safe'
      if (burnRatio > 1.5) severity = 'critical'
      else if (burnRatio > 1.2) severity = 'warning'
      else if (burnRatio > 1.0) severity = 'caution'

      result.predictive = {
        severity,
        totalBudget,
        totalSpent,
        remaining,
        dailyBurnRate: Math.round(dailyBurnRate),
        safeDailyBudget,
        projectedTotal: Math.round(projectedTotal),
        daysUntilBroke,
        burnRatio: Math.round(burnRatio * 100) / 100,
        daysRemaining,
        currentDay,
        daysInMonth,
      }
    }

    // ---- SUBSCRIPTION AUDIT ----
    if (type === 'subscriptions' || type === 'all') {
      const subPatterns = [
        { pattern: /netflix/i, name: 'Netflix', icon: '🎬' },
        { pattern: /spotify/i, name: 'Spotify', icon: '🎵' },
        { pattern: /amazon\s*prime/i, name: 'Amazon Prime', icon: '📦' },
        { pattern: /hotstar|disney/i, name: 'Disney+ Hotstar', icon: '⭐' },
        { pattern: /youtube\s*(premium|music)/i, name: 'YouTube Premium', icon: '▶️' },
        { pattern: /swiggy/i, name: 'Swiggy One', icon: '🍔' },
        { pattern: /zomato/i, name: 'Zomato Pro', icon: '🍕' },
        { pattern: /gym|fitness|cult/i, name: 'Gym/Fitness', icon: '💪' },
        { pattern: /subscription|recurring|membership|renewal/i, name: null, icon: '🔄' },
      ]

      const recentExpenses = expenses.filter(e => new Date(e.date || e.createdAt) >= threeMonthsAgo)
      const subMap = new Map()

      recentExpenses.forEach(exp => {
        const desc = (exp.description || exp.note || '').toLowerCase()
        for (const sp of subPatterns) {
          if (sp.pattern.test(desc)) {
            const key = sp.name || exp.description || 'Unknown'
            if (!subMap.has(key)) {
              subMap.set(key, { name: key, icon: sp.icon, payments: [], lastPayment: null })
            }
            const entry = subMap.get(key)
            entry.payments.push({ amount: exp.amount, date: new Date(exp.date || exp.createdAt) })
            const pd = new Date(exp.date || exp.createdAt)
            if (!entry.lastPayment || pd > entry.lastPayment) entry.lastPayment = pd
            break
          }
        }
      })

      const subscriptions = Array.from(subMap.values()).map(sub => {
        const daysSinceLastUse = Math.floor((now - sub.lastPayment) / (1000 * 60 * 60 * 24))
        const avgMonthly = sub.payments.length > 0
          ? Math.round(sub.payments.reduce((s, p) => s + p.amount, 0) / sub.payments.length)
          : 0

        let status = 'active'
        if (daysSinceLastUse > 45) status = 'unused'
        else if (daysSinceLastUse > 25) status = 'underused'

        return {
          name: sub.name,
          icon: sub.icon,
          status,
          daysSinceLastUse,
          avgMonthly,
          annualCost: avgMonthly * 12,
          paymentCount: sub.payments.length,
        }
      }).filter(s => s.status !== 'active')

      result.subscriptions = {
        flagged: subscriptions,
        totalPotentialSavings: subscriptions.reduce((s, sub) => s + sub.annualCost, 0),
      }
    }

    // ---- SMART NUDGES ----
    if (type === 'nudges' || type === 'all') {
      const nudges = []
      const hour = now.getHours()
      const dayOfWeek = now.getDay()

      if (dayOfWeek === 0 || dayOfWeek === 6) {
        nudges.push({ type: 'WEEKEND_SPLURGE', message: 'Weekend spending tends to be higher. Stay mindful!' })
      }
      if (hour >= 22 || hour <= 4) {
        nudges.push({ type: 'LATE_NIGHT', message: 'Late-night purchases have higher regret rates. Sleep on it!' })
      }

      const twoHoursAgo = new Date(now - 2 * 60 * 60 * 1000)
      const rapid = expenses.filter(e => new Date(e.date || e.createdAt) >= twoHoursAgo)
      if (rapid.length >= 3) {
        nudges.push({ type: 'RAPID_SPEND', message: `${rapid.length} transactions in 2 hours. Consider a cooling break.` })
      }

      result.nudges = nudges
    }

    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    console.error('Guardian API error:', error)
    return NextResponse.json({ error: 'Failed to analyze spending patterns' }, { status: 500 })
  }
}
