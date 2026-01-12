
// lib/auth.js - PRODUCTION READY VERSION
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from "./database" // Import the client promise from database.js
import { connectToDatabase } from "./database"
import { encryptionService } from "./encryption"
import { loginSchema } from "./validations"

// Validate required environment variables at startup
const requiredEnvVars = [
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'MONGODB_URI',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET'
]

const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '))
  console.error('📋 Current environment:', {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ? 'SET' : 'MISSING',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'MISSING',
    AUTH_URL: process.env.AUTH_URL ? 'SET' : 'MISSING',
    MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'MISSING',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'SET' : 'MISSING',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'MISSING',
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL,
    VERCEL_ENV: process.env.VERCEL_ENV
  })
  if (process.env.NODE_ENV === 'production') {
    // In production, throw error to prevent deployment with missing config
    throw new Error(`❌ CRITICAL: Missing required environment variables: ${missingVars.join(', ')}. Please configure them in your deployment platform (Vercel/Netlify).`)
  }
}

// Use AUTH_URL as fallback for NEXTAUTH_URL (NextAuth v5 compatibility)
const authUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL
if (!authUrl) {
  throw new Error('Either AUTH_URL or NEXTAUTH_URL must be set')
}

console.log('✅ All required environment variables are set')
console.log('📍 Auth URL:', authUrl)
console.log('📍 NODE_ENV:', process.env.NODE_ENV)
console.log('📍 VERCEL_ENV:', process.env.VERCEL_ENV || 'not-vercel')
console.log('📍 Google Client ID:', process.env.GOOGLE_CLIENT_ID ? 'SET (' + process.env.GOOGLE_CLIENT_ID.substring(0, 20) + '...)' : 'MISSING')
console.log('📍 MongoDB URI:', process.env.MONGODB_URI ? 'SET' : 'MISSING')

// Create MongoDB adapter with error handling
let mongoAdapter
try {
  mongoAdapter = MongoDBAdapter(clientPromise, {
    databaseName: process.env.MONGODB_DB_NAME || 'smart-financial-planner',
  })
  console.log('✅ MongoDB Adapter created successfully')
} catch (error) {
  console.error('❌ Failed to create MongoDB Adapter:', error)
  throw error
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: mongoAdapter,
  basePath: '/api/auth',
  // Support both AUTH_URL and NEXTAUTH_URL for compatibility
  url: process.env.AUTH_URL || process.env.NEXTAUTH_URL,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          const validatedData = loginSchema.parse(credentials)

          const db = await connectToDatabase()
          const user = await db.collection("users").findOne({
            email: validatedData.email.toLowerCase()
          })

          if (!user) {
            return null
          }

          if (!user.isEmailVerified) {
            throw new Error("Please verify your email before signing in")
          }

          const isValidPassword = await encryptionService.verifyPassword(
            validatedData.password,
            user.password
          )

          if (!isValidPassword) {
            return null
          }

          await db.collection("users").updateOne(
            { _id: user._id },
            {
              $set: {
                lastLogin: new Date(),
                updatedAt: new Date()
              }
            }
          )

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.avatar,
            isEmailVerified: user.isEmailVerified,
            preferences: user.preferences,
            profile: user.profile,
            role: user.role || 'user'
          }
        } catch (error) {
          console.error("Authentication error:", error)
          throw error // Throw instead of returning null for better error handling
        }
      }
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile"
        }
      },
      profile(profile) {
        console.log('🔐 Google OAuth profile received:', { email: profile.email, name: profile.name })
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          isEmailVerified: profile.email_verified || false
        }
      },
      allowDangerousEmailAccountLinking: true, // Allow linking accounts with same email
      httpOptions: {
        timeout: 10000,
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user, account, trigger }) {
      if (user) {
        token.id = user.id
        token.isEmailVerified = user.isEmailVerified
        token.preferences = user.preferences || {}
        token.profile = user.profile || {}
        token.role = user.role || 'user'
      }

      if (account?.provider === "google") {
        try {
          console.log('🔍 JWT Callback: Processing Google OAuth for', token.email)
          const db = await connectToDatabase()
          console.log('✅ JWT Callback: Database connected')
          const existingUser = await db.collection("users").findOne({
            email: token.email
          })
          console.log('🔍 JWT Callback: User search result:', existingUser ? 'Found' : 'Not found')

          if (!existingUser) {
            const newUser = {
              email: token.email,
              name: token.name,
              avatar: token.picture,
              isEmailVerified: true,
              role: 'user', // Default role for new users
              preferences: {
                currency: 'USD',
                language: 'en',
                timezone: 'UTC',
                notifications: {
                  email: true,
                  push: true,
                  budgetAlerts: true,
                  goalReminders: true
                },
                privacy: {
                  shareData: false,
                  analytics: true
                }
              },
              profile: {
                city: '',
                country: '',
                familySize: 1,
                ageRange: '',
                occupation: '',
                financialExperience: 'beginner'
              },
              subscription: {
                plan: 'free',
                status: 'active',
                startDate: new Date(),
                endDate: null
              },
              createdAt: new Date(),
              updatedAt: new Date(),
              lastLogin: new Date()
            }

            console.log('➕ JWT Callback: Creating new user')
            const result = await db.collection("users").insertOne(newUser)
            console.log('✅ JWT Callback: User created with ID:', result.insertedId.toString())
            token.id = result.insertedId.toString()
            token.preferences = newUser.preferences
            token.profile = newUser.profile
            token.role = newUser.role
          } else {
            token.id = existingUser._id.toString()
            token.isEmailVerified = existingUser.isEmailVerified
            token.preferences = existingUser.preferences || {}
            token.profile = existingUser.profile || {}
            token.role = existingUser.role || 'user'

            console.log('🔄 JWT Callback: Updating existing user', existingUser._id.toString())
            await db.collection("users").updateOne(
              { _id: existingUser._id },
              {
                $set: {
                  lastLogin: new Date(),
                  updatedAt: new Date(),
                  avatar: token.picture // Update avatar from Google
                }
              }
            )
            console.log('✅ JWT Callback: User updated')
          }
        } catch (error) {
          console.error('❌ JWT Callback Error:', error)
          console.error('Error details:', {
            name: error.name,
            message: error.message,
            code: error.code,
            stack: error.stack
          })
          // Don't throw - return token to prevent auth failure
        }
      }

      return token
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.isEmailVerified = token.isEmailVerified ?? false
        session.user.preferences = token.preferences || {}
        session.user.profile = token.profile || {}
        session.user.role = token.role || 'user'

        // Fetch latest profile image from database
        try {
          const db = await connectToDatabase()
          const userProfile = await db.collection("userprofiles").findOne({
            email: session.user.email
          })

          if (userProfile?.profileImage) {
            session.user.image = userProfile.profileImage
          }
        } catch (error) {
          console.error('Error fetching profile image:', error)
          // Continue without updated image
        }
      }
      return session
    },

    async signIn({ user, account, profile }) {
      try {
        if (account?.provider === "google") {
          // Verify email exists
          if (!user.email) {
            console.error('No email provided by Google')
            return false
          }
          return true
        }
        return user !== null
      } catch (error) {
        console.error('Sign in error:', error)
        return false
      }
    },

    // Redirect callback to handle redirects properly
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      
      // Handle both www and non-www versions of the domain
      try {
        const urlOrigin = new URL(url).origin
        const baseOrigin = new URL(baseUrl).origin
        
        // Allow same origin
        if (urlOrigin === baseOrigin) return url
        
        // Allow www/non-www variations of the same domain
        const urlHost = new URL(url).hostname.replace('www.', '')
        const baseHost = new URL(baseUrl).hostname.replace('www.', '')
        if (urlHost === baseHost) return url
        
      } catch (e) {
        console.error('Redirect callback URL parse error:', e)
      }
      
      return baseUrl
    }
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
    newUser: "/onboarding"
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      console.log(`User signed in: ${user.email}`)

      if (isNewUser && account?.provider === "google") {
        try {
          const { emailService } = await import('./emailService')
          await emailService.sendWelcomeEmail(user)
        } catch (error) {
          console.error('Failed to send welcome email:', error)
        }
      }
    },
    async signOut({ token }) {
      console.log(`User signed out: ${token?.email || 'unknown'}`)
    }
  },
  debug: true, // Enable debug mode to see detailed logs
  trustHost: true, // Trust proxy headers
  secret: process.env.NEXTAUTH_SECRET,

  // Production-ready cookie configuration
  useSecureCookies: process.env.NODE_ENV === 'production',
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production'
        ? `__Secure-next-auth.session-token`
        : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? '.mywealthwise.in' : undefined
      }
    },
    callbackUrl: {
      name: process.env.NODE_ENV === 'production'
        ? `__Secure-next-auth.callback-url`
        : `next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? '.mywealthwise.in' : undefined
      }
    },
    csrfToken: {
      name: process.env.NODE_ENV === 'production'
        ? `__Host-next-auth.csrf-token`
        : `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },

  // Logging callback for debugging
  logger: {
    error(code, ...message) {
      console.error('❌ NextAuth Error:', code)
      if (message && message.length > 0) {
        message.forEach((msg, index) => {
          if (msg instanceof Error) {
            console.error(`  Error ${index}:`, {
              name: msg.name,
              message: msg.message,
              stack: msg.stack,
              cause: msg.cause
            })
          } else {
            console.error(`  Message ${index}:`, msg)
          }
        })
      }
    },
    warn(code) {
      console.warn('⚠️ NextAuth Warning:', code)
    },
    debug(code, metadata) {
      console.log('🐛 NextAuth Debug:', code, metadata)
    }
  }
})