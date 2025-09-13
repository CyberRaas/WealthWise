import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  // Define route categories
  const authRoutes = [
    "/auth/signin",
    "/auth/signup", 
    "/auth/error",
    "/auth/verify-request"
  ]

  const publicRoutes = [
    "/",
    "/about",
    "/contact", 
    "/privacy",
    "/terms",
    "/support"
  ]

  const protectedRoutes = [
    "/dashboard",
    "/onboarding",
    "/profile",
    "/settings"
  ]

  const isAuthRoute = authRoutes.some(route => nextUrl.pathname.startsWith(route))
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname)
  const isProtectedRoute = protectedRoutes.some(route => nextUrl.pathname.startsWith(route))
  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth")

  // Allow all auth API routes
  if (isApiAuthRoute) {
    return NextResponse.next()
  }

  // Redirect logged-in users away from auth pages
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/onboarding", nextUrl))
  }

  // Allow access to public routes
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Redirect non-logged-in users to signin for protected routes
  if (!isLoggedIn && isProtectedRoute) {
    const callbackUrl = nextUrl.pathname + nextUrl.search
    const signInUrl = new URL("/auth/signin", nextUrl)
    signInUrl.searchParams.set("callbackUrl", callbackUrl)
    return NextResponse.redirect(signInUrl)
  }

  // Handle dashboard access - let onboarding flow manage redirection
  if (isLoggedIn && nextUrl.pathname.startsWith("/dashboard")) {
    // Check if user has completed onboarding (this is optional middleware check)
    // The OnboardingGuard component will handle the detailed validation
    return NextResponse.next()
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public|.*\\..*|_vercel).*)",
  ]
}
