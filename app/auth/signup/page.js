'use client'

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UserPlus, Eye, EyeOff, Mail, ArrowLeft } from 'lucide-react'
import Logo from '@/components/ui/Logo'
import LanguageSelector from '@/components/ui/LanguageSelector'
import ReCaptcha from '@/components/ui/ReCaptcha'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function SignUpPage() {
  const { t } = useTranslation()
  const [step, setStep] = useState('signup') // 'signup' or 'otp'
  const [userData, setUserData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [otpTimer, setOtpTimer] = useState(0)
  const [recaptchaToken, setRecaptchaToken] = useState(null)
  const recaptchaRef = useRef(null)
  const router = useRouter()

  // Schema for signup form
  const signupSchema = z.object({
    name: z.string()
      .min(2, t('validation.nameMin', 'Name must be at least 2 characters'))
      .max(50, t('validation.nameMax', 'Name must be less than 50 characters'))
      .regex(/^[a-zA-Z\s]+$/, t('validation.nameFormat', 'Name can only contain letters and spaces')),
    email: z.string()
      .email(t('validation.emailInvalid', 'Please enter a valid email address'))
      .toLowerCase(),
    password: z.string()
      .min(8, t('validation.passwordMin', 'Password must be at least 8 characters'))
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, t('validation.passwordFormat', 'Password must contain at least one uppercase letter, one lowercase letter, and one number')),
    confirmPassword: z.string()
  }).refine(data => data.password === data.confirmPassword, {
    message: t('validation.passwordMatch', "Passwords don't match"),
    path: ["confirmPassword"],
  })

  // Schema for OTP verification
  const otpSchema = z.object({
    otp: z.string()
      .length(6, t('validation.otpLength', 'OTP must be exactly 6 digits'))
      .regex(/^\d{6}$/, t('validation.otpFormat', 'OTP must contain only numbers'))
  })

  // Form for signup
  const signupForm = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  })

  // Form for OTP
  const otpForm = useForm({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: ''
    }
  })

  // reCAPTCHA handlers
  const handleRecaptchaChange = (token) => {
    setRecaptchaToken(token)
  }

  const handleRecaptchaExpired = () => {
    setRecaptchaToken(null)
  }

  // Handle Google sign-up
  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true)
    
    try {
      await signIn('google', { callbackUrl: '/dashboard' })
    } catch (error) {
      console.error('Google sign-up error:', error)
      toast.error(t('auth.signin.googleError', 'Google authentication failed. Please try again.'))
    } finally {
      // Reset loading state after a short delay to give time for redirect
      setTimeout(() => {
        setIsGoogleLoading(false)
      }, 2000)
    }
  }

  // Handle signup form submission
  const onSignupSubmit = async (data) => {
    // Validate reCAPTCHA
    if (!recaptchaToken) {
      toast.error(t('auth.recaptchaRequired', 'Please complete the reCAPTCHA verification'))
      return
    }

    // Check if reCAPTCHA token is expired
    if (recaptchaRef.current) {
      const isExpired = !recaptchaToken
      if (isExpired) {
        toast.error(t('auth.recaptchaExpired', 'reCAPTCHA has expired. Please verify again.'))
        return
      }
    }

    setIsLoading(true)
    
    try {
      // Verify reCAPTCHA on server
      const recaptchaResponse = await fetch('/api/auth/verify-recaptcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: recaptchaToken })
      })

      const recaptchaResult = await recaptchaResponse.json()

      if (!recaptchaResponse.ok || !recaptchaResult.success) {
        toast.error(t('auth.recaptchaFailed', 'reCAPTCHA verification failed. Please try again.'))
        // Reset reCAPTCHA
        if (recaptchaRef.current) {
          recaptchaRef.current.reset()
        }
        setRecaptchaToken(null)
        return
      }

      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          type: 'registration'
        })
      })

      const result = await response.json()

      if (response.ok) {
        setUserData(data)
        setStep('otp')
        setOtpTimer(300) // 5 minutes
        startTimer()
        
        toast.success(t('auth.otpSent', 'OTP Sent!'), {
          description: t('auth.otpSentDescription', `A 6-digit verification code has been sent to ${data.email}`),
          duration: 4000
        })
      } else {
        toast.error(t('auth.otpSendFailed', 'Failed to send OTP'), {
          description: result.message || t('common.tryAgain', 'Please try again')
        })
      }
    } catch (error) {
      toast.error(t('common.networkError', 'Network error'), {
        description: t('common.checkConnection', 'Please check your connection and try again')
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle OTP verification
  const onOtpSubmit = async (data) => {
    setIsLoading(true)
    
    try {
      // First verify OTP
      const verifyResponse = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userData.email,
          otp: data.otp,
          type: 'registration'
        })
      })

      const verifyResult = await verifyResponse.json()

      if (verifyResponse.ok) {
        // Now register the user
        const registerResponse = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: userData.name,
            email: userData.email,
            password: userData.password,
            otp: data.otp
          })
        })

        const registerResult = await registerResponse.json()

        if (registerResponse.ok) {
          toast.success(t('auth.registrationSuccess', '🎉 Registration Successful!'), {
            description: t('auth.registrationSuccessDescription', 'Your account has been created. Please sign in to continue.'),
            duration: 5000
          })

          // Redirect to signin page
          router.push(`/auth/signin?email=${encodeURIComponent(userData.email)}&message=registration-complete`)
        } else {
          toast.error(t('auth.registrationFailed', 'Registration failed'), {
            description: registerResult.message || t('common.tryAgain', 'Please try again')
          })
        }
      } else {
        toast.error(t('auth.invalidOtp', 'Invalid OTP'), {
          description: verifyResult.message || t('auth.checkOtpCode', 'Please check the code and try again')
        })
      }
    } catch (error) {
      toast.error(t('common.networkError', 'Network error'), {
        description: t('common.checkConnection', 'Please check your connection and try again')
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Timer functionality
  const startTimer = () => {
    const interval = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // Resend OTP
  const handleResendOtp = async () => {
    if (otpTimer > 0) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userData.email,
          type: 'registration'
        })
      })

      if (response.ok) {
        setOtpTimer(300)
        startTimer()
        toast.success(t('auth.otpResent', 'OTP Resent!'), {
          description: t('auth.otpResentDescription', 'A new verification code has been sent to your email')
        })
      } else {
        toast.error(t('auth.otpResendFailed', 'Failed to resend OTP'), {
          description: t('common.tryAgain', 'Please try again')
        })
      }
    } catch (error) {
      toast.error(t('common.networkError', 'Network error'), {
        description: t('common.tryAgain', 'Please try again')
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Format timer display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Signup form UI
  if (step === 'signup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Elegant background decoration */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-emerald-200 to-teal-200 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-blue-200 to-indigo-200 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-r from-slate-100 to-blue-100 rounded-full blur-3xl"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          {/* Company Logo/Brand Area */}
          <div className="text-center mb-2 flex flex-col items-center">
            <div className="flex items-center space-x-4 mb-2">
              <Logo size="xlarge" textClassName="text-2xl " />
              <LanguageSelector variant="dashboard" />
            </div>
            <p className="text-slate-600 text-sm font-medium mt-2">{t('auth.signup.tagline') || 'Join WealthWise and start your journey'}</p>
          </div>

          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-xl ring-1 ring-slate-200/50 rounded-3xl overflow-hidden">
            <CardHeader className="space-y-3 pb-6 pt-8 px-8 bg-gradient-to-b from-slate-50/50 to-transparent">
              <CardTitle className="text-3xl text-center font-bold bg-gradient-to-r from-slate-800 via-emerald-700 to-teal-700 bg-clip-text text-transparent leading-tight">
                {t('auth.createAccount', 'Create Account')}
              </CardTitle>
              <CardDescription className="text-center text-base text-slate-600 font-medium">
                {t('auth.joinWealthWise', 'Join WealthWise and start your journey')}
              </CardDescription>
            </CardHeader>

            <form onSubmit={signupForm.handleSubmit(onSignupSubmit)}>
              <CardContent className="space-y-4 px-8">
                {/* Name Field */}
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-semibold text-slate-700 block tracking-wide">
                    {t('auth.fullName', 'Full Name')}
                  </label>
                  <Input
                    id="name"
                    type="text"
                    placeholder={t('auth.enterFullName', 'Enter your full name')}
                    autoComplete="name"
                    disabled={isLoading}
                    {...signupForm.register('name')}
                    className="h-12 border-2 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 focus:ring-4 bg-white text-slate-900 placeholder:text-slate-400 rounded-xl text-base transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300"
                  />
                  {signupForm.formState.errors.name && (
                    <p className="text-sm text-red-600 font-medium mt-1">{signupForm.formState.errors.name.message}</p>
                  )}
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-semibold text-slate-700 block tracking-wide">
                    {t('auth.emailAddress', 'Email Address')}
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('auth.enterEmail', 'Enter your email')}
                    autoComplete="email"
                    disabled={isLoading}
                    {...signupForm.register('email')}
                    className="h-12 border-2 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 focus:ring-4 bg-white text-slate-900 placeholder:text-slate-400 rounded-xl text-base transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300"
                  />
                  {signupForm.formState.errors.email && (
                    <p className="text-sm text-red-600 font-medium mt-1">{signupForm.formState.errors.email.message}</p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-semibold text-slate-700 block tracking-wide">
                    {t('auth.password', 'Password')}
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={t('auth.createStrongPassword', 'Create a strong password')}
                      autoComplete="new-password"
                      disabled={isLoading}
                      {...signupForm.register('password')}
                      className="h-12 border-2 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 focus:ring-4 bg-white text-slate-900 placeholder:text-slate-400 rounded-xl text-base pr-12 transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-emerald-600 transition-colors duration-200"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {signupForm.formState.errors.password && (
                    <p className="text-sm text-red-600 font-medium mt-1">{signupForm.formState.errors.password.message}</p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700 block tracking-wide">
                    {t('auth.confirmPassword', 'Confirm Password')}
                  </label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder={t('auth.confirmYourPassword', 'Confirm your password')}
                      autoComplete="new-password"
                      disabled={isLoading}
                      {...signupForm.register('confirmPassword')}
                      className="h-12 border-2 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 focus:ring-4 bg-white text-slate-900 placeholder:text-slate-400 rounded-xl text-base pr-12 transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-emerald-600 transition-colors duration-200"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {signupForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-600 font-medium mt-1">{signupForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* reCAPTCHA */}
                <div className="flex justify-center py-2">
                  <ReCaptcha
                    ref={recaptchaRef}
                    onChange={handleRecaptchaChange}
                    onExpired={handleRecaptchaExpired}
                  />
                </div>
              </CardContent>

              {/* Create Account Button */}
              <div className="px-8 pb-6 space-y-4">
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-700 hover:via-teal-700 hover:to-blue-700 text-white font-bold text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] focus:ring-4 focus:ring-emerald-500/30 border border-white/20"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{t('auth.sendingOtp', 'Sending OTP...')}</span>
                    </div>
                  ) : (
                    <span className="flex items-center justify-center space-x-2">
                      <span>{t('auth.createAccount', 'Create Account')}</span>
                      <UserPlus className="w-4 h-4" />
                    </span>
                  )}
                </Button>
                
                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-3 text-slate-500 font-medium tracking-wide">{t('auth.orContinue', 'Or continue with')}</span>
                  </div>
                </div>
                
                {/* Google Sign Up */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 border-2 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-slate-700 font-semibold text-base rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] focus:ring-4 focus:ring-emerald-500/20 shadow-sm hover:shadow-md"
                  onClick={handleGoogleSignUp}
                  disabled={isLoading || isGoogleLoading}
                >
                  {isGoogleLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>{t('auth.signin.connecting', 'Connecting...')}</span>
                    </div>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      {t('auth.googleSignUp', 'Sign up with Google')}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
          
          {/* Sign In Link */}
          <div className="text-center mt-4">
            <p className="text-slate-600 font-medium text-sm">
              {t('auth.alreadyHaveAccount', 'Already have an account?')}{' '}
              <Link href="/auth/signin" className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors duration-200 hover:underline">
                {t('auth.signIn', 'Sign in')}
              </Link>
            </p>
          </div>

          <style jsx>{`
            @keyframes blob {
              0% {
                transform: translate(0px, 0px) scale(1);
              }
              33% {
                transform: translate(30px, -50px) scale(1.1);
              }
              66% {
                transform: translate(-20px, 20px) scale(0.9);
              }
              100% {
                transform: translate(0px, 0px) scale(1);
              }
            }
            .animate-blob {
              animation: blob 7s infinite;
            }
            .animation-delay-2000 {
              animation-delay: 2s;
            }
            .animation-delay-4000 {
              animation-delay: 4s;
            }
          `}</style>
        </div>
      </div>
    )
  }

  // OTP verification UI
  if (step === 'otp') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-900 to-slate-900"></div>
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

        <div className="max-w-md w-full space-y-8 relative z-10">
          {/* Language Selector */}
          <div className="flex justify-end mb-4">
            <LanguageSelector />
          </div>

          <Card className="w-full shadow-2xl border border-slate-700/50 bg-slate-800/90 backdrop-blur-xl ring-1 ring-slate-700/50 rounded-3xl overflow-hidden">
            <CardHeader className="space-y-6 pb-8 pt-12 px-8 bg-gradient-to-b from-slate-800/50 to-transparent">
              <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6">
                <Logo className="w-16 h-16" />
              </div>
              <CardTitle className="text-4xl text-center font-bold bg-gradient-to-r from-white via-slate-200 to-white bg-clip-text text-transparent leading-tight">
                {t('auth.verifyEmail', 'Verify Your Email')}
              </CardTitle>
              <CardDescription className="text-center text-lg text-slate-400 font-medium">
                {t('auth.enterCodeSent', 'Enter the 6-digit code sent to')}<br />
                <span className="font-bold text-slate-200">{userData?.email}</span>
              </CardDescription>
            </CardHeader>

            <form onSubmit={otpForm.handleSubmit(onOtpSubmit)}>
              <CardContent className="space-y-8 px-8">
                <div className="space-y-4">
                  <label htmlFor="otp" className="text-sm font-semibold text-slate-300 uppercase tracking-wider text-center block">
                    {t('auth.verificationCode', 'Verification Code')}
                  </label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder={t('auth.enterSixDigitCode', 'Enter 6-digit code')}
                    maxLength={6}
                    className="text-center text-3xl font-bold tracking-[0.5em] h-16 border-2 border-slate-600 focus:border-emerald-500 focus:ring-emerald-500/30 focus:ring-4 bg-slate-700/50 backdrop-blur-sm text-white placeholder:text-slate-400 rounded-2xl transition-all duration-300 shadow-inner"
                    disabled={isLoading}
                    {...otpForm.register('otp')}
                  />
                  {otpForm.formState.errors.otp && (
                    <p className="text-sm text-rose-400 font-medium text-center">{otpForm.formState.errors.otp.message}</p>
                  )}
                </div>

                {otpTimer > 0 && (
                  <div className="text-center">
                    <p className="text-sm text-slate-400 font-medium">
                      {t('auth.resendCodeIn', 'Resend code in')} <span className="text-emerald-400 font-bold">{formatTime(otpTimer)}</span>
                    </p>
                  </div>
                )}

                {otpTimer === 0 && (
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isLoading}
                      className="text-sm text-emerald-400 hover:text-emerald-300 font-bold transition-colors duration-200 hover:underline bg-slate-700/30 px-4 py-2 rounded-lg"
                    >
                      {t('auth.resendVerificationCode', 'Resend verification code')}
                    </button>
                  </div>
                )}
              </CardContent>

              <div className="px-8 pb-8 space-y-6">
                <Button
                  type="submit"
                  className="w-full h-14 text-lg font-bold bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500 hover:from-emerald-600 hover:via-indigo-600 hover:to-purple-600 text-white shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 transform hover:scale-[1.02] focus:ring-4 focus:ring-emerald-500/30 rounded-2xl border border-white/10"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{t('auth.verifying', 'Verifying...')}</span>
                    </div>
                  ) : (
                    <span className="flex items-center justify-center space-x-2">
                      <span>{t('auth.verifyAndCompleteRegistration', 'Verify & Complete Registration')}</span>
                      <Mail className="w-5 h-5" />
                    </span>
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => setStep('signup')}
                  className="w-full flex items-center justify-center space-x-2 text-slate-400 hover:text-slate-300 transition-colors duration-200 py-3"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t('auth.backToSignup', 'Back to signup')}</span>
                </button>
              </div>
            </form>
          </Card>

          <style jsx>{`
            @keyframes blob {
              0% {
                transform: translate(0px, 0px) scale(1);
              }
              33% {
                transform: translate(30px, -50px) scale(1.1);
              }
              66% {
                transform: translate(-20px, 20px) scale(0.9);
              }
              100% {
                transform: translate(0px, 0px) scale(1);
              }
            }
            .animate-blob {
              animation: blob 7s infinite;
            }
            .animation-delay-2000 {
              animation-delay: 2s;
            }
            .animation-delay-4000 {
              animation-delay: 4s;
            }
          `}</style>
        </div>
      </div>
    )
  }
}