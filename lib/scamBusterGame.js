/**
 * Scam Buster Game - Fraud Prevention Scenarios
 * Interactive game to learn identifying financial scams
 * 
 * Features:
 * - Real-world scam scenarios based on Indian context
 * - Decision-based learning with consequences
 * - Progressive difficulty
 * - Score and achievement tracking
 */

// ============================================
// SCAM CATEGORIES
// ============================================

export const SCAM_CATEGORIES = {
  UPI_FRAUD: {
    id: 'upi_fraud',
    name: 'UPI Fraud',
    nameHindi: 'UPI धोखाधड़ी',
    icon: '📱',
    description: 'Fake payment requests, QR code scams, and UPI PIN theft'
  },
  PHISHING: {
    id: 'phishing',
    name: 'Phishing',
    nameHindi: 'फिशिंग',
    icon: '🎣',
    description: 'Fake emails, SMS, and websites stealing your information'
  },
  LOAN_SCAM: {
    id: 'loan_scam',
    name: 'Loan Scams',
    nameHindi: 'ऋण घोटाला',
    icon: '💸',
    description: 'Fake loan offers, processing fees, and predatory lending'
  },
  INVESTMENT_FRAUD: {
    id: 'investment_fraud',
    name: 'Investment Fraud',
    nameHindi: 'निवेश धोखाधड़ी',
    icon: '📈',
    description: 'Ponzi schemes, fake crypto, and get-rich-quick scams'
  },
  KYC_SCAM: {
    id: 'kyc_scam',
    name: 'KYC Scam',
    nameHindi: 'KYC घोटाला',
    icon: '🪪',
    description: 'Fake KYC update requests to steal bank details'
  },
  JOB_SCAM: {
    id: 'job_scam',
    name: 'Job Scams',
    nameHindi: 'नौकरी घोटाला',
    icon: '💼',
    description: 'Fake job offers requiring upfront payments'
  },
  LOTTERY_SCAM: {
    id: 'lottery_scam',
    name: 'Lottery/Prize Scams',
    nameHindi: 'लॉटरी घोटाला',
    icon: '🎰',
    description: 'Fake lottery wins requiring processing fees'
  },
  IMPERSONATION: {
    id: 'impersonation',
    name: 'Impersonation',
    nameHindi: 'प्रतिरूपण',
    icon: '🎭',
    description: 'Scammers pretending to be bank officials, police, or relatives'
  }
}

// ============================================
// SCAM SCENARIOS
// ============================================

export const SCAM_SCENARIOS = [
  // ========== UPI FRAUD SCENARIOS ==========
  {
    id: 'upi_1',
    category: 'UPI_FRAUD',
    difficulty: 'easy',
    title: 'The Unexpected Payment Request',
    titleHindi: 'अप्रत्याशित भुगतान अनुरोध',
    scenario: `You receive a message from an unknown number:
    
"Hi! I'm selling my iPhone 13 for ₹25,000. Interested? I'll send a payment request, just enter your UPI PIN to receive ₹1 as a test payment."

The person sends you a UPI collect request for ₹1.`,
    scenarioHindi: `आपको एक अनजान नंबर से संदेश आता है: "नमस्ते! मैं अपना iPhone 13 ₹25,000 में बेच रहा हूं। ₹1 टेस्ट पेमेंट के लिए अपना UPI PIN डालें।"`,
    question: 'What should you do?',
    questionHindi: 'आपको क्या करना चाहिए?',
    options: [
      {
        id: 'a',
        text: 'Enter my UPI PIN - it\'s only ₹1, so it\'s safe',
        textHindi: 'UPI PIN डालें - सिर्फ ₹1 है, सुरक्षित है',
        isCorrect: false,
        consequence: 'SCAMMED! You don\'t need to enter PIN to receive money. The scammer used a COLLECT request to TAKE money from you. Lost: ₹25,000',
        consequenceHindi: 'धोखा! पैसे लेने के लिए PIN की जरूरत नहीं। स्कैमर ने COLLECT रिक्वेस्ट भेजी। नुकसान: ₹25,000'
      },
      {
        id: 'b',
        text: 'Decline the request - you never need PIN to receive money',
        textHindi: 'अनुरोध अस्वीकार करें - पैसे लेने के लिए PIN कभी नहीं चाहिए',
        isCorrect: true,
        consequence: 'SAFE! You correctly identified that receiving money NEVER requires entering UPI PIN. You saved yourself from a ₹25,000 scam!',
        consequenceHindi: 'सुरक्षित! आपने सही पहचाना कि पैसे लेने के लिए कभी UPI PIN नहीं चाहिए। ₹25,000 बचाए!'
      },
      {
        id: 'c',
        text: 'Ask them to send money instead of collect request',
        textHindi: 'उनसे collect की जगह पैसे भेजने को कहें',
        isCorrect: false,
        consequence: 'RISKY! While you showed some awareness, engaging with scammers is never safe. They might try other tricks. Best to block and report.',
        consequenceHindi: 'जोखिम! स्कैमर्स से बात करना सुरक्षित नहीं। ब्लॉक और रिपोर्ट करें।'
      }
    ],
    lesson: '🔑 KEY LESSON: You NEVER need to enter UPI PIN to RECEIVE money. If someone asks for your PIN to send you money, it\'s 100% a scam!',
    lessonHindi: '🔑 मुख्य सबक: पैसे लेने के लिए कभी UPI PIN नहीं चाहिए। अगर कोई PIN मांगे, तो 100% धोखा है!',
    tips: [
      'Receiving money = No PIN required',
      'Sending money = PIN required',
      'Never share OTP or PIN with anyone',
      'Block and report suspicious contacts'
    ],
    xpReward: 25
  },
  {
    id: 'upi_2',
    category: 'UPI_FRAUD',
    difficulty: 'medium',
    title: 'The QR Code Trap',
    titleHindi: 'QR कोड जाल',
    scenario: `You're selling your old laptop on OLX for ₹35,000. A buyer messages:

"I want to buy it! I'll pay online. Please scan this QR code to receive ₹35,000 directly."

They send you a QR code image.`,
    scenarioHindi: `आप OLX पर अपना पुराना लैपटॉप ₹35,000 में बेच रहे हैं। एक खरीदार कहता है: "मैं इसे खरीदना चाहता हूं! इस QR कोड को स्कैन करें ₹35,000 पाने के लिए।"`,
    question: 'What should you do?',
    questionHindi: 'आपको क्या करना चाहिए?',
    options: [
      {
        id: 'a',
        text: 'Scan the QR code to receive the payment',
        textHindi: 'पेमेंट पाने के लिए QR कोड स्कैन करें',
        isCorrect: false,
        consequence: 'SCAMMED! Scanning a QR code is for SENDING money, not receiving. You just sent ₹35,000 to the scammer!',
        consequenceHindi: 'धोखा! QR कोड स्कैन करना पैसे भेजने के लिए है, लेने के लिए नहीं। आपने ₹35,000 भेज दिए!'
      },
      {
        id: 'b',
        text: 'Share your UPI ID and ask them to send money directly',
        textHindi: 'अपना UPI ID शेयर करें और उनसे सीधे पैसे भेजने को कहें',
        isCorrect: true,
        consequence: 'SAFE! You know that to receive money, you only need to share your UPI ID. Scanning QR is for SENDING. Smart move!',
        consequenceHindi: 'सुरक्षित! पैसे लेने के लिए सिर्फ UPI ID चाहिए। QR स्कैन भेजने के लिए है। स्मार्ट!'
      },
      {
        id: 'c',
        text: 'Ask them to come and pay cash in person',
        textHindi: 'उनसे खुद आकर कैश देने को कहें',
        isCorrect: false,
        consequence: 'SAFE but inconvenient. While this avoids online scams, you can safely receive digital payments by sharing your UPI ID.',
        consequenceHindi: 'सुरक्षित लेकिन असुविधाजनक। आप UPI ID शेयर करके सुरक्षित पेमेंट ले सकते हैं।'
      }
    ],
    lesson: '🔑 KEY LESSON: QR codes are for SENDING money, not receiving! To receive money, share your UPI ID or phone number.',
    lessonHindi: '🔑 मुख्य सबक: QR कोड पैसे भेजने के लिए है, लेने के लिए नहीं! पैसे लेने के लिए UPI ID शेयर करें।',
    tips: [
      'Scanning QR = Sending money',
      'Sharing UPI ID = Receiving money',
      'Never scan unknown QR codes',
      'Meet in safe public places for high-value sales'
    ],
    xpReward: 30
  },
  
  // ========== PHISHING SCENARIOS ==========
  {
    id: 'phishing_1',
    category: 'PHISHING',
    difficulty: 'easy',
    title: 'The Urgent Bank Message',
    titleHindi: 'जरूरी बैंक संदेश',
    scenario: `You receive an SMS:

"Dear Customer, Your SBI account will be blocked in 24 hours. Update your KYC immediately: https://sbi-kyc-update.xyz/verify

-SBI Bank"`,
    scenarioHindi: `आपको SMS आता है: "प्रिय ग्राहक, आपका SBI खाता 24 घंटे में ब्लॉक हो जाएगा। तुरंत KYC अपडेट करें: https://sbi-kyc-update.xyz/verify -SBI बैंक"`,
    question: 'Is this message genuine?',
    questionHindi: 'क्या यह संदेश असली है?',
    options: [
      {
        id: 'a',
        text: 'Yes, I should click the link immediately to save my account',
        textHindi: 'हां, अपना खाता बचाने के लिए तुरंत लिंक पर क्लिक करना चाहिए',
        isCorrect: false,
        consequence: 'SCAMMED! The link takes you to a fake website that looks like SBI. You entered your details, and your account was emptied!',
        consequenceHindi: 'धोखा! लिंक एक नकली वेबसाइट पर ले गया जो SBI जैसी दिखती है। आपने डिटेल्स डाले और खाता खाली हो गया!'
      },
      {
        id: 'b',
        text: 'No, the URL looks suspicious - real SBI URL is onlinesbi.sbi',
        textHindi: 'नहीं, URL संदिग्ध है - असली SBI URL onlinesbi.sbi है',
        isCorrect: true,
        consequence: 'SAFE! You correctly identified the fake URL. Real bank websites end in official domains, not random .xyz links!',
        consequenceHindi: 'सुरक्षित! आपने नकली URL पहचान लिया। असली बैंक वेबसाइट आधिकारिक डोमेन में होती है!'
      },
      {
        id: 'c',
        text: 'I\'m not sure, I\'ll call the number in the SMS to verify',
        textHindi: 'मुझे पता नहीं, SMS में दिए नंबर पर कॉल करके पता करूंगा',
        isCorrect: false,
        consequence: 'RISKY! The number in the scam SMS connects to scammers pretending to be bank officials. Call the official number on your card or bank website.',
        consequenceHindi: 'जोखिम! SMS में नंबर स्कैमर्स का है। अपने कार्ड या बैंक वेबसाइट पर दिए नंबर पर कॉल करें।'
      }
    ],
    lesson: '🔑 KEY LESSON: Banks NEVER send urgent messages with random links. Always check the URL and visit the official website directly.',
    lessonHindi: '🔑 मुख्य सबक: बैंक कभी रैंडम लिंक के साथ जरूरी संदेश नहीं भेजते। हमेशा URL चेक करें।',
    tips: [
      'Official SBI URL: onlinesbi.sbi',
      'Look for https:// and official domain',
      'Banks never ask for PIN/OTP via SMS',
      'When in doubt, visit bank branch'
    ],
    xpReward: 25
  },
  {
    id: 'phishing_2',
    category: 'PHISHING',
    difficulty: 'medium',
    title: 'The Email from IT Department',
    titleHindi: 'IT विभाग से ईमेल',
    scenario: `You receive an email:

From: incometax-refund@gov-india.in
Subject: Income Tax Refund of ₹18,500 - Action Required

"Dear Taxpayer,
You are eligible for a refund of ₹18,500. To receive your refund within 3 days, verify your bank details here: [Click to Verify]

Income Tax Department, India"`,
    scenarioHindi: `आपको ईमेल आता है: "प्रिय करदाता, आप ₹18,500 की रिफंड के योग्य हैं। 3 दिन में रिफंड पाने के लिए अपनी बैंक डिटेल्स यहां वेरीफाई करें।"`,
    question: 'Should you click the link?',
    questionHindi: 'क्या आपको लिंक पर क्लिक करना चाहिए?',
    options: [
      {
        id: 'a',
        text: 'Yes, I filed my taxes and might have a refund due',
        textHindi: 'हां, मैंने टैक्स भरा है और रिफंड हो सकता है',
        isCorrect: false,
        consequence: 'SCAMMED! The email domain "gov-india.in" is fake. Real IT department uses "incometax.gov.in". Your bank details are now with scammers.',
        consequenceHindi: 'धोखा! "gov-india.in" नकली है। असली IT विभाग "incometax.gov.in" इस्तेमाल करता है।'
      },
      {
        id: 'b',
        text: 'No, the email domain looks fake - official domain is incometax.gov.in',
        textHindi: 'नहीं, ईमेल डोमेन नकली है - असली डोमेन incometax.gov.in है',
        isCorrect: true,
        consequence: 'SAFE! Excellent observation! Government websites always end in .gov.in, not .in or other random domains.',
        consequenceHindi: 'सुरक्षित! बढ़िया! सरकारी वेबसाइट हमेशा .gov.in में होती है।'
      },
      {
        id: 'c',
        text: 'I\'ll check my refund status on the official portal first',
        textHindi: 'पहले आधिकारिक पोर्टल पर रिफंड स्टेटस चेक करूंगा',
        isCorrect: true,
        consequence: 'SAFE! Smart move! Always verify directly on official websites. Go to incometax.gov.in and check your actual refund status.',
        consequenceHindi: 'सुरक्षित! स्मार्ट! हमेशा आधिकारिक वेबसाइट पर चेक करें।'
      }
    ],
    lesson: '🔑 KEY LESSON: Government websites ALWAYS end in .gov.in. Check email domains carefully and verify directly on official portals.',
    lessonHindi: '🔑 मुख्य सबक: सरकारी वेबसाइट हमेशा .gov.in में होती है। ईमेल डोमेन ध्यान से चेक करें।',
    tips: [
      'IT Department: incometax.gov.in',
      'EPFO: epfindia.gov.in',
      'Aadhaar: uidai.gov.in',
      'Government = .gov.in domain'
    ],
    xpReward: 30
  },
  
  // ========== LOAN SCAM SCENARIOS ==========
  {
    id: 'loan_1',
    category: 'LOAN_SCAM',
    difficulty: 'medium',
    title: 'The Instant Loan App',
    titleHindi: 'इंस्टेंट लोन ऐप',
    scenario: `You see an ad on social media:

"INSTANT LOAN ₹50,000! No documents, no CIBIL check! Get money in 10 minutes! Download EasyMoney app now!"

You need ₹20,000 urgently for a medical emergency. The app asks for a ₹500 "processing fee" before disbursing the loan.`,
    scenarioHindi: `सोशल मीडिया पर विज्ञापन: "इंस्टेंट लोन ₹50,000! कोई डॉक्यूमेंट नहीं, कोई CIBIL चेक नहीं! 10 मिनट में पैसे पाएं!" ऐप लोन से पहले ₹500 "प्रोसेसिंग फीस" मांगता है।`,
    question: 'What should you do?',
    questionHindi: 'आपको क्या करना चाहिए?',
    options: [
      {
        id: 'a',
        text: 'Pay ₹500 - it\'s small compared to ₹50,000 loan',
        textHindi: '₹500 दें - ₹50,000 लोन के मुकाबले छोटी रकम है',
        isCorrect: false,
        consequence: 'SCAMMED! Legitimate lenders NEVER ask for upfront fees. After paying, they\'ll ask for more "charges" and never give the loan. You lost ₹500.',
        consequenceHindi: 'धोखा! असली लोन देने वाले कभी पहले फीस नहीं मांगते। और पैसे मांगेंगे, लोन नहीं मिलेगा।'
      },
      {
        id: 'b',
        text: 'Avoid the app - legitimate loans don\'t require upfront fees',
        textHindi: 'ऐप से बचें - असली लोन में पहले फीस नहीं होती',
        isCorrect: true,
        consequence: 'SAFE! RBI-registered lenders never charge upfront fees. Processing fees, if any, are deducted from the loan amount, never paid separately.',
        consequenceHindi: 'सुरक्षित! RBI-पंजीकृत लोन देने वाले कभी पहले फीस नहीं लेते।'
      },
      {
        id: 'c',
        text: 'Check if the app is RBI registered before deciding',
        textHindi: 'तय करने से पहले ऐप RBI-पंजीकृत है या नहीं चेक करें',
        isCorrect: true,
        consequence: 'SMART! Always verify lenders on RBI\'s official list. This app likely isn\'t registered and could steal your data or money.',
        consequenceHindi: 'स्मार्ट! हमेशा RBI की आधिकारिक लिस्ट में लोन देने वाले वेरीफाई करें।'
      }
    ],
    lesson: '🔑 KEY LESSON: Never pay upfront fees for loans! RBI-registered lenders deduct fees from the loan amount. Check sachet.rbi.org.in for registered lenders.',
    lessonHindi: '🔑 मुख्य सबक: लोन के लिए कभी पहले फीस न दें! RBI-पंजीकृत लोन देने वालों की लिस्ट sachet.rbi.org.in पर देखें।',
    tips: [
      'No legitimate loan requires upfront payment',
      'Check RBI list: sachet.rbi.org.in',
      '"No CIBIL check" = Red flag',
      'Use official bank apps for loans'
    ],
    xpReward: 35
  },
  
  // ========== INVESTMENT FRAUD SCENARIOS ==========
  {
    id: 'invest_1',
    category: 'INVESTMENT_FRAUD',
    difficulty: 'medium',
    title: 'The WhatsApp Tip',
    titleHindi: 'WhatsApp टिप',
    scenario: `You're added to a WhatsApp group "VIP Stock Tips 💰". The admin posts:

"Friends, I have insider info! Buy XYZ Pharma stock today - it will 5x in 1 week! Already 1000+ members made lakhs! Join our premium channel for ₹5000."

Screenshot shows a member who turned ₹10,000 into ₹2,00,000.`,
    scenarioHindi: `आपको WhatsApp ग्रुप "VIP Stock Tips 💰" में जोड़ा गया। एडमिन पोस्ट करता है: "दोस्तों, मुझे इनसाइडर जानकारी है! आज XYZ Pharma स्टॉक खरीदें - 1 हफ्ते में 5 गुना!"`,
    question: 'What\'s your next move?',
    questionHindi: 'आपका अगला कदम क्या है?',
    options: [
      {
        id: 'a',
        text: 'Invest quickly before the stock rises - this is a great opportunity!',
        textHindi: 'स्टॉक बढ़ने से पहले जल्दी निवेश करें - यह बढ़िया मौका है!',
        isCorrect: false,
        consequence: 'SCAMMED! This is a classic "Pump and Dump" scheme. Scammers buy cheap stocks, hype them up, and sell when naive investors push the price up. Stock crashes, you lose everything.',
        consequenceHindi: 'धोखा! यह "Pump and Dump" स्कीम है। स्कैमर्स सस्ते स्टॉक खरीदते हैं, हाइप करते हैं, फिर बेचते हैं।'
      },
      {
        id: 'b',
        text: 'Leave the group and report - insider trading tips are illegal',
        textHindi: 'ग्रुप छोड़ें और रिपोर्ट करें - इनसाइडर ट्रेडिंग टिप्स गैरकानूनी हैं',
        isCorrect: true,
        consequence: 'SAFE! Sharing "insider tips" is illegal (SEBI Act). These groups are scams. Report to SEBI and exit immediately.',
        consequenceHindi: 'सुरक्षित! "इनसाइडर टिप्स" शेयर करना गैरकानूनी है (SEBI अधिनियम)। रिपोर्ट करें और बाहर निकलें।'
      },
      {
        id: 'c',
        text: 'Pay ₹5000 for premium channel to get better tips',
        textHindi: 'बेहतर टिप्स के लिए ₹5000 में प्रीमियम चैनल जॉइन करें',
        isCorrect: false,
        consequence: 'DOUBLE SCAMMED! Now you\'ve lost ₹5000 AND will get the same fake tips. Premium groups are just another way to extract money.',
        consequenceHindi: 'दोगुना धोखा! ₹5000 गए और वही नकली टिप्स मिलेंगे।'
      }
    ],
    lesson: '🔑 KEY LESSON: "Guaranteed returns" and "insider tips" are ALWAYS scams. Real investing requires research, not WhatsApp tips!',
    lessonHindi: '🔑 मुख्य सबक: "गारंटीड रिटर्न" और "इनसाइडर टिप्स" हमेशा धोखा होते हैं!',
    tips: [
      'No one can guarantee stock returns',
      'Insider trading is illegal',
      'If it sounds too good, it\'s a scam',
      'Use SEBI-registered advisors only'
    ],
    xpReward: 35
  },
  {
    id: 'invest_2',
    category: 'INVESTMENT_FRAUD',
    difficulty: 'hard',
    title: 'The Crypto Millionaire',
    titleHindi: 'क्रिप्टो करोड़पति',
    scenario: `Your friend introduces you to a crypto trading platform "CryptoBillion":

"Bro, I invested ₹10,000 last month and now it shows ₹45,000! The app lets you withdraw anytime. Just need to invest minimum ₹25,000 to start."

You see his app showing the profits. He even withdrew ₹5,000 successfully last week.`,
    scenarioHindi: `आपका दोस्त "CryptoBillion" क्रिप्टो ट्रेडिंग प्लेटफॉर्म दिखाता है: "भाई, मैंने पिछले महीने ₹10,000 लगाए और अब ₹45,000 दिख रहे हैं! कभी भी निकाल सकते हो।"`,
    question: 'Should you invest?',
    questionHindi: 'क्या आपको निवेश करना चाहिए?',
    options: [
      {
        id: 'a',
        text: 'Yes, my friend already withdrew money, so it\'s legitimate',
        textHindi: 'हां, दोस्त ने पैसे निकाले हैं, तो यह सही है',
        isCorrect: false,
        consequence: 'SCAMMED! This is a Ponzi scheme. Initial withdrawals are allowed to build trust, but once you invest big, the platform disappears. Your friend is unknowingly recruiting victims.',
        consequenceHindi: 'धोखा! यह पोंजी स्कीम है। शुरू में निकालने देते हैं विश्वास बनाने के लिए, फिर प्लेटफॉर्म गायब।'
      },
      {
        id: 'b',
        text: 'No, 350% monthly returns is impossible - it\'s a Ponzi scheme',
        textHindi: 'नहीं, 350% मासिक रिटर्न असंभव है - यह पोंजी स्कीम है',
        isCorrect: true,
        consequence: 'SAFE! Even the best investors make 15-20% annually. 350% monthly is mathematically impossible. Your friend will eventually lose everything too.',
        consequenceHindi: 'सुरक्षित! सबसे अच्छे निवेशक भी सालाना 15-20% कमाते हैं। 350% मासिक असंभव है।'
      },
      {
        id: 'c',
        text: 'Invest small amount first to test',
        textHindi: 'पहले छोटी रकम से टेस्ट करें',
        isCorrect: false,
        consequence: 'RISKY! The platform is designed to let small amounts succeed. Once you invest more, you can\'t withdraw. Don\'t fall for the bait.',
        consequenceHindi: 'जोखिम! प्लेटफॉर्म छोटी रकम सफल होने देता है। बड़ी रकम डालते ही फंस जाएंगे।'
      }
    ],
    lesson: '🔑 KEY LESSON: Returns above 15-20% annually are suspicious. Ponzi schemes use early withdrawals to build fake trust. If it seems too good, RUN!',
    lessonHindi: '🔑 मुख्य सबक: सालाना 15-20% से ऊपर रिटर्न संदिग्ध है। पोंजी स्कीम विश्वास बनाने के लिए शुरू में निकालने देते हैं।',
    tips: [
      'Realistic annual returns: 8-15%',
      'High returns = High risk (or scam)',
      'Friends can unknowingly recruit you',
      'Use only SEBI-registered platforms'
    ],
    xpReward: 40
  },

  // ========== KYC SCAM SCENARIOS ==========
  {
    id: 'kyc_1',
    category: 'KYC_SCAM',
    difficulty: 'easy',
    title: 'The Paytm KYC Call',
    titleHindi: 'Paytm KYC कॉल',
    scenario: `You receive a call:

"Hello, I'm calling from Paytm. Your wallet KYC is incomplete and will be suspended in 2 hours. Please download AnyDesk app and share the code so I can help you complete KYC remotely."`,
    scenarioHindi: `आपको कॉल आती है: "हेलो, मैं Paytm से बोल रहा हूं। आपकी वॉलेट KYC अधूरी है और 2 घंटे में सस्पेंड हो जाएगी। AnyDesk ऐप डाउनलोड करें और कोड शेयर करें।"`,
    question: 'What\'s the right response?',
    questionHindi: 'सही जवाब क्या है?',
    options: [
      {
        id: 'a',
        text: 'Download AnyDesk and share the code - they\'re from Paytm',
        textHindi: 'AnyDesk डाउनलोड करें और कोड शेयर करें - वे Paytm से हैं',
        isCorrect: false,
        consequence: 'SCAMMED! AnyDesk gives remote access to your phone. They can see your passwords, OTPs, and drain your accounts. You lost all your money!',
        consequenceHindi: 'धोखा! AnyDesk आपके फोन का रिमोट एक्सेस देता है। वे पासवर्ड, OTP देख सकते हैं।'
      },
      {
        id: 'b',
        text: 'Hang up immediately - companies never ask for remote access',
        textHindi: 'तुरंत फोन काट दें - कंपनियां कभी रिमोट एक्सेस नहीं मांगतीं',
        isCorrect: true,
        consequence: 'SAFE! No legitimate company asks you to install remote access apps. KYC is done in-person at authorized centers or through official apps only.',
        consequenceHindi: 'सुरक्षित! कोई भी असली कंपनी रिमोट एक्सेस ऐप इंस्टॉल करने को नहीं कहती।'
      },
      {
        id: 'c',
        text: 'Ask them to prove they\'re from Paytm first',
        textHindi: 'पहले उनसे प्रूफ मांगें कि वे Paytm से हैं',
        isCorrect: false,
        consequence: 'RISKY! Scammers have fake employee IDs and convincing stories. Don\'t engage - just hang up and contact Paytm through the official app.',
        consequenceHindi: 'जोखिम! स्कैमर्स के पास नकली ID होती हैं। फोन काटें और आधिकारिक ऐप से संपर्क करें।'
      }
    ],
    lesson: '🔑 KEY LESSON: NEVER install remote access apps (AnyDesk, TeamViewer, QuickSupport) on anyone\'s request. Companies do KYC through official channels only.',
    lessonHindi: '🔑 मुख्य सबक: किसी के कहने पर कभी रिमोट एक्सेस ऐप (AnyDesk, TeamViewer) इंस्टॉल न करें।',
    tips: [
      'Never install AnyDesk/TeamViewer for "help"',
      'KYC is done in-person or via official apps',
      'Caller ID can be spoofed',
      'When unsure, hang up and call official number'
    ],
    xpReward: 25
  },

  // ========== JOB SCAM SCENARIOS ==========
  {
    id: 'job_1',
    category: 'JOB_SCAM',
    difficulty: 'medium',
    title: 'The Work From Home Job',
    titleHindi: 'वर्क फ्रॉम होम नौकरी',
    scenario: `You receive an email:

"Congratulations! You've been selected for a Data Entry job at Amazon India. Salary: ₹45,000/month (Work from home). 

To proceed with onboarding, pay a refundable security deposit of ₹3,500. This will be returned with your first salary."`,
    scenarioHindi: `आपको ईमेल आता है: "बधाई हो! आप Amazon India में Data Entry नौकरी के लिए चुने गए। वेतन: ₹45,000/माह। ऑनबोर्डिंग के लिए ₹3,500 रिफंडेबल सिक्योरिटी डिपॉजिट दें।"`,
    question: 'Is this job offer legitimate?',
    questionHindi: 'क्या यह नौकरी का ऑफर असली है?',
    options: [
      {
        id: 'a',
        text: 'Yes, Amazon is a big company and ₹45K WFH is reasonable',
        textHindi: 'हां, Amazon बड़ी कंपनी है और ₹45K WFH उचित है',
        isCorrect: false,
        consequence: 'SCAMMED! Legitimate companies NEVER ask for money during hiring. After paying, they\'ll ask for more "fees" and ghost you.',
        consequenceHindi: 'धोखा! असली कंपनियां भर्ती में कभी पैसे नहीं मांगतीं।'
      },
      {
        id: 'b',
        text: 'No, real employers never ask for money from candidates',
        textHindi: 'नहीं, असली नियोक्ता कभी उम्मीदवारों से पैसे नहीं मांगते',
        isCorrect: true,
        consequence: 'SAFE! Job seekers NEVER pay employers. Security deposits, registration fees, training costs - all are scam tactics. Report this email!',
        consequenceHindi: 'सुरक्षित! नौकरी खोजने वाले कभी नियोक्ताओं को पैसे नहीं देते।'
      },
      {
        id: 'c',
        text: 'I\'ll verify by checking Amazon\'s official careers page',
        textHindi: 'Amazon के आधिकारिक करियर पेज पर चेक करके वेरीफाई करूंगा',
        isCorrect: true,
        consequence: 'SMART! Always verify jobs on official company career pages. Amazon hiring is at amazon.jobs, not random emails.',
        consequenceHindi: 'स्मार्ट! हमेशा आधिकारिक करियर पेज पर नौकरी वेरीफाई करें।'
      }
    ],
    lesson: '🔑 KEY LESSON: YOU are the product being sold when companies ask for money. Real jobs PAY you, not the other way around!',
    lessonHindi: '🔑 मुख्य सबक: जब कंपनियां पैसे मांगें, तो आप "प्रोडक्ट" हैं। असली नौकरी में आपको पैसे मिलते हैं!',
    tips: [
      'Never pay for jobs',
      'Verify on company career pages',
      'High salary + low effort = Scam',
      'Check company email domains'
    ],
    xpReward: 30
  },

  // ========== LOTTERY SCAM SCENARIOS ==========
  {
    id: 'lottery_1',
    category: 'LOTTERY_SCAM',
    difficulty: 'easy',
    title: 'The Lucky Winner',
    titleHindi: 'भाग्यशाली विजेता',
    scenario: `You receive a call:

"Congratulations! Your mobile number has won ₹25,00,000 in the Jio Lucky Draw! To claim your prize, pay a processing fee of ₹25,000 and provide your bank details for the transfer."`,
    scenarioHindi: `आपको कॉल आती है: "बधाई हो! आपके मोबाइल नंबर ने Jio Lucky Draw में ₹25,00,000 जीते हैं! पुरस्कार के लिए ₹25,000 प्रोसेसिंग फीस दें।"`,
    question: 'What do you do?',
    questionHindi: 'आप क्या करते हैं?',
    options: [
      {
        id: 'a',
        text: 'Pay ₹25,000 - it\'s small compared to ₹25 lakhs prize',
        textHindi: '₹25,000 दें - ₹25 लाख के मुकाबले छोटी रकम है',
        isCorrect: false,
        consequence: 'SCAMMED! You never entered any contest, so you can\'t win. After paying, they\'ll demand more "taxes" and "charges". You lost ₹25,000.',
        consequenceHindi: 'धोखा! आपने कोई प्रतियोगिता में भाग नहीं लिया, तो जीत नहीं सकते। ₹25,000 गए।'
      },
      {
        id: 'b',
        text: 'Hang up - you can\'t win contests you never entered',
        textHindi: 'फोन काट दें - जिसमें भाग नहीं लिया, उसमें जीत नहीं सकते',
        isCorrect: true,
        consequence: 'SAFE! The golden rule: You can\'t win a lottery you never entered. Real lotteries never call demanding fees.',
        consequenceHindi: 'सुरक्षित! सुनहरा नियम: जिसमें भाग नहीं लिया, उसमें जीत नहीं सकते।'
      },
      {
        id: 'c',
        text: 'Ask them to deduct the fee from the prize money',
        textHindi: 'उनसे फीस इनाम की रकम से काटने को कहें',
        isCorrect: false,
        consequence: 'Still engaging with scammers! They\'ll make excuses about "tax laws" requiring separate payment. Just hang up!',
        consequenceHindi: 'अभी भी स्कैमर्स से बात कर रहे हैं! बस फोन काट दें!'
      }
    ],
    lesson: '🔑 KEY LESSON: You cannot win a contest you never entered. ALL lottery/prize calls asking for money are scams!',
    lessonHindi: '🔑 मुख्य सबक: जिसमें भाग नहीं लिया, उसमें जीत नहीं सकते। पैसे मांगने वाले सभी लॉटरी कॉल धोखा हैं!',
    tips: [
      'Can\'t win what you didn\'t enter',
      'Real prizes never require payment',
      'Jio/Airtel don\'t run lucky draws',
      'Never share bank details on calls'
    ],
    xpReward: 20
  },

  // ========== IMPERSONATION SCENARIOS ==========
  {
    id: 'impersonate_1',
    category: 'IMPERSONATION',
    difficulty: 'hard',
    title: 'The Fake Police Call',
    titleHindi: 'नकली पुलिस कॉल',
    scenario: `You receive a call:

"This is Sub-Inspector Sharma from Cyber Crime. Your Aadhaar has been used to open 3 bank accounts linked to money laundering. FIR #2847 is registered against you.

To avoid arrest, you must verify your identity by sharing your Aadhaar and bank details. Cooperate, or we'll send a team to arrest you."`,
    scenarioHindi: `कॉल आती है: "यह Cyber Crime से Sub-Inspector शर्मा बोल रहा हूं। आपके Aadhaar से 3 बैंक खाते खुले हैं। FIR #2847 दर्ज है। गिरफ्तारी से बचने के लिए अपना Aadhaar और बैंक डिटेल्स शेयर करें।"`,
    question: 'How should you respond?',
    questionHindi: 'आपको कैसे जवाब देना चाहिए?',
    options: [
      {
        id: 'a',
        text: 'Share details to prove innocence and avoid arrest',
        textHindi: 'निर्दोष साबित करने और गिरफ्तारी से बचने के लिए डिटेल्स दें',
        isCorrect: false,
        consequence: 'SCAMMED! Police NEVER ask for bank details over phone. Scammers use fear to make you act without thinking. You just gave them access to your accounts!',
        consequenceHindi: 'धोखा! पुलिस कभी फोन पर बैंक डिटेल्स नहीं मांगती। आपने उन्हें अपने खातों का एक्सेस दे दिया!'
      },
      {
        id: 'b',
        text: 'Hang up - real police don\'t threaten arrest over phone calls',
        textHindi: 'फोन काट दें - असली पुलिस फोन पर गिरफ्तारी की धमकी नहीं देती',
        isCorrect: true,
        consequence: 'SAFE! Police serve summons in person or through official legal channels. They never call demanding immediate bank details!',
        consequenceHindi: 'सुरक्षित! पुलिस व्यक्तिगत रूप से या आधिकारिक कानूनी चैनलों से समन देती है।'
      },
      {
        id: 'c',
        text: 'Ask for the police station address to visit and clarify',
        textHindi: 'पुलिस स्टेशन का पता पूछें और खुद जाकर स्पष्ट करें',
        isCorrect: true,
        consequence: 'SMART! If genuinely concerned, visit your local police station. But note: this is still a scam - real cyber crime cases don\'t work this way.',
        consequenceHindi: 'स्मार्ट! चिंतित हों तो अपने स्थानीय पुलिस स्टेशन जाएं। लेकिन यह धोखा है।'
      }
    ],
    lesson: '🔑 KEY LESSON: Police and government officials NEVER ask for bank/Aadhaar details over phone. "Digital Arrest" is a scam concept that doesn\'t exist!',
    lessonHindi: '🔑 मुख्य सबक: पुलिस और सरकारी अधिकारी कभी फोन पर बैंक/Aadhaar डिटेल्स नहीं मांगते। "Digital Arrest" एक धोखाधड़ी है!',
    tips: [
      'No "digital arrest" in Indian law',
      'Police serve summons in person',
      'Never share details on threatening calls',
      'Report to 1930 (Cyber Crime Helpline)'
    ],
    xpReward: 45
  }
]

// ============================================
// TRACK-BASED SCENARIO RELEVANCE MAPPING
// Maps scenario IDs to the tracks they are most relevant for.
// All scenarios are available to all tracks, but track-relevant ones are prioritized.
// ============================================

export const SCENARIO_TRACK_RELEVANCE = {
  // UPI fraud is universal but especially relevant for farmers and women new to digital
  upi_1: ['farmer', 'woman', 'student', 'young_adult'],
  upi_2: ['farmer', 'woman', 'young_adult'],
  // Phishing targets everyone but students & young adults are especially vulnerable online
  phishing_1: ['student', 'young_adult', 'woman'],
  phishing_2: ['young_adult', 'student'],
  // Loan scams target farmers (crop loans) and young adults (personal loans)
  loan_1: ['farmer', 'young_adult'],
  // Investment fraud targets young adults primarily
  investment_1: ['young_adult'],
  // KYC scams target everyone but especially women managing household bank accounts
  kyc_1: ['woman', 'farmer', 'young_adult'],
  // Job scams target students and young adults
  job_1: ['student', 'young_adult'],
  // Lottery scams target farmers and women
  lottery_1: ['farmer', 'woman'],
  // Impersonation targets women and farmers
  impersonation_1: ['woman', 'farmer'],
}

// ============================================
// GAME CONFIGURATION
// ============================================

export const SCAM_BUSTER_CONFIG = {
  name: 'Scam Buster',
  nameHindi: 'धोखाधड़ी बस्टर',
  description: 'Can you spot the scam before it\'s too late?',
  descriptionHindi: 'क्या आप समय रहते धोखा पहचान सकते हैं?',
  icon: '🕵️',
  themes: ['fraud_prevention', 'digital_finance'],
  difficulty: 'intermediate',
  
  // Gameplay settings
  scenariosPerGame: 5,
  timePerScenario: 60, // seconds (optional timer)
  showConsequences: true,
  
  // Scoring
  scoring: {
    correct: 100,
    partial: 50,
    incorrect: 0,
    perfectBonus: 200,
    speedBonus: true
  },
  
  // XP rewards
  xp: {
    complete: 75,
    perfect: 150,
    firstTime: 100
  }
}

/**
 * Get scenarios filtered by category, difficulty, and user track
 * Track-relevant scenarios are prioritized when a track is provided
 */
export function getScenarios(options = {}) {
  const { 
    category = null, 
    difficulty = null, 
    limit = null,
    random = true,
    track = null
  } = options
  
  let filtered = [...SCAM_SCENARIOS]
  
  if (category) {
    filtered = filtered.filter(s => s.category === category)
  }
  
  if (difficulty) {
    filtered = filtered.filter(s => s.difficulty === difficulty)
  }
  
  // If a user track is specified, prioritize track-relevant scenarios
  if (track) {
    const trackRelevant = filtered.filter(s => {
      const relevance = SCENARIO_TRACK_RELEVANCE[s.id]
      return relevance && relevance.includes(track)
    })
    const trackOther = filtered.filter(s => {
      const relevance = SCENARIO_TRACK_RELEVANCE[s.id]
      return !relevance || !relevance.includes(track)
    })
    // Put track-relevant scenarios first, then others
    filtered = [...trackRelevant, ...trackOther]
  }
  
  if (random) {
    // If track is specified, shuffle within priority groups
    if (track) {
      const trackRelevant = filtered.filter(s => {
        const relevance = SCENARIO_TRACK_RELEVANCE[s.id]
        return relevance && relevance.includes(track)
      })
      const trackOther = filtered.filter(s => {
        const relevance = SCENARIO_TRACK_RELEVANCE[s.id]
        return !relevance || !relevance.includes(track)
      })
      filtered = [
        ...trackRelevant.sort(() => Math.random() - 0.5),
        ...trackOther.sort(() => Math.random() - 0.5)
      ]
    } else {
      filtered = filtered.sort(() => Math.random() - 0.5)
    }
  }
  
  if (limit) {
    filtered = filtered.slice(0, limit)
  }
  
  return filtered
}

/**
 * Get all unique categories from scenarios
 */
export function getCategories() {
  const categories = new Set(SCAM_SCENARIOS.map(s => s.category))
  return Array.from(categories).map(id => SCAM_CATEGORIES[id])
}

export default SCAM_SCENARIOS
