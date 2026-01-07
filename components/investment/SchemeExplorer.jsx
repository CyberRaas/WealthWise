'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Shield,
  TrendingUp,
  Zap,
  Lock,
  Sparkles,
  IndianRupee,
  Calendar,
  CheckCircle,
  XCircle,
  Info,
  ArrowLeft,
  BarChart3,
  Percent,
  Clock
} from 'lucide-react'
import toast from 'react-hot-toast'

const CATEGORY_TABS = [
  { id: 'all', label: 'All Schemes' },
  { id: 'government', label: 'Government' },
  { id: 'mutual_fund', label: 'Mutual Funds' },
  { id: 'fixed_income', label: 'Fixed Income' },
  { id: 'gold', label: 'Gold' }
]

const RISK_COLORS = {
  very_low: 'bg-green-100 text-green-800',
  low: 'bg-teal-100 text-teal-800',
  moderate: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  very_high: 'bg-red-100 text-red-800'
}

const CATEGORY_ICONS = {
  government: Shield,
  mutual_fund: TrendingUp,
  fixed_income: Lock,
  gold: Sparkles,
  liquid: IndianRupee
}

export default function SchemeExplorer({ onBack }) {
  const [schemes, setSchemes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedScheme, setSelectedScheme] = useState(null)

  useEffect(() => {
    fetchSchemes()
  }, [])

  const fetchSchemes = async () => {
    try {
      const response = await fetch('/api/investment/schemes')
      const data = await response.json()

      if (data.success) {
        setSchemes(data.allSchemes || [])
      }
    } catch (error) {
      console.error('Error fetching schemes:', error)
      toast.error('Failed to load schemes')
    } finally {
      setLoading(false)
    }
  }

  const filteredSchemes = schemes.filter(scheme => {
    const matchesSearch = !searchQuery || 
      scheme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = activeCategory === 'all' || scheme.category === activeCategory

    return matchesSearch && matchesCategory
  })

  const formatCurrency = (value) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(1)} Cr`
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)} L`
    } else if (value >= 1000) {
      return `₹${(value / 1000).toFixed(0)}K`
    }
    return `₹${value}`
  }

  const getReturnDisplay = (scheme) => {
    if (scheme.currentRate) {
      return `${scheme.currentRate}%`
    }
    if (scheme.returnRange) {
      return `${scheme.returnRange.min}-${scheme.returnRange.max}%`
    }
    if (scheme.historicalReturn) {
      return `~${scheme.historicalReturn}%`
    }
    return 'Variable'
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div className="flex-1">
          <h2 className="text-xl font-bold">Investment Schemes</h2>
          <p className="text-sm text-muted-foreground">
            Explore all available investment options
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search schemes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="flex-wrap h-auto gap-1 p-1">
          {CATEGORY_TABS.map(tab => (
            <TabsTrigger 
              key={tab.id} 
              value={tab.id}
              className="text-xs px-3"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeCategory} className="mt-4">
          {filteredSchemes.length === 0 ? (
            <Card className="text-center py-8">
              <CardContent>
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No schemes found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              <AnimatePresence>
                {filteredSchemes.map((scheme, index) => {
                  const CategoryIcon = CATEGORY_ICONS[scheme.category] || TrendingUp
                  
                  return (
                    <motion.div
                      key={scheme.key || scheme.id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card 
                        className="cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => setSelectedScheme(scheme)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <CategoryIcon className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h4 className="font-semibold">{scheme.name}</h4>
                                <Badge className={RISK_COLORS[scheme.riskLevel] || ''} variant="secondary">
                                  {scheme.riskLevel?.replace('_', ' ')}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {scheme.description}
                              </p>
                              
                              <div className="flex flex-wrap gap-4 mt-2 text-sm">
                                <div className="flex items-center gap-1">
                                  <TrendingUp className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-green-600 font-medium">
                                    {getReturnDisplay(scheme)}
                                  </span>
                                </div>
                                {scheme.lockInPeriod && (
                                  <div className="flex items-center gap-1">
                                    <Lock className="h-3 w-3 text-muted-foreground" />
                                    <span>{scheme.lockInPeriod}</span>
                                  </div>
                                )}
                                {scheme.taxBenefit && (
                                  <div className="flex items-center gap-1">
                                    <Percent className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-blue-600">Tax Benefit</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Scheme Detail Modal */}
      <SchemeDetailModal 
        scheme={selectedScheme}
        onClose={() => setSelectedScheme(null)}
      />
    </div>
  )
}

// Scheme Detail Modal Component
function SchemeDetailModal({ scheme, onClose }) {
  if (!scheme) return null

  const CategoryIcon = CATEGORY_ICONS[scheme.category] || TrendingUp

  const getReturnDisplay = (scheme) => {
    if (scheme.currentRate) {
      return `${scheme.currentRate}% p.a.`
    }
    if (scheme.returnRange) {
      return `${scheme.returnRange.min}-${scheme.returnRange.max}% p.a.`
    }
    if (scheme.historicalReturn) {
      return `~${scheme.historicalReturn}% p.a. (historical)`
    }
    return 'Variable'
  }

  return (
    <Dialog open={!!scheme} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <CategoryIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <span className="block">{scheme.name}</span>
              <Badge className={RISK_COLORS[scheme.riskLevel] || ''} variant="secondary">
                {scheme.riskLevel?.replace('_', ' ')} risk
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Description */}
          <p className="text-muted-foreground">{scheme.description}</p>

          {/* Key Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-muted/50">
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground">Expected Returns</p>
                <p className="text-lg font-bold text-green-600">
                  {getReturnDisplay(scheme)}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-muted/50">
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground">Lock-in Period</p>
                <p className="text-lg font-bold">
                  {scheme.lockInPeriod || 'None'}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-muted/50">
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground">Min. Investment</p>
                <p className="text-lg font-bold">
                  ₹{scheme.minInvestment?.toLocaleString('en-IN') || '500'}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-muted/50">
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground">Tax Benefit</p>
                <p className="text-lg font-bold text-blue-600">
                  {scheme.taxBenefit || 'None'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Eligibility */}
          {scheme.eligibility && (
            <div>
              <h4 className="font-semibold mb-2">Eligibility</h4>
              <p className="text-sm text-muted-foreground">{scheme.eligibility}</p>
            </div>
          )}

          {/* Best For */}
          {scheme.bestFor?.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Best For</h4>
              <div className="flex flex-wrap gap-2">
                {scheme.bestFor.map((item, index) => (
                  <Badge key={index} variant="outline">{item}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Pros & Cons */}
          <div className="grid md:grid-cols-2 gap-4">
            {scheme.pros?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 text-green-600 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  Pros
                </h4>
                <ul className="space-y-1">
                  {scheme.pros.map((pro, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <span className="text-green-600">•</span>
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {scheme.cons?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 text-red-600 flex items-center gap-1">
                  <XCircle className="h-4 w-4" />
                  Cons
                </h4>
                <ul className="space-y-1">
                  {scheme.cons.map((con, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <span className="text-red-600">•</span>
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <Card className="bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800">
            <CardContent className="p-3 flex items-start gap-2">
              <Info className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                This information is for educational purposes only. 
                Please verify current rates and terms with official sources before investing.
              </p>
            </CardContent>
          </Card>

          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
