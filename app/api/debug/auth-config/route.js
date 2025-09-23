// app/api/debug/auth-config/route.js
export async function GET() {
  // Only enable in development or for debugging
  if (process.env.NODE_ENV === 'production') {
    return new Response('Debug endpoint disabled in production', { status: 403 })
  }

  const config = {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'MISSING',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'SET' : 'MISSING',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'MISSING',
    MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'MISSING',
    NODE_ENV: process.env.NODE_ENV
  }

  return Response.json(config)
}