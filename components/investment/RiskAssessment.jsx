'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Progress } from '@/components/ui/progress'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Target,
  ChevronRight,
  ChevronLeft,
  Shield,
  TrendingUp,
  Zap,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'

// Risk Assessment Questions
const QUESTIONS = [
  {
    id: 'investmentHorizon',
    question: 'What is your investment time horizon?',
    description: 'How long can you keep your money invested?',
    options: [
      { value: 'short', label: 'Less than 3 years', score: 1 },
      { value: 'medium', label: '3 to 7 years', score: 2 },
      { value: 'long', label: '7 to 15 years', score: 3 },
      { value: 'veryLong', label: 'More than 15 years', score: 4 }
    ]
  },
  {
    id: 'riskTolerance',
    question: 'How would you describe your risk tolerance?',
    description: 'How comfortable are you with market fluctuations?',
    options: [
      { value: 'conservative', label: 'I prefer safety over returns', score: 1 },
      { value: 'moderate', label: 'I can accept some risk for better returns', score: 2 },
      { value: 'aggressive', label: 'I am comfortable with high risk for high returns', score: 3 }
    ]
  },
  {
    id: 'incomeStability',
    question: 'How stable is your income?',
    description: 'Consider your job security and income predictability',
    options: [
      { value: 'unstable', label: 'Variable or uncertain income', score: 1 },
      { value: 'moderate', label: 'Fairly stable with some variation', score: 2 },
      { value: 'stable', label: 'Very stable and predictable', score: 3 }
    ]
  },
  {
    id: 'emergencyFund',
    question: 'Do you have an emergency fund?',
    description: 'Money set aside for unexpected expenses (3-6 months expenses)',
    options: [
      { value: 'none', label: 'No emergency fund', score: 1 },
      { value: 'partial', label: 'Less than 3 months expenses', score: 2 },
      { value: 'adequate', label: '3-6 months expenses', score: 3 },
      { value: 'strong', label: 'More than 6 months expenses', score: 4 }
    ]
  },
  {
    id: 'investmentExperience',
    question: 'What is your investment experience?',
    description: 'Have you invested in stocks, mutual funds, or other assets before?',
    options: [
      { value: 'none', label: 'No prior investment experience', score: 1 },
      { value: 'beginner', label: 'Some experience with FDs, PPF', score: 2 },
      { value: 'intermediate', label: 'Experience with mutual funds', score: 3 },
      { value: 'experienced', label: 'Experience with stocks and diverse assets', score: 4 }
    ]
  },
  {
    id: 'lossReaction',
    question: 'If your investment dropped 20%, what would you do?',
    description: 'Imagine your portfolio value decreased significantly',
    options: [
      { value: 'sellAll', label: 'Sell everything to prevent further losses', score: 1 },
      { value: 'sellSome', label: 'Sell some and wait', score: 2 },
      { value: 'hold', label: 'Hold and wait for recovery', score: 3 },
      { value: 'buyMore', label: 'Buy more at lower prices', score: 4 }
    ]
  },
  {
    id: 'primaryGoal',
    question: 'What is your primary investment goal?',
    description: 'Choose the goal that matters most to you',
    options: [
      { value: 'preservation', label: 'Preserve my capital', score: 1 },
      { value: 'income', label: 'Generate regular income', score: 2 },
      { value: 'growth', label: 'Grow my wealth over time', score: 3 },
      { value: 'aggressive', label: 'Maximize returns aggressively', score: 4 }
    ]
  }
]

const PROFILE_ICONS = {
  conservative: Shield,
  moderate: TrendingUp,
  aggressive: Zap
}

const PROFILE_COLORS = {
  conservative: 'bg-green-500',
  moderate: 'bg-blue-500',
  aggressive: 'bg-orange-500'
}

const PROFILE_DESCRIPTIONS = {
  conservative: 'You prefer stability and capital protection. Your portfolio focuses on government securities and fixed-income instruments.',
  moderate: 'You balance growth with stability. Your portfolio includes a mix of equity and fixed-income investments.',
  aggressive: 'You seek higher returns and can tolerate market volatility. Your portfolio emphasizes equity investments.'
}

export default function RiskAssessment({ onComplete, onBack }) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const progress = ((currentQuestion) / QUESTIONS.length) * 100

  const handleAnswer = (value) => {
    setAnswers(prev => ({
      ...prev,
      [QUESTIONS[currentQuestion].id]: value
    }))
  }

  const handleNext = () => {
    if (!answers[QUESTIONS[currentQuestion].id]) {
      toast.error('Please select an option')
      return
    }

    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    } else {
      submitAssessment()
    }
  }

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    }
  }

  const submitAssessment = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/investment/risk-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      })

      const data = await response.json()

      if (data.success) {
        setResult(data.profile)
      } else {
        toast.error(data.error || 'Failed to save profile')
      }
    } catch (error) {
      console.error('Error submitting assessment:', error)
      toast.error('Failed to submit assessment')
    } finally {
      setLoading(false)
    }
  }

  const handleViewRecommendations = () => {
    onComplete?.(result)
  }

  // Show result
  if (result) {
    const ProfileIcon = PROFILE_ICONS[result.profileType] || TrendingUp
    const profileColor = PROFILE_COLORS[result.profileType] || 'bg-blue-500'

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6"
      >
        <Card className="text-center py-8">
          <CardContent>
            <div className={`w-20 h-20 mx-auto ${profileColor} rounded-full flex items-center justify-center mb-4`}>
              <ProfileIcon className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2 capitalize">
              {result.profileType} Investor
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              {PROFILE_DESCRIPTIONS[result.profileType]}
            </p>

            {/* Score breakdown */}
            <div className="flex justify-center gap-8 mb-6 text-sm">
              <div>
                <p className="text-muted-foreground">Risk Score</p>
                <p className="text-2xl font-bold">{result.score}/28</p>
              </div>
              <div>
                <p className="text-muted-foreground">Confidence</p>
                <p className="text-2xl font-bold">{Math.round(result.confidence * 100)}%</p>
              </div>
            </div>

            {/* Recommended allocation preview */}
            <Card className="bg-muted/50 max-w-sm mx-auto">
              <CardContent className="p-4">
                <p className="text-sm font-medium mb-3">Suggested Asset Allocation</p>
                <div className="space-y-2">
                  {result.suggestedAllocation && Object.entries(result.suggestedAllocation).map(([asset, percentage]) => (
                    <div key={asset} className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs w-24 text-right capitalize">
                        {asset.replace('_', ' ')}: {percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3 justify-center mt-6">
              <Button variant="outline" onClick={() => setResult(null)}>
                Retake Assessment
              </Button>
              <Button onClick={handleViewRecommendations}>
                View Recommendations
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Card className="bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              This assessment is for educational purposes only. It does not constitute investment advice. 
              Please consult a SEBI-registered financial advisor before making investment decisions.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  const question = QUESTIONS[currentQuestion]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
        <div className="flex-1">
          <h2 className="text-xl font-bold">Risk Assessment</h2>
          <p className="text-sm text-muted-foreground">
            Question {currentQuestion + 1} of {QUESTIONS.length}
          </p>
        </div>
      </div>

      {/* Progress */}
      <Progress value={progress} className="h-2" />

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{question.question}</CardTitle>
              <CardDescription>{question.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={answers[question.id] || ''}
                onValueChange={handleAnswer}
                className="space-y-3"
              >
                {question.options.map(option => (
                  <label
                    key={option.value}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      answers[question.id] === option.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <RadioGroupItem value={option.value} />
                    <span>{option.label}</span>
                  </label>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentQuestion === 0}
          className="flex-1"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={loading || !answers[question.id]}
          className="flex-1"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : currentQuestion === QUESTIONS.length - 1 ? (
            <>
              <CheckCircle className="h-4 w-4 mr-1" />
              Get Results
            </>
          ) : (
            <>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
