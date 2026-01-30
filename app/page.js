'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useTranslation } from '@/lib/i18n'
import ThemeToggle from '@/components/ui/ThemeToggle'
import {
  TrendingUp,
  Shield,
  Zap,
  ArrowRight,
  Menu,
  X,
  CheckCircle,
  MessageSquare,
  BookOpen,
  Sparkles,
  PieChart,
  Target,
  Users,
  ChevronRight
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Home() {
  const { data: session } = useSession()
  const { t } = useTranslation()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const features = [
    {
      icon: MessageSquare,
      title: t('features.ai_chatbot.title'),
      description: t('features.ai_chatbot.description'),
      color: 'text-violet-600 dark:text-violet-400',
      bgGlow: 'from-violet-500/20'
    },
    {
      icon: BookOpen,
      title: t('features.education.title'),
      description: t('features.education.description'),
      color: 'text-amber-600 dark:text-amber-400',
      bgGlow: 'from-amber-500/20'
    },
    {
      icon: Sparkles,
      title: t('features.worth_it.title'),
      description: t('features.worth_it.description'),
      color: 'text-indigo-600 dark:text-indigo-400',
      bgGlow: 'from-indigo-500/20'
    },
    {
      icon: PieChart,
      title: t('features.budgeting.title'),
      description: t('features.budgeting.description'),
      color: 'text-blue-600 dark:text-blue-400',
      bgGlow: 'from-blue-500/20'
    },
    {
      icon: Target,
      title: t('features.goals.title'),
      description: t('features.goals.description'),
      color: 'text-emerald-600 dark:text-emerald-400',
      bgGlow: 'from-emerald-500/20'
    },
    {
      icon: Shield,
      title: t('features.security.title'),
      description: t('features.security.description'),
      color: 'text-slate-600 dark:text-slate-400',
      bgGlow: 'from-slate-500/20'
    }
  ]



  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 antialiased selection:bg-emerald-100 dark:selection:bg-emerald-900 selection:text-emerald-900 dark:selection:text-emerald-100 transition-colors duration-300">
      {/* Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 dark:bg-emerald-500/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-normal" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-teal-500/10 dark:bg-teal-500/10 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-normal" />
      </div>

      {/* Navigation */}
      <nav className={`fixed top-4 left-4 right-4 z-50 transition-all duration-300 rounded-2xl ${isScrolled
        ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 shadow-lg'
        : 'bg-transparent'
        }`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-200">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Wealth<span className="text-emerald-600 dark:text-emerald-400">Wise</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer">{t('nav.features')}</a>

              <ThemeToggle variant="icon" />

              {session ? (
                <Link href="/dashboard">
                  <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:shadow-lg hover:shadow-emerald-600/20 flex items-center gap-2 cursor-pointer">
                    {t('nav.dashboard')}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              ) : (
                <div className="flex items-center gap-3">
                  <Link href="/auth/signin">
                    <button className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">{t('nav.signin')}</button>
                  </Link>
                  <Link href="/auth/signup">
                    <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:shadow-lg hover:shadow-emerald-600/20 cursor-pointer">{t('nav.signup')}</button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-3 md:hidden">
              <ThemeToggle variant="icon" />
              <button
                className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden overflow-hidden"
              >
                <div className="flex flex-col py-4 gap-3 border-t border-slate-100 dark:border-slate-800 mt-2">
                  <a href="#features" className="text-slate-600 dark:text-slate-300 font-medium py-2 cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400" onClick={() => setMobileMenuOpen(false)}>{t('nav.features')}</a>

                  <hr className="border-slate-100 dark:border-slate-800" />
                  {session ? (
                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                      <button className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold cursor-pointer">{t('nav.dashboard')}</button>
                    </Link>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Link href="/auth/signin" onClick={() => setMobileMenuOpen(false)}>
                        <button className="w-full border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 py-3 rounded-xl font-medium cursor-pointer">{t('nav.signin')}</button>
                      </Link>
                      <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                        <button className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold cursor-pointer">{t('nav.signup')}</button>
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-36 pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 rounded-full px-4 py-2 mb-8 backdrop-blur-sm"
            >
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-sm text-emerald-700 dark:text-emerald-300 font-semibold tracking-wide">{t('hero.badge')}</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.95] mb-6 tracking-tight text-slate-900 dark:text-white"
            >
              {t('hero.title.part1')}<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-400">{t('hero.title.part2')}</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-medium"
            >
              {t('hero.subtitle')}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            >
              {session ? (
                <Link href="/dashboard">
                  <button className="group w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-xl shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer">
                    {t('hero.cta.dashboard')}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/signup">
                    <button className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-xl shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer">
                      {t('hero.cta.start')}
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </Link>
                  <Link href="/auth/signin">
                    <button className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl font-bold transition-all active:scale-95 cursor-pointer shadow-sm">
                      {t('nav.signin')}
                    </button>
                  </Link>
                </>
              )}
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap items-center justify-center gap-8 text-sm font-semibold text-slate-500 dark:text-slate-400"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>{t('trust.bankLevel')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>{t('trust.noFees')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>{t('trust.fastSetup')}</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative bg-slate-50/50 dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-slate-900 dark:text-white">{t('features.title')}</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium">{t('features.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="group relative cursor-pointer"
                >
                  <div className={`absolute -inset-px rounded-2xl bg-gradient-to-br ${feature.bgGlow} to-transparent opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500`} />
                  <div className="relative h-full bg-white dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700 p-8 rounded-2xl transition-all duration-300 group-hover:border-emerald-200 dark:group-hover:border-emerald-700 group-hover:shadow-xl dark:group-hover:shadow-emerald-900/10">
                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-700/50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30">
                      <Icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.description}</p>
                    <div className="mt-6 flex items-center text-sm font-bold text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Learn more <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-slate-900 dark:bg-slate-800 text-white rounded-3xl p-12 md:p-16 relative overflow-hidden shadow-2xl"
          >
            {/* CTA Background Effects */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-[80px]" />

            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black mb-6">
                {t('cta.title.part1')} <span className="text-emerald-400">{t('cta.title.part2')}</span>
              </h2>
              <p className="text-lg text-slate-300 mb-10 max-w-xl mx-auto font-medium">{t('cta.subtitle')}</p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {session ? (
                  <Link href="/dashboard">
                    <button className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-900 rounded-2xl font-bold shadow-xl shadow-emerald-500/20 transition-all hover:scale-105 flex items-center justify-center gap-2 cursor-pointer">
                      {t('cta.openDashboard')}
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </Link>
                ) : (
                  <>
                    <Link href="/auth/signup">
                      <button className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-900 rounded-2xl font-bold shadow-xl shadow-emerald-500/20 transition-all hover:scale-105 flex items-center justify-center gap-2 cursor-pointer">
                        {t('cta.startJourney')}
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </Link>
                    <Link href="/auth/signin">
                      <button className="w-full sm:w-auto px-8 py-4 border border-slate-600 hover:border-slate-500 text-white rounded-2xl font-bold transition-all cursor-pointer hover:bg-slate-800">
                        {t('cta.signIn')}
                      </button>
                    </Link>
                  </>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-8 mt-12 text-sm font-medium text-slate-400">
                <span className="flex items-center gap-2"><Shield className="w-4 h-4 text-emerald-400" /> Secure</span>
                <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-emerald-400" /> Fast Setup</span>
                <span className="flex items-center gap-2"><Users className="w-4 h-4 text-emerald-400" /> 10K+ Users</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Logo & Description */}
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-2.5 mb-6 cursor-pointer">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-slate-900 dark:text-white">Wealth<span className="text-emerald-600 dark:text-emerald-400">Wise</span></span>
              </Link>
              <p className="text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">{t('footer.description')}</p>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-wider text-sm">{t('footer.product')}</h4>
              <ul className="space-y-4 text-slate-600 dark:text-slate-400">
                <li><a href="#features" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer font-medium">{t('footer.links.features')}</a></li>
                <li><a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer font-medium">{t('footer.links.pricing')}</a></li>
                <li><a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer font-medium">{t('footer.links.security')}</a></li>
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-wider text-sm">{t('footer.support')}</h4>
              <ul className="space-y-4 text-slate-600 dark:text-slate-400">
                <li><a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer font-medium">{t('footer.links.helpCenter')}</a></li>
                <li><a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer font-medium">{t('footer.links.contact')}</a></li>
                <li><Link href="/privacy-policy" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer font-medium">{t('footer.links.privacy')}</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 mt-16 pt-8 text-center text-sm text-slate-500 dark:text-slate-400 font-medium">
            {t('footer.copyright')}
          </div>
        </div>
      </footer>
    </div>
  )
}
