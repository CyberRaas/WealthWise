// Temporary diagnostic endpoint - REMOVE AFTER TESTING
export async function GET() {
  const envCheck = {
    nextAuthUrl: process.env.NEXTAUTH_URL || 'NOT SET',
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    hasMongoDB: !!process.env.MONGODB_URI,
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),

    // Show only if everything is present
    status: (
      process.env.NEXTAUTH_URL &&
      process.env.NEXTAUTH_SECRET &&
      process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.MONGODB_URI
    ) ? '✅ All Required Variables Present' : '❌ Missing Required Variables',

    expectedGoogleRedirectUri: process.env.NEXTAUTH_URL
      ? `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
      : 'NEXTAUTH_URL not set'
  }

  return Response.json(envCheck, {
    headers: {
      'Content-Type': 'application/json'
    }
  })
}
