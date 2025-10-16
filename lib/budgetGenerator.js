// lib/budgetGenerator.js
import { 
  BUDGET_CATEGORIES, 
  CITY_ADJUSTMENTS, 
  getFamilySizeAdjustment,
  getIncomeAdjustments,
  getAgeAdjustments
} from './budgetConfig.js'

export class AIBudgetGenerator {
  constructor() {
    this.categories = BUDGET_CATEGORIES
    this.cityAdjustments = CITY_ADJUSTMENTS
    this.geminiApiKey = process.env.GEMINI_API_KEY
  }

  /**
   * Generate personalized budget based on user profile using AI
   * @param {Object} userProfile - User profile data
   * @returns {Object} Generated budget with categories and explanations
   */
  async generateBudget(userProfile) {
    const {
      monthlyIncome,
      city,
      familySize,
      age,
      occupation = '',
      budgetPreferences = {}
    } = userProfile

    // Get all adjustment factors
    const cityAdjustment = this.getCityAdjustment(city)
    const familyAdjustment = getFamilySizeAdjustment(familySize)
    const incomeAdjustment = getIncomeAdjustments(monthlyIncome)
    const ageAdjustment = getAgeAdjustments(age)

    // Calculate adjusted budget
    const adjustedBudget = this.calculateAdjustedBudget(
      monthlyIncome,
      cityAdjustment,
      familyAdjustment,
      incomeAdjustment,
      ageAdjustment
    )

    // Validate budget before proceeding
    const budgetValidation = this.validateBudgetAllocations(adjustedBudget.categories, monthlyIncome)
    console.log('📊 Budget validation:', budgetValidation)
    
    if (!budgetValidation.isValid) {
      console.warn('⚠️ Budget validation failed, applying corrections...')
      // Could apply corrections here if needed
    }

    // Generate AI-powered explanations and tips
    const aiInsights = await this.generateAIInsights(userProfile, adjustedBudget)

    return {
      categories: adjustedBudget.categories,
      totalBudget: monthlyIncome,
      totalAllocated: adjustedBudget.totalAllocated,
      savings: adjustedBudget.categories.savings,
      explanations: aiInsights.explanations,
      tips: aiInsights.tips,
      recommendations: aiInsights.recommendations,
      aiGenerated: aiInsights.aiGenerated || false,
      confidence: aiInsights.confidence || 0.75,
      validationScore: budgetValidation.score,
      generatedAt: new Date(),
      metadata: {
        city,
        familySize,
        age,
        occupation,
        adjustmentFactors: {
          city: cityAdjustment,
          family: familyAdjustment,
          income: incomeAdjustment,
          age: ageAdjustment
        },
        validationWarnings: budgetValidation.warnings
      }
    }
  }

  /**
   * Get city-specific adjustments
   */
  getCityAdjustment(city) {
    const normalizedCity = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase()
    return this.cityAdjustments[normalizedCity] || this.cityAdjustments.default
  }

  /**
   * Calculate budget with all adjustments applied
   */
  calculateAdjustedBudget(income, cityAdj, familyAdj, incomeAdj, ageAdj) {
    const categories = {}
    let totalAllocated = 0

    // Apply all adjustments to each category
    if (this.categories && typeof this.categories === 'object') {
      Object.entries(this.categories).forEach(([categoryKey, categoryData]) => {
        const baseAmount = income * categoryData.basePercentage
        
        // Apply all adjustment factors
        const adjustmentFactor = 
          (cityAdj[categoryKey] || 1) *
          (familyAdj[categoryKey] || 1) *
        (incomeAdj[categoryKey] || 1) *
        (ageAdj[categoryKey] || 1)

      const adjustedAmount = Math.round(baseAmount * adjustmentFactor)
      const percentage = Math.round((adjustedAmount / income) * 100)

      categories[categoryKey] = {
        amount: adjustedAmount,
        percentage,
        hindiName: categoryData.hindiName,
        englishName: categoryData.englishName,
        hinglishName: categoryData.hinglishName,
        emoji: categoryData.emoji,
        description: categoryData.description?.english || categoryData.description || categoryData.englishName
      }

      totalAllocated += adjustedAmount
    })
    }

    // Ensure budget balances to 100% of income
    this.balanceBudget(categories, income, totalAllocated)

    return { categories, totalAllocated: income }
  }

  /**
   * Balance budget to ensure it adds up to 100% of income
   */
  balanceBudget(categories, income, currentTotal) {
    const difference = income - currentTotal

    if (Math.abs(difference) < 100) return // Small differences are acceptable

    // If there's a significant difference, adjust savings category
    if (categories.savings) {
      categories.savings.amount += difference
      categories.savings.percentage = Math.round((categories.savings.amount / income) * 100)
      
      // Ensure savings doesn't go negative
      if (categories.savings.amount < 0) {
        const deficit = Math.abs(categories.savings.amount)
        categories.savings.amount = Math.round(income * 0.05) // Minimum 5% savings
        
        // Reduce other categories proportionally
        this.reduceOtherCategories(categories, deficit, income)
      }
    }
  }

  /**
   * Reduce other categories proportionally when savings would go negative
   */
  reduceOtherCategories(categories, deficit, income) {
    const excludeKeys = ['savings']
    const reducibleCategories = Object.keys(categories).filter(key => !excludeKeys.includes(key))
    
    const totalReducible = reducibleCategories.reduce((sum, key) => sum + categories[key].amount, 0)
    
    reducibleCategories.forEach(key => {
      const reductionRatio = categories[key].amount / totalReducible
      const reduction = Math.round(deficit * reductionRatio)
      
      categories[key].amount = Math.max(categories[key].amount - reduction, Math.round(income * 0.02)) // Minimum 2% per category
      categories[key].percentage = Math.round((categories[key].amount / income) * 100)
    })
  }

  /**
   * Generate AI-powered insights using Gemini API with enhanced prompting
   */
  async generateAIInsights(userProfile, budget) {
    // Try AI first with enhanced prompting, fallback if needed
    if (!this.geminiApiKey) {
      console.log('⚠️ No Gemini API key found, using fallback')
      return this.generateFallbackInsights(userProfile, budget)
    }

    try {
      console.log('🤖 Generating AI insights with enhanced prompting...')
      const prompt = this.createEnhancedPromptForGemini(userProfile, budget)
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${this.geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      })

      if (!response.ok) {
        console.error(`❌ Gemini API error: ${response.status}`)
        throw new Error(`Gemini API error: ${response.status}`)
      }

      const data = await response.json()
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text

      if (!aiResponse) {
        throw new Error('No response from Gemini API')
      }

      // Parse and validate the AI response
      let parsedResponse
      try {
        const cleanResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        parsedResponse = JSON.parse(cleanResponse)
        
        // Validate AI response structure
        const validation = this.validateAIResponse(parsedResponse, userProfile, budget)
        
        if (!validation.isValid) {
          console.warn('⚠️ AI response validation failed:', validation.issues)
          throw new Error('AI response validation failed')
        }
        
        console.log('✅ AI insights generated successfully with confidence:', validation.confidence)
        
        return {
          explanations: parsedResponse.explanations || this.generateFallbackExplanations(userProfile, budget),
          tips: parsedResponse.tips || this.generateFallbackTips(userProfile, budget),
          recommendations: parsedResponse.recommendations || this.generateFallbackRecommendations(userProfile, budget),
          aiGenerated: true,
          confidence: validation.confidence
        }
        
      } catch (parseError) {
        console.warn('Failed to parse AI response:', parseError.message)
        throw parseError
      }
      
    } catch (error) {
      console.error('❌ AI insights generation failed:', error.message)
      console.log('📋 Using enhanced fallback system...')
      // Fallback to enhanced traditional explanations
      return this.generateFallbackInsights(userProfile, budget)
    }
  }
  
  /**
   * Consolidated fallback insights generator
   */
  generateFallbackInsights(userProfile, budget) {
    return {
      explanations: this.generateFallbackExplanations(userProfile, budget),
      tips: this.generateFallbackTips(userProfile, budget),
      recommendations: this.generateFallbackRecommendations(userProfile, budget),
      aiGenerated: false,
      confidence: 0.75
    }
  }

  /**
   * Create enhanced prompt for Gemini AI with financial expertise
   */
  createEnhancedPromptForGemini(userProfile, budget) {
    const { monthlyIncome, city, familySize, age, occupation } = userProfile
    
    // Get city-specific data
    const cityData = this.getCitySpecificData(city, monthlyIncome, familySize)
    
    // Get occupation-specific insights
    const occupationData = this.getOccupationInsights(occupation, monthlyIncome)
    
    return `You are an expert Indian Certified Financial Planner (CFP) with 15+ years of experience specializing in personal finance for Indian middle-class families.

🎯 USER PROFILE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 Monthly Income: ₹${monthlyIncome.toLocaleString('en-IN')} (${occupationData.stability})
🏙️ City: ${city} 
   • Typical Rent (${familySize}-member): ₹${cityData.avgRent.toLocaleString('en-IN')}
   • Average Transport/month: ₹${cityData.avgTransport.toLocaleString('en-IN')}
   • Grocery Budget (${familySize}-member): ₹${cityData.avgFood.toLocaleString('en-IN')}
👨‍👩‍👧‍👦 Family: ${familySize} members
👤 Age: ${age} years | Occupation: ${occupation || 'Professional'}

📊 GENERATED BUDGET ALLOCATION:
${budget.categories ? Object.entries(budget.categories).map(([key, cat]) => 
  `${cat.emoji} ${cat.englishName}: ₹${cat.amount.toLocaleString('en-IN')} (${cat.percentage}%)`
).join('\n') : 'Budget data not available'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 YOUR TASK:
As a CFP expert, analyze this budget and provide personalized insights. This budget was generated using data-driven adjustments for ${city}, but I need your expert opinion to validate and enhance it.

📋 VALIDATION CHECKLIST:
✅ Housing (20-40% is healthy, 45%+ is concerning)
✅ Food & Dining (15-30% is normal for ${familySize}-member family)
✅ Savings (Minimum 15%, Ideal 20-30% for financial health)
✅ Healthcare (5-10% is recommended, especially for age ${age})
✅ Transportation (8-15% is typical for Indian cities)

💡 CONSIDER THESE FACTORS:
• ${city} cost of living is ${cityData.costLevel}
• ${familySize}-member families typically need ₹${cityData.avgTotalExpense.toLocaleString('en-IN')} for basic expenses
• At age ${age}, ${this.getAgeSpecificAdvice(age)}
• ${occupationData.insight}

🎯 PROVIDE JSON OUTPUT:
{
  "explanations": {
    "overall": "Brief overview of budget health and approach (2-3 sentences)",
    "categories": {
      "food_dining": "Why this allocation makes sense for this family (1-2 sentences)",
      "home_utilities": "Housing allocation reasoning (mention ${city} context)",
      "transportation": "Transport needs analysis",
      "entertainment": "Lifestyle balance consideration",
      "shopping": "Personal care & clothing budget rationale",
      "healthcare": "Health insurance and medical needs",
      "savings": "Savings strategy and emergency fund focus"
    }
  },
  "tips": [
    "💰 Specific actionable tip about savings (mention actual amount)",
    "🏠 City-specific cost optimization tip for ${city}",
    "👨‍👩‍👧‍👦 Family-size relevant suggestion",
    "📊 Age-appropriate financial planning advice",
    "🎯 One smart money habit to adopt this month"
  ],
  "recommendations": [
    {
      "type": "Emergency Fund",
      "amount": ${monthlyIncome * 6},
      "description": "Build emergency fund covering 6 months of expenses (₹${(monthlyIncome * 6).toLocaleString('en-IN')})",
      "priority": "High",
      "icon": "🛡️"
    },
    {
      "type": "Investment Strategy",
      "amount": ${Math.round(budget.categories?.savings?.amount * 0.7 || monthlyIncome * 0.15)},
      "description": "Age-appropriate investment recommendation",
      "priority": "High",
      "icon": "📈"
    },
    {
      "type": "Insurance",
      "amount": ${monthlyIncome * 120},
      "description": "Term insurance coverage suggestion",
      "priority": "Critical",
      "icon": "🛡️"
    }
  ]
}

⚠️ IMPORTANT RULES:
1. All amounts should be realistic for Indian context
2. Tips must be specific and actionable (not generic advice)
3. Consider ${city} actual living costs
4. Recommendations should have specific rupee amounts
5. Be empathetic and encouraging in tone
6. Return ONLY valid JSON, no other text

🎯 OUTPUT ONLY THE JSON, NOTHING ELSE.`
  }
  
  /**
   * Get city-specific financial data
   */
  getCitySpecificData(city, income, familySize) {
    const cityData = {
      'Mumbai': {
        avgRent: Math.min(income * 0.35, 25000 + (familySize - 1) * 5000),
        avgTransport: Math.min(5000 + (familySize * 500), 8000),
        avgFood: 8000 + (familySize * 4000),
        costLevel: 'among the highest in India',
        avgTotalExpense: 50000 + (familySize * 10000)
      },
      'Delhi': {
        avgRent: Math.min(income * 0.32, 20000 + (familySize - 1) * 4000),
        avgTransport: Math.min(4000 + (familySize * 500), 7000),
        avgFood: 7000 + (familySize * 3500),
        costLevel: 'high, especially in South Delhi',
        avgTotalExpense: 45000 + (familySize * 9000)
      },
      'Bangalore': {
        avgRent: Math.min(income * 0.30, 18000 + (familySize - 1) * 3500),
        avgTransport: Math.min(4000 + (familySize * 400), 6000),
        avgFood: 6500 + (familySize * 3500),
        costLevel: 'moderate to high',
        avgTotalExpense: 42000 + (familySize * 8500)
      },
      'Hyderabad': {
        avgRent: Math.min(income * 0.28, 15000 + (familySize - 1) * 3000),
        avgTransport: Math.min(3500 + (familySize * 400), 5500),
        avgFood: 6000 + (familySize * 3000),
        costLevel: 'moderate and affordable',
        avgTotalExpense: 38000 + (familySize * 7500)
      },
      'Chennai': {
        avgRent: Math.min(income * 0.28, 16000 + (familySize - 1) * 3000),
        avgTransport: Math.min(3500 + (familySize * 400), 5500),
        avgFood: 6000 + (familySize * 3000),
        costLevel: 'moderate',
        avgTotalExpense: 38000 + (familySize * 7500)
      },
      'Pune': {
        avgRent: Math.min(income * 0.28, 15000 + (familySize - 1) * 3000),
        avgTransport: Math.min(3500 + (familySize * 400), 5500),
        avgFood: 6000 + (familySize * 3000),
        costLevel: 'moderate',
        avgTotalExpense: 38000 + (familySize * 7500)
      },
      'Kolkata': {
        avgRent: Math.min(income * 0.25, 12000 + (familySize - 1) * 2500),
        avgTransport: Math.min(3000 + (familySize * 300), 4500),
        avgFood: 5500 + (familySize * 2800),
        costLevel: 'relatively affordable',
        avgTotalExpense: 32000 + (familySize * 6500)
      }
    }
    
    return cityData[city] || {
      avgRent: Math.min(income * 0.25, 12000 + (familySize - 1) * 2500),
      avgTransport: 3500 + (familySize * 400),
      avgFood: 6000 + (familySize * 3000),
      costLevel: 'moderate',
      avgTotalExpense: 35000 + (familySize * 7000)
    }
  }
  
  /**
   * Get occupation-specific insights
   */
  getOccupationInsights(occupation, income) {
    const occupationMap = {
      'software': { stability: 'Stable IT income', insight: 'Consider SIP investments and ESOP planning' },
      'engineer': { stability: 'Stable engineering income', insight: 'Focus on long-term equity investments' },
      'teacher': { stability: 'Stable education sector', insight: 'Government pension benefits, focus on PPF' },
      'business': { stability: 'Variable business income', insight: 'Maintain higher emergency fund (9-12 months)' },
      'freelance': { stability: 'Variable freelance income', insight: 'Build 12-month emergency fund, irregular income planning' },
      'doctor': { stability: 'Stable medical profession', insight: 'High income potential, consider real estate and mutual funds' },
      'default': { stability: 'Regular monthly income', insight: 'Balanced approach to savings and investments' }
    }
    
    const occupationLower = (occupation || '').toLowerCase()
    for (const [key, value] of Object.entries(occupationMap)) {
      if (occupationLower.includes(key)) {
        return value
      }
    }
    
    return occupationMap.default
  }
  
  /**
   * Get age-specific financial advice
   */
  getAgeSpecificAdvice(age) {
    if (age < 30) {
      return 'you should focus on aggressive wealth building through equity investments and skill development'
    } else if (age < 40) {
      return 'balance between growth (equity) and stability (debt) is important, with focus on insurance'
    } else if (age < 50) {
      return 'shift focus to capital preservation while maintaining some growth investments'
    } else {
      return 'prioritize capital preservation, adequate health insurance, and retirement corpus'
    }
  }
  
  /**
   * Validate AI response for realistic budget recommendations
   */
  validateAIResponse(aiResponse, userProfile, budget) {
    const issues = []
    let confidence = 1.0
    
    try {
      // Check if response has required structure
      if (!aiResponse.explanations) {
        issues.push('Missing explanations')
        confidence -= 0.3
      }
      
      if (!aiResponse.tips || !Array.isArray(aiResponse.tips) || aiResponse.tips.length < 3) {
        issues.push('Insufficient tips')
        confidence -= 0.2
      }
      
      if (!aiResponse.recommendations || !Array.isArray(aiResponse.recommendations)) {
        issues.push('Missing recommendations')
        confidence -= 0.2
      }
      
      // Validate explanations structure
      if (aiResponse.explanations) {
        if (!aiResponse.explanations.overall) {
          issues.push('Missing overall explanation')
          confidence -= 0.1
        }
        
        if (!aiResponse.explanations.categories) {
          issues.push('Missing category explanations')
          confidence -= 0.2
        }
      }
      
      // Validate recommendations have required fields
      if (aiResponse.recommendations && Array.isArray(aiResponse.recommendations)) {
        for (const rec of aiResponse.recommendations) {
          if (!rec.type || !rec.description || !rec.priority) {
            issues.push(`Invalid recommendation structure: ${JSON.stringify(rec)}`)
            confidence -= 0.1
          }
          
          // Check if amounts are realistic
          if (rec.amount) {
            if (rec.amount < 0 || rec.amount > userProfile.monthlyIncome * 200) {
              issues.push(`Unrealistic recommendation amount: ₹${rec.amount}`)
              confidence -= 0.1
            }
          }
        }
      }
      
      // Validate tips quality
      if (aiResponse.tips && Array.isArray(aiResponse.tips)) {
        for (const tip of aiResponse.tips) {
          if (typeof tip !== 'string' || tip.length < 20) {
            issues.push('Tips are too short or invalid')
            confidence -= 0.05
          }
        }
      }
      
    } catch (error) {
      issues.push(`Validation error: ${error.message}`)
      confidence = 0
    }
    
    return {
      isValid: issues.length === 0 || confidence > 0.6,
      issues,
      confidence: Math.max(confidence, 0)
    }
  }
  
  /**
   * Validate budget allocations are within realistic ranges
   */
  validateBudgetAllocations(categories, monthlyIncome) {
    const rules = {
      savings: { min: 10, max: 40, ideal: 20, name: 'Savings' },
      home_utilities: { min: 20, max: 45, ideal: 30, name: 'Housing' },
      food_dining: { min: 15, max: 35, ideal: 25, name: 'Food' },
      transportation: { min: 5, max: 20, ideal: 10, name: 'Transport' },
      healthcare: { min: 3, max: 15, ideal: 7, name: 'Healthcare' },
      entertainment: { min: 2, max: 15, ideal: 8, name: 'Entertainment' },
      shopping: { min: 2, max: 15, ideal: 5, name: 'Shopping' }
    }
    
    const issues = []
    const warnings = []
    let score = 100
    
    for (const [key, category] of Object.entries(categories)) {
      const rule = rules[key]
      if (!rule) continue
      
      const percentage = category.percentage
      
      if (percentage < rule.min) {
        issues.push(`${rule.name} too low: ${percentage}% (minimum ${rule.min}%)`)
        score -= 10
      } else if (percentage > rule.max) {
        issues.push(`${rule.name} too high: ${percentage}% (maximum ${rule.max}%)`)
        score -= 15
      } else if (Math.abs(percentage - rule.ideal) > 10) {
        warnings.push(`${rule.name}: ${percentage}% (ideal: ${rule.ideal}%)`)
        score -= 3
      }
    }
    
    // Check total adds to 100%
    const total = Object.values(categories).reduce((sum, cat) => sum + (cat.percentage || 0), 0)
    if (Math.abs(total - 100) > 1) {
      issues.push(`Total allocation ${total.toFixed(1)}% doesn't equal 100%`)
      score -= 20
    }
    
    return {
      isValid: issues.length === 0,
      issues,
      warnings,
      score: Math.max(score, 0),
      confidence: score / 100
    }
  }

  /**
   * Generate fallback explanations in English
   */
  generateFallbackExplanations(userProfile, budget) {
    const { city, familySize, monthlyIncome, age } = userProfile
    
    const explanations = {
      overall: `This budget is designed for your monthly income of ₹${monthlyIncome.toLocaleString('en-IN')} for a family of ${familySize} members living in ${city}. It's optimized for Indian spending patterns and local cost considerations.`,
      categories: {}
    }

    // Generate category-specific explanations
    if (budget.categories && typeof budget.categories === 'object') {
      Object.entries(budget.categories).forEach(([categoryKey, categoryData]) => {
        explanations.categories[categoryKey] = this.getCategoryExplanation(categoryKey, categoryData, userProfile)
      })
    }

    return explanations
  }

  /**
   * Generate enhanced fallback tips in English with specific actionable advice
   */
  generateFallbackTips(userProfile, budget) {
    const { monthlyIncome, familySize, age, city } = userProfile
    const savingsPercentage = budget.categories?.savings?.percentage || 0
    const housingPercentage = budget.categories?.home_utilities?.percentage || 0
    const foodPercentage = budget.categories?.food_dining?.percentage || 0
    const tips = []

    // 1. Savings-specific actionable tips
    if (savingsPercentage < 15) {
      const targetSavings = monthlyIncome * 0.15
      const currentSavings = budget.categories?.savings?.amount || 0
      const additionalNeeded = targetSavings - currentSavings
      tips.push(`💰 Increase your savings by ₹${Math.round(additionalNeeded).toLocaleString('en-IN')}/month to reach the healthy 15% mark (₹${Math.round(targetSavings).toLocaleString('en-IN')}). Start by cutting one restaurant meal per week - saves ~₹2,000/month!`)
    } else if (savingsPercentage >= 20) {
      const monthlySavings = budget.categories?.savings?.amount || 0
      const yearlyTotal = monthlySavings * 12
      tips.push(`🎉 Excellent ${savingsPercentage}% savings rate! That's ₹${yearlyTotal.toLocaleString('en-IN')}/year. Invest 70% in equity mutual funds and 30% in PPF for optimal growth + safety.`)
    } else {
      tips.push(`💰 Your ${savingsPercentage}% savings rate is good! Aim for 20% by reducing discretionary spending. Even saving an extra ₹1,000/month = ₹12,000/year!`)
    }

    // 2. Age-specific actionable tips
    if (age < 30) {
      const sipAmount = Math.round(monthlyIncome * 0.15)
      const futureValue = Math.round(sipAmount * 12 * 30 * 3) // Approx 12% CAGR
      tips.push(`🚀 At ${age}, start a ₹${sipAmount.toLocaleString('en-IN')}/month SIP in Nifty 50 index fund. In 30 years, this could grow to ₹${(futureValue/10000000).toFixed(1)} crores! Time is your biggest asset.`)
    } else if (age >= 30 && age < 40) {
      tips.push(`📈 Perfect age for wealth building! Allocate 60% to equity, 30% to debt, and 10% to gold. Review your portfolio quarterly and rebalance if needed.`)
    } else if (age >= 40 && age < 50) {
      tips.push(`🎯 At ${age}, shift to 50-50 equity-debt allocation. Ensure you have term insurance (10x annual income) and ₹10L+ health insurance for family security.`)
    } else if (age >= 50) {
      tips.push(`🛡️ At ${age}, focus on capital preservation. Move to 30% equity, 60% debt, 10% gold. Ensure adequate health coverage - medical costs rise 15% annually!`)
    }

    // 3. Family-size specific tips
    if (familySize === 1) {
      tips.push(`👤 As a single person, you can save aggressively! Aim for 30% savings rate and build a 6-month emergency fund of ₹${(monthlyIncome * 6).toLocaleString('en-IN')}.`)
    } else if (familySize === 2) {
      tips.push(`👫 With 2 members, get health insurance (₹5L family floater) and term insurance. Cost: ~₹1,500/month for comprehensive coverage.`)
    } else if (familySize > 3) {
      const healthCover = familySize * 300000
      tips.push(`👨‍👩‍👧‍👦 With ${familySize} members, prioritize ₹${(healthCover/100000).toFixed(0)}L health insurance and ₹${((monthlyIncome * 120)/100000).toFixed(0)}L term insurance. Don't risk your family's future!`)
    }

    // 4. City-specific optimization tips
    if (city === 'Mumbai' && housingPercentage > 35) {
      tips.push(`🏠 In Mumbai, your housing cost is ${housingPercentage}%! Consider suburbs like Thane/Navi Mumbai to reduce rent by 30-40% without compromising lifestyle.`)
    } else if (city === 'Delhi' || city === 'Bangalore') {
      tips.push(`🚗 In ${city}, use metro/bus instead of cab daily. Switching from Ola/Uber (₹200/day) to metro (₹60/day) saves ₹4,200/month = ₹50,400/year!`)
    } else if (city === 'Kolkata' || city === 'Hyderabad') {
      tips.push(`💰 ${city} has lower living costs - use this advantage to save aggressively! Aim for 25% savings rate while maintaining quality of life.`)
    }

    // 5. Income-based tax optimization
    if (monthlyIncome > 50000) {
      const taxSaved = Math.min(46800, monthlyIncome * 3 * 0.312) // 30% tax + cess
      tips.push(`💼 Your income bracket allows tax savings! Invest ₹12,500/month in ELSS + PPF to save up to ₹${Math.round(taxSaved).toLocaleString('en-IN')}/year in taxes under Section 80C.`)
    } else if (monthlyIncome > 25000) {
      tips.push(`📊 Start small: ₹500/month ELSS SIP grows to ₹15+ lakhs in 20 years (12% CAGR) + you save taxes. Every rupee saved is a rupee earned!`)
    }

    // 6. Food expense optimization
    if (foodPercentage > 30) {
      const currentFood = budget.categories?.food_dining?.amount || 0
      const targetFood = monthlyIncome * 0.25
      const savings = currentFood - targetFood
      tips.push(`🍽️ Food expenses are ${foodPercentage}% - reduce eating out from 10 times to 5 times/month. Save ₹${Math.round(savings).toLocaleString('en-IN')}/month by cooking at home!`)
    } else if (foodPercentage < 20 && familySize > 2) {
      tips.push(`🍽️ Your food budget seems tight for ${familySize} members. Ensure nutritious meals - health is wealth! Consider increasing by ₹1,000-2,000/month.`)
    }

    // 7. Emergency fund urgency
    const hasEmergencyFund = false // This should come from actual data
    if (!hasEmergencyFund) {
      const emergencyTarget = monthlyIncome * 6
      const monthlySaving = emergencyTarget / 12
      tips.push(`🆘 Build emergency fund FIRST! Save ₹${Math.round(monthlySaving).toLocaleString('en-IN')}/month for 12 months to create ₹${emergencyTarget.toLocaleString('en-IN')} safety net. Life is unpredictable!`)
    }

    // 8. Automation tip (always useful)
    tips.push(`🤖 Automate your savings! Set up auto-debit on salary day for SIP, insurance, and savings. "Pay yourself first" - what's left is for expenses.`)

    // Return top 5 most relevant tips
    return tips.slice(0, 5)
  }

  /**
   * Generate fallback recommendations in English with enhanced specificity
   */
  generateFallbackRecommendations(userProfile, budget) {
    const { monthlyIncome, familySize, age, city } = userProfile
    const recommendations = []

    console.log('Generating enhanced fallback recommendations for:', { monthlyIncome, age, city, familySize })

    // 1. Emergency fund (Critical priority)
    const emergencyFund = monthlyIncome * 6
    const monthlyEmergencySaving = emergencyFund / 12 // Assuming 1-year goal
    recommendations.push({
      type: 'Emergency Fund',
      amount: emergencyFund,
      description: `Build an emergency fund of ₹${emergencyFund.toLocaleString('en-IN')} (6 months of expenses) in a high-interest savings account or liquid mutual fund. Save ₹${monthlyEmergencySaving.toLocaleString('en-IN')}/month to reach this goal in 12 months.`,
      priority: 'Critical',
      icon: '🛡️',
      timeline: '12 months',
      actionable: `Open a liquid fund account and set up auto-debit of ₹${monthlyEmergencySaving.toLocaleString('en-IN')}`
    })

    // 2. Age-appropriate investment recommendations
    if (age < 30) {
      const sipAmount = Math.round(budget.categories?.savings?.amount * 0.7 || monthlyIncome * 0.15)
      recommendations.push({
        type: 'Aggressive Equity Investment',
        amount: sipAmount,
        description: `At age ${age}, invest ₹${sipAmount.toLocaleString('en-IN')}/month in equity mutual funds through SIP. With 20-25 years of compounding, this could grow to ₹${(sipAmount * 12 * 25 * 2.5).toLocaleString('en-IN')} (assuming 12% CAGR).`,
        priority: 'High',
        icon: '📈',
        timeline: 'Long-term (20+ years)',
        actionable: 'Start SIP in 2-3 large-cap or index funds'
      })
    } else if (age < 40) {
      const sipAmount = Math.round(budget.categories?.savings?.amount * 0.6 || monthlyIncome * 0.12)
      recommendations.push({
        type: 'Balanced Investment Portfolio',
        amount: sipAmount,
        description: `Invest ₹${sipAmount.toLocaleString('en-IN')}/month: 60% in equity mutual funds and 40% in debt instruments for balanced growth with moderate risk.`,
        priority: 'High',
        icon: '📊',
        timeline: 'Medium to Long-term (10-15 years)',
        actionable: 'Diversify across equity and debt mutual funds'
      })
    } else if (age < 50) {
      const conservativeAmount = Math.round(budget.categories?.savings?.amount * 0.5 || monthlyIncome * 0.10)
      recommendations.push({
        type: 'Capital Preservation',
        amount: conservativeAmount,
        description: `Focus on capital preservation: Invest ₹${conservativeAmount.toLocaleString('en-IN')}/month in balanced advantage funds (40% equity, 60% debt) for stable returns.`,
        priority: 'High',
        icon: '💰',
        timeline: 'Medium-term (5-10 years)',
        actionable: 'Shift to conservative hybrid funds'
      })
    } else {
      const retirementAmount = Math.round(budget.categories?.savings?.amount * 0.4 || monthlyIncome * 0.08)
      recommendations.push({
        type: 'Retirement Corpus',
        amount: retirementAmount,
        description: `At age ${age}, focus on retirement planning: Invest ₹${retirementAmount.toLocaleString('en-IN')}/month in senior citizen schemes and debt funds for regular income.`,
        priority: 'Critical',
        icon: '🏖️',
        timeline: 'Short to Medium-term (5 years)',
        actionable: 'Consider Senior Citizens Savings Scheme (SCSS) and debt funds'
      })
    }

    // 3. Insurance recommendations (Family protection)
    const lifeInsuranceCover = monthlyIncome * 120 // 10 years of income
    const termInsurancePremium = Math.round(lifeInsuranceCover / 1000) // Approx ₹1/thousand
    recommendations.push({
      type: 'Term Life Insurance',
      amount: lifeInsuranceCover,
      description: `Get term life insurance coverage of ₹${(lifeInsuranceCover/100000).toFixed(0)} lakhs to protect your ${familySize}-member family. Premium: ~₹${termInsurancePremium.toLocaleString('en-IN')}/month.`,
      priority: 'Critical',
      icon: '🛡️',
      timeline: 'Immediate',
      actionable: `Compare term plans online and buy ₹${(lifeInsuranceCover/100000).toFixed(0)}L cover this week`
    })

    // 4. Health Insurance (Family coverage)
    const healthCover = Math.max(500000, familySize * 300000) // Min 5L, 3L per member
    const healthPremium = Math.round(healthCover / 100) // Approx calculation
    recommendations.push({
      type: 'Health Insurance',
      amount: healthCover,
      description: `Ensure ₹${(healthCover/100000).toFixed(0)} lakhs health insurance for your ${familySize}-member family. Medical inflation is 12-15% annually in ${city}. Premium: ~₹${healthPremium.toLocaleString('en-IN')}/month.`,
      priority: 'High',
      icon: '🏥',
      timeline: 'Immediate',
      actionable: 'Get family floater health insurance with ₹5L+ coverage'
    })

    // 5. Tax-saving recommendations (if income > 50k)
    if (monthlyIncome > 50000) {
      const taxSavingAmount = Math.min(150000, monthlyIncome * 3) // Max 80C limit
      const monthlySaving = Math.round(taxSavingAmount / 12)
      recommendations.push({
        type: 'Tax Optimization (80C)',
        amount: taxSavingAmount,
        description: `Save up to ₹46,800/year in taxes by investing ₹${monthlySaving.toLocaleString('en-IN')}/month in ELSS, PPF, or NPS. Your tax bracket: ${monthlyIncome > 150000 ? '30%' : monthlyIncome > 100000 ? '20%' : '10%'}.`,
        priority: 'High',
        icon: '💰',
        timeline: 'Annual (before March)',
        actionable: `Start ELSS SIP of ₹${monthlySaving.toLocaleString('en-IN')} immediately`
      })
    }

    // 6. City-specific recommendations
    if (city === 'Mumbai' || city === 'Delhi' || city === 'Bangalore') {
      const rentVsEmi = monthlyIncome * 0.35
      recommendations.push({
        type: 'Real Estate Planning',
        amount: Math.round(rentVsEmi * 80), // Approx home loan amount
        description: `In ${city}, consider home loan if rent > ₹${rentVsEmi.toLocaleString('en-IN')}. EMI could be similar to rent with tax benefits under Section 80C and 24(b).`,
        priority: 'Medium',
        icon: '🏠',
        timeline: 'Long-term planning',
        actionable: 'Calculate rent vs EMI with tax benefits'
      })
    }

    console.log('Generated recommendations:', recommendations)
    console.log('Recommendations count:', recommendations.length)
    
    return recommendations
  }

  /**
   * Get category-specific explanations in English
   */
  getCategoryExplanation(categoryKey, categoryData, userProfile) {
    const { familySize, city, monthlyIncome } = userProfile
    
    const explanationTemplates = {
      food_dining: `₹${categoryData.amount.toLocaleString('en-IN')} for food & dining is appropriate for a ${familySize}-member family. This includes home cooking, groceries, and occasional dining out.`,
      
      home_utilities: `₹${categoryData.amount.toLocaleString('en-IN')} for housing and utilities considering the living costs in ${city}. This covers rent/EMI, electricity, water, gas, and maintenance.`,
      
      transportation: `₹${categoryData.amount.toLocaleString('en-IN')} for transportation includes fuel, public transport, maintenance, and occasional cab rides for your daily commute.`,
      
      savings: `₹${categoryData.amount.toLocaleString('en-IN')} (${categoryData.percentage}%) savings rate is ${categoryData.percentage >= 20 ? 'excellent' : categoryData.percentage >= 15 ? 'good' : 'needs improvement'}. Consider investing this amount for long-term wealth building.`,
      
      healthcare: `₹${categoryData.amount.toLocaleString('en-IN')} allocated for healthcare including regular checkups, medicines, and health insurance premiums for your family's well-being.`,
      
      entertainment: `₹${categoryData.amount.toLocaleString('en-IN')} for entertainment and leisure activities helps maintain work-life balance while staying within budget.`,
      
      education: `₹${categoryData.amount.toLocaleString('en-IN')} for education and skill development is an investment in your future earning potential.`,
      
      personal_care: `₹${categoryData.amount.toLocaleString('en-IN')} for personal care, clothing, and grooming expenses to maintain your personal and professional appearance.`,
      
      miscellaneous: `₹${categoryData.amount.toLocaleString('en-IN')} kept aside for unexpected expenses and miscellaneous costs that aren't covered in other categories.`
    }

    return explanationTemplates[categoryKey] || `₹${categoryData.amount.toLocaleString('en-IN')} allocated for ${categoryData.englishName} based on your income and family needs.`
  }

  /**
   * Validate user input for budget generation
   */
  static validateInput(userProfile) {
    const errors = []

    if (!userProfile.monthlyIncome || userProfile.monthlyIncome < 1000) {
      errors.push('Monthly income must be at least ₹1,000')
    }

    if (userProfile.monthlyIncome > 10000000) {
      errors.push('Monthly income seems unusually high. Please verify the amount.')
    }

    if (!userProfile.city || userProfile.city.trim().length < 2) {
      errors.push('Please provide a valid city name')
    }

    if (!userProfile.familySize || userProfile.familySize < 1 || userProfile.familySize > 20) {
      errors.push('Family size must be between 1 and 20')
    }

    if (!userProfile.age || userProfile.age < 18 || userProfile.age > 100) {
      errors.push('Age must be between 18 and 100')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Get budget health score
   */
  getBudgetHealthScore(budget) {
    let score = 0
    const categories = budget.categories

    // Savings rate scoring (40% of total score)
    const savingsRate = categories.savings.percentage
    if (savingsRate >= 20) score += 40
    else if (savingsRate >= 15) score += 30
    else if (savingsRate >= 10) score += 20
    else score += 10

    // Housing cost scoring (25% of total score)
    const housingRate = categories.home_utilities.percentage
    if (housingRate <= 30) score += 25
    else if (housingRate <= 40) score += 20
    else if (housingRate <= 50) score += 15
    else score += 5

    // Food expense scoring (20% of total score)
    const foodRate = categories.food_dining.percentage
    if (foodRate <= 25) score += 20
    else if (foodRate <= 35) score += 15
    else score += 10

    // Emergency fund readiness (15% of total score)
    if (categories.miscellaneous && categories.miscellaneous.percentage >= 5) {
      score += 15
    } else {
      score += 5
    }

    return Math.min(score, 100)
  }
}


// Export singleton instance
export const budgetGenerator = new AIBudgetGenerator()
