'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
    ChevronRight,
    ChevronLeft,
    Sparkles,
    Home,
    Utensils,
    ShoppingBag,
    Film,
    Heart,
    GraduationCap,
    Target,
    TrendingUp,
    CheckCircle,
    Info
} from 'lucide-react'

// Quiz questions organized by category (20 questions total)
const QUIZ_CATEGORIES = [
    {
        id: 'basic',
        title: 'Basic Financial Profile',
        icon: TrendingUp,
        color: 'blue',
        questions: [
            {
                id: 'additional_income',
                question: 'Do you have any additional income sources?',
                emoji: '➕',
                type: 'single',
                options: [
                    { value: 'none', label: 'None' },
                    { value: 'freelance', label: 'Freelance / Side gigs' },
                    { value: 'rent', label: 'Rent or Property Income' },
                    { value: 'investment', label: 'Investment Returns / Dividends' },
                    { value: 'business', label: 'Family Business Income' }
                ]
            },
            {
                id: 'dependents',
                question: 'How many dependents do you support financially?',
                emoji: '👨‍👩‍👧',
                type: 'single',
                options: [
                    { value: '0', label: '0' },
                    { value: '1', label: '1' },
                    { value: '2', label: '2' },
                    { value: '3+', label: '3 or more' }
                ]
            },
            {
                id: 'living_situation',
                question: 'Living situation',
                emoji: '🏠',
                type: 'single',
                options: [
                    { value: 'family', label: 'Living with family (no rent)' },
                    { value: 'renting_alone', label: 'Renting alone' },
                    { value: 'sharing', label: 'Sharing rent with roommates' },
                    { value: 'emi', label: 'Paying home loan EMI' }
                ]
            }
        ]
    },
    {
        id: 'home',
        title: 'Home & Utilities',
        icon: Home,
        color: 'emerald',
        questions: [
            {
                id: 'rent_emi',
                question: 'What is your monthly rent or EMI?',
                emoji: '💡',
                type: 'single',
                options: [
                    { value: '0-10k', label: '₹0 – ₹10,000' },
                    { value: '10k-20k', label: '₹10,001 – ₹20,000' },
                    { value: '20k-30k', label: '₹20,001 – ₹30,000' },
                    { value: '30k-50k', label: '₹30,001 – ₹50,000' },
                    { value: '50k+', label: '₹50,000+' }
                ]
            },
            {
                id: 'utilities',
                question: 'Monthly cost for utilities (electricity, water, internet, etc.)',
                emoji: '🔌',
                type: 'single',
                options: [
                    { value: '0-2k', label: '₹0 – ₹2,000' },
                    { value: '2k-5k', label: '₹2,001 – ₹5,000' },
                    { value: '5k-8k', label: '₹5,001 – ₹8,000' },
                    { value: '8k+', label: '₹8,001+' }
                ]
            },
            {
                id: 'vehicle',
                question: 'Do you own a vehicle?',
                emoji: '🚗',
                type: 'single',
                options: [
                    { value: 'no', label: 'No' },
                    { value: '2wheeler', label: 'Yes, 2-wheeler' },
                    { value: '4wheeler', label: 'Yes, 4-wheeler' },
                    { value: 'both', label: 'Yes, both' }
                ]
            }
        ]
    },
    {
        id: 'food',
        title: 'Food & Dining',
        icon: Utensils,
        color: 'orange',
        questions: [
            {
                id: 'eating_out',
                question: 'How often do you eat out or order food online?',
                emoji: '🍽',
                type: 'single',
                options: [
                    { value: 'rarely', label: 'Rarely (1–2 times/month)' },
                    { value: 'sometimes', label: 'Sometimes (1–2 times/week)' },
                    { value: 'frequently', label: 'Frequently (3–5 times/week)' },
                    { value: 'daily', label: 'Almost daily' }
                ]
            },
            {
                id: 'groceries',
                question: 'Monthly grocery spending',
                emoji: '🛒',
                type: 'single',
                options: [
                    { value: '0-3k', label: '₹0 – ₹3,000' },
                    { value: '3k-6k', label: '₹3,001 – ₹6,000' },
                    { value: '6k-10k', label: '₹6,001 – ₹10,000' },
                    { value: '10k-15k', label: '₹10,001 – ₹15,000' },
                    { value: '15k+', label: '₹15,000+' }
                ]
            },
            {
                id: 'meal_preference',
                question: 'Meal preference',
                emoji: '👩‍🍳',
                type: 'single',
                options: [
                    { value: 'home_cooked', label: 'Mostly home-cooked' },
                    { value: 'mixed', label: 'Mixed (home + outside)' },
                    { value: 'outside', label: 'Mostly outside food' }
                ]
            }
        ]
    },
    {
        id: 'shopping',
        title: 'Shopping & Personal Care',
        icon: ShoppingBag,
        color: 'purple',
        questions: [
            {
                id: 'shopping_frequency',
                question: 'Shopping frequency (clothes, gadgets, etc.)',
                emoji: '🧢',
                type: 'single',
                options: [
                    { value: 'rarely', label: 'Rarely (once every few months)' },
                    { value: 'monthly', label: 'Monthly' },
                    { value: 'weekly', label: 'Weekly' }
                ]
            },
            {
                id: 'shopping_budget',
                question: 'Average monthly shopping budget',
                emoji: '💳',
                type: 'single',
                options: [
                    { value: '0-2k', label: '₹0 – ₹2,000' },
                    { value: '2k-5k', label: '₹2,001 – ₹5,000' },
                    { value: '5k-10k', label: '₹5,001 – ₹10,000' },
                    { value: '10k+', label: '₹10,001+' }
                ]
            },
            {
                id: 'personal_care',
                question: 'Spending on personal care or grooming',
                emoji: '🧴',
                type: 'single',
                options: [
                    { value: 'minimal', label: 'Minimal (< ₹1,000)' },
                    { value: 'moderate', label: 'Moderate (₹1,000 – ₹3,000)' },
                    { value: 'high', label: 'High (₹3,001 – ₹6,000)' },
                    { value: 'very_high', label: 'Very high (₹6,000+)' }
                ]
            }
        ]
    },
    {
        id: 'entertainment',
        title: 'Entertainment & Subscriptions',
        icon: Film,
        color: 'pink',
        questions: [
            {
                id: 'subscriptions',
                question: 'Do you have active entertainment subscriptions?',
                emoji: '📺',
                type: 'single',
                options: [
                    { value: 'none', label: 'None' },
                    { value: '1-2', label: '1–2 (Netflix, Spotify, etc.)' },
                    { value: '3-5', label: '3–5' },
                    { value: '5+', label: '5+' }
                ]
            },
            {
                id: 'entertainment_spend',
                question: 'Monthly spend on movies, hobbies, or outings',
                emoji: '🎭',
                type: 'single',
                options: [
                    { value: '0-1k', label: '₹0 – ₹1,000' },
                    { value: '1k-3k', label: '₹1,001 – ₹3,000' },
                    { value: '3k-6k', label: '₹3,001 – ₹6,000' },
                    { value: '6k+', label: '₹6,001+' }
                ]
            },
            {
                id: 'travel',
                question: 'How often do you travel or go on weekend trips?',
                emoji: '✈',
                type: 'single',
                options: [
                    { value: 'rarely', label: 'Rarely (once a year)' },
                    { value: 'occasionally', label: 'Occasionally (2–3 times a year)' },
                    { value: 'regularly', label: 'Regularly (monthly or quarterly)' }
                ]
            }
        ]
    },
    {
        id: 'health',
        title: 'Health & Insurance',
        icon: Heart,
        color: 'red',
        questions: [
            {
                id: 'health_insurance',
                question: 'Do you have health insurance?',
                emoji: '🩺',
                type: 'single',
                options: [
                    { value: 'no', label: 'No' },
                    { value: 'individual', label: 'Yes – individual policy' },
                    { value: 'family', label: 'Yes – family policy' }
                ]
            },
            {
                id: 'fitness_spend',
                question: 'Monthly fitness or health spending',
                emoji: '💪',
                type: 'single',
                options: [
                    { value: '0-1k', label: '₹0 – ₹1,000' },
                    { value: '1k-3k', label: '₹1,001 – ₹3,000' },
                    { value: '3k-5k', label: '₹3,001 – ₹5,000' },
                    { value: '5k+', label: '₹5,000+' }
                ]
            }
        ]
    },
    {
        id: 'education',
        title: 'Education & Self-Improvement',
        icon: GraduationCap,
        color: 'indigo',
        questions: [
            {
                id: 'learning_invest',
                question: 'Do you invest in online courses, books, or learning?',
                emoji: '📚',
                type: 'single',
                options: [
                    { value: 'no', label: 'No' },
                    { value: 'occasionally', label: 'Occasionally' },
                    { value: 'regularly', label: 'Regularly' }
                ]
            },
            {
                id: 'learning_spend',
                question: 'Monthly spend on learning/self-improvement',
                emoji: '🧠',
                type: 'single',
                options: [
                    { value: '0-1k', label: '₹0 – ₹1,000' },
                    { value: '1k-3k', label: '₹1,001 – ₹3,000' },
                    { value: '3k-5k', label: '₹3,001 – ₹5,000' },
                    { value: '5k+', label: '₹5,000+' }
                ]
            }
        ]
    },
    {
        id: 'goals',
        title: 'Goals & Priorities',
        icon: Target,
        color: 'teal',
        questions: [
            {
                id: 'financial_goal',
                question: 'Main financial goal right now',
                emoji: '🎯',
                type: 'single',
                options: [
                    { value: 'savings', label: 'Build savings' },
                    { value: 'debt', label: 'Repay debt' },
                    { value: 'travel', label: 'Save for travel' },
                    { value: 'house', label: 'Buy a house' },
                    { value: 'investment', label: 'Increase investments' }
                ]
            },
            {
                id: 'money_mindset',
                question: 'Money mindset',
                emoji: '⚖',
                type: 'single',
                options: [
                    { value: 'save_first', label: 'Save-first (prefer saving over spending)' },
                    { value: 'balanced', label: 'Balanced (moderate spend and save)' },
                    { value: 'spend_first', label: 'Spend-first (enjoy now, save later)' }
                ]
            },
            {
                id: 'upcoming_expenses',
                question: 'Any major upcoming expenses?',
                emoji: '🧳',
                type: 'single',
                options: [
                    { value: 'none', label: 'None' },
                    { value: 'travel', label: 'Travel' },
                    { value: 'wedding', label: 'Wedding or event' },
                    { value: 'gadget', label: 'Gadget or vehicle purchase' },
                    { value: 'renovation', label: 'Home renovation' }
                ]
            }
        ]
    }
]

// Flatten all questions for progress tracking
const ALL_QUESTIONS = QUIZ_CATEGORIES.flatMap(cat =>
    cat.questions.map(q => ({ ...q, category: cat.id, categoryTitle: cat.title }))
)

export default function LifestyleQuiz({ onComplete, onSkip, initialAnswers = {} }) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [answers, setAnswers] = useState(initialAnswers)

    const currentQuestion = ALL_QUESTIONS[currentQuestionIndex]
    const progress = ((currentQuestionIndex + 1) / ALL_QUESTIONS.length) * 100
    const isLastQuestion = currentQuestionIndex === ALL_QUESTIONS.length - 1

    const handleAnswer = (value) => {
        const newAnswers = {
            ...answers,
            [currentQuestion.id]: value
        }
        setAnswers(newAnswers)

        // Auto-advance to next question after a brief delay
        setTimeout(() => {
            if (isLastQuestion) {
                onComplete(newAnswers)
            } else {
                setCurrentQuestionIndex(currentQuestionIndex + 1)
            }
        }, 300)
    }

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1)
        }
    }

    const handleSkipQuiz = () => {
        onSkip()
    }

    const getCategoryColor = (color) => {
        const colors = {
            blue: 'from-blue-500 to-blue-600',
            emerald: 'from-emerald-500 to-emerald-600',
            orange: 'from-orange-500 to-orange-600',
            purple: 'from-purple-500 to-purple-600',
            pink: 'from-pink-500 to-pink-600',
            red: 'from-red-500 to-red-600',
            indigo: 'from-indigo-500 to-indigo-600',
            teal: 'from-teal-500 to-teal-600'
        }
        return colors[color] || colors.blue
    }

    const getCurrentCategory = () => {
        return QUIZ_CATEGORIES.find(cat => cat.id === currentQuestion.category)
    }

    const category = getCurrentCategory()
    const CategoryIcon = category.icon

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-emerald-600" />
                    <h2 className="text-2xl font-bold text-slate-900">Lifestyle Insights</h2>
                </div>
                <p className="text-sm text-slate-600">
                    Help us personalize your financial recommendations
                </p>
                <Badge variant="outline" className="text-xs">
                    Optional - You can skip anytime
                </Badge>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
                <div className="flex justify-between items-center text-xs text-slate-600">
                    <span>Question {currentQuestionIndex + 1} of {ALL_QUESTIONS.length}</span>
                    <span>{Math.round(progress)}% complete</span>
                </div>
                <Progress value={progress} className="h-2" />
            </div>

            {/* Category Badge */}
            <div className="flex items-center justify-center">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${getCategoryColor(category.color)} text-white shadow-md`}>
                    <CategoryIcon className="w-4 h-4" />
                    <span className="text-sm font-semibold">{category.title}</span>
                </div>
            </div>

            {/* Question Card */}
            <Card className="border-2 border-slate-200 shadow-lg">
                <CardHeader className="pb-4">
                    <CardTitle className="text-xl text-center flex items-center justify-center gap-3">
                        <span className="text-3xl">{currentQuestion.emoji}</span>
                        <span className="text-slate-900">{currentQuestion.question}</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {currentQuestion.options.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => handleAnswer(option.value)}
                            className={`w-full text-left p-4 rounded-lg border-2 transition-all hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-md active:scale-[0.98] ${answers[currentQuestion.id] === option.value
                                    ? 'border-emerald-500 bg-emerald-50 shadow-md'
                                    : 'border-slate-200 bg-white'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-900">{option.label}</span>
                                {answers[currentQuestion.id] === option.value && (
                                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                                )}
                            </div>
                        </button>
                    ))}
                </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between gap-3 pt-2">
                <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                    className="flex items-center gap-2"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                </Button>

                <Button
                    variant="ghost"
                    onClick={handleSkipQuiz}
                    className="text-slate-600 hover:text-slate-900"
                >
                    Skip Quiz
                </Button>

                {answers[currentQuestion.id] && (
                    <Button
                        onClick={() => {
                            if (isLastQuestion) {
                                onComplete(answers)
                            } else {
                                setCurrentQuestionIndex(currentQuestionIndex + 1)
                            }
                        }}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
                    >
                        {isLastQuestion ? 'Complete' : 'Next'}
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                )}
            </div>

            {/* Help Text */}
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-900">
                    Your answers help our AI create a more accurate budget based on your lifestyle.
                    All information is encrypted and private.
                </p>
            </div>
        </div>
    )
}
