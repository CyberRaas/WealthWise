'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslation } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, Send, Upload, User, Bot, Briefcase, TrendingUp, Shield, Zap, Brain, MessageSquare, Target } from 'lucide-react'
import { toast } from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'
import * as pdfjsLib from 'pdfjs-dist/build/pdf'
import { PERSONA_PROMPTS, KPI_DATA } from '@/lib/financeModel'

// Set worker for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

export default function FinancialModel() {
    const { t } = useTranslation()
    const [activePersona, setActivePersona] = useState('General')
    const [messages, setMessages] = useState([])
    const [chatInput, setChatInput] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)

    // RAG State
    const [knowledgeBase, setKnowledgeBase] = useState([])
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef(null)


    // War Room State
    const [warRoom, setWarRoom] = useState({
        p1: 'Growth',
        p2: 'CFP',
        arg1: 'Invest in Crypto',
        arg2: 'Pay off Home Loan',
        debate: ''
    })

    // Agent Squad State
    const [agentType, setAgentType] = useState('Budget')
    const [agentResult, setAgentResult] = useState('')
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



    // RAG: File Ingestion
    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files)
        if (files.length === 0) return

        setIsUploading(true)
        try {
            const newDocs = []

            for (const file of files) {
                if (file.type === 'application/pdf') {
                    const arrayBuffer = await file.arrayBuffer()
                    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
                    let fullText = ''

                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i)
                        const textContent = await page.getTextContent()
                        const pageText = textContent.items.map(item => item.str).join(' ')
                        fullText += `[Page ${i}] ${pageText}\n`
                    }
                    newDocs.push({ name: file.name, content: fullText, type: 'pdf' })
                } else if (file.type === 'text/csv' || file.type === 'text/plain') {
                    const text = await file.text()
                    newDocs.push({ name: file.name, content: text, type: 'text' })
                }
            }

            setKnowledgeBase(prev => [...prev, ...newDocs])
            toast.success(`Indexed ${newDocs.length} documents`)
        } catch (error) {
            console.error(error)
            toast.error('Failed to process files')
        } finally {
            setIsUploading(false)
        }
    }

    // RAG: Chat Logic
    const handleSendMessage = async () => {
        if (!chatInput.trim() || isProcessing) return

        const userMsg = { role: 'user', content: chatInput }
        setMessages(prev => [...prev, userMsg])
        setChatInput('')
        setIsProcessing(true)

        try {
            // Simple RAG: Context Stuffing (Limit to ~6000 chars for safety)
            let context = ""
            if (knowledgeBase.length > 0) {
                // Find relevant docs (Naïve matching for Vercel efficiency)
                const queryTerms = chatInput.toLowerCase().split(' ').filter(w => w.length > 3)
                const relevantSegments = []

                knowledgeBase.forEach(doc => {
                    if (queryTerms.some(term => doc.content.toLowerCase().includes(term))) {
                        // Take first 2000 chars of relevant docs
                        relevantSegments.push(`SOURCE (${doc.name}): ${doc.content.slice(0, 2000)}...`)
                    }
                })

                // If no keyword match, just take the most recent doc
                if (relevantSegments.length === 0) {
                    const latest = knowledgeBase[knowledgeBase.length - 1]
                    relevantSegments.push(`SOURCE (${latest.name}): ${latest.content.slice(0, 3000)}...`)
                }

                context = relevantSegments.join('\n\n')
            }


            const systemPrompt = `
        STRICT CONTEXT PROTOCOL:
        You are a Financial Forensic Analyst. Answer using the provided Context if available.
        If the answer is not in the context, use your general knowledge but mention "Based on general knowledge...".
        
        CITATION REQUIREMENT:
        - Use [Source: Filename] tags if using document data.
        
        CONTEXT:
        ${context}
        
        PERSONA:
        ${PERSONA_PROMPTS[activePersona]}
        `

            const response = await fetch('/api/financial-model', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'chat',
                    messages,
                    context,
                    personaPrompt: PERSONA_PROMPTS[activePersona],
                    userMessage: chatInput
                })
            })
            const data = await response.json()

            const aiMsg = { role: 'assistant', content: data.result || "Error generating response." }
            setMessages(prev => [...prev, aiMsg])

        } catch (error) {
            toast.error('AI Error')
            console.error(error)
        } finally {
            setIsProcessing(false)
        }
    }


    // War Room Logic
    const handleDebate = async () => {
        setIsProcessing(true)
        try {
            const response = await fetch('/api/financial-model', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'debate',
                    p1: warRoom.p1,
                    p2: warRoom.p2,
                    prompt: `${warRoom.arg1} VS ${warRoom.arg2}`,
                    persona1: PERSONA_PROMPTS[warRoom.p1],
                    persona2: PERSONA_PROMPTS[warRoom.p2]
                })
            })
            const data = await response.json()
            setWarRoom(prev => ({ ...prev, debate: data.result }))
        } catch (error) {
            toast.error('Debate Failed')
        } finally {
            setIsProcessing(false)
        }
    }

    // Agent Squad Logic
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




            {/* Usage Area */}
            <Tabs defaultValue="iq" className="w-full">
                <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5 h-auto">
                    <TabsTrigger value="iq" className="py-2 text-xs md:text-sm">🧠 Financial IQ</TabsTrigger>
                    <TabsTrigger value="war" className="py-2 text-xs md:text-sm">⚔️ War Room</TabsTrigger>
                    <TabsTrigger value="squad" className="py-2 text-xs md:text-sm">🤖 Agents</TabsTrigger>
                </TabsList>

                {/* TAB 1: RAG INTELLIGENCE */}
                <TabsContent value="iq" className="mt-4 space-y-4">
                    <Card className="h-[600px] flex flex-col">
                        <CardHeader className="py-3 px-4 border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <CardTitle className="text-sm font-medium">Document Intelligence (RAG)</CardTitle>
                                    <div className="flex items-center gap-2 scale-90 origin-left">
                                        <Select value={activePersona} onValueChange={setActivePersona}>
                                            <SelectTrigger className="w-[180px] h-8 text-xs bg-white dark:bg-slate-800">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="General">🧠 General</SelectItem>
                                                <SelectItem value="Budget Agent">✂️ Budget Agent</SelectItem>
                                                <SelectItem value="Savings Agent">💰 Savings Agent</SelectItem>
                                                <SelectItem value="Debt Manager">📉 Debt Manager</SelectItem>
                                                <SelectItem value="Investment Scout">🔭 Investment Scout</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="file"
                                        multiple
                                        accept=".pdf,.csv,.txt"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleFileUpload}
                                    />
                                    <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                                        <Upload className="w-3 h-3 mr-1" />
                                        {isUploading ? 'Indexing...' : 'Upload Docs'}
                                    </Button>
                                    <Badge variant="secondary">{knowledgeBase.length} docs</Badge>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.length === 0 && (
                                <div className="text-center text-slate-400 mt-20">
                                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                    <p>Upload statements or reports and ask questions.</p>
                                    <p className="text-xs mt-2">Try: &quot;Analyze my spending patterns&quot; or &quot;Suggest tax saving&quot;</p>
                                </div>
                            )}
                            {messages.map((m, i) => (
                                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-lg p-3 ${m.role === 'user'
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                                        }`}>
                                        <div className="prose prose-sm dark:prose-invert max-w-none">
                                            <ReactMarkdown>
                                                {m.content}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>

                        <div className="p-3 border-t dark:border-slate-700">
                            <div className="flex gap-2">
                                <Input
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    placeholder={`Ask the ${activePersona} about your files...`}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    disabled={isProcessing}
                                />
                                <Button onClick={handleSendMessage} disabled={isProcessing}>
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                </TabsContent>



                {/* TAB 3: WAR ROOM */}
                <TabsContent value="war" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="w-5 h-5 text-red-500" />
                                Strategic Decision Council
                            </CardTitle>
                            <CardDescription>Simulate a debate between two expert personas</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Proponent A</label>
                                    <Select value={warRoom.p1} onValueChange={(v) => setWarRoom({ ...warRoom, p1: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>{Object.keys(PERSONA_PROMPTS).map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                                    </Select>
                                    <Input
                                        value={warRoom.arg1}
                                        onChange={(e) => setWarRoom({ ...warRoom, arg1: e.target.value })}
                                        placeholder="Option A (e.g., Invest in Crypto)"
                                    />
                                </div>
                                <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Proponent B</label>
                                    <Select value={warRoom.p2} onValueChange={(v) => setWarRoom({ ...warRoom, p2: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>{Object.keys(PERSONA_PROMPTS).map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                                    </Select>
                                    <Input
                                        value={warRoom.arg2}
                                        onChange={(e) => setWarRoom({ ...warRoom, arg2: e.target.value })}
                                        placeholder="Option B (e.g., Pay off Loan)"
                                    />
                                </div>
                            </div>
                            <Button className="w-full bg-slate-900 text-white hover:bg-slate-800" onClick={handleDebate} disabled={isProcessing}>
                                {isProcessing ? 'Council Deliberating...' : '🔥 Convene Debate'}
                            </Button>

                            {warRoom.debate && (
                                <div className="p-6 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <div className="prose prose-sm dark:prose-invert max-w-none">
                                        <ReactMarkdown>
                                            {warRoom.debate}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAB 4: SIMULATOR */}


                {/* TAB 5: AGENT SQUAD */}
                <TabsContent value="squad" className="mt-4">
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

                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Mission Control</CardTitle>
                                <CardDescription>Configure your agent&apos;s mission parameters</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {agentType === 'Budget' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs">Monthly Income</label>
                                            <Input type="number" value={agentForm.income} onChange={e => setAgentForm({ ...agentForm, income: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs">Monthly Expenses</label>
                                            <Input type="number" value={agentForm.expenses} onChange={e => setAgentForm({ ...agentForm, expenses: e.target.value })} />
                                        </div>
                                        <div className="col-span-2 space-y-2">
                                            <label className="text-xs">Problem Areas</label>
                                            <Input placeholder="e.g. Dining, Shopping" value={agentForm.categories} onChange={e => setAgentForm({ ...agentForm, categories: e.target.value })} />
                                        </div>
                                    </div>
                                )}

                                {agentType === 'Savings' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs">Goal Name</label>
                                            <Input value={agentForm.goalName} onChange={e => setAgentForm({ ...agentForm, goalName: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs">Target Amount</label>
                                            <Input type="number" value={agentForm.target} onChange={e => setAgentForm({ ...agentForm, target: e.target.value })} />
                                        </div>
                                    </div>
                                )}

                                {agentType === 'Debt' && (
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs">Type</label>
                                            <Select value={agentForm.debtType} onValueChange={v => setAgentForm({ ...agentForm, debtType: v })}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Credit Card">Credit Card</SelectItem>
                                                    <SelectItem value="Personal Loan">Personal Loan</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs">Amount</label>
                                            <Input type="number" value={agentForm.debtAmt} onChange={e => setAgentForm({ ...agentForm, debtAmt: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs">Rate (%)</label>
                                            <Input type="number" value={agentForm.debtRate} onChange={e => setAgentForm({ ...agentForm, debtRate: e.target.value })} />
                                        </div>
                                    </div>
                                )}

                                <Button onClick={handleAgentAction} disabled={isProcessing}>
                                    {isProcessing ? 'Agent Working...' : 'Deploy Agent'}
                                </Button>

                                {agentResult && (
                                    <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-lg border text-sm mt-4">
                                        <div className="prose prose-sm dark:prose-invert max-w-none">
                                            <ReactMarkdown>
                                                {agentResult}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
