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
        }
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
   * Generate AI-powered insights using Gemini API
   */
  async generateAIInsights(userProfile, budget) {
    // For now, use fallback data to ensure stability
    // TODO: Re-enable AI after testing
    console.log('Using fallback explanations and tips for stable operation')
    return {
      explanations: this.generateFallbackExplanations(userProfile, budget),
      tips: this.generateFallbackTips(userProfile, budget),
      recommendations: this.generateFallbackRecommendations(userProfile, budget)
    }

    /* 
    // AI-powered insights - temporarily disabled
    try {
      const prompt = this.createPromptForGemini(userProfile, budget)
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      })

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`)
      }

      const data = await response.json()
      const aiResponse = data.candidates[0]?.content?.parts[0]?.text

      if (!aiResponse) {
        throw new Error('No response from Gemini API')
      }

      // Parse the AI response (expecting JSON)
      let parsedResponse
      try {
        // Clean the response - remove markdown code blocks if present
        const cleanResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        parsedResponse = JSON.parse(cleanResponse)
      } catch (parseError) {
        console.warn('Failed to parse AI response as JSON:', parseError.message)
        console.log('AI Response:', aiResponse)
        throw new Error('Invalid JSON response from AI')
      }
      
      return {
        explanations: parsedResponse.explanations || this.generateFallbackExplanations(userProfile, budget),
        tips: parsedResponse.tips || this.generateFallbackTips(userProfile, budget),
        recommendations: parsedResponse.recommendations || this.generateFallbackRecommendations(userProfile, budget)
      }
    } catch (error) {
      console.error('AI insights generation failed:', error)
      // Fallback to traditional explanations
      return {
        explanations: this.generateFallbackExplanations(userProfile, budget),
        tips: this.generateFallbackTips(userProfile, budget),
        recommendations: this.generateFallbackRecommendations(userProfile, budget)
      }
    }
    */
  }

  /**
   * Create prompt for Gemini AI
   */
  createPromptForGemini(userProfile, budget) {
    const { monthlyIncome, city, familySize, age, occupation } = userProfile
    
    return `You are a financial advisor AI. Generate personalized budget insights for an Indian user with the following profile:

Profile:
- Monthly Income: ₹${monthlyIncome.toLocaleString('en-IN')}
- City: ${city}
- Family Size: ${familySize} members
- Age: ${age} years
- Occupation: ${occupation || 'Not specified'}

Current Budget Allocation:
${Object.entries(budget.categories).map(([key, cat]) => 
  `- ${cat.englishName}: ₹${cat.amount.toLocaleString('en-IN')} (${cat.percentage}%)`
).join('\n')}

Please provide a JSON response with:
1. "explanations" object with category-wise explanations for each budget category
2. "tips" array with 3-5 practical financial tips specific to this user
3. "recommendations" array with 3-4 specific investment or saving recommendations

Requirements:
- Use clear, professional English
- Be specific to Indian financial context
- Consider city costs, family size, and age
- Include emoji icons for visual appeal
- Keep explanations concise but informative
- Focus on actionable advice

Return only valid JSON format.`
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
    Object.entries(budget.categories).forEach(([categoryKey, categoryData]) => {
      explanations.categories[categoryKey] = this.getCategoryExplanation(categoryKey, categoryData, userProfile)
    })

    return explanations
  }

  /**
   * Generate fallback tips in English
   */
  generateFallbackTips(userProfile, budget) {
    const { monthlyIncome, familySize, age } = userProfile
    const savingsPercentage = budget.categories.savings.percentage
    const tips = []

    // Savings tips
    if (savingsPercentage < 15) {
      tips.push('💰 Try to increase your savings to at least 15% of your income for better financial security.')
    } else if (savingsPercentage >= 20) {
      tips.push('🎉 Excellent savings rate! Consider diversifying your investments for better returns.')
    }

    // Age-specific tips
    if (age < 30) {
      tips.push('🚀 Your age is perfect for aggressive investing. Consider equity mutual funds and SIPs for long-term wealth building.')
    } else if (age >= 50) {
      tips.push('🛡️ Focus on capital preservation. Consider increasing your debt allocation and ensure adequate health insurance.')
    }

    // Family size tips
    if (familySize > 3) {
      tips.push('👨‍👩‍👧‍👦 With a larger family, prioritize comprehensive health insurance and term life insurance.')
    }

    // Income-based tips
    if (monthlyIncome > 50000) {
      tips.push('💼 Your income allows for tax optimization. Consider ELSS funds, PPF, and other tax-saving instruments.')
    }

    // General tip
    tips.push('📊 Review and adjust your budget monthly to stay on track with your financial goals.')

    return tips
  }

  /**
   * Generate fallback recommendations in English
   */
  generateFallbackRecommendations(userProfile, budget) {
    const { monthlyIncome, age } = userProfile
    const recommendations = []

    console.log('Generating fallback recommendations for:', { monthlyIncome, age })

    // Emergency fund
    const emergencyFund = monthlyIncome * 6
    recommendations.push({
      type: 'Emergency Fund',
      amount: emergencyFund,
      description: `Build an emergency fund of ₹${emergencyFund.toLocaleString('en-IN')} (6 months of expenses) in a liquid savings account.`,
      priority: 'High',
      icon: '🛡️'
    })

    // Investment recommendations based on age
    if (age < 40) {
      recommendations.push({
        type: 'Equity Investment',
        amount: Math.round(budget.categories.savings.amount * 0.7),
        description: 'Invest 70% of your savings in equity mutual funds through SIP for long-term growth.',
        priority: 'High',
        icon: '📈'
      })
    }

    // Insurance
    const lifeInsurance = monthlyIncome * 120 // 10 years of income
    recommendations.push({
      type: 'Term Insurance',
      amount: lifeInsurance,
      description: `Get term life insurance coverage of ₹${(lifeInsurance/100000).toFixed(0)} lakhs to protect your family.`,
      priority: 'Critical',
      icon: '🛡️'
    })

    console.log('Generated recommendations:', recommendations)
    console.log('Recommendations is array:', Array.isArray(recommendations))
    
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
