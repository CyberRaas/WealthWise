'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, CheckCircle, ArrowLeft, RefreshCw } from 'lucide-react'
import Logo from '@/components/ui/Logo'

export default function VerifyRequestPage() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam))
    }
  }, [searchParams])

  const handleResendEmail = async () => {
    if (!email) return
    
    setIsResending(true)
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setResendSuccess(true)
        setTimeout(() => setResendSuccess(false), 5000)
      }
    } catch (error) {
      console.error('Failed to resend verification email:', error)
    } finally {
      setIsResending(false)
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

        <Card className="shadow-xl border-2 border-blue-200 bg-blue-50">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-slate-800">
              Check Your Email
            </CardTitle>
            <CardDescription className="text-base text-slate-600">
              We've sent a verification link to your email address
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {email && (
              <div className="bg-white/70 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-slate-600 text-center">
                  Verification email sent to:
                </p>
                <p className="font-semibold text-slate-800 text-center mt-1">
                  {email}
                </p>
              </div>
            )}

            <div className="bg-white/70 p-4 rounded-lg border border-slate-200">
              <h3 className="font-semibold text-slate-800 mb-2">Next steps:</h3>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Check your email inbox</li>
                <li>• Look for an email from WealthWise</li>
                <li>• Click the verification link in the email</li>
                <li>• Return here to sign in</li>
              </ul>
            </div>

            {resendSuccess && (
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-sm text-green-700 font-medium">
                    Verification email sent successfully!
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {email && (
                <Button 
                  onClick={handleResendEmail}
                  disabled={isResending}
                  variant="outline"
                  className="w-full border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 rounded-xl"
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Resend Email
                    </>
                  )}
                </Button>
              )}

              <Button 
                asChild
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Link href="/auth/signin">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign In
                </Link>
              </Button>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <p className="text-xs text-slate-500 text-center mb-3">
                Didn't receive the email?
              </p>
              <ul className="text-xs text-slate-500 space-y-1">
                <li>• Check your spam/junk folder</li>
                <li>• Make sure the email address is correct</li>
                <li>• Wait a few minutes and check again</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <div className="text-center">
          <p className="text-sm text-slate-600 mb-2">
            Need help?
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