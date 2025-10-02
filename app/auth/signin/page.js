
// app/auth/signin/page.js

// 'use client'

// import { useState, useEffect, Suspense } from 'react'
// import { useRouter, useSearchParams } from 'next/navigation'
// import { signIn } from 'next-auth/react'
// import { useForm } from 'react-hook-form'
// import { zodResolver } from '@hookform/resolvers/zod'
// import { z } from 'zod'
// import { useTranslation } from 'react-i18next'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// import { LogIn, Eye, EyeOff, Shield } from 'lucide-react'
// import Logo from '@/components/ui/Logo'
// import LanguageSelector from '@/components/ui/LanguageSelector'
// import toast from 'react-hot-toast'
// import Link from 'next/link'


// function SignInForm() {
//   const { t } = useTranslation()
//   const router = useRouter()
//   const searchParams = useSearchParams()
//   const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
//   const message = searchParams.get('message')
//   const emailParam = searchParams.get('email')
  
//   const [isLoading, setIsLoading] = useState(false)
//   const [isGoogleLoading, setIsGoogleLoading] = useState(false)
//   const [showPassword, setShowPassword] = useState(false)

//   const signinSchema = z.object({
//     email: z.string().email(t('auth.signin.emailRequired')),
//     password: z.string().min(1, t('auth.signin.passwordRequired')),
//     rememberMe: z.boolean().optional()
//   })
  
//   const {
//     register,
//     handleSubmit,
//     formState: { errors }
//   } = useForm({
//     resolver: zodResolver(signinSchema),
//     defaultValues: {
//       email: emailParam || '',
//       rememberMe: false
//     }
//   })

//   // Show welcome message if redirected from registration
//   useEffect(() => {
//     if (message === 'registration-complete') {
//       toast.success(t('auth.signin.registrationComplete'), {
//         duration: 5000,
//         position: 'top-center',
//       })
//     }
//   }, [message, t])

//   // Handle form submission
//   const onSubmit = async (data) => {
//     setIsLoading(true)

//     try {
//       const result = await signIn('credentials', {
//         email: data.email,
//         password: data.password,
//         redirect: false
//       })

//       if (result?.error) {
//         toast.error(t('auth.signin.invalidCredentials'))
//       } else {
//         toast.success(t('auth.signin.welcomeBack'))
//         router.push(callbackUrl)
//       }
//     } catch (error) {
//       toast.error(t('auth.signin.networkError'))
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   // Handle Google sign-in
//   const handleGoogleSignIn = async () => {
//     setIsGoogleLoading(true)
    
//     try {
//       await signIn('google', { callbackUrl })
//     } catch (error) {
//       console.error('Google sign-in error:', error)
//       toast.error(t('auth.signin.googleError'))
//     } finally {
//       // Reset loading state after a short delay to give time for redirect
//       setTimeout(() => {
//         setIsGoogleLoading(false)
//       }, 2000)
//     }
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50 flex items-center justify-center p-4">
//       {/* Elegant background decoration */}
//       <div className="absolute inset-0 opacity-40">
//         <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-emerald-200 to-teal-200 rounded-full blur-3xl"></div>
//         <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-blue-200 to-indigo-200 rounded-full blur-3xl"></div>
//         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-r from-slate-100 to-blue-100 rounded-full blur-3xl"></div>
//       </div>
      
//       <div className="w-full max-w-md relative z-10">
//         {/* Company Logo/Brand Area */}
//         <div className="text-center mb-2 flex flex-col items-center">
//           <div className="flex items-center space-x-4 mb-2">
//             <Logo size="xlarge" textClassName="text-2xl " />
//             <LanguageSelector variant="dashboard" />
//           </div>
//           <p className="text-slate-600 text-sm font-medium mt-2">{t('auth.signin.tagline')}</p>
//         </div>

//         <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-xl ring-1 ring-slate-200/50 rounded-3xl overflow-hidden">
//           <CardHeader className="text-center pb-8 pt-8 bg-gradient-to-b from-slate-50/50 to-transparent">
//             <CardTitle className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-emerald-700 to-teal-700 bg-clip-text text-transparent mb-3">
//               {t('auth.signin.title')}
//             </CardTitle>
//             <CardDescription className="text-slate-600 text-lg font-medium">
//               {t('auth.signin.subtitle')}
//             </CardDescription>
//           </CardHeader>
          
//           <CardContent className="space-y-2 px-8 pb-8">
//             <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//               {/* Email Field */}
//               <div className="space-y-2">
//                 <label 
//                   htmlFor="email" 
//                   className="text-sm font-semibold text-slate-700 block tracking-wide"
//                 >
//                   {t('auth.signin.email')}
//                 </label>
//                 <Input
//                   id="email"
//                   type="email"
//                   placeholder={t('auth.signin.emailPlaceholder')}
//                   autoComplete="email"
//                   disabled={isLoading}
//                   {...register('email')}
//                   className="h-14 border-2 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 focus:ring-4 bg-white text-slate-900 placeholder:text-slate-400 rounded-2xl text-base transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300"
//                 />
//                 {errors.email && (
//                   <p className="text-sm text-red-600 mt-2 font-medium">{errors.email.message}</p>
//                 )}
//               </div>

//               {/* Password Field */}
//               <div className="space-y-2">
//                 <label 
//                   htmlFor="password" 
//                   className="text-sm font-semibold text-slate-700 block tracking-wide"
//                 >
//                   {t('auth.signin.password')}
//                 </label>
//                 <div className="relative">
//                   <Input
//                     id="password"
//                     type={showPassword ? "text" : "password"}
//                     placeholder={t('auth.signin.passwordPlaceholder')}
//                     autoComplete="current-password"
//                     disabled={isLoading}
//                     {...register('password')}
//                     className="h-14 border-2 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 focus:ring-4 bg-white text-slate-900 placeholder:text-slate-400 rounded-2xl pr-14 text-base transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300"
//                   />
//                   <button
//                     type="button"
//                     className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-emerald-600 transition-colors duration-200"
//                     onClick={() => setShowPassword(!showPassword)}
//                   >
//                     {showPassword ? (
//                       <EyeOff className="h-5 w-5" />
//                     ) : (
//                       <Eye className="h-5 w-5" />
//                     )}
//                   </button>
//                 </div>
//                 {errors.password && (
//                   <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
//                 )}
//               </div>

//               {/* Remember Me & Forgot Password */}
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center">
//                   <input
//                     id="rememberMe"
//                     type="checkbox"
//                     className="h-4 w-4 text-emerald-600 focus:ring-emerald-500/30 focus:ring-4 border-slate-300 rounded transition-all duration-200"
//                     {...register('rememberMe')}
//                   />
//                   <label htmlFor="rememberMe" className="ml-2 block text-sm text-slate-700 font-medium">
//                     {t('auth.signin.rememberMe')}
//                   </label>
//                 </div>
//                 <Link
//                   href="/auth/forgot-password"
//                   className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold transition-colors duration-200 hover:underline"
//                 >
//                   {t('auth.signin.forgotPassword')}
//                 </Link>
//               </div>

//               {/* Sign In Button */}
//               <Button 
//                 type="submit" 
//                 className="w-full h-14 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-700 hover:via-teal-700 hover:to-blue-700 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] focus:ring-4 focus:ring-emerald-500/30 border border-white/20" 
//                 disabled={isLoading}
//               >
//                 {isLoading ? (
//                   <div className="flex items-center justify-center space-x-3">
//                     <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
//                     <span>{t('auth.signin.signingIn')}</span>
//                   </div>
//                 ) : (
//                   <div className="flex items-center justify-center space-x-2">
//                     <span>{t('auth.signin.signinButton')}</span>
//                     <LogIn className="w-4 h-4" />
//                   </div>
//                 )}
//               </Button>
//             </form>
            
//             {/* Divider */}
//             <div className="relative">
//               <div className="absolute inset-0 flex items-center">
//                 <span className="w-full border-t " />
//               </div>
//               <div className="relative flex justify-center text-xs uppercase">
//                 <span className="bg-white px-4 text-slate-500 font-semibold tracking-wider">{t('auth.signin.orContinue')}</span>
//               </div>
//             </div>
            
//             {/* Google Sign In */}
//             <Button
//               type="button"
//               variant="outline"
//               className="w-full h-14 border-2 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-slate-700 font-bold text-base rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] focus:ring-4 focus:ring-emerald-500/20 shadow-sm hover:shadow-md"
//               onClick={handleGoogleSignIn}
//               disabled={isGoogleLoading}
//             >
//               {isGoogleLoading ? (
//                 <div className="flex items-center justify-center space-x-3">
//                   <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
//                   <span>{t('auth.signin.connecting')}</span>
//                 </div>
//               ) : (
//                 <>
//                   <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
//                     <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
//                     <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
//                     <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
//                     <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
//                   </svg>
//                   {t('auth.signin.googleButton')}
//                 </>
//               )}
//             </Button>
//           </CardContent>
//         </Card>
        
//         {/* Sign Up Link */}
//         <div className="text-center mt-2">
//           <p className="text-slate-600 font-medium">
//             {t('auth.signin.noAccount')}{' '}
//             <Link 
//               href="/auth/signup" 
//               className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors duration-200 hover:underline"
//             >
//               {t('auth.signin.createAccount')}
//             </Link>
//           </p>
//         </div>

//         {/* Security Notice */}
//         <div className="text-center mt-2 text-xs text-slate-500">
//           <div className="flex items-center justify-center space-x-1">
//             <Shield className="w-3 h-3 text-emerald-600" />
//             <p className="font-medium">{t('auth.signin.security')}</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default function SignInPage() {
//   return (
//     <Suspense fallback={
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
//           <p className="text-slate-600 mt-4">Loading...</p>
//         </div>
//       </div>
//     }>
//       <SignInForm />
//     </Suspense>
//   )
// }

// app/auth/signin/page.js
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LogIn, Eye, EyeOff, Shield, DollarSign } from 'lucide-react'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'
import Link from 'next/link'

// Fallback components with display names
const LogoFallback = function LogoFallback() {
  return (
    <div className="flex items-center space-x-2">
      <DollarSign className="w-8 h-8 text-emerald-600" />
      <span className="text-2xl font-bold text-slate-800">WealthWise</span>
    </div>
  )
}

const LanguageSelectorFallback = function LanguageSelectorFallback() {
  return null
}

// Dynamically import Logo with fallback
const Logo = dynamic(() => import('@/components/ui/Logo').catch(() => LogoFallback), {
  loading: () => <div className="w-32 h-8 bg-slate-200 animate-pulse rounded"></div>,
  ssr: false
})

const LanguageSelector = dynamic(() => import('@/components/ui/LanguageSelector').catch(() => LanguageSelectorFallback), {
  ssr: false
})

function SignInForm() {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  const message = searchParams.get('message')
  const emailParam = searchParams.get('email')
  
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const signinSchema = z.object({
    email: z.string().email(t('auth.signin.emailRequired') || 'Valid email required'),
    password: z.string().min(1, t('auth.signin.passwordRequired') || 'Password required'),
    rememberMe: z.boolean().optional()
  })
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: emailParam || '',
      rememberMe: false
    }
  })

  useEffect(() => {
    if (message === 'registration-complete') {
      toast.success(t('auth.signin.registrationComplete') || 'Registration complete! Please sign in.', {
        duration: 5000,
        position: 'top-center',
      })
    }
  }, [message, t])

  const onSubmit = async (data) => {
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false
      })

      if (result?.error) {
        toast.error(t('auth.signin.invalidCredentials') || 'Invalid credentials')
      } else if (result?.ok) {
        toast.success(t('auth.signin.welcomeBack') || 'Welcome back!')
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (error) {
      console.error('Sign in error:', error)
      toast.error(t('auth.signin.networkError') || 'Network error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    
    try {
      await signIn('google', { 
        callbackUrl,
        redirect: true 
      })
    } catch (error) {
      console.error('Google sign-in exception:', error)
      toast.error(t('auth.signin.googleError') || 'Google sign-in failed')
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-emerald-200 to-teal-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-blue-200 to-indigo-200 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-r from-slate-100 to-blue-100 rounded-full blur-3xl"></div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-2 flex flex-col items-center">
          <div className="flex items-center space-x-4 mb-2">
            <Logo size="xlarge" textClassName="text-2xl" />
            <LanguageSelector variant="dashboard" />
          </div>
          <p className="text-slate-600 text-sm font-medium mt-2">
            {t('auth.signin.tagline') || 'Your Financial Journey Starts Here'}
          </p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-xl ring-1 ring-slate-200/50 rounded-3xl overflow-hidden">
          <CardHeader className="text-center pb-8 pt-8 bg-gradient-to-b from-slate-50/50 to-transparent">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-emerald-700 to-teal-700 bg-clip-text text-transparent mb-3">
              {t('auth.signin.title') || 'Welcome Back'}
            </CardTitle>
            <CardDescription className="text-slate-600 text-lg font-medium">
              {t('auth.signin.subtitle') || 'Sign in to your account'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-2 px-8 pb-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label 
                  htmlFor="email" 
                  className="text-sm font-semibold text-slate-700 block tracking-wide"
                >
                  {t('auth.signin.email') || 'Email'}
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('auth.signin.emailPlaceholder') || 'you@example.com'}
                  autoComplete="email"
                  disabled={isLoading}
                  {...register('email')}
                  className="h-14 border-2 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 focus:ring-4 bg-white text-slate-900 placeholder:text-slate-400 rounded-2xl text-base transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300"
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-2 font-medium">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label 
                  htmlFor="password" 
                  className="text-sm font-semibold text-slate-700 block tracking-wide"
                >
                  {t('auth.signin.password') || 'Password'}
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t('auth.signin.passwordPlaceholder') || '••••••••'}
                    autoComplete="current-password"
                    disabled={isLoading}
                    {...register('password')}
                    className="h-14 border-2 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 focus:ring-4 bg-white text-slate-900 placeholder:text-slate-400 rounded-2xl pr-14 text-base transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-emerald-600 transition-colors duration-200"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600 mt-1 font-medium">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    type="checkbox"
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500/30 focus:ring-4 border-slate-300 rounded transition-all duration-200"
                    {...register('rememberMe')}
                  />
                  <label htmlFor="rememberMe" className="ml-2 block text-sm text-slate-700 font-medium">
                    {t('auth.signin.rememberMe') || 'Remember me'}
                  </label>
                </div>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold transition-colors duration-200 hover:underline"
                >
                  {t('auth.signin.forgotPassword') || 'Forgot password?'}
                </Link>
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-700 hover:via-teal-700 hover:to-blue-700 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] focus:ring-4 focus:ring-emerald-500/30 border border-white/20" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{t('auth.signin.signingIn') || 'Signing in...'}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>{t('auth.signin.signinButton') || 'Sign In'}</span>
                    <LogIn className="w-5 h-5" />
                  </div>
                )}
              </Button>
            </form>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-4 text-slate-500 font-semibold tracking-wider">
                  {t('auth.signin.orContinue') || 'Or continue with'}
                </span>
              </div>
            </div>
            
            <Button
              type="button"
              variant="outline"
              className="w-full h-14 border-2 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-slate-700 font-bold text-base rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] focus:ring-4 focus:ring-emerald-500/20 shadow-sm hover:shadow-md"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>{t('auth.signin.connecting') || 'Connecting...'}</span>
                </div>
              ) : (
                <>
                  <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {t('auth.signin.googleButton') || 'Sign in with Google'}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
        
        <div className="text-center mt-6">
          <p className="text-slate-600 font-medium">
            {t('auth.signin.noAccount') || "Don't have an account?"}{' '}
            <Link 
              href="/auth/signup" 
              className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors duration-200 hover:underline"
            >
              {t('auth.signin.createAccount') || 'Create account'}
            </Link>
          </p>
        </div>

        <div className="text-center mt-4 text-xs text-slate-500">
          <div className="flex items-center justify-center space-x-1">
            <Shield className="w-3 h-3 text-emerald-600" />
            <p className="font-medium">{t('auth.signin.security') || 'Secure & encrypted'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

SignInForm.displayName = 'SignInForm'

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="text-slate-600 mt-4 font-medium">Loading...</p>
        </div>
      </div>
    }>
      <SignInForm />
    </Suspense>
  )
}