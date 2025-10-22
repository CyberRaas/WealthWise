// 'use client'

// import { useState } from 'react'
// import { useForm } from 'react-hook-form'
// import { zodResolver } from '@hookform/resolvers/zod'
// import { z } from 'zod'
// import { useRouter } from 'next/navigation'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// import { UserPlus, Eye, EyeOff, Mail, ArrowLeft, Check } from 'lucide-react'
// import { toast } from 'sonner'
// import Link from 'next/link'

// // Schema for signup form
// const signupSchema = z.object({
//   name: z.string()
//     .min(2, 'Name must be at least 2 characters')
//     .max(50, 'Name must be less than 50 characters')
//     .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
//   email: z.string()
//     .email('Please enter a valid email address')
//     .toLowerCase(),
//   password: z.string()
//     .min(8, 'Password must be at least 8 characters')
//     .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
//   confirmPassword: z.string()
// }).refine(data => data.password === data.confirmPassword, {
//   message: "Passwords don't match",
//   path: ["confirmPassword"],
// })

// // Schema for OTP verification
// const otpSchema = z.object({
//   otp: z.string()
//     .length(6, 'OTP must be exactly 6 digits')
//     .regex(/^\d{6}$/, 'OTP must contain only numbers')
// })

// export default function SignUpPage() {
//   const [step, setStep] = useState('signup') // 'signup' or 'otp'
//   const [userData, setUserData] = useState(null)
//   const [isLoading, setIsLoading] = useState(false)
//   const [showPassword, setShowPassword] = useState(false)
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false)
//   const [otpTimer, setOtpTimer] = useState(0)
//   const router = useRouter()

//   // Form for signup
//   const signupForm = useForm({
//     resolver: zodResolver(signupSchema),
//     defaultValues: {
//       name: '',
//       email: '',
//       password: '',
//       confirmPassword: ''
//     }
//   })

//   // Form for OTP
//   const otpForm = useForm({
//     resolver: zodResolver(otpSchema),
//     defaultValues: {
//       otp: ''
//     }
//   })

//   // Handle signup form submission
//   const onSignupSubmit = async (data) => {
//     setIsLoading(true)

//     try {
//       const response = await fetch('/api/auth/send-otp', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           email: data.email,
//           type: 'registration'
//         })
//       })

//       const result = await response.json()

//       if (response.ok) {
//         setUserData(data)
//         setStep('otp')
//         setOtpTimer(300) // 5 minutes
//         startTimer()

//         toast.success('OTP Sent!', {
//           description: `A 6-digit verification code has been sent to ${data.email}`,
//           duration: 4000
//         })
//       } else {
//         toast.error('Failed to send OTP', {
//           description: result.message || 'Please try again'
//         })
//       }
//     } catch (error) {
//       toast.error('Network error', {
//         description: 'Please check your connection and try again'
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   // Handle OTP verification
//   const onOtpSubmit = async (data) => {
//     setIsLoading(true)

//     try {
//       // First verify OTP
//       const verifyResponse = await fetch('/api/auth/verify-otp', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           email: userData.email,
//           otp: data.otp,
//           type: 'registration'
//         })
//       })

//       const verifyResult = await verifyResponse.json()

//       if (verifyResponse.ok) {
//         // Now register the user
//         const registerResponse = await fetch('/api/auth/register', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             name: userData.name,
//             email: userData.email,
//             password: userData.password,
//             otp: data.otp
//           })
//         })

//         const registerResult = await registerResponse.json()

//         if (registerResponse.ok) {
//           toast.success('🎉 Registration Successful!', {
//             description: 'Your account has been created. Please sign in to continue.',
//             duration: 5000
//           })

//           // Redirect to signin page
//           router.push(`/auth/signin?email=${encodeURIComponent(userData.email)}&message=registration-complete`)
//         } else {
//           toast.error('Registration failed', {
//             description: registerResult.message || 'Please try again'
//           })
//         }
//       } else {
//         toast.error('Invalid OTP', {
//           description: verifyResult.message || 'Please check the code and try again'
//         })
//       }
//     } catch (error) {
//       toast.error('Network error', {
//         description: 'Please check your connection and try again'
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   // Timer functionality
//   const startTimer = () => {
//     const interval = setInterval(() => {
//       setOtpTimer((prev) => {
//         if (prev <= 1) {
//           clearInterval(interval)
//           return 0
//         }
//         return prev - 1
//       })
//     }, 1000)
//   }

//   // Resend OTP
//   const handleResendOtp = async () => {
//     if (otpTimer > 0) return

//     setIsLoading(true)
//     try {
//       const response = await fetch('/api/auth/send-otp', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           email: userData.email,
//           type: 'registration'
//         })
//       })

//       if (response.ok) {
//         setOtpTimer(300)
//         startTimer()
//         toast.success('OTP Resent!', {
//           description: 'A new verification code has been sent to your email'
//         })
//       } else {
//         toast.error('Failed to resend OTP', {
//           description: 'Please try again'
//         })
//       }
//     } catch (error) {
//       toast.error('Network error', {
//         description: 'Please try again'
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   // Format timer display
//   const formatTime = (seconds) => {
//     const mins = Math.floor(seconds / 60)
//     const secs = seconds % 60
//     return `${mins}:${secs.toString().padStart(2, '0')}`
//   }
//   // Signup form UI
//   if (step === 'signup') {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
//         {/* Background decoration */}
//         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-900 to-slate-900"></div>
//         <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
//         <div className="absolute top-0 -right-4 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
//         <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

//         <div className="max-w-md w-full space-y-8 relative z-10">
//           <Card className="w-full shadow-2xl border border-slate-700/50 bg-slate-800/90 backdrop-blur-xl ring-1 ring-slate-700/50 rounded-3xl overflow-hidden">
//             <CardHeader className="space-y-6 pb-8 pt-12 px-8 bg-gradient-to-b from-slate-800/50 to-transparent">
//               <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500 rounded-3xl shadow-2xl ring-4 ring-white/10">
//                 <UserPlus className="w-10 h-10 text-white" />
//               </div>
//               <CardTitle className="text-4xl text-center font-bold bg-gradient-to-r from-white via-slate-200 to-white bg-clip-text text-transparent leading-tight">
//                 Create Account
//               </CardTitle>
//               <CardDescription className="text-center text-lg text-slate-400 font-medium">
//                 Join WealthWise  and start your journey
//               </CardDescription>
//             </CardHeader>

//             <form onSubmit={signupForm.handleSubmit(onSignupSubmit)}>
//               <CardContent className="space-y-6 px-8">
//                 <div className="space-y-3">
//                   <label htmlFor="name" className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
//                     Full Name
//                   </label>
//                   <Input
//                     id="name"
//                     type="text"
//                     placeholder="Enter your full name"
//                     autoComplete="name"
//                     disabled={isLoading}
//                     {...signupForm.register('name')}
//                     className="h-14 border-2 border-slate-600 focus:border-emerald-500 focus:ring-emerald-500/30 focus:ring-4 bg-slate-700/50 backdrop-blur-sm text-white placeholder:text-slate-400 rounded-2xl text-lg transition-all duration-300 shadow-inner"
//                   />
//                   {signupForm.formState.errors.name && (
//                     <p className="text-sm text-rose-400 font-medium mt-2">{signupForm.formState.errors.name.message}</p>
//                   )}
//                 </div>

//                 <div className="space-y-3">
//                   <label htmlFor="email" className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
//                     Email Address
//                   </label>
//                   <Input
//                     id="email"
//                     type="email"
//                     placeholder="Enter your email"
//                     autoComplete="email"
//                     disabled={isLoading}
//                     {...signupForm.register('email')}
//                     className="h-14 border-2 border-slate-600 focus:border-emerald-500 focus:ring-emerald-500/30 focus:ring-4 bg-slate-700/50 backdrop-blur-sm text-white placeholder:text-slate-400 rounded-2xl text-lg transition-all duration-300 shadow-inner"
//                   />
//                   {signupForm.formState.errors.email && (
//                     <p className="text-sm text-rose-400 font-medium mt-2">{signupForm.formState.errors.email.message}</p>
//                   )}
//                 </div>

//                 <div className="space-y-3">
//                   <label htmlFor="password" className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
//                     Password
//                   </label>
//                   <div className="relative">
//                     <Input
//                       id="password"
//                       type={showPassword ? "text" : "password"}
//                       placeholder="Create a strong password"
//                       autoComplete="new-password"
//                       disabled={isLoading}
//                       {...signupForm.register('password')}
//                       className="h-14 border-2 border-slate-600 focus:border-emerald-500 focus:ring-emerald-500/30 focus:ring-4 bg-slate-700/50 backdrop-blur-sm text-white placeholder:text-slate-400 rounded-2xl text-lg pr-14 transition-all duration-300 shadow-inner"
//                     />
//                     <button
//                       type="button"
//                       className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-emerald-400 transition-colors duration-200"
//                       onClick={() => setShowPassword(!showPassword)}
//                     >
//                       {showPassword ? (
//                         <EyeOff className="h-6 w-6" />
//                       ) : (
//                         <Eye className="h-6 w-6" />
//                       )}
//                     </button>
//                   </div>
//                   {signupForm.formState.errors.password && (
//                     <p className="text-sm text-rose-400 font-medium mt-2">{signupForm.formState.errors.password.message}</p>
//                   )}
//                 </div>

//                 <div className="space-y-3">
//                   <label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
//                     Confirm Password
//                   </label>
//                   <div className="relative">
//                     <Input
//                       id="confirmPassword"
//                       type={showConfirmPassword ? "text" : "password"}
//                       placeholder="Confirm your password"
//                       autoComplete="new-password"
//                       disabled={isLoading}
//                       {...signupForm.register('confirmPassword')}
//                       className="h-14 border-2 border-slate-600 focus:border-emerald-500 focus:ring-emerald-500/30 focus:ring-4 bg-slate-700/50 backdrop-blur-sm text-white placeholder:text-slate-400 rounded-2xl text-lg pr-14 transition-all duration-300 shadow-inner"
//                     />
//                     <button
//                       type="button"
//                       className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-emerald-400 transition-colors duration-200"
//                       onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                     >
//                       {showConfirmPassword ? (
//                         <EyeOff className="h-6 w-6" />
//                       ) : (
//                         <Eye className="h-6 w-6" />
//                       )}
//                     </button>
//                   </div>
//                   {signupForm.formState.errors.confirmPassword && (
//                     <p className="text-sm text-rose-400 font-medium mt-2">{signupForm.formState.errors.confirmPassword.message}</p>
//                   )}
//                 </div>
//               </CardContent>

//               <div className="px-8 pb-8 space-y-6">
//                 <Button 
//                   type="submit" 
//                   className="w-full h-14 text-lg font-bold bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500 hover:from-emerald-600 hover:via-indigo-600 hover:to-purple-600 text-white shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 transform hover:scale-[1.02] focus:ring-4 focus:ring-emerald-500/30 rounded-2xl border border-white/10" 
//                   disabled={isLoading}
//                 >
//                   {isLoading ? (
//                     <div className="flex items-center space-x-3">
//                       <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
//                       <span>Sending OTP...</span>
//                     </div>
//                   ) : (
//                     <span className="flex items-center justify-center space-x-2">
//                       <span>Create Account</span>
//                       <UserPlus className="w-5 h-5" />
//                     </span>
//                   )}
//                 </Button>
//               </div>
//             </form>
//           </Card>

//           <div className="text-center">
//             <p className="text-slate-400 font-medium">
//               Already have an account?{' '}
//               <Link href="/auth/signin" className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors duration-200 hover:underline">
//                 Sign in
//               </Link>
//             </p>
//           </div>

//           <style jsx>{`
//             @keyframes blob {
//               0% {
//                 transform: translate(0px, 0px) scale(1);
//               }
//               33% {
//                 transform: translate(30px, -50px) scale(1.1);
//               }
//               66% {
//                 transform: translate(-20px, 20px) scale(0.9);
//               }
//               100% {
//                 transform: translate(0px, 0px) scale(1);
//               }
//             }
//             .animate-blob {
//               animation: blob 7s infinite;
//             }
//             .animation-delay-2000 {
//               animation-delay: 2s;
//             }
//             .animation-delay-4000 {
//               animation-delay: 4s;
//             }
//           `}</style>
//         </div>
//       </div>
//     )
//   }

//   // OTP verification UI
//   if (step === 'otp') {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
//         {/* Background decoration */}
//         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-900 to-slate-900"></div>
//         <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
//         <div className="absolute top-0 -right-4 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
//         <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

//         <div className="max-w-md w-full space-y-8 relative z-10">
//           <Card className="w-full shadow-2xl border border-slate-700/50 bg-slate-800/90 backdrop-blur-xl ring-1 ring-slate-700/50 rounded-3xl overflow-hidden">
//             <CardHeader className="space-y-6 pb-8 pt-12 px-8 bg-gradient-to-b from-slate-800/50 to-transparent">
//               <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500 rounded-3xl shadow-2xl ring-4 ring-white/10">
//                 <Mail className="w-10 h-10 text-white" />
//               </div>
//               <CardTitle className="text-4xl text-center font-bold bg-gradient-to-r from-white via-slate-200 to-white bg-clip-text text-transparent leading-tight">
//                 Verify Your Email
//               </CardTitle>
//               <CardDescription className="text-center text-lg text-slate-400 font-medium">
//                 Enter the 6-digit code sent to<br />
//                 <span className="font-bold text-slate-200">{userData?.email}</span>
//               </CardDescription>
//             </CardHeader>

//             <form onSubmit={otpForm.handleSubmit(onOtpSubmit)}>
//               <CardContent className="space-y-8 px-8">
//                 <div className="space-y-4">
//                   <label htmlFor="otp" className="text-sm font-semibold text-slate-300 uppercase tracking-wider text-center block">
//                     Verification Code
//                   </label>
//                   <Input
//                     id="otp"
//                     type="text"
//                     placeholder="Enter 6-digit code"
//                     maxLength={6}
//                     className="text-center text-3xl font-bold tracking-[0.5em] h-16 border-2 border-slate-600 focus:border-emerald-500 focus:ring-emerald-500/30 focus:ring-4 bg-slate-700/50 backdrop-blur-sm text-white placeholder:text-slate-400 rounded-2xl transition-all duration-300 shadow-inner"
//                     disabled={isLoading}
//                     {...otpForm.register('otp')}
//                   />
//                   {otpForm.formState.errors.otp && (
//                     <p className="text-sm text-rose-400 font-medium text-center">{otpForm.formState.errors.otp.message}</p>
//                   )}
//                 </div>

//                 {otpTimer > 0 && (
//                   <div className="text-center">
//                     <p className="text-sm text-slate-400 font-medium">
//                       Resend code in <span className="text-emerald-400 font-bold">{formatTime(otpTimer)}</span>
//                     </p>
//                   </div>
//                 )}

//                 {otpTimer === 0 && (
//                   <div className="text-center">
//                     <button
//                       type="button"
//                       onClick={handleResendOtp}
//                       disabled={isLoading}
//                       className="text-sm text-emerald-400 hover:text-emerald-300 font-bold transition-colors duration-200 hover:underline bg-slate-700/30 px-4 py-2 rounded-lg"
//                     >
//                       Resend verification code
//                     </button>
//                   </div>
//                 )}
//               </CardContent>

//               <div className="px-8 pb-8 space-y-6">
//                 <Button 
//                   type="submit" 
//                   className="w-full h-14 text-lg font-bold bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500 hover:from-emerald-600 hover:via-indigo-600 hover:to-purple-600 text-white shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 transform hover:scale-[1.02] focus:ring-4 focus:ring-emerald-500/30 rounded-2xl border border-white/10" 
//                   disabled={isLoading}
//                 >
//                   {isLoading ? (
//                     <div className="flex items-center space-x-3">
//                       <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
//                       <span>Verifying...</span>
//                     </div>
//                   ) : (
//                     <span className="flex items-center justify-center space-x-2">
//                       <span>Verify & Complete Registration</span>
//                       <Mail className="w-5 h-5" />
//                     </span>
//                   )}
//                 </Button>

//                 <Button
//                   type="button"
//                   variant="ghost"
//                   onClick={() => setStep('signup')}
//                   className="w-full text-slate-400 hover:text-slate-200 hover:bg-slate-700/30 rounded-2xl transition-all duration-200 h-12 font-semibold"
//                   disabled={isLoading}
//                 >
//                   <ArrowLeft className="w-5 h-5 mr-2" />
//                   Back to registration
//                 </Button>
//               </div>
//             </form>
//           </Card>

//           <style jsx>{`
//             @keyframes blob {
//               0% {
//                 transform: translate(0px, 0px) scale(1);
//               }
//               33% {
//                 transform: translate(30px, -50px) scale(1.1);
//               }
//               66% {
//                 transform: translate(-20px, 20px) scale(0.9);
//               }
//               100% {
//                 transform: translate(0px, 0px) scale(1);
//               }
//             }
//             .animate-blob {
//               animation: blob 7s infinite;
//             }
//             .animation-delay-2000 {
//               animation-delay: 2s;
//             }
//             .animation-delay-4000 {
//               animation-delay: 4s;
//             }
//           `}</style>
//         </div>
//       </div>
//     )
//   }

//   return null
// }


'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UserPlus, Eye, EyeOff, Mail, ArrowLeft, Shield } from 'lucide-react'
import Logo from '@/components/ui/Logo'
import LanguageSelector from '@/components/ui/LanguageSelector'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function SignUpPage() {
  const { t } = useTranslation()
  const [step, setStep] = useState('signup') // 'signup' or 'otp'
  const [userData, setUserData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [otpTimer, setOtpTimer] = useState(0)
  const router = useRouter()

  // Schema for signup form
  const signupSchema = z.object({
    name: z.string()
      .min(2, t('validation.nameMinLength'))
      .max(50, t('validation.nameMaxLength'))
      .regex(/^[a-zA-Z\s]+$/, t('validation.nameInvalidChars')),
    email: z.string()
      .email(t('validation.emailInvalid'))
      .toLowerCase(),
    password: z.string()
      .min(8, t('validation.passwordMinLength'))
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, t('validation.passwordComplexity')),
    confirmPassword: z.string(),
    acceptPrivacyPolicy: z.boolean()
      .refine(val => val === true, {
        message: 'You must accept the Privacy Policy to continue'
      })
  }).refine(data => data.password === data.confirmPassword, {
    message: t('validation.passwordsNoMatch'),
    path: ["confirmPassword"],
  })

  // Schema for OTP verification
  const otpSchema = z.object({
    otp: z.string()
      .length(6, t('validation.otpLength'))
      .regex(/^\d{6}$/, t('validation.otpNumbers'))
  })

  // Form for signup
  const signupForm = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptPrivacyPolicy: false
    }
  })

  // Form for OTP
  const otpForm = useForm({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: ''
    }
  })

  // Handle signup form submission
  const onSignupSubmit = async (data) => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          type: 'registration',
          name: data.name // Include name for personalized email
        })
      })

      const result = await response.json()

      if (response.ok) {
        setUserData(data)
        setStep('otp')
        setOtpTimer(300) // 5 minutes
        startTimer()

        toast.success(`${t('toast.otpSent')} ${data.email}`, {
          duration: 4000
        })
      } else {
        toast.error(`${t('toast.otpSendFailed')} ${result.message || t('common.error')}`)
      }
    } catch (error) {
      toast.error(t('toast.networkError'))
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
          toast.success(t('toast.registrationSuccess'), {
            duration: 5000
          })

          // Redirect to signin page
          router.push(`/auth/signin?email=${encodeURIComponent(userData.email)}&message=registration-complete`)
        } else {
          toast.error(`${t('toast.registrationFailed')} ${registerResult.message || ''}`)
        }
      } else {
        toast.error(`${t('toast.invalidOtp')} ${verifyResult.message || ''}`)
      }
    } catch (error) {
      toast.error(t('toast.networkError'))
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
          type: 'registration',
          name: userData.name // Include name for personalized email
        })
      })

      if (response.ok) {
        setOtpTimer(300)
        startTimer()
        toast.success(t('toast.otpResent'))
      } else {
        toast.error(t('toast.otpResendFailed'))
      }
    } catch (error) {
      toast.error(t('toast.networkError'))
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50 flex items-center justify-center p-4">
        {/* Elegant background decoration */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-emerald-200 to-teal-200 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-blue-200 to-indigo-200 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-r from-slate-100 to-blue-100 rounded-full blur-3xl"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          {/* Company Logo/Brand Area */}
          <div className="text-center mb-8 flex flex-col justify-center items-center">
            <div className="flex items-center space-x-4 mb-2">
              <Logo size="xlarge" textClassName="text-2xl" />
              <LanguageSelector variant="dashboard" />
            </div>
            <p className="text-slate-600 text-sm font-medium mt-2">{t('auth.signup.tagline')}</p>
          </div>

          <Card className="shadow-2xl border border-emerald-100/50 bg-white/90 backdrop-blur-xl ring-1 ring-white/20">
            <CardHeader className="text-center pb-2 bg-gradient-to-b from-emerald-50/30 to-transparent">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-emerald-700 to-teal-700 bg-clip-text text-transparent mb-2">
                {t('auth.signup.title')}
              </CardTitle>
              <CardDescription className="text-slate-600 text-base font-medium">
                {t('auth.signup.subtitle')}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-5">
                {/* Name Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="text-sm font-medium text-slate-700 block"
                  >
                    {t('auth.signup.fullName')}
                  </label>
                  <Input
                    id="name"
                    type="text"
                    placeholder={t('auth.signup.fullNamePlaceholder')}
                    autoComplete="name"
                    disabled={isLoading}
                    {...signupForm.register('name')}
                    className="h-12 border-2 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/30 focus:ring-4 bg-white/80 backdrop-blur-sm text-slate-900 placeholder:text-slate-400 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
                  />
                  {signupForm.formState.errors.name && (
                    <p className="text-sm text-red-600 mt-1">{signupForm.formState.errors.name.message}</p>
                  )}
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-slate-700 block"
                  >
                    {t('auth.signup.email')}
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('auth.signup.emailPlaceholder')}
                    autoComplete="email"
                    disabled={isLoading}
                    {...signupForm.register('email')}
                    className="h-12 border-2 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/30 focus:ring-4 bg-white/80 backdrop-blur-sm text-slate-900 placeholder:text-slate-400 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
                  />
                  {signupForm.formState.errors.email && (
                    <p className="text-sm text-red-600 mt-1">{signupForm.formState.errors.email.message}</p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-slate-700 block"
                  >
                    {t('auth.signup.password')}
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={t('auth.signup.passwordPlaceholder')}
                      autoComplete="new-password"
                      disabled={isLoading}
                      {...signupForm.register('password')}
                      className="h-12 border-2 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/30 focus:ring-4 bg-white/80 backdrop-blur-sm text-slate-900 placeholder:text-slate-400 rounded-xl pr-12 transition-all duration-300 shadow-sm hover:shadow-md"
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
                    <p className="text-sm text-red-600 mt-1">{signupForm.formState.errors.password.message}</p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium text-slate-700 block"
                  >
                    {t('auth.signup.confirmPassword')}
                  </label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder={t('auth.signup.confirmPasswordPlaceholder')}
                      autoComplete="new-password"
                      disabled={isLoading}
                      {...signupForm.register('confirmPassword')}
                      className="h-12 border-2 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/30 focus:ring-4 bg-white/80 backdrop-blur-sm text-slate-900 placeholder:text-slate-400 rounded-xl pr-12 transition-all duration-300 shadow-sm hover:shadow-md"
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
                    <p className="text-sm text-red-600 mt-1">{signupForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Privacy Policy Checkbox */}
                <div className="space-y-2 ">
                  <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border-2 border-slate-200 hover:border-emerald-200 transition-colors">
                    <input
                      id="acceptPrivacyPolicy"
                      type="checkbox"
                      disabled={isLoading}
                      {...signupForm.register('acceptPrivacyPolicy')}
                      className="mt-1 h-5 w-5 rounded border-2 border-slate-300 text-emerald-600 focus:ring-4 focus:ring-emerald-500/30 cursor-pointer transition-all"
                    />
                    <label
                      htmlFor="acceptPrivacyPolicy"
                      className="text-sm text-slate-700 leading-relaxed cursor-pointer select-none"
                    >
                      I agree to the{' '}
                      <Link
                        href="/privacy-policy"
                        target="_blank"
                        className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
                      >
                        Privacy Policy
                      </Link>
                      {' '}
                    </label>
                  </div>
                  {signupForm.formState.errors.acceptPrivacyPolicy && (
                    <p className="text-sm text-red-600 font-medium mt-2 flex items-center gap-1">
                      <Shield className="w-4 h-4" />
                      {signupForm.formState.errors.acceptPrivacyPolicy.message}
                    </p>
                  )}
                </div>

                {/* Create Account Button */}
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-emerald-600 via-teal-600 to-teal-500 hover:from-emerald-700 hover:via-teal-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] focus:ring-4 focus:ring-emerald-500/30 border border-white/20  disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={isLoading || !signupForm.watch('acceptPrivacyPolicy')}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{t('auth.signup.sendingVerification')}</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <span>{t('auth.signup.createAccount')}</span>
                      <UserPlus className="w-4 h-4" />
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Sign In Link */}
          <div className="text-center mt-6">
            <p className="text-slate-600 font-medium">
              {t('auth.signup.alreadyHaveAccount')}{' '}
              <Link
                href="/auth/signin"
                className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors duration-200 hover:underline"
              >
                {t('auth.signup.signIn')}
              </Link>
            </p>
          </div>

          {/* Security Notice */}
          <div className="text-center mt-8 text-xs text-slate-500">
            <div className="flex items-center justify-center space-x-1">
              <Shield className="w-3 h-3 text-emerald-600" />
              <p className="font-medium">{t('auth.signup.securityNotice')}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // OTP verification UI
  if (step === 'otp') {
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
          <div className="text-center mb-8 flex flex-col items-center justify-center">
            <Logo size="xlarge" textClassName="text-2xl" />
            <h2 className="text-xl font-bold text-slate-800 mt-4 mb-2">{t('auth.otp.emailVerification')}</h2>
            <p className="text-slate-600 text-sm font-medium">{t('auth.otp.completeSetup')}</p>
          </div>

          <Card className="shadow-2xl border border-emerald-100/50 bg-white/90 backdrop-blur-xl ring-1 ring-white/20">
            <CardHeader className="text-center pb-6 bg-gradient-to-b from-emerald-50/30 to-transparent">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-emerald-700 to-teal-700 bg-clip-text text-transparent mb-2">
                {t('auth.otp.verifyYourEmail')}
              </CardTitle>
              <CardDescription className="text-slate-600 text-base font-medium">
                {t('auth.otp.enterCode')}<br />
                <span className="font-bold text-emerald-700">{userData?.email}</span>
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-6">
                <div className="space-y-3">
                  <label
                    htmlFor="otp"
                    className="text-sm font-medium text-slate-700 block text-center"
                  >
                    {t('auth.otp.verificationCode')}
                  </label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    className="text-center text-2xl font-bold tracking-[0.3em] h-14 border-2 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/30 focus:ring-4 bg-white/80 backdrop-blur-sm text-slate-900 placeholder:text-slate-300 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
                    disabled={isLoading}
                    {...otpForm.register('otp')}
                  />
                  {otpForm.formState.errors.otp && (
                    <p className="text-sm text-red-600 text-center mt-2">{otpForm.formState.errors.otp.message}</p>
                  )}
                </div>

                {otpTimer > 0 && (
                  <div className="text-center">
                    <p className="text-sm text-slate-600 font-medium">
                      {t('auth.otp.resendTimer')} <span className="text-emerald-600 font-bold">{formatTime(otpTimer)}</span>
                    </p>
                  </div>
                )}

                {otpTimer === 0 && (
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isLoading}
                      className="text-sm text-emerald-600 hover:text-emerald-700 font-bold transition-colors duration-200 hover:underline bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-200"
                    >
                      {t('auth.otp.resendCode')}
                    </button>
                  </div>
                )}

                {/* Verify Button */}
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-700 hover:via-teal-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] focus:ring-4 focus:ring-emerald-500/30 border border-white/20"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{t('auth.otp.verifying')}</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <span>{t('auth.otp.verifyAndComplete')}</span>
                      <Mail className="w-4 h-4" />
                    </div>
                  )}
                </Button>

                {/* Back Button */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('signup')}
                  className="w-full h-12 border-2 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-slate-700 font-semibold rounded-xl transition-all duration-300 focus:ring-4 focus:ring-emerald-500/20 shadow-sm hover:shadow-md"
                  disabled={isLoading}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t('auth.otp.backToRegistration')}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <div className="text-center mt-8 text-xs text-slate-500">
            <div className="flex items-center justify-center space-x-1">
              <Shield className="w-3 h-3 text-emerald-600" />
              <p className="font-medium">Your verification is secured with encryption</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}