'use client'

// import Link from 'next/link'
// import { useSession } from 'next-auth/react'
// import { useState, useEffect } from 'react'
// import { TrendingUp, Shield, Zap, ArrowRight, Star, Users, Award, CheckCircle, BarChart3, PieChart, Wallet, Target } from 'lucide-react'

// export default function Home() {
//   const { data: session } = useSession()
//   const [isScrolled, setIsScrolled] = useState(false)
//   const [currentStat, setCurrentStat] = useState(0)

//   const stats = [
//     { value: '50K+', label: 'Happy Users' },
//     { value: '₹10Cr+', label: 'Money Managed' },
//     { value: '95%', label: 'Success Rate' },
//     { value: '4.9★', label: 'User Rating' }
//   ]

//   useEffect(() => {
//     const handleScroll = () => {
//       setIsScrolled(window.scrollY > 50)
//     }
//     window.addEventListener('scroll', handleScroll)
//     return () => window.removeEventListener('scroll', handleScroll)
//   }, [])

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentStat((prev) => (prev + 1) % stats.length)
//     }, 2000)
//     return () => clearInterval(interval)
//   }, [stats.length])

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 relative overflow-hidden">
//       {/* Animated Background Elements */}
//       <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-900 to-slate-900"></div>
//       <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
//       <div className="absolute top-0 -right-4 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
//       <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      
//       {/* Floating Elements */}
//       <div className="absolute top-20 left-10 w-4 h-4 bg-emerald-400 rounded-full animate-float opacity-60"></div>
//       <div className="absolute top-40 right-20 w-6 h-6 bg-purple-400 rounded-full animate-float-delayed opacity-60"></div>
//       <div className="absolute bottom-40 left-32 w-3 h-3 bg-indigo-400 rounded-full animate-float opacity-60"></div>

//       {/* Navigation */}
//       <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-slate-900/95 backdrop-blur-xl shadow-2xl border-b border-slate-700/50' : 'bg-transparent'}`}>
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center h-20">
//             <div className="flex items-center space-x-3">
//               <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl">
//                 <TrendingUp className="w-6 h-6 text-white" />
//               </div>
//               <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-slate-200 to-white bg-clip-text text-transparent">
//                 WealthWise 
//               </h1>
//             </div>
//             <div className="flex items-center space-x-6">
//               {session ? (
//                 <Link
//                   href="/dashboard"
//                   className="group bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500 hover:from-emerald-600 hover:via-indigo-600 hover:to-purple-600 text-white px-8 py-3 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center space-x-2"
//                 >
//                   <span>Dashboard</span>
//                   <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
//                 </Link>
//               ) : (
//                 <>
//                   <Link
//                     href="/auth/signin"
//                     className="text-slate-300 hover:text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:bg-slate-800/50"
//                   >
//                     Sign In
//                   </Link>
//                   <Link
//                     href="/auth/signup"
//                     className="group bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500 hover:from-emerald-600 hover:via-indigo-600 hover:to-purple-600 text-white px-8 py-3 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center space-x-2"
//                   >
//                     <span>Get Started</span>
//                     <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
//                   </Link>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       </nav>

//       {/* Hero Section */}
//       <main className="relative z-10">
//         <div className="max-w-7xl mx-auto pt-32 pb-20 px-4 sm:px-6 lg:px-8">
//           <div className="text-center space-y-8">
//             {/* Animated Stats Badge */}
//             <div className="inline-flex items-center space-x-2 bg-slate-800/60 backdrop-blur-xl rounded-full px-6 py-3 border border-slate-700/50 animate-slide-up">
//               <Star className="w-5 h-5 text-yellow-400" />
//               <span className="text-slate-300 font-medium">
//                 {stats[currentStat].value} {stats[currentStat].label}
//               </span>
//             </div>

//             {/* Main Heading */}
//             <div className="space-y-6 animate-slide-up animation-delay-200">
//               <h1 className="text-5xl md:text-7xl font-black leading-tight">
//                 <span className="block bg-gradient-to-r from-white via-slate-200 to-white bg-clip-text text-transparent">
//                   WealthWise 
//                 </span>
//                 <span className="block bg-gradient-to-r from-emerald-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
//                   Planning Made Easy
//                 </span>
//               </h1>
//               <p className="max-w-4xl mx-auto text-xl text-slate-400 leading-relaxed font-medium">
//                 Transform your financial future with AI-powered insights, intelligent budgeting, 
//                 and personalized strategies that adapt to your lifestyle. Join thousands of users 
//                 who&apos;ve already taken control of their finances.
//               </p>
//             </div>

//             {/* CTA Buttons */}
//             <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8 animate-slide-up animation-delay-400">
//               {session ? (
//                 <Link
//                   href="/dashboard"
//                   className="group bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500 hover:from-emerald-600 hover:via-indigo-600 hover:to-purple-600 text-white px-12 py-5 rounded-2xl text-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-emerald-500/25 flex items-center space-x-3 border border-white/10"
//                 >
//                   <span>Go to Dashboard</span>
//                   <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
//                 </Link>
//               ) : (
//                 <>
//                   <Link
//                     href="/auth/signup"
//                     className="group bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500 hover:from-emerald-600 hover:via-indigo-600 hover:to-purple-600 text-white px-12 py-5 rounded-2xl text-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-emerald-500/25 flex items-center space-x-3 border border-white/10"
//                   >
//                     <span>Start Free Today</span>
//                     <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
//                   </Link>
//                   <Link
//                     href="/auth/signin"
//                     className="group bg-slate-800/60 backdrop-blur-xl hover:bg-slate-700/60 text-white px-12 py-5 rounded-2xl text-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center space-x-3 border-2 border-slate-600 hover:border-slate-500"
//                   >
//                     <span>Sign In</span>
//                     <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
//                   </Link>
//                 </>
//               )}
//             </div>

//             {/* Trust Indicators */}
//             <div className="flex items-center justify-center space-x-8 pt-12 animate-slide-up animation-delay-600">
//               <div className="flex items-center space-x-2 text-slate-400">
//                 <Shield className="w-5 h-5 text-emerald-400" />
//                 <span className="font-medium">Bank-Level Security</span>
//               </div>
//               <div className="flex items-center space-x-2 text-slate-400">
//                 <Users className="w-5 h-5 text-indigo-400" />
//                 <span className="font-medium">50K+ Users</span>
//               </div>
//               <div className="flex items-center space-x-2 text-slate-400">
//                 <Award className="w-5 h-5 text-purple-400" />
//                 <span className="font-medium">AI-Powered</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Features Section */}
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
//           <div className="text-center mb-20">
//             <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-slate-200 to-white bg-clip-text text-transparent mb-6">
//               Powerful Features for Smart Planning
//             </h2>
//             <p className="text-xl text-slate-400 max-w-3xl mx-auto">
//               Everything you need to master your finances, powered by cutting-edge AI technology
//             </p>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//             {/* Feature 1 */}
//             <div className="group relative bg-slate-800/40 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/10">
//               <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-indigo-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
//               <div className="relative z-10">
//                 <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:shadow-2xl transition-shadow duration-300">
//                   <BarChart3 className="w-8 h-8 text-white" />
//                 </div>
//                 <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-emerald-400 transition-colors">
//                   AI-Powered Budgeting
//                 </h3>
//                 <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
//                   Get personalized budget recommendations that learn from your spending patterns and financial goals. Our AI adapts to your lifestyle changes automatically.
//                 </p>
//                 <div className="mt-6 flex items-center text-emerald-400 font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
//                   <span>Learn more</span>
//                   <ArrowRight className="w-4 h-4 ml-2" />
//                 </div>
//               </div>
//             </div>

//             {/* Feature 2 */}
//             <div className="group relative bg-slate-800/40 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 hover:border-indigo-500/50 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/10">
//               <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-purple-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
//               <div className="relative z-10">
//                 <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:shadow-2xl transition-shadow duration-300">
//                   <PieChart className="w-8 h-8 text-white" />
//                 </div>
//                 <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-indigo-400 transition-colors">
//                   Smart Expense Tracking
//                 </h3>
//                 <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
//                   Automatically categorize expenses with intelligent recognition. Get real-time insights and alerts when you&apos;re overspending in any category.
//                 </p>
//                 <div className="mt-6 flex items-center text-indigo-400 font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
//                   <span>Learn more</span>
//                   <ArrowRight className="w-4 h-4 ml-2" />
//                 </div>
//               </div>
//             </div>

//             {/* Feature 3 */}
//             <div className="group relative bg-slate-800/40 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 hover:border-purple-500/50 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/10">
//               <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-emerald-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
//               <div className="relative z-10">
//                 <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:shadow-2xl transition-shadow duration-300">
//                   <Target className="w-8 h-8 text-white" />
//                 </div>
//                 <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-purple-400 transition-colors">
//                   Goal Achievement
//                 </h3>
//                 <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
//                   Set financial goals and get personalized action plans. Track progress with visual milestones and receive smart recommendations to stay on track.
//                 </p>
//                 <div className="mt-6 flex items-center text-purple-400 font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
//                   <span>Learn more</span>
//                   <ArrowRight className="w-4 h-4 ml-2" />
//                 </div>
//               </div>
//             </div>

//             {/* Feature 4 */}
//             <div className="group relative bg-slate-800/40 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/10">
//               <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-indigo-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
//               <div className="relative z-10">
//                 <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:shadow-2xl transition-shadow duration-300">
//                   <Shield className="w-8 h-8 text-white" />
//                 </div>
//                 <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-emerald-400 transition-colors">
//                   Bank-Level Security
//                 </h3>
//                 <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
//                   Your financial data is protected with military-grade encryption and multi-layer security protocols. We never store your banking credentials.
//                 </p>
//                 <div className="mt-6 flex items-center text-emerald-400 font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
//                   <span>Learn more</span>
//                   <ArrowRight className="w-4 h-4 ml-2" />
//                 </div>
//               </div>
//             </div>

//             {/* Feature 5 */}
//             <div className="group relative bg-slate-800/40 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 hover:border-indigo-500/50 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/10">
//               <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-purple-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
//               <div className="relative z-10">
//                 <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:shadow-2xl transition-shadow duration-300">
//                   <Zap className="w-8 h-8 text-white" />
//                 </div>
//                 <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-indigo-400 transition-colors">
//                   Real-Time Insights
//                 </h3>
//                 <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
//                   Get instant notifications and insights about your spending patterns. Make informed decisions with predictive analytics and trend analysis.
//                 </p>
//                 <div className="mt-6 flex items-center text-indigo-400 font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
//                   <span>Learn more</span>
//                   <ArrowRight className="w-4 h-4 ml-2" />
//                 </div>
//               </div>
//             </div>

//             {/* Feature 6 */}
//             <div className="group relative bg-slate-800/40 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 hover:border-purple-500/50 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/10">
//               <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-emerald-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
//               <div className="relative z-10">
//                 <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:shadow-2xl transition-shadow duration-300">
//                   <Wallet className="w-8 h-8 text-white" />
//                 </div>
//                 <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-purple-400 transition-colors">
//                   Multi-Account Support
//                 </h3>
//                 <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
//                   Connect all your accounts in one place. Get a unified view of your financial health across banks, credit cards, and investment accounts.
//                 </p>
//                 <div className="mt-6 flex items-center text-purple-400 font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
//                   <span>Learn more</span>
//                   <ArrowRight className="w-4 h-4 ml-2" />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Stats Section */}
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
//           <div className="bg-slate-800/40 backdrop-blur-xl rounded-3xl p-12 border border-slate-700/50">
//             <div className="text-center mb-12">
//               <h2 className="text-4xl font-bold bg-gradient-to-r from-white via-slate-200 to-white bg-clip-text text-transparent mb-4">
//                 Trusted by Thousands
//               </h2>
//               <p className="text-xl text-slate-400">
//                 Join our growing community of financially empowered users
//               </p>
//             </div>
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
//               {stats.map((stat, index) => (
//                 <div key={index} className="text-center group">
//                   <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-emerald-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
//                     {stat.value}
//                   </div>
//                   <div className="text-slate-400 font-semibold group-hover:text-slate-300 transition-colors">
//                     {stat.label}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* CTA Section */}
//         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
//           <div className="bg-gradient-to-r from-emerald-500/10 via-indigo-500/10 to-purple-500/10 backdrop-blur-xl rounded-3xl p-12 border border-slate-700/50">
//             <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-slate-200 to-white bg-clip-text text-transparent mb-6">
//               Ready to Transform Your Finances?
//             </h2>
//             <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
//               Join thousands of users who have already taken control of their financial future. Start your journey today with a free account.
//             </p>
//             {!session && (
//               <Link
//                 href="/auth/signup"
//                 className="group inline-flex bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500 hover:from-emerald-600 hover:via-indigo-600 hover:to-purple-600 text-white px-12 py-5 rounded-2xl text-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-emerald-500/25 items-center space-x-3 border border-white/10"
//               >
//                 <span>Start Free Today</span>
//                 <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
//               </Link>
//             )}
//           </div>
//         </div>
//       </main>

//       {/* Footer */}
//       <footer className="relative z-10 bg-slate-900/50 backdrop-blur-xl border-t border-slate-700/50">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//           <div className="text-center">
//             <div className="flex items-center justify-center space-x-3 mb-6">
//               <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl">
//                 <TrendingUp className="w-6 h-6 text-white" />
//               </div>
//               <h3 className="text-2xl font-bold bg-gradient-to-r from-white via-slate-200 to-white bg-clip-text text-transparent">
//                 WealthWise 
//               </h3>
//             </div>
//             <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
//               Empowering your financial journey with intelligent insights and personalized strategies for a brighter future.
//             </p>
//             <div className="flex items-center justify-center space-x-8 text-slate-400">
//               <span className="flex items-center space-x-2">
//                 <CheckCircle className="w-5 h-5 text-emerald-400" />
//                 <span>Secure & Private</span>
//               </span>
//               <span className="flex items-center space-x-2">
//                 <CheckCircle className="w-5 h-5 text-indigo-400" />
//                 <span>AI-Powered</span>
//               </span>
//               <span className="flex items-center space-x-2">
//                 <CheckCircle className="w-5 h-5 text-purple-400" />
//                 <span>24/7 Support</span>
//               </span>
//             </div>
//           </div>
//         </div>
//       </footer>

//       {/* Custom Styles */}
//       <style jsx>{`
//         @keyframes blob {
//           0% { transform: translate(0px, 0px) scale(1); }
//           33% { transform: translate(30px, -50px) scale(1.1); }
//           66% { transform: translate(-20px, 20px) scale(0.9); }
//           100% { transform: translate(0px, 0px) scale(1); }
//         }
        
//         @keyframes float {
//           0%, 100% { transform: translateY(0px); }
//           50% { transform: translateY(-20px); }
//         }
        
//         @keyframes slide-up {
//           from {
//             opacity: 0;
//             transform: translateY(30px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
        
//         .animate-blob {
//           animation: blob 7s infinite;
//         }
        
//         .animate-float {
//           animation: float 6s ease-in-out infinite;
//         }
        
//         .animate-float-delayed {
//           animation: float 6s ease-in-out infinite;
//           animation-delay: 2s;
//         }
        
//         .animate-slide-up {
//           animation: slide-up 0.8s ease-out forwards;
//         }
        
//         .animation-delay-200 {
//           animation-delay: 0.2s;
//         }
        
//         .animation-delay-400 {
//           animation-delay: 0.4s;
//         }
        
//         .animation-delay-600 {
//           animation-delay: 0.6s;
//         }
        
//         .animation-delay-2000 {
//           animation-delay: 2s;
//         }
        
//         .animation-delay-4000 {
//           animation-delay: 4s;
//         }
//       `}</style>
//     </div>
//   )
// }


import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Shield, 
  Zap, 
  ArrowRight, 
  Star, 
  Users, 
  Award, 
  CheckCircle, 
  BarChart3, 
  PieChart, 
  Wallet, 
  Target,
  DollarSign,
  CreditCard,
  Smartphone,
  Eye,
  EyeOff,
  Play,
  Menu,
  X
} from 'lucide-react';
import Link from 'next/link';

export default function FinanceFlowLanding() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentStat, setCurrentStat] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [emailInput, setEmailInput] = useState('');

  const stats = [
    { value: '250K+', label: 'Active Users', icon: Users },
    { value: '$50M+', label: 'Money Managed', icon: DollarSign },
    { value: '98.5%', label: 'Success Rate', icon: TrendingUp },
    { value: '4.9★', label: 'App Rating', icon: Star }
  ];

  const features = [
    {
      icon: BarChart3,
      title: 'Smart Budgeting',
      description: 'AI-powered budget recommendations that adapt to your spending habits and financial goals.',
      color: 'from-emerald-500 to-teal-500',
      hoverColor: 'hover:border-emerald-400/50 hover:shadow-emerald-500/20'
    },
    {
      icon: PieChart,
      title: 'Expense Tracking',
      description: 'Automatic categorization and real-time insights into your spending patterns.',
      color: 'from-teal-500 to-blue-500',
      hoverColor: 'hover:border-teal-400/50 hover:shadow-teal-500/20'
    },
    {
      icon: Target,
      title: 'Goal Setting',
      description: 'Set and achieve financial milestones with personalized action plans.',
      color: 'from-blue-500 to-emerald-500',
      hoverColor: 'hover:border-blue-400/50 hover:shadow-blue-500/20'
    },
    {
      icon: Shield,
      title: 'Bank Security',
      description: 'Military-grade encryption protects your financial data 24/7.',
      color: 'from-emerald-600 to-teal-600',
      hoverColor: 'hover:border-emerald-400/50 hover:shadow-emerald-500/20'
    },
    {
      icon: Zap,
      title: 'Real-time Alerts',
      description: 'Instant notifications for spending limits, bill reminders, and opportunities.',
      color: 'from-teal-600 to-blue-600',
      hoverColor: 'hover:border-teal-400/50 hover:shadow-teal-500/20'
    },
    {
      icon: CreditCard,
      title: 'Multi-Account',
      description: 'Connect all your accounts for a unified view of your financial health.',
      color: 'from-blue-600 to-emerald-600',
      hoverColor: 'hover:border-blue-400/50 hover:shadow-blue-500/20'
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [stats.length]);

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    // Handle email submission
    console.log('Email submitted:', emailInput);
    setEmailInput('');
    alert('Thanks for your interest! We\'ll notify you when FinanceFlow launches.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-emerald-200 to-teal-200 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-20 w-80 h-80 bg-gradient-to-r from-teal-200 to-blue-200 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-r from-blue-200 to-emerald-200 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Floating Financial Icons */}
      <div className="absolute top-20 left-10 opacity-20">
        <DollarSign className="w-8 h-8 text-emerald-600 animate-bounce" style={{animationDelay: '1s'}} />
      </div>
      <div className="absolute top-1/3 right-16 opacity-20">
        <TrendingUp className="w-6 h-6 text-teal-600 animate-bounce" style={{animationDelay: '3s'}} />
      </div>
      <div className="absolute bottom-1/3 left-20 opacity-20">
        <PieChart className="w-7 h-7 text-blue-600 animate-bounce" style={{animationDelay: '2s'}} />
      </div>

      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-xl shadow-2xl border-b border-emerald-100/50' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-300 ring-4 ring-white/50">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full animate-ping"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-emerald-700 to-blue-800 bg-clip-text text-transparent">
                  WealthWise 
                </h1>
                <p className="text-xs text-slate-500 -mt-1">Professional Wealth Management</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-600 hover:text-emerald-700 transition-colors duration-200 font-medium">Features</a>
              <a href="#pricing" className="text-slate-600 hover:text-emerald-700 transition-colors duration-200 font-medium">Pricing</a>
              <a href="#about" className="text-slate-600 hover:text-emerald-700 transition-colors duration-200 font-medium">About</a>
              <Link href="/auth/signin">
              <button className="text-slate-600 hover:text-emerald-700 px-6 py-2 rounded-xl font-medium transition-all duration-200 hover:bg-emerald-50">
                Sign In
              </button>
              </Link>
              <Link href="/auth/signup">
          
              <button className="group bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-700 hover:via-teal-700 hover:to-blue-700 text-white px-8 py-3 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center space-x-2 ring-2 ring-white/20">
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-slate-700 p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-white/95 backdrop-blur-xl rounded-2xl mt-4 p-6 border border-emerald-100/50 shadow-2xl">
              <div className="flex flex-col space-y-4">
                <a href="#features" className="text-slate-600 hover:text-emerald-700 transition-colors font-medium">Features</a>
                <a href="#pricing" className="text-slate-600 hover:text-emerald-700 transition-colors font-medium">Pricing</a>
                <a href="#about" className="text-slate-600 hover:text-emerald-700 transition-colors font-medium">About</a>
                <hr className="border-slate-200" />
                <button className="text-slate-600 hover:text-emerald-700 text-left font-medium">Sign In</button>
                <button className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white px-6 py-3 rounded-xl font-bold">
                  Get Started
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10">
        <div className="max-w-7xl mx-auto pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              {/* Trust Badge */}
              <div className="inline-flex items-center space-x-3 bg-white/80 backdrop-blur-xl rounded-full px-6 py-3 border border-emerald-200/50 shadow-lg">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                  ))}
                </div>
                <span className="text-slate-700 font-medium">Trusted by 250K+ users</span>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              </div>

              {/* Main Headline */}
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-7xl font-black leading-tight">
                  <span className="block bg-gradient-to-r from-slate-800 via-emerald-700 to-slate-800 bg-clip-text text-transparent">
                    Take Control of
                  </span>
                  <span className="block bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
                    Your Finances
                  </span>
                </h1>
                <p className="text-xl text-slate-600 leading-relaxed max-w-2xl font-medium">
                  WealthWise  uses AI to help you budget smarter, save more, and achieve your financial goals faster. 
                  Join thousands who've transformed their money management.
                </p>
              </div>

              {/* Email Signup */}
              <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md">
                <div className="flex-1 relative">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full px-6 py-4 bg-white/80 backdrop-blur-xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/30 rounded-2xl text-slate-900 placeholder-slate-400 transition-all duration-300 shadow-sm hover:shadow-md"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="group bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-700 hover:via-teal-700 hover:to-blue-700 text-white px-8 py-4 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center justify-center ring-2 ring-white/20"
                >
                  <span className="sm:hidden">Start Free</span>
                  <span className="hidden sm:inline">Start Free Trial</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-6 pt-6">
                <div className="flex items-center space-x-2 text-slate-600">
                  <Shield className="w-5 h-5 text-emerald-600" />
                  <span className="font-medium">Bank-Level Security</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-600">
                  <CheckCircle className="w-5 h-5 text-teal-600" />
                  <span className="font-medium">No Hidden Fees</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-600">
                  <Award className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Award Winning</span>
                </div>
              </div>
            </div>

            {/* Right Content - App Mockup */}
            <div className="relative lg:ml-8">
              <div className="relative">
                {/* Phone Frame */}
                <div className="relative mx-auto w-80 h-[640px] bg-gradient-to-b from-white to-slate-50 rounded-[3rem] p-2 shadow-2xl ring-1 ring-emerald-200/50">
                  <div className="w-full h-full bg-gradient-to-b from-slate-50 to-white rounded-[2.5rem] overflow-hidden relative border border-slate-100">
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-10"></div>
                    
                    {/* App Content */}
                    <div className="pt-8 p-6 h-full">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h3 className="text-slate-800 font-bold text-lg">Good Morning</h3>
                          <p className="text-slate-500 text-sm">Here's your overview</p>
                        </div>
                        <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
                      </div>

                      {/* Balance Card */}
                      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 rounded-3xl p-6 mb-6 relative overflow-hidden shadow-xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                        <div className="relative z-10">
                          <p className="text-emerald-100 text-sm mb-2">Total Balance</p>
                          <p className="text-white text-3xl font-bold mb-4">$24,580.50</p>
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="w-4 h-4 text-white/90" />
                            <span className="text-white/90 text-sm font-medium">+12.5% this month</span>
                          </div>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                          <div className="w-8 h-8 bg-emerald-600 rounded-xl flex items-center justify-center mb-3">
                            <Target className="w-4 h-4 text-white" />
                          </div>
                          <p className="text-slate-800 font-medium text-sm">Goals</p>
                          <p className="text-slate-500 text-xs">3 active</p>
                        </div>
                        <div className="bg-teal-50 rounded-2xl p-4 border border-teal-100">
                          <div className="w-8 h-8 bg-teal-600 rounded-xl flex items-center justify-center mb-3">
                            <BarChart3 className="w-4 h-4 text-white" />
                          </div>
                          <p className="text-slate-800 font-medium text-sm">Analytics</p>
                          <p className="text-slate-500 text-xs">View report</p>
                        </div>
                      </div>

                      {/* Recent Transactions */}
                      <div className="space-y-3">
                        <h4 className="text-slate-800 font-semibold">Recent Activity</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between bg-slate-50 rounded-xl p-3 border border-slate-100">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center border-2 border-red-200">
                                <span className="text-red-600 text-xs font-bold">S</span>
                              </div>
                              <div>
                                <p className="text-slate-800 text-sm font-medium">Starbucks</p>
                                <p className="text-slate-500 text-xs">Coffee & Food</p>
                              </div>
                            </div>
                            <span className="text-red-600 font-semibold">-$8.50</span>
                          </div>
                          <div className="flex items-center justify-between bg-slate-50 rounded-xl p-3 border border-slate-100">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center border-2 border-emerald-200">
                                <span className="text-emerald-600 text-xs font-bold">D</span>
                              </div>
                              <div>
                                <p className="text-slate-800 text-sm font-medium">Dividend</p>
                                <p className="text-slate-500 text-xs">Investment Income</p>
                              </div>
                            </div>
                            <span className="text-emerald-600 font-semibold">+$125.00</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -left-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-4 shadow-2xl animate-float">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-4 -right-4 bg-gradient-to-r from-teal-500 to-blue-500 rounded-2xl p-4 shadow-2xl animate-float" style={{animationDelay: '1s'}}>
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Animated Stats Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-emerald-100/50 shadow-2xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                const isActive = index === currentStat;
                return (
                  <div key={index} className={`text-center group transition-all duration-500 ${isActive ? 'scale-110' : ''}`}>
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4 transition-all duration-500 ${
                      isActive ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg' : 'bg-slate-100'
                    }`}>
                      <Icon className={`w-6 h-6 transition-colors duration-500 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    </div>
                    <div className={`text-3xl font-black mb-2 transition-all duration-500 ${
                      isActive 
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent' 
                        : 'text-slate-700'
                    }`}>
                      {stat.value}
                    </div>
                    <div className={`font-medium transition-colors duration-500 ${
                      isActive ? 'text-slate-600' : 'text-slate-500'
                    }`}>
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-xl rounded-full px-6 py-3 border border-emerald-200/50 mb-6 shadow-lg">
              <Zap className="w-5 h-5 text-emerald-600" />
              <span className="text-slate-700 font-medium">Smart Features</span>
            </div>
            <h2 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-slate-800 via-emerald-700 to-slate-800 bg-clip-text text-transparent mb-6">
              Everything You Need to
              <span className="block bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
                Master Your Money
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto font-medium">
              Powerful AI-driven tools designed to simplify your financial life and accelerate your wealth-building journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className={`group relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-emerald-100/50 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl ${feature.hoverColor} shadow-lg`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-teal-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-4 group-hover:text-emerald-700 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors font-medium">
                      {feature.description}
                    </p>
                    <div className="mt-6 flex items-center text-emerald-600 font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <span>Learn more</span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Social Proof Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-emerald-700 to-slate-800 bg-clip-text text-transparent mb-6">
              Loved by Finance Enthusiasts
            </h2>
            <p className="text-xl text-slate-600 font-medium">
              See what our community is saying about WealthWise 
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Chen",
                role: "Startup Founder",
                content: "WealthWise  helped me save $15K in my first year. The AI insights are incredibly accurate and actionable.",
                rating: 5,
                avatar: "SC"
              },
              {
                name: "Marcus Johnson",
                role: "Software Engineer",
                content: "Finally, a finance app that doesn't feel overwhelming. The budgeting features are intuitive and powerful.",
                rating: 5,
                avatar: "MJ"
              },
              {
                name: "Emily Rodriguez",
                role: "Marketing Director",
                content: "The goal tracking feature kept me motivated to pay off my student loans 2 years early. Game changer!",
                rating: 5,
                avatar: "ER"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-emerald-100/50 hover:border-emerald-200/50 transition-all duration-300 shadow-lg hover:shadow-xl">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-slate-700 leading-relaxed mb-6 font-medium">"{testimonial.content}"</p>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">{testimonial.avatar}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{testimonial.name}</p>
                    <p className="text-slate-500 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA Section */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 backdrop-blur-xl rounded-3xl p-12 border border-emerald-200/50 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500"></div>
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-800 via-emerald-700 to-slate-800 bg-clip-text text-transparent mb-6">
              Ready to Transform Your Financial Future?
            </h2>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto font-medium">
              Join over 250,000 users who have already taken control of their finances with WealthWise . 
              Start your free trial today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button className="group bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-700 hover:via-teal-700 hover:to-blue-700 text-white px-12 py-5 rounded-2xl text-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-emerald-500/25 flex items-center space-x-3 ring-2 ring-white/20">
                <span>Start Free Trial</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="group bg-white/80 backdrop-blur-xl hover:bg-white/90 text-slate-700 px-12 py-5 rounded-2xl text-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center space-x-3 border-2 border-emerald-200 hover:border-emerald-300">
                <Play className="w-6 h-6" />
                <span>Watch Demo</span>
              </button>
            </div>
            <p className="text-slate-500 text-sm mt-6 font-medium">
              No credit card required • 30-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-white/90 backdrop-blur-xl border-t border-emerald-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo & Description */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl ring-4 ring-white/50">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-emerald-700 to-blue-800 bg-clip-text text-transparent">
                    WealthWise 
                  </h3>
                  <p className="text-xs text-slate-500 -mt-1">Professional Wealth Management</p>
                </div>
              </div>
              <p className="text-slate-600 mb-6 max-w-md leading-relaxed font-medium">
                Empowering your financial journey with AI-powered insights, intelligent budgeting, 
                and personalized strategies for long-term wealth building.
              </p>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 text-slate-600">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span className="font-medium">Secure & Private</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-600">
                  <CheckCircle className="w-5 h-5 text-teal-600" />
                  <span className="font-medium">AI-Powered</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-slate-800 mb-4">Product</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-slate-600 hover:text-emerald-700 transition-colors font-medium">Features</a></li>
                <li><a href="#" className="text-slate-600 hover:text-emerald-700 transition-colors font-medium">Pricing</a></li>
                <li><a href="#" className="text-slate-600 hover:text-emerald-700 transition-colors font-medium">Security</a></li>
                <li><a href="#" className="text-slate-600 hover:text-emerald-700 transition-colors font-medium">API</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-bold text-slate-800 mb-4">Support</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-slate-600 hover:text-emerald-700 transition-colors font-medium">Help Center</a></li>
                <li><a href="#" className="text-slate-600 hover:text-emerald-700 transition-colors font-medium">Contact Us</a></li>
                <li><a href="#" className="text-slate-600 hover:text-emerald-700 transition-colors font-medium">Privacy Policy</a></li>
                <li><a href="#" className="text-slate-600 hover:text-emerald-700 transition-colors font-medium">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-emerald-100/50 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-500 text-sm font-medium">
              © 2024 WealthWise . All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <span className="text-slate-500 text-sm font-medium">Made with ❤️ for your financial success</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
          }
          33% { 
            transform: translateY(-10px) rotate(1deg); 
          }
          66% { 
            transform: translateY(-5px) rotate(-1deg); 
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes gradientShift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-slide-up {
          animation: slideUp 0.8s ease-out forwards;
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradientShift 3s ease infinite;
        }
        
        .group:hover .group-hover\\:animate-bounce {
          animation: bounce 1s infinite;
        }
        
        /* Smooth scroll behavior */
        html {
          scroll-behavior: smooth;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #059669, #0891b2);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #047857, #0e7490);
        }
      `}</style>
    </div>
  );
}