'use client'

import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, Home, RotateCcw } from 'lucide-react'
import Link from 'next/link'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = (errorType) => {
    switch (errorType) {
      case 'Configuration':
        return {
          title: 'Configuration Error',
          description: 'There was a problem with the authentication configuration. Please try again or contact support.',
          details: 'This usually indicates missing environment variables or incorrect OAuth settings.'
        }
      case 'AccessDenied':
        return {
          title: 'Access Denied',
          description: 'You do not have permission to sign in.',
          details: 'This may happen if your account is not approved or if there are restrictions on your account.'
        }
      case 'Verification':
        return {
          title: 'Verification Error',
          description: 'The verification token has expired or is invalid.',
          details: 'Please request a new verification email.'
        }
      case 'Default':
      default:
        return {
          title: 'Authentication Error',
          description: 'An unexpected error occurred during authentication.',
          details: 'Please try again or contact support if the problem persists.'
        }
    }
  }

  const errorInfo = getErrorMessage(error)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-50 p-4">
      <Card className="w-full max-w-md shadow-2xl border-red-200/50 bg-white/90 backdrop-blur-xl">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {errorInfo.title}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {errorInfo.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>Error Code:</strong> {error}
              </p>
              <p className="text-xs text-red-600 mt-2">
                {errorInfo.details}
              </p>
            </div>
          )}
          
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/auth/signin">
                <RotateCcw className="w-4 h-4 mr-2" />
                Try Again
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}