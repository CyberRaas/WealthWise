'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import DashboardLayout from '@/components/layout/DashboardLayout'
import LanguageSelector from '@/components/ui/LanguageSelector'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Calculator,
  Bot,
  Send,
  TrendingUp,
  DollarSign,
  Calendar,
  PieChart,
  Lightbulb,
  User,
  MessageCircle,
  Copy,
  Check
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { toast } from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// Enhanced EMI Calculator Component
function EMICalculator({ onCalculate }) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    principal: '',
    interestRate: '',
    duration: '',
    durationType: 'months',
    compoundingFrequency: 'monthly'
  })
  
  const [results, setResults] = useState(null)
  const [chartData, setChartData] = useState([])
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.principal || parseFloat(formData.principal) <= 0) {
      newErrors.principal = t('debtCalculator.validPrincipalError')
    }
    
    if (!formData.interestRate || parseFloat(formData.interestRate) < 0) {
      newErrors.interestRate = t('debtCalculator.validInterestError')
    }
    
    if (!formData.duration || parseInt(formData.duration) <= 0) {
      newErrors.duration = t('debtCalculator.validDurationError')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const calculateEMI = () => {
    if (!validateForm()) {
      toast.error(t('debtCalculator.fixFormErrors'))
      return
    }

    const { principal, interestRate, duration, durationType } = formData
    
    const P = parseFloat(principal)
    const annualRate = parseFloat(interestRate) / 100
    const months = durationType === 'years' ? parseInt(duration) * 12 : parseInt(duration)
    const monthlyRate = annualRate / 12

    // EMI Calculation with proper compound interest
    let emi = 0
    if (monthlyRate > 0) {
      emi = P * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
    } else {
      emi = P / months
    }

    const totalPayable = emi * months
    const totalInterest = totalPayable - P

    const calculationResults = {
      emi: emi,
      totalPayable: totalPayable,
      totalInterest: totalInterest,
      months: months,
      principal: P,
      interestRate: parseFloat(interestRate),
      monthlyRate: monthlyRate
    }

    setResults(calculationResults)
    generateChartData(calculationResults)
    onCalculate(calculationResults)
    toast.success('EMI calculated successfully!')
  }

  const generateChartData = (results) => {
    const data = []
    let remainingPrincipal = results.principal
    let cumulativeInterest = 0
    
    for (let month = 1; month <= Math.min(results.months, 120); month++) {
      const interestPayment = remainingPrincipal * results.monthlyRate
      const principalPayment = results.emi - interestPayment
      remainingPrincipal = Math.max(0, remainingPrincipal - principalPayment)
      cumulativeInterest += interestPayment
      
      data.push({
        month,
        remainingPrincipal: Math.round(remainingPrincipal),
        cumulativeInterest: Math.round(cumulativeInterest),
        principalPayment: Math.round(principalPayment),
        interestPayment: Math.round(interestPayment)
      })
    }
    
    setChartData(data)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  return (
    <div className="space-y-6">
      {/* Calculator Form */}
      <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-slate-800 text-lg sm:text-xl">
            <Calculator className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-green-600" />
            {t('debtCalculator.title')}
          </CardTitle>
          <p className="text-xs sm:text-sm text-slate-600">
            {t('debtCalculator.subtitle')}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Principal Amount */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                {t('debtCalculator.loanAmount')} (₹) *
              </label>
              <input
                type="number"
                value={formData.principal}
                onChange={(e) => setFormData({...formData, principal: e.target.value})}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                  errors.principal ? 'border-red-500' : 'border-slate-300'
                }`}
                placeholder={t('debtCalculator.loanAmount')}
                min="0"
              />
              {errors.principal && (
                <p className="text-red-500 text-xs mt-1">{errors.principal}</p>
              )}
            </div>

            {/* Interest Rate */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                {t('debtCalculator.interestRate')} (% {t('common.perAnnum')}) *
              </label>
              <input
                type="number"
                value={formData.interestRate}
                onChange={(e) => setFormData({...formData, interestRate: e.target.value})}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                  errors.interestRate ? 'border-red-500' : 'border-slate-300'
                }`}
                placeholder={t('debtCalculator.interestRate')}
                min="0"
                max="50"
                step="0.01"
              />
              {errors.interestRate && (
                <p className="text-red-500 text-xs mt-1">{errors.interestRate}</p>
              )}
            </div>
          </div>

          {/* Duration and Compounding Frequency Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Duration */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">
                {t('debtCalculator.loanTerm')} *
              </label>
              <div className="space-y-3">
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                    errors.duration ? 'border-red-500' : 'border-slate-300'
                  }`}
                  placeholder={t('debtCalculator.enterDuration')}
                  min="1"
                />
                <select
                  value={formData.durationType}
                  onChange={(e) => setFormData({...formData, durationType: e.target.value})}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white transition-colors hover:border-green-400"
                >
                  <option value="months">{t('common.months')}</option>
                  <option value="years">{t('common.years')}</option>
                </select>
              </div>
              {errors.duration && (
                <p className="text-red-500 text-xs mt-1">{errors.duration}</p>
              )}
            </div>

            {/* Compounding Frequency */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">
                {t('debtCalculator.compoundingFrequency')}
              </label>
              <div className="space-y-2">
                <select
                  value={formData.compoundingFrequency}
                  onChange={(e) => setFormData({...formData, compoundingFrequency: e.target.value})}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white transition-colors hover:border-green-400"
                >
                  <option value="monthly">{t('common.monthly')}</option>
                  <option value="quarterly">{t('common.quarterly')}</option>
                  <option value="annually">{t('common.annually')}</option>
                </select>
                <p className="text-xs text-slate-500">
                  {t('debtCalculator.compoundingDescription')}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button
              onClick={calculateEMI}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 text-base sm:text-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Calculator className="w-5 h-5 mr-2" />
              {t('debtCalculator.calculate')} EMI
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-white border-blue-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-4 sm:p-6 text-center">
              <DollarSign className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 text-blue-600" />
              <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-1">Monthly EMI</h3>
              <p className="text-xl sm:text-2xl font-bold text-blue-600 mb-2">{formatCurrency(results.emi)}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(results.emi.toFixed(0))}
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                <Copy className="w-3 h-3 mr-1" />
                Copy
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white border-green-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-4 sm:p-6 text-center">
              <TrendingUp className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 text-green-600" />
              <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-1">Total Payable</h3>
              <p className="text-xl sm:text-2xl font-bold text-green-600 mb-2">{formatCurrency(results.totalPayable)}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(results.totalPayable.toFixed(0))}
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                <Copy className="w-3 h-3 mr-1" />
                Copy
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white border-red-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-4 sm:p-6 text-center">
              <PieChart className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 text-red-600" />
              <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-1">Total Interest</h3>
              <p className="text-xl sm:text-2xl font-bold text-red-600 mb-2">{formatCurrency(results.totalInterest)}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(results.totalInterest.toFixed(0))}
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                <Copy className="w-3 h-3 mr-1" />
                Copy
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Repayment Timeline Chart */}
      {chartData.length > 0 && (
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center text-slate-800 text-base sm:text-lg">
              <Calendar className="w-5 h-5 mr-2 text-purple-600" />
              Repayment Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={(value) => `₹${(value/1000).toFixed(0)}K`}
                  />
                  <Tooltip 
                    formatter={(value, name) => [formatCurrency(value), name]}
                    labelStyle={{ color: '#1f2937' }}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="remainingPrincipal" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Remaining Principal"
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cumulativeInterest" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    name="Cumulative Interest"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function LoanAdvisorChat({ calculationResults, onInsightGenerated }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: `👋 **Hi! I'm your AI Loan Advisor.**

I can help you with:
• **EMI calculations** and comparisons
• **Debt repayment strategies** (snowball vs avalanche)
• **Bank recommendations** with current rates
• **Credit score** improvement tips
• **Loan optimization** strategies

**Try asking:**
- "Calculate EMI for ₹5L at 10% for 2 years"
- "Which repayment strategy is better?"
- "Best banks for personal loans?"

What would you like to know?`,
      timestamp: new Date()
    }
  ])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copiedId, setCopiedId] = useState(null)
  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Enhanced AI that can use calculation context
  const getContextualPrompt = (userMessage) => {
    let prompt = userMessage
    
    if (calculationResults) {
      prompt += `\n\nContext: User just calculated EMI with these details:
      - Principal: ₹${calculationResults.principal.toLocaleString()}
      - Interest Rate: ${calculationResults.interestRate}%
      - Duration: ${calculationResults.months} months
      - Monthly EMI: ₹${calculationResults.emi.toFixed(0)}
      - Total Interest: ₹${calculationResults.totalInterest.toFixed(0)}
      
      Please provide advice relevant to these calculations.`
    }
    
    return prompt
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: newMessage.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setNewMessage('')
    setIsLoading(true)

    try {
      const contextualMessage = getContextualPrompt(userMessage.content)
      
      const response = await fetch('/api/loan-advisor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          message: contextualMessage,
          calculationData: calculationResults 
        })
      })

      const data = await response.json()

      if (response.ok) {
        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: data.response,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, botMessage])
        
        // Generate insight for the insights card
        if (data.response.includes('save') || data.response.includes('reduce') || data.response.includes('strategy')) {
          onInsightGenerated(data.response)
        }
      } else {
        throw new Error(data.error || 'Failed to get response')
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: '🚫 Sorry, I encountered an error. Please try again or ask a different question.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
      toast.error('Failed to get AI response')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const copyMessage = async (content, messageId) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedId(messageId)
      toast.success('Message copied!')
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      toast.error('Failed to copy message')
    }
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  // Quick action buttons for common queries
  const quickActions = [
    "Calculate EMI for ₹10L at 12% for 5 years",
    "Best repayment strategy for multiple loans?",
    "How to improve my credit score?",
    "Which banks offer lowest interest rates?"
  ]

  const handleQuickAction = (action) => {
    setNewMessage(action)
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 h-full flex flex-col">
      <CardHeader className="pb-4 border-b border-blue-100">
        <CardTitle className="flex items-center text-slate-800 text-lg sm:text-xl">
          <Bot className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-blue-600" />
          AI Loan Advisor
        </CardTitle>
        <p className="text-xs sm:text-sm text-slate-600">
          Get personalized loan advice and strategies
        </p>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-4 min-h-0">
        {/* Quick Actions */}
        {messages.length <= 1 && (
          <div className="mb-4">
            <p className="text-xs text-slate-500 mb-2">Quick questions:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction(action)}
                  className="text-xs text-left h-auto p-2 border-blue-200 hover:bg-blue-50"
                >
                  {action}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div 
          ref={chatContainerRef}
          className="flex-1 space-y-4 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50"
          style={{ maxHeight: 'calc(100vh - 400px)', minHeight: '300px' }}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-[85%] sm:max-w-[80%] ${
                message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
              } items-start gap-2 sm:gap-3`}>
                {/* Avatar */}
                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.type === 'user' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-blue-500 text-white'
                }`}>
                  {message.type === 'user' ? (
                    <User className="w-3 h-3 sm:w-4 sm:h-4" />
                  ) : (
                    <Bot className="w-3 h-3 sm:w-4 sm:h-4" />
                  )}
                </div>
                
                {/* Message Bubble */}
                <div className={`group rounded-2xl px-3 py-2 sm:px-4 sm:py-3 ${
                  message.type === 'user'
                    ? 'bg-green-500 text-white rounded-br-md'
                    : 'bg-white text-slate-800 rounded-bl-md border shadow-sm'
                }`}>
                  <div className="prose prose-sm max-w-none">
                    {message.type === 'bot' ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0 text-xs sm:text-sm leading-relaxed">{children}</p>,
                          ul: ({ children }) => <ul className="mb-2 last:mb-0 text-xs sm:text-sm space-y-1">{children}</ul>,
                          ol: ({ children }) => <ol className="mb-2 last:mb-0 text-xs sm:text-sm space-y-1">{children}</ol>,
                          li: ({ children }) => <li className="ml-4">{children}</li>,
                          strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
                          h1: ({ children }) => <h1 className="text-sm sm:text-base font-bold mb-2 text-slate-900">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-sm font-semibold mb-2 text-slate-900">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-xs sm:text-sm font-semibold mb-1 text-slate-900">{children}</h3>,
                          code: ({ children }) => <code className="bg-slate-100 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                          blockquote: ({ children }) => <blockquote className="border-l-2 border-blue-500 pl-3 italic text-slate-700">{children}</blockquote>
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    ) : (
                      <div className="text-xs sm:text-sm whitespace-pre-wrap">
                        {message.content}
                      </div>
                    )}
                  </div>
                  
                  {/* Message Footer */}
                  <div className={`flex items-center justify-between mt-2 ${
                    message.type === 'user' ? 'text-green-100' : 'text-slate-500'
                  }`}>
                    <span className="text-xs">
                      {formatTime(message.timestamp)}
                    </span>
                    
                    {/* Copy Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyMessage(message.content, message.id)}
                      className={`h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity ${
                        message.type === 'user' 
                          ? 'hover:bg-green-600 text-green-100' 
                          : 'hover:bg-slate-100 text-slate-400'
                      }`}
                    >
                      {copiedId === message.id ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 border shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="mt-4 pt-4 border-t border-blue-100">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about loans, EMI, strategies..."
                className="w-full p-3 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors text-sm"
                disabled={isLoading}
                rows={1}
                style={{ minHeight: '44px', maxHeight: '120px' }}
                onInput={(e) => {
                  e.target.style.height = 'auto'
                  e.target.style.height = e.target.scrollHeight + 'px'
                }}
              />
              {newMessage.trim() && (
                <Button
                  onClick={sendMessage}
                  disabled={isLoading}
                  className="absolute right-2 top-2 h-8 w-8 p-0 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
                >
                  <Send className="w-4 h-4" />
                </Button>
              )}
            </div>
            
            {!newMessage.trim() && (
              <Button
                onClick={sendMessage}
                disabled={isLoading}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 h-11"
              >
                <Send className="w-4 h-4" />
              </Button>
            )}
          </div>
          
          <p className="text-xs text-slate-500 mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// Enhanced Smart Insights Card
function SmartInsightsCard({ insights, calculationResults }) {
  const [copiedInsight, setCopiedInsight] = useState(null)

  const generateInsights = () => {
    if (!calculationResults) return []

    const insights = []
    const { emi, totalInterest, principal, months, interestRate } = calculationResults

    // Extra payment insight
    const extraPayment = Math.round(emi * 0.1) // 10% extra
    const savedMonths = Math.floor(months * 0.15) // Approximate savings
    const savedInterest = Math.round(totalInterest * 0.12) // Approximate interest savings
    insights.push({
      type: 'tip',
      icon: '💡',
      title: 'Extra Payment Strategy',
      content: `Paying an extra ₹${extraPayment.toLocaleString()}/month could save you ${savedMonths} months and approximately ₹${savedInterest.toLocaleString()} in interest.`
    })

    // Interest comparison
    const interestPercentage = ((totalInterest / principal) * 100).toFixed(1)
    if (interestPercentage > 50) {
      insights.push({
        type: 'warning',
        icon: '⚠️',
        title: 'High Interest Burden',
        content: `Your total interest (${interestPercentage}% of principal) is quite high. Consider shorter tenure or prepayment to reduce costs.`
      })
    } else {
      insights.push({
        type: 'success',
        icon: '✅',
        title: 'Reasonable Interest',
        content: `Your interest burden (${interestPercentage}% of principal) is reasonable for this loan type.`
      })
    }

    // EMI-to-income ratio advice
    insights.push({
      type: 'info',
      icon: '📊',
      title: 'EMI Guidelines',
      content: `Ensure your total EMIs don't exceed 40% of your monthly income. Current EMI: ₹${emi.toFixed(0)}/month.`
    })

    // Prepayment strategy
    if (months > 24) {
      const prepaymentAmount = Math.round(principal * 0.1)
      const newMonths = Math.floor(months * 0.8)
      insights.push({
        type: 'strategy',
        icon: '🎯',
        title: 'Prepayment Option',
        content: `A prepayment of ₹${prepaymentAmount.toLocaleString()} could reduce your tenure by approximately ${months - newMonths} months.`
      })
    }

    return insights
  }

  const copyInsight = async (content, index) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedInsight(index)
      toast.success('Insight copied!')
      setTimeout(() => setCopiedInsight(null), 2000)
    } catch (error) {
      toast.error('Failed to copy insight')
    }
  }

  const getInsightColor = (type) => {
    switch (type) {
      case 'success': return 'border-green-200 bg-green-50'
      case 'warning': return 'border-yellow-200 bg-yellow-50'
      case 'tip': return 'border-blue-200 bg-blue-50'
      case 'strategy': return 'border-purple-200 bg-purple-50'
      default: return 'border-slate-200 bg-slate-50'
    }
  }

  const allInsights = generateInsights()

  return (
    <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-slate-800 text-lg sm:text-xl">
          <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-purple-600" />
          Smart Loan Insights
        </CardTitle>
        <p className="text-xs sm:text-sm text-slate-600">
          AI-powered recommendations based on your calculations
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {allInsights.map((insight, index) => (
            <div 
              key={index} 
              className={`rounded-lg p-4 border transition-all duration-200 hover:shadow-md ${getInsightColor(insight.type)}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{insight.icon}</span>
                    <h4 className="font-semibold text-slate-800 text-sm">{insight.title}</h4>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {insight.content}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyInsight(insight.content, index)}
                  className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600 flex-shrink-0"
                >
                  {copiedInsight === index ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          ))}
          
          {/* AI Generated Insights */}
          {insights && (
            <div className="rounded-lg p-4 border border-indigo-200 bg-indigo-50">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="w-4 h-4 text-indigo-600" />
                    <h4 className="font-semibold text-slate-800 text-sm">AI Recommendation</h4>
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => <p className="text-xs sm:text-sm text-slate-700 mb-1 last:mb-0">{children}</p>,
                        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                      }}
                    >
                      {insights}
                    </ReactMarkdown>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyInsight(insights, 'ai')}
                  className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600 flex-shrink-0"
                >
                  {copiedInsight === 'ai' ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          )}
          
          {allInsights.length === 0 && !insights && (
            <div className="text-center py-8 text-slate-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-sm">Calculate a loan or chat with the AI advisor to get personalized insights!</p>
              <p className="text-xs text-slate-400 mt-1">
                Tips and strategies will appear here based on your calculations
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Main Debt Calculator Page
export default function DebtCalculatorPage() {
  const { t } = useTranslation()
  const [calculationResults, setCalculationResults] = useState(null)
  const [aiInsights, setAiInsights] = useState(null)

  const handleCalculation = (results) => {
    setCalculationResults(results)
    // Clear previous AI insights when new calculation is made
    setAiInsights(null)
  }

  const handleInsightGenerated = (insight) => {
    setAiInsights(insight)
  }

  return (
    <DashboardLayout title={t('debtCalculator.title')}>
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <p className="text-sm sm:text-base text-slate-600 max-w-3xl mx-auto">
              Calculate your EMI, explore repayment strategies, and get AI-powered loan advice to make informed financial decisions
            </p>
          </div>

          {/* Main Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            {/* Left Panel - Calculator */}
            <div className="space-y-4 sm:space-y-6">
              <EMICalculator onCalculate={handleCalculation} />
            </div>

            {/* Right Panel - AI Chat & Insights */}
            <div className="space-y-4 sm:space-y-6">
              {/* AI Chat */}
              <div className="min-h-[500px] sm:min-h-[600px]">
                <LoanAdvisorChat 
                  calculationResults={calculationResults}
                  onInsightGenerated={handleInsightGenerated}
                />
              </div>
              
              {/* Smart Insights Card */}
              <SmartInsightsCard 
                insights={aiInsights}
                calculationResults={calculationResults}
              />
            </div>
          </div>

          {/* Additional Information */}
          <Card className="bg-white">
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-4">How to Use This Calculator</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 text-xs sm:text-sm text-slate-600">
                <div>
                  <h4 className="font-medium text-slate-800 mb-2 text-sm sm:text-base">🧮 Calculate EMI</h4>
                  <p>Enter your loan amount, interest rate, and duration to get accurate EMI calculations with detailed breakdowns.</p>
                </div>
                <div>
                  <h4 className="font-medium text-slate-800 mb-2 text-sm sm:text-base">🤖 AI Advisor</h4>
                  <p>Ask questions about loan strategies, bank recommendations, or get personalized advice based on your calculations.</p>
                </div>
                <div>
                  <h4 className="font-medium text-slate-800 mb-2 text-sm sm:text-base">💡 Smart Insights</h4>
                  <p>Get automated recommendations for prepayment strategies, interest optimization, and loan management tips.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
