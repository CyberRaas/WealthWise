'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap, CheckCircle, XCircle, Flame, Clock,
  ChevronRight, Trophy, Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * DailyMicroChallenge
 * 
 * A 30-second daily financial literacy question.
 * Builds streaks, awards XP, and reinforces learning.
 * Rotates daily — one question per day.
 */

const MICRO_CHALLENGES = [
  // Budgeting
  {
    question: 'What percentage of income should go to savings according to the 50/30/20 rule?',
    questionHindi: '50/30/20 नियम के अनुसार आय का कितना % बचत में जाना चाहिए?',
    options: ['50%', '30%', '20%', '10%'],
    correct: 2,
    explanation: '20% of your income should go to savings and debt repayment.',
    theme: 'budgeting',
    xp: 25,
  },
  // Scam awareness
  {
    question: 'A "bank employee" calls asking for your OTP to block a suspicious transaction. What should you do?',
    questionHindi: 'एक "बैंक कर्मचारी" संदिग्ध लेनदेन रोकने के लिए OTP मांगता है। क्या करें?',
    options: ['Share OTP immediately', 'Hang up — banks never ask for OTP', 'Call back on the same number', 'Share only the last 2 digits'],
    correct: 1,
    explanation: 'Banks NEVER ask for OTP over phone. This is always a scam. Hang up and call your bank directly.',
    theme: 'scam',
    xp: 25,
  },
  // Investment
  {
    question: 'What is the minimum you can start a SIP (Systematic Investment Plan) with?',
    questionHindi: 'SIP शुरू करने की न्यूनतम राशि क्या है?',
    options: ['₹10,000', '₹5,000', '₹1,000', '₹500'],
    correct: 3,
    explanation: 'Many mutual funds allow SIPs starting at just ₹500/month, making investing accessible to everyone.',
    theme: 'investment',
    xp: 25,
  },
  // Insurance
  {
    question: 'Which type of insurance provides the highest coverage at the lowest premium?',
    questionHindi: 'कौन सा बीमा सबसे कम प्रीमियम पर सबसे ज्यादा कवरेज देता है?',
    options: ['Endowment Plan', 'ULIP', 'Term Insurance', 'Money Back Plan'],
    correct: 2,
    explanation: 'Term insurance is pure protection — no investment component — so it offers the highest cover at the lowest cost.',
    theme: 'insurance',
    xp: 25,
  },
  // Consumer rights
  {
    question: 'Up to what claim amount is filing at the District Consumer Forum FREE?',
    questionHindi: 'जिला उपभोक्ता फोरम में कितनी राशि तक का दावा मुफ्त है?',
    options: ['₹50,000', '₹1 lakh', '₹5 lakh', '₹10 lakh'],
    correct: 2,
    explanation: 'Under the Consumer Protection Act 2019, complaints at the District Forum are free for claims up to ₹5 lakh.',
    theme: 'consumer_rights',
    xp: 25,
  },
  // Tax
  {
    question: 'Under the new tax regime, up to what income is effectively tax-free?',
    questionHindi: 'नई टैक्स व्यवस्था में कितनी आय तक पर कर नहीं लगता?',
    options: ['₹3 lakh', '₹5 lakh', '₹7 lakh', '₹10 lakh'],
    correct: 2,
    explanation: 'With standard deduction and Section 87A rebate, income up to ₹7 lakh is effectively tax-free under the new regime.',
    theme: 'tax',
    xp: 25,
  },
  // Retirement
  {
    question: 'NPS gives an extra tax deduction of ₹50,000 under which section?',
    questionHindi: 'NPS किस धारा के तहत ₹50,000 की अतिरिक्त छूट देता है?',
    options: ['Section 80C', 'Section 80CCD(1B)', 'Section 80D', 'Section 24'],
    correct: 1,
    explanation: 'NPS provides an additional ₹50,000 deduction under Section 80CCD(1B), over and above the ₹1.5 lakh 80C limit.',
    theme: 'retirement',
    xp: 25,
  },
  // Credit
  {
    question: 'What is the ideal credit utilization ratio to maintain a good credit score?',
    questionHindi: 'अच्छा क्रेडिट स्कोर बनाए रखने के लिए क्रेडिट उपयोग अनुपात कितना होना चाहिए?',
    options: ['Below 30%', 'Below 50%', 'Below 80%', '100%'],
    correct: 0,
    explanation: 'Keeping credit card usage below 30% of your limit helps maintain a healthy credit score (750+).',
    theme: 'credit',
    xp: 25,
  },
  // Emergency fund
  {
    question: 'How many months of expenses should your emergency fund cover?',
    questionHindi: 'आपातकालीन फंड में कितने महीने के खर्चे होने चाहिए?',
    options: ['1 month', '3-6 months', '12 months', '24 months'],
    correct: 1,
    explanation: 'Financial experts recommend saving 3-6 months of expenses as an emergency fund before investing.',
    theme: 'savings',
    xp: 25,
  },
  // UPI
  {
    question: 'What should you ALWAYS check before scanning a QR code to pay someone?',
    questionHindi: 'किसी को भुगतान के लिए QR कोड स्कैन करने से पहले हमेशा क्या जांचें?',
    options: ['The amount only', 'The payee name matches the person/shop', 'Nothing — QR codes are always safe', 'Your phone battery'],
    correct: 1,
    explanation: 'Always verify the payee name displayed after scanning matches the seller/person. Scammers replace QR codes with their own.',
    theme: 'scam',
    xp: 25,
  },
  // Inflation
  {
    question: 'If inflation is 7% and your savings account gives 3.5%, your money is actually:',
    questionHindi: 'अगर महंगाई 7% है और बचत खाता 3.5% देता है, तो आपका पैसा वास्तव में:',
    options: ['Growing at 3.5%', 'Losing purchasing power at 3.5% per year', 'Staying the same', 'Growing at 7%'],
    correct: 1,
    explanation: 'Real return = Interest rate - Inflation. At 3.5% interest and 7% inflation, your money loses 3.5% value every year.',
    theme: 'investment',
    xp: 25,
  },
  // Compound interest
  {
    question: '₹1 lakh invested at 12% annual return becomes approximately how much in 6 years (Rule of 72)?',
    questionHindi: '₹1 लाख 12% वार्षिक रिटर्न पर 6 साल में लगभग कितना होगा (72 का नियम)?',
    options: ['₹1.72 lakh', '₹2 lakh', '₹3 lakh', '₹1.5 lakh'],
    correct: 1,
    explanation: 'The Rule of 72: divide 72 by the interest rate to find doubling time. 72/12 = 6 years. So ₹1 lakh doubles to ₹2 lakh.',
    theme: 'investment',
    xp: 25,
  },
  // Farmer-specific
  {
    question: 'Under PM Fasal Bima Yojana, what is the maximum premium a farmer has to pay for Kharif crops?',
    questionHindi: 'PM फसल बीमा योजना में खरीफ फसलों के लिए किसान को अधिकतम कितना प्रीमियम देना होता है?',
    options: ['5% of sum insured', '2% of sum insured', '10% of sum insured', '1.5% of sum insured'],
    correct: 1,
    explanation: 'Under PMFBY: Kharif crops max 2%, Rabi crops max 1.5%, commercial/horticultural crops max 5% of sum insured.',
    theme: 'insurance',
    xp: 25,
  },
  // Woman-specific
  {
    question: 'Mahila Samman Savings Certificate offers what interest rate with a 2-year tenure?',
    questionHindi: 'महिला सम्मान बचत प्रमाणपत्र 2 साल की अवधि पर कितने % ब्याज देता है?',
    options: ['6.5%', '7.5%', '8%', '5%'],
    correct: 1,
    explanation: 'Mahila Samman Savings Certificate offers 7.5% interest with a 2-year lock-in. Available for women and girls. Max investment ₹2 lakh.',
    theme: 'savings',
    xp: 25,
  },
]

// Get today's challenge index (cycles through challenges daily)
function getTodayChallengeIndex() {
  const today = new Date()
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000)
  return dayOfYear % MICRO_CHALLENGES.length
}

const STORAGE_KEY = 'wealthwise_daily_challenge'

function getChallengeState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch (e) {}
  return { streak: 0, lastCompleted: null, totalCompleted: 0 }
}

function saveChallengeState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {}
}

export default function DailyMicroChallenge({ compact = false, onXPEarned }) {
  const [state, setState] = useState({ streak: 0, lastCompleted: null, totalCompleted: 0 })
  const [selectedOption, setSelectedOption] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const [timerActive, setTimerActive] = useState(false)
  const [showChallenge, setShowChallenge] = useState(false)

  const todayIndex = useMemo(() => getTodayChallengeIndex(), [])
  const challenge = MICRO_CHALLENGES[todayIndex]

  // Load state
  useEffect(() => {
    const saved = getChallengeState()
    setState(saved)

    // Check if already completed today
    if (saved.lastCompleted) {
      const lastDate = new Date(saved.lastCompleted).toDateString()
      const today = new Date().toDateString()
      if (lastDate === today) {
        setAnswered(true)
      }
    }
  }, [])

  // Timer
  useEffect(() => {
    if (!timerActive || answered) return
    if (timeLeft <= 0) {
      handleAnswer(-1) // Time's up
      return
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(timer)
  }, [timerActive, timeLeft, answered])

  const startChallenge = () => {
    setShowChallenge(true)
    setTimerActive(true)
  }

  const handleAnswer = (idx) => {
    if (answered) return
    setSelectedOption(idx)
    setAnswered(true)
    setTimerActive(false)

    const isCorrect = idx === challenge.correct
    const today = new Date().toDateString()
    const lastDate = state.lastCompleted ? new Date(state.lastCompleted).toDateString() : null
    const yesterday = new Date(Date.now() - 86400000).toDateString()

    const isConsecutive = lastDate === yesterday
    const newStreak = isCorrect ? (isConsecutive ? state.streak + 1 : 1) : 0

    const newState = {
      streak: newStreak,
      lastCompleted: new Date().toISOString(),
      totalCompleted: state.totalCompleted + 1,
    }
    setState(newState)
    saveChallengeState(newState)

    if (isCorrect && onXPEarned) {
      const bonusXP = newStreak >= 7 ? 15 : newStreak >= 3 ? 10 : 0
      onXPEarned(challenge.xp + bonusXP)
    }
  }

  const isCorrect = selectedOption === challenge.correct
  const alreadyDone = answered && state.lastCompleted && new Date(state.lastCompleted).toDateString() === new Date().toDateString()

  // Compact mode: just show streak badge on dashboard
  if (compact) {
    return (
      <button
        onClick={() => !alreadyDone && startChallenge()}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
          alreadyDone
            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
            : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20 animate-pulse'
        }`}
      >
        {alreadyDone ? (
          <>
            <CheckCircle className="w-3.5 h-3.5" />
            Done today
          </>
        ) : (
          <>
            <Zap className="w-3.5 h-3.5" />
            Daily Challenge
          </>
        )}
        {state.streak > 0 && (
          <span className="flex items-center gap-0.5 ml-1 text-orange-500">
            <Flame className="w-3 h-3" />
            {state.streak}
          </span>
        )}
      </button>
    )
  }

  // Full card mode
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-white" />
          <h3 className="text-sm font-bold text-white">Daily Micro-Challenge</h3>
        </div>
        <div className="flex items-center gap-3">
          {state.streak > 0 && (
            <span className="flex items-center gap-1 text-xs font-bold text-white bg-white/20 px-2 py-0.5 rounded-full">
              <Flame className="w-3 h-3" />
              {state.streak} day streak
            </span>
          )}
          <span className="text-xs text-white/70">{state.totalCompleted} completed</span>
        </div>
      </div>

      <div className="p-4">
        {!showChallenge && !alreadyDone ? (
          /* Start prompt */
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-7 h-7 text-amber-500" />
            </div>
            <h4 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
              Ready for today&apos;s challenge?
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              30 seconds. 1 question. +{challenge.xp} XP.
            </p>
            <Button onClick={startChallenge} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 gap-2">
              <Zap className="w-4 h-4" />
              Start Challenge
            </Button>
          </div>
        ) : alreadyDone ? (
          /* Already completed today */
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
              <Trophy className="w-7 h-7 text-emerald-500" />
            </div>
            <h4 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
              Challenge completed!
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Come back tomorrow for a new question.
              {state.streak > 0 && ` Keep your ${state.streak}-day streak going! 🔥`}
            </p>
          </div>
        ) : (
          /* Question */
          <div>
            {/* Timer */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timeLeft}s remaining
              </span>
              <span className="text-xs font-medium text-amber-500">+{challenge.xp} XP</span>
            </div>
            <div className="h-1 bg-slate-100 dark:bg-white/5 rounded-full mb-4 overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${timeLeft > 10 ? 'bg-emerald-500' : timeLeft > 5 ? 'bg-amber-500' : 'bg-red-500'}`}
                initial={{ width: '100%' }}
                animate={{ width: `${(timeLeft / 30) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Question */}
            <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">
              {challenge.question}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
              {challenge.questionHindi}
            </p>

            {/* Options */}
            <div className="space-y-2">
              {challenge.options.map((option, idx) => {
                let optionStyle = 'border-slate-200 dark:border-white/10 hover:border-amber-300 dark:hover:border-amber-500/30 hover:bg-amber-50/50 dark:hover:bg-amber-500/5'
                if (answered) {
                  if (idx === challenge.correct) {
                    optionStyle = 'border-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 dark:border-emerald-500/40'
                  } else if (idx === selectedOption && !isCorrect) {
                    optionStyle = 'border-red-400 bg-red-50 dark:bg-red-500/10 dark:border-red-500/40'
                  } else {
                    optionStyle = 'border-slate-100 dark:border-white/5 opacity-50'
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    disabled={answered}
                    className={`w-full text-left p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${optionStyle}`}
                  >
                    <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300 flex-shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-sm text-slate-700 dark:text-slate-300 flex-1">{option}</span>
                    {answered && idx === challenge.correct && (
                      <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    )}
                    {answered && idx === selectedOption && !isCorrect && (
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Explanation */}
            <AnimatePresence>
              {answered && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 p-3 bg-slate-50 dark:bg-white/5 rounded-xl"
                >
                  <div className="flex items-start gap-2">
                    {isCorrect ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white mb-1">
                        {isCorrect ? 'Correct! 🎉' : 'Not quite — here\'s why:'}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {challenge.explanation}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
