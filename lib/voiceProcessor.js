// Voice Processing for Hindi, Hinglish, and English Expense Entry
// lib/voiceProcessor.js
import { GoogleGenerativeAI } from '@google/generative-ai'

export class VoiceExpenseProcessor {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    // Enhanced financial terms dictionary for better recognition
    this.financialTerms = {
      hindi: ['रुपए', 'रुपये', 'खर्च', 'खरीदा', 'पैसे', 'लिया', 'दिया', 'भुगतान', 'दे दिया', 'खर्चे'],
      english: ['rupees', 'spent', 'bought', 'paid', 'cost', 'money', 'expense', 'rs', 'inr'],

      // Action verbs that indicate consumption/purchase
      actionVerbs: {
        food: ['खाया', 'खाई', 'खा', 'पिया', 'पी', 'खरीदा', 'मंगाया', 'ate', 'eat', 'drink', 'had', 'ordered'],
        transport: ['गया', 'आया', 'लिया', 'बुक', 'booked', 'took', 'traveled', 'ride'],
        shopping: ['खरीदा', 'लिया', 'bought', 'purchased', 'buy'],
        entertainment: ['देखा', 'देखी', 'खेला', 'watched', 'played', 'saw'],
        healthcare: ['लिया', 'खरीदा', 'bought', 'consulted', 'visited'],
        utilities: ['भरा', 'paid', 'recharged', 'recharge']
      },

      merchants: ['swiggy', 'zomato', 'uber', 'ola', 'amazon', 'flipkart', 'paytm', 'blinkit', 'zepto', 'dunzo', 'rapido'],

      // Comprehensive category keywords (expanded for Indian context)
      categories: {
        food: [
          // General food terms
          'खाना', 'खाने', 'भोजन', 'food', 'lunch', 'breakfast', 'dinner', 'snack', 'snacks',
          // Drinks
          'चाय', 'tea', 'coffee', 'कॉफी', 'chai', 'juice', 'जूस', 'lassi', 'लस्सी', 'milk', 'दूध',
          // Indian dishes
          'dosa', 'डोसा', 'idli', 'इडली', 'vada', 'वड़ा', 'biryani', 'बिरयानी',
          'paratha', 'पराठा', 'roti', 'रोटी', 'naan', 'नान', 'rice', 'चावल',
          'dal', 'दाल', 'curry', 'करी', 'sabzi', 'सब्जी', 'samosa', 'समोसा',
          'pakora', 'पकोड़ा', 'chaat', 'चाट', 'pav', 'bhaji', 'वड़ा पाव',
          // Meals
          'thali', 'थाली', 'combo', 'meal', 'मील',
          // Restaurant/Delivery
          'restaurant', 'रेस्टोरेंट', 'cafe', 'कैफे', 'dhaba', 'ढाबा',
          'order', 'ऑर्डर', 'delivery', 'डिलीवरी', 'takeaway', 'टेकअवे'
        ],
        transport: [
          'metro', 'मेट्रो', 'bus', 'बस', 'auto', 'ऑटो', 'rickshaw', 'रिक्शा',
          'uber', 'ola', 'taxi', 'टैक्सी', 'cab', 'कैब',
          'petrol', 'पेट्रोल', 'diesel', 'डीजल', 'fuel', 'फ्यूल',
          'parking', 'पार्किंग', 'toll', 'टोल',
          'train', 'ट्रेन', 'flight', 'फ्लाइट', 'ticket', 'टिकट',
          'यातायात', 'travel', 'trip', 'ride', 'रेप', 'rapido', 'bike'
        ],
        entertainment: [
          'movie', 'मूवी', 'cinema', 'सिनेमा', 'film', 'फिल्म', 'show', 'शो',
          'gaming', 'game', 'गेम', 'मनोरंजन', 'entertainment',
          'netflix', 'amazon prime', 'hotstar', 'ott', 'subscription',
          'concert', 'event', 'इवेंट', 'party', 'पार्टी',
          'sports', 'स्पोर्ट्स', 'gym', 'जिम', 'membership'
        ],
        shopping: [
          'कपड़े', 'clothes', 'shirt', 'शर्ट', 'pant', 'pants', 'jeans',
          'shoes', 'जूते', 'chappal', 'चप्पल', 'sandal',
          'shopping', 'शॉपिंग', 'mall', 'मॉल', 'market', 'मार्केट',
          'amazon', 'flipkart', 'myntra', 'ajio',
          'dress', 'ड्रेस', 'saree', 'साड़ी', 'kurta', 'कुर्ता',
          'watch', 'घड़ी', 'bag', 'बैग', 'wallet', 'वॉलेट',
          'electronics', 'mobile', 'मोबाइल', 'phone', 'laptop', 'लैपटॉप'
        ],
        healthcare: [
          'medicine', 'दवाई', 'दवा', 'tablet', 'टैबलेट',
          'doctor', 'डॉक्टर', 'hospital', 'हॉस्पिटल', 'clinic', 'क्लिनिक',
          'pharmacy', 'medical', 'मेडिकल', 'checkup', 'चेकअप',
          'test', 'टेस्ट', 'lab', 'लैब', 'xray', 'scan', 'स्कैन',
          'health', 'स्वास्थ्य', 'treatment', 'इलाज', 'consultation'
        ],
        utilities: [
          'बिजली', 'electricity', 'bijli', 'power', 'पावर',
          'water', 'पानी', 'gas', 'गैस', 'cylinder', 'सिलेंडर',
          'internet', 'इंटरनेट', 'wifi', 'broadband',
          'mobile', 'मोबाइल', 'recharge', 'रिचार्ज',
          'bill', 'बिल', 'rent', 'किराया', 'maintenance'
        ]
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

  // AI-powered extraction for complex cases with enhanced prompts
  async extractWithAI(text) {
    try {
      const prompt = `
You are an expert expense categorizer for Indian users. Extract expense information from this Hindi/Hinglish/English text: "${text}"

IMPORTANT CONTEXT:
- Users often mix Hindi, English, and Hinglish (e.g., "200 ka dosa khaya", "metro me 45 spend kiya")
- Action verbs are key indicators: खाया/ate (food), गया/went (transport), खरीदा/bought (shopping)
- Indian food items: dosa, idli, chai, biryani, paratha, samosa, etc. → ALWAYS categorize as "food"
- Common patterns: "[amount] ka [item] [action]" or "[action] [item] for [amount]"

CATEGORIZATION RULES (STRICTLY FOLLOW):
1. food: Any edible item, drinks, restaurants, food delivery (swiggy, zomato), meals, snacks
   - Keywords: खाना, dosa, idli, chai, coffee, lunch, dinner, breakfast, restaurant, cafe
   - Actions: खाया, खाई, पिया, मंगाया, ordered, ate, had, drink

2. transport: Travel, commute, fuel, parking, ride services
   - Keywords: metro, bus, auto, uber, ola, petrol, taxi, train, flight
   - Actions: गया, आया, traveled, booked, ride

3. shopping: Clothes, accessories, electronics, online shopping
   - Keywords: कपड़े, shoes, amazon, flipkart, mall, clothes, mobile, laptop
   - Actions: खरीदा, bought, purchased, shopping

4. entertainment: Movies, games, OTT, events, gym, sports
   - Keywords: movie, cinema, game, netflix, gym, party, concert
   - Actions: देखा, watched, played, enjoyed

5. healthcare: Medicine, doctor, hospital, medical tests
   - Keywords: दवाई, medicine, doctor, hospital, pharmacy, test, checkup
   - Actions: लिया, consulted, visited, checkup

6. utilities: Bills, electricity, water, internet, rent
   - Keywords: बिजली, electricity, water, gas, internet, rent, bill, recharge
   - Actions: भरा, paid, recharged

EXAMPLES (LEARN FROM THESE):
✓ "200 ka dosa khaya" → {"amount": 200, "category": "food", "merchant": null, "description": "Dosa", "confidence": 0.95}
✓ "आज पचास रुपए चाय पी" → {"amount": 50, "category": "food", "merchant": null, "description": "Tea", "confidence": 0.95}
✓ "Metro में ₹45 spend kiya" → {"amount": 45, "category": "transport", "merchant": "Metro", "description": "Metro travel", "confidence": 0.9}
✓ "Swiggy से biryani order kiya 350 ka" → {"amount": 350, "category": "food", "merchant": "Swiggy", "description": "Biryani order from Swiggy", "confidence": 0.95}
✓ "ola me ghar gaya 120 rupees" → {"amount": 120, "category": "transport", "merchant": "Ola", "description": "Ola ride home", "confidence": 0.9}
✓ "50 rupees ka samosa khaya" → {"amount": 50, "category": "food", "merchant": null, "description": "Samosa", "confidence": 0.95}

Return ONLY a valid JSON object (no markdown, no extra text):
{
  "amount": number (extracted amount in rupees),
  "category": "food" | "transport" | "entertainment" | "shopping" | "healthcare" | "utilities" | "other",
  "merchant": string or null (swiggy, zomato, uber, ola, etc.),
  "description": string (clean English description of expense),
  "confidence": number (0.7-1.0, higher if clear category match)
}
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

      // Validate and normalize category
      const validCategories = ['food', 'transport', 'entertainment', 'shopping', 'healthcare', 'utilities', 'other']
      if (!validCategories.includes(extracted.category)) {
        extracted.category = 'other'
      }

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

  // Enhanced category detection with action verb analysis and scoring
  detectCategory(text) {
    const normalizedText = text.toLowerCase()
    const categoryScores = {}

    // Initialize scores
    for (const category of Object.keys(this.financialTerms.categories)) {
      categoryScores[category] = 0
    }

    // Score based on keywords (weight: 1.0)
    for (const [category, keywords] of Object.entries(this.financialTerms.categories)) {
      for (const keyword of keywords) {
        if (normalizedText.includes(keyword.toLowerCase())) {
          categoryScores[category] += 1.0
        }
      }
    }

    // Score based on action verbs (weight: 1.5 - stronger signal)
    for (const [category, verbs] of Object.entries(this.financialTerms.actionVerbs)) {
      for (const verb of verbs) {
        if (normalizedText.includes(verb.toLowerCase())) {
          categoryScores[category] += 1.5
        }
      }
    }

    // Compound word detection (e.g., "dosa khaya" = food + food action)
    // This gives extra weight to phrase combinations
    const words = normalizedText.split(/\s+/)
    for (let i = 0; i < words.length - 1; i++) {
      const bigram = `${words[i]} ${words[i + 1]}`

      // Check if bigram contains both a category keyword and action verb
      for (const [category, keywords] of Object.entries(this.financialTerms.categories)) {
        const hasKeyword = keywords.some(k => bigram.includes(k.toLowerCase()))
        const hasAction = this.financialTerms.actionVerbs[category]?.some(v =>
          bigram.includes(v.toLowerCase())
        )

        if (hasKeyword && hasAction) {
          categoryScores[category] += 2.0 // Strong signal
        }
      }
    }

    // Context-aware scoring (time-based hints)
    const hour = new Date().getHours()
    if (hour >= 7 && hour <= 10) {
      // Breakfast time - boost food score
      categoryScores.food += 0.3
    } else if (hour >= 12 && hour <= 14) {
      // Lunch time - boost food score
      categoryScores.food += 0.3
    } else if (hour >= 19 && hour <= 22) {
      // Dinner time - boost food score
      categoryScores.food += 0.3
    }

    // Find category with highest score
    let maxScore = 0
    let bestCategory = 'other'

    for (const [category, score] of Object.entries(categoryScores)) {
      if (score > maxScore) {
        maxScore = score
        bestCategory = category
      }
    }

    // Return best category if score is above threshold, otherwise 'other'
    return maxScore >= 0.5 ? bestCategory : 'other'
  }

  // Fuzzy matching for similar words (handles typos and variations)
  fuzzyMatch(word, targetWords, threshold = 0.7) {
    word = word.toLowerCase()

    for (const target of targetWords) {
      const targetLower = target.toLowerCase()
      const similarity = this.calculateSimilarity(word, targetLower)

      if (similarity >= threshold) {
        return target
      }
    }
    return null
  }

  // Calculate string similarity (Levenshtein-based)
  calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1

    if (longer.length === 0) return 1.0

    const editDistance = this.levenshteinDistance(longer, shorter)
    return (longer.length - editDistance) / longer.length
  }

  // Levenshtein distance algorithm
  levenshteinDistance(str1, str2) {
    const matrix = []

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }

    return matrix[str2.length][str1.length]
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
