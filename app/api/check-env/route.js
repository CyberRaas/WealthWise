// Temporary diagnostic endpoint - REMOVE AFTER TESTING
export async function GET(request) {
  // Clean the URL
  const rawUrl = process.env.NEXTAUTH_URL || 'NOT SET'
  const cleanedUrl = rawUrl.trim().replace(/[\s\n]+$/, '').replace(/\/$/, '')

  // Get the current request URL
  const requestUrl = new URL(request.url)
  const currentHost = `${requestUrl.protocol}//${requestUrl.host}`

  const envCheck = {
    raw_nextAuthUrl: rawUrl,
    cleaned_nextAuthUrl: cleanedUrl,
    current_request_host: currentHost,
    url_match: cleanedUrl === currentHost,
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

    expectedGoogleRedirectUri: cleanedUrl !== 'NOT SET'
      ? `${cleanedUrl}/api/auth/callback/google`
      : 'NEXTAUTH_URL not set',

    warning: cleanedUrl !== currentHost
      ? `⚠️ NEXTAUTH_URL (${cleanedUrl}) does not match current host (${currentHost})`
      : null
  }

  return Response.json(envCheck, {
    headers: {
      'Content-Type': 'application/json'
    }
  })
}
