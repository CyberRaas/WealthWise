// app/page.js
'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useTranslation } from 'react-i18next'
import Logo from '@/components/ui/Logo'
import LanguageSelector from '@/components/ui/LanguageSelector'
import { TrendingUp, Shield, Zap, ArrowRight, BarChart3, PieChart, 
  Target,
  DollarSign,
  CreditCard,
  Menu,
  X,
  Hear,
  CheckCircle,
  Sparkles,
  ChevronRight,
  Play,
  Star,
  Users,
  Globe,
  Award,
  Rocket,
  Brain,
  Lock,
  Clock,
  TrendingDown,
  PiggyBank,
  Calculator,
  Heart
} from 'lucide-react'

export default function Home() {
  const { data: session } = useSession()
  const { t } = useTranslation()
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
      icon: Brain,
      titleKey: 'features.ai.title',
      descriptionKey: 'features.ai.description',
      gradient: 'from-purple-500 to-indigo-600',
      bgGradient: 'from-purple-50 to-indigo-50',
      delay: '0ms'
    },
    {
      icon: PiggyBank,
      titleKey: 'features.goals.title',
      descriptionKey: 'features.goals.description',
      gradient: 'from-emerald-500 to-teal-600',
      bgGradient: 'from-emerald-50 to-teal-50',
      delay: '100ms'
    },
    {
      icon: BarChart3,
      titleKey: 'features.budgeting.title',
      descriptionKey: 'features.budgeting.description',
      gradient: 'from-blue-500 to-cyan-600',
      bgGradient: 'from-blue-50 to-cyan-50',
      delay: '200ms'
    },
    {
      icon: TrendingUp,
      titleKey: 'features.investment.title',
      descriptionKey: 'features.investment.description',
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-50',
      delay: '300ms'
    },
    {
      icon: Shield,
      titleKey: 'features.security.title',
      descriptionKey: 'features.security.description',
      gradient: 'from-gray-600 to-gray-800',
      bgGradient: 'from-gray-50 to-slate-50',
      delay: '400ms'
    },
    {
      icon: Zap,
      titleKey: 'features.automation.title',
      descriptionKey: 'features.automation.description',
      gradient: 'from-orange-500 to-red-600',
      bgGradient: 'from-orange-50 to-red-50',
      delay: '500ms'
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
  }, [features.length])

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-50/30 via-white to-blue-50/30"></div>
      <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-gradient-to-l from-emerald-100/10 to-transparent rounded-full blur-3xl animate-float opacity-60"></div>
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-r from-blue-100/10 to-transparent rounded-full blur-3xl animate-float opacity-60" style={{ animationDelay: '2s' }}></div>
      <div className="fixed top-1/2 left-1/2 w-[400px] h-[400px] bg-gradient-to-r from-purple-100/5 to-pink-100/5 rounded-full blur-3xl animate-float opacity-40" style={{ animationDelay: '4s' }}></div>

      {/* Animated Grid Pattern */}
      <div className="fixed inset-0 opacity-[0.02]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
      </div>

      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-xl shadow-sm border-b border-slate-100' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Logo size="large" textClassName="text-2xl text-slate-900" />

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-slate-600 hover:text-slate-900 transition-colors font-medium relative group">
                {t('nav.features')}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-600 group-hover:w-full transition-all duration-300"></span>
              </a>
              <a href="#about" className="text-slate-600 hover:text-slate-900 transition-colors font-medium relative group">
                {t('nav.about')}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-600 group-hover:w-full transition-all duration-300"></span>
              </a>
              <a href="#contact" className="text-slate-600 hover:text-slate-900 transition-colors font-medium relative group">
                {t('nav.contact')}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-600 group-hover:w-full transition-all duration-300"></span>
              </a>
              
              {/* Language Selector */}
              <LanguageSelector variant="nav" />
              
              {session ? (
                <Link href="/dashboard">
                  <button className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 hover:shadow-lg hover:scale-105">
                    <span>{t('nav.dashboard')}</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/signin">
                    <button className="text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg font-medium transition-colors relative group">
                      {t('nav.signin')}
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-600 group-hover:w-full transition-all duration-300"></span>
                    </button>
                  </Link>
                  <Link href="/auth/signup">
                    <button className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 hover:shadow-lg hover:scale-105">
                      <span>{t('nav.signup')}</span>
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
                <a href="#features" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">{t('nav.features')}</a>
                <a href="#about" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">{t('nav.about')}</a>
                <a href="#contact" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">{t('nav.contact')}</a>
                
                {/* Mobile Language Selector */}
                <div className="pt-2">
                  <LanguageSelector variant="mobile" />
                </div>
                
                <hr className="border-slate-200" />
                {session ? (
                  <Link href="/dashboard">
                    <button className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold w-full">
                      {t('nav.dashboard')}
                    </button>
                  </Link>
                ) : (
                  <>
                    <Link href="/auth/signin">
                      <button className="text-slate-600 hover:text-slate-900 text-left font-medium">{t('nav.signin')}</button>
                    </Link>
                    <Link href="/auth/signup">
                      <button className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold w-full">
                        {t('nav.signup')}
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
        <div ref={heroRef} className="max-w-7xl mx-auto pt-28 pb-16 px-4 sm:px-6 lg:px-8 relative">
          {/* Decorative Grid */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-24 h-24 border border-emerald-200/30 rounded-2xl rotate-12 animate-float opacity-60"></div>
            <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-r from-blue-400/10 to-emerald-400/10 rounded-full animate-float opacity-80" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-40 left-20 w-32 h-32 border border-blue-200/30 rounded-3xl -rotate-6 animate-float opacity-50" style={{ animationDelay: '2s' }}></div>
            <div className="absolute bottom-20 right-10 w-20 h-20 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-2xl rotate-45 animate-float opacity-70" style={{ animationDelay: '3s' }}></div>
          </div>

          <div className={`text-center space-y-10 relative z-10 ${isVisible.hero ? 'animate-fade-in' : 'opacity-0'}`}>
            {/* Main Headline */}
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 bg-emerald-50 rounded-full px-6 py-3 border border-emerald-100 animate-bounce-subtle shadow-lg">
                <Sparkles className="w-5 h-5 text-emerald-600 animate-pulse-slow" />
                <span className="text-emerald-700 font-semibold text-sm">{t('hero.badge')}</span>
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight text-slate-900 animate-reveal-text">
                {t('hero.title.part1')}{' '}
                <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-blue-600 bg-clip-text text-transparent animate-gradient">
                  {t('hero.title.part2')}
                </span>
              </h1>
              
              <p className="text-xl sm:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed animate-fade-in-delay">
                {t('hero.subtitle')}
              </p>
            </div>

            {/* Enhanced CTA Buttons with Visual Elements */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-in-delay-2 relative">
              {/* Decorative elements around buttons */}
              <div className="absolute -top-8 -left-8 w-4 h-4 bg-emerald-400 rounded-full animate-pulse opacity-60"></div>
              <div className="absolute -bottom-8 -right-8 w-6 h-6 bg-blue-400 rounded-full animate-pulse opacity-40" style={{ animationDelay: '1s' }}></div>
              
              {session ? (
                <Link href="/dashboard">
                  <button className="group relative bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white px-10 py-4 rounded-2xl text-lg font-semibold transition-all duration-500 flex items-center space-x-3 shadow-2xl hover:shadow-emerald-500/25 hover:scale-105 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <span className="relative z-10">{t('hero.cta.dashboard')}</span>
                    <ArrowRight className="w-5 h-5 relative z-10 transform group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/signup">
                    <button className="group relative bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white px-10 py-4 rounded-2xl text-lg font-semibold transition-all duration-500 flex items-center space-x-3 shadow-2xl hover:shadow-emerald-500/25 hover:scale-105 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <span className="relative z-10">{t('hero.cta.start')}</span>
                      <ArrowRight className="w-5 h-5 relative z-10 transform group-hover:translate-x-1 transition-transform duration-300" />
                    </button>
                  </Link>
                  <Link href="/auth/signin">
                    <button className="group bg-white hover:bg-slate-50 text-slate-700 px-10 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 border-2 border-slate-200 hover:border-slate-300 flex items-center space-x-3 hover:shadow-xl relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-slate-50 to-emerald-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <span className="relative z-10">Sign In</span>
                      <ChevronRight className="w-5 h-5 relative z-10 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300" />
                    </button>
                  </Link>
                </>
              )}
            </div>

            {/* Enhanced Trust Indicators with Grid Layout */}
            <div className="pt-12 animate-fade-in-delay-3">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
                <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
                  <Shield className="w-8 h-8 text-emerald-600 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
                  <div className="text-sm font-semibold text-slate-700 group-hover:text-emerald-600 transition-colors duration-300">{t('trust.bankLevel')}</div>
                </div>
                
                <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
                  <CheckCircle className="w-8 h-8 text-blue-600 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
                  <div className="text-sm font-semibold text-slate-700 group-hover:text-blue-600 transition-colors duration-300">{t('trust.noFees')}</div>
                </div>
                
                <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
                  <Brain className="w-8 h-8 text-purple-600 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
                  <div className="text-sm font-semibold text-slate-700 group-hover:text-purple-600 transition-colors duration-300">{t('trust.aiPowered')}</div>
                </div>
                
                <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
                  <Rocket className="w-8 h-8 text-orange-600 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
                  <div className="text-sm font-semibold text-slate-700 group-hover:text-orange-600 transition-colors duration-300">{t('trust.fastSetup')}</div>
                </div>
              </div>
            </div>

            {/* Visual Enhancement Elements */}
            <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-emerald-400 rounded-full animate-ping opacity-40"></div>
            <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-blue-400 rounded-full animate-ping opacity-30" style={{ animationDelay: '2s' }}></div>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" ref={featuresRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className={`text-center mb-16 ${isVisible.features ? 'animate-fade-in' : 'opacity-0'}`}>
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-full px-6 py-3 border border-emerald-100 mb-6">
              <Sparkles className="w-5 h-5 text-emerald-600 animate-pulse-slow" />
              <span className="text-emerald-700 font-semibold">Powerful Features</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              {t('features.title')}
            </h2>
            <p className="text-xl sm:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              const isActive = index === activeFeature
              return (
                <div
                  key={index}
                  className={`group relative overflow-hidden bg-white rounded-3xl p-8 border border-slate-100 hover:border-slate-200 transition-all duration-700 hover:shadow-2xl ${
                    isVisible.features ? 'animate-fade-in-up' : 'opacity-0'
                  } ${isActive ? 'ring-2 ring-emerald-500/30 shadow-2xl scale-[1.02]' : ''}`}
                  style={{ animationDelay: feature.delay }}
                  onMouseEnter={() => setActiveFeature(index)}
                >
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} opacity-0 group-hover:opacity-100 transition-all duration-700 rounded-3xl`}></div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-500 shadow-lg ${isActive ? 'animate-pulse-subtle' : ''}`}>
                      <Icon className={`w-8 h-8 text-white ${isActive ? 'animate-bounce-subtle' : ''}`} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-slate-800 transition-colors duration-300">
                      {t(feature.titleKey)}
                    </h3>
                    <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors duration-300 mb-6">
                      {t(feature.descriptionKey)}
                    </p>
                    <div className="h-0 group-hover:h-8 overflow-hidden transition-all duration-500 opacity-0 group-hover:opacity-100 flex items-center text-emerald-600 font-semibold">
                      <span>Explore feature</span>
                      <ChevronRight className="w-5 h-5 ml-2 transform translate-x-0 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>

                  {/* Floating elements for visual interest */}
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-emerald-400/10 to-blue-400/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Enhanced Benefits Section */}
        <div ref={benefitsRef} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className={`${isVisible.benefits ? 'animate-fade-in' : 'opacity-0'}`}>
            <div className="text-center mb-12">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-full px-6 py-3 border border-purple-100 mb-6">
                <Award className="w-5 h-5 text-purple-600 animate-pulse-slow" />
                <span className="text-purple-700 font-semibold">{t('benefits.sectionLabel')}</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
                {t('benefits.title')}
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                {t('benefits.subtitle')}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className={`group text-center ${isVisible.benefits ? 'animate-fade-in-left' : 'opacity-0'}`} style={{ animationDelay: '100ms' }}>
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-500 shadow-xl">
                    <Shield className="w-10 h-10 text-white group-hover:animate-bounce-subtle" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-400 rounded-full animate-pulse opacity-75"></div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-emerald-600 transition-colors duration-300">{t('benefits.secure.title')}</h3>
                <p className="text-slate-600 leading-relaxed text-lg">{t('benefits.secure.description')}</p>
                <div className="mt-6 flex items-center justify-center space-x-2 text-emerald-600 font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <Lock className="w-4 h-4" />
                  <span>{t('benefits.secure.feature')}</span>
                </div>
              </div>
              
              <div className={`group text-center ${isVisible.benefits ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '200ms' }}>
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-500 shadow-xl">
                    <Brain className="w-10 h-10 text-white group-hover:animate-bounce-subtle" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-400 rounded-full animate-pulse opacity-75"></div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">{t('benefits.ai.title')}</h3>
                <p className="text-slate-600 leading-relaxed text-lg">{t('benefits.ai.description')}</p>
                <div className="mt-6 flex items-center justify-center space-x-2 text-blue-600 font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <Sparkles className="w-4 h-4" />
                  <span>{t('benefits.ai.feature')}</span>
                </div>
              </div>
              
              <div className={`group text-center ${isVisible.benefits ? 'animate-fade-in-right' : 'opacity-0'}`} style={{ animationDelay: '300ms' }}>
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-500 shadow-xl">
                    <Clock className="w-10 h-10 text-white group-hover:animate-bounce-subtle" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-400 rounded-full animate-pulse opacity-75"></div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-purple-600 transition-colors duration-300">{t('benefits.realtime.title')}</h3>
                <p className="text-slate-600 leading-relaxed text-lg">{t('benefits.realtime.description')}</p>
                <div className="mt-6 flex items-center justify-center space-x-2 text-purple-600 font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <Zap className="w-4 h-4" />
                  <span>{t('benefits.realtime.feature')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-emerald-900 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-40 h-40 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-10 right-10 w-60 h-60 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-emerald-500/5 to-blue-500/5 rounded-full blur-3xl animate-pulse-slow"></div>
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-12 gap-4 h-full w-full max-w-7xl mx-auto px-4">
            {Array.from({ length: 48 }).map((_, i) => (
              <div key={i} className="border border-white/10 rounded-lg animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}></div>
            ))}
          </div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl shadow-2xl">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                {t('cta.title.part1')}{' '}
                <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                  {t('cta.title.part2')}
                </span>
              </h2>
              
              <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                {t('cta.subtitle')}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
              {session ? (
                <Link href="/dashboard">
                  <button className="group relative bg-white hover:bg-slate-50 text-slate-900 px-10 py-4 rounded-2xl text-lg font-bold transition-all duration-500 flex items-center space-x-3 shadow-2xl hover:shadow-white/25 hover:scale-105 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <span className="relative z-10">{t('cta.openDashboard')}</span>
                    <ArrowRight className="w-5 h-5 relative z-10 transform group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/signup">
                    <button className="group relative bg-white hover:bg-slate-50 text-slate-900 px-10 py-4 rounded-2xl text-lg font-bold transition-all duration-500 flex items-center space-x-3 shadow-2xl hover:shadow-white/25 hover:scale-105 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <span className="relative z-10">{t('cta.startJourney')}</span>
                      <ArrowRight className="w-5 h-5 relative z-10 transform group-hover:translate-x-1 transition-transform duration-300" />
                    </button>
                  </Link>
                  <Link href="/auth/signin">
                    <button className="group bg-transparent hover:bg-white/10 text-white px-10 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 border-2 border-white/30 hover:border-white/50 flex items-center space-x-3 hover:shadow-xl backdrop-blur-sm">
                      <span>{t('cta.signIn')}</span>
                      <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300" />
                    </button>
                  </Link>
                </>
              )}
            </div>

            {/* Trust Elements */}
            <div className="flex items-center justify-center space-x-8 pt-8 text-slate-400">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-medium">{t('cta.trust.secure')}</span>
              </div>
              <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4" />
                <span className="text-sm font-medium">{t('cta.trust.fast')}</span>
              </div>
              <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4" />
                <span className="text-sm font-medium">{t('cta.trust.trusted')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-20 w-4 h-4 bg-emerald-400 rounded-full animate-pulse opacity-60"></div>
        <div className="absolute bottom-32 right-32 w-6 h-6 bg-blue-400 rounded-full animate-pulse opacity-40" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-20 w-2 h-2 bg-white rounded-full animate-ping opacity-30"></div>
        <div className="absolute bottom-20 left-1/4 w-3 h-3 bg-emerald-300 rounded-full animate-ping opacity-50" style={{ animationDelay: '3s' }}></div>
      </section>

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
                  <p className="text-xs text-slate-500 -mt-1">{t('footer.tagline')}</p>
                </div>
              </div>
              <p className="text-slate-600 mb-6 max-w-md leading-relaxed font-medium">
                {t('footer.description')}
              </p>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 text-slate-600 hover:text-emerald-600 transition-colors duration-300">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span className="font-medium">{t('footer.securePrivate')}</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-600 hover:text-teal-600 transition-colors duration-300">
                  <CheckCircle className="w-5 h-5 text-teal-600" />
                  <span className="font-medium">{t('footer.aiPowered')}</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-slate-800 mb-4">{t('footer.product')}</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-slate-600 hover:text-emerald-700 transition-colors font-medium relative group inline-block">
                    {t('footer.links.features')}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-600 group-hover:w-full transition-all duration-300"></span>
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 hover:text-emerald-700 transition-colors font-medium relative group inline-block">
                    {t('footer.links.pricing')}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-600 group-hover:w-full transition-all duration-300"></span>
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 hover:text-emerald-700 transition-colors font-medium relative group inline-block">
                    {t('footer.links.security')}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-600 group-hover:w-full transition-all duration-300"></span>
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 hover:text-emerald-700 transition-colors font-medium relative group inline-block">
                    {t('footer.links.api')}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-600 group-hover:w-full transition-all duration-300"></span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-bold text-slate-800 mb-4">{t('footer.support')}</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-slate-600 hover:text-emerald-700 transition-colors font-medium relative group inline-block">
                    {t('footer.links.helpCenter')}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-600 group-hover:w-full transition-all duration-300"></span>
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 hover:text-emerald-700 transition-colors font-medium relative group inline-block">
                    {t('footer.links.contact')}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-600 group-hover:w-full transition-all duration-300"></span>
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 hover:text-emerald-700 transition-colors font-medium relative group inline-block">
                    {t('footer.links.privacy')}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-600 group-hover:w-full transition-all duration-300"></span>
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 hover:text-emerald-700 transition-colors font-medium relative group inline-block">
                    {t('footer.links.terms')}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-600 group-hover:w-full transition-all duration-300"></span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-emerald-100/50 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-500 text-sm font-medium hover:text-emerald-600 transition-colors duration-300">
              {t('footer.copyright')}
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