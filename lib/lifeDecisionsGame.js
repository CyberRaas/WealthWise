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
