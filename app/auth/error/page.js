'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, ArrowLeft, RefreshCw, Mail, Shield } from 'lucide-react'
import Logo from '@/components/ui/Logo'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [error, setError] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [solution, setSolution] = useState('')

  useEffect(() => {
    const errorParam = searchParams.get('error')
    setError(errorParam || 'Unknown')
    
    // Map error codes to user-friendly messages and solutions
    switch (errorParam) {
      case 'Configuration':
        setErrorMessage('There is a problem with the server configuration.')
        setSolution('Our team has been notified. Please try again in a few minutes.')
        break
      case 'AccessDenied':
        setErrorMessage('Access was denied.')
        setSolution('You do not have permission to sign in. Please contact support if you believe this is an error.')
        break
      case 'Verification':
        setErrorMessage('The verification token has expired or has already been used.')
        setSolution('Please request a new verification email.')
        break
      case 'OAuthAccountNotLinked':
        setErrorMessage('This email is already associated with another account.')
        setSolution('Please sign in with your original method (email/password), then link your Google account from your profile settings.')
        break
      case 'OAuthCallback':
        setErrorMessage('There was an error with the OAuth provider.')
        setSolution('Please try signing in again. If the problem persists, try using email and password instead.')
        break
      case 'OAuthSignin':
        setErrorMessage('Error occurred during OAuth sign-in.')
        setSolution('Please try again or use email and password to sign in.')
        break
      case 'EmailSignin':
        setErrorMessage('Failed to send verification email.')
        setSolution('Please check your email address and try again.')
        break
      case 'CredentialsSignin':
        setErrorMessage('Invalid email or password.')
        setSolution('Please check your credentials and try again.')
        break
      case 'SessionRequired':
        setErrorMessage('You must be signed in to access this page.')
        setSolution('Please sign in to continue.')
        break
      default:
        setErrorMessage('An unexpected error occurred during authentication.')
        setSolution('Please try again. If the problem persists, contact our support team.')
    }
  }, [searchParams])

  const handleRetry = () => {
    if (error === 'OAuthAccountNotLinked') {
      router.push('/auth/signin')
    } else if (error === 'SessionRequired') {
      router.push('/auth/signin')
    } else {
      router.push('/auth/signin')
    }
  }

  const getErrorIcon = () => {
    switch (error) {
      case 'OAuthAccountNotLinked':
        return <Shield className="w-12 h-12 text-amber-500" />
      case 'Verification':
        return <Mail className="w-12 h-12 text-blue-500" />
      default:
        return <AlertTriangle className="w-12 h-12 text-red-500" />
    }
  }

  const getErrorColor = () => {
    switch (error) {
      case 'OAuthAccountNotLinked':
        return 'border-amber-200 bg-amber-50'
      case 'Verification':
        return 'border-blue-200 bg-blue-50'
      default:
        return 'border-red-200 bg-red-50'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <Logo size="xlarge" textClassName="text-2xl" />
          <p className="text-slate-600 text-sm font-medium mt-2">Smart Financial Planning</p>
        </div>

        <Card className={`shadow-xl border-2 ${getErrorColor()}`}>
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              {getErrorIcon()}
            </div>
            <CardTitle className="text-2xl font-bold text-slate-800">
              Authentication Error
            </CardTitle>
            <CardDescription className="text-base text-slate-600">
              {errorMessage}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-white/70 p-4 rounded-lg border border-slate-200">
              <h3 className="font-semibold text-slate-800 mb-2">What you can do:</h3>
              <p className="text-sm text-slate-600">{solution}</p>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={handleRetry}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>

              <Button 
                variant="outline"
                asChild
                className="w-full border-2 border-slate-200 hover:border-slate-300 rounded-xl"
              >
                <Link href="/auth/signin">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign In
                </Link>
              </Button>
            </div>

            {error === 'OAuthAccountNotLinked' && (
              <div className="border-t border-slate-200 pt-4">
                <p className="text-xs text-slate-500 text-center mb-3">
                  Need help linking your accounts?
                </p>
                <Button 
                  variant="ghost" 
                  asChild
                  className="w-full text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                >
                  <Link href="/support">
                    Contact Support
                  </Link>
                </Button>
              </div>
            )}

            {/* Error Code for Development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="border-t border-slate-200 pt-4">
                <p className="text-xs text-slate-400 text-center">
                  Error Code: {error}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help Section */}
        <div className="text-center">
          <p className="text-sm text-slate-600 mb-2">
            Still having trouble?
          </p>
          <Link 
            href="/support" 
            className="text-emerald-600 hover:text-emerald-700 font-medium text-sm hover:underline"
          >
            Contact our support team
          </Link>
        </div>
      </div>
    </div>
  )
}
