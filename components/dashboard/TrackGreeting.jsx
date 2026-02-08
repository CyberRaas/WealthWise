'use client'

import { useProfile } from '@/contexts/ProfileContext'
import { USER_TRACKS } from '@/lib/gameEngine'
import { Sprout, ShieldCheck, Coins, BookOpen, AlertTriangle, TrendingUp, Wallet, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

/**
 * Track-specific greeting & contextual tip for the dashboard.
 * Shows the persona icon, a personalized Hinglish greeting,
 * and an actionable financial tip tailored to their track.
 */

const TRACK_TIPS = {
  farmer: [
    { tip: 'Rabi season is approaching — have you planned your crop insurance?', tipHi: 'रबी सीजन आ रहा है — क्या आपने फसल बीमा की योजना बनाई?', icon: Sprout, action: '/dashboard/games', actionLabel: 'Learn about Insurance', color: 'emerald' },
    { tip: 'Set aside savings during harvest for lean months ahead.', tipHi: 'फसल कटाई के दौरान कमज़ोर महीनों के लिए बचत अलग रखें।', icon: Coins, action: '/dashboard/goals', actionLabel: 'Set Savings Goal', color: 'emerald' },
    { tip: 'Beware of fake seed agents — verify before buying!', tipHi: 'नकली बीज एजेंटों से सावधान रहें — खरीदने से पहले सत्यापित करें!', icon: AlertTriangle, action: '/dashboard/games', actionLabel: 'Play Scam Buster', color: 'amber' },
    { tip: 'PM Fasal Bima Yojana can protect you from crop loss. Explore it today.', tipHi: 'PM फसल बीमा योजना फसल हानि से बचा सकती है। आज जानें।', icon: ShieldCheck, action: '/dashboard/games', actionLabel: 'Insurance Academy', color: 'emerald' },
  ],
  woman: [
    { tip: 'Mahila Samman Savings Certificate offers 7.5% interest — better than gold!', tipHi: 'महिला सम्मान बचत पत्र 7.5% ब्याज देता है — सोने से बेहतर!', icon: Coins, action: '/dashboard/investment', actionLabel: 'Explore Schemes', color: 'pink' },
    { tip: 'Separate personal savings from household expenses for better control.', tipHi: 'बेहतर नियंत्रण के लिए व्यक्तिगत बचत को घरेलू खर्चों से अलग रखें।', icon: Wallet, action: '/dashboard/budget', actionLabel: 'Set up Budget', color: 'pink' },
    { tip: 'Digital payments are safe when you know the right UPI practices.', tipHi: 'सही UPI तरीके जानने पर डिजिटल भुगतान सुरक्षित हैं।', icon: ShieldCheck, action: '/dashboard/games', actionLabel: 'Play Scam Buster', color: 'rose' },
    { tip: 'Start a SHG savings group — ₹500/month can grow into a micro-business fund.', tipHi: 'SHG बचत समूह शुरू करें — ₹500/माह से लघु-व्यवसाय कोष बनाएं।', icon: TrendingUp, action: '/dashboard/goals', actionLabel: 'Set a Goal', color: 'pink' },
  ],
  student: [
    { tip: 'Your pocket money is your first salary — budgeting it wisely builds lifelong habits!', tipHi: 'आपकी जेब खर्ची आपकी पहली तनख्वाह है — इसे बुद्धिमानी से खर्च करें!', icon: BookOpen, action: '/dashboard/budget', actionLabel: 'Create Budget', color: 'blue' },
    { tip: 'Before buying, ask: "Do I need this or just want this?"', tipHi: 'खरीदने से पहले पूछें: "क्या मुझे इसकी ज़रुरत है या बस चाहत?"', icon: AlertTriangle, action: '/dashboard/games', actionLabel: 'Play Life Decisions', color: 'amber' },
    { tip: 'Friends spending big? It\'s okay to say no. Your future self will thank you.', tipHi: 'दोस्त बड़ा खर्च कर रहे हैं? ना कहना ठीक है। भविष्य में आप खुद को धन्यवाद देंगे।', icon: ShieldCheck, action: '/dashboard/games', actionLabel: 'Play Life Decisions', color: 'blue' },
    { tip: 'Start saving ₹100/week — in a year, you\'ll have ₹5,200! 🎯', tipHi: '₹100/सप्ताह बचाना शुरू करें — एक साल में ₹5,200 होंगे!', icon: Coins, action: '/dashboard/goals', actionLabel: 'Set Savings Goal', color: 'blue' },
  ],
  young_adult: [
    { tip: 'Your first salary = first chance to build wealth. Don\'t let lifestyle inflation eat it.', tipHi: 'पहली सैलरी = दौलत बनाने का पहला मौका। जीवनशैली मुद्रास्फीति को रोकें।', icon: TrendingUp, action: '/dashboard/budget', actionLabel: 'Plan Budget', color: 'violet' },
    { tip: 'ELSS mutual funds give you tax savings + market returns. Explore Section 80C.', tipHi: 'ELSS म्यूचुअल फंड टैक्स बचत + बाजार रिटर्न देते हैं। धारा 80C जानें।', icon: TrendingUp, action: '/dashboard/investment', actionLabel: 'Explore ELSS', color: 'violet' },
    { tip: 'That "guaranteed 30% return" offer is a scam. Always verify before investing.', tipHi: '"30% गारंटीड रिटर्न" का ऑफर स्कैम है। निवेश से पहले सत्यापित करें।', icon: AlertTriangle, action: '/dashboard/games', actionLabel: 'Play Scam Buster', color: 'red' },
    { tip: 'EMI feels easy but adds up fast. Calculate total cost before buying on credit.', tipHi: 'EMI आसान लगती है पर तेजी से बढ़ती है। क्रेडिट खरीदने से पहले कुल लागत गणना करें।', icon: Wallet, action: '/dashboard/debt', actionLabel: 'Manage Debt', color: 'violet' },
  ],
}

const TRACK_GREETINGS = {
  farmer: { greeting: 'Namaste, Kisan', greetingHi: 'नमस्ते, किसान', icon: '🌾' },
  woman: { greeting: 'Namaste', greetingHi: 'नमस्ते', icon: '👩' },
  student: { greeting: 'Hey there, Scholar', greetingHi: 'नमस्ते, विद्यार्थी', icon: '📚' },
  young_adult: { greeting: 'Hey', greetingHi: 'नमस्ते', icon: '💼' },
}

export default function TrackGreeting({ userName }) {
  const { userTrack } = useProfile()
  const router = useRouter()
  const track = userTrack || 'young_adult'
  const trackInfo = TRACK_GREETINGS[track] || TRACK_GREETINGS.young_adult
  const tips = TRACK_TIPS[track] || TRACK_TIPS.young_adult

  // Deterministic daily tip based on day-of-year
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
  const tip = tips[dayOfYear % tips.length]

  const colorMap = {
    emerald: 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/10 text-emerald-800 dark:text-emerald-200',
    pink: 'bg-pink-50 dark:bg-pink-500/5 border-pink-100 dark:border-pink-500/10 text-pink-800 dark:text-pink-200',
    blue: 'bg-blue-50 dark:bg-blue-500/5 border-blue-100 dark:border-blue-500/10 text-blue-800 dark:text-blue-200',
    violet: 'bg-violet-50 dark:bg-violet-500/5 border-violet-100 dark:border-violet-500/10 text-violet-800 dark:text-violet-200',
    amber: 'bg-amber-50 dark:bg-amber-500/5 border-amber-100 dark:border-amber-500/10 text-amber-800 dark:text-amber-200',
    red: 'bg-red-50 dark:bg-red-500/5 border-red-100 dark:border-red-500/10 text-red-800 dark:text-red-200',
    rose: 'bg-rose-50 dark:bg-rose-500/5 border-rose-100 dark:border-rose-500/10 text-rose-800 dark:text-rose-200',
  }

  const TipIcon = tip.icon

  return (
    <div className={`rounded-xl border p-4 ${colorMap[tip.color] || colorMap.violet}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <TipIcon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold mb-0.5">
            {trackInfo.icon} {tip.tip}
          </p>
          <p className="text-xs opacity-75 mb-2">{tip.tipHi}</p>
          <button
            onClick={() => router.push(tip.action)}
            className="inline-flex items-center gap-1 text-xs font-bold hover:underline"
          >
            {tip.actionLabel} <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  )
}
