/**
 * Investment Compliance and Disclaimers
 * Contains all regulatory disclaimers and compliance requirements
 * 
 * @module lib/investmentCompliance
 */

/**
 * Main Disclaimers
 */
export const DISCLAIMERS = {
  /**
   * General disclaimer for all investment-related content
   */
  general: {
    short: 'This is for educational purposes only, not investment advice.',
    full: `WealthWise provides educational information about investment options. 
We are NOT a registered investment advisor (RIA) or SEBI-registered entity. 
All recommendations are for educational and informational purposes only. 
We do not provide personalized investment advice.`
  },

  /**
   * Mutual fund specific disclaimer (SEBI mandated)
   */
  mutualFund: {
    short: 'Mutual Fund investments are subject to market risks.',
    full: `Mutual Fund investments are subject to market risks. 
Please read all scheme-related documents carefully before investing. 
Past performance is not indicative of future returns. 
The NAV of units issued under the Scheme can go up or down depending on market conditions.`,
    sebi: 'SEBI Registration No: Not Applicable (We are not a distributor or advisor)'
  },

  /**
   * Equity/Stock related disclaimer
   */
  equity: {
    short: 'Equity investments carry market risk.',
    full: `Equity investments are subject to market risks including the loss of principal. 
Stock prices can fluctuate significantly based on various factors. 
Past performance of stocks or indices is not indicative of future returns.`
  },

  /**
   * Projection/Simulation disclaimer
   */
  projection: {
    short: 'Projections are simulations, not guarantees.',
    full: `All projections and calculations shown are simulations based on historical data and assumed rates of return. 
Actual returns may vary significantly from projections. 
These projections are for illustrative purposes only and should not be considered as a guarantee of future performance.`,
    warning: '⚠️ Past performance does not guarantee future results.'
  },

  /**
   * No investment advice disclaimer
   */
  noAdvice: {
    short: 'This is not investment advice.',
    full: `This information does not constitute investment, legal, or tax advice. 
Please consult a SEBI-registered investment advisor, certified financial planner, or tax consultant 
before making any investment decisions. 
WealthWise and its creators are not responsible for any investment decisions made based on this information.`
  },

  /**
   * Tax disclaimer
   */
  tax: {
    short: 'Tax benefits are subject to change.',
    full: `Tax benefits mentioned are as per current tax laws and are subject to change. 
Please consult a qualified tax advisor for personalized tax advice. 
Tax laws are complex and their application depends on individual circumstances.`
  },

  /**
   * Government scheme disclaimer
   */
  governmentScheme: {
    short: 'Interest rates are subject to quarterly review.',
    full: `Interest rates on government schemes like PPF, SSY, and NPS are reviewed quarterly by the Government of India 
and are subject to change. The rates mentioned are current as of the last update and may not reflect the latest rates.`
  },

  /**
   * Gold investment disclaimer
   */
  gold: {
    short: 'Gold prices fluctuate based on market conditions.',
    full: `Gold prices are subject to market fluctuations based on global demand, currency movements, 
and economic factors. Past gold price performance is not indicative of future prices. 
SGBs are backed by the Government of India but gold price risk remains.`
  },

  /**
   * Risk warning
   */
  riskWarning: {
    short: 'All investments carry risk.',
    full: `All investments carry risk, including the potential loss of principal. 
Consider your risk tolerance, investment goals, and time horizon before investing. 
Diversification does not guarantee profit or protect against loss.`
  },

  /**
   * Age/eligibility disclaimer
   */
  eligibility: {
    full: `Eligibility criteria, minimum investment amounts, and other terms are subject to change. 
Please verify current requirements directly with the scheme provider or financial institution before investing.`
  }
}

/**
 * Get disclaimers for a specific scheme type
 * @param {string} schemeType - Type of scheme
 * @returns {Array} Array of applicable disclaimers
 */
export function getDisclaimersForScheme(schemeType) {
  const disclaimers = [DISCLAIMERS.general.full]

  switch (schemeType) {
    case 'mutual_fund':
      disclaimers.push(DISCLAIMERS.mutualFund.full)
      disclaimers.push(DISCLAIMERS.projection.full)
      break
    case 'government':
      disclaimers.push(DISCLAIMERS.governmentScheme.full)
      break
    case 'gold':
      disclaimers.push(DISCLAIMERS.gold.full)
      break
    case 'equity':
      disclaimers.push(DISCLAIMERS.equity.full)
      disclaimers.push(DISCLAIMERS.projection.full)
      break
    default:
      break
  }

  disclaimers.push(DISCLAIMERS.noAdvice.full)

  return disclaimers
}

/**
 * Get short disclaimers for display
 * @param {Array} schemeTypes - Types of schemes in recommendations
 * @returns {Array} Array of short disclaimers
 */
export function getShortDisclaimers(schemeTypes = []) {
  const disclaimers = new Set()

  disclaimers.add(DISCLAIMERS.general.short)

  if (schemeTypes.includes('mutual_fund')) {
    disclaimers.add(DISCLAIMERS.mutualFund.short)
  }

  if (schemeTypes.includes('gold')) {
    disclaimers.add(DISCLAIMERS.gold.short)
  }

  if (schemeTypes.includes('government')) {
    disclaimers.add(DISCLAIMERS.governmentScheme.short)
  }

  disclaimers.add(DISCLAIMERS.projection.short)
  disclaimers.add(DISCLAIMERS.noAdvice.short)

  return Array.from(disclaimers)
}

/**
 * Mandatory footer disclaimer
 */
export const FOOTER_DISCLAIMER = `
Disclaimer: WealthWise is an educational platform and does not provide investment, tax, or legal advice. 
All information is for educational purposes only. Consult a SEBI-registered advisor before investing.
Mutual Fund investments are subject to market risks. Read all scheme-related documents carefully.
`

/**
 * Risk level descriptions
 */
export const RISK_DESCRIPTIONS = {
  very_low: {
    label: 'Very Low Risk',
    color: 'green',
    description: 'Capital is protected. Returns are guaranteed or near-guaranteed.',
    examples: 'PPF, Bank FD, Savings Account'
  },
  low: {
    label: 'Low Risk',
    color: 'teal',
    description: 'Minor fluctuations possible. Principal is largely protected.',
    examples: 'NPS, Debt Funds, Government Bonds'
  },
  moderate: {
    label: 'Moderate Risk',
    color: 'yellow',
    description: 'Moderate fluctuations. Returns can vary. Suitable for medium to long term.',
    examples: 'Index Funds, Balanced Funds, Gold'
  },
  high: {
    label: 'High Risk',
    color: 'orange',
    description: 'Significant fluctuations. Short-term losses possible. Best for long-term.',
    examples: 'ELSS, Equity Funds, Sector Funds'
  },
  very_high: {
    label: 'Very High Risk',
    color: 'red',
    description: 'Highly volatile. Substantial losses possible. Only for experienced investors.',
    examples: 'Small Cap Funds, Crypto, Direct Stocks'
  }
}

/**
 * Get risk description
 * @param {string} riskLevel - Risk level
 * @returns {Object} Risk description object
 */
export function getRiskDescription(riskLevel) {
  return RISK_DESCRIPTIONS[riskLevel] || RISK_DESCRIPTIONS.moderate
}

/**
 * Compliance checks before showing recommendations
 */
export const COMPLIANCE_REQUIREMENTS = {
  // User must acknowledge disclaimer
  requireDisclaimerAcknowledgment: true,

  // Show risk warning for first-time users
  showRiskWarningForNewUsers: true,

  // Require age verification for equity recommendations
  requireAgeForEquity: 18,

  // Maximum allocation to high-risk assets for conservative profiles
  maxHighRiskAllocation: {
    conservative: 15,
    moderate: 40,
    aggressive: 70
  },

  // Require emergency fund before aggressive investing
  requireEmergencyFund: true,

  // Suggest professional advice for large amounts
  professionalAdviceThreshold: 500000 // ₹5 Lakhs
}

/**
 * Check if recommendation needs additional warnings
 * @param {Object} recommendation - Recommendation object
 * @param {Object} userProfile - User profile
 * @returns {Array} Additional warnings
 */
export function getAdditionalWarnings(recommendation, userProfile) {
  const warnings = []

  // High equity allocation for older users
  if (userProfile.age > 50 && recommendation.assetAllocation?.equity > 30) {
    warnings.push('⚠️ Higher equity allocation may not be suitable for your age group. Consider a more conservative approach.')
  }

  // No emergency fund
  if (!userProfile.hasEmergencyFund && recommendation.assetAllocation?.equity > 20) {
    warnings.push('💡 Consider building an emergency fund (3-6 months expenses) before investing in equities.')
  }

  // Large investment amount
  if (recommendation.basedOnSavings > COMPLIANCE_REQUIREMENTS.professionalAdviceThreshold) {
    warnings.push('💼 For investments above ₹5 Lakhs, we recommend consulting a SEBI-registered investment advisor.')
  }

  // High risk for unstable income
  if (userProfile.incomeStability === 'unstable' && recommendation.riskProfile === 'aggressive') {
    warnings.push('⚠️ With variable income, a more conservative approach might be suitable.')
  }

  return warnings
}

/**
 * Terms of use for investment features
 */
export const TERMS_OF_USE = `
Investment Feature Terms of Use:

1. EDUCATIONAL PURPOSE: All investment information, recommendations, and projections provided 
   by WealthWise are for educational and informational purposes only.

2. NOT INVESTMENT ADVICE: We are not SEBI-registered and do not provide personalized investment advice. 
   Our recommendations are generated by algorithms and should not be considered as professional advice.

3. RISK ACKNOWLEDGMENT: By using this feature, you acknowledge that all investments carry risk, 
   including the potential loss of principal amount.

4. NO GUARANTEE: Past performance, historical returns, and projections do not guarantee future results. 
   Actual returns may be significantly different from projections.

5. INDEPENDENT DECISION: Any investment decision you make is your own responsibility. 
   We recommend consulting qualified professionals before making investment decisions.

6. ACCURACY: While we strive for accuracy, investment information including interest rates, 
   tax benefits, and scheme details may change. Please verify with official sources.

7. NO LIABILITY: WealthWise and its creators shall not be liable for any investment decisions 
   made based on information provided on this platform.

By using the investment features, you agree to these terms.
`

export default {
  DISCLAIMERS,
  getDisclaimersForScheme,
  getShortDisclaimers,
  FOOTER_DISCLAIMER,
  RISK_DESCRIPTIONS,
  getRiskDescription,
  COMPLIANCE_REQUIREMENTS,
  getAdditionalWarnings,
  TERMS_OF_USE
}
