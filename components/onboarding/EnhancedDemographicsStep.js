'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  MapPin,
  Users,
  User,
  Briefcase,
  Home,
  Car,
  Baby,
  Sparkles,
  Info
} from 'lucide-react'

// Indian cities for autocomplete
const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Ahmedabad',
  'Kolkata', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane',
  'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara', 'Ghaziabad',
  'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Varanasi',
  'Srinagar', 'Aurangabad', 'Dhanbad', 'Amritsar', 'Allahabad', 'Ranchi', 'Coimbatore'
]

const LIVING_SITUATIONS = [
  { value: 'with_parents', label: 'Living with parents/family', emoji: '🏡', impact: 'Lower housing costs' },
  { value: 'renting_alone', label: 'Renting alone', emoji: '🏢', impact: 'Full rent responsibility' },
  { value: 'renting_shared', label: 'Sharing flat/PG', emoji: '👥', impact: 'Shared housing costs' },
  { value: 'own_home', label: 'Own home (no EMI)', emoji: '🏠', impact: 'No housing payments' },
  { value: 'home_loan', label: 'Paying home loan EMI', emoji: '🏦', impact: 'Fixed housing obligation' }
]

const COMMUTE_MODES = [
  { value: 'wfh', label: 'Work from home', emoji: '💻' },
  { value: 'public_transport', label: 'Public transport', emoji: '🚇' },
  { value: 'two_wheeler', label: '2-wheeler', emoji: '🛵' },
  { value: 'four_wheeler', label: '4-wheeler', emoji: '🚗' },
  { value: 'cab_auto', label: 'Cab/Auto daily', emoji: '🚕' }
]

export default function EnhancedDemographicsStep({ profile, setProfile }) {
  const [localProfile, setLocalProfile] = useState({
    city: profile?.city || '',
    familySize: profile?.familySize || '',
    age: profile?.age || '',
    occupation: profile?.occupation || '',
    livingSituation: profile?.livingSituation || '',
    commuteMode: profile?.commuteMode || '',
    hasKids: profile?.hasKids || false,
    monthlyRent: profile?.monthlyRent || ''
  })

  const updateField = (field, value) => {
    const updated = { ...localProfile, [field]: value }
    setLocalProfile(updated)
    setProfile(prev => ({ ...prev, ...updated }))
  }

  // Calculate completion percentage
  const requiredFields = ['city', 'familySize', 'age', 'livingSituation']
  const completedRequired = requiredFields.filter(f => localProfile[f]).length
  const completion = Math.round((completedRequired / requiredFields.length) * 100)

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header with AI context */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            AI uses this to personalize your budget for your lifestyle
          </span>
        </div>
        <Badge variant="outline" className={`${completion === 100 ? 'border-emerald-500 text-emerald-700 dark:text-emerald-400' : 'dark:border-slate-600 dark:text-slate-400'}`}>
          {completion}% complete
        </Badge>
      </div>

      {/* Main Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* City - Essential */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            <MapPin className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            City <span className="text-red-500">*</span>
          </label>
          <Select
            value={localProfile.city}
            onValueChange={(value) => updateField('city', value)}
          >
            <SelectTrigger className="h-11 border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:border-emerald-500 rounded-lg">
              <SelectValue placeholder="Select your city" />
            </SelectTrigger>
            <SelectContent className="max-h-[280px] dark:bg-slate-800 dark:border-slate-700">
              {INDIAN_CITIES.map(city => (
                <SelectItem key={city} value={city} className="dark:text-slate-200 dark:focus:bg-emerald-900/30">{city}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Adjusts budget for local cost of living
          </p>
        </div>

        {/* Age - Essential */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            <User className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            Age <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            placeholder="e.g., 28"
            value={localProfile.age}
            onChange={(e) => updateField('age', e.target.value)}
            className="h-11 border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder:text-slate-500 focus:border-emerald-500 rounded-lg"
            min="18"
            max="100"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tailors investment & insurance advice
          </p>
        </div>

        {/* Family Size - Essential */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            <Users className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            Family Size <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            placeholder="How many members?"
            value={localProfile.familySize}
            onChange={(e) => updateField('familySize', e.target.value)}
            className="h-11 border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder:text-slate-500 focus:border-emerald-500 rounded-lg"
            min="1"
            max="15"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Scales food, healthcare, insurance needs
          </p>
        </div>

        {/* Occupation - Optional but valuable */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            <Briefcase className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            Occupation
          </label>
          <Input
            type="text"
            placeholder="e.g., Software Engineer"
            value={localProfile.occupation}
            onChange={(e) => updateField('occupation', e.target.value)}
            className="h-11 border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder:text-slate-500 focus:border-emerald-500 rounded-lg"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Provides industry-specific tax & investment tips
          </p>
        </div>
      </div>

      {/* Living Situation - Critical for housing budget */}
      <Card className="border-2 border-slate-200 dark:border-slate-600 dark:bg-slate-800/50">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Home className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            <h3 className="font-semibold text-slate-800 dark:text-white">Living Situation <span className="text-red-500">*</span></h3>
            <Badge variant="outline" className="ml-auto text-xs dark:border-slate-600 dark:text-slate-400">Major budget impact</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {LIVING_SITUATIONS.map(option => {
              const isSelected = localProfile.livingSituation === option.value
              return (
                <button
                  key={option.value}
                  onClick={() => updateField('livingSituation', option.value)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 dark:border-emerald-500'
                      : 'border-slate-200 dark:border-slate-600 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{option.emoji}</span>
                    <div>
                      <p className={`font-medium text-sm ${isSelected ? 'text-emerald-900 dark:text-emerald-300' : 'text-slate-700 dark:text-slate-200'}`}>
                        {option.label}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{option.impact}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Show rent input if renting */}
          {(localProfile.livingSituation === 'renting_alone' || localProfile.livingSituation === 'renting_shared') && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Monthly Rent (your share)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">₹</span>
                <Input
                  type="number"
                  placeholder="15,000"
                  value={localProfile.monthlyRent}
                  onChange={(e) => updateField('monthlyRent', e.target.value)}
                  className="pl-8 h-10 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder:text-slate-500"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Commute Mode - Important for transport budget */}
      <Card className="border border-slate-200 dark:border-slate-600 dark:bg-slate-800/50">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Car className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            <h3 className="font-medium text-slate-800 dark:text-white">Primary Commute Mode</h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {COMMUTE_MODES.map(mode => {
              const isSelected = localProfile.commuteMode === mode.value
              return (
                <button
                  key={mode.value}
                  onClick={() => updateField('commuteMode', mode.value)}
                  className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-600 hover:border-emerald-300 dark:hover:border-emerald-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {mode.emoji} {mode.label}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick toggle - Kids */}
      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-600">
        <div className="flex items-center gap-3">
          <Baby className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <div>
            <p className="font-medium text-slate-800 dark:text-white">Do you have children?</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Adds education & childcare categories</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => updateField('hasKids', false)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              localProfile.hasKids === false
                ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-2 border-emerald-500'
                : 'bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300'
            }`}
          >
            No
          </button>
          <button
            onClick={() => updateField('hasKids', true)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              localProfile.hasKids === true
                ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-2 border-emerald-500'
                : 'bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300'
            }`}
          >
            Yes
          </button>
        </div>
      </div>

      {/* Privacy note */}
      <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-blue-700 dark:text-blue-300">
          <span className="font-semibold">Your data is private.</span> This information is only used to
          generate your personalized budget and is never shared with anyone.
        </p>
      </div>
    </div>
  )
}
