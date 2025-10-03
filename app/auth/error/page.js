'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, Home, LogIn } from 'lucide-react'
import { Suspense } from 'react'

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const errorMessages = {
    Configuration: {
      title: 'Configuration Error',
      description: 'There is a problem with the server configuration. This could be due to missing environment variables or incorrect OAuth setup.',
      userMessage: 'We\'re experiencing technical difficulties. Please try again later or contact support.',
      technicalDetails: 'Check that GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and NEXTAUTH_URL are properly configured. Verify that the redirect URIs in Google Cloud Console match your NEXTAUTH_URL.'
    },
    AccessDenied: {
      title: 'Access Denied',
      description: 'You do not have permission to sign in.',
      userMessage: 'Access to this application has been denied. Please contact the administrator if you believe this is an error.',
    },
    Verification: {
      title: 'Email Verification Required',
      description: 'Please verify your email before signing in.',
      userMessage: 'Check your email for a verification link.',
    },
    OAuthSignin: {
      title: 'OAuth Sign-In Error',
      description: 'Error constructing an authorization URL.',
      userMessage: 'There was a problem starting the sign-in process. Please try again.',
      technicalDetails: 'OAuth provider configuration may be incorrect.'
    },
    OAuthCallback: {
      title: 'OAuth Callback Error',
      description: 'Error handling the OAuth callback.',
      userMessage: 'There was a problem completing the sign-in process. Please try again.',
      technicalDetails: 'Check redirect URIs and callback URL configuration.'
    },
    OAuthCreateAccount: {
      title: 'Account Creation Error',
      description: 'Could not create OAuth provider user in the database.',
      userMessage: 'We couldn\'t create your account. Please try again or use a different sign-in method.',
    },
    EmailCreateAccount: {
      title: 'Account Creation Error',
      description: 'Could not create email provider user in the database.',
      userMessage: 'We couldn\'t create your account. Please try again.',
    },
    Callback: {
      title: 'Callback Error',
      description: 'Error in the OAuth callback handler route.',
      userMessage: 'There was a problem completing the sign-in. Please try again.',
    },
    OAuthAccountNotLinked: {
      title: 'Account Already Exists',
      description: 'This email is already associated with another account.',
      userMessage: 'An account with this email already exists. Please sign in using your original sign-in method.',
    },
    EmailSignin: {
      title: 'Email Sign-In Error',
      description: 'Error sending the verification email.',
      userMessage: 'We couldn\'t send you a verification email. Please try again.',
    },
    CredentialsSignin: {
      title: 'Invalid Credentials',
      description: 'The provided credentials are incorrect.',
      userMessage: 'Invalid email or password. Please check your credentials and try again.',
    },
    Default: {
      title: 'Authentication Error',
      description: 'An unexpected error occurred.',
      userMessage: 'Something went wrong during authentication. Please try again.',
    }
  }

  const errorInfo = errorMessages[error] || errorMessages.Default

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-red-200 to-orange-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-rose-200 to-pink-200 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-xl ring-1 ring-slate-200/50 rounded-3xl overflow-hidden">
          <CardHeader className="text-center pb-6 pt-8 bg-gradient-to-b from-red-50/50 to-transparent">
            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-800 mb-2">
              {errorInfo.title}
            </CardTitle>
            <CardDescription className="text-slate-600 text-base">
              {errorInfo.userMessage}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 px-8 pb-8">
            {/* Error Code Badge */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-800 mb-1">Error Code</p>
                  <p className="text-sm text-red-600 font-mono">{error || 'Unknown'}</p>
                </div>
              </div>
            </div>

            {/* Technical Details for Development */}
            {process.env.NODE_ENV === 'development' && errorInfo.technicalDetails && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-yellow-800 mb-2">Developer Info:</p>
                <p className="text-xs text-yellow-700">{errorInfo.technicalDetails}</p>
                <p className="text-xs text-yellow-700 mt-2">Description: {errorInfo.description}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <Button
                asChild
                className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
              >
                <Link href="/auth/signin">
                  <LogIn className="w-4 h-4 mr-2" />
                  Try Signing In Again
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="w-full h-12 border-2 border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-2xl transition-all duration-300"
              >
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  Go to Homepage
                </Link>
              </Button>
            </div>

            {/* Help Text */}
            <div className="text-center pt-2">
              <p className="text-sm text-slate-500">
                Need help?{' '}
                <Link href="/contact" className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline">
                  Contact Support
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function ErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="text-slate-600 mt-4">Loading...</p>
        </div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  )
}
