'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  Shield,
  IndianRupee,
  Sparkles,
  Lock,
  ArrowRight,
  ExternalLink,
  Info,
  Loader2,
  CheckCircle2
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function SmartInvestmentRecommendations() {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [budget, setBudget] = useState(null)
  const [selectedScheme, setSelectedScheme] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [budgetRes, schemesRes] = await Promise.all([
        fetch('/api/budget/generate'),
        fetch('/api/investment/schemes')
      ])

      const budgetData = await budgetRes.json()
      const schemesData = await schemesRes.json()

      if (budgetData.success) {
        setBudget(budgetData.budget)
      }

      if (schemesData.success && schemesData.allSchemes) {
        // Calculate savings from budget
        const budgetAmount = budgetData.budget?.monthlyIncome || budgetData.budget?.totalBudget || 0
        const categories = budgetData.budget?.categories || {}
        const allocations = budgetData.budget?.allocations || {}
        
        // Try multiple ways to get savings amount
        let savingsAmount = 0
        if (allocations.Savings) {
          savingsAmount = allocations.Savings
        } else if (categories.Savings) {
          savingsAmount = categories.Savings.amount || 0
        } else {
          // Calculate 20% of budget as default savings
          savingsAmount = budgetAmount * 0.20
        }

        console.log('Budget data:', { budgetAmount, categories, allocations, savingsAmount })

        const recommendedSchemes = getSmartRecommendations(
          schemesData.allSchemes,
          savingsAmount,
          budgetData.budget
        )
        setRecommendations(recommendedSchemes)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load recommendations')
    } finally {
      setLoading(false)
    }
  }

  const getSmartRecommendations = (allSchemes, savings, budgetData) => {
    const monthlyIncome = budgetData?.monthlyIncome || budgetData?.totalBudget || 0
    
    // If no savings calculated, use 20% of income
    if (!savings && monthlyIncome > 0) {
      savings = monthlyIncome * 0.20
    }

    const savingsPercent = monthlyIncome > 0 ? (savings / monthlyIncome) * 100 : 20

    console.log('Generating recommendations:', { savings, monthlyIncome, savingsPercent })

    // Smart logic: Always show top schemes regardless of savings
    let recommendedSchemes = []

    // Always recommend these core schemes
    const coreSchemes = ['ppf', 'nps', 'elss', 'index_fund', 'sgb', 'bank_fd', 'liquid_fund']
    
    recommendedSchemes = allSchemes.filter(s => coreSchemes.includes(s.key))
    
    // If not enough, add more based on category
    if (recommendedSchemes.length < 6) {
      const additionalSchemes = allSchemes
        .filter(s => !coreSchemes.includes(s.key))
        .slice(0, 6 - recommendedSchemes.length)
      recommendedSchemes = [...recommendedSchemes, ...additionalSchemes]
    }

    // Sort by risk level (safest first)
    const riskOrder = { very_low: 1, low: 2, moderate: 3, high: 4, very_high: 5 }
    recommendedSchemes.sort((a, b) => {
      const aRisk = riskOrder[a.riskLevel] || 3
      const bRisk = riskOrder[b.riskLevel] || 3
      return aRisk - bRisk
    })

    // Take top 6
    recommendedSchemes = recommendedSchemes.slice(0, 6)

    // Calculate recommended monthly allocation
    const allocationPercents = [25, 20, 18, 15, 12, 10]
    
    return recommendedSchemes.map((scheme, index) => {
      const allocationPercent = allocationPercents[index] || 10
      const monthlyAmount = (savings * allocationPercent) / 100

      return {
        ...scheme,
        allocationPercent,
        monthlyAmount,
        priority: index + 1
      }
    })
  }

  const getCategoryIcon = (category) => {
    const icons = {
      government: Shield,
      mutual_fund: TrendingUp,
      fixed_income: Lock,
      gold: Sparkles,
      liquid: IndianRupee
    }
    return icons[category] || TrendingUp
  }

  const getCategoryColor = (category) => {
    const colors = {
      government: 'bg-blue-500',
      mutual_fund: 'bg-emerald-500',
      fixed_income: 'bg-purple-500',
      gold: 'bg-yellow-500',
      liquid: 'bg-cyan-500'
    }
    return colors[category] || 'bg-gray-500'
  }

  const getRiskColor = (riskLevel) => {
    const colors = {
      very_low: 'text-green-600 dark:text-green-400',
      low: 'text-teal-600 dark:text-teal-400',
      moderate: 'text-yellow-600 dark:text-yellow-400',
      high: 'text-orange-600 dark:text-orange-400',
      very_high: 'text-red-600 dark:text-red-400'
    }
    return colors[riskLevel] || 'text-gray-600'
  }

  const formatCurrency = (value) => {
    if (!value || isNaN(value)) return '₹0'
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatReturn = (scheme) => {
    if (scheme.currentRate) return `${scheme.currentRate}%`
    if (scheme.returnRange) return `${scheme.returnRange.min}-${scheme.returnRange.max}%`
    if (scheme.historicalReturn) return `~${scheme.historicalReturn}%`
    return 'Market Linked'
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      </div>
    )
  }

  const totalSavings = (() => {
    const budgetAmount = budget?.monthlyIncome || budget?.totalBudget || 0
    const allocations = budget?.allocations || {}
    const categories = budget?.categories || {}
    
    // Try multiple ways to get savings
    if (allocations.Savings) return allocations.Savings
    if (categories.Savings?.amount) return categories.Savings.amount
    
    // Default to 20% of budget
    return budgetAmount * 0.20
  })()

  return (
    <div className="space-y-6">
      {/* Header with Savings Summary */}
      <Card className="border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/30 dark:to-slate-900">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                Monthly Savings Available
              </p>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(totalSavings)}
              </p>
            </div>
            <div className="h-16 w-16 rounded-full bg-emerald-500 flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-4">
            Smart recommendations based on your budget and goals
          </p>
        </CardContent>
      </Card>

      {/* Recommendations Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-emerald-600" />
          Top Picks For You
        </h3>

        <AnimatePresence>
          {recommendations.map((scheme, index) => {
            const Icon = getCategoryIcon(scheme.category)
            
            return (
              <motion.div
                key={scheme.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className="group hover:border-emerald-500 hover:shadow-lg transition-all cursor-pointer border-2 border-transparent"
                  onClick={() => setSelectedScheme(scheme)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`h-12 w-12 rounded-xl ${getCategoryColor(scheme.category)} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <h4 className="font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                              {scheme.name}
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1">
                              {scheme.description}
                            </p>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`${getRiskColor(scheme.riskLevel)} border-current shrink-0`}
                          >
                            {scheme.riskLevel?.replace('_', ' ')}
                          </Badge>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-3 gap-4 mt-4">
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                              Invest Monthly
                            </p>
                            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(scheme.monthlyAmount)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                              Expected Returns
                            </p>
                            <p className="text-lg font-bold text-slate-900 dark:text-white">
                              {formatReturn(scheme)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                              Allocation
                            </p>
                            <p className="text-lg font-bold text-slate-900 dark:text-white">
                              {scheme.allocationPercent}%
                            </p>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-3">
                          <Progress 
                            value={scheme.allocationPercent} 
                            className="h-2 bg-slate-200 dark:bg-slate-700"
                          />
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          {scheme.taxBenefit && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-0">
                              Tax Benefit
                            </Badge>
                          )}
                          {scheme.lockInPeriod && (
                            <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 border-0">
                              {scheme.lockInPeriod}
                            </Badge>
                          )}
                          {scheme.category === 'government' && (
                            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-0">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Govt. Backed
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Arrow */}
                      <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Total Investment Summary */}
      <Card className="border-slate-200 dark:border-slate-700">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                Total Monthly Investment
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(totalSavings)}
              </p>
            </div>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <ExternalLink className="h-4 w-4 mr-2" />
              Explore All Schemes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/20">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <p className="font-medium mb-1">Investment Advisory</p>
              <p>
                These recommendations are for educational purposes only. Past performance does not guarantee future results. 
                Please consult a SEBI-registered financial advisor before making investment decisions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
