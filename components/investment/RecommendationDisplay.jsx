'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  Shield,
  Zap,
  IndianRupee,
  RefreshCw,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  Info,
  Calendar,
  Percent,
  Lock,
  BarChart3,
  Lightbulb,
  ArrowUpRight
} from 'lucide-react'
import toast from 'react-hot-toast'

const RISK_COLORS = {
  very_low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  low: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
  moderate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  very_high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
}

const CATEGORY_ICONS = {
  government: Shield,
  mutual_fund: TrendingUp,
  fixed_income: Lock,
  gold: Sparkles,
  liquid: IndianRupee
}

export default function RecommendationDisplay({ riskProfile, onRetakeAssessment }) {
  const [recommendation, setRecommendation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState('recommendations')

  useEffect(() => {
    fetchRecommendations()
  }, [])

  const fetchRecommendations = async (refresh = false) => {
    if (refresh) setRefreshing(true)
    else setLoading(true)

    try {
      const url = refresh 
        ? '/api/investment/recommendations?refresh=true'
        : '/api/investment/recommendations'
      
      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        setRecommendation(data.recommendation)
      } else if (data.requiresAssessment) {
        onRetakeAssessment?.()
      } else {
        toast.error(data.error || 'Failed to load recommendations')
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error)
      toast.error('Failed to load recommendations')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  if (!recommendation) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Recommendations Yet</h3>
          <p className="text-muted-foreground mb-4">
            Complete the risk assessment to get personalized investment suggestions.
          </p>
          <Button onClick={onRetakeAssessment}>
            Start Assessment
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Your Investment Plan</h2>
          <p className="text-sm text-muted-foreground">
            Based on your {recommendation.profileType} risk profile
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => fetchRecommendations(true)}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Investment Capacity Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Monthly SIP Capacity</p>
              <p className="text-xl font-bold">
                {formatCurrency(recommendation.investmentCapacity?.monthlySurplus || 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Lump Sum Available</p>
              <p className="text-xl font-bold">
                {formatCurrency(recommendation.investmentCapacity?.lumpSumAvailable || 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Emergency Fund</p>
              <p className={`text-xl font-bold ${
                recommendation.investmentCapacity?.hasAdequateEmergencyFund 
                  ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {recommendation.investmentCapacity?.hasAdequateEmergencyFund ? '✓ Adequate' : '⚠ Build First'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Risk Profile</p>
              <p className="text-xl font-bold capitalize">{recommendation.profileType}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      {recommendation.aiInsights && (
        <Card className="border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Lightbulb className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium mb-1">{recommendation.aiInsights.keyHighlight}</p>
                <p className="text-sm text-muted-foreground">{recommendation.aiInsights.insight}</p>
                <p className="text-sm text-primary mt-2">💡 {recommendation.aiInsights.actionTip}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="projections">Projections</TabsTrigger>
          <TabsTrigger value="allocation">Allocation</TabsTrigger>
        </TabsList>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="mt-4 space-y-4">
          <AnimatePresence>
            {recommendation.recommendations?.map((rec, index) => {
              const CategoryIcon = CATEGORY_ICONS[rec.category] || TrendingUp
              
              return (
                <motion.div
                  key={rec.schemeId || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:border-primary/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <CategoryIcon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold">{rec.schemeName}</h4>
                            <Badge className={RISK_COLORS[rec.riskLevel] || ''}>
                              {rec.riskLevel?.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{rec.reason}</p>
                          
                          <div className="flex flex-wrap gap-4 mt-3 text-sm">
                            <div className="flex items-center gap-1">
                              <Percent className="h-4 w-4 text-muted-foreground" />
                              <span>{rec.allocation}% allocation</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <IndianRupee className="h-4 w-4 text-muted-foreground" />
                              <span>{formatCurrency(rec.monthlyAmount)}/month</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-4 w-4 text-muted-foreground" />
                              <span>~{rec.expectedReturn}% expected</span>
                            </div>
                          </div>

                          {rec.projection && (
                            <div className="mt-3 p-2 bg-muted/50 rounded-lg">
                              <p className="text-sm">
                                Projected value in {rec.projection.years} years: {' '}
                                <span className="font-semibold text-green-600">
                                  {formatCurrency(rec.projection.estimatedValue)}
                                </span>
                              </p>
                            </div>
                          )}
                        </div>
                        <Button variant="ghost" size="icon">
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </TabsContent>

        {/* Projections Tab */}
        <TabsContent value="projections" className="mt-4">
          {recommendation.projections && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Investment Projections</CardTitle>
                <CardDescription>
                  Estimated values over {recommendation.projections.timeframe}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Monthly Investment */}
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Monthly Investment</p>
                    <p className="text-3xl font-bold">
                      {formatCurrency(recommendation.projections.totalMonthlyInvestment)}
                    </p>
                  </div>

                  {/* Scenarios */}
                  <div className="grid gap-4">
                    {recommendation.projections.scenarios && Object.entries(recommendation.projections.scenarios).map(([scenario, data]) => (
                      <div 
                        key={scenario}
                        className={`p-4 rounded-lg border ${
                          scenario === 'expected' ? 'border-primary bg-primary/5' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium capitalize">{scenario} Scenario</span>
                          {scenario === 'expected' && (
                            <Badge variant="outline">Most Likely</Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Future Value</p>
                            <p className="font-semibold text-lg">{formatCurrency(data.futureValue)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Total Invested</p>
                            <p className="font-semibold">{formatCurrency(data.totalInvested)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Est. Gains</p>
                            <p className="font-semibold text-green-600">
                              +{formatCurrency(data.gains)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Allocation Tab */}
        <TabsContent value="allocation" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Asset Allocation</CardTitle>
              <CardDescription>
                Recommended distribution based on your risk profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recommendation.assetAllocation && (
                <div className="space-y-4">
                  {Object.entries(recommendation.assetAllocation).map(([asset, percentage]) => (
                    <div key={asset}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="capitalize">{asset.replace('_', ' ')}</span>
                        <span className="font-semibold">{percentage}%</span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.5, delay: 0.1 }}
                          className="h-full bg-primary rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Warnings */}
      {recommendation.warnings?.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                {recommendation.warnings.map((warning, index) => (
                  <p key={index} className="text-sm text-yellow-800 dark:text-yellow-200">
                    {warning}
                  </p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              {recommendation.disclaimers?.[0] || 'Investment recommendations are for educational purposes only. Past performance does not guarantee future results. Please consult a SEBI-registered investment advisor before making investment decisions.'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onRetakeAssessment} className="flex-1">
          Retake Assessment
        </Button>
        <Button className="flex-1">
          Explore All Schemes
          <ArrowUpRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  )
}
