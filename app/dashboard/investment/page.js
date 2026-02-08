'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Loader2, TrendingUp, Search, Calculator } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import DashboardLayout from '@/components/layout/DashboardLayout'
import RiskAssessment from '@/components/investment/RiskAssessment'
import SchemeExplorer from '@/components/investment/SchemeExplorer'
import RecommendationDisplay from '@/components/investment/RecommendationDisplay'

const InvestmentSimulator = dynamic(
    () => import('@/components/dashboard/InvestmentSimulator'),
    { ssr: false }
)

export default function InvestmentPage() {
    const [riskProfile, setRiskProfile] = useState(null)
    const [loading, setLoading] = useState(true)

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
    }

    return (
        <DashboardLayout title="Investment">
            <Tabs defaultValue="simulator" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="simulator" className="gap-2">
                        <Calculator className="h-4 w-4" />
                        Simulator
                    </TabsTrigger>
                    <TabsTrigger value="recommendations" className="gap-2">
                        <TrendingUp className="h-4 w-4" />
                        My Plan
                    </TabsTrigger>
                    <TabsTrigger value="explore" className="gap-2">
                        <Search className="h-4 w-4" />
                        Explore
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="simulator">
                    <InvestmentSimulator />
                </TabsContent>

                <TabsContent value="recommendations">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : !riskProfile ? (
                        <RiskAssessment onComplete={handleAssessmentComplete} />
                    ) : (
                        <RecommendationDisplay
                            riskProfile={riskProfile}
                            onRetakeAssessment={() => setRiskProfile(null)}
                        />
                    )}
                </TabsContent>

                <TabsContent value="explore">
                    <SchemeExplorer />
                </TabsContent>
            </Tabs>
        </DashboardLayout>
    )
}
