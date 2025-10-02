'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AlertTriangle, Home, LogIn, Mail, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const errorMessages = {
  Configuration: {
    title: 'Configuration Error',
    description: 'There is a problem with the server configuration. Please contact support or try again later.',
    action: 'This usually means the authentication system is not properly configured. The administrator has been notified.'
  },
  AccessDenied: {
    title: 'Access Denied',
    description: 'You do not have permission to sign in.',
    action: 'If you believe this is an error, please contact support.'
  },
  Verification: {
    title: 'Verification Required',
    description: 'Please verify your email before signing in.',
    action: 'Check your inbox for the verification email.'
  },
  OAuthSignin: {
    title: 'OAuth Sign-in Error',
    description: 'Error in constructing an authorization URL.',
    action: 'Try signing in again or use a different method.'
  },
  OAuthCallback: {
    title: 'OAuth Callback Error',
    description: 'Error in handling the response from the OAuth provider.',
    action: 'Try signing in again or use a different method.'
  },
  OAuthCreateAccount: {
    title: 'OAuth Account Creation Error',
    description: 'Could not create OAuth provider user in the database.',
    action: 'Try signing in again or contact support.'
  },
  EmailCreateAccount: {
    title: 'Email Account Creation Error',
    description: 'Could not create email provider user in the database.',
    action: 'Try signing in again or contact support.'
  },
  Callback: {
    title: 'Callback Error',
    description: 'Error in the OAuth callback handler route.',
    action: 'Try signing in again.'
  },
  OAuthAccountNotLinked: {
    title: 'Account Already Exists',
    description: 'This email is already registered with a different sign-in method.',
    action: 'Try signing in using the original method you used to create your account.'
  },
  EmailSignin: {
    title: 'Email Sign-in Error',
    description: 'Could not send the email with the verification link.',
    action: 'Try signing in again.'
  },
  CredentialsSignin: {
    title: 'Invalid Credentials',
    description: 'Sign in failed. Check the details you provided are correct.',
    action: 'Please check your email and password and try again.'
  },
  SessionRequired: {
    title: 'Session Required',
    description: 'You must be signed in to access this page.',
    action: 'Please sign in to continue.'
  },
  Default: {
    title: 'Authentication Error',
    description: 'An unexpected error occurred during authentication.',
    action: 'Please try again. If the problem persists, contact support.'
  }
}

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error') || 'Default'
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Log error for debugging (in production, this would go to error tracking service)
    console.error('Auth error:', {
      error,
      url: window.location.href,
      timestamp: new Date().toISOString()
    })

    // If configuration error, notify admin (in production)
    if (error === 'Configuration') {
      // In production, send to error tracking service
      console.error('CRITICAL: NextAuth configuration error detected')
    }
  }, [error])

  if (!mounted) {
    return null
  }

  const errorInfo = errorMessages[error] || errorMessages.Default

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-red-200 to-orange-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-yellow-200 to-orange-200 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-xl ring-1 ring-orange-200/50 rounded-3xl overflow-hidden">
          <CardHeader className="text-center pb-6 pt-8 bg-gradient-to-b from-orange-50/50 to-transparent">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-lg">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-800 mb-2">
              {errorInfo.title}
            </CardTitle>
            <CardDescription className="text-slate-600 text-base">
              {errorInfo.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 px-8 pb-8">
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
              <p className="text-sm text-slate-700">
                <strong className="font-semibold">What to do next:</strong>
                <br />
                {errorInfo.action}
              </p>
            </div>

            <div className="space-y-3">
              <Button
                asChild
                className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Link href="/auth/signin">
                  <LogIn className="w-4 h-4 mr-2" />
                  Try Signing In Again
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="w-full h-12 border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-all duration-300"
              >
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  Return to Homepage
                </Link>
              </Button>

              {error === 'Verification' && (
                <Button
                  asChild
                  variant="outline"
                  className="w-full h-12 border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 text-blue-700 font-semibold rounded-xl transition-all duration-300"
                >
                  <Link href="/auth/verify-email">
                    <Mail className="w-4 h-4 mr-2" />
                    Resend Verification Email
                  </Link>
                </Button>
              )}
            </div>

            {error === 'Configuration' && (
              <div className="text-center pt-4 border-t">
                <p className="text-xs text-slate-500 mb-2">Error Code: {error}</p>
                <p className="text-xs text-slate-500">
                  If this issue persists, please contact{' '}
                  <a
                    href="mailto:support@mywealthwise.tech"
                    className="text-emerald-600 hover:text-emerald-700 font-semibold underline"
                  >
                    support@mywealthwise.tech
                  </a>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-slate-600 hover:text-slate-800 font-medium transition-colors inline-flex items-center space-x-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Refresh Page</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="text-slate-600 mt-4">Loading...</p>
        </div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  )
}
