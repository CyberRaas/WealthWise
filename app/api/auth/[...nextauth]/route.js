

// // app/api/auth/[...nextauth]/route.js

// export const runtime = 'nodejs'

// import { handlers } from "@/lib/auth"

// export const { GET, POST } = handlers

// // Add OPTIONS handler for CORS
// export async function OPTIONS(request) {
//   return new Response(null, {
//     status: 200,
//     headers: {
//       'Access-Control-Allow-Origin': process.env.NEXTAUTH_URL || 'https://wealthwise-cyan.vercel.app',
//       'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
//       'Access-Control-Allow-Headers': 'Content-Type, Authorization',
//       'Access-Control-Allow-Credentials': 'true',
//     },
//   })
// }

// app/api/auth/[...nextauth]/route.js
export const runtime = 'nodejs'

import { handlers } from "@/lib/auth"

// Correct export - DO NOT use destructuring
export const GET = handlers.GET
export const POST = handlers.POST