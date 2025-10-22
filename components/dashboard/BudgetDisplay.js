// // app/components/dashboard/BudgetDisplay.js  
// 'use client'

// import { useState, useEffect } from 'react'
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { Progress } from '@/components/ui/progress'
// import { Badge } from '@/components/ui/badge'
// import { 
//   PieChart, 
//   Pie, 
//   Cell, 
//   ResponsiveContainer,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend
// } from 'recharts'
// import { 
//   TrendingUp, 
//   DollarSign, 
//   PiggyBank, 
//   Target,
//   Lightbulb,
//   Star,
//   RefreshCw,
//   AlertCircle,
//   CheckCircle,
//   BarChart3,
//   Settings,
//   Edit3
// } from 'lucide-react'
// import ExpenseTrackingDashboard from '@/components/dashboard/ExpenseTrackingDashboard'
// import BudgetCustomizer from '@/components/budget/BudgetCustomizer'
// import BudgetCustomizationGuide from '@/components/budget/BudgetCustomizationGuide'
// import toast from 'react-hot-toast'

// const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300']

// export default function BudgetDisplay({ refreshTrigger }) {
//   const [budget, setBudget] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [generating, setGenerating] = useState(false)
//   const [showCustomizer, setShowCustomizer] = useState(false)
//   const [showGuide, setShowGuide] = useState(false)

//   useEffect(() => {
//     fetchBudget()
//   }, [])

//   const fetchBudget = async () => {
//     try {
//       console.log('Fetching budget data...')
//       const response = await fetch('/api/budget/generate')
//       const data = await response.json()

//       console.log('Budget API response:', { success: data.success, hasBudget: !!data.budget, hasCategories: !!data.budget?.categories })

//       if (data.success) {
//         setBudget(data.budget)
//       } else {
//         console.log('No budget exists, showing generate button')
//         // No budget exists, show generate button
//         setBudget(null)
//       }
//     } catch (error) {
//       console.error('Failed to fetch budget:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const generateBudget = async () => {
//     setGenerating(true)
//     try {
//       const response = await fetch('/api/budget/generate', {
//         method: 'POST'
//       })
//       const data = await response.json()

//       if (data.success) {
//         setBudget(data.budget)
//         toast.success('🎉 Your personalized budget has been generated!')
//       } else {
//         toast.error(data.error || 'Failed to generate budget')
//       }
//     } catch (error) {
//       toast.error('Failed to generate budget')
//       console.error('Budget generation error:', error)
//     } finally {
//       setGenerating(false)
//     }
//   }

//   const getHealthScoreColor = (score) => {
//     if (score >= 80) return 'text-green-600'
//     if (score >= 60) return 'text-yellow-600'
//     return 'text-red-600'
//   }

//   const getHealthScoreBadge = (score) => {
//     if (score >= 80) return { text: 'Excellent', variant: 'default', color: 'bg-green-100 text-green-800' }
//     if (score >= 60) return { text: 'Good', variant: 'secondary', color: 'bg-yellow-100 text-yellow-800' }
//     return { text: t('budget.needsImprovement'), variant: 'destructive', color: 'bg-red-100 text-red-800' }
//   }

//   const handleCustomizeBudget = () => {
//     setShowCustomizer(true)
//   }

//   const handleSaveCustomBudget = async (customizedBudget) => {
//     try {
//       const response = await fetch('/api/budget/save', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ budget: customizedBudget }),
//       })

//       const data = await response.json()

//       if (data.success) {
//         setBudget(customizedBudget)
//         setShowCustomizer(false)
//         toast.success('🎉 Custom budget saved successfully!')
//       } else {
//         throw new Error(data.error || 'Failed to save budget')
//       }
//     } catch (error) {
//       console.error('Error saving custom budget:', error)
//       toast.error('Failed to save custom budget')
//     }
//   }

//   const handleCancelCustomization = () => {
//     setShowCustomizer(false)
//   }

//   const handleShowGuide = () => {
//     setShowGuide(true)
//   }

//   const handleStartCustomization = () => {
//     setShowGuide(false)
//     setShowCustomizer(true)
//   }

//   if (loading) {
//     return (
//       <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
//         <CardContent className="flex items-center justify-center p-8">
//           <div className="text-center">
//             <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//             <p className="text-gray-600">Loading your budget...</p>
//           </div>
//         </CardContent>
//       </Card>
//     )
//   }

//   if (!budget) {
//     return (
//       <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
//         <CardHeader className="text-center">
//           <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
//             <BarChart3 className="w-8 h-8 text-white" />
//           </div>
//           <CardTitle className="text-2xl font-bold text-gray-900">Generate Your Smart Budget</CardTitle>
//           <CardDescription className="text-lg">
//             Get AI-powered budget recommendations tailored to your lifestyle and financial goals
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="text-center">
//           <Button 
//             onClick={generateBudget}
//             disabled={generating}
//             className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg"
//           >
//             {generating ? (
//               <>
//                 <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
//                 Generating Budget...
//               </>
//             ) : (
//               <>
//                 <Star className="w-5 h-5 mr-2" />
//                 Generate My Budget
//               </>
//             )}
//           </Button>
//         </CardContent>
//       </Card>
//     )
//   }

//   // Early return if budget is not properly loaded
//   if (!budget || !budget.categories) {
//     return (
//       <Card>
//         <CardContent className="p-6">
//           <div className="text-center">
//             <p className="text-gray-500">Budget data not available</p>
//           </div>
//         </CardContent>
//       </Card>
//     )
//   }

//   // Prepare chart data
//   const pieData = Object.entries(budget.categories).map(([key, category]) => ({
//     name: category.englishName,
//     value: category.amount,
//     percentage: category.percentage
//   }))

//   const barData = Object.entries(budget.categories).map(([key, category]) => ({
//     name: category.englishName,
//     amount: category.amount,
//     percentage: category.percentage
//   }))

//   const healthBadge = getHealthScoreBadge(budget.healthScore)

//   // Show Budget Customization Guide if requested
//   if (showGuide) {
//     return (
//       <BudgetCustomizationGuide onStartCustomization={handleStartCustomization} />
//     )
//   }

//   // Show Budget Customizer if user wants to customize
//   if (showCustomizer) {
//     return (
//       <BudgetCustomizer
//         budget={budget}
//         onSave={handleSaveCustomBudget}
//         onCancel={handleCancelCustomization}
//       />
//     )
//   }

//   return (
//     <div className="space-y-8">
//       {/* Compact Budget Summary */}
//       <Card className="border shadow-sm rounded-xl bg-white">
//         <CardContent className="p-6 space-y-6">
//           <div className="flex flex-col sm:flex-row justify-between gap-4">
//             <div>
//               <div className="flex items-center gap-2 mb-2">
//                 <Star className="w-4 h-4 text-emerald-600" />
//                 <span className="text-sm font-medium text-emerald-700">
//                   {budget.isCustomized ? 'Custom Budget' : 'AI Budget'}
//                 </span>
//                 {budget.isCustomized && (
//                   <Badge className="bg-emerald-100 text-emerald-700 text-xs">Customized</Badge>
//                 )}
//               </div>
//               <h2 className="text-2xl font-bold text-slate-800 leading-tight">Your Smart Budget</h2>
//               <p className="text-sm text-slate-500 mt-1">Monthly plan generated from your profile</p>
//             </div>
//             <div className="flex items-start gap-3">
//               <div className="text-center">
//                 <div className="text-3xl font-bold text-slate-800">{budget.healthScore}%</div>
//                 <Badge className={`${healthBadge.color} mt-1`}>{healthBadge.text}</Badge>
//               </div>
//               <div className="flex flex-col gap-2">
//                 <Button
//                   onClick={handleCustomizeBudget}
//                   variant="outline"
//                   className="h-9 px-4 border-slate-300 text-slate-700 hover:bg-slate-50"
//                 >
//                   <Settings className="w-4 h-4 mr-2" />
//                   Customize
//                 </Button>
//                 <Button
//                   onClick={handleShowGuide}
//                   variant="outline"
//                   size="sm"
//                   className="h-8 px-3 text-xs border-slate-200 text-slate-600 hover:bg-slate-50"
//                 >
//                   <Lightbulb className="w-3 h-3 mr-1" /> Guide
//                 </Button>
//               </div>
//             </div>
//           </div>
//           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//             <div className="p-4 rounded-lg border bg-slate-50 flex flex-col">
//               <span className="text-xs uppercase tracking-wide text-slate-500 mb-1">Monthly Budget</span>
//               <span className="text-xl font-semibold text-slate-800">₹{budget.totalBudget.toLocaleString('en-IN')}</span>
//             </div>
//             <div className="p-4 rounded-lg border bg-slate-50 flex flex-col">
//               <span className="text-xs uppercase tracking-wide text-slate-500 mb-1">Allocated</span>
//               <span className="text-xl font-semibold text-slate-800">₹{budget.totalAllocated?.toLocaleString('en-IN')}</span>
//             </div>
//             <div className="p-4 rounded-lg border bg-slate-50 flex flex-col">
//               <span className="text-xs uppercase tracking-wide text-slate-500 mb-1">Last Generated</span>
//               <span className="text-sm font-medium text-slate-700">{new Date(budget.generatedAt).toLocaleDateString('en-IN')}</span>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Expense Tracking Dashboard - Main Feature */}
//       <ExpenseTrackingDashboard budget={budget} refreshTrigger={refreshTrigger} />

//       {/* Budget Charts */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Pie Chart */}
//         <Card className="border rounded-xl shadow-sm bg-white">
//           <CardHeader>
//             <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
//               <PieChart className="w-4 h-4 text-emerald-600" /> Distribution
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <ResponsiveContainer width="100%" height={300}>
//               <PieChart>
//                 <Pie
//                   data={pieData}
//                   cx="50%"
//                   cy="50%"
//                   labelLine={false}
//                   label={({ name, percentage }) => `${name}: ${percentage}%`}
//                   outerRadius={80}
//                   fill="#8884d8"
//                   dataKey="value"
//                 >
//                   {pieData.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                   ))}
//                 </Pie>
//                 <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
//               </PieChart>
//             </ResponsiveContainer>
//           </CardContent>
//         </Card>

//         {/* Bar Chart */}
//         <Card className="border rounded-xl shadow-sm bg-white">
//           <CardHeader>
//             <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
//               <BarChart3 className="w-4 h-4 text-teal-600" /> Category Breakdown
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <ResponsiveContainer width="100%" height={300}>
//               <BarChart data={barData}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
//                 <XAxis 
//                   dataKey="name" 
//                   angle={-45}
//                   textAnchor="end"
//                   height={80}
//                   fontSize={12}
//                   stroke="#64748b"
//                 />
//                 <YAxis formatter={(value) => `₹${(value/1000).toFixed(0)}k`} stroke="#64748b" />
//                 <Tooltip 
//                   formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
//                   contentStyle={{
//                     backgroundColor: 'rgba(255, 255, 255, 0.9)',
//                     backdropFilter: 'blur(10px)',
//                     border: '1px solid rgba(20, 184, 166, 0.2)',
//                     borderRadius: '12px',
//                     boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
//                   }}
//                 />
//                 <Bar 
//                   dataKey="amount" 
//                   fill="url(#tealGradient)"
//                   radius={[6, 6, 0, 0]}
//                 />
//                 <defs>
//                   <linearGradient id="tealGradient" x1="0" y1="0" x2="0" y2="1">
//                     <stop offset="0%" stopColor="#14b8a6" />
//                     <stop offset="100%" stopColor="#0891b2" />
//                   </linearGradient>
//                 </defs>
//               </BarChart>
//             </ResponsiveContainer>
//           </CardContent>
//         </Card>
//       </div>

//   {/* Budget Categories */}
//   <Card className="border rounded-xl shadow-sm bg-white">
//         <CardHeader>
//           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//             <div>
//               <CardTitle className="flex items-center">
//                 <DollarSign className="w-5 h-5 mr-2 text-green-600" />
//                 {t('budget.budgetCategories')}
//                 {budget.isCustomized && (
//       <Badge className="bg-emerald-100 text-emerald-700 ml-2">
//                     <Edit3 className="w-3 h-3 mr-1" />
//                     Customized
//                   </Badge>
//                 )}
//               </CardTitle>
//               <CardDescription>
//                 {budget.isCustomized 
//                   ? 'Your personalized budget allocation based on your preferences'
//                   : t('budget.aiRecommendedBreakdown')
//                 }
//               </CardDescription>
//             </div>
//             <Button
//               onClick={handleCustomizeBudget}
//               variant="outline"
//               size="sm"
//               className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
//             >
//               <Settings className="w-4 h-4 mr-2" />
//               {budget.isCustomized ? 'Modify Budget' : 'Customize Budget'}
//             </Button>
//           </div>
//         </CardHeader>
//         <CardContent>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {Object.entries(budget.categories).map(([key, category]) => (
//               <div key={key} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
//                 <div className="flex items-center justify-between mb-2">
//                   <span className="font-semibold text-gray-900">
//                     {category.emoji} {category.englishName}
//                   </span>
//                   <Badge variant="outline">{category.percentage}%</Badge>
//                 </div>
//                 <div className="text-2xl font-bold text-gray-900 mb-2">
//                   ₹{category.amount.toLocaleString('en-IN')}
//                 </div>
//                 <Progress value={category.percentage} className="h-2 mb-2" />
//                 {budget.explanations?.categories?.[key] && (
//                   <p className="text-sm text-gray-600">
//                     {budget.explanations.categories[key]}
//                   </p>
//                 )}
//               </div>
//             ))}
//           </div>

//           {budget.isCustomized && (
//             <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
//               <div className="flex items-start gap-3">
//                 <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
//                 <div>
//                   <h4 className="font-medium text-blue-900 mb-1">Budget Customized Successfully!</h4>
//                   <p className="text-sm text-blue-700">
//                     Your budget has been tailored to your preferences. 
//                     {budget.customizedAt && (
//                       <span className="block mt-1 text-xs">
//                         Last modified: {new Date(budget.customizedAt).toLocaleDateString('en-IN')} at {new Date(budget.customizedAt).toLocaleTimeString('en-IN')}
//                       </span>
//                     )}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* AI Tips */}
//       {budget.tips && budget.tips.length > 0 && (
//         <Card className="border rounded-xl shadow-sm bg-white">
//           <CardHeader>
//             <CardTitle className="flex items-center">
//               <Lightbulb className="w-5 h-5 mr-2 text-yellow-600" />
//               {t('budget.aiPoweredTips')}
//             </CardTitle>
//             <CardDescription>Personalized recommendations to improve your financial health</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-3">
//               {budget.tips.map((tip, index) => (
//                 <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
//                   <CheckCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
//                   <p className="text-gray-700">{tip}</p>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Investment Recommendations */}
//       {budget.recommendations && budget.recommendations.length > 0 && (
//         <Card className="border rounded-xl shadow-sm bg-white">
//           <CardHeader>
//             <CardTitle className="flex items-center">
//               <Target className="w-5 h-5 mr-2 text-purple-600" />
//               {t('budget.investmentRecommendations')}
//             </CardTitle>
//             <CardDescription>Smart investment suggestions based on your profile</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               {budget.recommendations.map((rec, index) => (
//                 <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
//                   <div className="flex items-center justify-between mb-2">
//                     <div className="flex items-center">
//                       <span className="text-2xl mr-2">{rec.icon}</span>
//                       <h3 className="font-semibold text-gray-900">{rec.type}</h3>
//                     </div>
//                     <Badge variant={rec.priority === 'Critical' ? 'destructive' : rec.priority === 'High' ? 'default' : 'secondary'}>
//                       {rec.priority}
//                     </Badge>
//                   </div>
//                   <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
//                   {rec.amount && (
//                     <p className="text-lg font-bold text-gray-900">
//                       ₹{rec.amount.toLocaleString('en-IN')}
//                     </p>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Regenerate Budget */}
//   <Card className="border rounded-xl shadow-sm bg-white">
//         <CardContent className="text-center p-6">
//           <p className="text-gray-600 mb-4">
//             Budget generated on {new Date(budget.generatedAt).toLocaleDateString('en-IN')}
//           </p>
//           <Button 
//             onClick={generateBudget}
//             disabled={generating}
//             variant="outline"
//             className="border-blue-600 text-blue-600 hover:bg-blue-50"
//           >
//             {generating ? (
//               <>
//                 <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
//                 Regenerating...
//               </>
//             ) : (
//               <>
//                 <RefreshCw className="w-4 h-4 mr-2" />
//                 Regenerate Budget
//               </>
//             )}
//           </Button>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }



// // app/components/dashboard/BudgetDisplay.js  
// 'use client'

// import { useState, useEffect } from 'react'
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { Progress } from '@/components/ui/progress'
// import { Badge } from '@/components/ui/badge'
// import { 
//   PieChart, 
//   Pie, 
//   Cell, 
//   ResponsiveContainer,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend
// } from 'recharts'
// import { 
//   TrendingUp, 
//   DollarSign, 
//   PiggyBank, 
//   Target,
//   Lightbulb,
//   Star,
//   RefreshCw,
//   AlertCircle,
//   CheckCircle,
//   BarChart3,
//   Settings,
//   Edit3
// } from 'lucide-react'
// import ExpenseTrackingDashboard from '@/components/dashboard/ExpenseTrackingDashboard'
// import BudgetCustomizer from '@/components/budget/BudgetCustomizer'
// import BudgetCustomizationGuide from '@/components/budget/BudgetCustomizationGuide'
// import toast from 'react-hot-toast'

// const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300']

// export default function BudgetDisplay({ refreshTrigger }) {
//   const [budget, setBudget] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [generating, setGenerating] = useState(false)
//   const [showCustomizer, setShowCustomizer] = useState(false)
//   const [showGuide, setShowGuide] = useState(false)

//   useEffect(() => {
//     fetchBudget()
//   }, [])

//   const fetchBudget = async () => {
//     try {
//       console.log('Fetching budget data...')
//       const response = await fetch('/api/budget/generate')
//       const data = await response.json()

//       console.log('Budget API response:', { success: data.success, hasBudget: !!data.budget, hasCategories: !!data.budget?.categories })

//       if (data.success) {
//         setBudget(data.budget)
//       } else {
//         console.log('No budget exists, showing generate button')
//         // No budget exists, show generate button
//         setBudget(null)
//       }
//     } catch (error) {
//       console.error('Failed to fetch budget:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const generateBudget = async () => {
//     setGenerating(true)
//     try {
//       const response = await fetch('/api/budget/generate', {
//         method: 'POST'
//       })
//       const data = await response.json()

//       if (data.success) {
//         setBudget(data.budget)
//         toast.success('🎉 Your personalized budget has been generated!')
//       } else {
//         toast.error(data.error || 'Failed to generate budget')
//       }
//     } catch (error) {
//       toast.error('Failed to generate budget')
//       console.error('Budget generation error:', error)
//     } finally {
//       setGenerating(false)
//     }
//   }

//   const getHealthScoreColor = (score) => {
//     if (score >= 80) return 'text-green-600'
//     if (score >= 60) return 'text-yellow-600'
//     return 'text-red-600'
//   }

//   const getHealthScoreBadge = (score) => {
//     if (score >= 80) return { text: 'Excellent', variant: 'default', color: 'bg-green-100 text-green-800' }
//     if (score >= 60) return { text: 'Good', variant: 'secondary', color: 'bg-yellow-100 text-yellow-800' }
//     return { text: 'Needs Improvement', variant: 'destructive', color: 'bg-red-100 text-red-800' }
//   }

//   const handleCustomizeBudget = () => {
//     setShowCustomizer(true)
//   }

//   const handleSaveCustomBudget = async (customizedBudget) => {
//     try {
//       const response = await fetch('/api/budget/save', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ budget: customizedBudget }),
//       })

//       const data = await response.json()

//       if (data.success) {
//         setBudget(customizedBudget)
//         setShowCustomizer(false)
//         toast.success('🎉 Custom budget saved successfully!')
//       } else {
//         throw new Error(data.error || 'Failed to save budget')
//       }
//     } catch (error) {
//       console.error('Error saving custom budget:', error)
//       toast.error('Failed to save custom budget')
//     }
//   }

//   const handleCancelCustomization = () => {
//     setShowCustomizer(false)
//   }

//   const handleShowGuide = () => {
//     setShowGuide(true)
//   }

//   const handleStartCustomization = () => {
//     setShowGuide(false)
//     setShowCustomizer(true)
//   }

//   if (loading) {
//     return (
//       <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
//         <CardContent className="flex items-center justify-center p-8">
//           <div className="text-center">
//             <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//             <p className="text-gray-600">Loading your budget...</p>
//           </div>
//         </CardContent>
//       </Card>
//     )
//   }

//   if (!budget) {
//     return (
//       <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
//         <CardHeader className="text-center">
//           <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
//             <BarChart3 className="w-8 h-8 text-white" />
//           </div>
//           <CardTitle className="text-2xl font-bold text-gray-900">Generate Your Smart Budget</CardTitle>
//           <CardDescription className="text-lg">
//             Get AI-powered budget recommendations tailored to your lifestyle and financial goals
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="text-center">
//           <Button 
//             onClick={generateBudget}
//             disabled={generating}
//             className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg"
//           >
//             {generating ? (
//               <>
//                 <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
//                 Generating Budget...
//               </>
//             ) : (
//               <>
//                 <Star className="w-5 h-5 mr-2" />
//                 Generate My Budget
//               </>
//             )}
//           </Button>
//         </CardContent>
//       </Card>
//     )
//   }

//   // Early return if budget is not properly loaded
//   if (!budget || !budget.categories) {
//     return (
//       <Card>
//         <CardContent className="p-6">
//           <div className="text-center">
//             <p className="text-gray-500">Budget data not available</p>
//           </div>
//         </CardContent>
//       </Card>
//     )
//   }

//   // Prepare chart data
//   const pieData = Object.entries(budget.categories).map(([key, category]) => ({
//     name: category.englishName,
//     value: category.amount,
//     percentage: category.percentage
//   }))

//   const barData = Object.entries(budget.categories).map(([key, category]) => ({
//     name: category.englishName,
//     amount: category.amount,
//     percentage: category.percentage
//   }))

//   const healthBadge = getHealthScoreBadge(budget.healthScore)

//   // Show Budget Customization Guide if requested
//   if (showGuide) {
//     return (
//       <BudgetCustomizationGuide onStartCustomization={handleStartCustomization} />
//     )
//   }

//   // Show Budget Customizer if user wants to customize
//   if (showCustomizer) {
//     return (
//       <BudgetCustomizer
//         budget={budget}
//         onSave={handleSaveCustomBudget}
//         onCancel={handleCancelCustomization}
//       />
//     )
//   }

//   return (
//     <div className="space-y-8">
//       {/* Budget Overview Header */}
//       <Card className="group bg-gradient-to-br from-emerald-600 via-teal-600 to-blue-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-xl rounded-2xl ring-2 ring-white/20">
//         <CardContent className="p-8">
//           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//             <div className="flex-1">
//               <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-xl rounded-full px-4 py-2 mb-4">
//                 <Star className="w-4 h-4 text-white" />
//                 <span className="text-white font-medium text-sm">
//                   {budget.isCustomized ? 'Custom Budget' : 'Smart Budget AI'}
//                 </span>
//                 {budget.isCustomized && (
//                   <Badge className="bg-white/30 text-white text-xs px-2 py-0.5 ml-2">
//                     Customized
//                   </Badge>
//                 )}
//               </div>
//               <h2 className="text-3xl lg:text-4xl font-bold mb-3">Your Smart Budget</h2>
//               <p className="text-emerald-100 text-lg font-medium">
//                 Monthly Budget: ₹{budget.totalBudget.toLocaleString('en-IN')}
//               </p>
//             </div>
//             <div className="flex flex-col sm:flex-row items-center gap-3">
//               <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-4 text-center">
//                 <div className="text-4xl font-bold mb-2 text-white">{budget.healthScore}%</div>
//                 <Badge className={`${healthBadge.color} font-bold text-sm px-3 py-1`}>
//                   {healthBadge.text}
//                 </Badge>
//               </div>
//               <div className="flex flex-col gap-2">
//                 <Button
//                   onClick={handleCustomizeBudget}
//                   className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-xl px-4 py-2 rounded-xl transition-all duration-300"
//                   variant="outline"
//                 >
//                   <Settings className="w-4 h-4 mr-2" />
//                   Customize Budget
//                 </Button>
//                 <Button
//                   onClick={handleShowGuide}
//                   className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-xl px-4 py-1 rounded-lg transition-all duration-300 text-sm"
//                   variant="outline"
//                   size="sm"
//                 >
//                   <Lightbulb className="w-3 h-3 mr-1" />
//                   Learn More
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Expense Tracking Dashboard - Main Feature */}
//       <ExpenseTrackingDashboard budget={budget} refreshTrigger={refreshTrigger} />

//       {/* Budget Charts - Secondary Information */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//         {/* Pie Chart */}
//         <Card className="group bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/30 hover:from-white hover:via-emerald-50/50 hover:to-teal-50/50 border-2 border-emerald-200/40 hover:border-emerald-300/60 shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-xl rounded-2xl ring-1 ring-white/50">
//           <CardHeader>
//             <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-800 via-emerald-700 to-slate-800 bg-clip-text text-transparent flex items-center">
//               <PieChart className="w-6 h-6 mr-3 text-emerald-600" />
//               Budget Distribution
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <ResponsiveContainer width="100%" height={300}>
//               <PieChart>
//                 <Pie
//                   data={pieData}
//                   cx="50%"
//                   cy="50%"
//                   labelLine={false}
//                   label={({ name, percentage }) => `${name}: ${percentage}%`}
//                   outerRadius={80}
//                   fill="#8884d8"
//                   dataKey="value"
//                 >
//                   {pieData.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                   ))}
//                 </Pie>
//                 <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
//               </PieChart>
//             </ResponsiveContainer>
//           </CardContent>
//         </Card>

//         {/* Bar Chart */}
//         <Card className="group bg-gradient-to-br from-white via-teal-50/30 to-blue-50/30 hover:from-white hover:via-teal-50/50 hover:to-blue-50/50 border-2 border-teal-200/40 hover:border-teal-300/60 shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-xl rounded-2xl ring-1 ring-white/50">
//           <CardHeader>
//             <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-800 via-teal-700 to-slate-800 bg-clip-text text-transparent flex items-center">
//               <BarChart3 className="w-6 h-6 mr-3 text-teal-600" />
//               Category Breakdown
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <ResponsiveContainer width="100%" height={300}>
//               <BarChart data={barData}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
//                 <XAxis 
//                   dataKey="name" 
//                   angle={-45}
//                   textAnchor="end"
//                   height={80}
//                   fontSize={12}
//                   stroke="#64748b"
//                 />
//                 <YAxis formatter={(value) => `₹${(value/1000).toFixed(0)}k`} stroke="#64748b" />
//                 <Tooltip 
//                   formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
//                   contentStyle={{
//                     backgroundColor: 'rgba(255, 255, 255, 0.9)',
//                     backdropFilter: 'blur(10px)',
//                     border: '1px solid rgba(20, 184, 166, 0.2)',
//                     borderRadius: '12px',
//                     boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
//                   }}
//                 />
//                 <Bar 
//                   dataKey="amount" 
//                   fill="url(#tealGradient)"
//                   radius={[6, 6, 0, 0]}
//                 />
//                 <defs>
//                   <linearGradient id="tealGradient" x1="0" y1="0" x2="0" y2="1">
//                     <stop offset="0%" stopColor="#14b8a6" />
//                     <stop offset="100%" stopColor="#0891b2" />
//                   </linearGradient>
//                 </defs>
//               </BarChart>
//             </ResponsiveContainer>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Budget Categories */}
//       <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
//         <CardHeader>
//           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//             <div>
//               <CardTitle className="flex items-center">
//                 <DollarSign className="w-5 h-5 mr-2 text-green-600" />
//                 {t('budget.budgetCategories')}
//                 {budget.isCustomized && (
//                   <Badge className="bg-blue-100 text-blue-800 ml-2">
//                     <Edit3 className="w-3 h-3 mr-1" />
//                     Customized
//                   </Badge>
//                 )}
//               </CardTitle>
//               <CardDescription>
//                 {budget.isCustomized 
//                   ? 'Your personalized budget allocation based on your preferences'
//                   : 'AI-recommended breakdown of your monthly budget allocation'
//                 }
//               </CardDescription>
//             </div>
//             <Button
//               onClick={handleCustomizeBudget}
//               variant="outline"
//               size="sm"
//               className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
//             >
//               <Settings className="w-4 h-4 mr-2" />
//               {budget.isCustomized ? 'Modify Budget' : 'Customize Budget'}
//             </Button>
//           </div>
//         </CardHeader>
//         <CardContent>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {Object.entries(budget.categories).map(([key, category]) => (
//               <div key={key} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
//                 <div className="flex items-center justify-between mb-2">
//                   <span className="font-semibold text-gray-900">
//                     {category.emoji} {category.englishName}
//                   </span>
//                   <Badge variant="outline">{category.percentage}%</Badge>
//                 </div>
//                 <div className="text-2xl font-bold text-gray-900 mb-2">
//                   ₹{category.amount.toLocaleString('en-IN')}
//                 </div>
//                 <Progress value={category.percentage} className="h-2 mb-2" />
//                 {budget.explanations?.categories?.[key] && (
//                   <p className="text-sm text-gray-600">
//                     {budget.explanations.categories[key]}
//                   </p>
//                 )}
//               </div>
//             ))}
//           </div>

//           {budget.isCustomized && (
//             <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
//               <div className="flex items-start gap-3">
//                 <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
//                 <div>
//                   <h4 className="font-medium text-blue-900 mb-1">Budget Customized Successfully!</h4>
//                   <p className="text-sm text-blue-700">
//                     Your budget has been tailored to your preferences. 
//                     {budget.customizedAt && (
//                       <span className="block mt-1 text-xs">
//                         Last modified: {new Date(budget.customizedAt).toLocaleDateString('en-IN')} at {new Date(budget.customizedAt).toLocaleTimeString('en-IN')}
//                       </span>
//                     )}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* AI Tips */}
//       {budget.tips && budget.tips.length > 0 && (
//         <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
//           <CardHeader>
//             <CardTitle className="flex items-center">
//               <Lightbulb className="w-5 h-5 mr-2 text-yellow-600" />
//               AI-Powered Financial Tips
//             </CardTitle>
//             <CardDescription>Personalized recommendations to improve your financial health</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-3">
//               {budget.tips.map((tip, index) => (
//                 <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
//                   <CheckCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
//                   <p className="text-gray-700">{tip}</p>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Investment Recommendations */}
//       {budget.recommendations && budget.recommendations.length > 0 && (
//         <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
//           <CardHeader>
//             <CardTitle className="flex items-center">
//               <Target className="w-5 h-5 mr-2 text-purple-600" />
//               Investment Recommendations
//             </CardTitle>
//             <CardDescription>Smart investment suggestions based on your profile</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               {budget.recommendations.map((rec, index) => (
//                 <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
//                   <div className="flex items-center justify-between mb-2">
//                     <div className="flex items-center">
//                       <span className="text-2xl mr-2">{rec.icon}</span>
//                       <h3 className="font-semibold text-gray-900">{rec.type}</h3>
//                     </div>
//                     <Badge variant={rec.priority === 'Critical' ? 'destructive' : rec.priority === 'High' ? 'default' : 'secondary'}>
//                       {rec.priority}
//                     </Badge>
//                   </div>
//                   <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
//                   {rec.amount && (
//                     <p className="text-lg font-bold text-gray-900">
//                       ₹{rec.amount.toLocaleString('en-IN')}
//                     </p>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Regenerate Budget */}
//       <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
//         <CardContent className="text-center p-6">
//           <p className="text-gray-600 mb-4">
//             Budget generated on {new Date(budget.generatedAt).toLocaleDateString('en-IN')}
//           </p>
//           <Button 
//             onClick={generateBudget}
//             disabled={generating}
//             variant="outline"
//             className="border-blue-600 text-blue-600 hover:bg-blue-50"
//           >
//             {generating ? (
//               <>
//                 <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
//                 Regenerating...
//               </>
//             ) : (
//               <>
//                 <RefreshCw className="w-4 h-4 mr-2" />
//                 Regenerate Budget
//               </>
//             )}
//           </Button>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }

// app/components/dashboard/BudgetDisplay.js  
'use client'

import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  AreaChart
} from 'recharts'
import {
  TrendingUp,
  DollarSign,
  PiggyBank,
  Target,
  Lightbulb,
  Star,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Settings,
  Edit3,
  ArrowRight,
  Sparkles,
  Eye,
  Zap,
  Award,
  ChevronRight,
  Activity,
  Wallet
} from 'lucide-react'
import ExpenseTrackingDashboard from '@/components/dashboard/ExpenseTrackingDashboard'
import BudgetCustomizer from '@/components/budget/BudgetCustomizer'
import BudgetCustomizationGuide from '@/components/budget/BudgetCustomizationGuide'
import AIBudgetTip from '@/components/budget/AIBudgetTip'
import toast from 'react-hot-toast'

const COLORS = [
  'rgb(99, 102, 241)', // Indigo
  'rgb(16, 185, 129)', // Emerald
  'rgb(245, 158, 11)', // Amber
  'rgb(239, 68, 68)', // Red
  'rgb(139, 92, 246)', // Violet
  'rgb(6, 182, 212)', // Cyan
  'rgb(251, 113, 133)', // Rose
  'rgb(34, 197, 94)' // Green
]

const GRADIENT_COLORS = [
  'from-indigo-500 to-purple-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-red-500 to-pink-600',
  'from-violet-500 to-purple-600',
  'from-cyan-500 to-blue-600',
  'from-rose-500 to-pink-600',
  'from-green-500 to-emerald-600'
]

export default function BudgetDisplay({ refreshTrigger }) {
  const { t } = useTranslation()
  const [budget, setBudget] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [showCustomizer, setShowCustomizer] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [hoveredCategory, setHoveredCategory] = useState(null)

  useEffect(() => {
    fetchBudget()
  }, [])

  const fetchBudget = async () => {
    try {
      console.log('Fetching budget data...')
      const response = await fetch('/api/budget/generate')
      const data = await response.json()

      console.log('Budget API response:', { success: data.success, hasBudget: !!data.budget, hasCategories: !!data.budget?.categories })

      if (data.success) {
        setBudget(data.budget)
      } else {
        console.log('No budget exists, showing generate button')
        setBudget(null)
      }
    } catch (error) {
      console.error('Failed to fetch budget:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateBudget = async () => {
    setGenerating(true)
    try {
      const response = await fetch('/api/budget/generate', {
        method: 'POST'
      })
      const data = await response.json()

      if (data.success) {
        setBudget(data.budget)
        toast.success('🎉 Your personalized budget has been generated!')
      } else {
        toast.error(data.error || 'Failed to generate budget')
      }
    } catch (error) {
      toast.error('Failed to generate budget')
      console.error('Budget generation error:', error)
    } finally {
      setGenerating(false)
    }
  }

  const getHealthScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600'
    if (score >= 60) return 'text-amber-600'
    return 'text-red-600'
  }

  const getHealthScoreBadge = (score) => {
    if (score >= 80) return {
      text: 'Excellent',
      color: 'bg-gradient-to-r from-emerald-500 to-green-500 text-white',
      icon: Award
    }
    if (score >= 60) return {
      text: 'Good',
      color: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
      icon: Star
    }
    return {
      text: 'Needs Improvement',
      color: 'bg-gradient-to-r from-red-500 to-pink-500 text-white',
      icon: Activity
    }
  }

  // Memoized calculations for better performance
  const chartData = useMemo(() => {
    if (!budget?.categories) return { pieData: [], barData: [], areaData: [] }

    const pieData = Object.entries(budget.categories).map(([key, category], index) => ({
      name: category.englishName,
      value: category.amount,
      percentage: category.percentage,
      color: COLORS[index % COLORS.length],
      gradient: GRADIENT_COLORS[index % GRADIENT_COLORS.length]
    }))

    const barData = Object.entries(budget.categories).map(([key, category], index) => ({
      name: category.englishName,
      amount: category.amount,
      percentage: category.percentage,
      color: COLORS[index % COLORS.length]
    }))

    const areaData = Object.entries(budget.categories).map(([key, category], index) => ({
      name: category.englishName.slice(0, 8),
      amount: category.amount,
      percentage: category.percentage
    }))

    return { pieData, barData, areaData }
  }, [budget?.categories])

  const handleCustomizeBudget = () => {
    setShowCustomizer(true)
  }

  const handleSaveCustomBudget = async (customizedBudget) => {
    try {
      const response = await fetch('/api/budget/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ budget: customizedBudget }),
      })

      const data = await response.json()

      if (data.success) {
        setBudget(customizedBudget)
        setShowCustomizer(false)
        toast.success('🎉 Custom budget saved successfully!')
      } else {
        throw new Error(data.error || 'Failed to save budget')
      }
    } catch (error) {
      console.error('Error saving custom budget:', error)
      toast.error('Failed to save custom budget')
    }
  }

  const handleCancelCustomization = () => {
    setShowCustomizer(false)
  }

  const handleShowGuide = () => {
    setShowGuide(true)
  }

  const handleStartCustomization = () => {
    setShowGuide(false)
    setShowCustomizer(true)
  }

  // Loading State with Modern Skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          {/* Animated Header Skeleton */}
          <div className="relative overflow-hidden bg-white/60 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer"></div>
            <div className="relative">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <div className="h-4 w-32 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full animate-pulse"></div>
                  <div className="h-8 w-48 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg animate-pulse"></div>
                  <div className="h-4 w-40 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full animate-pulse"></div>
                </div>
                <div className="flex gap-3">
                  <div className="h-24 w-24 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-2xl animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-10 w-32 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-xl animate-pulse"></div>
                    <div className="h-8 w-32 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Skeleton */}
          <div className="flex gap-2 p-2 bg-white/40 backdrop-blur-sm rounded-2xl">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 flex-1 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-xl animate-pulse"></div>
            ))}
          </div>

          {/* Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="relative overflow-hidden bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer"></div>
                <div className="relative space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-6 w-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg animate-pulse"></div>
                    <div className="h-6 w-16 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full animate-pulse"></div>
                  </div>
                  <div className="h-4 w-3/4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full animate-pulse"></div>
                  <div className="h-8 w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg animate-pulse"></div>
                  <div className="h-2 w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Loading Message */}
          <div className="text-center py-8">
            <div className="inline-flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg">
              <div className="w-5 h-5 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-lg font-medium text-gray-700">Loading your budget data...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Empty State with CTA - Enhanced Modern Design
  if (!budget) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-100 to-blue-100 text-emerald-700 rounded-full px-4 sm:px-6 py-2 sm:py-2.5 mb-6 shadow-sm">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-xs sm:text-sm font-semibold">AI-Powered Budget Generator</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-6">
              <span className="bg-gradient-to-r from-emerald-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Create Your Smart
              </span>
              <br />
              <span className="text-gray-800">Financial Budget</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed px-4">
              Let our AI analyze your profile and generate a personalized budget
              that helps you save more, spend wisely, and achieve your financial dreams.
            </p>
          </div>

          {/* Main CTA Card */}
          <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden mb-8">
            <CardContent className="p-8 sm:p-12 lg:p-16">
              {/* Icon with Animation */}
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-3xl blur-2xl opacity-30 animate-pulse"></div>
                <div className="relative w-full h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-3xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
                </div>
              </div>

              {/* Main Heading */}
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 text-center">
                Generate Your Personalized Budget
              </h2>
              <p className="text-base sm:text-lg text-gray-600 mb-8 sm:mb-10 text-center max-w-xl mx-auto">
                Based on your income, location, and lifestyle, we&apos;ll create a custom budget plan in seconds.
              </p>

              {/* CTA Button */}
              <div className="flex flex-col items-center space-y-4">
                <Button
                  onClick={generateBudget}
                  disabled={generating}
                  className="group relative w-full sm:w-auto bg-gradient-to-r from-emerald-600 via-blue-600 to-indigo-600 hover:from-emerald-700 hover:via-blue-700 hover:to-indigo-700 text-white px-8 sm:px-12 py-4 sm:py-5 text-base sm:text-lg font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  {generating ? (
                    <>
                      <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 mr-3 animate-spin" />
                      <span>Creating Your Budget...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 sm:w-6 sm:h-6 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                      <span>Generate My Smart Budget</span>
                      <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </Button>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  Takes less than 10 seconds
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
            {[
              {
                icon: Target,
                title: 'Personalized Analysis',
                description: 'Budget tailored to your income, city, and family size',
                gradient: 'from-emerald-500 to-teal-500'
              },
              {
                icon: Sparkles,
                title: 'AI-Powered Insights',
                description: 'Smart recommendations based on financial expertise',
                gradient: 'from-blue-500 to-indigo-500'
              },
              {
                icon: TrendingUp,
                title: 'Actionable Tips',
                description: 'Practical advice to improve your financial health',
                gradient: 'from-violet-500 to-purple-500'
              }
            ].map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card
                  key={index}
                  className="group bg-white/60 backdrop-blur-sm border border-gray-200 shadow-lg hover:shadow-xl rounded-2xl overflow-hidden transform hover:scale-105 transition-all duration-300"
                >
                  <CardContent className="p-6">
                    <div className={`w-14 h-14 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Trust Indicators */}
          <div className="bg-white/60 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center">
              <div>
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-2">
                  100%
                </div>
                <p className="text-sm text-gray-600">Personalized</p>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                  AI-Powered
                </div>
                <p className="text-sm text-gray-600">Smart Analysis</p>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  &lt;10s
                </div>
                <p className="text-sm text-gray-600">Super Fast</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Early return if budget is not properly loaded
  if (!budget || !budget.categories) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Budget data not available</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const healthBadge = getHealthScoreBadge(budget.healthScore)
  const HealthIcon = healthBadge.icon

  // Show Budget Customization Guide if requested
  if (showGuide) {
    return (
      <BudgetCustomizationGuide onStartCustomization={handleStartCustomization} />
    )
  }

  // Show Budget Customizer if user wants to customize
  if (showCustomizer) {
    return (
      <BudgetCustomizer
        budget={budget}
        onSave={handleSaveCustomBudget}
        onCancel={handleCancelCustomization}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50  ">
      <div className="max-w-7xl mx-auto space-y-4">

        {/* Compact Budget Header */}
        <Card className="bg-white border border-gray-200 shadow-sm rounded-2xl">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <div className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-700 rounded-full px-3 py-1">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="font-medium text-xs sm:text-sm">
                      {budget.isCustomized ? t('budget.customBudget') : t('budget.smartBudget')}
                    </span>
                  </div>
                  {budget.isCustomized && (
                    <Badge className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1">
                      {t('budget.personalized')}
                    </Badge>
                  )}
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  {t('budget.budgetOverview')}
                </h1>
                <div className="space-y-1">
                  <p className="text-lg sm:text-xl font-semibold text-gray-700">
                    ₹{budget.totalBudget.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Updated: {new Date(budget.generatedAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>

              <div className="flex flex-row sm:flex-col lg:flex-row items-center gap-3 w-full sm:w-auto">
                {/* Health Score Display */}
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4 text-center flex-1 sm:flex-none min-w-[100px] sm:min-w-[120px]">
                  <HealthIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 mx-auto mb-1 sm:mb-2" />
                  <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{budget.healthScore}%</div>
                  <Badge
                    className={`text-xs px-2 py-1 ${budget.healthScore >= 80
                      ? 'bg-green-100 text-green-800'
                      : budget.healthScore >= 60
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                      }`}
                  >
                    {healthBadge.text}
                  </Badge>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 min-w-[100px]">
                  <Button
                    onClick={handleCustomizeBudget}
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg font-medium text-xs sm:text-sm"
                  >
                    <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">{t('budget.customize')}</span>
                    <span className="sm:hidden">{t('budget.edit')}</span>
                  </Button>
                  <Button
                    onClick={handleShowGuide}
                    variant="outline"
                    size="sm"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-lg text-xs sm:text-sm"
                  >
                    <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">{t('budget.learn')}</span>
                    <span className="sm:hidden">{t('budget.info')}</span>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Budget Tip Section - Only show for AI-generated budgets */}
        {!budget.isCustomized && (
          <AIBudgetTip onCustomize={handleCustomizeBudget} />
        )}

        {/* Responsive Navigation Tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: Eye },
            { id: 'tracking', label: 'Tracking', icon: Activity },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${activeTab === tab.id
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'tracking' && (
            <ExpenseTrackingDashboard budget={budget} refreshTrigger={refreshTrigger} />
          )}

          {activeTab === 'overview' && (
            <>
              {/* Responsive Quick Stats Cards */}
              {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {Object.entries(budget.categories).slice(0, 3).map(([key, category], index) => (
                  <Card 
                    key={key}
                    className="bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md transition-shadow duration-200"
                  >
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <div className="text-xl sm:text-2xl">{category.emoji}</div>
                        <Badge className="bg-gray-100 text-gray-700 text-xs px-2 py-1">
                          {category.percentage}%
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base truncate">
                        {category.englishName}
                      </h3>
                      <div className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                        ₹{(category.amount/1000).toFixed(0)}k
                      </div>
                      <Progress value={category.percentage} className="h-2" />
                    </CardContent>
                  </Card>
                ))}
              </div> */}

              {/* Budget Categories Grid */}
              <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                        <Wallet className="w-6 h-6 mr-3 text-indigo-600" />
                        {t('budget.budgetCategories')}
                        {budget.isCustomized && (
                          <Badge className=" bg-emerald-100 rounded-full text-emerald-700 ml-3">
                            <Edit3 className="w-3 h-3 mr-1" />
                            {t('budget.customized')}
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="text-gray-600 mt-2">
                        {budget.isCustomized
                          ? t('budget.personalizedAllocation')
                          : t('budget.aiRecommendedBreakdown')
                        }
                      </CardDescription>
                    </div>
                    <Button
                      onClick={handleCustomizeBudget}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg font-medium text-xs sm:text-sm not-[]:rounded-2xl  transform hover:scale-105 transition-all duration-300 shadow-lg"
                    >
                      <Settings className="w-5 h-5 mr-2" />
                      {budget.isCustomized ? t('budget.modifyBudget') : t('budget.customizeBudget')}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-4 lg:gap-2">
                    {Object.entries(budget.categories).map(([key, category], index) => (
                      <div
                        key={key}
                        className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow duration-200"
                        onMouseEnter={() => setHoveredCategory(key)}
                        onMouseLeave={() => setHoveredCategory(null)}
                      >
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                            <div className="text-xl sm:text-2xl flex-shrink-0">{category.emoji}</div>
                            <span className="font-semibold text-gray-900 text-sm sm:text-base lg:text-lg truncate">
                              {category.englishName}
                            </span>
                          </div>
                          <Badge
                            variant="outline"
                            className="border-gray-300 text-gray-700 font-medium text-xs flex-shrink-0"
                          >
                            {category.percentage}%
                          </Badge>
                        </div>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                          ₹{category.amount.toLocaleString('en-IN')}
                        </div>
                        <Progress value={category.percentage} className="h-2 sm:h-3 mb-3 sm:mb-4" />
                        {budget.explanations?.categories?.[key] && (
                          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-2">
                            {budget.explanations.categories[key]}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {budget.isCustomized && (
                    <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                      <div className="flex items-start gap-4">
                        <CheckCircle className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="font-bold text-blue-900 mb-2 text-lg">Budget Successfully Customized!</h4>
                          <p className="text-blue-700 mb-2">
                            Your budget has been tailored to your specific preferences and financial goals.
                          </p>
                          {budget.customizedAt && (
                            <p className="text-sm text-blue-600 font-medium">
                              Last modified: {new Date(budget.customizedAt).toLocaleDateString('en-IN')} at {new Date(budget.customizedAt).toLocaleTimeString('en-IN')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Enhanced Pie Chart */}
              <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6">
                  <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                    <PieChart className="w-6 h-6 mr-3 text-indigo-600" />
                    Budget Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={chartData.pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={1000}
                      >
                        {chartData.pieData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                            stroke={hoveredCategory ? 'rgba(255,255,255,0.8)' : 'transparent'}
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, t('budget.amount')]}
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(20px)',
                          border: 'none',
                          borderRadius: '16px',
                          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Enhanced Bar Chart */}
              <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6">
                  <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                    <BarChart3 className="w-6 h-6 mr-3 text-emerald-600" />
                    {t('Category Breakdown')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={chartData.barData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        fontSize={12}
                        stroke="#64748b"
                      />
                      <YAxis
                        formatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                        stroke="#64748b"
                      />
                      <Tooltip
                        formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, t('budget.amount')]}
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(20px)',
                          border: 'none',
                          borderRadius: '16px',
                          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Bar
                        dataKey="amount"
                        fill="url(#colorGradient)"
                        radius={[8, 8, 0, 0]}
                        animationDuration={1000}
                        animationDelay={100}
                      />
                      <defs>
                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="rgb(16, 185, 129)" />
                          <stop offset="100%" stopColor="rgb(6, 182, 212)" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Area Chart for Trend Visualization */}
              <Card className="xl:col-span-2 bg-white/80 backdrop-blur-xl border-0 shadow-xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 p-6">
                  <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                    <Activity className="w-6 h-6 mr-3 text-violet-600" />
                    {t('Budget Allocation Trend')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData.areaData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                      <XAxis dataKey="name" stroke="#64748b" />
                      <YAxis formatter={(value) => `₹${(value / 1000).toFixed(0)}k`} stroke="#64748b" />
                      <Tooltip
                        formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Amount']}
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(20px)',
                          border: 'none',
                          borderRadius: '16px',
                          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="amount"
                        stroke="rgb(139, 92, 246)"
                        strokeWidth={3}
                        fill="url(#areaGradient)"
                        animationDuration={1500}
                      />
                      <defs>
                        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity={0.6} />
                          <stop offset="100%" stopColor="rgb(139, 92, 246)" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* AI Tips Section */}
        {budget.tips && budget.tips.length > 0 && (
          <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 p-6">
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                <Lightbulb className="w-7 h-7 mr-3 text-amber-600" />
                {t('AIPowered Tips')}
              </CardTitle>
              <CardDescription className="text-gray-600 text-lg">
                {t('Personalized Recommendations')}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {budget.tips.map((tip, index) => (
                  <div
                    key={index}
                    className="group relative overflow-hidden bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-6 hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    <div className="absolute top-4 right-4 w-8 h-8 bg-amber-200 rounded-full flex items-center justify-center text-amber-600 font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex items-start space-x-4">
                      <CheckCircle className="w-6 h-6 text-amber-600 mt-1 flex-shrink-0" />
                      <p className="text-gray-700 leading-relaxed font-medium">{tip}</p>
                    </div>
                    <div className="mt-4 flex items-center text-amber-600">
                      <ChevronRight className="w-4 h-4 mr-2 transform group-hover:translate-x-1 transition-transform duration-300" />
                      <span className="text-sm font-medium">{t('budget.applyThisTip')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Investment Recommendations */}
        {budget.recommendations && budget.recommendations.length > 0 && (
          <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 p-6">
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                <Target className="w-7 h-7 mr-3 text-purple-600" />
                {t('Investment Recommendations')}
              </CardTitle>
              <CardDescription className="text-gray-600 text-lg">
                {t('Smart Investment Opportunities')}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-2">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {budget.recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className="group relative overflow-hidden bg-gradient-to-br from-white to-purple-50 border border-purple-200 rounded-2xl p-6 hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{rec.icon}</div>
                        <h3 className="font-bold text-gray-900 text-lg">{rec.type}</h3>
                      </div>
                      <Badge
                        className={`${rec.priority === 'Critical'
                          ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                          : rec.priority === 'High'
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                            : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                          } px-3 py-1 font-semibold`}
                      >
                        {t(`budget.${rec.priority.toLowerCase()}`)}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-4 leading-relaxed">{rec.description}</p>
                    {rec.amount && (
                      <div className="text-2xl font-bold text-gray-900 mb-4">
                        ₹{rec.amount.toLocaleString('en-IN')}
                      </div>
                    )}
                    <div className="flex items-center text-purple-600">
                      <ArrowRight className="w-4 h-4 mr-2 transform group-hover:translate-x-1 transition-transform duration-300" />
                      <span className="text-sm font-medium">{t('Learn More')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bottom Action Card */}
        <Card className="bg-gradient-to-r from-slate-800 via-gray-800 to-slate-800 text-white border-0 shadow-2xl rounded-3xl overflow-hidden">
          <CardContent className="p-8 text-center">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold mb-4">{t('Ready To Update')}</h3>
              <p className="text-slate-300 mb-6 text-lg">
                {t('Budget Generated On', { date: new Date(budget.generatedAt).toLocaleDateString('en-IN') })}.
                {t('Keep Plan Fresh')}.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={generateBudget}
                  disabled={generating}
                  className="bg-white text-slate-800 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-2xl transform hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  {generating ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-3 animate-spin" />
                      {t('Regenerating Budget')}
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-5 h-5 mr-3" />
                      {t('Regenerate Smart Budget')}
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleCustomizeBudget}
                  variant="outline"
                  className="border-2 border-white text-slate-800 hover:bg-gray-100  px-8 py-4 text-lg font-semibold rounded-2xl transform hover:scale-105 transition-all duration-300"
                >
                  <Settings className="w-5 h-5 mr-3" />
                  {t('Customize Instead')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}