'use client'

import { useProfile } from '@/contexts/ProfileContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import {
  Sprout, Cloud, Wheat, Sun,
  ShoppingBag, PiggyBank, Smartphone,
  BookOpen, Users, Sparkles,
  TrendingUp, CreditCard, FileText,
  ChevronRight, ArrowRight
} from 'lucide-react'

/**
 * TrackAdaptiveWidget
 * 
 * Shows track-specific content on the dashboard:
 * - Farmer: Crop calendar, agricultural expense categories
 * - Woman: Household vs self spending split, SHG tracker
 * - Student: Needs vs wants tracker, pocket money insights
 * - Young Adult: EMI exposure, investment portfolio overview
 * 
 * This makes the dashboard feel personalized per track.
 */

const TRACK_WIDGETS = {
  farmer: {
    title: 'Farm Finance Tracker',
    titleHi: 'कृषि वित्त ट्रैकर',
    icon: Sprout,
    color: 'text-emerald-500',
    iconBg: 'bg-emerald-50 dark:bg-emerald-500/10',
    sections: [
      {
        title: 'Crop Season Calendar',
        items: [
          { label: 'Rabi Season', detail: 'Oct-Mar — Wheat, Mustard, Pea', icon: Wheat, status: 'active' },
          { label: 'Kharif Season', detail: 'Jun-Sep — Rice, Cotton, Soybean', icon: Sun, status: 'upcoming' },
          { label: 'Zaid Season', detail: 'Mar-Jun — Watermelon, Cucumber', icon: Cloud, status: 'upcoming' },
        ]
      },
      {
        title: 'Farm Budget Categories',
        items: [
          { label: 'Seeds & Fertilizer', emoji: '🌱', tip: 'Buy from verified cooperative' },
          { label: 'Equipment Rental', emoji: '🚜', tip: 'Compare rates at mandi' },
          { label: 'Crop Insurance', emoji: '🛡️', tip: 'PM Fasal Bima Yojana' },
          { label: 'Labour & Wages', emoji: '👷', tip: 'Track daily/seasonal workers' },
        ]
      },
    ],
    schemes: [
      { name: 'PM Fasal Bima Yojana', desc: 'Crop insurance at 2% premium', link: '/dashboard/games' },
      { name: 'PM Kisan Samman Nidhi', desc: '₹6,000/year direct benefit', link: '/dashboard/goals' },
      { name: 'Kisan Credit Card', desc: 'Low-interest agri loans', link: '/dashboard/debt' },
    ]
  },
  woman: {
    title: 'Smart Savings Hub',
    titleHi: 'स्मार्ट बचत हब',
    icon: PiggyBank,
    color: 'text-pink-500',
    iconBg: 'bg-pink-50 dark:bg-pink-500/10',
    sections: [
      {
        title: 'Spending Categories',
        items: [
          { label: 'Household Expenses', emoji: '🏠', tip: 'Groceries, utilities, rent' },
          { label: 'Personal Savings', emoji: '💰', tip: 'Keep separate from household' },
          { label: 'Gold Savings', emoji: '✨', tip: 'Consider Mahila Samman Certificate instead — 7.5% returns' },
          { label: 'SHG Contribution', emoji: '🤝', tip: 'Self-Help Group monthly savings' },
        ]
      },
    ],
    schemes: [
      { name: 'Mahila Samman Savings Certificate', desc: '7.5% interest for women', link: '/dashboard/investment' },
      { name: 'Sukanya Samriddhi Yojana', desc: 'For daughter\'s education/marriage', link: '/dashboard/goals' },
      { name: 'PM Mudra Yojana', desc: 'Micro-business loans up to ₹10L', link: '/dashboard/debt' },
    ]
  },
  student: {
    title: 'Money Habits Tracker',
    titleHi: 'पैसे की आदत ट्रैकर',
    icon: BookOpen,
    color: 'text-blue-500',
    iconBg: 'bg-blue-50 dark:bg-blue-500/10',
    sections: [
      {
        title: 'Needs vs Wants Guide',
        items: [
          { label: '✅ Needs', detail: 'School fees, books, transport, healthy food', icon: BookOpen, isNeed: true },
          { label: '⚠️ Wants', detail: 'Gaming, branded clothes, eating out, gadgets', icon: ShoppingBag, isNeed: false },
        ]
      },
      {
        title: 'Pocket Money Rules',
        items: [
          { label: '50% — Needs', emoji: '📚', tip: 'Books, stationery, transport' },
          { label: '30% — Wants', emoji: '🎮', tip: 'Fun stuff, but plan it!' },
          { label: '20% — Savings', emoji: '🐷', tip: 'Even ₹100/week adds up!' },
        ]
      },
    ],
    schemes: [
      { name: 'Post Office RD', desc: 'Start with ₹100/month savings', link: '/dashboard/goals' },
      { name: 'Savings Challenge', desc: 'Save ₹100/week for 52 weeks = ₹5,200!', link: '/dashboard/goals' },
    ]
  },
  young_adult: {
    title: 'Career Finance Dashboard',
    titleHi: 'करियर वित्त डैशबोर्ड',
    icon: TrendingUp,
    color: 'text-violet-500',
    iconBg: 'bg-violet-50 dark:bg-violet-500/10',
    sections: [
      {
        title: 'First Salary Allocation',
        items: [
          { label: '50% — Essentials', emoji: '🏠', tip: 'Rent, food, transport, bills' },
          { label: '30% — Lifestyle', emoji: '☕', tip: 'Dining, entertainment, shopping' },
          { label: '20% — Investments', emoji: '📈', tip: 'SIP, PPF, ELSS for tax saving' },
        ]
      },
    ],
    schemes: [
      { name: 'ELSS Mutual Funds', desc: 'Tax saving under 80C + market returns', link: '/dashboard/investment' },
      { name: 'PPF Account', desc: 'Safe 7.1% returns, 15-year lock-in', link: '/dashboard/investment' },
      { name: 'Term Insurance', desc: '₹1Cr cover for ~₹700/month at age 25', link: '/dashboard/games' },
      { name: 'NPS (Pension)', desc: 'Extra ₹50K tax benefit under 80CCD', link: '/dashboard/investment' },
    ]
  },
}

export default function TrackAdaptiveWidget() {
  const { userTrack } = useProfile()
  const router = useRouter()
  const track = userTrack || 'young_adult'
  const widget = TRACK_WIDGETS[track] || TRACK_WIDGETS.young_adult
  const WidgetIcon = widget.icon

  return (
    <Card className="border-slate-100 dark:border-white/5 dark:bg-white/[0.03]">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <div className={`w-6 h-6 rounded-lg ${widget.iconBg} flex items-center justify-center`}>
            <WidgetIcon className={`w-3.5 h-3.5 ${widget.color}`} />
          </div>
          {widget.title}
          <span className="text-[10px] text-slate-400 font-normal ml-1">{widget.titleHi}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2 space-y-4">
        {/* Sections */}
        {widget.sections.map((section, sIdx) => (
          <div key={sIdx}>
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">{section.title}</p>
            <div className="space-y-1.5">
              {section.items.map((item, iIdx) => (
                <div key={iIdx} className="flex items-start gap-2.5 py-1.5 px-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors">
                  {item.emoji ? (
                    <span className="text-base mt-0.5">{item.emoji}</span>
                  ) : item.icon ? (
                    <item.icon className={`w-4 h-4 mt-0.5 ${item.status === 'active' ? 'text-emerald-500' : item.isNeed === false ? 'text-amber-500' : 'text-blue-500'}`} />
                  ) : null}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2">
                      {item.label}
                      {item.status === 'active' && (
                        <span className="text-[10px] bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded-full font-bold">Active</span>
                      )}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{item.detail || item.tip}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Government Schemes / Recommended Actions */}
        <div>
          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            {track === 'student' ? 'Saving Opportunities' : 'Recommended Schemes'}
          </p>
          <div className="space-y-1.5">
            {widget.schemes.map((scheme, idx) => (
              <button
                key={idx}
                onClick={() => router.push(scheme.link)}
                className="w-full flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-100 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10 hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-all text-left group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{scheme.name}</p>
                  <p className="text-xs text-slate-400">{scheme.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
