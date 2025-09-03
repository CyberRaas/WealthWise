'use client'

import { useSearchParams, Suspense } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { AlertCircle, Home, ArrowLeft, RefreshCw } from 'lucide-react'

const errors = {
  Configuration: {
    title: 'Server Configuration Error',
    description: 'There is a problem with the server configuration. Our team has been notified and will fix this shortly.',
    action: 'Try Again',
    showRefresh: true
  },
  AccessDenied: {
    title: 'Access Denied',
    description: 'You do not have permission to sign in. Please contact support if you believe this is an error.',
    action: 'Go Back',
    showRefresh: false
  },
  Verification: {
    title: 'Unable to Verify',
    description: 'The verification token has expired or has already been used. Please request a new verification email.',
    action: 'Request New',
    showRefresh: false
  },
  OAuthSignin: {
    title: 'OAuth Sign-in Error',
    description: 'There was an error signing in with your social account. Please try again or use email sign-in.',
    action: 'Try Again',
    showRefresh: true
  },
  OAuthCallback: {
    title: 'OAuth Callback Error',
    description: 'There was an error processing your social sign-in. Please try again.',
    action: 'Try Again',
    showRefresh: true
  },
  OAuthCreateAccount: {
    title: 'Account Creation Error',
    description: 'Could not create an account for your social sign-in. Please try again or contact support.',
    action: 'Try Again',
    showRefresh: true
  },
  EmailCreateAccount: {
    title: 'Email Account Error',
    description: 'Could not create account. Please check your email and try again.',
    action: 'Try Again',
    showRefresh: true
  },
  Callback: {
    title: 'Callback Error',
    description: 'There was an error in the authentication process. Please try signing in again.',
    action: 'Try Again',
    showRefresh: true
  },
  OAuthAccountNotLinked: {
    title: 'Account Not Linked',
    description: 'This email is already associated with another account. Please sign in with your original method.',
    action: 'Try Different Method',
    showRefresh: false
  },
  Default: {
    title: 'Authentication Error',
    description: 'An unexpected error occurred during authentication. Please try again.',
    action: 'Try Again',
    showRefresh: true
  }
}

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error') || 'Default'
  
  const errorInfo = errors[error] || errors.Default

  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-xl border border-slate-200">
        <CardHeader className="text-center pb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          
          <CardTitle className="text-2xl font-bold text-slate-900 mb-2">
            {errorInfo.title}
          </CardTitle>
          
          <CardDescription className="text-slate-600 leading-relaxed">
            {errorInfo.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            <Link href="/auth/signin" className="block">
              <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl h-12">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {errorInfo.action}
              </Button>
            </Link>
            
            {errorInfo.showRefresh && (
              <Button 
                variant="outline" 
                className="w-full rounded-xl h-12"
                onClick={handleRefresh}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Page
              </Button>
            )}
            
            <Link href="/" className="block">
              <Button variant="outline" className="w-full rounded-xl h-12">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </Link>
          </div>
          
          {error && (
            <div className="mt-6 p-3 bg-slate-100 rounded-lg">
              <p className="text-xs text-slate-500 text-center">Error Code: {error}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-emerald-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="text-slate-600 mt-4">Loading...</p>
        </div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  )
}
