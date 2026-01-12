'use client'

import { useState, useEffect } from 'react'
import RiskAssessment from '@/components/investment/RiskAssessment'
import RecommendationDisplay from '@/components/investment/RecommendationDisplay'
import SchemeExplorer from '@/components/investment/SchemeExplorer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Target,
  TrendingUp,
  Search,
  Loader2,
  ChevronLeft
} from 'lucide-react'

export default function InvestmentPage() {
  const [riskProfile, setRiskProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState('overview') // 'overview', 'assessment', 'explore'

  useEffect(() => {
    fetchRiskProfile()
  }, [])

  const fetchRiskProfile = async () => {
    try {
      const response = await fetch('/api/investment/risk-profile')
      const data = await response.json()

      if (data.success && data.profile) {
        setRiskProfile(data.profile)
      }
    } catch (error) {
      console.error('Error fetching risk profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAssessmentComplete = (profile) => {
    setRiskProfile(profile)
    setActiveView('overview')
  }

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto py-6 px-4">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  // Show risk assessment if no profile exists
  if (!riskProfile && activeView !== 'explore') {
    return (
      <div className="container max-w-2xl mx-auto py-6 px-4">
        <RiskAssessment
          onComplete={handleAssessmentComplete}
        />
      </div>
    )
  }

  // Show risk assessment view
  if (activeView === 'assessment') {
    return (
      <div className="container max-w-2xl mx-auto py-6 px-4">
        <RiskAssessment
          onComplete={handleAssessmentComplete}
          onBack={() => setActiveView('overview')}
        />
      </div>
    )
  }

  // Show scheme explorer view
  if (activeView === 'explore') {
    return (
      <div className="container max-w-4xl mx-auto py-6 px-4">
        <SchemeExplorer onBack={() => setActiveView('overview')} />
      </div>
    )
  }

  // Main overview with recommendations
  return (
    <div className="container max-w-4xl mx-auto py-6 px-4">
      <Tabs defaultValue="recommendations" className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Investment Guide</h1>
          <TabsList>
            <TabsTrigger value="recommendations" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              My Plan
            </TabsTrigger>
            <TabsTrigger value="explore" className="gap-2">
              <Search className="h-4 w-4" />
              Explore
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="recommendations">
          <RecommendationDisplay
            riskProfile={riskProfile}
            onRetakeAssessment={() => setActiveView('assessment')}
          />
        </TabsContent>

        <TabsContent value="explore">
          <SchemeExplorer />
        </TabsContent>
      </Tabs>
    </div>
  )
}
