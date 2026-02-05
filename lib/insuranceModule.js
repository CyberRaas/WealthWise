/**
 * Insurance Awareness Module
 * Educational content and interactive learning about insurance
 * 
 * Covers: Life, Health, Vehicle, Home insurance
 * For NCFE "Rule of Three" compliance
 */

// ============================================
// INSURANCE TYPES
// ============================================

export const INSURANCE_TYPES = {
  life: {
    id: 'life',
    name: 'Life Insurance',
    nameHindi: 'जीवन बीमा',
    icon: '❤️',
    color: 'red',
    description: 'Protects your family financially if something happens to you',
    descriptionHindi: 'अगर आपको कुछ हो जाए तो परिवार की आर्थिक सुरक्षा',
    keyPoints: [
      'Essential if you have dependents (spouse, children, parents)',
      'Term insurance = Pure protection, low cost, high cover',
      'Endowment/ULIP = Insurance + Investment, expensive, low returns',
      'Buy early - premiums increase with age'
    ],
    keyPointsHindi: [
      'जरूरी अगर आप पर कोई निर्भर है (पति/पत्नी, बच्चे, माता-पिता)',
      'टर्म इंश्योरेंस = शुद्ध सुरक्षा, कम लागत, ज्यादा कवर',
      'एंडोमेंट/ULIP = बीमा + निवेश, महंगा, कम रिटर्न',
      'जल्दी लें - उम्र बढ़ने पर प्रीमियम बढ़ता है'
    ],
    recommendedCover: '10-15 times annual income',
    avgPremium: '₹500-1000/month for ₹1 Cr cover at age 25'
  },
  health: {
    id: 'health',
    name: 'Health Insurance',
    nameHindi: 'स्वास्थ्य बीमा',
    icon: '🏥',
    color: 'green',
    description: 'Covers medical expenses - hospitalization, surgeries, treatments',
    descriptionHindi: 'चिकित्सा खर्च कवर - अस्पताल, सर्जरी, इलाज',
    keyPoints: [
      'Medical inflation is 10-15% annually in India',
      'Basic surgery can cost ₹2-5 lakhs',
      'Family floater covers entire family under one policy',
      'Pre-existing diseases covered after waiting period (2-4 years)'
    ],
    keyPointsHindi: [
      'भारत में मेडिकल महंगाई 10-15% सालाना',
      'साधारण सर्जरी भी ₹2-5 लाख की हो सकती है',
      'फैमिली फ्लोटर एक पॉलिसी में पूरे परिवार को कवर',
      'पुरानी बीमारियां वेटिंग पीरियड (2-4 साल) के बाद कवर'
    ],
    recommendedCover: 'Minimum ₹5 lakh individual, ₹10-15 lakh family',
    avgPremium: '₹400-800/month for ₹5 lakh cover'
  },
  vehicle: {
    id: 'vehicle',
    name: 'Vehicle Insurance',
    nameHindi: 'वाहन बीमा',
    icon: '🚗',
    color: 'blue',
    description: 'Mandatory for all vehicles - covers accidents, theft, third-party damage',
    descriptionHindi: 'सभी वाहनों के लिए अनिवार्य - दुर्घटना, चोरी, थर्ड-पार्टी',
    keyPoints: [
      'Third-party insurance is legally mandatory',
      'Comprehensive covers your vehicle + third party',
      'Own Damage (OD) covers damage to your vehicle',
      'No-claim bonus (NCB) reduces premium if no claims'
    ],
    keyPointsHindi: [
      'थर्ड-पार्टी बीमा कानूनी रूप से अनिवार्य',
      'कॉम्प्रिहेंसिव आपकी गाड़ी + थर्ड पार्टी दोनों कवर',
      'ओन डैमेज (OD) आपकी गाड़ी का नुकसान कवर',
      'नो-क्लेम बोनस (NCB) - कोई क्लेम नहीं तो प्रीमियम कम'
    ],
    recommendedCover: 'Comprehensive for new vehicles, Third-party for old',
    avgPremium: '₹3,000-8,000/year for car comprehensive'
  },
  home: {
    id: 'home',
    name: 'Home Insurance',
    nameHindi: 'घर का बीमा',
    icon: '🏠',
    color: 'orange',
    description: 'Protects your home and belongings from fire, theft, natural disasters',
    descriptionHindi: 'आग, चोरी, प्राकृतिक आपदाओं से घर और सामान की सुरक्षा',
    keyPoints: [
      'Covers building structure + contents (furniture, electronics)',
      'Natural disasters: earthquake, flood, storm',
      'Theft and burglary protection',
      'Especially important if you have a home loan'
    ],
    keyPointsHindi: [
      'बिल्डिंग संरचना + सामान (फर्नीचर, इलेक्ट्रॉनिक्स) कवर',
      'प्राकृतिक आपदाएं: भूकंप, बाढ़, तूफान',
      'चोरी और सेंधमारी से सुरक्षा',
      'खासकर जरूरी अगर होम लोन है'
    ],
    recommendedCover: 'Full replacement value of home + contents',
    avgPremium: '₹1,000-5,000/year depending on coverage'
  }
}

// ============================================
// INSURANCE QUIZ QUESTIONS
// ============================================

export const INSURANCE_QUIZ = [
  {
    id: 'q1',
    category: 'life',
    difficulty: 'easy',
    question: 'Which type of life insurance gives MAXIMUM coverage at MINIMUM cost?',
    questionHindi: 'कौन सा जीवन बीमा न्यूनतम लागत पर अधिकतम कवरेज देता है?',
    options: [
      { id: 'a', text: 'Endowment Plan', isCorrect: false },
      { id: 'b', text: 'Term Insurance', isCorrect: true },
      { id: 'c', text: 'ULIP', isCorrect: false },
      { id: 'd', text: 'Money Back Policy', isCorrect: false }
    ],
    explanation: 'Term insurance is pure protection - no investment component. Hence, you get high cover (₹1 Cr+) at low cost (₹8,000-12,000/year for a 25-year-old).',
    explanationHindi: 'टर्म इंश्योरेंस शुद्ध सुरक्षा है - कोई निवेश नहीं। इसलिए कम खर्च (₹8,000-12,000/वर्ष) में ज्यादा कवर (₹1 करोड़+)।',
    xpReward: 15
  },
  {
    id: 'q2',
    category: 'life',
    difficulty: 'medium',
    question: 'You\'re 30 years old with a spouse and child. What\'s the ideal life insurance cover?',
    questionHindi: 'आप 30 साल के हैं, पत्नी और बच्चा है। आदर्श जीवन बीमा कवर क्या है?',
    options: [
      { id: 'a', text: '₹10 lakhs', isCorrect: false },
      { id: 'b', text: '₹50 lakhs', isCorrect: false },
      { id: 'c', text: '10-15 times annual income', isCorrect: true },
      { id: 'd', text: 'Equal to home loan amount', isCorrect: false }
    ],
    explanation: 'Rule of thumb: 10-15 times your annual income. If you earn ₹6 lakhs/year, cover should be ₹60-90 lakhs. This ensures your family can maintain their lifestyle.',
    explanationHindi: 'अंगूठे का नियम: वार्षिक आय का 10-15 गुना। अगर ₹6 लाख/वर्ष कमाते हैं, तो कवर ₹60-90 लाख होना चाहिए।',
    xpReward: 20
  },
  {
    id: 'q3',
    category: 'health',
    difficulty: 'easy',
    question: 'What does "Family Floater" health insurance mean?',
    questionHindi: '"फैमिली फ्लोटर" स्वास्थ्य बीमा का क्या मतलब है?',
    options: [
      { id: 'a', text: 'Insurance that floats on water', isCorrect: false },
      { id: 'b', text: 'One policy covering entire family with shared sum insured', isCorrect: true },
      { id: 'c', text: 'Insurance for families living abroad', isCorrect: false },
      { id: 'd', text: 'Free insurance from government', isCorrect: false }
    ],
    explanation: 'Family floater covers all family members (self, spouse, children, sometimes parents) under one policy. The sum insured is shared, e.g., ₹10 lakh can be used by any family member.',
    explanationHindi: 'फैमिली फ्लोटर एक पॉलिसी में सभी सदस्यों को कवर करता है। बीमा राशि साझा है, जैसे ₹10 लाख कोई भी सदस्य इस्तेमाल कर सकता है।',
    xpReward: 15
  },
  {
    id: 'q4',
    category: 'health',
    difficulty: 'medium',
    question: 'What is "Pre-existing Disease" waiting period in health insurance?',
    questionHindi: 'स्वास्थ्य बीमा में "पहले से मौजूद बीमारी" का वेटिंग पीरियड क्या है?',
    options: [
      { id: 'a', text: 'Time to wait before policy starts', isCorrect: false },
      { id: 'b', text: 'Period during which existing conditions are not covered', isCorrect: true },
      { id: 'c', text: 'Time to process your claim', isCorrect: false },
      { id: 'd', text: 'Doctor\'s waiting room time', isCorrect: false }
    ],
    explanation: 'If you have diabetes or BP before buying insurance, claims for these won\'t be covered for 2-4 years (waiting period). After that, they\'re covered. Always disclose pre-existing conditions!',
    explanationHindi: 'अगर बीमा खरीदने से पहले डायबिटीज या BP है, तो 2-4 साल तक इनके क्लेम कवर नहीं होंगे। उसके बाद कवर होंगे।',
    xpReward: 20
  },
  {
    id: 'q5',
    category: 'vehicle',
    difficulty: 'easy',
    question: 'Which vehicle insurance is LEGALLY MANDATORY in India?',
    questionHindi: 'भारत में कौन सा वाहन बीमा कानूनी रूप से अनिवार्य है?',
    options: [
      { id: 'a', text: 'Comprehensive Insurance', isCorrect: false },
      { id: 'b', text: 'Own Damage Insurance', isCorrect: false },
      { id: 'c', text: 'Third-Party Insurance', isCorrect: true },
      { id: 'd', text: 'Zero Depreciation Insurance', isCorrect: false }
    ],
    explanation: 'Under Motor Vehicles Act, third-party insurance is mandatory. It covers damage you cause to others (people, property, vehicles). Driving without it is illegal!',
    explanationHindi: 'मोटर वाहन अधिनियम के तहत थर्ड-पार्टी बीमा अनिवार्य है। यह दूसरों को हुए नुकसान को कवर करता है। बिना इसके गाड़ी चलाना गैरकानूनी!',
    xpReward: 15
  },
  {
    id: 'q6',
    category: 'vehicle',
    difficulty: 'medium',
    question: 'What is NCB (No Claim Bonus) in vehicle insurance?',
    questionHindi: 'वाहन बीमा में NCB (नो क्लेम बोनस) क्या है?',
    options: [
      { id: 'a', text: 'Bonus paid when you make a claim', isCorrect: false },
      { id: 'b', text: 'Discount on premium for not making claims', isCorrect: true },
      { id: 'c', text: 'Extra coverage for safe drivers', isCorrect: false },
      { id: 'd', text: 'Government rebate on insurance', isCorrect: false }
    ],
    explanation: 'If you don\'t make any claim for a year, you get NCB - discount on next year\'s premium. It accumulates: 20% (1st year) to 50% (5 years). NCB can be transferred to a new vehicle!',
    explanationHindi: 'अगर साल भर कोई क्लेम नहीं किया, तो NCB मिलता है - अगले साल के प्रीमियम पर छूट। 20% (पहला साल) से 50% (5 साल) तक। NCB नई गाड़ी में ट्रांसफर हो सकता है!',
    xpReward: 20
  },
  {
    id: 'q7',
    category: 'general',
    difficulty: 'medium',
    question: 'What should you do FIRST when buying any insurance?',
    questionHindi: 'कोई भी बीमा खरीदते समय सबसे पहले क्या करें?',
    options: [
      { id: 'a', text: 'Go with the cheapest option', isCorrect: false },
      { id: 'b', text: 'Trust the agent\'s recommendation', isCorrect: false },
      { id: 'c', text: 'Read the policy document and exclusions carefully', isCorrect: true },
      { id: 'd', text: 'Buy the most expensive plan', isCorrect: false }
    ],
    explanation: 'Always read what\'s covered AND what\'s NOT covered (exclusions). Many claims get rejected because of exclusions people didn\'t know about. Ask questions before signing!',
    explanationHindi: 'हमेशा पढ़ें कि क्या कवर है और क्या नहीं (एक्सक्लूजन)। कई क्लेम एक्सक्लूजन की वजह से रिजेक्ट होते हैं। साइन करने से पहले सवाल पूछें!',
    xpReward: 25
  },
  {
    id: 'q8',
    category: 'life',
    difficulty: 'hard',
    question: 'Why is ULIP often NOT recommended by financial advisors?',
    questionHindi: 'ULIP को अक्सर वित्तीय सलाहकार क्यों नहीं सुझाते?',
    options: [
      { id: 'a', text: 'It\'s illegal', isCorrect: false },
      { id: 'b', text: 'High charges, low insurance cover, poor returns compared to mutual funds', isCorrect: true },
      { id: 'c', text: 'It doesn\'t provide any insurance', isCorrect: false },
      { id: 'd', text: 'Only for rich people', isCorrect: false }
    ],
    explanation: 'ULIP mixes insurance + investment but does neither well. High charges (allocation, fund management, mortality) eat into returns. Better: Buy term insurance + invest in mutual funds separately.',
    explanationHindi: 'ULIP बीमा + निवेश मिलाता है लेकिन कोई भी ठीक से नहीं करता। ज्यादा चार्जेस रिटर्न खा जाते हैं। बेहतर: टर्म बीमा + म्यूचुअल फंड अलग से।',
    xpReward: 30
  },
  {
    id: 'q9',
    category: 'health',
    difficulty: 'hard',
    question: 'What is "Cashless" facility in health insurance?',
    questionHindi: 'स्वास्थ्य बीमा में "कैशलेस" सुविधा क्या है?',
    options: [
      { id: 'a', text: 'You don\'t need to pay anything ever', isCorrect: false },
      { id: 'b', text: 'Hospital bills directly settled with insurance company at network hospitals', isCorrect: true },
      { id: 'c', text: 'Insurance paid through UPI only', isCorrect: false },
      { id: 'd', text: 'Premium paid in installments', isCorrect: false }
    ],
    explanation: 'At network hospitals, the insurer directly pays the hospital (within policy limits). You don\'t pay upfront. For non-network hospitals, you pay first and get reimbursed later.',
    explanationHindi: 'नेटवर्क अस्पतालों में बीमा कंपनी सीधे अस्पताल को भुगतान करती है। आप पहले नहीं देते। गैर-नेटवर्क अस्पतालों में पहले देना होता है, फिर रीइंबर्समेंट।',
    xpReward: 25
  },
  {
    id: 'q10',
    category: 'general',
    difficulty: 'easy',
    question: 'Which website helps you compare insurance policies in India?',
    questionHindi: 'भारत में कौन सी वेबसाइट बीमा पॉलिसियों की तुलना में मदद करती है?',
    options: [
      { id: 'a', text: 'Amazon.in', isCorrect: false },
      { id: 'b', text: 'IRDAI/Policybazaar/Coverfox', isCorrect: true },
      { id: 'c', text: 'Only insurance agents', isCorrect: false },
      { id: 'd', text: 'Social media recommendations', isCorrect: false }
    ],
    explanation: 'IRDAI (regulator) has comparison tools. Platforms like Policybazaar, Coverfox let you compare policies. Always check claim settlement ratio before buying!',
    explanationHindi: 'IRDAI (रेगुलेटर) के पास तुलना टूल्स हैं। Policybazaar, Coverfox जैसे प्लेटफॉर्म पॉलिसियों की तुलना करते हैं। खरीदने से पहले क्लेम सेटलमेंट रेशियो जरूर देखें!',
    xpReward: 15
  }
]

// ============================================
// INSURANCE CALCULATOR FORMULAS
// ============================================

export const INSURANCE_CALCULATORS = {
  lifeInsurance: {
    name: 'Life Insurance Calculator',
    nameHindi: 'जीवन बीमा कैलकुलेटर',
    calculate: (annualIncome, age, dependents, existingCover = 0, loans = 0) => {
      // Human Life Value method
      const workingYears = 60 - age
      const multiplier = dependents > 0 ? 15 : 10
      const baseNeed = annualIncome * multiplier
      const loanCoverage = loans
      const totalNeed = baseNeed + loanCoverage - existingCover

      // Estimated premium (rough estimate)
      const premiumPer1Lakh = age < 30 ? 80 : age < 40 ? 150 : 300
      const estimatedPremium = (totalNeed / 100000) * premiumPer1Lakh

      return {
        recommendedCover: Math.max(0, totalNeed),
        estimatedAnnualPremium: Math.round(estimatedPremium),
        formula: 'Annual Income × Multiplier + Loans - Existing Cover',
        breakdown: {
          baseNeed,
          loanCoverage,
          existingCover,
          workingYears
        }
      }
    }
  },

  healthInsurance: {
    name: 'Health Insurance Calculator',
    nameHindi: 'स्वास्थ्य बीमा कैलकुलेटर',
    calculate: (age, city, familySize, hasPreExisting = false) => {
      // Base recommendation
      let baseCover = 500000 // ₹5 lakh minimum

      // City-based adjustment
      const cityMultiplier = {
        'Mumbai': 2.0,
        'Delhi': 1.8,
        'Bangalore': 1.7,
        'Chennai': 1.5,
        'Other Metro': 1.4,
        'Non-Metro': 1.0
      }[city] || 1.0

      // Family size adjustment
      if (familySize > 1) baseCover *= 1.5
      if (familySize > 3) baseCover *= 1.3

      // Age adjustment
      if (age > 45) baseCover *= 1.5
      if (age > 60) baseCover *= 2

      const recommendedCover = Math.round((baseCover * cityMultiplier) / 100000) * 100000

      // Premium estimate
      const premiumPerLakh = age < 35 ? 800 : age < 45 ? 1200 : age < 55 ? 2000 : 3500
      const estimatedPremium = (recommendedCover / 100000) * premiumPerLakh * (familySize > 1 ? 1.6 : 1)

      return {
        recommendedCover,
        estimatedAnnualPremium: Math.round(estimatedPremium),
        tips: [
          hasPreExisting ? 'Declare all pre-existing conditions honestly' : '',
          'Consider super top-up for additional coverage',
          'Check network hospitals in your area',
          'Review claim settlement ratio (aim for >90%)'
        ].filter(Boolean)
      }
    }
  }
}

// ============================================
// MODULE CONFIGURATION
// ============================================

export const INSURANCE_MODULE_CONFIG = {
  name: 'Insurance Awareness',
  nameHindi: 'बीमा जागरूकता',
  description: 'Learn about different types of insurance and how to protect yourself',
  descriptionHindi: 'विभिन्न प्रकार के बीमा और खुद को सुरक्षित करने के बारे में जानें',
  icon: '🛡️',
  themes: ['insurance'],
  difficulty: 'beginner',
  sections: [
    { id: 'learn', name: 'Learn', icon: '📚' },
    { id: 'quiz', name: 'Quiz', icon: '❓' },
    { id: 'calculator', name: 'Calculator', icon: '🧮' }
  ],
  xp: {
    readContent: 10,
    quizCorrect: 15,
    quizComplete: 50,
    calculatorUsed: 20
  }
}

// Alias for backwards compatibility
export const INSURANCE_CONFIG = INSURANCE_MODULE_CONFIG

export default {
  INSURANCE_TYPES,
  INSURANCE_QUIZ,
  INSURANCE_CALCULATORS,
  INSURANCE_MODULE_CONFIG
}
