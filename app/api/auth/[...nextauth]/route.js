// // app/api/auth/[...nextauth]/route.js

// export const runtime = 'nodejs'  // ✅ Force Node.js

// import { handlers } from "@/lib/auth"

// export const { GET, POST } = handlers


// app/api/auth/[...nextauth]/route.js

export const runtime = 'nodejs'

import { handlers } from "@/lib/auth"

export const { GET, POST } = handlers

// Add OPTIONS handler for CORS
export async function OPTIONS(request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.NEXTAUTH_URL || 'https://www.mywealthwise.tech',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
      'Access-Control-Allow-Credentials': 'true',
    },
  })
}