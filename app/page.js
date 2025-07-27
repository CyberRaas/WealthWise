'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { TrendingUp, Shield, Zap, ArrowRight, Star, Users, Award, CheckCircle, BarChart3, PieChart, Wallet, Target } from 'lucide-react'

export default function Home() {
  const { data: session } = useSession()
  const [isScrolled, setIsScrolled] = useState(false)
  const [currentStat, setCurrentStat] = useState(0)

  const stats = [
    { value: '50K+', label: 'Happy Users' },
    { value: '₹10Cr+', label: 'Money Managed' },
    { value: '95%', label: 'Success Rate' },
    { value: '4.9★', label: 'User Rating' }
  ]

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-900 to-slate-900"></div>
      <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-4 h-4 bg-emerald-400 rounded-full animate-float opacity-60"></div>
      <div className="absolute top-40 right-20 w-6 h-6 bg-purple-400 rounded-full animate-float-delayed opacity-60"></div>
      <div className="absolute bottom-40 left-32 w-3 h-3 bg-indigo-400 rounded-full animate-float opacity-60"></div>

      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-slate-900/95 backdrop-blur-xl shadow-2xl border-b border-slate-700/50' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-slate-200 to-white bg-clip-text text-transparent">
                Smart Financial Planner
              </h1>
            </div>
            <div className="flex items-center space-x-6">
              {session ? (
                <Link
                  href="/dashboard"
                  className="group bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500 hover:from-emerald-600 hover:via-indigo-600 hover:to-purple-600 text-white px-8 py-3 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center space-x-2"
                >
                  <span>Dashboard</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    className="text-slate-300 hover:text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:bg-slate-800/50"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="group bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500 hover:from-emerald-600 hover:via-indigo-600 hover:to-purple-600 text-white px-8 py-3 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center space-x-2"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10">
        <div className="max-w-7xl mx-auto pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            {/* Animated Stats Badge */}
            <div className="inline-flex items-center space-x-2 bg-slate-800/60 backdrop-blur-xl rounded-full px-6 py-3 border border-slate-700/50 animate-slide-up">
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="text-slate-300 font-medium">
                {stats[currentStat].value} {stats[currentStat].label}
              </span>
            </div>

            {/* Main Heading */}
            <div className="space-y-6 animate-slide-up animation-delay-200">
              <h1 className="text-5xl md:text-7xl font-black leading-tight">
                <span className="block bg-gradient-to-r from-white via-slate-200 to-white bg-clip-text text-transparent">
                  Smart Financial
                </span>
                <span className="block bg-gradient-to-r from-emerald-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Planning Made Easy
                </span>
              </h1>
              <p className="max-w-4xl mx-auto text-xl text-slate-400 leading-relaxed font-medium">
                Transform your financial future with AI-powered insights, intelligent budgeting, 
                and personalized strategies that adapt to your lifestyle. Join thousands of users 
                who've already taken control of their finances.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8 animate-slide-up animation-delay-400">
              {session ? (
                <Link
                  href="/dashboard"
                  className="group bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500 hover:from-emerald-600 hover:via-indigo-600 hover:to-purple-600 text-white px-12 py-5 rounded-2xl text-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-emerald-500/25 flex items-center space-x-3 border border-white/10"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/signup"
                    className="group bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500 hover:from-emerald-600 hover:via-indigo-600 hover:to-purple-600 text-white px-12 py-5 rounded-2xl text-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-emerald-500/25 flex items-center space-x-3 border border-white/10"
                  >
                    <span>Start Free Today</span>
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/auth/signin"
                    className="group bg-slate-800/60 backdrop-blur-xl hover:bg-slate-700/60 text-white px-12 py-5 rounded-2xl text-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center space-x-3 border-2 border-slate-600 hover:border-slate-500"
                  >
                    <span>Sign In</span>
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </>
              )}
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center space-x-8 pt-12 animate-slide-up animation-delay-600">
              <div className="flex items-center space-x-2 text-slate-400">
                <Shield className="w-5 h-5 text-emerald-400" />
                <span className="font-medium">Bank-Level Security</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-400">
                <Users className="w-5 h-5 text-indigo-400" />
                <span className="font-medium">50K+ Users</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-400">
                <Award className="w-5 h-5 text-purple-400" />
                <span className="font-medium">AI-Powered</span>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-slate-200 to-white bg-clip-text text-transparent mb-6">
              Powerful Features for Smart Planning
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Everything you need to master your finances, powered by cutting-edge AI technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group relative bg-slate-800/40 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/10">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-indigo-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:shadow-2xl transition-shadow duration-300">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-emerald-400 transition-colors">
                  AI-Powered Budgeting
                </h3>
                <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                  Get personalized budget recommendations that learn from your spending patterns and financial goals. Our AI adapts to your lifestyle changes automatically.
                </p>
                <div className="mt-6 flex items-center text-emerald-400 font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <span>Learn more</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative bg-slate-800/40 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 hover:border-indigo-500/50 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/10">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-purple-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:shadow-2xl transition-shadow duration-300">
                  <PieChart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-indigo-400 transition-colors">
                  Smart Expense Tracking
                </h3>
                <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                  Automatically categorize expenses with intelligent recognition. Get real-time insights and alerts when you're overspending in any category.
                </p>
                <div className="mt-6 flex items-center text-indigo-400 font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <span>Learn more</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative bg-slate-800/40 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 hover:border-purple-500/50 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/10">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-emerald-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:shadow-2xl transition-shadow duration-300">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-purple-400 transition-colors">
                  Goal Achievement
                </h3>
                <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                  Set financial goals and get personalized action plans. Track progress with visual milestones and receive smart recommendations to stay on track.
                </p>
                <div className="mt-6 flex items-center text-purple-400 font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <span>Learn more</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="group relative bg-slate-800/40 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/10">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-indigo-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:shadow-2xl transition-shadow duration-300">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-emerald-400 transition-colors">
                  Bank-Level Security
                </h3>
                <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                  Your financial data is protected with military-grade encryption and multi-layer security protocols. We never store your banking credentials.
                </p>
                <div className="mt-6 flex items-center text-emerald-400 font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <span>Learn more</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="group relative bg-slate-800/40 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 hover:border-indigo-500/50 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/10">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-purple-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:shadow-2xl transition-shadow duration-300">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-indigo-400 transition-colors">
                  Real-Time Insights
                </h3>
                <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                  Get instant notifications and insights about your spending patterns. Make informed decisions with predictive analytics and trend analysis.
                </p>
                <div className="mt-6 flex items-center text-indigo-400 font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <span>Learn more</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="group relative bg-slate-800/40 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 hover:border-purple-500/50 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/10">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-emerald-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:shadow-2xl transition-shadow duration-300">
                  <Wallet className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-purple-400 transition-colors">
                  Multi-Account Support
                </h3>
                <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                  Connect all your accounts in one place. Get a unified view of your financial health across banks, credit cards, and investment accounts.
                </p>
                <div className="mt-6 flex items-center text-purple-400 font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <span>Learn more</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="bg-slate-800/40 backdrop-blur-xl rounded-3xl p-12 border border-slate-700/50">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-white via-slate-200 to-white bg-clip-text text-transparent mb-4">
                Trusted by Thousands
              </h2>
              <p className="text-xl text-slate-400">
                Join our growing community of financially empowered users
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-emerald-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                    {stat.value}
                  </div>
                  <div className="text-slate-400 font-semibold group-hover:text-slate-300 transition-colors">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="bg-gradient-to-r from-emerald-500/10 via-indigo-500/10 to-purple-500/10 backdrop-blur-xl rounded-3xl p-12 border border-slate-700/50">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-slate-200 to-white bg-clip-text text-transparent mb-6">
              Ready to Transform Your Finances?
            </h2>
            <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
              Join thousands of users who have already taken control of their financial future. Start your journey today with a free account.
            </p>
            {!session && (
              <Link
                href="/auth/signup"
                className="group inline-flex bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500 hover:from-emerald-600 hover:via-indigo-600 hover:to-purple-600 text-white px-12 py-5 rounded-2xl text-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-emerald-500/25 items-center space-x-3 border border-white/10"
              >
                <span>Start Free Today</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-slate-900/50 backdrop-blur-xl border-t border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-white via-slate-200 to-white bg-clip-text text-transparent">
                Smart Financial Planner
              </h3>
            </div>
            <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
              Empowering your financial journey with intelligent insights and personalized strategies for a brighter future.
            </p>
            <div className="flex items-center justify-center space-x-8 text-slate-400">
              <span className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>Secure & Private</span>
              </span>
              <span className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-indigo-400" />
                <span>AI-Powered</span>
              </span>
              <span className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-purple-400" />
                <span>24/7 Support</span>
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float 6s ease-in-out infinite;
          animation-delay: 2s;
        }
        
        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        
        .animation-delay-600 {
          animation-delay: 0.6s;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}
