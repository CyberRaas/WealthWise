'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TrendingUp, Sparkles, Zap, Target } from 'lucide-react'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts'

import { generateInvestmentPlan } from '@/lib/financeModel'

export default function InvestmentSimulator() {


    // Investment State
    const [investParams, setInvestParams] = useState({
        risk: 'Moderate',
        amount: 10000,
        goal: 'Wealth Creation'
    })
    const [recommendations, setRecommendations] = useState(null)

    // Simulator State
    const [simParams, setSimParams] = useState({
        initial: 100000,
        monthly: 10000,
        rate: 12,
        years: 10
    })
    const [simData, setSimData] = useState([])
    const [radarData, setRadarData] = useState([])

    // Simulator Logic
    useEffect(() => {
        // 1. Growth Chart Calculation
        const data = []
        let currentAmount = simParams.initial
        let totalInvested = simParams.initial

        for (let i = 0; i <= simParams.years; i++) {
            data.push({
                year: `Year ${i}`,
                invested: Math.round(totalInvested),
                wealth: Math.round(currentAmount),
                interest: Math.round(currentAmount - totalInvested)
            })

            // Compounding for next year
            currentAmount = (currentAmount + (simParams.monthly * 12)) * (1 + (simParams.rate / 100))
            totalInvested += (simParams.monthly * 12)
        }
        setSimData(data)

        // 2. Health Radar Logic (Static Growth/Balanced Mix)
        const stats = [
            { subject: 'Savings', A: 65, fullMark: 100 },
            { subject: 'Debt', A: 80, fullMark: 100 },
            { subject: 'Growth', A: 85, fullMark: 100 },
            { subject: 'Risk', A: 70, fullMark: 100 },
            { subject: 'Insure', A: 75, fullMark: 100 },
        ]
        setRadarData(stats)

    }, [simParams])

    // Investment Logic
    const handleGeneratePlan = () => {
        const recs = generateInvestmentPlan(investParams.goal, investParams.risk, investParams.amount)
        setRecommendations(recs)
    }

    return (
        <div className="space-y-0.1">

            <div className="grid gap-8">
                {/* SECTION 1: INVESTMENT ENGINE */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg">
                            <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h2 className="text-xl font-bold">Investment Strategy</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <Card className="md:col-span-1 shadow-md border-emerald-100 dark:border-emerald-900/20">
                            <CardHeader>
                                <CardTitle>Plan Your Goals</CardTitle>
                                <CardDescription>AI-driven portfolio recommendations</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-xs font-medium text-slate-500">Risk Profile</label>
                                    <Select value={investParams.risk} onValueChange={(v) => setInvestParams({ ...investParams, risk: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Low">Low</SelectItem>
                                            <SelectItem value="Moderate">Moderate</SelectItem>
                                            <SelectItem value="High">High</SelectItem>
                                            <SelectItem value="Very High">Very High</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-500">Goal</label>
                                    <Select value={investParams.goal} onValueChange={(v) => setInvestParams({ ...investParams, goal: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Wealth Creation">Wealth Creation</SelectItem>
                                            <SelectItem value="Tax Saving">Tax Saving</SelectItem>
                                            <SelectItem value="Retirement">Retirement</SelectItem>
                                            <SelectItem value="Emergency Fund">Emergency Fund</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-500">Monthly Amount (₹)</label>
                                    <Input
                                        type="number"
                                        value={investParams.amount}
                                        onChange={(e) => setInvestParams({ ...investParams, amount: parseInt(e.target.value) })}
                                    />
                                </div>
                                <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={handleGeneratePlan}>Generate Investment Plan</Button>
                            </CardContent>
                        </Card>

                        <div className="md:col-span-2 space-y-4">
                            {recommendations ? (
                                <>
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-amber-500" />
                                        Recommended Portfolio
                                    </h3>
                                    <div className="grid gap-4">
                                        {recommendations.map((rec, i) => (
                                            <Card key={i} className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow">
                                                <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                                    <div>
                                                        <h4 className="font-bold text-emerald-700 dark:text-emerald-400 text-lg">{rec.name}</h4>
                                                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">{rec.desc}</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800">{rec.type}</Badge>
                                                            <Badge variant="outline" className="border-amber-200 text-amber-700 dark:text-amber-400">Risk: {rec.risk}</Badge>
                                                            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none">Avg ROI: {rec.roi}%</Badge>
                                                        </div>
                                                    </div>
                                                    <div className="text-right min-w-[120px] bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                                                        <p className="text-2xl font-bold text-slate-800 dark:text-white">₹{(investParams.amount / recommendations.length).toLocaleString()}</p>
                                                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Monthly SIP</p>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
                                    <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 shadow-sm">
                                        <TrendingUp className="w-8 h-8 text-emerald-500" />
                                    </div>
                                    <p className="text-slate-500 font-medium">Select your parameters and generate a plan</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <hr className="border-slate-200 dark:border-slate-800 my-4" />

                {/* SECTION 2: SIMULATOR */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                            <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h2 className="text-xl font-bold">Wealth Simulator</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {/* CONTROLS */}
                        <Card className="md:col-span-1 shadow-md border-purple-100 dark:border-purple-900/20">
                            <CardHeader>
                                <CardTitle>Projection Parameters</CardTitle>
                                <CardDescription>Adjust variables to forecast wealth.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium">Initial Investment (₹)</label>
                                    <Input
                                        type="number"
                                        value={simParams.initial}
                                        onChange={e => setSimParams({ ...simParams, initial: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <label className="text-xs font-medium">Monthly SIP (₹)</label>
                                        <span className="text-xs font-bold text-purple-600">₹{simParams.monthly}</span>
                                    </div>
                                    <Slider
                                        value={[simParams.monthly]}
                                        max={100000} step={500}
                                        className="[&>.relative>.absolute]:bg-purple-600"
                                        onValueChange={v => setSimParams({ ...simParams, monthly: v[0] })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <label className="text-xs font-medium">Exp. Return (%)</label>
                                        <span className="text-xs font-bold text-purple-600">{simParams.rate}%</span>
                                    </div>
                                    <Slider
                                        value={[simParams.rate]}
                                        max={30} step={0.5}
                                        className="[&>.relative>.absolute]:bg-purple-600"
                                        onValueChange={v => setSimParams({ ...simParams, rate: v[0] })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <label className="text-xs font-medium">Time Period (Years)</label>
                                        <span className="text-xs font-bold text-purple-600">{simParams.years} yrs</span>
                                    </div>
                                    <Slider
                                        value={[simParams.years]}
                                        max={40} step={1}
                                        className="[&>.relative>.absolute]:bg-purple-600"
                                        onValueChange={v => setSimParams({ ...simParams, years: v[0] })}
                                    />
                                </div>

                                <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-100 dark:border-purple-900">
                                    <CardContent className="p-4 text-center">
                                        <p className="text-xs text-slate-500 mb-1">Projected Wealth</p>
                                        <p className="text-2xl font-bold text-purple-600">
                                            ₹{simData[simData.length - 1]?.wealth.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-purple-500 mt-1">
                                            +₹{simData[simData.length - 1]?.interest.toLocaleString()} Gains
                                        </p>
                                    </CardContent>
                                </Card>
                            </CardContent>
                        </Card>

                        {/* VISUALIZATION */}
                        <div className="md:col-span-2 space-y-6">
                            <Card className="shadow-md">
                                <CardHeader>
                                    <CardTitle>Wealth Growth Trajectory</CardTitle>
                                </CardHeader>
                                <CardContent className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={simData}>
                                            <defs>
                                                <linearGradient id="colorWealth" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#9333ea" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#9333ea" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorInvest" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                            <XAxis dataKey="year" hide />
                                            <YAxis
                                                width={80}
                                                tickFormatter={(value) => {
                                                    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
                                                    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
                                                    if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
                                                    return value;
                                                }}
                                            />
                                            <RechartsTooltip
                                                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                                formatter={(value) => [`₹${value.toLocaleString()}`]}
                                            />
                                            <Area type="monotone" dataKey="wealth" stroke="#9333ea" fillOpacity={1} fill="url(#colorWealth)" name="Total Wealth" />
                                            <Area type="monotone" dataKey="invested" stroke="#6366f1" fillOpacity={1} fill="url(#colorInvest)" name="Invested Amount" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <div className="grid md:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm">Financial Wellness Spider</CardTitle>
                                    </CardHeader>
                                    <CardContent className="h-[200px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                                <PolarGrid />
                                                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                                                <Radar name="Score" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm">AI Projection Insight</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            Based on your <strong>Projection Parameters</strong> and <strong>{simParams.rate}%</strong> return expectation:
                                        </p>
                                        <ul className="list-disc list-inside mt-2 text-xs text-slate-500 space-y-1">
                                            <li>You will reach <strong>₹1 Crore</strong> in approximately {Math.ceil(Math.log(10000000 / simParams.initial) / Math.log(1 + simParams.rate / 100))} years.</li>
                                            <li>The &quot;Power of Compounding&quot; creates {Math.round((simData[simData.length - 1]?.interest / simData[simData.length - 1]?.wealth) * 100)}% of your final corpus.</li>
                                            <li>Consider increasing SIP by 10% annually to double this result.</li>
                                        </ul>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}
