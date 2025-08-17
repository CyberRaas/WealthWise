'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { 
  TrendingUp, 
  Shield, 
  Zap, 
  ArrowRight, 
  BarChart3, 
  PieChart, 
  Target,
  DollarSign,
  CreditCard,
  Menu,
  X,
  CheckCircle,
  Sparkles,
  ChevronRight,
  Play
} from 'lucide-react'

export default function Home() {
  const { data: session } = useSession()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)
  const [isVisible, setIsVisible] = useState({
    hero: false,
    features: false,
    benefits: false,
    cta: false
  })
  
  const heroRef = useRef(null)
  const featuresRef = useRef(null)
  const benefitsRef = useRef(null)
  const ctaRef = useRef(null)

  const features = [
    {
      icon: BarChart3,
      title: 'Smart Budgeting',
      description: 'AI-powered budget recommendations that adapt to your spending habits and financial goals.',
    },
    {
      icon: PieChart,
      title: 'Expense Tracking',
      description: 'Automatic categorization and real-time insights into your spending patterns.',
    },
    {
      icon: Target,
      title: 'Goal Setting',
      description: 'Set and achieve financial milestones with personalized action plans.',
    },
    {
      icon: Shield,
      title: 'Bank Security',
      description: 'Military-grade encryption protects your financial data 24/7.',
    },
    {
      icon: Zap,
      title: 'Real-time Alerts',
      description: 'Instant notifications for spending limits, bill reminders, and opportunities.',
    },
    {
      icon: CreditCard,
      title: 'Multi-Account',
      description: 'Connect all your accounts for a unified view of your financial health.',
    }
  ]

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
      
      // Check if sections are visible
      const checkVisibility = (ref, section) => {
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect()
          const isInViewport = rect.top < window.innerHeight * 0.75 && rect.bottom >= 0
          setIsVisible(prev => ({ ...prev, [section]: isInViewport }))
        }
      }
      
      checkVisibility(heroRef, 'hero')
      checkVisibility(featuresRef, 'features')
      checkVisibility(benefitsRef, 'benefits')
      checkVisibility(ctaRef, 'cta')
    }
    
    window.addEventListener('scroll', handleScroll)
    
    // Initial check
    setTimeout(() => {
      setIsVisible(prev => ({ ...prev, hero: true }))
      handleScroll()
    }, 100)
    
    // Auto-rotate features
    const featureInterval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % features.length)
    }, 3000)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearInterval(featureInterval)
    }
  }, [])

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 via-white to-blue-50/30 animate-gradient"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-l from-emerald-100/20 to-transparent rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-r from-blue-100/20 to-transparent rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>

      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-xl shadow-sm border-b border-slate-100' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-6 h-6 text-white animate-pulse-subtle" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">
                WealthWise
              </h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-600 hover:text-slate-900 transition-colors font-medium relative group">
                Features
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-600 group-hover:w-full transition-all duration-300"></span>
              </a>
              <a href="#about" className="text-slate-600 hover:text-slate-900 transition-colors font-medium relative group">
                About
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-600 group-hover:w-full transition-all duration-300"></span>
              </a>
              <a href="#contact" className="text-slate-600 hover:text-slate-900 transition-colors font-medium relative group">
                Contact
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-600 group-hover:w-full transition-all duration-300"></span>
              </a>
              {session ? (
                <Link href="/dashboard">
                  <button className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 hover:shadow-lg hover:scale-105">
                    <span>Dashboard</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/signin">
                    <button className="text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg font-medium transition-colors relative group">
                      Sign In
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-600 group-hover:w-full transition-all duration-300"></span>
                    </button>
                  </Link>
                  <Link href="/auth/signup">
                    <button className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 hover:shadow-lg hover:scale-105">
                      <span>Get Started</span>
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                </>
              )}
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
            <div className="md:hidden bg-white rounded-2xl mt-4 p-6 border border-slate-100 shadow-xl">
              <div className="flex flex-col space-y-4">
                <a href="#features" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">Features</a>
                <a href="#about" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">About</a>
                <a href="#contact" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">Contact</a>
                <hr className="border-slate-200" />
                {session ? (
                  <Link href="/dashboard">
                    <button className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold w-full">
                      Dashboard
                    </button>
                  </Link>
                ) : (
                  <>
                    <Link href="/auth/signin">
                      <button className="text-slate-600 hover:text-slate-900 text-left font-medium">Sign In</button>
                    </Link>
                    <Link href="/auth/signup">
                      <button className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold w-full">
                        Get Started
                      </button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10">
        <div ref={heroRef} className="max-w-7xl mx-auto pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className={`text-center space-y-12 ${isVisible.hero ? 'animate-fade-in' : 'opacity-0'}`}>
            {/* Main Headline */}
            <div className="space-y-8">
              <div className="inline-flex items-center space-x-2 bg-emerald-50 rounded-full px-4 py-2 border border-emerald-100 animate-bounce-subtle">
                <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse-slow" />
                <span className="text-emerald-700 font-medium text-sm">Smart Financial Planning</span>
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight text-slate-900 animate-reveal-text">
                Take Control of{' '}
                <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent animate-gradient">
                  Your Money
                </span>
              </h1>
              
              <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed animate-fade-in-delay">
                WealthWise helps you budget smarter, save more, and achieve your financial goals with AI-powered insights and intuitive tools.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-in-delay-2">
              {session ? (
                <Link href="/dashboard">
                  <button className="group bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-500 flex items-center space-x-3 shadow-lg hover:shadow-xl hover:scale-105">
                    <span>Go to Dashboard</span>
                    <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/signup">
                    <button className="group bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-500 flex items-center space-x-3 shadow-lg hover:shadow-xl hover:scale-105">
                      <span>Start Free Trial</span>
                      <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" />
                    </button>
                  </Link>
                  <Link href="/auth/signin">
                    <button className="group bg-white hover:bg-slate-50 text-slate-700 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 border-2 border-slate-200 hover:border-slate-300 flex items-center space-x-3 hover:shadow-md">
                      <span>Sign In</span>
                      <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300" />
                    </button>
                  </Link>
                </>
              )}
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-8 pt-8 animate-fade-in-delay-3">
              <div className="flex items-center space-x-2 text-slate-600 hover:text-emerald-600 transition-colors duration-300 group">
                <Shield className="w-5 h-5 text-emerald-600 transform group-hover:scale-110 transition-transform duration-300" />
                <span className="font-medium">Bank-Level Security</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 transition-colors duration-300 group">
                <CheckCircle className="w-5 h-5 text-blue-600 transform group-hover:scale-110 transition-transform duration-300" />
                <span className="font-medium">No Hidden Fees</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-600 hover:text-emerald-600 transition-colors duration-300 group">
                <Zap className="w-5 h-5 text-emerald-600 transform group-hover:scale-110 transition-transform duration-300" />
                <span className="font-medium">AI-Powered</span>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" ref={featuresRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className={`text-center mb-16 ${isVisible.features ? 'animate-fade-in' : 'opacity-0'}`}>
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
              Everything you need to{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent animate-gradient">
                manage your finances
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Powerful tools designed to simplify your financial life and help you build wealth smarter.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              const isActive = index === activeFeature
              return (
                <div
                  key={index}
                  className={`group bg-white rounded-2xl p-8 border border-slate-100 hover:border-slate-200 transition-all duration-500 hover:shadow-lg ${
                    isVisible.features ? 'animate-fade-in-up' : 'opacity-0'
                  } ${isActive ? 'ring-2 ring-emerald-500/30 shadow-lg scale-[1.02]' : ''}`}
                  style={{ animationDelay: `${index * 150}ms` }}
                  onMouseEnter={() => setActiveFeature(index)}
                >
                  <div className={`w-12 h-12 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 ${isActive ? 'animate-pulse-subtle' : ''}`}>
                    <Icon className={`w-6 h-6 text-white ${isActive ? 'animate-bounce-subtle' : ''}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-4 group-hover:text-emerald-700 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors duration-300">
                    {feature.description}
                  </p>
                  <div className="h-0 group-hover:h-6 overflow-hidden transition-all duration-500 mt-4 opacity-0 group-hover:opacity-100 flex items-center text-emerald-600 font-medium">
                    <span>Learn more</span>
                    <ChevronRight className="w-4 h-4 ml-1 transform translate-x-0 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Simple Benefits Section */}
        <div ref={benefitsRef} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className={`${isVisible.benefits ? 'animate-fade-in' : 'opacity-0'}`}>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
              Why Choose WealthWise?
            </h2>
            <p className="text-xl text-slate-600 mb-12">
              Simple, powerful tools to help you achieve your financial goals
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className={`text-center ${isVisible.benefits ? 'animate-fade-in-left' : 'opacity-0'}`} style={{ animationDelay: '100ms' }}>
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4 hover:scale-110 transition-transform duration-300 group">
                  <Shield className="w-6 h-6 text-emerald-600 group-hover:animate-bounce-subtle" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Secure & Private</h3>
                <p className="text-slate-600">Your financial data is encrypted and protected</p>
              </div>
              
              <div className={`text-center ${isVisible.benefits ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '200ms' }}>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4 hover:scale-110 transition-transform duration-300 group">
                  <Zap className="w-6 h-6 text-blue-600 group-hover:animate-bounce-subtle" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Easy to Use</h3>
                <p className="text-slate-600">Intuitive design that anyone can master</p>
              </div>
              
              <div className={`text-center ${isVisible.benefits ? 'animate-fade-in-right' : 'opacity-0'}`} style={{ animationDelay: '300ms' }}>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4 hover:scale-110 transition-transform duration-300 group">
                  <TrendingUp className="w-6 h-6 text-purple-600 group-hover:animate-bounce-subtle" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Smart Insights</h3>
                <p className="text-slate-600">AI-powered recommendations for better decisions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA Section */}
        <div ref={ctaRef} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className={`bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 rounded-3xl p-12 border border-emerald-200/50 relative overflow-hidden shadow-2xl ${isVisible.cta ? 'animate-fade-in-up' : 'opacity-0'} animate-gradient-slow`}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 animate-gradient"></div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-800 via-emerald-700 to-slate-800 bg-clip-text text-transparent mb-6 animate-gradient-slow">
              Ready to Transform Your Financial Future?
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 mb-8 max-w-2xl mx-auto font-medium">
              Join over 250,000 users who have already taken control of their finances with WealthWise. 
              Start your free trial today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              {session ? (
                <Link href="/dashboard">
                  <button className="group bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-700 hover:via-teal-700 hover:to-blue-700 text-white px-12 py-5 rounded-2xl text-xl font-bold transition-all duration-500 transform hover:scale-105 shadow-2xl hover:shadow-emerald-500/25 flex items-center space-x-3 ring-2 ring-white/20 animate-pulse-subtle">
                    <span>Go to Dashboard</span>
                    <ArrowRight className="w-6 h-6 transform group-hover:translate-x-2 transition-all duration-300" />
                  </button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/signup">
                    <button className="group bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-700 hover:via-teal-700 hover:to-blue-700 text-white px-12 py-5 rounded-2xl text-xl font-bold transition-all duration-500 transform hover:scale-105 shadow-2xl hover:shadow-emerald-500/25 flex items-center space-x-3 ring-2 ring-white/20 animate-pulse-subtle">
                      <span>Start Free Trial</span>
                      <ArrowRight className="w-6 h-6 transform group-hover:translate-x-2 transition-all duration-300" />
                    </button>
                  </Link>
                  <button className="group bg-white hover:bg-white/90 text-slate-700 px-12 py-5 rounded-2xl text-xl font-bold transition-all duration-500 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center space-x-3 border-2 border-emerald-200 hover:border-emerald-300 relative overflow-hidden">
                    <span className="relative z-10">Watch Demo</span>
                    <Play className="w-6 h-6 relative z-10 transform group-hover:scale-110 transition-transform duration-300" />
                    <span className="absolute inset-0 bg-gradient-to-r from-slate-50 to-emerald-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                  </button>
                </>
              )}
            </div>
            <p className="text-slate-500 text-sm mt-6 font-medium">
              No credit card required • 30-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-white/90 border-t border-emerald-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo & Description */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6 group">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl ring-4 ring-white/50 group-hover:ring-emerald-100 transition-all duration-300">
                  <TrendingUp className="w-7 h-7 text-white group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-emerald-700 to-blue-800 bg-clip-text text-transparent group-hover:from-emerald-600 group-hover:via-teal-600 group-hover:to-blue-600 transition-all duration-500">
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
                <div className="flex items-center space-x-2 text-slate-600 hover:text-emerald-600 transition-colors duration-300">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span className="font-medium">Secure & Private</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-600 hover:text-teal-600 transition-colors duration-300">
                  <CheckCircle className="w-5 h-5 text-teal-600" />
                  <span className="font-medium">AI-Powered</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-slate-800 mb-4">Product</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-slate-600 hover:text-emerald-700 transition-colors font-medium relative group inline-block">
                    Features
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-600 group-hover:w-full transition-all duration-300"></span>
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 hover:text-emerald-700 transition-colors font-medium relative group inline-block">
                    Pricing
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-600 group-hover:w-full transition-all duration-300"></span>
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 hover:text-emerald-700 transition-colors font-medium relative group inline-block">
                    Security
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-600 group-hover:w-full transition-all duration-300"></span>
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 hover:text-emerald-700 transition-colors font-medium relative group inline-block">
                    API
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-600 group-hover:w-full transition-all duration-300"></span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-bold text-slate-800 mb-4">Support</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-slate-600 hover:text-emerald-700 transition-colors font-medium relative group inline-block">
                    Help Center
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-600 group-hover:w-full transition-all duration-300"></span>
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 hover:text-emerald-700 transition-colors font-medium relative group inline-block">
                    Contact Us
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-600 group-hover:w-full transition-all duration-300"></span>
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 hover:text-emerald-700 transition-colors font-medium relative group inline-block">
                    Privacy Policy
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-600 group-hover:w-full transition-all duration-300"></span>
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 hover:text-emerald-700 transition-colors font-medium relative group inline-block">
                    Terms of Service
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-600 group-hover:w-full transition-all duration-300"></span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-emerald-100/50 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-500 text-sm font-medium hover:text-emerald-600 transition-colors duration-300">
              © 2024 WealthWise. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <span className="text-slate-500 text-sm font-medium relative group hover:text-emerald-600 transition-colors duration-300">
                Made with <span className="text-red-500 animate-pulse-subtle inline-block">❤️</span> for your financial success
              </span>
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
        
        @keyframes slideLeft {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideRight {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes reveal {
          0% {
            transform: translateY(20px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes bounce-subtle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        
        @keyframes pulse-subtle {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.05);
          }
        }
        
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.8;
          }
          50% {
            opacity: 1;
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
        
        .animate-fade-in {
          animation: fadeIn 1s ease forwards;
        }
        
        .animate-fade-in-delay {
          opacity: 0;
          animation: fadeIn 1s ease forwards 0.3s;
        }
        
        .animate-fade-in-delay-2 {
          opacity: 0;
          animation: fadeIn 1s ease forwards 0.6s;
        }
        
        .animate-fade-in-delay-3 {
          opacity: 0;
          animation: fadeIn 1s ease forwards 0.9s;
        }
        
        .animate-fade-in-up {
          animation: slideUp 0.8s ease-out forwards;
        }
        
        .animate-fade-in-left {
          animation: slideLeft 0.8s ease-out forwards;
        }
        
        .animate-fade-in-right {
          animation: slideRight 0.8s ease-out forwards;
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradientShift 3s ease infinite;
        }
        
        .animate-gradient-slow {
          background-size: 200% 200%;
          animation: gradientShift 6s ease infinite;
        }
        
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
        
        .animate-pulse-subtle {
          animation: pulse-subtle 3s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        
        .animate-reveal-text {
          animation: reveal 1s cubic-bezier(0.215, 0.61, 0.355, 1) forwards;
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