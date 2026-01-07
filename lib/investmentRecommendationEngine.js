/**
 * Investment Recommendation Engine
 * AI-powered investment suggestions using Gemini and rule-based algorithms
 * 
 * @module lib/investmentRecommendationEngine
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import { INVESTMENT_SCHEMES, RISK_PROFILE_ALLOCATIONS, getSchemesForRiskProfile, getScheme } from './investmentSchemes'
import { DISCLAIMERS, getDisclaimersForScheme, getAdditionalWarnings } from './investmentCompliance'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

/**
 * Generate investment recommendations based on user profile
 * @param {Object} riskProfile - User's risk profile from assessment
 * @param {Object} financialData - User's financial data (income, expenses, savings)
 * @param {Object} options - Additional options
 * @returns {Object} Investment recommendations
 */
export async function generateRecommendations(riskProfile, financialData, options = {}) {
  try {
    const {
      useAI = true,
      includeProjections = true,
      timeHorizon = 'medium', // short (1-3 years), medium (3-7 years), long (7+ years)
    } = options

    // Calculate available investment amount
    const monthlyIncome = financialData.monthlyIncome || 0
    const monthlyExpenses = financialData.monthlyExpenses || 0
    const existingSavings = financialData.existingSavings || 0
    const monthlySavings = monthlyIncome - monthlyExpenses
    
    // Calculate investable surplus (after keeping emergency fund)
    const emergencyFundRequired = monthlyExpenses * 6
    const emergencyFundAvailable = financialData.emergencyFund || 0
    const hasAdequateEmergencyFund = emergencyFundAvailable >= emergencyFundRequired * 0.8
    
    // Get appropriate allocation based on risk profile
    const profileType = riskProfile.profileType || 'moderate'
    const allocation = RISK_PROFILE_ALLOCATIONS[profileType]
    
    // Get suitable schemes for the profile
    const suitableSchemes = getSchemesForRiskProfile(profileType)
    
    // Rule-based recommendations
    const ruleBasedRecommendations = generateRuleBasedRecommendations({
      monthlySavings,
      existingSavings,
      allocation,
      suitableSchemes,
      hasAdequateEmergencyFund,
      financialData,
      timeHorizon
    })
    
    // Get AI-enhanced insights if enabled
    let aiInsights = null
    if (useAI) {
      aiInsights = await generateAIInsights(riskProfile, financialData, ruleBasedRecommendations)
    }
    
    // Calculate projections if enabled
    let projections = null
    if (includeProjections) {
      projections = calculateProjections(ruleBasedRecommendations, timeHorizon)
    }
    
    return {
      success: true,
      profileType,
      allocation,
      recommendations: ruleBasedRecommendations,
      aiInsights,
      projections,
      investmentCapacity: {
        monthlySurplus: monthlySavings,
        lumpSumAvailable: Math.max(0, existingSavings - emergencyFundRequired),
        hasAdequateEmergencyFund,
        emergencyFundGap: Math.max(0, emergencyFundRequired - emergencyFundAvailable)
      },
      disclaimers: getDisclaimersForScheme('general'),
      warnings: getAdditionalWarnings(
        { assetAllocation: allocation, basedOnSavings: existingSavings },
        { age: financialData.age, hasEmergencyFund: hasAdequateEmergencyFund }
      ),
      generatedAt: new Date().toISOString()
    }
  } catch (error) {
    console.error('Error generating recommendations:', error)
    throw error
  }
}

/**
 * Generate rule-based recommendations
 */
function generateRuleBasedRecommendations({
  monthlySavings,
  existingSavings,
  allocation,
  suitableSchemes,
  hasAdequateEmergencyFund,
  financialData,
  timeHorizon
}) {
  const recommendations = []
  
  // Priority 1: Emergency Fund (if not adequate)
  if (!hasAdequateEmergencyFund) {
    const liquidFund = getScheme('liquid_fund')
    if (liquidFund) {
      recommendations.push({
        priority: 1,
        scheme: liquidFund,
        allocation: 30, // 30% of savings
        monthlyAmount: Math.round(monthlySavings * 0.3),
        reason: 'Build your emergency fund first. Liquid funds offer easy withdrawal with better returns than savings accounts.',
        type: 'emergency_fund'
      })
    }
  }
  
  // Priority 2: Tax-saving investments (if within financial year)
  const currentMonth = new Date().getMonth()
  if (currentMonth >= 9 || currentMonth <= 2) { // Oct to Mar - tax saving season
    const elss = getScheme('elss')
    if (elss && suitableSchemes.some(s => s.id === 'elss')) {
      recommendations.push({
        priority: 2,
        scheme: elss,
        allocation: allocation.equity >= 20 ? 15 : 10,
        monthlyAmount: Math.round(monthlySavings * 0.15),
        reason: 'Tax-saving season! ELSS offers tax benefits under 80C with potential for higher returns.',
        type: 'tax_saving'
      })
    }
  }
  
  // Government schemes based on allocation
  if (allocation.government >= 30) {
    const ppf = getScheme('ppf')
    if (ppf) {
      recommendations.push({
        priority: 3,
        scheme: ppf,
        allocation: 20,
        monthlyAmount: Math.min(Math.round(monthlySavings * 0.2), 12500), // Max ₹1.5L/year
        reason: 'PPF offers guaranteed tax-free returns with complete capital protection. Ideal for long-term goals.',
        type: 'core_investment'
      })
    }
  }
  
  // NPS for retirement
  if (financialData.age && financialData.age < 50) {
    const nps = getScheme('nps')
    if (nps) {
      recommendations.push({
        priority: 3,
        scheme: nps,
        allocation: 15,
        monthlyAmount: Math.round(monthlySavings * 0.15),
        reason: 'NPS provides additional tax benefit of ₹50,000 under 80CCD(1B). Great for retirement planning.',
        type: 'retirement'
      })
    }
  }
  
  // Equity/Index funds based on allocation
  if (allocation.equity >= 20) {
    const indexFund = getScheme('index_fund')
    if (indexFund) {
      recommendations.push({
        priority: 4,
        scheme: indexFund,
        allocation: Math.min(allocation.equity, 30),
        monthlyAmount: Math.round(monthlySavings * (allocation.equity / 100)),
        reason: 'Index funds offer low-cost equity exposure with market returns. Start SIP for rupee cost averaging.',
        type: 'growth'
      })
    }
  }
  
  // Gold allocation
  if (allocation.gold >= 5) {
    const sgb = getScheme('sgb')
    if (sgb) {
      recommendations.push({
        priority: 5,
        scheme: sgb,
        allocation: 10,
        monthlyAmount: Math.round(monthlySavings * 0.1),
        reason: 'Sovereign Gold Bonds offer gold investment with additional 2.5% annual interest.',
        type: 'diversification'
      })
    }
  }
  
  // Fixed income for stability
  if (allocation.fixed_income >= 15) {
    const fd = getScheme('bank_fd')
    const rd = getScheme('rd')
    if (fd) {
      recommendations.push({
        priority: 5,
        scheme: timeHorizon === 'short' ? rd : fd,
        allocation: 15,
        monthlyAmount: Math.round(monthlySavings * 0.15),
        reason: 'Fixed deposits provide guaranteed returns and capital safety.',
        type: 'stability'
      })
    }
  }
  
  // Sort by priority
  recommendations.sort((a, b) => a.priority - b.priority)
  
  // Normalize allocations to 100%
  const totalAllocation = recommendations.reduce((sum, r) => sum + r.allocation, 0)
  if (totalAllocation > 0 && totalAllocation !== 100) {
    const factor = 100 / totalAllocation
    recommendations.forEach(r => {
      r.allocation = Math.round(r.allocation * factor)
      r.monthlyAmount = Math.round(r.monthlyAmount * factor)
    })
  }
  
  return recommendations
}

/**
 * Generate AI insights using Gemini
 */
async function generateAIInsights(riskProfile, financialData, recommendations) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    
    const prompt = `You are a financial education assistant helping an Indian user understand their investment options.
    
User Profile:
- Risk Profile: ${riskProfile.profileType}
- Monthly Income: ₹${financialData.monthlyIncome?.toLocaleString('en-IN') || 'Not provided'}
- Monthly Savings: ₹${(financialData.monthlyIncome - financialData.monthlyExpenses)?.toLocaleString('en-IN') || 'Not provided'}
- Age: ${financialData.age || 'Not provided'}
- Financial Goals: ${financialData.goals?.join(', ') || 'Not specified'}

Recommended Schemes:
${recommendations.map(r => `- ${r.scheme.name}: ${r.allocation}% (${r.reason})`).join('\n')}

Generate a brief, personalized insight (3-4 sentences) that:
1. Acknowledges their risk profile
2. Highlights the key benefit of this portfolio
3. Gives one actionable tip
4. Uses Indian context and terminology

IMPORTANT: This is for educational purposes only. Do not give investment advice. Keep it encouraging but realistic.

Response in JSON format:
{
  "insight": "Your personalized insight here",
  "keyHighlight": "One key point about their portfolio",
  "actionTip": "One specific action they can take",
  "motivationalNote": "Brief encouraging note"
}`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    
    return {
      insight: 'Based on your profile, this diversified portfolio aims to balance growth with stability.',
      keyHighlight: 'Your portfolio is tailored to your risk tolerance.',
      actionTip: 'Start with small SIPs and gradually increase as you get comfortable.',
      motivationalNote: 'Consistent investing is the key to building wealth!'
    }
  } catch (error) {
    console.error('AI insights error:', error)
    return {
      insight: 'Your recommended portfolio is designed to match your risk profile and financial goals.',
      keyHighlight: 'Diversification helps manage risk while pursuing returns.',
      actionTip: 'Start with schemes you understand best and gradually explore others.',
      motivationalNote: 'Every investment journey begins with a single step!'
    }
  }
}

/**
 * Calculate investment projections
 */
function calculateProjections(recommendations, timeHorizon) {
  const years = timeHorizon === 'short' ? 3 : timeHorizon === 'long' ? 10 : 5
  const projections = {
    timeframe: `${years} years`,
    scenarios: {},
    totalMonthlyInvestment: recommendations.reduce((sum, r) => sum + r.monthlyAmount, 0)
  }
  
  // Calculate for each scenario
  const scenarios = {
    conservative: 0.8,  // 80% of expected returns
    expected: 1.0,      // Expected returns
    optimistic: 1.2     // 120% of expected returns
  }
  
  Object.entries(scenarios).forEach(([scenarioName, factor]) => {
    let totalFutureValue = 0
    
    recommendations.forEach(rec => {
      const monthlyAmount = rec.monthlyAmount
      const annualReturn = getAverageReturn(rec.scheme) * factor / 100
      const months = years * 12
      
      // SIP Future Value formula: FV = P × ((1 + r)^n - 1) / r × (1 + r)
      const monthlyRate = annualReturn / 12
      if (monthlyRate > 0) {
        const fv = monthlyAmount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate)
        totalFutureValue += fv
      } else {
        totalFutureValue += monthlyAmount * months
      }
    })
    
    projections.scenarios[scenarioName] = {
      futureValue: Math.round(totalFutureValue),
      totalInvested: projections.totalMonthlyInvestment * years * 12,
      gains: Math.round(totalFutureValue - (projections.totalMonthlyInvestment * years * 12))
    }
  })
  
  return projections
}

/**
 * Get average return for a scheme
 */
function getAverageReturn(scheme) {
  if (scheme.currentRate) return scheme.currentRate
  if (scheme.returnRange) {
    return (scheme.returnRange.min + scheme.returnRange.max) / 2
  }
  if (scheme.historicalReturn) return scheme.historicalReturn
  return 7 // Default conservative return
}

/**
 * Get quick recommendations for a goal
 * @param {string} goal - Financial goal
 * @param {Object} financialData - User's financial data
 * @returns {Array} Quick recommendations
 */
export function getGoalBasedRecommendations(goal, financialData) {
  const recommendations = []
  const monthlySavings = (financialData.monthlyIncome || 0) - (financialData.monthlyExpenses || 0)
  
  const goalSchemes = {
    retirement: ['nps', 'ppf', 'elss'],
    child_education: ['ssy', 'ppf', 'index_fund'],
    wealth_building: ['index_fund', 'elss', 'sgb'],
    tax_saving: ['elss', 'ppf', 'nps'],
    emergency_fund: ['liquid_fund', 'rd'],
    home_purchase: ['bank_fd', 'rd', 'debt_fund'],
    vacation: ['liquid_fund', 'rd']
  }
  
  const schemeIds = goalSchemes[goal] || goalSchemes.wealth_building
  
  schemeIds.forEach((schemeId, index) => {
    const scheme = getScheme(schemeId)
    if (scheme) {
      recommendations.push({
        scheme,
        allocation: index === 0 ? 50 : index === 1 ? 30 : 20,
        monthlyAmount: Math.round(monthlySavings * (index === 0 ? 0.5 : index === 1 ? 0.3 : 0.2)),
        reason: scheme.bestFor?.join(', ') || 'Suitable for your goal'
      })
    }
  })
  
  return recommendations
}

/**
 * Validate recommendation compliance
 * @param {Array} recommendations - Generated recommendations
 * @param {Object} userProfile - User profile
 * @returns {Object} Validation result
 */
export function validateRecommendations(recommendations, userProfile) {
  const issues = []
  const warnings = []
  
  // Check total allocation
  const totalAllocation = recommendations.reduce((sum, r) => sum + r.allocation, 0)
  if (Math.abs(totalAllocation - 100) > 1) {
    issues.push(`Total allocation is ${totalAllocation}%, should be 100%`)
  }
  
  // Check age-appropriate recommendations
  if (userProfile.age > 55) {
    const highRiskAllocation = recommendations
      .filter(r => r.scheme.riskLevel === 'high' || r.scheme.riskLevel === 'very_high')
      .reduce((sum, r) => sum + r.allocation, 0)
    
    if (highRiskAllocation > 30) {
      warnings.push('High equity allocation may not be suitable for your age group')
    }
  }
  
  // Check SSY eligibility (only for girl child under 10)
  const ssyRecommendation = recommendations.find(r => r.scheme.id === 'ssy')
  if (ssyRecommendation && !userProfile.hasGirlChildUnder10) {
    issues.push('SSY is only available for girl child under 10 years')
  }
  
  return {
    valid: issues.length === 0,
    issues,
    warnings
  }
}

export default {
  generateRecommendations,
  getGoalBasedRecommendations,
  validateRecommendations
}
