/**
 * Investment Schemes API
 * Endpoints for listing and exploring investment options
 */

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  INVESTMENT_SCHEMES,
  getSchemesForRiskProfile,
  getScheme,
  getSchemesByCategory,
  searchSchemes
} from '@/lib/investmentSchemes'
import { getRiskDescription, DISCLAIMERS } from '@/lib/investmentCompliance'

/**
 * GET /api/investment/schemes
 * Get all investment schemes or filter by criteria
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
    const category = searchParams.get('category')
    const riskProfile = searchParams.get('riskProfile')
    const schemeId = searchParams.get('id')
    const search = searchParams.get('search')

    // Get single scheme by ID
    if (schemeId) {
      const scheme = getScheme(schemeId)
      if (!scheme) {
        return NextResponse.json(
          { error: 'Scheme not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        scheme: {
          ...scheme,
          riskInfo: getRiskDescription(scheme.riskLevel)
        },
        disclaimer: DISCLAIMERS.general.short
      })
    }

    // Search schemes
    if (search) {
      const results = searchSchemes(search)
      return NextResponse.json({
        success: true,
        schemes: results,
        count: results.length,
        disclaimer: DISCLAIMERS.general.short
      })
    }

    // Filter by category
    if (category) {
      const schemes = getSchemesByCategory(category)
      return NextResponse.json({
        success: true,
        schemes,
        category,
        count: schemes.length,
        disclaimer: DISCLAIMERS.general.short
      })
    }

    // Filter by risk profile
    if (riskProfile) {
      const schemes = getSchemesForRiskProfile(riskProfile)
      return NextResponse.json({
        success: true,
        schemes,
        riskProfile,
        count: schemes.length,
        disclaimer: DISCLAIMERS.general.short
      })
    }

    // Return all schemes grouped by category
    const allSchemes = Object.values(INVESTMENT_SCHEMES)

    const groupedSchemes = {
      government: allSchemes.filter(s => s.category === 'government'),
      mutual_fund: allSchemes.filter(s => s.category === 'mutual_fund'),
      fixed_income: allSchemes.filter(s => s.category === 'fixed_income'),
      gold: allSchemes.filter(s => s.category === 'gold'),
      liquid: allSchemes.filter(s => s.category === 'liquid')
    }

    return NextResponse.json({
      success: true,
      schemes: groupedSchemes,
      allSchemes,
      count: allSchemes.length,
      disclaimer: DISCLAIMERS.general.short
    })
  } catch (error) {
    console.error('Error fetching schemes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch schemes' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/investment/schemes/compare
 * Compare multiple schemes
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
    const { schemeIds, monthlyInvestment, years } = body

    if (!schemeIds || !Array.isArray(schemeIds) || schemeIds.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 scheme IDs are required for comparison' },
        { status: 400 }
      )
    }

    if (schemeIds.length > 5) {
      return NextResponse.json(
        { error: 'Maximum 5 schemes can be compared at once' },
        { status: 400 }
      )
    }

    const schemes = schemeIds.map(id => getScheme(id)).filter(Boolean)

    if (schemes.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 valid schemes are required' },
        { status: 400 }
      )
    }

    // Build comparison data
    const comparison = schemes.map(scheme => {
      const avgReturn = scheme.currentRate ||
        (scheme.returnRange ? (scheme.returnRange.min + scheme.returnRange.max) / 2 : 8)

      let projection = null
      if (monthlyInvestment && years) {
        const months = years * 12
        const monthlyRate = avgReturn / 100 / 12

        let futureValue
        if (monthlyRate > 0) {
          futureValue = monthlyInvestment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate)
        } else {
          futureValue = monthlyInvestment * months
        }

        projection = {
          futureValue: Math.round(futureValue),
          totalInvested: monthlyInvestment * months,
          gains: Math.round(futureValue - (monthlyInvestment * months))
        }
      }

      return {
        id: scheme.id,
        name: scheme.name,
        category: scheme.category,
        riskLevel: scheme.riskLevel,
        riskInfo: getRiskDescription(scheme.riskLevel),
        expectedReturn: avgReturn,
        lockInPeriod: scheme.lockInPeriod,
        taxBenefit: scheme.taxBenefit,
        minInvestment: scheme.minInvestment,
        liquidity: scheme.liquidity,
        pros: scheme.pros,
        cons: scheme.cons,
        projection
      }
    })

    // Sort by expected return (highest first)
    comparison.sort((a, b) => b.expectedReturn - a.expectedReturn)

    return NextResponse.json({
      success: true,
      comparison,
      investmentParams: monthlyInvestment && years ? {
        monthlyInvestment,
        years
      } : null,
      disclaimer: DISCLAIMERS.projection.full
    })
  } catch (error) {
    console.error('Error comparing schemes:', error)
    return NextResponse.json(
      { error: 'Failed to compare schemes' },
      { status: 500 }
    )
  }
}
