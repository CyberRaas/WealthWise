/**
 * Life Decisions Game - Financial Simulation
 * Interactive monthly financial decision-making game
 * 
 * Features:
 * - Monthly budget simulation
 * - Real-life financial decisions with consequences
 * - Long-term impact visualization
 * - Multiple financial themes integration
 */

// ============================================
// LIFE SCENARIOS
// ============================================

export const LIFE_EVENTS = {
  // Positive events
  salary_bonus: {
    id: 'salary_bonus',
    name: 'Salary Bonus',
    nameHindi: 'वेतन बोनस',
    icon: '💰',
    type: 'income',
    message: 'Great news! You received a performance bonus of ₹{amount}!',
    messageHindi: 'बढ़िया खबर! आपको ₹{amount} का परफॉर्मेंस बोनस मिला!'
  },
  tax_refund: {
    id: 'tax_refund',
    name: 'Tax Refund',
    nameHindi: 'टैक्स रिफंड',
    icon: '📋',
    type: 'income',
    message: 'Your income tax refund of ₹{amount} has been credited!',
    messageHindi: 'आपका इनकम टैक्स रिफंड ₹{amount} क्रेडिट हो गया!'
  },

  // Negative events
  medical_emergency: {
    id: 'medical_emergency',
    name: 'Medical Emergency',
    nameHindi: 'मेडिकल इमरजेंसी',
    icon: '🏥',
    type: 'expense',
    message: 'A family member needs urgent medical care. Cost: ₹{amount}',
    messageHindi: 'परिवार के सदस्य को तत्काल चिकित्सा की जरूरत है। खर्च: ₹{amount}'
  },
  vehicle_repair: {
    id: 'vehicle_repair',
    name: 'Vehicle Repair',
    nameHindi: 'वाहन मरम्मत',
    icon: '🔧',
    type: 'expense',
    message: 'Your vehicle broke down. Repair cost: ₹{amount}',
    messageHindi: 'आपकी गाड़ी खराब हो गई। मरम्मत खर्च: ₹{amount}'
  },
  home_repair: {
    id: 'home_repair',
    name: 'Home Repair',
    nameHindi: 'घर की मरम्मत',
    icon: '🏠',
    type: 'expense',
    message: 'Plumbing issue at home needs immediate fixing. Cost: ₹{amount}',
    messageHindi: 'घर में प्लंबिंग की समस्या है। खर्च: ₹{amount}'
  },
  job_loss: {
    id: 'job_loss',
    name: 'Job Loss',
    nameHindi: 'नौकरी गई',
    icon: '📉',
    type: 'crisis',
    message: 'Company layoffs! You lost your job. No salary this month.',
    messageHindi: 'कंपनी में छंटनी! आपकी नौकरी गई। इस महीने वेतन नहीं।'
  },

  // Opportunity events
  investment_opportunity: {
    id: 'investment_opportunity',
    name: 'Investment Opportunity',
    nameHindi: 'निवेश का मौका',
    icon: '📈',
    type: 'opportunity',
    message: 'A friend offers you to invest in their startup.',
    messageHindi: 'एक दोस्त अपने स्टार्टअप में निवेश का मौका देता है।'
  },
  sale_offer: {
    id: 'sale_offer',
    name: 'Big Sale',
    nameHindi: 'बड़ी सेल',
    icon: '🏷️',
    type: 'temptation',
    message: 'Huge Diwali sale! 70% off on electronics you\'ve been eyeing.',
    messageHindi: 'बड़ी दिवाली सेल! 70% छूट इलेक्ट्रॉनिक्स पर।'
  }
}

// ============================================
// MONTHLY DECISIONS
// ============================================

export const MONTHLY_DECISIONS = [
  // ========== MONTH 1: SALARY DAY ==========
  {
    id: 'month_1_salary',
    month: 1,
    title: 'First Salary Day! 🎉',
    titleHindi: 'पहली सैलरी! 🎉',
    context: 'You just received your first salary of ₹35,000. Your fixed expenses are:\n- Rent: ₹10,000\n- Utilities: ₹2,000\n- Food: ₹5,000\n- Transport: ₹2,000\n\nRemaining: ₹16,000',
    contextHindi: 'आपको ₹35,000 की पहली सैलरी मिली। निश्चित खर्च:\n- किराया: ₹10,000\n- बिल: ₹2,000\n- खाना: ₹5,000\n- यातायात: ₹2,000\n\nबचा: ₹16,000',
    question: 'What will you do with the remaining ₹16,000?',
    questionHindi: 'बचे ₹16,000 का क्या करेंगे?',
    options: [
      {
        id: 'a',
        text: 'Party! Buy new clothes, dine out, and enjoy - you earned it!',
        textHindi: 'पार्टी! नए कपड़े, बाहर खाना - आपने कमाया है!',
        financialImpact: {
          savings: 0,
          spending: 16000,
          debt: 0,
          investments: 0
        },
        consequence: 'You had fun, but saved nothing. Next month starts from zero.',
        consequenceHindi: 'मज़ा आया, लेकिन कुछ नहीं बचा। अगला महीना शून्य से।',
        score: 20,
        tags: ['impulsive', 'no_savings']
      },
      {
        id: 'b',
        text: 'Save ₹10,000 in bank, keep ₹6,000 for personal expenses',
        textHindi: '₹10,000 बैंक में बचाएं, ₹6,000 व्यक्तिगत खर्च के लिए',
        financialImpact: {
          savings: 10000,
          spending: 6000,
          debt: 0,
          investments: 0
        },
        consequence: 'Great balance! 62% savings rate. You\'re building a cushion.',
        consequenceHindi: 'बढ़िया संतुलन! 62% बचत दर। आप कुशन बना रहे हैं।',
        score: 80,
        tags: ['balanced', 'good_savings']
      },
      {
        id: 'c',
        text: 'Invest ₹10,000 in stocks, ₹4,000 savings, ₹2,000 personal',
        textHindi: '₹10,000 शेयर में, ₹4,000 बचत, ₹2,000 व्यक्तिगत',
        financialImpact: {
          savings: 4000,
          spending: 2000,
          debt: 0,
          investments: 10000
        },
        consequence: 'Aggressive investing without emergency fund is risky. What if you need cash urgently?',
        consequenceHindi: 'इमरजेंसी फंड के बिना आक्रामक निवेश जोखिम भरा है।',
        score: 50,
        tags: ['aggressive', 'risky']
      },
      {
        id: 'd',
        text: 'Put ₹8,000 in emergency fund, ₹4,000 in SIP, ₹4,000 personal',
        textHindi: '₹8,000 इमरजेंसी फंड, ₹4,000 SIP, ₹4,000 व्यक्तिगत',
        financialImpact: {
          savings: 8000,
          spending: 4000,
          debt: 0,
          investments: 4000
        },
        consequence: 'Perfect! Building emergency fund while starting investments. Well-rounded approach.',
        consequenceHindi: 'परफेक्ट! इमरजेंसी फंड बनाते हुए निवेश शुरू। संतुलित दृष्टिकोण।',
        score: 100,
        tags: ['optimal', 'emergency_fund', 'investing']
      }
    ],
    lesson: '💡 TIP: Financial experts recommend building 3-6 months of expenses as emergency fund before aggressive investing.',
    lessonHindi: '💡 सुझाव: आक्रामक निवेश से पहले 3-6 महीने के खर्च का इमरजेंसी फंड बनाएं।',
    themes: ['budgeting', 'savings', 'investments']
  },

  // ========== MONTH 2: UNEXPECTED EXPENSE ==========
  {
    id: 'month_2_emergency',
    month: 2,
    title: 'Emergency Strikes! 🚨',
    titleHindi: 'इमरजेंसी आ गई! 🚨',
    context: 'Your parent falls ill and needs immediate hospitalization. Doctor says it\'ll cost ₹50,000. Your current savings: ₹{savings}. You don\'t have health insurance.',
    contextHindi: 'आपके माता-पिता बीमार हैं और तुरंत अस्पताल में भर्ती करना है। डॉक्टर ने ₹50,000 बताए। आपकी बचत: ₹{savings}। आपके पास स्वास्थ्य बीमा नहीं है।',
    question: 'How will you arrange ₹50,000?',
    questionHindi: '₹50,000 कैसे जुटाएंगे?',
    options: [
      {
        id: 'a',
        text: 'Use all savings and take a personal loan for the rest',
        textHindi: 'सारी बचत इस्तेमाल करें और बाकी के लिए पर्सनल लोन',
        financialImpact: {
          savings: -99999, // Will be calculated based on current savings
          debt: 50000, // Loan amount varies
          monthlyEMI: 2500
        },
        consequence: 'Treatment done, but you\'re now in debt with high interest. EMI burden for 24 months.',
        consequenceHindi: 'इलाज हो गया, लेकिन अब कर्ज में हैं। 24 महीने EMI का बोझ।',
        score: 40,
        tags: ['debt', 'emergency_used']
      },
      {
        id: 'b',
        text: 'Ask relatives for help and arrange from multiple sources',
        textHindi: 'रिश्तेदारों से मदद मांगें और कई स्रोतों से व्यवस्था करें',
        financialImpact: {
          savings: -50000, // Will use savings partially
          debt: 20000, // Informal loan from family
          monthlyEMI: 0
        },
        consequence: 'Family helped, but you owe them. Less financial burden but social obligation.',
        consequenceHindi: 'परिवार ने मदद की, लेकिन आप उनके कर्जदार हैं। कम वित्तीय बोझ।',
        score: 60,
        tags: ['family_help', 'social_debt']
      },
      {
        id: 'c',
        text: 'Negotiate with hospital for payment plan, use savings',
        textHindi: 'अस्पताल से पेमेंट प्लान के लिए बात करें, बचत इस्तेमाल करें',
        financialImpact: {
          savings: -30000,
          debt: 20000, // Hospital installment
          monthlyEMI: 2000
        },
        consequence: 'Smart! Many hospitals offer 0% EMI. You managed without high-interest loans.',
        consequenceHindi: 'स्मार्ट! कई अस्पताल 0% EMI देते हैं। आपने बिना ज्यादा ब्याज के लोन के मैनेज किया।',
        score: 80,
        tags: ['negotiation', 'smart_debt']
      },
      {
        id: 'd',
        text: 'Check if workplace provides emergency advance on salary',
        textHindi: 'देखें कि क्या ऑफिस से सैलरी एडवांस मिल सकता है',
        financialImpact: {
          savings: -20000,
          debt: 0,
          salaryAdvance: 30000
        },
        consequence: 'Excellent! Salary advance has no interest. Next month\'s salary will be less, but no debt.',
        consequenceHindi: 'बढ़िया! सैलरी एडवांस पर ब्याज नहीं। अगले महीने सैलरी कम, लेकिन कर्ज नहीं।',
        score: 90,
        tags: ['salary_advance', 'no_interest']
      }
    ],
    lesson: '💡 TIP: This is why emergency fund is crucial! Also consider health insurance - ₹500/month can cover ₹5 lakh medical expenses.',
    lessonHindi: '💡 सुझाव: इसीलिए इमरजेंसी फंड जरूरी है! स्वास्थ्य बीमा भी लें - ₹500/माह से ₹5 लाख का कवर।',
    themes: ['insurance', 'emergency_fund', 'debt']
  },

  // ========== MONTH 3: TEMPTATION ==========
  {
    id: 'month_3_temptation',
    month: 3,
    title: 'Big Sale Temptation! 🛍️',
    titleHindi: 'बड़ी सेल का लालच! 🛍️',
    context: 'Amazon Great Indian Festival! The iPhone you\'ve wanted is ₹30,000 off - now only ₹65,000. Your friend got it and is showing off. Current savings: ₹{savings}.',
    contextHindi: 'Amazon Great Indian Festival! आपकी पसंद का iPhone ₹30,000 सस्ता - अब सिर्फ ₹65,000। दोस्त ने खरीदा और दिखा रहा है। बचत: ₹{savings}।',
    question: 'Do you buy the iPhone?',
    questionHindi: 'क्या iPhone खरीदेंगे?',
    options: [
      {
        id: 'a',
        text: 'Yes! This discount won\'t come again. Use savings.',
        textHindi: 'हां! यह छूट फिर नहीं आएगी। बचत से खरीदें।',
        financialImpact: {
          savings: -65000,
          spending: 65000
        },
        consequence: 'You got the phone but wiped out your savings. What about emergencies?',
        consequenceHindi: 'फोन मिल गया लेकिन बचत खत्म। इमरजेंसी का क्या?',
        score: 20,
        tags: ['impulsive', 'fomo', 'depleted_savings']
      },
      {
        id: 'b',
        text: 'Buy on EMI - ₹5,500/month for 12 months, keep savings safe',
        textHindi: 'EMI पर लें - ₹5,500/माह 12 महीने, बचत सुरक्षित',
        financialImpact: {
          debt: 65000,
          monthlyEMI: 5500,
          emiMonths: 12
        },
        consequence: 'You have the phone AND savings, but ₹66,000 total cost (EMI interest). Is the status worth ₹36,000 extra?',
        consequenceHindi: 'फोन और बचत दोनों, लेकिन कुल खर्च ₹66,000 (EMI ब्याज)।',
        score: 40,
        tags: ['emi', 'interest_paid']
      },
      {
        id: 'c',
        text: 'Skip it. My current phone works fine. FOMO is not a reason.',
        textHindi: 'छोड़ दो। मौजूदा फोन ठीक है। FOMO कारण नहीं है।',
        financialImpact: {
          savings: 0,
          spending: 0
        },
        consequence: 'Wise choice! You avoided lifestyle inflation. Your current phone still works perfectly.',
        consequenceHindi: 'समझदारी! आपने लाइफस्टाइल इंफ्लेशन से बचे। मौजूदा फोन बढ़िया काम करता है।',
        score: 100,
        tags: ['disciplined', 'needs_vs_wants']
      },
      {
        id: 'd',
        text: 'Start a "Phone Fund" - save ₹5,000/month, buy in 6 months',
        textHindi: '"फोन फंड" शुरू करें - ₹5,000/माह बचाएं, 6 महीने में खरीदें',
        financialImpact: {
          monthlySavingsGoal: 5000,
          targetMonths: 6
        },
        consequence: 'Best approach! By saving first, you might even get a better deal or realize you don\'t need it.',
        consequenceHindi: 'सबसे अच्छा! पहले बचाकर, आपको बेहतर डील मिल सकती है या समझ आए कि जरूरत नहीं।',
        score: 90,
        tags: ['goal_based', 'planned_purchase']
      }
    ],
    lesson: '💡 TIP: The 30-day rule: Wait 30 days before any big purchase. If you still want it, then buy. Most impulses fade.',
    lessonHindi: '💡 सुझाव: 30-दिन नियम: किसी भी बड़ी खरीद से पहले 30 दिन रुकें। अगर फिर भी चाहिए, तो खरीदें।',
    themes: ['budgeting', 'needs_wants', 'consumer_behavior']
  },

  // ========== MONTH 4: INVESTMENT DECISION ==========
  {
    id: 'month_4_investment',
    month: 4,
    title: 'Investment Opportunity 📈',
    titleHindi: 'निवेश का मौका 📈',
    context: 'Your colleague tells you about a "guaranteed" investment scheme promising 3% monthly returns (36% annually). Minimum investment: ₹25,000. He shows his returns on an app.',
    contextHindi: 'सहकर्मी बताता है "गारंटीड" निवेश स्कीम के बारे में जो 3% मासिक रिटर्न (36% सालाना) देती है। न्यूनतम निवेश: ₹25,000।',
    question: 'Will you invest?',
    questionHindi: 'क्या निवेश करेंगे?',
    options: [
      {
        id: 'a',
        text: 'Yes! 36% returns are amazing. Invest ₹25,000.',
        textHindi: 'हां! 36% रिटर्न बढ़िया है। ₹25,000 निवेश करें।',
        financialImpact: {
          savings: -25000,
          investments: 25000,
          riskLevel: 'scam'
        },
        consequence: 'SCAMMED! This is a classic Ponzi scheme. The app stops working after a few months. You lost ₹25,000.',
        consequenceHindi: 'धोखा! यह पोंजी स्कीम है। कुछ महीनों बाद ऐप बंद। ₹25,000 गए।',
        score: 0,
        tags: ['scammed', 'ponzi']
      },
      {
        id: 'b',
        text: 'Sounds too good. I\'ll research if it\'s SEBI registered.',
        textHindi: 'बहुत अच्छा लग रहा है। देखूंगा SEBI-पंजीकृत है या नहीं।',
        financialImpact: {
          savings: 0
        },
        consequence: 'Smart! You checked and found it\'s NOT registered. Saved yourself from a scam.',
        consequenceHindi: 'स्मार्ट! आपने चेक किया और पाया कि पंजीकृत नहीं है। धोखे से बचे।',
        score: 90,
        tags: ['research', 'sebi_check']
      },
      {
        id: 'c',
        text: 'No, 36% guaranteed is impossible. Real FDs give 7-8%.',
        textHindi: 'नहीं, 36% गारंटीड असंभव है। असली FD में 7-8% मिलता है।',
        financialImpact: {
          savings: 0
        },
        consequence: 'Excellent financial awareness! If it sounds too good to be true, it usually is.',
        consequenceHindi: 'बढ़िया वित्तीय जागरूकता! अगर बहुत अच्छा लगे, तो आमतौर पर झूठ है।',
        score: 100,
        tags: ['aware', 'realistic']
      },
      {
        id: 'd',
        text: 'Invest small amount (₹5,000) to test',
        textHindi: 'छोटी रकम (₹5,000) से टेस्ट करें',
        financialImpact: {
          savings: -5000,
          investments: 5000,
          riskLevel: 'scam'
        },
        consequence: 'They let small amounts succeed to build trust. You\'ll invest more and then lose everything.',
        consequenceHindi: 'वे छोटी रकम सफल होने देते हैं विश्वास बनाने के लिए। आप और डालेंगे फिर सब खोएंगे।',
        score: 20,
        tags: ['partially_scammed', 'testing_scam']
      }
    ],
    lesson: '💡 TIP: Realistic returns: FD 7-8%, Mutual Funds 10-15%, Stocks 12-18% (average, with risk). Anything above 15% "guaranteed" is a red flag!',
    lessonHindi: '💡 सुझाव: वास्तविक रिटर्न: FD 7-8%, म्यूचुअल फंड 10-15%। 15% से ऊपर "गारंटीड" = लाल झंडा!',
    themes: ['investments', 'fraud_prevention']
  },

  // ========== MONTH 5: INSURANCE DECISION ==========
  {
    id: 'month_5_insurance',
    month: 5,
    title: 'Insurance Agent Visit 🛡️',
    titleHindi: 'इंश्योरेंस एजेंट की विजिट 🛡️',
    context: 'An LIC agent visits and offers multiple plans. Your current situation:\n- Age: 25, Healthy\n- No dependents yet\n- Annual income: ₹4.2 lakhs\n- No existing insurance',
    contextHindi: 'LIC एजेंट आया और कई प्लान बताए। आपकी स्थिति:\n- उम्र: 25, स्वस्थ\n- कोई आश्रित नहीं\n- वार्षिक आय: ₹4.2 लाख\n- कोई बीमा नहीं',
    question: 'Which insurance should you prioritize?',
    questionHindi: 'कौन सा बीमा पहले लें?',
    options: [
      {
        id: 'a',
        text: 'Endowment plan with ₹50 lakh cover - ₹35,000/year (gives money back!)',
        textHindi: 'एंडोमेंट प्लान ₹50 लाख कवर - ₹35,000/वर्ष (पैसे वापस मिलते हैं!)',
        financialImpact: {
          annualPremium: 35000,
          coverage: 5000000,
          type: 'endowment'
        },
        consequence: 'Poor choice! Endowment gives low returns (4-5%) and inadequate cover. ₹35,000 locks up your money with weak benefits.',
        consequenceHindi: 'खराब चॉइस! एंडोमेंट कम रिटर्न (4-5%) और अपर्याप्त कवर देता है।',
        score: 30,
        tags: ['endowment', 'low_value']
      },
      {
        id: 'b',
        text: 'Term insurance ₹1 crore cover - ₹8,000/year (no money back)',
        textHindi: 'टर्म इंश्योरेंस ₹1 करोड़ कवर - ₹8,000/वर्ष (पैसे वापस नहीं)',
        financialImpact: {
          annualPremium: 8000,
          coverage: 10000000,
          type: 'term'
        },
        consequence: 'Great choice! Term gives maximum cover at lowest cost. At 25, ₹1 crore cover is cheap!',
        consequenceHindi: 'बढ़िया चॉइस! टर्म न्यूनतम लागत पर अधिकतम कवर देता है।',
        score: 90,
        tags: ['term', 'high_cover', 'low_cost']
      },
      {
        id: 'c',
        text: 'Health insurance ₹5 lakh cover - ₹6,000/year',
        textHindi: 'स्वास्थ्य बीमा ₹5 लाख कवर - ₹6,000/वर्ष',
        financialImpact: {
          annualPremium: 6000,
          coverage: 500000,
          type: 'health'
        },
        consequence: 'Very important! But remember month 2? Medical emergencies can exceed ₹5 lakh. Consider higher cover.',
        consequenceHindi: 'बहुत जरूरी! लेकिन महीना 2 याद है? मेडिकल इमरजेंसी ₹5 लाख से ज्यादा हो सकती है।',
        score: 80,
        tags: ['health', 'important']
      },
      {
        id: 'd',
        text: 'Both term (₹1 Cr) + health (₹10 lakh) - ₹15,000/year total',
        textHindi: 'टर्म (₹1 करोड़) + स्वास्थ्य (₹10 लाख) दोनों - कुल ₹15,000/वर्ष',
        financialImpact: {
          annualPremium: 15000,
          termCoverage: 10000000,
          healthCoverage: 1000000,
          type: 'both'
        },
        consequence: 'Perfect! Life protection for family + health protection for yourself. Best use of insurance budget.',
        consequenceHindi: 'परफेक्ट! परिवार के लिए जीवन सुरक्षा + खुद के लिए स्वास्थ्य सुरक्षा।',
        score: 100,
        tags: ['optimal', 'both_covered']
      }
    ],
    lesson: '💡 TIP: Insurance is for protection, not investment. Buy term for life cover + separate health insurance. Invest the rest in mutual funds for better returns.',
    lessonHindi: '💡 सुझाव: बीमा सुरक्षा के लिए है, निवेश के लिए नहीं। टर्म + स्वास्थ्य बीमा लें। बाकी म्यूचुअल फंड में निवेश करें।',
    themes: ['insurance', 'financial_planning']
  },

  // ========== MONTH 6: TAX PLANNING ==========
  {
    id: 'month_6_taxes',
    month: 6,
    title: 'Tax Saving Season! 📋',
    titleHindi: 'टैक्स बचाने का समय! 📋',
    context: 'It\'s January and your HR reminds you to submit tax-saving proofs. You can claim up to ₹1.5 lakh under Section 80C. Your taxable income: ₹5 lakhs. Tax without 80C: ₹12,500.',
    contextHindi: 'जनवरी है और HR ने टैक्स बचाने के प्रूफ जमा करने को कहा। आप 80C में ₹1.5 लाख तक क्लेम कर सकते हैं। कर योग्य आय: ₹5 लाख।',
    question: 'How will you save tax?',
    questionHindi: 'टैक्स कैसे बचाएंगे?',
    options: [
      {
        id: 'a',
        text: 'Don\'t bother - ₹12,500 tax is not much',
        textHindi: 'परेशान न हों - ₹12,500 टैक्स ज्यादा नहीं है',
        financialImpact: {
          taxPaid: 12500,
          investments: 0
        },
        consequence: 'You paid full tax when you could have saved it AND built wealth. Missed opportunity!',
        consequenceHindi: 'पूरा टैक्स दिया जबकि बचा सकते थे और संपत्ति बना सकते थे। मौका गंवाया!',
        score: 10,
        tags: ['no_planning', 'tax_wasted']
      },
      {
        id: 'b',
        text: 'Invest ₹1.5 lakh in PPF at last minute',
        textHindi: 'आखिरी समय में ₹1.5 लाख PPF में डालें',
        financialImpact: {
          taxSaved: 12500,
          investments: 150000,
          type: 'ppf'
        },
        consequence: 'Good tax saving! But PPF has 15-year lock-in. Did you consider liquidity needs?',
        consequenceHindi: 'टैक्स बचा लिया! लेकिन PPF में 15 साल का लॉक-इन। लिक्विडिटी सोची?',
        score: 70,
        tags: ['ppf', 'locked', 'tax_saved']
      },
      {
        id: 'c',
        text: 'Split: ₹50K in ELSS mutual fund + EPF contribution',
        textHindi: '₹50K ELSS म्यूचुअल फंड + EPF कंट्रीब्यूशन में बांटें',
        financialImpact: {
          taxSaved: 12500,
          elss: 50000,
          epf: 100000
        },
        consequence: 'Smart! ELSS has only 3-year lock-in and potential for higher returns. EPF is employer-matched.',
        consequenceHindi: 'स्मार्ट! ELSS में सिर्फ 3 साल का लॉक-इन और ज्यादा रिटर्न की संभावना।',
        score: 90,
        tags: ['elss', 'diversified', 'tax_saved']
      },
      {
        id: 'd',
        text: 'Already have term insurance + ELSS SIP running since April',
        textHindi: 'पहले से टर्म इंश्योरेंस + ELSS SIP अप्रैल से चल रही है',
        financialImpact: {
          taxSaved: 12500,
          systematicInvestment: true
        },
        consequence: 'Excellent! Starting SIP in April means you invested gradually, not last-minute panic. True financial maturity!',
        consequenceHindi: 'बढ़िया! अप्रैल से SIP यानी धीरे-धीरे निवेश, आखिरी समय की जल्दबाजी नहीं। सच्ची वित्तीय परिपक्वता!',
        score: 100,
        tags: ['planned', 'sip', 'optimal']
      }
    ],
    lesson: '💡 TIP: Start tax planning in April, not January! SIP in ELSS gives better returns than last-minute lump sum investment.',
    lessonHindi: '💡 सुझाव: टैक्स प्लानिंग अप्रैल में शुरू करें, जनवरी में नहीं! ELSS में SIP आखिरी समय के निवेश से बेहतर।',
    themes: ['taxes', 'investments', 'planning']
  }
]

// ============================================
// TRACK-SPECIFIC DECISIONS (supplementary)
// These replace Month 3 and Month 5 for specific tracks
// ============================================

export const TRACK_DECISIONS = {
  farmer: {
    3: {
      id: 'farmer_month_3_crop',
      month: 3,
      title: 'Crop Season Decision 🌾',
      titleHindi: 'फसल सीजन का फैसला 🌾',
      context: 'The monsoon is approaching. You need seeds and fertilizer.',
      scenario: 'You have ₹12,000 remaining. A local agent offers premium seeds at ₹8,000 with a promise of 3x returns, or you can buy regular seeds from the cooperative at ₹4,000.',
      scenarioHindi: 'आपके पास ₹12,000 बचे हैं। एक एजेंट ₹8,000 में प्रीमियम बीज दे रहा है, या सहकारी समिति से ₹4,000 में सामान्य बीज ले सकते हैं।',
      question: 'What will you do?',
      questionHindi: 'आप क्या करेंगे?',
      options: [
        {
          id: 'a',
          text: 'Buy premium seeds from the agent — better harvest!',
          textHindi: 'एजेंट से प्रीमियम बीज खरीदें — बेहतर फसल!',
          impact: { savings: -8000 },
          consequence: "The agent\u2019s seeds were fake. You lost \u20B98,000 and had a poor harvest. Always buy from verified cooperatives!",
          consequenceHindi: 'एजेंट के बीज नकली निकले। ₹8,000 गए और फसल भी खराब। सहकारी समिति से खरीदें!',
          score: 20,
          tags: ['risky', 'scammed']
        },
        {
          id: 'b',
          text: 'Buy regular seeds from cooperative and save the rest',
          textHindi: 'सहकारी समिति से सामान्य बीज लें और बाकी बचाएं',
          impact: { savings: -4000 },
          consequence: 'Smart choice! Cooperative seeds are quality-tested. You saved ₹8,000 for emergencies. Good yield expected.',
          consequenceHindi: 'बढ़िया फैसला! सहकारी बीज गुणवत्ता-जांचे होते हैं। ₹8,000 बचाए।',
          score: 100,
          tags: ['planned', 'optimal']
        },
        {
          id: 'c',
          text: 'Take a loan to buy premium seeds and more fertilizer',
          textHindi: 'ज़्यादा बीज और खाद के लिए कर्ज लें',
          impact: { savings: 0, debt: 15000 },
          consequence: "Taking unnecessary debt for unverified seeds is risky. If the harvest fails, you will be in deep debt.",
          consequenceHindi: 'बिना जांचे बीज के लिए कर्ज लेना जोखिम भरा है। फसल खराब हुई तो भारी कर्ज।',
          score: 30,
          tags: ['risky', 'debt']
        }
      ],
      lesson: '💡 Always buy seeds from verified government cooperatives or certified sellers. Avoid unknown middlemen offering "miracle" products.',
      lessonHindi: '💡 हमेशा सरकारी सहकारी समिति या प्रमाणित विक्रेता से बीज खरीदें। अनजान बिचौलियों से बचें।',
      themes: ['fraud_prevention', 'savings', 'budgeting']
    },
    5: {
      id: 'farmer_month_5_insurance',
      month: 5,
      title: 'Crop Insurance Offer 🛡️',
      titleHindi: 'फसल बीमा का मौका 🛡️',
      context: 'PM Fasal Bima Yojana enrollment is open.',
      scenario: 'The government crop insurance premium is only ₹500 per season. Your neighbor says "insurance is a waste — God will protect the crop."',
      scenarioHindi: 'सरकारी फसल बीमा प्रीमियम सिर्फ ₹500 प्रति सीजन है। पड़ोसी कहता है "बीमा बेकार है — भगवान फसल बचाएगा।"',
      question: 'Will you buy crop insurance?',
      questionHindi: 'क्या आप फसल बीमा लेंगे?',
      options: [
        {
          id: 'a',
          text: 'Yes, ₹500 is affordable and protects my livelihood',
          textHindi: 'हां, ₹500 सस्ता है और आजीविका सुरक्षित रहेगी',
          impact: { savings: -500 },
          consequence: 'Excellent! When unexpected hailstorm hit, you received ₹25,000 compensation. ₹500 investment saved your family.',
          consequenceHindi: 'बेहतरीन! जब अचानक ओलावृष्टि हुई, आपको ₹25,000 मुआवजा मिला। ₹500 ने परिवार बचाया।',
          score: 100,
          tags: ['planned', 'optimal', 'insured']
        },
        {
          id: 'b',
          text: "No, I will trust luck and save the ₹500",
          textHindi: 'नहीं, भाग्य पर भरोसा करूंगा और ₹500 बचाऊंगा',
          impact: { savings: 0 },
          consequence: 'When the hailstorm hit, you lost ₹30,000 worth of crops with no insurance payout. A small premium could have saved you.',
          consequenceHindi: 'जब ओलावृष्टि हुई, ₹30,000 की फसल बर्बाद। बीमा नहीं था तो कोई मुआवजा नहीं।',
          score: 20,
          tags: ['risky', 'uninsured']
        },
        {
          id: 'c',
          text: "I will ask the agent for a private insurance instead",
          textHindi: 'एजेंट से प्राइवेट बीमा के बारे में पूछूंगा',
          impact: { savings: -2000 },
          consequence: 'The private "insurance" agent took ₹2,000 and disappeared. Always use official government schemes like PM Fasal Bima Yojana.',
          consequenceHindi: 'प्राइवेट "बीमा" एजेंट ₹2,000 लेकर गायब हो गया। हमेशा सरकारी योजनाएं इस्तेमाल करें।',
          score: 30,
          tags: ['scammed', 'risky']
        }
      ],
      lesson: '💡 PM Fasal Bima Yojana provides affordable crop insurance. Small premiums protect against big losses.',
      lessonHindi: '💡 PM फसल बीमा योजना सस्ता फसल बीमा देती है। छोटा प्रीमियम बड़े नुकसान से बचाता है।',
      themes: ['insurance', 'government_schemes', 'risk_management']
    }
  },
  woman: {
    3: {
      id: 'woman_month_3_savings',
      month: 3,
      title: 'Gold vs Bank Savings 💰',
      titleHindi: 'सोना vs बैंक बचत 💰',
      context: 'You have saved ₹15,000 from household budget management.',
      scenario: 'Your mother-in-law suggests buying gold jewelry for savings. Your friend recommends opening a Mahila Samman Savings Certificate (7.5% interest).',
      scenarioHindi: 'सास सोने के गहने खरीदने की सलाह दे रही हैं। सहेली महिला सम्मान बचत पत्र (7.5% ब्याज) खोलने की सलाह देती है।',
      question: 'Where will you put your savings?',
      questionHindi: 'बचत कहां रखेंगी?',
      options: [
        {
          id: 'a',
          text: "Buy gold jewelry — traditional and safe",
          textHindi: 'सोने के गहने खरीदें — पारंपरिक और सुरक्षित',
          impact: { savings: -15000, investments: 12000 },
          consequence: 'Gold has making charges (20-25%), so ₹15,000 jewelry is really only worth ₹12,000 if sold. Plus, no interest earned.',
          consequenceHindi: 'सोने पर मेकिंग चार्ज (20-25%) लगता है। ₹15,000 के गहने बेचने पर सिर्फ ₹12,000 मिलेंगे। ब्याज भी नहीं।',
          score: 40,
          tags: ['traditional', 'suboptimal']
        },
        {
          id: 'b',
          text: 'Open Mahila Samman Savings Certificate',
          textHindi: 'महिला सम्मान बचत पत्र खोलें',
          impact: { savings: -15000, investments: 15000 },
          consequence: "Excellent choice! 7.5% annual interest, 2-year lock-in. Your ₹15,000 will grow to ₹17,250. Plus, it is in your name!",
          consequenceHindi: 'बेहतरीन! 7.5% वार्षिक ब्याज, 2 साल। ₹15,000 बढ़कर ₹17,250 होंगे। और यह आपके नाम पर!',
          score: 100,
          tags: ['planned', 'optimal', 'independent']
        },
        {
          id: 'c',
          text: 'Keep it in cash at home for emergencies',
          textHindi: 'आपातकाल के लिए घर में नकद रखें',
          impact: { savings: 0 },
          consequence: 'Cash at home earns zero interest and can be lost or stolen. Even a simple savings account would be better.',
          consequenceHindi: 'घर में नकद पर कोई ब्याज नहीं और चोरी का खतरा। साधारण बचत खाता भी बेहतर होगा।',
          score: 30,
          tags: ['conservative', 'risky']
        }
      ],
      lesson: '💡 Government schemes like Mahila Samman Savings Certificate and Sukanya Samriddhi offer high interest specifically for women. Better than gold jewelry for savings!',
      lessonHindi: '💡 महिला सम्मान बचत पत्र और सुकन्या समृद्धि जैसी योजनाएं महिलाओं के लिए उच्च ब्याज देती हैं।',
      themes: ['savings', 'investments', 'government_schemes']
    }
  },
  student: {
    3: {
      id: 'student_month_3_peer',
      month: 3,
      title: 'Peer Pressure Spending 🎯',
      titleHindi: 'दोस्तों का दबाव 🎯',
      context: "Your pocket money is ₹3,000/month. You have saved ₹2,000.",
      scenario: "Friends are planning a ₹2,500 outing to a theme park. They say \"Don't be a miser!\" You also need ₹1,500 for books next week.",
      scenarioHindi: 'दोस्त ₹2,500 की थीम पार्क की प्लान बना रहे हैं। बोलते हैं "कंजूस मत बन!" अगले हफ्ते किताबों के लिए भी ₹1,500 चाहिए।',
      question: 'What will you do?',
      questionHindi: 'आप क्या करेंगे?',
      options: [
        {
          id: 'a',
          text: 'Go to the theme park — YOLO! Books can wait.',
          textHindi: 'थीम पार्क चलो — YOLO! किताबें बाद में।',
          impact: { savings: -2500 },
          consequence: "Fun day but now you cannot afford books. Had to borrow from parents again. Spending all savings on one outing is not smart.",
          consequenceHindi: 'मज़ा आया लेकिन किताबें नहीं खरीद पाए। फिर से पैरंट्स से मांगना पड़ा।',
          score: 20,
          tags: ['impulsive', 'peer_pressure']
        },
        {
          id: 'b',
          text: 'Suggest a cheaper alternative like a movie instead',
          textHindi: 'सस्ता विकल्प सुझाएं जैसे मूवी',
          impact: { savings: -500 },
          consequence: 'Great compromise! ₹500 on a movie, still have ₹1,500 for books. Real friends respect budget-friendly alternatives.',
          consequenceHindi: 'बढ़िया समझौता! ₹500 में मूवी, ₹1,500 किताबों के लिए बचे। असली दोस्त बजट समझते हैं।',
          score: 100,
          tags: ['planned', 'optimal', 'assertive']
        },
        {
          id: 'c',
          text: 'Skip the outing and lie about being sick',
          textHindi: 'बीमारी का बहाना बनाकर नहीं जाना',
          impact: { savings: 0 },
          consequence: "You saved money but lying is not healthy. It is okay to say \"I need to save for books\" — that is financially mature!",
          consequenceHindi: 'पैसे बचे लेकिन झूठ बोलना ठीक नहीं। "किताबों के लिए बचाना है" कहना ठीक है — यह वित्तीय समझदारी है!',
          score: 50,
          tags: ['conservative', 'avoidant']
        }
      ],
      lesson: "💡 It is okay to say no to expensive plans. Suggesting alternatives shows maturity. True friends respect your financial boundaries.",
      lessonHindi: '💡 महंगे प्लान को ना कहना ठीक है। विकल्प सुझाना समझदारी दिखाता है। सच्चे दोस्त आपकी सीमाएं समझते हैं।',
      themes: ['budgeting', 'needs_wants', 'peer_pressure']
    }
  },
  young_adult: {
    3: {
      id: 'young_adult_month_3_emi',
      month: 3,
      title: 'The EMI Trap 📱',
      titleHindi: 'EMI का जाल 📱',
      context: "You just started your first job with a ₹25,000 salary. Your phone works fine.",
      scenario: "A new iPhone is available on ₹3,500/month EMI for 18 months (total ₹63,000). Your current phone works well. Your colleague says \"You deserve it after getting a job!\"",
      scenarioHindi: "नई iPhone ₹3,500/माह EMI पर 18 महीने (कुल ₹63,000)। आपका फोन ठीक चल रहा है। सहकर्मी कहता है \"नौकरी मिली है तो हक बनता है!\"",
      question: 'What will you do?',
      questionHindi: 'आप क्या करेंगे?',
      options: [
        {
          id: 'a',
          text: "Get the iPhone on EMI — I deserve it!",
          textHindi: "EMI पर iPhone ले लो — हक बनता है!",
          impact: { savings: -3500 },
          consequence: "₹3,500/month EMI eats 14% of your salary for 18 months. Plus you pay ₹63,000 for a phone worth ₹55,000. EMI interest adds up fast!",
          consequenceHindi: "₹3,500/माह EMI 18 महीने तक सैलरी का 14% खाएगी। और ₹55,000 के फोन के लिए ₹63,000 देने पड़ेंगे।",
          score: 20,
          tags: ['impulsive', 'debt', 'lifestyle_inflation']
        },
        {
          id: 'b',
          text: "Skip it for now and start a SIP with that ₹3,500/month",
          textHindi: "अभी छोड़ दो और ₹3,500/माह SIP शुरू करो",
          impact: { savings: 3500, investments: 3500 },
          consequence: "Smart move! ₹3,500/month SIP for 18 months at 12% gives you ₹69,000+. You can then buy the phone in cash, or invest more!",
          consequenceHindi: "बढ़िया! ₹3,500/माह SIP 18 महीने में 12% पर ₹69,000+ देगी। फिर कैश में फोन खरीदो या और निवेश करो!",
          score: 100,
          tags: ['planned', 'optimal', 'investor']
        },
        {
          id: 'c',
          text: "Buy a budget phone for ₹12,000 cash and save the rest",
          textHindi: "₹12,000 में बजट फोन खरीदो और बाकी बचाओ",
          impact: { savings: -12000 },
          consequence: "Practical choice! A good budget phone meets your needs. No EMI stress, and you still have savings for emergencies.",
          consequenceHindi: "व्यावहारिक विकल्प! बजट फोन काम चलाएगा। कोई EMI का तनाव नहीं, और बचत भी बरकरार।",
          score: 70,
          tags: ['practical', 'balanced']
        }
      ],
      lesson: "💡 No-cost EMI is never truly free — it includes hidden charges. Before any EMI, ask: Can I invest that monthly amount instead? The 50/30/20 rule helps!",
      lessonHindi: "💡 No-cost EMI कभी सच में मुफ्त नहीं होती — इसमें छुपे शुल्क होते हैं। EMI से पहले सोचो: क्या वो राशि निवेश कर सकता हूँ?",
      themes: ['budgeting', 'debt_management', 'investments']
    },
    5: {
      id: 'young_adult_month_5_tax',
      month: 5,
      title: 'Tax Saving Season 📋',
      titleHindi: 'टैक्स बचत का मौसम 📋',
      context: "March is ending. HR reminds you to submit tax-saving proofs.",
      scenario: "You have not done any tax-saving investments yet. A colleague suggests buying a random insurance policy ASAP. Another says start an ELSS mutual fund SIP.",
      scenarioHindi: "मार्च खत्म हो रहा है। HR ने टैक्स-बचत के सबूत मांगे हैं। सहकर्मी कहता है जल्दी कोई बीमा पॉलिसी ले लो। दूसरा कहता है ELSS म्यूचुअल फंड SIP शुरू करो।",
      question: 'How will you save tax?',
      questionHindi: 'टैक्स कैसे बचाएंगे?',
      options: [
        {
          id: 'a',
          text: "Quickly buy the insurance policy HR recommended",
          textHindi: "HR की बताई बीमा पॉलिसी जल्दी से खरीद लो",
          impact: { savings: -25000 },
          consequence: "Insurance-cum-investment plans have high commissions and low returns (4-5%). You locked ₹25,000/year for 15 years! Pure term insurance + ELSS is much better.",
          consequenceHindi: "बीमा-सह-निवेश योजनाओं में ज़्यादा कमीशन और कम रिटर्न (4-5%)। ₹25,000/साल 15 साल के लिए फंसा! टर्म बीमा + ELSS बेहतर है।",
          score: 25,
          tags: ['impulsive', 'suboptimal']
        },
        {
          id: 'b',
          text: "Start ELSS SIP and get a term insurance policy",
          textHindi: "ELSS SIP शुरू करो और टर्म इंश्योरेंस लो",
          impact: { savings: -12500, investments: 12500 },
          consequence: "Best approach! ELSS gives 12-15% long-term returns with tax saving. Term insurance at ₹500/month covers ₹50 lakh. Smart combo!",
          consequenceHindi: "सबसे अच्छा! ELSS 12-15% लंबी अवधि रिटर्न देता है टैक्स बचत के साथ। ₹500/माह टर्म बीमा ₹50 लाख कवर करता है।",
          score: 100,
          tags: ['planned', 'optimal', 'tax_smart']
        },
        {
          id: 'c',
          text: "Ignore it — I will handle tax next year",
          textHindi: "छोड़ो — अगले साल देख लेंगे",
          impact: { savings: 0 },
          consequence: "You missed ₹46,800 potential tax savings under Section 80C. Starting early with SIPs means the money also grows through the year.",
          consequenceHindi: "Section 80C के तहत ₹46,800 तक की संभावित टैक्स बचत गंवाई। जल्दी SIP शुरू करने से पैसा साल भर बढ़ता है।",
          score: 15,
          tags: ['procrastination', 'loss']
        }
      ],
      lesson: "💡 Do not buy insurance for tax saving — buy it for protection (term plan). For tax-saving investment, ELSS mutual funds offer higher returns with only 3-year lock-in.",
      lessonHindi: "💡 टैक्स बचत के लिए बीमा न खरीदें — सुरक्षा के लिए खरीदें (टर्म प्लान)। टैक्स-बचत निवेश के लिए ELSS म्यूचुअल फंड बेहतर है।",
      themes: ['tax_planning', 'insurance', 'investments']
    }
  }
}

/**
 * Get monthly decisions adapted for user track
 * Track-specific decisions replace generic ones for months 3 and 5
 */
export function getTrackDecisions(userTrack = null) {
  const decisions = [...MONTHLY_DECISIONS]
  
  if (userTrack && TRACK_DECISIONS[userTrack]) {
    const trackOverrides = TRACK_DECISIONS[userTrack]
    for (const [monthStr, decision] of Object.entries(trackOverrides)) {
      const monthIndex = parseInt(monthStr)
      // Find the index in the array (0-based, but month is in the object)
      const idx = decisions.findIndex(d => d.month === monthIndex)
      if (idx !== -1) {
        decisions[idx] = decision
      }
    }
  }
  
  return decisions
}

// ============================================
// GAME CONFIGURATION
// ============================================

export const LIFE_DECISIONS_CONFIG = {
  name: 'Life Decisions',
  nameHindi: 'जीवन के फैसले',
  description: 'Navigate real-life financial decisions and see their long-term impact',
  descriptionHindi: 'वास्तविक जीवन के वित्तीय फैसले लें और उनका दीर्घकालिक प्रभाव देखें',
  icon: '🎮',
  themes: ['budgeting', 'savings', 'investments', 'insurance', 'taxes'],
  difficulty: 'intermediate',

  // Starting conditions
  startingConditions: {
    salary: 35000,
    savings: 0,
    investments: 0,
    debt: 0,
    monthlyExpenses: 19000, // Fixed expenses
    emergencyFundTarget: 114000 // 6 months
  },

  // Scoring
  scoring: {
    maxPerDecision: 100,
    bonusForStreak: 50, // 3 correct in a row
    perfectGameBonus: 500
  },

  // XP rewards
  xp: {
    perDecision: 20,
    complete: 100,
    perfect: 200,
    firstTime: 150
  }
}

/**
 * Calculate financial impact of a decision
 */
export function applyDecision(currentState, decision, optionId) {
  const option = decision.options.find(o => o.id === optionId)
  if (!option) return currentState

  const impact = option.financialImpact
  const newState = { ...currentState }

  // Apply financial changes
  if (impact.savings !== undefined) {
    if (impact.savings === -99999) {
      // Use all savings
      newState.savings = 0
    } else {
      newState.savings = Math.max(0, newState.savings + impact.savings)
    }
  }

  if (impact.spending) {
    newState.totalSpending = (newState.totalSpending || 0) + impact.spending
  }

  if (impact.debt) {
    newState.debt = (newState.debt || 0) + impact.debt
  }

  if (impact.investments) {
    newState.investments = (newState.investments || 0) + impact.investments
  }

  if (impact.monthlyEMI) {
    newState.monthlyEMI = (newState.monthlyEMI || 0) + impact.monthlyEMI
  }

  newState.score = (newState.score || 0) + option.score
  newState.decisions = [...(newState.decisions || []), {
    decisionId: decision.id,
    optionId,
    score: option.score,
    tags: option.tags
  }]

  return newState
}

/**
 * Calculate final game statistics
 */
/**
 * Get a monthly decision by month number
 */
export function getMonthlyDecision(month) {
  return MONTHLY_DECISIONS.find(d => d.month === month) || MONTHLY_DECISIONS[month - 1]
}

/**
 * Calculate the impact of a decision
 */
export function calculateImpact(decision, optionId) {
  const option = decision.options.find(o => o.id === optionId)
  if (!option) return null
  return {
    ...option.financialImpact,
    consequence: option.consequence,
    score: option.score,
    tags: option.tags
  }
}

/**
 * Get final grade based on score
 */
export function getFinalGrade(score, maxScore) {
  const percentage = Math.round((score / maxScore) * 100)
  if (percentage >= 90) return { grade: 'A+', message: 'Financial Genius!' }
  if (percentage >= 80) return { grade: 'A', message: 'Great job!' }
  if (percentage >= 70) return { grade: 'B', message: 'Good progress!' }
  if (percentage >= 60) return { grade: 'C', message: 'Average - keep learning!' }
  return { grade: 'D', message: 'Needs work - try again!' }
}

/**
 * Calculate final game statistics
 */
export function calculateGameStats(gameState, totalDecisions) {
  const maxScore = totalDecisions * 100
  const percentage = Math.round((gameState.score / maxScore) * 100)

  let grade, message
  if (percentage >= 90) {
    grade = 'A+'
    message = 'Financial Genius! You make excellent money decisions!'
  } else if (percentage >= 80) {
    grade = 'A'
    message = 'Great job! You have strong financial instincts.'
  } else if (percentage >= 70) {
    grade = 'B'
    message = 'Good progress! Some room for improvement.'
  } else if (percentage >= 60) {
    grade = 'C'
    message = 'Average. Review the lessons and try again!'
  } else {
    grade = 'D'
    message = 'Needs work. Financial literacy is a journey - keep learning!'
  }

  // Analyze decision patterns
  const allTags = gameState.decisions.flatMap(d => d.tags || [])
  const tagCounts = allTags.reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1
    return acc
  }, {})

  const insights = []
  if (tagCounts.impulsive > 1) insights.push('You tend to make impulsive decisions')
  if (tagCounts.planned > 1) insights.push('You\'re a planned spender - great!')
  if (tagCounts.scammed) insights.push('Be careful with "too good to be true" offers')
  if (tagCounts.optimal > 2) insights.push('Excellent decision-making skills!')

  return {
    score: gameState.score,
    maxScore,
    percentage,
    grade,
    message,
    financialSummary: {
      savings: gameState.savings,
      investments: gameState.investments,
      debt: gameState.debt,
      monthlyEMI: gameState.monthlyEMI || 0
    },
    insights,
    tagAnalysis: tagCounts
  }
}

export default MONTHLY_DECISIONS
