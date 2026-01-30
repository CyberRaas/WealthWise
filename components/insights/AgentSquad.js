'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import ReactMarkdown from 'react-markdown'
import { toast } from 'react-hot-toast'

export default function AgentSquad() {
    const [agentType, setAgentType] = useState('Budget')
    const [agentResult, setAgentResult] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)
    const [agentForm, setAgentForm] = useState({
        income: 50000,
        expenses: 45000,
        categories: '',
        goalName: 'Europe Trip',
        target: 200000,
        months: 12,
        debtType: 'Credit Card',
        debtAmt: 50000,
        debtRate: 18,
        capital: 10000,
        scoutRisk: 'Balanced'
    })

    const handleAgentAction = async () => {
        setIsProcessing(true)
        try {
            let prompt = ""
            if (agentType === 'Budget') {
                prompt = `ROLE: Ruthless Financial Auditor. TASK: Analyze spending. Income: ${agentForm.income}, Expense: ${agentForm.expenses}. Problem Areas: ${agentForm.categories}. OUTPUT: 3 Cuts & Savings Potential.`
            } else if (agentType === 'Savings') {
                prompt = `ROLE: Lifestyle Architect. TASK: Gamified savings plan. GOAL: ${agentForm.target} for ${agentForm.goalName} in ${agentForm.months} months.`
            } else if (agentType === 'Debt') {
                prompt = `ROLE: War General for Debt. TASK: Battle plan. ENEMY: ${agentForm.debtType}, Amount: ${agentForm.debtAmt}, Rate: ${agentForm.debtRate}%. `
            } else {
                prompt = `ROLE: Sage Investment Scout. USER: Risk ${agentForm.scoutRisk}, Capital ${agentForm.capital}. OUTPUT: Golden Allocation & Why.`
            }

            const response = await fetch('/api/financial-model', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'agent',
                    prompt
                })
            })
            const data = await response.json()
            setAgentResult(data.result)

        } catch (error) {
            toast.error('Agent Failed')
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
                <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
                    <span className="text-2xl">🤖</span>
                </div>
                <div>
                    <h2 className="text-2xl font-bold">Agent Squad</h2>
                    <p className="text-slate-500">Deploy specialized AI agents for specific financial missions</p>
                </div>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
                <div className="col-span-1 space-y-2">
                    {['Budget', 'Savings', 'Debt', 'Investment'].map(type => (
                        <Button
                            key={type}
                            variant={agentType === type ? 'default' : 'outline'}
                            className="w-full justify-start"
                            onClick={() => setAgentType(type)}
                        >
                            {type === 'Budget' && '✂️ Budget Agent'}
                            {type === 'Savings' && '💰 Savings Agent'}
                            {type === 'Debt' && '📉 Debt Manager'}
                            {type === 'Investment' && '🔭 Investment Scout'}
                        </Button>
                    ))}
                </div>

                <Card className="col-span-1 md:col-span-3 border-indigo-100 dark:border-indigo-900/20 shadow-md">
                    <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b dark:border-slate-800">
                        <CardTitle>Mission Control</CardTitle>
                        <CardDescription>Configure your agent&apos;s mission parameters</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 p-6">
                        {agentType === 'Budget' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium uppercase text-slate-500">Monthly Income</label>
                                    <Input type="number" value={agentForm.income} onChange={e => setAgentForm({ ...agentForm, income: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium uppercase text-slate-500">Monthly Expenses</label>
                                    <Input type="number" value={agentForm.expenses} onChange={e => setAgentForm({ ...agentForm, expenses: e.target.value })} />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <label className="text-xs font-medium uppercase text-slate-500">Problem Areas</label>
                                    <Input placeholder="e.g. Dining, Shopping" value={agentForm.categories} onChange={e => setAgentForm({ ...agentForm, categories: e.target.value })} />
                                </div>
                            </div>
                        )}

                        {agentType === 'Savings' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium uppercase text-slate-500">Goal Name</label>
                                    <Input value={agentForm.goalName} onChange={e => setAgentForm({ ...agentForm, goalName: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium uppercase text-slate-500">Target Amount</label>
                                    <Input type="number" value={agentForm.target} onChange={e => setAgentForm({ ...agentForm, target: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium uppercase text-slate-500">Timeline (Months)</label>
                                    <Input type="number" value={agentForm.months} onChange={e => setAgentForm({ ...agentForm, months: e.target.value })} />
                                </div>
                            </div>
                        )}

                        {agentType === 'Debt' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium uppercase text-slate-500">Type</label>
                                    <Select value={agentForm.debtType} onValueChange={v => setAgentForm({ ...agentForm, debtType: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Credit Card">Credit Card</SelectItem>
                                            <SelectItem value="Personal Loan">Personal Loan</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium uppercase text-slate-500">Amount</label>
                                    <Input type="number" value={agentForm.debtAmt} onChange={e => setAgentForm({ ...agentForm, debtAmt: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium uppercase text-slate-500">Rate (%)</label>
                                    <Input type="number" value={agentForm.debtRate} onChange={e => setAgentForm({ ...agentForm, debtRate: e.target.value })} />
                                </div>
                            </div>
                        )}

                        {agentType === 'Investment' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium uppercase text-slate-500">Capital</label>
                                    <Input type="number" value={agentForm.capital} onChange={e => setAgentForm({ ...agentForm, capital: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium uppercase text-slate-500">Risk Profile</label>
                                    <Select value={agentForm.scoutRisk} onValueChange={v => setAgentForm({ ...agentForm, scoutRisk: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Conservative">Conservative</SelectItem>
                                            <SelectItem value="Balanced">Balanced</SelectItem>
                                            <SelectItem value="Aggressive">Aggressive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}

                        <Button
                            onClick={handleAgentAction}
                            disabled={isProcessing}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            {isProcessing ? 'Agent Working...' : 'Deploy Agent'}
                        </Button>

                        {agentResult && (
                            <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-lg border border-indigo-100 dark:border-indigo-900/50 text-sm mt-4 animate-in fade-in zoom-in-95 duration-300">
                                <div className="flex items-center gap-2 mb-4 text-indigo-600 font-semibold border-b pb-2">
                                    <span className="text-lg">⚡</span>
                                    <h3>Mission Report</h3>
                                </div>
                                <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
                                    <ReactMarkdown>
                                        {agentResult}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
