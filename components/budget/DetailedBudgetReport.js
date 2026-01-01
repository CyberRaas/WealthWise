'use client'

import React, { useState } from 'react'
import {
    Download,
    TrendingUp,
    TrendingDown,
    CheckCircle,
    AlertCircle,
    Info,
    ChevronDown,
    ChevronUp,
    PieChart,
    BarChart3,
    Target,
    Shield,
    Zap,
    Calendar,
    Award
} from 'lucide-react'

/**
 * DetailedBudgetReport - Professional, engaging budget report with insights
 * Shows comprehensive breakdown with health score, recommendations, and download option
 */
export default function DetailedBudgetReport({ budget, profile }) {
    const [expandedSections, setExpandedSections] = useState({
        overview: true,
        breakdown: true,
        insights: true,
        recommendations: true
    })

    const formatCurrency = (amount) => {
        return `₹${amount?.toLocaleString('en-IN') || '0'}`
    }

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }))
    }

    const downloadReport = () => {
        // Create a detailed text report
        const reportContent = generateReportText()
        const blob = new Blob([reportContent], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `WealthWise-Budget-Report-${new Date().toLocaleDateString('en-IN')}.txt`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    const generateReportText = () => {
        const date = new Date().toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })

        let report = `
═══════════════════════════════════════════════════════════════
                    WEALTHWISE BUDGET REPORT
═══════════════════════════════════════════════════════════════

Generated: ${date}
Report for: ${profile.name || 'User'}

───────────────────────────────────────────────────────────────
PROFILE SUMMARY
───────────────────────────────────────────────────────────────

Monthly Income:        ${formatCurrency(profile.monthlyIncome)}
City:                  ${profile.city}
Family Size:           ${profile.familySize} members
Age:                   ${profile.age} years
Occupation:            ${profile.occupation || 'Professional'}
${budget.incomeBracket ? `Income Bracket:        ${budget.incomeBracket}` : ''}
${budget.lifeStage ? `Life Stage:            ${budget.lifeStage}` : ''}

───────────────────────────────────────────────────────────────
BUDGET OVERVIEW
───────────────────────────────────────────────────────────────

Total Monthly Budget:  ${formatCurrency(budget.totalBudget)}
Monthly Savings:       ${formatCurrency(budget.categories?.savings?.amount)} (${budget.categories?.savings?.percentage}%)
Total Expenses:        ${formatCurrency(budget.totalBudget - (budget.categories?.savings?.amount || 0))}

${budget.budgetHealth ? `Budget Health Score:   ${budget.budgetHealth.score}/100 (${budget.budgetHealth.grade})
Status:                ${budget.budgetHealth.status}` : ''}

───────────────────────────────────────────────────────────────
DETAILED BUDGET BREAKDOWN
───────────────────────────────────────────────────────────────

${budget.categories ? Object.entries(budget.categories).map(([key, cat]) => `
${cat.emoji} ${cat.englishName}
   Amount:     ${formatCurrency(cat.amount)}
   Percentage: ${cat.percentage}%
   ${cat.description || ''}
`).join('\n') : ''}

───────────────────────────────────────────────────────────────
SAVINGS ANALYSIS
───────────────────────────────────────────────────────────────

${budget.savingsAnalysis ? `
Current Savings Rate:  ${budget.savingsAnalysis.currentRate}%
Target Savings Rate:   ${budget.savingsAnalysis.targetRate}%
Monthly Savings:       ${formatCurrency(budget.savingsAnalysis.monthlyAmount)}
Yearly Savings:        ${formatCurrency(budget.savingsAnalysis.yearlyAmount)}
10-Year Projection:    ${formatCurrency(budget.savingsAnalysis.tenYearProjection)}

Status: ${budget.savingsAnalysis.status}
${budget.savingsAnalysis.recommendation}
` : ''}

───────────────────────────────────────────────────────────────
HOUSING ANALYSIS
───────────────────────────────────────────────────────────────

${budget.housingAnalysis ? `
Current Housing Cost:  ${formatCurrency(budget.housingAnalysis.currentAmount)} (${budget.housingAnalysis.percentage}%)
City Average:          ${formatCurrency(budget.housingAnalysis.cityAverage)}
Status:                ${budget.housingAnalysis.status}

${budget.housingAnalysis.recommendation}
` : ''}

───────────────────────────────────────────────────────────────
LIFESTYLE BALANCE
───────────────────────────────────────────────────────────────

${budget.lifestyleBalance ? `
Discretionary Spending: ${budget.lifestyleBalance.discretionarySpending}%
Essential Spending:     ${budget.lifestyleBalance.essentialSpending}%
Balance Type:           ${budget.lifestyleBalance.balance}

${budget.lifestyleBalance.recommendation}
` : ''}

───────────────────────────────────────────────────────────────
RECOMMENDATIONS
───────────────────────────────────────────────────────────────

${budget.recommendations ? budget.recommendations.map((rec, index) => `
${index + 1}. ${rec.type} ${rec.icon || ''}
   Priority: ${rec.priority}
   Amount: ${formatCurrency(rec.amount)}
   
   ${rec.description}
   
   ${rec.howTo ? `Action Steps:\n   ${rec.howTo.map(step => `• ${step}`).join('\n   ')}` : ''}
`).join('\n') : ''}

───────────────────────────────────────────────────────────────
ACTION ITEMS (WEEK-BY-WEEK PLAN)
───────────────────────────────────────────────────────────────

${budget.actionItems ? budget.actionItems.map((item) => `
Week ${item.week}: ${item.action}
${item.steps ? item.steps.map(step => `  • ${step}`).join('\n') : ''}
Time Required: ${item.timeRequired || 'N/A'}
${item.potentialSavings ? `Potential Savings: ${item.potentialSavings}` : ''}
`).join('\n') : ''}

───────────────────────────────────────────────────────────────
BENCHMARKS COMPARISON
───────────────────────────────────────────────────────────────

${budget.benchmarks ? `
                    You     Ideal   City Avg  National

Housing:            ${budget.benchmarks.yourBudget.housing}%     ${budget.benchmarks.idealBenchmark.housing}%      ${budget.benchmarks.yourCityAverage.housing}%        ${budget.benchmarks.nationalAverage.housing}%
Food:               ${budget.benchmarks.yourBudget.food}%     ${budget.benchmarks.idealBenchmark.food}%      ${budget.benchmarks.yourCityAverage.food}%        ${budget.benchmarks.nationalAverage.food}%
Transport:          ${budget.benchmarks.yourBudget.transport}%      ${budget.benchmarks.idealBenchmark.transport}%      ${budget.benchmarks.yourCityAverage.transport}%        ${budget.benchmarks.nationalAverage.transport}%
Savings:            ${budget.benchmarks.yourBudget.savings}%     ${budget.benchmarks.idealBenchmark.savings}%      ${budget.benchmarks.yourCityAverage.savings}%        ${budget.benchmarks.nationalAverage.savings}%
` : ''}

───────────────────────────────────────────────────────────────
BUDGET TIPS
───────────────────────────────────────────────────────────────

${budget.tips ? budget.tips.map((tip, index) => `${index + 1}. ${tip}`).join('\n\n') : ''}

═══════════════════════════════════════════════════════════════

This budget was generated using WealthWise's Advanced AI Budget 
Generation Engine with real cost-of-living data for Indian cities.

Framework: ${budget.framework || 'Advanced Realistic Model'}
Generated: ${budget.generatedAt ? new Date(budget.generatedAt).toLocaleString('en-IN') : date}
Confidence: ${budget.confidence ? Math.round(budget.confidence * 100) + '%' : 'High'}

Visit: https://www.mywealthwise.tech
Support: support@mywealthwise.tech

═══════════════════════════════════════════════════════════════
`
        return report
    }

    // Get budget health color
    const getHealthColor = (score) => {
        if (score >= 85) return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800'
        if (score >= 70) return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800'
        if (score >= 50) return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800'
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800'
    }

    const getHealthIcon = (score) => {
        if (score >= 70) return <CheckCircle className="w-5 h-5" />
        if (score >= 50) return <AlertCircle className="w-5 h-5" />
        return <AlertCircle className="w-5 h-5" />
    }

    return (
        <div className="space-y-4 sm:space-y-6 pb-6">
            {/* Header with Download Button - Mobile Optimized */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
                <div className="flex-1">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">Your Budget Report</h2>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">Detailed analysis and recommendations</p>
                </div>
                <button
                    onClick={downloadReport}
                    className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-3 sm:py-2.5 bg-emerald-600 dark:bg-emerald-500 text-white rounded-lg hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-all active:scale-95 shadow-sm hover:shadow-md text-sm sm:text-base font-medium"
                >
                    <Download className="w-4 h-4" />
                    <span>Download Report</span>
                </button>
            </div>

            {/* Budget Health Score Card - Mobile Optimized */}
            {budget.budgetHealth && (
                <div className={`rounded-xl p-4 sm:p-6 border-2 ${getHealthColor(budget.budgetHealth.score)}`}>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4">
                        <div className="flex items-center gap-3">
                            {getHealthIcon(budget.budgetHealth.score)}
                            <div>
                                <h3 className="text-base sm:text-lg font-bold">Budget Health Score</h3>
                                <p className="text-xs sm:text-sm opacity-80">Overall financial assessment</p>
                            </div>
                        </div>
                        <div className="text-center sm:text-right bg-white/50 sm:bg-transparent rounded-lg p-3 sm:p-0">
                            <div className="text-3xl sm:text-4xl font-bold">{budget.budgetHealth.score}</div>
                            <div className="text-xs sm:text-sm font-semibold">{budget.budgetHealth.grade}</div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">Status:</span>
                            <span className="font-semibold">{budget.budgetHealth.status}</span>
                        </div>

                        {budget.budgetHealth.strengths && budget.budgetHealth.strengths.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-current/20">
                                <p className="text-xs font-semibold mb-2">✓ Strengths:</p>
                                <ul className="space-y-1">
                                    {budget.budgetHealth.strengths.map((strength, index) => (
                                        <li key={index} className="text-xs flex items-start gap-2">
                                            <span className="text-emerald-500 mt-0.5">●</span>
                                            <span>{strength}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {budget.budgetHealth.issues && budget.budgetHealth.issues.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-current/20">
                                <p className="text-xs font-semibold mb-2">⚠ Areas to Improve:</p>
                                <ul className="space-y-1">
                                    {budget.budgetHealth.issues.map((issue, index) => (
                                        <li key={index} className="text-xs flex items-start gap-2">
                                            <span className="text-amber-500 mt-0.5">●</span>
                                            <span>{issue}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Budget Overview Section */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden">
                <button
                    onClick={() => toggleSection('overview')}
                    className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg flex items-center justify-center">
                            <PieChart className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="text-left">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Budget Overview</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Income, expenses, and savings summary</p>
                        </div>
                    </div>
                    {expandedSections.overview ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </button>

                {expandedSections.overview && (
                    <div className="p-4 sm:p-5 pt-0 space-y-4">
                        {/* Three Key Metrics - Mobile Responsive */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                                <p className="text-xs sm:text-xs text-blue-700 dark:text-blue-300 font-medium mb-1">Total Budget</p>
                                <p className="text-xl sm:text-2xl font-bold text-blue-900 dark:text-blue-200">{formatCurrency(budget.totalBudget)}</p>
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Monthly income</p>
                            </div>

                            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
                                <p className="text-xs sm:text-xs text-emerald-700 dark:text-emerald-300 font-medium mb-1">Monthly Savings</p>
                                <p className="text-xl sm:text-2xl font-bold text-emerald-900 dark:text-emerald-200">
                                    {formatCurrency(budget.categories?.savings?.amount || 0)}
                                </p>
                                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">{budget.categories?.savings?.percentage}% of income</p>
                            </div>

                            <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-600/50 rounded-xl p-4 border border-slate-200 dark:border-slate-600">
                                <p className="text-xs sm:text-xs text-slate-700 dark:text-slate-300 font-medium mb-1">Total Expenses</p>
                                <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                                    {formatCurrency(budget.totalBudget - (budget.categories?.savings?.amount || 0))}
                                </p>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                    {100 - (budget.categories?.savings?.percentage || 0)}% of income
                                </p>
                            </div>
                        </div>

                        {/* Profile Details - Mobile Optimized */}
                        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-200 dark:border-slate-600">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                <Info className="w-4 h-4" />
                                Your Profile
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                <div>
                                    <p className="text-xs text-slate-600 dark:text-slate-400">City</p>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{profile.city}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-600 dark:text-slate-400">Family Size</p>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{profile.familySize} members</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-600 dark:text-slate-400">Age</p>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{profile.age} years</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-600 dark:text-slate-400">Occupation</p>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{profile.occupation || 'Professional'}</p>
                                </div>
                            </div>

                            {(budget.incomeBracket || budget.lifeStage) && (
                                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {budget.incomeBracket && (
                                        <div>
                                            <p className="text-xs text-slate-600 dark:text-slate-400">Income Bracket</p>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{budget.incomeBracket}</p>
                                        </div>
                                    )}
                                    {budget.lifeStage && (
                                        <div>
                                            <p className="text-xs text-slate-600 dark:text-slate-400">Life Stage</p>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{budget.lifeStage}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Budget Breakdown Section */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden">
                <button
                    onClick={() => toggleSection('breakdown')}
                    className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="text-left">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Category Breakdown</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Detailed expense allocation</p>
                        </div>
                    </div>
                    {expandedSections.breakdown ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </button>

                {expandedSections.breakdown && (
                    <div className="p-4 sm:p-5 pt-0 space-y-3">
                        {budget.categories && Object.entries(budget.categories).map(([key, category]) => (
                            <div key={key} className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 sm:p-4 border border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 transition-colors">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mb-2">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <span className="text-xl sm:text-2xl">{category.emoji}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{category.englishName}</p>
                                            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">{category.description}</p>
                                        </div>
                                    </div>
                                    <div className="text-left sm:text-right ml-7 sm:ml-0 flex-shrink-0">
                                        <p className="text-lg sm:text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(category.amount)}</p>
                                        <p className="text-xs text-slate-600 dark:text-slate-400">{category.percentage}% of budget</p>
                                    </div>
                                </div>

                                {/* Visual percentage bar */}
                                <div className="mt-2">
                                    <div className="h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full transition-all"
                                            style={{ width: `${category.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Insights Section */}
            {(budget.savingsAnalysis || budget.housingAnalysis || budget.lifestyleBalance) && (
                <div className="bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden">
                    <button
                        onClick={() => toggleSection('insights')}
                        className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-lg flex items-center justify-center">
                                <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div className="text-left">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Financial Insights</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Personalized analysis and projections</p>
                            </div>
                        </div>
                        {expandedSections.insights ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                    </button>

                    {expandedSections.insights && (
                        <div className="p-4 sm:p-5 pt-0 space-y-4">
                            {/* Savings Analysis - Mobile Optimized */}
                            {budget.savingsAnalysis && (
                                <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Target className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
                                        <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-300">Savings Analysis</h4>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3">
                                        <div className="bg-white dark:bg-slate-800 rounded-lg p-3">
                                            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Current Rate</p>
                                            <p className="text-lg sm:text-xl font-bold text-emerald-700 dark:text-emerald-400">{budget.savingsAnalysis.currentRate}%</p>
                                        </div>
                                        <div className="bg-white dark:bg-slate-800 rounded-lg p-3">
                                            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Target Rate</p>
                                            <p className="text-lg sm:text-xl font-bold text-slate-700 dark:text-slate-200">{budget.savingsAnalysis.targetRate}%</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-slate-600 dark:text-slate-400">Monthly Savings:</span>
                                            <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(budget.savingsAnalysis.monthlyAmount)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600 dark:text-slate-400">Yearly Total:</span>
                                            <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(budget.savingsAnalysis.yearlyAmount)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600 dark:text-slate-400">10-Year Projection:</span>
                                            <span className="font-semibold text-emerald-700 dark:text-emerald-400">{formatCurrency(budget.savingsAnalysis.tenYearProjection)}</span>
                                        </div>
                                    </div>

                                    <div className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-700">
                                        <p className="text-xs text-emerald-900 dark:text-emerald-300">
                                            <span className="font-semibold">Status: </span>
                                            {budget.savingsAnalysis.status}
                                        </p>
                                        {budget.savingsAnalysis.recommendation && (
                                            <p className="text-xs text-emerald-800 dark:text-emerald-400 mt-2">
                                                💡 {budget.savingsAnalysis.recommendation}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Housing Analysis - Mobile Optimized */}
                            {budget.housingAnalysis && (
                                <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Award className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                                        <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300">Housing Analysis</h4>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-3">
                                        <div className="bg-white dark:bg-slate-800 rounded-lg p-3">
                                            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Your Housing Cost</p>
                                            <p className="text-base sm:text-lg font-bold text-blue-700 dark:text-blue-400">{formatCurrency(budget.housingAnalysis.currentAmount)}</p>
                                            <p className="text-xs text-blue-600 dark:text-blue-400">{budget.housingAnalysis.percentage}% of income</p>
                                        </div>
                                        <div className="bg-white dark:bg-slate-800 rounded-lg p-3">
                                            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">City Average</p>
                                            <p className="text-base sm:text-lg font-bold text-slate-700 dark:text-slate-200">{formatCurrency(budget.housingAnalysis.cityAverage)}</p>
                                            <p className="text-xs text-slate-600 dark:text-slate-400">Typical for {profile.city}</p>
                                        </div>
                                    </div>

                                    <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
                                        <p className="text-xs text-blue-900 dark:text-blue-300">
                                            <span className="font-semibold">Status: </span>
                                            {budget.housingAnalysis.status}
                                        </p>
                                        {budget.housingAnalysis.recommendation && (
                                            <p className="text-xs text-blue-800 dark:text-blue-400 mt-2">
                                                💡 {budget.housingAnalysis.recommendation}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Lifestyle Balance - Mobile Optimized */}
                            {budget.lifestyleBalance && (
                                <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                                    <div className="flex items-center gap-2 mb-3">
                                        <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
                                        <h4 className="text-sm font-bold text-purple-900 dark:text-purple-300">Lifestyle Balance</h4>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 mb-3">
                                        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 text-center">
                                            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Discretionary</p>
                                            <p className="text-base sm:text-lg font-bold text-purple-700 dark:text-purple-400">{budget.lifestyleBalance.discretionarySpending}%</p>
                                        </div>
                                        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 text-center">
                                            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Essential</p>
                                            <p className="text-base sm:text-lg font-bold text-slate-700 dark:text-slate-200">{budget.lifestyleBalance.essentialSpending}%</p>
                                        </div>
                                        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 text-center">
                                            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Savings</p>
                                            <p className="text-base sm:text-lg font-bold text-emerald-700 dark:text-emerald-400">{budget.lifestyleBalance.savingsRate}%</p>
                                        </div>
                                    </div>

                                    <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-700">
                                        <p className="text-xs text-purple-900 dark:text-purple-300">
                                            <span className="font-semibold">Balance Type: </span>
                                            {budget.lifestyleBalance.balance}
                                        </p>
                                        {budget.lifestyleBalance.recommendation && (
                                            <p className="text-xs text-purple-800 dark:text-purple-400 mt-2">
                                                💡 {budget.lifestyleBalance.recommendation}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Benchmarks - Mobile Scrollable Table */}
                            {budget.benchmarks && (
                                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Comparison Benchmarks</h4>
                                    <div className="overflow-x-auto -mx-4 px-4">
                                        <table className="w-full min-w-[500px] text-xs">
                                            <thead>
                                                <tr className="border-b border-slate-200 dark:border-slate-600">
                                                    <th className="text-left py-2 pr-2 text-slate-600 dark:text-slate-400 font-semibold">Category</th>
                                                    <th className="text-center py-2 px-1 text-slate-900 dark:text-white font-semibold">You</th>
                                                    <th className="text-center py-2 px-1 text-emerald-700 dark:text-emerald-400 font-semibold">Ideal</th>
                                                    <th className="text-center py-2 px-1 text-blue-700 dark:text-blue-400 font-semibold">City</th>
                                                    <th className="text-center py-2 px-1 text-purple-700 dark:text-purple-400 font-semibold">National</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-slate-800 dark:text-slate-200">
                                                <tr className="border-b border-slate-100 dark:border-slate-600">
                                                    <td className="py-2 pr-2">Housing</td>
                                                    <td className="text-center px-1 font-semibold">{budget.benchmarks.yourBudget.housing}%</td>
                                                    <td className="text-center px-1">{budget.benchmarks.idealBenchmark.housing}%</td>
                                                    <td className="text-center px-1">{budget.benchmarks.yourCityAverage.housing}%</td>
                                                    <td className="text-center px-1">{budget.benchmarks.nationalAverage.housing}%</td>
                                                </tr>
                                                <tr className="border-b border-slate-100 dark:border-slate-600">
                                                    <td className="py-2 pr-2">Food</td>
                                                    <td className="text-center px-1 font-semibold">{budget.benchmarks.yourBudget.food}%</td>
                                                    <td className="text-center px-1">{budget.benchmarks.idealBenchmark.food}%</td>
                                                    <td className="text-center px-1">{budget.benchmarks.yourCityAverage.food}%</td>
                                                    <td className="text-center px-1">{budget.benchmarks.nationalAverage.food}%</td>
                                                </tr>
                                                <tr className="border-b border-slate-100 dark:border-slate-600">
                                                    <td className="py-2 pr-2">Transport</td>
                                                    <td className="text-center px-1 font-semibold">{budget.benchmarks.yourBudget.transport}%</td>
                                                    <td className="text-center px-1">{budget.benchmarks.idealBenchmark.transport}%</td>
                                                    <td className="text-center px-1">{budget.benchmarks.yourCityAverage.transport}%</td>
                                                    <td className="text-center px-1">{budget.benchmarks.nationalAverage.transport}%</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-2 pr-2">Savings</td>
                                                    <td className="text-center px-1 font-semibold">{budget.benchmarks.yourBudget.savings}%</td>
                                                    <td className="text-center px-1">{budget.benchmarks.idealBenchmark.savings}%</td>
                                                    <td className="text-center px-1">{budget.benchmarks.yourCityAverage.savings}%</td>
                                                    <td className="text-center px-1">{budget.benchmarks.nationalAverage.savings}%</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center sm:text-left">
                                        📱 Scroll horizontally to view all columns
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Recommendations Section */}
            {budget.recommendations && budget.recommendations.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden">
                    <button
                        onClick={() => toggleSection('recommendations')}
                        className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="text-left">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recommendations</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Personalized action steps</p>
                            </div>
                        </div>
                        {expandedSections.recommendations ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                    </button>

                    {expandedSections.recommendations && (
                        <div className="p-4 sm:p-5 pt-0 space-y-3 sm:space-y-4">
                            {budget.recommendations.map((rec, index) => (
                                <div key={index} className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 sm:p-4 border border-slate-200 dark:border-slate-600">
                                    <div className="flex items-start gap-2 sm:gap-3 mb-3">
                                        <span className="text-xl sm:text-2xl flex-shrink-0">{rec.icon}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 mb-1">
                                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{rec.type}</h4>
                                                <span className={`text-xs px-2 py-1 rounded-full font-semibold w-fit ${rec.priority === 'Critical' ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400' :
                                                    rec.priority === 'High' ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400' :
                                                        'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400'
                                                    }`}>
                                                    {rec.priority}
                                                </span>
                                            </div>
                                            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mb-2">{rec.description}</p>

                                            {rec.amount && (
                                                <p className="text-base sm:text-lg font-bold text-emerald-700 dark:text-emerald-400 mb-2">
                                                    {formatCurrency(rec.amount)}
                                                </p>
                                            )}

                                            {rec.howTo && rec.howTo.length > 0 && (
                                                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
                                                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Action Steps:</p>
                                                    <ul className="space-y-1.5">
                                                        {rec.howTo.map((step, stepIndex) => (
                                                            <li key={stepIndex} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                                                                <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>
                                                                <span>{step}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {rec.timeline && (
                                                <div className="mt-2 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                                                    <Calendar className="w-3 h-3 flex-shrink-0" />
                                                    <span>{rec.timeline}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Action Items - Mobile Optimized */}
            {budget.actionItems && budget.actionItems.length > 0 && (
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-xl p-4 sm:p-5 border-2 border-emerald-200 dark:border-emerald-800">
                    <h3 className="text-base sm:text-lg font-bold text-emerald-900 dark:text-emerald-300 mb-3 sm:mb-4 flex items-center gap-2">
                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                        Week-by-Week Action Plan
                    </h3>

                    <div className="space-y-3">
                        {budget.actionItems.map((item) => (
                            <div key={item.week} className="bg-white dark:bg-slate-800 rounded-lg p-3 sm:p-4 border border-emerald-200 dark:border-emerald-700">
                                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-emerald-600 dark:bg-emerald-500 text-white rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">
                                        W{item.week}
                                    </div>
                                    <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{item.action}</p>
                                </div>

                                {item.steps && item.steps.length > 0 && (
                                    <ul className="space-y-1 ml-9 sm:ml-11">
                                        {item.steps.map((step, index) => (
                                            <li key={index} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                                                <span className="text-emerald-500 mt-0.5 flex-shrink-0">→</span>
                                                <span>{step}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                <div className="mt-2 ml-9 sm:ml-11 flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-slate-600 dark:text-slate-400">
                                    {item.timeRequired && (
                                        <span>⏱️ {item.timeRequired}</span>
                                    )}
                                    {item.potentialSavings && (
                                        <span className="text-emerald-700 dark:text-emerald-400 font-semibold">💰 {item.potentialSavings}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Tips Section - Mobile Optimized */}
            {budget.tips && budget.tips.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/30 rounded-xl p-4 sm:p-5 border-2 border-amber-200 dark:border-amber-800">
                    <h3 className="text-base sm:text-lg font-bold text-amber-900 dark:text-amber-300 mb-3 sm:mb-4">💡 Smart Money Tips</h3>
                    <div className="space-y-2 sm:space-y-3">
                        {budget.tips.map((tip, index) => (
                            <div key={index} className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-amber-200 dark:border-amber-700 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                                {tip}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Footer Info - Mobile Optimized */}
            <div className="bg-slate-100 dark:bg-slate-700/50 rounded-xl p-3 sm:p-4 border border-slate-200 dark:border-slate-600 text-center">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                    Generated using <span className="font-semibold text-slate-900 dark:text-white">WealthWise Advanced AI Budget Engine</span>
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    {budget.framework || 'Advanced Realistic Model'} •
                    Confidence: {budget.confidence ? Math.round(budget.confidence * 100) + '%' : 'High'}
                </p>
                {budget.generatedAt && (
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                        Generated on {new Date(budget.generatedAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </p>
                )}
            </div>
        </div>
    )
}
