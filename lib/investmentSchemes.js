/**
 * Investment Schemes Database
 * Contains all investment options with their details for Indian users
 * 
 * @module lib/investmentSchemes
 */

/**
 * Investment Scheme Categories
 */
export const SCHEME_CATEGORIES = {
  GOVERNMENT: 'government',
  FIXED_INCOME: 'fixed_income',
  MUTUAL_FUND: 'mutual_fund',
  GOLD: 'gold',
  LIQUID: 'liquid'
}

/**
 * Risk Levels
 */
export const RISK_LEVELS = {
  VERY_LOW: 'very_low',
  LOW: 'low',
  MODERATE: 'moderate',
  HIGH: 'high',
  VERY_HIGH: 'very_high'
}

/**
 * Complete Investment Schemes Database
 * Updated with current rates as of 2025
 */
export const INVESTMENT_SCHEMES = {
  // =====================
  // GOVERNMENT SCHEMES
  // =====================
  
  ppf: {
    key: 'ppf',
    name: 'Public Provident Fund (PPF)',
    shortName: 'PPF',
    type: SCHEME_CATEGORIES.GOVERNMENT,
    riskLevel: RISK_LEVELS.VERY_LOW,
    
    // Returns
    returnRange: { min: 7.1, max: 7.1 },
    currentRate: 7.1,
    rateType: 'fixed_government',
    compoundingFrequency: 'yearly',
    
    // Investment limits
    minInvestment: 500,
    maxInvestment: 150000, // Per financial year
    minLumpsum: 500,
    
    // Lock-in and liquidity
    lockInPeriod: '15 years',
    lockInMonths: 180,
    partialWithdrawal: 'After 7 years (up to 50%)',
    prematureWithdrawal: 'After 5 years (with penalty)',
    liquidity: 'low',
    
    // Tax benefits
    taxBenefit: {
      section: '80C',
      maxDeduction: 150000,
      returnsExempt: true,
      maturityExempt: true
    },
    taxCategory: 'EEE', // Exempt-Exempt-Exempt
    
    // Ideal for
    idealFor: ['Long-term savings', 'Retirement', 'Tax saving', 'Risk-averse investors'],
    
    // Other details
    frequency: 'monthly',
    canSIP: true,
    guaranteedReturns: true,
    governmentBacked: true,
    
    description: 'Government-backed, completely safe with tax-free returns. Best for long-term wealth building.',
    
    pros: [
      'Guaranteed 7.1% returns',
      'Tax-free under EEE',
      'Government backed - zero risk',
      'Loan facility available',
      'Can extend in 5-year blocks'
    ],
    
    cons: [
      '15-year lock-in',
      'Max ₹1.5L per year',
      'Interest rate can change quarterly',
      'Low liquidity'
    ],
    
    eligibility: 'Indian residents only',
    whereToOpen: ['Post Office', 'Banks', 'Online banking portals'],
    
    disclaimer: null // Government scheme, no market risk
  },

  nps: {
    key: 'nps',
    name: 'National Pension System (NPS)',
    shortName: 'NPS',
    type: SCHEME_CATEGORIES.GOVERNMENT,
    riskLevel: RISK_LEVELS.LOW,
    
    returnRange: { min: 9, max: 12 },
    currentRate: 10.5, // Average historical
    rateType: 'market_linked',
    
    minInvestment: 500,
    maxInvestment: null, // No upper limit
    
    lockInPeriod: 'Till age 60',
    partialWithdrawal: 'After 3 years for specific purposes',
    liquidity: 'very_low',
    
    taxBenefit: {
      section: '80C + 80CCD(1B)',
      maxDeduction: 200000, // 1.5L + 50K additional
      additionalDeduction: 50000
    },
    taxCategory: 'EET', // Exempt-Exempt-Taxed (partial)
    
    idealFor: ['Retirement planning', 'Tax saving', 'Long-term wealth'],
    
    frequency: 'monthly',
    canSIP: true,
    guaranteedReturns: false,
    governmentBacked: true,
    
    description: 'Government pension scheme with equity exposure. Excellent for retirement with extra tax benefits.',
    
    pros: [
      'Extra ₹50K tax deduction under 80CCD(1B)',
      'Low fund management charges (0.01%)',
      'Choice of fund managers',
      'Can choose equity allocation up to 75%',
      'Portable across jobs'
    ],
    
    cons: [
      'Locked till 60',
      '40% must buy annuity at maturity',
      'Annuity income is taxable',
      'Market-linked, not guaranteed'
    ],
    
    eligibility: 'Indian citizens 18-70 years',
    whereToOpen: ['eNPS portal', 'Banks', 'POPs (Points of Presence)'],
    
    disclaimer: 'Returns are market-linked and not guaranteed.'
  },

  ssy: {
    key: 'ssy',
    name: 'Sukanya Samriddhi Yojana (SSY)',
    shortName: 'SSY',
    type: SCHEME_CATEGORIES.GOVERNMENT,
    riskLevel: RISK_LEVELS.VERY_LOW,
    
    returnRange: { min: 8.0, max: 8.2 },
    currentRate: 8.2,
    rateType: 'fixed_government',
    
    minInvestment: 250,
    maxInvestment: 150000,
    
    lockInPeriod: '21 years or marriage after 18',
    partialWithdrawal: '50% after age 18 for education',
    liquidity: 'very_low',
    
    taxBenefit: {
      section: '80C',
      maxDeduction: 150000,
      returnsExempt: true,
      maturityExempt: true
    },
    taxCategory: 'EEE',
    
    idealFor: ['Girl child future', 'Education fund', 'Wedding fund'],
    
    frequency: 'monthly',
    canSIP: true,
    guaranteedReturns: true,
    governmentBacked: true,
    
    description: 'Highest interest government scheme specifically for girl child. Best for daughters\' future.',
    
    pros: [
      'Highest rate among government schemes (8.2%)',
      'EEE tax benefit',
      'Government guaranteed',
      'Partial withdrawal for education'
    ],
    
    cons: [
      'Only for girl child under 10',
      'Max 2 accounts per family',
      '21-year lock-in',
      'Very low liquidity'
    ],
    
    eligibility: 'Girl child below 10 years, max 2 per family',
    whereToOpen: ['Post Office', 'Authorized banks'],
    
    disclaimer: null
  },

  // =====================
  // FIXED INCOME
  // =====================

  bank_fd: {
    key: 'bank_fd',
    name: 'Bank Fixed Deposit',
    shortName: 'FD',
    type: SCHEME_CATEGORIES.FIXED_INCOME,
    riskLevel: RISK_LEVELS.VERY_LOW,
    
    returnRange: { min: 6.0, max: 7.5 },
    currentRate: 7.0, // Average for 1-3 years
    rateType: 'fixed_bank',
    
    minInvestment: 1000,
    maxInvestment: null,
    
    lockInPeriod: 'Flexible (7 days to 10 years)',
    prematureWithdrawal: '0.5-1% penalty',
    liquidity: 'moderate',
    
    taxBenefit: {
      section: '80C (only 5-year tax saver FD)',
      maxDeduction: 150000,
      tdsApplicable: true,
      tdsLimit: 40000 // Interest above this attracts TDS
    },
    
    idealFor: ['Short-term parking', 'Emergency fund', 'Senior citizens', 'Risk-averse investors'],
    
    frequency: 'lumpsum',
    canSIP: false,
    guaranteedReturns: true,
    governmentBacked: false,
    insuranceLimit: 500000, // DICGC insurance per bank
    
    description: 'Safe, guaranteed returns. Insured up to ₹5L per bank. Good for short-term goals.',
    
    pros: [
      'Guaranteed returns',
      'Flexible tenure',
      'DICGC insured up to ₹5L',
      'Senior citizens get 0.5% extra',
      'Loan against FD available'
    ],
    
    cons: [
      'Interest is fully taxable',
      'Premature withdrawal penalty',
      'Returns barely beat inflation',
      'TDS deducted if interest > ₹40K'
    ],
    
    eligibility: 'Anyone with a bank account',
    whereToOpen: ['Any bank', 'Online banking'],
    
    disclaimer: null
  },

  rd: {
    key: 'rd',
    name: 'Recurring Deposit',
    shortName: 'RD',
    type: SCHEME_CATEGORIES.FIXED_INCOME,
    riskLevel: RISK_LEVELS.VERY_LOW,
    
    returnRange: { min: 5.5, max: 7.0 },
    currentRate: 6.5,
    rateType: 'fixed_bank',
    
    minInvestment: 100,
    maxInvestment: null,
    
    lockInPeriod: '6 months to 10 years',
    prematureWithdrawal: 'Penalty applies',
    liquidity: 'moderate',
    
    taxBenefit: {
      tdsApplicable: true,
      noSection80C: true
    },
    
    idealFor: ['Regular savings habit', 'Short-term goals', 'Building emergency fund'],
    
    frequency: 'monthly',
    canSIP: true, // Essentially a monthly SIP
    guaranteedReturns: true,
    governmentBacked: false,
    insuranceLimit: 500000,
    
    description: 'Monthly savings with FD-like returns. Great for building savings discipline.',
    
    pros: [
      'Builds savings habit',
      'Low minimum ₹100',
      'Guaranteed returns',
      'Can start anytime'
    ],
    
    cons: [
      'Lower rates than FD',
      'Interest fully taxable',
      'Penalty on missed payments',
      'Better alternatives exist'
    ],
    
    eligibility: 'Anyone with a bank account',
    whereToOpen: ['Any bank', 'Post Office', 'Online banking'],
    
    disclaimer: null
  },

  // =====================
  // MUTUAL FUNDS
  // =====================

  index_fund: {
    key: 'index_fund',
    name: 'Index Fund (Nifty 50/Sensex)',
    shortName: 'Index Fund',
    type: SCHEME_CATEGORIES.MUTUAL_FUND,
    riskLevel: RISK_LEVELS.MODERATE,
    
    returnRange: { min: 10, max: 15 },
    historicalReturn: 12.5, // 10-year average
    rateType: 'market_linked',
    
    minInvestment: 500,
    maxInvestment: null,
    
    lockInPeriod: 'None',
    liquidity: 'high',
    redemptionTime: 'T+2 days',
    
    taxBenefit: {
      stcg: 15, // Short-term capital gains tax
      ltcg: 10, // Long-term (>1 year) above ₹1L
      ltcgExemption: 100000
    },
    
    expenseRatio: { min: 0.1, max: 0.5 },
    
    idealFor: ['Long-term wealth creation', 'First-time investors', 'Passive investors'],
    
    frequency: 'monthly_sip',
    canSIP: true,
    guaranteedReturns: false,
    
    description: 'Low-cost, market-matching returns. Best starting point for equity investing.',
    
    pros: [
      'Very low expense ratio (0.1-0.5%)',
      'Diversified across 50 stocks',
      'No fund manager bias',
      'Tax efficient for long-term',
      'Easy to understand'
    ],
    
    cons: [
      'Returns not guaranteed',
      'Market risk during downturns',
      'Cannot beat the market',
      'Short-term volatility'
    ],
    
    popularFunds: [
      'UTI Nifty 50 Index Fund',
      'HDFC Index Fund Nifty 50',
      'ICICI Pru Nifty 50 Index Fund'
    ],
    
    eligibility: 'Anyone with KYC completed',
    whereToOpen: ['AMC websites', 'Groww', 'Zerodha Coin', 'Paytm Money'],
    
    disclaimer: 'Mutual fund investments are subject to market risks. Read all scheme related documents carefully.'
  },

  elss: {
    key: 'elss',
    name: 'ELSS Tax Saver Fund',
    shortName: 'ELSS',
    type: SCHEME_CATEGORIES.MUTUAL_FUND,
    riskLevel: RISK_LEVELS.HIGH,
    
    returnRange: { min: 10, max: 18 },
    historicalReturn: 14,
    rateType: 'market_linked',
    
    minInvestment: 500,
    maxInvestment: null, // But 80C benefit only up to 1.5L
    
    lockInPeriod: '3 years',
    lockInMonths: 36,
    liquidity: 'low', // During lock-in
    
    taxBenefit: {
      section: '80C',
      maxDeduction: 150000,
      stcg: 15,
      ltcg: 10,
      ltcgExemption: 100000
    },
    
    expenseRatio: { min: 0.5, max: 2.0 },
    
    idealFor: ['Tax saving', 'Long-term wealth', 'Aggressive investors'],
    
    frequency: 'monthly_sip',
    canSIP: true,
    guaranteedReturns: false,
    
    description: 'Shortest lock-in equity fund with tax benefits. Best for tax saving with growth.',
    
    pros: [
      'Tax deduction under 80C',
      'Shortest equity fund lock-in (3 years)',
      'Higher return potential than PPF',
      'SIP creates multiple 3-year locks'
    ],
    
    cons: [
      '3-year lock-in per investment',
      'Market risk - can give negative returns',
      'Higher expense ratio',
      'Need to stay invested during downturns'
    ],
    
    popularFunds: [
      'Axis Long Term Equity Fund',
      'Mirae Asset Tax Saver Fund',
      'Canara Robeco ELSS Tax Saver'
    ],
    
    eligibility: 'Anyone with KYC completed',
    whereToOpen: ['AMC websites', 'Groww', 'Zerodha Coin', 'ET Money'],
    
    disclaimer: 'Mutual fund investments are subject to market risks. Read all scheme related documents carefully.'
  },

  debt_fund: {
    key: 'debt_fund',
    name: 'Debt Mutual Fund',
    shortName: 'Debt Fund',
    type: SCHEME_CATEGORIES.MUTUAL_FUND,
    riskLevel: RISK_LEVELS.LOW,
    
    returnRange: { min: 6, max: 9 },
    historicalReturn: 7.5,
    rateType: 'market_linked',
    
    minInvestment: 500,
    maxInvestment: null,
    
    lockInPeriod: 'None',
    liquidity: 'high',
    redemptionTime: 'T+1 days',
    
    taxBenefit: {
      // Taxed as per income slab (no indexation after 2023)
      taxedAsIncome: true
    },
    
    expenseRatio: { min: 0.2, max: 1.0 },
    
    idealFor: ['Medium-term parking', 'Conservative investors', 'Alternatives to FD'],
    
    frequency: 'lumpsum',
    canSIP: true,
    guaranteedReturns: false,
    
    description: 'Better than FD for 3+ year horizon. Invests in bonds and government securities.',
    
    pros: [
      'Higher than FD returns potential',
      'High liquidity',
      'Diversified across bonds',
      'Professional management'
    ],
    
    cons: [
      'Taxed as per slab now',
      'Credit risk exists',
      'Interest rate sensitivity',
      'Not guaranteed'
    ],
    
    popularFunds: [
      'HDFC Short Term Debt Fund',
      'ICICI Pru Corporate Bond Fund',
      'Axis Banking & PSU Debt Fund'
    ],
    
    eligibility: 'Anyone with KYC completed',
    whereToOpen: ['AMC websites', 'Investment platforms'],
    
    disclaimer: 'Mutual fund investments are subject to market risks. Read all scheme related documents carefully.'
  },

  // =====================
  // GOLD
  // =====================

  sgb: {
    key: 'sgb',
    name: 'Sovereign Gold Bond (SGB)',
    shortName: 'SGB',
    type: SCHEME_CATEGORIES.GOLD,
    riskLevel: RISK_LEVELS.MODERATE,
    
    returnRange: { min: 8, max: 12 },
    additionalInterest: 2.5, // Guaranteed 2.5% on top of gold price
    rateType: 'gold_linked_plus_interest',
    
    minInvestment: 4800, // 1 gram (~current price)
    maxInvestment: 1920000, // 4 KG per individual
    
    lockInPeriod: '8 years',
    lockInMonths: 96,
    partialWithdrawal: 'Exit after 5 years on interest payment dates',
    liquidity: 'moderate',
    tradeable: true, // Can sell on exchange
    
    taxBenefit: {
      interestTaxable: true,
      capitalGainOnMaturity: false, // Tax-free on maturity
      capitalGainOnSale: true // Taxable if sold before maturity
    },
    
    idealFor: ['Gold investment', 'Portfolio diversification', 'Long-term'],
    
    frequency: 'lumpsum',
    canSIP: false, // Only available during issue windows
    guaranteedReturns: false, // Gold price dependent
    governmentBacked: true,
    
    description: 'Gold price gains + 2.5% annual interest. Tax-free on maturity. Best way to invest in gold.',
    
    pros: [
      'Government backed',
      '2.5% guaranteed interest',
      'Tax-free capital gains on maturity',
      'No storage/making charges',
      'Can trade on exchange'
    ],
    
    cons: [
      '8-year lock-in',
      'Only available during issue periods',
      'Gold price can be volatile',
      'No physical gold ownership'
    ],
    
    eligibility: 'Indian residents, HUFs, trusts',
    whereToOpen: ['RBI Retail Direct', 'Banks', 'Stock exchanges'],
    
    disclaimer: 'Gold prices are subject to market fluctuations.'
  },

  gold_etf: {
    key: 'gold_etf',
    name: 'Gold ETF',
    shortName: 'Gold ETF',
    type: SCHEME_CATEGORIES.GOLD,
    riskLevel: RISK_LEVELS.MODERATE,
    
    returnRange: { min: 7, max: 12 },
    rateType: 'gold_linked',
    
    minInvestment: 500,
    maxInvestment: null,
    
    lockInPeriod: 'None',
    liquidity: 'very_high',
    redemptionTime: 'T+2 days',
    
    taxBenefit: {
      stcg: 'As per slab',
      ltcg: 20, // With indexation benefit
      ltcgAfter: '3 years'
    },
    
    expenseRatio: { min: 0.5, max: 1.0 },
    
    idealFor: ['Quick gold exposure', 'Active investors', 'Portfolio diversification'],
    
    frequency: 'lumpsum',
    canSIP: true, // Via Gold MF
    guaranteedReturns: false,
    
    description: 'Digital gold traded like stocks. High liquidity, no storage hassles.',
    
    pros: [
      'Very high liquidity',
      'Trade anytime markets are open',
      'No storage hassles',
      'Small amount investments'
    ],
    
    cons: [
      'Expense ratio reduces returns',
      'Need demat account',
      'No interest like SGB',
      'Taxable capital gains'
    ],
    
    popularFunds: [
      'Nippon India Gold ETF',
      'HDFC Gold ETF',
      'SBI Gold ETF'
    ],
    
    eligibility: 'Anyone with demat + KYC',
    whereToOpen: ['Stock brokers', 'Zerodha', 'Groww'],
    
    disclaimer: 'Gold prices are subject to market fluctuations.'
  },

  // =====================
  // LIQUID/EMERGENCY
  // =====================

  liquid_fund: {
    key: 'liquid_fund',
    name: 'Liquid Mutual Fund',
    shortName: 'Liquid Fund',
    type: SCHEME_CATEGORIES.LIQUID,
    riskLevel: RISK_LEVELS.VERY_LOW,
    
    returnRange: { min: 5, max: 7 },
    currentRate: 6.5,
    rateType: 'near_fixed',
    
    minInvestment: 500,
    maxInvestment: null,
    
    lockInPeriod: 'None',
    liquidity: 'very_high',
    redemptionTime: 'Instant (up to ₹50K) or T+1',
    
    taxBenefit: {
      taxedAsIncome: true
    },
    
    expenseRatio: { min: 0.1, max: 0.3 },
    
    idealFor: ['Emergency fund', 'Short-term parking', 'Better than savings account'],
    
    frequency: 'lumpsum',
    canSIP: false,
    guaranteedReturns: false,
    
    description: 'Park money with instant access. Returns 2-3% higher than savings account.',
    
    pros: [
      'Instant redemption up to ₹50K',
      'Better than savings account',
      'Very low risk',
      'No lock-in'
    ],
    
    cons: [
      'Returns taxed as income',
      'Slightly lower returns than debt funds',
      'Not completely risk-free'
    ],
    
    popularFunds: [
      'HDFC Liquid Fund',
      'ICICI Pru Liquid Fund',
      'Axis Liquid Fund'
    ],
    
    eligibility: 'Anyone with KYC completed',
    whereToOpen: ['AMC websites', 'Investment platforms'],
    
    disclaimer: 'Mutual fund investments are subject to market risks. Read all scheme related documents carefully.'
  }
}

/**
 * Risk Profile Allocations
 * Recommended asset allocation based on risk profile
 */
export const RISK_PROFILE_ALLOCATIONS = {
  conservative: {
    name: 'Conservative',
    description: 'Focus on capital preservation with minimal risk',
    allocation: {
      government: 50,      // PPF, NPS
      fixed_income: 25,    // FD, RD, Debt funds
      equity: 10,          // Index/ELSS
      gold: 10,            // SGB
      liquid: 5            // Liquid funds
    },
    expectedReturn: { min: 7, max: 9 },
    suitableFor: ['Age 50+', 'Risk-averse', 'Short-term goals']
  },
  
  moderate: {
    name: 'Moderate',
    description: 'Balance between safety and growth',
    allocation: {
      government: 30,
      fixed_income: 20,
      equity: 35,
      gold: 10,
      liquid: 5
    },
    expectedReturn: { min: 9, max: 12 },
    suitableFor: ['Age 30-50', 'Medium-term goals', 'Balanced approach']
  },
  
  aggressive: {
    name: 'Aggressive',
    description: 'Maximize growth, comfortable with volatility',
    allocation: {
      government: 15,
      fixed_income: 10,
      equity: 60,
      gold: 10,
      liquid: 5
    },
    expectedReturn: { min: 12, max: 16 },
    suitableFor: ['Age 18-35', 'Long-term goals', 'High risk tolerance']
  }
}

/**
 * Get suitable schemes for a risk profile
 * Returns schemes that match the allocation strategy of the risk profile
 */
export function getSchemesForRiskProfile(profileType) {
  const profile = RISK_PROFILE_ALLOCATIONS[profileType] || RISK_PROFILE_ALLOCATIONS.moderate
  const schemes = []
  
  // Based on the allocation, return schemes from each category
  if (profile.allocation.government > 0) {
    schemes.push(
      ...getSchemesByCategory(SCHEME_CATEGORIES.GOVERNMENT)
    )
  }
  
  if (profile.allocation.fixed_income > 0) {
    schemes.push(
      ...getSchemesByCategory(SCHEME_CATEGORIES.FIXED_INCOME)
    )
  }
  
  if (profile.allocation.equity > 0) {
    schemes.push(
      ...getSchemesByCategory(SCHEME_CATEGORIES.MUTUAL_FUND)
    )
  }
  
  if (profile.allocation.gold > 0) {
    schemes.push(
      ...getSchemesByCategory(SCHEME_CATEGORIES.GOLD)
    )
  }
  
  if (profile.allocation.liquid > 0) {
    schemes.push(
      ...getSchemesByCategory(SCHEME_CATEGORIES.LIQUID)
    )
  }
  
  return schemes
}

/**
 * Get schemes by category
 */
export function getSchemesByCategory(category) {
  return Object.values(INVESTMENT_SCHEMES).filter(s => s.type === category)
}

/**
 * Get scheme by key
 */
export function getScheme(key) {
  return INVESTMENT_SCHEMES[key] || null
}

/**
 * Get all schemes for a risk level
 */
export function getSchemesByRiskLevel(riskLevel) {
  return Object.values(INVESTMENT_SCHEMES).filter(s => s.riskLevel === riskLevel)
}

/**
 * Get schemes with tax benefits
 */
export function getTaxSavingSchemes() {
  return Object.values(INVESTMENT_SCHEMES).filter(
    s => s.taxBenefit?.section?.includes('80C')
  )
}

/**
 * Get schemes sorted by current rate
 */
export function getSchemesByReturn() {
  return Object.values(INVESTMENT_SCHEMES).sort((a, b) => {
    const aRate = a.currentRate || a.historicalReturn || a.returnRange?.max || 0
    const bRate = b.currentRate || b.historicalReturn || b.returnRange?.max || 0
    return bRate - aRate
  })
}

/**
 * Search schemes by name, description, or key
 */
export function searchSchemes(query) {
  const lowerQuery = query.toLowerCase()
  return Object.values(INVESTMENT_SCHEMES).filter(scheme => 
    scheme.name.toLowerCase().includes(lowerQuery) ||
    scheme.shortName?.toLowerCase().includes(lowerQuery) ||
    scheme.key.toLowerCase().includes(lowerQuery) ||
    scheme.description?.toLowerCase().includes(lowerQuery)
  )
}

export default INVESTMENT_SCHEMES
