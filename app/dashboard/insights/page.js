'use client'

import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles, ArrowRight, BrainCircuit, TrendingUp, ShieldCheck } from 'lucide-react'
import AgentSquad from '@/components/insights/AgentSquad'

export default function AIInsightsPage() {
    return (
        <DashboardLayout title="AI Insights">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Hero Section */}
                <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 md:p-12">
                    {/* Abstract curve background */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl"></div>

                    <div className="relative z-10 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-sm font-medium mb-6">
                            <Sparkles className="w-4 h-4" />
                            <span>WealthWise Intelligence</span>
                        </div>

                        <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
                            Unlock the power of <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">
                                AI Financial Analysis
                            </span>
                        </h2>

                        <p className="text-lg text-slate-300 mb-8 leading-relaxed max-w-xl">
                            Get personalized recommendations, spending anomaly detection, and wealth-building strategies tailored just for you.
                        </p>

                        <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 border-none font-semibold rounded-full px-8">
                            Generate Report
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </div>
                </section>

                {/* Feature Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FeatureCard
                        icon={BrainCircuit}
                        title="Smart Analysis"
                        description="Our AI analyzes your transaction patterns to identify savings opportunities you might have missed."
                        delay={0.1}
                    />
                    <FeatureCard
                        icon={TrendingUp}
                        title="Predictive Growth"
                        description="Forecast your net worth based on current habits and get actionable steps to improve it."
                        delay={0.2}
                    />
                    <FeatureCard
                        icon={ShieldCheck}
                        title="Risk Assessment"
                        description="Evaluate your portfolio's risk exposure and receive suggestions for better diversification."
                        delay={0.3}
                    />
                </div>

                {/* Agent Squad Section */}
                <AgentSquad />

                {/* Placeholder Content Area */}
                <div className="text-center py-20">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                        <Sparkles className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                        No Insights Generated Yet
                    </h3>
                    <p className="text-slate-500 max-w-md mx-auto">
                        Connect your accounts and track expenses for at least 7 days to unlock your first AI-powered financial report.
                    </p>
                </div>

            </div>
        </DashboardLayout>
    )
}

function FeatureCard({ icon: Icon, title, description, delay }) {
    return (
        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader>
                <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-4 text-emerald-600 dark:text-emerald-400">
                    <Icon className="w-6 h-6" />
                </div>
                <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <CardDescription className="text-base leading-relaxed">
                    {description}
                </CardDescription>
            </CardContent>
        </Card>
    )
}
