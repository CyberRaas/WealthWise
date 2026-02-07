'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { GameEngine, calculateGameResult, USER_TRACKS, FINANCIAL_THEMES } from '@/lib/gameEngine'
import useSpeech from '@/hooks/useSpeech'
import {
  Trophy, Star, ArrowRight, CheckCircle, XCircle,
  RotateCcw, Sparkles, Brain, Target, TrendingUp,
  Volume2, VolumeX, Timer, Heart, Zap
} from 'lucide-react'

// ============================================
// QUESTION BANK — Track-Aware, Theme-Categorized
// ============================================
const QUESTION_BANK = {
  // ----- BUDGETING -----
  budgeting: [
    {
      id: 'b1',
      question: 'You earn ₹25,000/month. What is the 50-30-20 rule?',
      questionHindi: 'आप ₹25,000/महीना कमाते हैं। 50-30-20 नियम क्या है?',
      options: [
        { text: '50% needs, 30% wants, 20% savings', isCorrect: true },
        { text: '50% savings, 30% needs, 20% wants', isCorrect: false },
        { text: '50% wants, 30% savings, 20% needs', isCorrect: false },
        { text: '50% rent, 30% food, 20% fun', isCorrect: false },
      ],
      explanation: 'The 50-30-20 rule splits your income: 50% for needs (rent, food, bills), 30% for wants (entertainment, dining), and 20% for savings & investments.',
      difficulty: 'beginner',
      tracks: ['student', 'woman', 'farmer', 'young_adult'],
      theme: 'budgeting',
    },
    {
      id: 'b2',
      question: 'Your monthly grocery bill is ₹8,000. What\'s the best way to reduce it without cutting nutrition?',
      questionHindi: 'आपका मासिक किराना बिल ₹8,000 है। पोषण कम किए बिना इसे कैसे कम करें?',
      options: [
        { text: 'Buy in bulk from wholesale markets during sales', isCorrect: true },
        { text: 'Skip meals to save money', isCorrect: false },
        { text: 'Always buy the cheapest items regardless of quality', isCorrect: false },
        { text: 'Use credit card for all grocery shopping', isCorrect: false },
      ],
      explanation: 'Bulk buying from wholesale markets during sales events saves 15-30% without compromising nutrition. Planning meals and avoiding waste also helps.',
      difficulty: 'beginner',
      tracks: ['woman', 'farmer', 'student', 'young_adult'],
      theme: 'budgeting',
    },
    {
      id: 'b3',
      question: 'A farmer earns ₹3,00,000 during harvest season (4 months). How should this income be budgeted for the full year?',
      questionHindi: 'किसान फसल के मौसम (4 महीने) में ₹3,00,000 कमाता है। पूरे साल के लिए बजट कैसे बनाएं?',
      options: [
        { text: 'Divide total by 12 months = ₹25,000/month budget', isCorrect: true },
        { text: 'Spend freely during harvest, worry later', isCorrect: false },
        { text: 'Save all of it and borrow for daily expenses', isCorrect: false },
        { text: 'Invest everything in the stock market', isCorrect: false },
      ],
      explanation: 'Dividing seasonal income across 12 months (₹25,000/month) ensures consistent cash flow. Set aside money for lean months immediately after harvest.',
      difficulty: 'intermediate',
      tracks: ['farmer'],
      theme: 'budgeting',
    },
  ],

  // ----- SAVINGS -----
  savings: [
    {
      id: 's1',
      question: 'What is an emergency fund, and how much should you save?',
      questionHindi: 'आपातकालीन निधि क्या है, और कितनी बचत करनी चाहिए?',
      options: [
        { text: '3-6 months of essential expenses in a liquid account', isCorrect: true },
        { text: '1 month salary in cash at home', isCorrect: false },
        { text: 'All your money in a fixed deposit', isCorrect: false },
        { text: '₹10,000 in your wallet', isCorrect: false },
      ],
      explanation: 'An emergency fund = 3-6 months of essential expenses kept in a liquid savings account (NOT locked FD). It protects you from unexpected events like job loss or medical emergencies.',
      difficulty: 'beginner',
      tracks: ['student', 'woman', 'farmer', 'young_adult'],
      theme: 'savings',
    },
    {
      id: 's2',
      question: 'A Self Help Group (SHG) member saves ₹500/month. After 1 year, the group has ₹60,000. What is a good use?',
      questionHindi: 'SHG सदस्य ₹500/माह बचाती है। 1 साल बाद समूह के पास ₹60,000 है। अच्छा उपयोग क्या है?',
      options: [
        { text: 'Provide low-interest loans to members for productive purposes', isCorrect: true },
        { text: 'Distribute equally among members', isCorrect: false },
        { text: 'Keep all cash with the group leader', isCorrect: false },
        { text: 'Invest in cryptocurrency', isCorrect: false },
      ],
      explanation: 'SHG pooled savings work best when used for internal lending at reasonable rates for productive purposes (starting businesses, emergencies), building collective financial strength.',
      difficulty: 'intermediate',
      tracks: ['woman', 'farmer'],
      theme: 'savings',
    },
    {
      id: 's3',
      question: 'You are a student with ₹2,000 pocket money. How should you start saving?',
      questionHindi: 'आप ₹2,000 पॉकेट मनी वाले छात्र हैं। बचत कैसे शुरू करें?',
      options: [
        { text: 'Save at least 20% (₹400) first, then spend the rest', isCorrect: true },
        { text: 'Spend first, save whatever is left', isCorrect: false },
        { text: 'Save all of it, don\'t spend anything', isCorrect: false },
        { text: 'Lend it to friends for interest', isCorrect: false },
      ],
      explanation: '"Pay yourself first" — set aside savings before spending. Even ₹400/month = ₹4,800/year. Small consistent savings build the habit.',
      difficulty: 'beginner',
      tracks: ['student'],
      theme: 'savings',
    },
  ],

  // ----- FRAUD PREVENTION -----
  fraud_prevention: [
    {
      id: 'f1',
      question: 'You receive an SMS: "Your UPI account is blocked. Click here to reactivate." What should you do?',
      questionHindi: 'आपको SMS मिलता है: "आपका UPI अकाउंट ब्लॉक हो गया है। यहाँ क्लिक करें।" क्या करना चाहिए?',
      options: [
        { text: 'Ignore it — banks never send links via SMS to reactivate accounts', isCorrect: true },
        { text: 'Click the link and enter your PIN to fix it', isCorrect: false },
        { text: 'Forward it to your friends to warn them', isCorrect: false },
        { text: 'Call the number in the SMS', isCorrect: false },
      ],
      explanation: 'Banks NEVER send links to reactivate accounts via SMS. This is a phishing scam. If concerned, visit your bank branch or call the official helpline (not numbers in the SMS).',
      difficulty: 'beginner',
      tracks: ['student', 'woman', 'farmer', 'young_adult'],
      theme: 'fraud_prevention',
    },
    {
      id: 'f2',
      question: 'Someone calls claiming to be from your bank and asks for your OTP "for security verification". What is this?',
      questionHindi: 'कोई बैंक से कॉल करके "सुरक्षा सत्यापन" के लिए OTP मांगता है। यह क्या है?',
      options: [
        { text: 'A scam — banks never ask for OTP over phone', isCorrect: true },
        { text: 'A legitimate security check', isCorrect: false },
        { text: 'Normal bank procedure', isCorrect: false },
        { text: 'They need it to protect your account', isCorrect: false },
      ],
      explanation: 'OTP sharing = instant money theft. Your bank will NEVER call and ask for OTP, CVV, or PIN. Report such calls to cyber crime helpline 1930.',
      difficulty: 'beginner',
      tracks: ['student', 'woman', 'farmer', 'young_adult'],
      theme: 'fraud_prevention',
    },
    {
      id: 'f3',
      question: 'A "get rich quick" scheme promises 50% returns in 3 months with zero risk. What should you conclude?',
      questionHindi: '"3 महीने में 50% रिटर्न, शून्य जोखिम" — ऐसी योजना से क्या निष्कर्ष निकालें?',
      options: [
        { text: 'It\'s almost certainly a Ponzi/pyramid scheme — avoid it', isCorrect: true },
        { text: 'It sounds great, invest all savings', isCorrect: false },
        { text: 'Invest a small amount to test it', isCorrect: false },
        { text: 'It must be a government scheme', isCorrect: false },
      ],
      explanation: 'If it sounds too good to be true, it IS. Legitimate investments (FD: 6-7%, equity: 12-15% annually) never guarantee high returns with zero risk. Report such schemes to SEBI.',
      difficulty: 'intermediate',
      tracks: ['farmer', 'woman', 'young_adult', 'student'],
      theme: 'fraud_prevention',
    },
  ],

  // ----- INSURANCE -----
  insurance: [
    {
      id: 'i1',
      question: 'Which type of insurance is MOST essential for a family\'s financial protection?',
      questionHindi: 'परिवार की वित्तीय सुरक्षा के लिए कौन सा बीमा सबसे जरूरी है?',
      options: [
        { text: 'Health insurance + term life insurance', isCorrect: true },
        { text: 'Only vehicle insurance', isCorrect: false },
        { text: 'Only investment-linked insurance (ULIP)', isCorrect: false },
        { text: 'No insurance — save the premium money instead', isCorrect: false },
      ],
      explanation: 'Health insurance prevents medical bankruptcy (hospital bills can wipe out years of savings). Term life insurance protects dependents. Both are essential before any investment-linked insurance.',
      difficulty: 'beginner',
      tracks: ['woman', 'farmer', 'young_adult', 'student'],
      theme: 'insurance',
    },
    {
      id: 'i2',
      question: 'PM Fasal Bima Yojana — what does this cover for farmers?',
      questionHindi: 'पीएम फसल बीमा योजना — किसानों के लिए क्या कवर करती है?',
      options: [
        { text: 'Crop loss due to natural calamities, pests, and diseases', isCorrect: true },
        { text: 'Only flood damage', isCorrect: false },
        { text: 'Farmer\'s personal health', isCorrect: false },
        { text: 'Equipment breakdown', isCorrect: false },
      ],
      explanation: 'PMFBY covers crop losses from natural disasters, pests, diseases, and post-harvest losses. Premium: just 2% for Kharif, 1.5% for Rabi, and 5% for commercial crops.',
      difficulty: 'intermediate',
      tracks: ['farmer'],
      theme: 'insurance',
    },
  ],

  // ----- DIGITAL FINANCE -----
  digital_finance: [
    {
      id: 'd1',
      question: 'What is the safest way to use UPI (like PhonePe/GPay)?',
      questionHindi: 'UPI (PhonePe/GPay) का सबसे सुरक्षित उपयोग कैसे करें?',
      options: [
        { text: 'Set a strong PIN, verify receiver details before sending, never share QR/OTP', isCorrect: true },
        { text: 'Share your PIN with family for convenience', isCorrect: false },
        { text: 'Use the same PIN as your ATM card', isCorrect: false },
        { text: 'Scan any QR code people send you', isCorrect: false },
      ],
      explanation: 'UPI safety: unique PIN, verify receiver name before confirming, NEVER scan QR to receive money (QR is for SENDING only), and don\'t share OTP/PIN with anyone.',
      difficulty: 'beginner',
      tracks: ['student', 'woman', 'farmer', 'young_adult'],
      theme: 'digital_finance',
    },
  ],

  // ----- INVESTMENTS -----
  investments: [
    {
      id: 'inv1',
      question: 'What is a mutual fund SIP and why is it recommended for beginners?',
      questionHindi: 'म्यूचुअल फंड SIP क्या है और शुरुआती लोगों के लिए क्यों अनुशंसित है?',
      options: [
        { text: 'Regular fixed investment that averages out market ups and downs', isCorrect: true },
        { text: 'A fixed deposit with higher returns', isCorrect: false },
        { text: 'A government scheme for farmers only', isCorrect: false },
        { text: 'A type of insurance policy', isCorrect: false },
      ],
      explanation: 'SIP (Systematic Investment Plan) invests a fixed amount monthly, averaging purchase costs (rupee cost averaging). Start with as low as ₹500/month. Best for long-term wealth building.',
      difficulty: 'intermediate',
      tracks: ['young_adult', 'student'],
      theme: 'investments',
    },
    {
      id: 'inv2',
      question: 'Which of these is a safe government-backed savings scheme in India?',
      questionHindi: 'इनमें से कौन सी सरकार समर्थित सुरक्षित बचत योजना है?',
      options: [
        { text: 'PPF (Public Provident Fund) — 15 year lock-in, tax-free', isCorrect: true },
        { text: 'Cryptocurrency', isCorrect: false },
        { text: 'Chit funds run by local agents', isCorrect: false },
        { text: 'WhatsApp investment groups', isCorrect: false },
      ],
      explanation: 'PPF is government-backed with ~7.1% tax-free returns, 15-year maturity, and ₹1.5L annual tax deduction under Section 80C. Safest long-term savings instrument.',
      difficulty: 'beginner',
      tracks: ['farmer', 'woman', 'young_adult', 'student'],
      theme: 'investments',
    },
  ],

  // ----- CREDIT & LOANS -----
  credit: [
    {
      id: 'c1',
      question: 'You need ₹50,000 urgently. Which is the WORST option?',
      questionHindi: 'आपको तत्काल ₹50,000 चाहिए। सबसे खराब विकल्प कौन सा है?',
      options: [
        { text: 'Borrowing from a local moneylender at 5% monthly interest', isCorrect: true },
        { text: 'Personal loan from a bank at 12% annual interest', isCorrect: false },
        { text: 'Using your emergency fund', isCorrect: false },
        { text: 'Borrowing from family with a clear repayment plan', isCorrect: false },
      ],
      explanation: 'Local moneylender at 5% monthly = 60% per year! Bank personal loans (10-15% annual) are much cheaper. Emergency fund or family borrowing are even better if available.',
      difficulty: 'intermediate',
      tracks: ['farmer', 'woman', 'young_adult', 'student'],
      theme: 'credit',
    },
  ],

  // ----- CONSUMER RIGHTS -----
  consumer_rights: [
    {
      id: 'cr1',
      question: 'You bought a phone that stopped working in 2 months. The shop refuses warranty repair. What can you do?',
      questionHindi: 'आपका फोन 2 महीने में खराब हो गया। दुकान वारंटी मरम्मत से मना करती है। क्या करें?',
      options: [
        { text: 'File a complaint on National Consumer Helpline (1800-11-4000) or consumerhelpline.gov.in', isCorrect: true },
        { text: 'Nothing — once money is paid, you have no rights', isCorrect: false },
        { text: 'Post on social media and hope for the best', isCorrect: false },
        { text: 'Buy a new phone from a different shop', isCorrect: false },
      ],
      explanation: 'Under the Consumer Protection Act 2019, you can file complaints at District Consumer Forum, National Consumer Helpline (1800-11-4000), or consumerhelpline.gov.in. Free for claims under ₹5 lakh.',
      difficulty: 'beginner',
      tracks: ['student', 'woman', 'farmer', 'young_adult'],
      theme: 'consumer_rights',
    },
  ],

  // ----- TAXES -----
  taxes: [
    {
      id: 't1',
      question: 'You just got your first job with a CTC of ₹6,00,000/year. Is your income taxable?',
      questionHindi: 'आपकी पहली नौकरी CTC ₹6,00,000/साल है। क्या आपकी आय कर योग्य है?',
      options: [
        { text: 'Under the new tax regime, income up to ₹7,00,000 is effectively tax-free', isCorrect: true },
        { text: 'Yes, you must pay 30% tax on everything', isCorrect: false },
        { text: 'Students are exempt from all taxes', isCorrect: false },
        { text: 'Only business owners pay taxes', isCorrect: false },
      ],
      explanation: 'Under the new tax regime (FY 2024-25), income up to ₹3,00,000 is tax-free, and with a standard deduction of ₹75,000 and rebate under Section 87A, effectively ₹7,00,000 is tax-free.',
      difficulty: 'intermediate',
      tracks: ['young_adult', 'student'],
      theme: 'taxes',
    },
  ],
}

// ============================================
// HELPER — Select questions based on user track
// ============================================
function selectQuestions(userTrack, count = 10) {
  const allQuestions = []

  // Collect all questions matching this track
  Object.values(QUESTION_BANK).forEach(themeQuestions => {
    themeQuestions.forEach(q => {
      if (q.tracks.includes(userTrack) || !userTrack) {
        allQuestions.push(q)
      }
    })
  })

  // Shuffle and pick `count` questions, ensuring theme diversity
  const shuffled = allQuestions.sort(() => Math.random() - 0.5)
  const selected = []
  const usedThemes = new Set()

  // First pass: one per theme
  for (const q of shuffled) {
    if (!usedThemes.has(q.theme) && selected.length < count) {
      selected.push(q)
      usedThemes.add(q.theme)
    }
  }

  // Second pass: fill remaining slots
  for (const q of shuffled) {
    if (!selected.includes(q) && selected.length < count) {
      selected.push(q)
    }
  }

  return selected.sort(() => Math.random() - 0.5)
}

// ============================================
// COMPONENT
// ============================================
export default function FinancialFitnessTest({ userTrack = 'young_adult', onComplete, isPreTest = true }) {
  const [gameState, setGameState] = useState('intro') // intro | playing | review | results
  const [questions, setQuestions] = useState([])
  const [currentQ, setCurrentQ] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [isRevealed, setIsRevealed] = useState(false)
  const [answers, setAnswers] = useState([])
  const [timeLeft, setTimeLeft] = useState(30)
  const { voiceEnabled, toggleVoice, speak, stop } = useSpeech()
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)

  // Start game
  const startGame = useCallback(() => {
    const qs = selectQuestions(userTrack, 10)
    setQuestions(qs)
    setCurrentQ(0)
    setSelectedAnswer(null)
    setIsRevealed(false)
    setAnswers([])
    setTimeLeft(30)
    setStreak(0)
    setMaxStreak(0)
    setGameState('playing')
  }, [userTrack])

  // Timer
  useEffect(() => {
    if (gameState !== 'playing' || isRevealed) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time's up — auto-submit wrong
          handleAnswer(null)
          return 30
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState, isRevealed, currentQ])

  // Narrate question when it changes
  useEffect(() => {
    if (gameState === 'playing' && questions[currentQ] && voiceEnabled) {
      speak(questions[currentQ].question)
    }
  }, [currentQ, gameState, voiceEnabled])

  const handleAnswer = (optionIndex) => {
    if (isRevealed) return

    const question = questions[currentQ]
    const isCorrect = optionIndex !== null && question.options[optionIndex]?.isCorrect
    const newStreak = isCorrect ? streak + 1 : 0

    setSelectedAnswer(optionIndex)
    setIsRevealed(true)
    setStreak(newStreak)
    if (newStreak > maxStreak) setMaxStreak(newStreak)

    setAnswers(prev => [...prev, {
      questionId: question.id,
      theme: question.theme,
      selected: optionIndex,
      isCorrect,
      timeUsed: 30 - timeLeft,
    }])

    if (isCorrect && voiceEnabled) {
      speak('Correct!')
    } else if (!isCorrect && voiceEnabled) {
      speak('Not quite. ' + question.explanation)
    }
  }

  const nextQuestion = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(prev => prev + 1)
      setSelectedAnswer(null)
      setIsRevealed(false)
      setTimeLeft(30)
    } else {
      setGameState('results')
    }
  }

  // Calculate results
  const getResults = () => {
    const result = calculateGameResult(answers, questions.length, 'quiz')
    const themeScores = {}

    answers.forEach(a => {
      if (!themeScores[a.theme]) {
        themeScores[a.theme] = { correct: 0, total: 0 }
      }
      themeScores[a.theme].total++
      if (a.isCorrect) themeScores[a.theme].correct++
    })

    return { ...result, themeScores, maxStreak, avgTime: Math.round(answers.reduce((s, a) => s + a.timeUsed, 0) / answers.length) }
  }

  const handleComplete = () => {
    const results = getResults()
    
    // Save assessment to API for pre/post comparison
    const saveAssessment = async () => {
      try {
        const themeScoresArray = Object.entries(results.themeScores).map(([theme, data]) => ({
          theme,
          correct: data.correct,
          total: data.total,
          percentage: Math.round((data.correct / data.total) * 100)
        }))
        
        await fetch('/api/assessment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: isPreTest ? 'pre' : 'post',
            score: results.percentage,
            totalQuestions: questions.length,
            correctAnswers: results.correct,
            themeScores: themeScoresArray,
            timeTaken: results.avgTime * questions.length,
            earnedXP: results.earnedXP || 0,
            userTrack
          })
        })
      } catch (err) {
        console.error('Failed to save assessment:', err)
      }
    }
    saveAssessment()
    
    if (onComplete) {
      onComplete({
        ...results,
        isPreTest,
        userTrack,
        answers,
        timestamp: new Date().toISOString(),
      })
    }
  }

  const trackData = USER_TRACKS[userTrack] || USER_TRACKS.young_adult

  // ---- INTRO SCREEN ----
  if (gameState === 'intro') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <Card className="border-2 border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 shadow-xl">
          <CardContent className="p-8 text-center space-y-6">
            {/* Header */}
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center text-4xl shadow-lg">
              🏋️
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">
              Financial Fitness Test
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              {isPreTest
                ? 'Let\'s see where you stand! 10 real-world money questions adapted for your journey.'
                : 'Take the test again to see how much you\'ve learned! 📈'}
            </p>

            {/* Test info */}
            <div className="grid grid-cols-3 gap-4 py-4">
              <div className="text-center">
                <div className="text-2xl font-black text-amber-600">10</div>
                <div className="text-xs text-slate-500 font-medium">Questions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-amber-600">30s</div>
                <div className="text-xs text-slate-500 font-medium">Per Question</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-amber-600">🎯</div>
                <div className="text-xs text-slate-500 font-medium">{trackData.name}</div>
              </div>
            </div>

            {/* Themes covered */}
            <div className="flex flex-wrap justify-center gap-2">
              {trackData.financialThemes.map(theme => (
                <Badge key={theme} variant="secondary" className="bg-white/80 dark:bg-slate-800 text-xs">
                  {FINANCIAL_THEMES[theme]?.icon} {FINANCIAL_THEMES[theme]?.name}
                </Badge>
              ))}
            </div>

            {/* Voice toggle */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={toggleVoice}
                aria-label={voiceEnabled ? 'Disable voice narration' : 'Enable voice narration'}
                aria-pressed={voiceEnabled}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${voiceEnabled
                  ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
                  }`}
              >
                {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                {voiceEnabled ? 'Voice ON' : 'Voice OFF'}
              </button>
            </div>

            <Button
              size="lg"
              onClick={startGame}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/20 font-bold px-8 py-3 text-lg cursor-pointer"
            >
              <Zap className="w-5 h-5 mr-2" />
              {isPreTest ? 'Start Fitness Test' : 'Retake Test'}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // ---- PLAYING SCREEN ----
  if (gameState === 'playing' && questions[currentQ]) {
    const question = questions[currentQ]
    const themeData = FINANCIAL_THEMES[question.theme]

    return (
      <motion.div
        key={currentQ}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        className="max-w-2xl mx-auto space-y-4"
      >
        {/* Top bar — Progress + Timer + Voice */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
              {currentQ + 1}/{questions.length}
            </span>
            <Progress value={((currentQ + 1) / questions.length) * 100} className="w-32 h-2" />
          </div>

          <div className="flex items-center gap-3">
            {streak > 1 && (
              <Badge className="bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800 animate-pulse">
                🔥 {streak} streak
              </Badge>
            )}
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full font-bold text-sm ${timeLeft <= 10 ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
              <Timer className="w-3.5 h-3.5" />
              {timeLeft}s
            </div>
            <button
              onClick={toggleVoice}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label={voiceEnabled ? 'Disable voice narration' : 'Enable voice narration'}
              aria-pressed={voiceEnabled}
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4 text-emerald-500" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>
          </div>
        </div>

        {/* Question Card */}
        <Card className="border-2 border-slate-200 dark:border-slate-700 shadow-lg" role="region" aria-label={`Question ${currentQ + 1} of ${questions.length}`}>
          <CardContent className="p-6 space-y-6">
            {/* Theme badge */}
            <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-700 text-xs">
              {themeData?.icon} {themeData?.name}
            </Badge>

            {/* Question */}
            <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
              {question.question}
            </h3>
            {question.questionHindi && (
              <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                {question.questionHindi}
              </p>
            )}

            {/* Options */}
            <div className="space-y-3" role="group" aria-label="Answer options">
              {question.options.map((option, idx) => {
                const isSelected = selectedAnswer === idx
                const isCorrectOption = option.isCorrect
                let optionStyle = 'border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'

                if (isRevealed) {
                  if (isCorrectOption) {
                    optionStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 ring-2 ring-emerald-500/20'
                  } else if (isSelected && !isCorrectOption) {
                    optionStyle = 'border-red-500 bg-red-50 dark:bg-red-900/30 ring-2 ring-red-500/20'
                  } else {
                    optionStyle = 'border-slate-200 dark:border-slate-700 opacity-50'
                  }
                }

                return (
                  <motion.button
                    key={idx}
                    whileHover={!isRevealed ? { scale: 1.01 } : {}}
                    whileTap={!isRevealed ? { scale: 0.99 } : {}}
                    onClick={() => !isRevealed && handleAnswer(idx)}
                    disabled={isRevealed}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${optionStyle}`}
                    aria-label={`Option ${String.fromCharCode(65 + idx)}: ${option.text}${isRevealed && isCorrectOption ? ' (Correct answer)' : ''}${isRevealed && isSelected && !isCorrectOption ? ' (Your incorrect answer)' : ''}`}
                    aria-pressed={isSelected}
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-400">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="font-medium text-slate-800 dark:text-slate-200 flex-1">
                        {option.text}
                      </span>
                      {isRevealed && isCorrectOption && (
                        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      )}
                      {isRevealed && isSelected && !isCorrectOption && (
                        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      )}
                    </div>
                  </motion.button>
                )
              })}
            </div>

            {/* Explanation after reveal */}
            <AnimatePresence>
              {isRevealed && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4"
                  role="alert"
                  aria-live="polite"
                >
                  <div className="flex items-start gap-2">
                    <Brain className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-1">Explanation</p>
                      <p className="text-sm text-blue-700 dark:text-blue-400">{question.explanation}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Next button */}
            {isRevealed && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-end"
              >
                <Button onClick={nextQuestion} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer">
                  {currentQ < questions.length - 1 ? (
                    <>Next <ArrowRight className="w-4 h-4 ml-1" /></>
                  ) : (
                    <>See Results <Trophy className="w-4 h-4 ml-1" /></>
                  )}
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // ---- RESULTS SCREEN ----
  if (gameState === 'results') {
    const results = getResults()
    const trackColor = trackData.color === 'emerald' ? 'emerald' : trackData.color === 'pink' ? 'pink' : trackData.color === 'blue' ? 'blue' : 'violet'

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto space-y-6"
      >
        {/* Score Card */}
        <Card className="border-2 border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 shadow-xl overflow-hidden">
          <CardContent className="p-8 text-center space-y-6">
            {/* Grade */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
              className="w-24 h-24 mx-auto bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-xl"
            >
              <span className="text-4xl font-black text-white">{results.grade}</span>
            </motion.div>

            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              {isPreTest ? 'Your Financial Fitness Score' : 'Updated Fitness Score'}
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">{results.message}</p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4">
              <div className="text-center p-3 bg-white/80 dark:bg-slate-800 rounded-xl">
                <div className="text-2xl font-black text-emerald-600">{results.correct}/{results.total}</div>
                <div className="text-xs text-slate-500 font-medium">Correct</div>
              </div>
              <div className="text-center p-3 bg-white/80 dark:bg-slate-800 rounded-xl">
                <div className="text-2xl font-black text-amber-600">{results.percentage}%</div>
                <div className="text-xs text-slate-500 font-medium">Score</div>
              </div>
              <div className="text-center p-3 bg-white/80 dark:bg-slate-800 rounded-xl">
                <div className="text-2xl font-black text-orange-600">{results.maxStreak}</div>
                <div className="text-xs text-slate-500 font-medium">Best Streak 🔥</div>
              </div>
              <div className="text-center p-3 bg-white/80 dark:bg-slate-800 rounded-xl">
                <div className="text-2xl font-black text-violet-600">+{results.earnedXP}</div>
                <div className="text-xs text-slate-500 font-medium">XP Earned ⭐</div>
              </div>
            </div>

            {/* Theme-wise breakdown */}
            <div className="text-left space-y-3">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Target className="w-4 h-4" /> Theme Performance
              </h3>
              {Object.entries(results.themeScores).map(([theme, score]) => {
                const themeData = FINANCIAL_THEMES[theme]
                const pct = Math.round((score.correct / score.total) * 100)
                return (
                  <div key={theme} className="flex items-center gap-3">
                    <span className="text-lg">{themeData?.icon}</span>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex-1 min-w-0 truncate">
                      {themeData?.name}
                    </span>
                    <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-500 w-12 text-right">
                      {score.correct}/{score.total}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Button
                onClick={() => {
                  handleComplete()
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {isPreTest ? 'Start Learning Journey' : 'Continue Learning'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setGameState('intro')
                }}
                className="font-bold cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Retake Test
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return null
}
