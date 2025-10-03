// 'use client'

// import { useState, useEffect } from 'react'
// import { useRouter, useSearchParams } from 'next/navigation'
// import { signIn } from 'next-auth/react'
// import { useForm } from 'react-hook-form'
// import { zodResolver } from '@hookform/resolvers/zod'
// import { z } from 'zod'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// import { LogIn, Eye, EyeOff } from 'lucide-react'
// import { toast } from 'sonner'
// import Link from 'next/link'

// const signinSchema = z.object({
//   email: z.string().email('Please enter a valid email address'),
//   password: z.string().min(1, 'Password is required'),
//   rememberMe: z.boolean().optional()
// })

// export default function SignInPage() {
//   const router = useRouter()
//   const searchParams = useSearchParams()
//   const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
//   const message = searchParams.get('message')
//   const emailParam = searchParams.get('email')
  
//   const [isLoading, setIsLoading] = useState(false)
//   const [showPassword, setShowPassword] = useState(false)
  
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
//       toast.success('🎉 Registration completed!', {
//         description: 'Welcome to WealthWise ! Please sign in to continue.',
//         duration: 6000
//       })
//     }
//   }, [message])

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
//         toast.error('Sign in failed', {
//           description: 'Invalid email or password. Please check your credentials and try again.'
//         })
//       } else {
//         toast.success('Welcome back!', {
//           description: 'You have been signed in successfully.'
//         })
//         router.push(callbackUrl)
//       }
//     } catch (error) {
//       toast.error('Network error', {
//         description: 'Please check your connection and try again.'
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   // Handle Google sign-in
//   const handleGoogleSignIn = async () => {
//     setIsLoading(true)
//     try {
//       await signIn('google', { callbackUrl })
//     } catch (error) {
//       toast.error('Google sign-in failed', {
//         description: 'Please try again.'
//       })
//       setIsLoading(false)
//     }
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
//       {/* Background decoration */}
//       <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-900 to-slate-900"></div>
//       <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
//       <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
//       <div className="absolute -bottom-8 left-20 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

//       <div className="max-w-md w-full space-y-8 relative z-10">
//         <Card className="w-full shadow-2xl border border-slate-700/50 bg-slate-800/90 backdrop-blur-xl ring-1 ring-slate-700/50 rounded-3xl overflow-hidden">
//           <CardHeader className="space-y-6 pb-8 pt-12 px-8 bg-gradient-to-b from-slate-800/50 to-transparent">
//             <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 rounded-3xl shadow-2xl ring-4 ring-white/10">
//               <LogIn className="w-10 h-10 text-white" />
//             </div>
//             <CardTitle className="text-4xl text-center font-bold bg-gradient-to-r from-white via-slate-200 to-white bg-clip-text text-transparent leading-tight">
//               Welcome back
//             </CardTitle>
//             <CardDescription className="text-center text-lg text-slate-400 font-medium">
//               Sign in to your WealthWise  account
//             </CardDescription>
//           </CardHeader>
          
//           <form onSubmit={handleSubmit(onSubmit)}>
//             <CardContent className="space-y-6 px-8">
//               <div className="space-y-3">
//                 <label htmlFor="email" className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
//                   Email Address
//                 </label>
//                 <Input
//                   id="email"
//                   type="email"
//                   placeholder="Enter your email"
//                   autoComplete="email"
//                   disabled={isLoading}
//                   {...register('email')}
//                   className="h-14 border-2 border-slate-600 focus:border-emerald-500 focus:ring-emerald-500/30 focus:ring-4 bg-slate-700/50 backdrop-blur-sm text-white placeholder:text-slate-400 rounded-2xl text-lg transition-all duration-300 shadow-inner"
//                 />
//                 {errors.email && (
//                   <p className="text-sm text-rose-400 font-medium mt-2">{errors.email.message}</p>
//                 )}
//               </div>

//               <div className="space-y-3">
//                 <label htmlFor="password" className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
//                   Password
//                 </label>
//                 <div className="relative">
//                   <Input
//                     id="password"
//                     type={showPassword ? "text" : "password"}
//                     placeholder="Enter your password"
//                     autoComplete="current-password"
//                     disabled={isLoading}
//                     {...register('password')}
//                     className="h-14 border-2 border-slate-600 focus:border-emerald-500 focus:ring-emerald-500/30 focus:ring-4 bg-slate-700/50 backdrop-blur-sm text-white placeholder:text-slate-400 rounded-2xl text-lg pr-14 transition-all duration-300 shadow-inner"
//                   />
//                   <button
//                     type="button"
//                     className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-emerald-400 transition-colors duration-200"
//                     onClick={() => setShowPassword(!showPassword)}
//                   >
//                     {showPassword ? (
//                       <EyeOff className="h-6 w-6" />
//                     ) : (
//                       <Eye className="h-6 w-6" />
//                     )}
//                   </button>
//                 </div>
//                 {errors.password && (
//                   <p className="text-sm text-rose-400 font-medium mt-2">{errors.password.message}</p>
//                 )}
//               </div>

//               <div className="flex items-center justify-between pt-2">
//                 <div className="flex items-center">
//                   <input
//                     id="rememberMe"
//                     type="checkbox"
//                     className="h-5 w-5 text-emerald-500 focus:ring-emerald-500/30 focus:ring-4 border-slate-600 bg-slate-700 rounded transition-all duration-200"
//                     {...register('rememberMe')}
//                   />
//                   <label htmlFor="rememberMe" className="ml-3 block text-sm text-slate-300 font-medium">
//                     Remember me
//                   </label>
//                 </div>
//                 <Link
//                   href="/auth/forgot-password"
//                   className="text-sm text-emerald-400 hover:text-emerald-300 font-semibold transition-colors duration-200 hover:underline"
//                 >
//                   Forgot password?
//                 </Link>
//               </div>
//             </CardContent>

//             <div className="px-8 pb-8 space-y-6">
//               <Button 
//                 type="submit" 
//                 className="w-full h-14 text-lg font-bold bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500 hover:from-emerald-600 hover:via-indigo-600 hover:to-purple-600 text-white shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 transform hover:scale-[1.02] focus:ring-4 focus:ring-emerald-500/30 rounded-2xl border border-white/10" 
//                 disabled={isLoading}
//               >
//                 {isLoading ? (
//                   <div className="flex items-center space-x-3">
//                     <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
//                     <span>Signing in...</span>
//                   </div>
//                 ) : (
//                   <span className="flex items-center justify-center space-x-2">
//                     <span>Sign in</span>
//                     <LogIn className="w-5 h-5" />
//                   </span>
//                 )}
//               </Button>
              
//               <div className="relative">
//                 <div className="absolute inset-0 flex items-center">
//                   <span className="w-full border-t border-slate-600" />
//                 </div>
//                 <div className="relative flex justify-center text-xs uppercase">
//                   <span className="bg-slate-800 px-6 text-slate-400 font-bold tracking-wider">Or continue with</span>
//                 </div>
//               </div>
              
//               <Button
//                 type="button"
//                 variant="outline"
//                 className="w-full h-14 border-2 border-slate-600 hover:border-emerald-500 hover:bg-slate-700/50 text-slate-300 hover:text-white transition-all duration-300 focus:ring-4 focus:ring-emerald-500/30 rounded-2xl font-semibold bg-slate-700/30 backdrop-blur-sm"
//                 onClick={handleGoogleSignIn}
//                 disabled={isLoading}
//               >
//                 <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
//                   <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
//                   <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
//                   <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
//                   <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
//                 </svg>
//                 Continue with Google
//               </Button>
//             </div>
//           </form>
//         </Card>
        
//         <div className="text-center">
//           <p className="text-slate-400 font-medium">
//             Don't have an account?{' '}
//             <Link href="/auth/signup" className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors duration-200 hover:underline">
//               Sign up
//             </Link>
//           </p>
//         </div>
//       </div>

//       <style jsx>{`
//         @keyframes blob {
//           0% {
//             transform: translate(0px, 0px) scale(1);
//           }
//           33% {
//             transform: translate(30px, -50px) scale(1.1);
//           }
//           66% {
//             transform: translate(-20px, 20px) scale(0.9);
//           }
//           100% {
//             transform: translate(0px, 0px) scale(1);
//           }
//         }
//         .animate-blob {
//           animation: blob 7s infinite;
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

// // app/auth/signin/page.js
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
import { LogIn, Eye, EyeOff, Shield, AlertCircle } from 'lucide-react'
import Logo from '@/components/ui/Logo'
import LanguageSelector from '@/components/ui/LanguageSelector'
import toast from 'react-hot-toast'
import Link from 'next/link'

function SignInForm() {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  const message = searchParams.get('message')
  const emailParam = searchParams.get('email')
  const errorParam = searchParams.get('error') // Check for OAuth errors
  
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [googleError, setGoogleError] = useState(null)

  const signinSchema = z.object({
    email: z.string().email(t('auth.signin.emailRequired')),
    password: z.string().min(1, t('auth.signin.passwordRequired')),
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

  // Show welcome message if redirected from registration
  useEffect(() => {
    if (message === 'registration-complete') {
      toast.success(t('auth.signin.registrationComplete'), {
        duration: 5000,
        position: 'top-center',
      })
    }
    
    // Handle OAuth errors
    if (errorParam) {
      const errorMessages = {
        'Configuration': 'OAuth configuration error. Please contact support.',
        'AccessDenied': 'Access was denied. Please try again.',
        'Verification': 'Verification failed. Please try again.',
        'OAuthSignin': 'Error connecting to Google. Please try again.',
        'OAuthCallback': 'OAuth callback error. Please try again.',
        'OAuthCreateAccount': 'Could not create account. Email may already be in use.',
        'EmailCreateAccount': 'Could not create account with this email.',
        'Callback': 'Authentication callback error.',
        'OAuthAccountNotLinked': 'This email is already linked to another account.',
        'EmailSignin': 'Could not send sign-in email.',
        'CredentialsSignin': 'Invalid credentials.',
        'SessionRequired': 'Session required. Please sign in.',
      }
      
      const errorMessage = errorMessages[errorParam] || 'An authentication error occurred.'
      setGoogleError(errorMessage)
      toast.error(errorMessage, { duration: 6000 })
    }
  }, [message, errorParam, t])

  // Handle form submission
  const onSubmit = async (data) => {
    setIsLoading(true)
    setGoogleError(null)

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false
      })

      if (result?.error) {
        toast.error(t('auth.signin.invalidCredentials'))
      } else {
        toast.success(t('auth.signin.welcomeBack'))
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (error) {
      console.error('Sign in error:', error)
      toast.error(t('auth.signin.networkError'))
    } finally {
      setIsLoading(false)
    }
  }

  // Enhanced Google sign-in with better error handling
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    setGoogleError(null)
    
    try {
      const result = await signIn('google', { 
        callbackUrl,
        redirect: true // Let NextAuth handle redirect
      })
      
      // This code only runs if redirect is false or if there's an error
      if (result?.error) {
        setGoogleError('Failed to sign in with Google. Please try again.')
        toast.error('Google sign-in failed. Please try again.')
        setIsGoogleLoading(false)
      }
    } catch (error) {
      console.error('Google sign-in error:', error)
      setGoogleError('An unexpected error occurred. Please try again.')
      toast.error(t('auth.signin.googleError'))
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50 flex items-center justify-center p-4">
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
          <p className="text-slate-600 text-sm font-medium mt-2">{t('auth.signin.tagline')}</p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-xl ring-1 ring-slate-200/50 rounded-3xl overflow-hidden">
          <CardHeader className="text-center pb-8 pt-8 bg-gradient-to-b from-slate-50/50 to-transparent">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-emerald-700 to-teal-700 bg-clip-text text-transparent mb-3">
              {t('auth.signin.title')}
            </CardTitle>
            <CardDescription className="text-slate-600 text-lg font-medium">
              {t('auth.signin.subtitle')}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-2 px-8 pb-8">
            {/* Google OAuth Error Alert */}
            {googleError && (
              <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-800 mb-1">
                      Authentication Error
                    </p>
                    <p className="text-sm text-red-700">{googleError}</p>
                  </div>
                </div>
                
                {/* Troubleshooting tips */}
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs font-semibold text-blue-800 mb-2">
                    Troubleshooting:
                  </p>
                  <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                    <li>Disable ad blockers or privacy extensions</li>
                    <li>Try in incognito/private mode</li>
                    <li>Enable third-party cookies in browser settings</li>
                    <li>Clear browser cache and try again</li>
                  </ul>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label 
                  htmlFor="email" 
                  className="text-sm font-semibold text-slate-700 block tracking-wide"
                >
                  {t('auth.signin.email')}
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('auth.signin.emailPlaceholder')}
                  autoComplete="email"
                  disabled={isLoading}
                  {...register('email')}
                  className="h-14 border-2 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 focus:ring-4 bg-white text-slate-900 placeholder:text-slate-400 rounded-2xl text-base transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300"
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-2 font-medium">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label 
                  htmlFor="password" 
                  className="text-sm font-semibold text-slate-700 block tracking-wide"
                >
                  {t('auth.signin.password')}
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t('auth.signin.passwordPlaceholder')}
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
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    type="checkbox"
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500/30 focus:ring-4 border-slate-300 rounded transition-all duration-200"
                    {...register('rememberMe')}
                  />
                  <label htmlFor="rememberMe" className="ml-2 block text-sm text-slate-700 font-medium">
                    {t('auth.signin.rememberMe')}
                  </label>
                </div>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold transition-colors duration-200 hover:underline"
                >
                  {t('auth.signin.forgotPassword')}
                </Link>
              </div>

              {/* Sign In Button */}
              <Button 
                type="submit" 
                className="w-full h-14 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-700 hover:via-teal-700 hover:to-blue-700 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] focus:ring-4 focus:ring-emerald-500/30 border border-white/20" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{t('auth.signin.signingIn')}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>{t('auth.signin.signinButton')}</span>
                    <LogIn className="w-4 h-4" />
                  </div>
                )}
              </Button>
            </form>
            
            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t " />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-4 text-slate-500 font-semibold tracking-wider">{t('auth.signin.orContinue')}</span>
              </div>
            </div>
            
            {/* Google Sign In */}
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
                  <span>{t('auth.signin.connecting')}</span>
                </div>
              ) : (
                <>
                  <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {t('auth.signin.googleButton')}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
        
        {/* Sign Up Link */}
        <div className="text-center mt-2">
          <p className="text-slate-600 font-medium">
            {t('auth.signin.noAccount')}{' '}
            <Link 
              href="/auth/signup" 
              className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors duration-200 hover:underline"
            >
              {t('auth.signin.createAccount')}
            </Link>
          </p>
        </div>

        {/* Security Notice */}
        <div className="text-center mt-2 text-xs text-slate-500">
          <div className="flex items-center justify-center space-x-1">
            <Shield className="w-3 h-3 text-emerald-600" />
            <p className="font-medium">{t('auth.signin.security')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="text-slate-600 mt-4">Loading...</p>
        </div>
      </div>
    }>
      <SignInForm />
    </Suspense>
  )
}