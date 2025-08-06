// Voice Processing for Hindi, Hinglish, and English Expense Entry
import { GoogleGenerativeAI } from '@google/generative-ai'

export class VoiceExpenseProcessor {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    
    // Financial terms dictionary for better recognition
    this.financialTerms = {
      hindi: ['रुपए', 'रुपये', 'खर्च', 'खरीदा', 'पैसे', 'लिया', 'दिया', 'भुगतान'],
      english: ['rupees', 'spent', 'bought', 'paid', 'cost', 'money', 'expense'],
      merchants: ['swiggy', 'zomato', 'uber', 'ola', 'amazon', 'flipkart', 'paytm'],
      categories: {
        food: ['खाना', 'चाय', 'coffee', 'lunch', 'dinner', 'breakfast', 'dosa', 'biryani'],
        transport: ['metro', 'bus', 'uber', 'ola', 'petrol', 'diesel', 'यातायात'],
        entertainment: ['movie', 'gaming', 'मनोरंजन', 'cinema', 'game'],
        shopping: ['कपड़े', 'shoes', 'shopping', 'clothes'],
        healthcare: ['medicine', 'doctor', 'दवाई', 'hospital'],
        utilities: ['बिजली', 'electricity', 'water', 'internet', 'mobile']
      }
    }
  }

  // Process voice input and extract expense data
  async processVoiceInput(voiceText) {
    try {
      console.log('Processing voice input:', voiceText)
      
      // First try rule-based extraction for common patterns
      const ruleBasedResult = this.extractWithRules(voiceText)
      if (ruleBasedResult.confidence > 0.8) {
        return ruleBasedResult
      }

      // Fallback to AI processing for complex cases
      return await this.extractWithAI(voiceText)
      
    } catch (error) {
      console.error('Voice processing error:', error)
      return {
        success: false,
        error: 'Failed to process voice input',
        confidence: 0
      }
    }
  }

  // Rule-based extraction for common patterns
  extractWithRules(text) {
    const normalizedText = text.toLowerCase()
    
    // Amount extraction patterns
    const amountPatterns = [
      /(?:₹|rs\.?|rupees?)\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
      /(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:₹|rs\.?|rupees?|रुपए|रुपये)/i,
      /(\d+)\s*(?:का|की|के|spend|खर्च)/i
    ]

    let amount = null
    for (const pattern of amountPatterns) {
      const match = text.match(pattern)
      if (match) {
        amount = parseFloat(match[1].replace(/,/g, ''))
        break
      }
    }

    if (!amount) {
      return { success: false, confidence: 0, error: 'No amount found' }
    }

    // Category detection
    const category = this.detectCategory(normalizedText)
    
    // Merchant detection
    const merchant = this.detectMerchant(normalizedText)

    return {
      success: true,
      confidence: 0.9,
      data: {
        amount: amount,
        category: category || 'other',
        merchant: merchant || null,
        description: text.trim(),
        originalText: text,
        method: 'rule-based'
      }
    }
  }

  // AI-powered extraction for complex cases
  async extractWithAI(text) {
    try {
      const prompt = `
Extract expense information from this Hindi/Hinglish/English text: "${text}"

Return ONLY a JSON object with these fields:
{
  "amount": number (in rupees),
  "category": "food" | "transport" | "entertainment" | "shopping" | "healthcare" | "utilities" | "other",
  "merchant": string or null,
  "description": string (clean version),
  "confidence": number (0-1)
}

Categories mapping:
- food: खाना, चाय, coffee, lunch, dinner, dosa, restaurants
- transport: metro, bus, uber, ola, petrol, यातायात  
- entertainment: movie, gaming, मनोरंजन, cinema
- shopping: कपड़े, shoes, shopping, clothes, amazon, flipkart
- healthcare: medicine, doctor, दवाई, hospital
- utilities: बिजली, electricity, water, internet, mobile bill

Examples:
"आज पचास रुपए चाय पी" → {"amount": 50, "category": "food", "merchant": null, "description": "Tea", "confidence": 0.95}
"Metro में ₹45 spend kiya" → {"amount": 45, "category": "transport", "merchant": "Metro", "description": "Metro travel", "confidence": 0.9}
"Swiggy से ₹180 का order" → {"amount": 180, "category": "food", "merchant": "Swiggy", "description": "Food order from Swiggy", "confidence": 0.95}
`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const aiText = response.text()
      
      // Extract JSON from AI response
      const jsonMatch = aiText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response')
      }

      const extracted = JSON.parse(jsonMatch[0])
      
      return {
        success: true,
        confidence: extracted.confidence || 0.7,
        data: {
          amount: extracted.amount,
          category: extracted.category,
          merchant: extracted.merchant,
          description: extracted.description,
          originalText: text,
          method: 'ai-powered'
        }
      }

    } catch (error) {
      console.error('AI extraction error:', error)
      return {
        success: false,
        confidence: 0,
        error: 'AI processing failed'
      }
    }
  }

  // Detect category from text
  detectCategory(text) {
    for (const [category, keywords] of Object.entries(this.financialTerms.categories)) {
      for (const keyword of keywords) {
        if (text.includes(keyword.toLowerCase())) {
          return category
        }
      }
    }
    return 'other'
  }

  // Detect merchant from text
  detectMerchant(text) {
    for (const merchant of this.financialTerms.merchants) {
      if (text.includes(merchant.toLowerCase())) {
        return merchant.charAt(0).toUpperCase() + merchant.slice(1)
      }
    }
    return null
  }

  // Validate extracted data
  validateExpenseData(data) {
    const errors = []
    
    if (!data.amount || data.amount <= 0) {
      errors.push('Invalid amount')
    }
    
    if (data.amount > 100000) {
      errors.push('Amount seems too high')
    }
    
    if (!data.category) {
      errors.push('Category not detected')
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    }
  }

  // Get category display info
  getCategoryInfo(category) {
    const categoryMap = {
      food: { emoji: '🍽️', englishName: 'Food & Dining', hindiName: 'खाना-पीना' },
      transport: { emoji: '🚗', englishName: 'Transportation', hindiName: 'यातायात' },
      entertainment: { emoji: '🎬', englishName: 'Entertainment', hindiName: 'मनोरंजन' },
      shopping: { emoji: '👕', englishName: 'Shopping', hindiName: 'कपड़े-लत्ते' },
      healthcare: { emoji: '💊', englishName: 'Healthcare', hindiName: 'दवाई-इलाज' },
      utilities: { emoji: '🏠', englishName: 'Home & Utilities', hindiName: 'घर का खर्च' },
      other: { emoji: '💳', englishName: 'Other', hindiName: 'अन्य' }
    }
    
    return categoryMap[category] || categoryMap.other
  }
}

// Singleton instance
export const voiceProcessor = new VoiceExpenseProcessor()
