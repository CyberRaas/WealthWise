// import NextAuth from "next-auth"
// import CredentialsProvider from "next-auth/providers/credentials"
// import GoogleProvider from "next-auth/providers/google"
// import { MongoDBAdapter } from "@auth/mongodb-adapter"
// import { connectToDatabase } from "./database"
// import { encryptionService } from "./encryption"
// import { loginSchema } from "./validations"
// import { ObjectId } from "mongodb"
// import config from "./config"

// // Create MongoDB client promise for the adapter
// let clientPromise

// if (process.env.NODE_ENV === "development") {
//   // In development mode, use a global variable so that the value
//   // is preserved across module reloads caused by HMR (hot module replacement).
//   if (!global._mongoClientPromise) {
//     const { MongoClient } = await import("mongodb")
//     const client = new MongoClient(process.env.MONGODB_URI, {
//       maxPoolSize: 10,
//       serverSelectionTimeoutMS: 5000,
//       socketTimeoutMS: 45000,
//       family: 4,
//     })
//     global._mongoClientPromise = client.connect()
//   }
//   clientPromise = global._mongoClientPromise
// } else {
//   // In production mode, it's best to not use a global variable.
//   const { MongoClient } = await import("mongodb")
//   const client = new MongoClient(process.env.MONGODB_URI, {
//     maxPoolSize: 10,
//     serverSelectionTimeoutMS: 5000,
//     socketTimeoutMS: 45000,
//     family: 4,
//   })
//   clientPromise = client.connect()
// }

// export const { handlers, auth, signIn, signOut } = NextAuth({
//   adapter: MongoDBAdapter(clientPromise),
//   providers: [
//     CredentialsProvider({
//       name: "credentials",
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" }
//       },
//       async authorize(credentials) {
//         try {
//           // Validate input
//           const validatedData = loginSchema.parse(credentials)
          
//           const db = await connectToDatabase()
//           const user = await db.collection("users").findOne({
//             email: validatedData.email.toLowerCase()
//           })
          
//           if (!user) {
//             return null
//           }
          
//           // Check if email is verified
//           if (!user.isEmailVerified) {
//             throw new Error("Please verify your email before signing in")
//           }
          
//           // Verify password
//           const isValidPassword = await encryptionService.verifyPassword(
//             validatedData.password, 
//             user.password
//           )
          
//           if (!isValidPassword) {
//             return null
//           }
          
//           // Update last login
//           await db.collection("users").updateOne(
//             { _id: user._id },
//             { 
//               $set: { 
//                 lastLogin: new Date(),
//                 updatedAt: new Date()
//               }
//             }
//           )
          
//           return {
//             id: user._id.toString(),
//             email: user.email,
//             name: user.name,
//             image: user.avatar,
//             isEmailVerified: user.isEmailVerified,
//             preferences: user.preferences,
//             profile: user.profile
//           }
//         } catch (error) {
//           console.error("Authentication error:", error)
//           return null
//         }
//       }
//     }),
    
//     // Google Provider - Always include if environment variables exist
//     ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
//       GoogleProvider({
//         clientId: process.env.GOOGLE_CLIENT_ID,
//         clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//         authorization: {
//           params: {
//             prompt: "consent",
//             access_type: "offline",
//             response_type: "code"
//           }
//         },
//         profile(profile) {
//           return {
//             id: profile.sub,
//             name: profile.name,
//             email: profile.email,
//             image: profile.picture,
//             isEmailVerified: profile.email_verified
//           }
//         }
//       })
//     ] : [])
//   ],
//   session: { 
//     strategy: "jwt",
//     maxAge: 30 * 24 * 60 * 60, // 30 days
//     updateAge: 24 * 60 * 60, // 24 hours
//   },
//   callbacks: {
//     async jwt({ token, user, account }) {
//       // Initial sign in
//       if (user) {
//         token.id = user.id
//         token.isEmailVerified = user.isEmailVerified
//         token.preferences = user.preferences
//         token.profile = user.profile
//       }
      
//       // Handle OAuth sign in
//       if (account?.provider === "google") {
//         const db = await connectToDatabase()
//         const existingUser = await db.collection("users").findOne({
//           email: token.email
//         })
        
//         if (!existingUser) {
//           // Create new user for OAuth
//           const newUser = {
//             email: token.email,
//             name: token.name,
//             avatar: token.picture,
//             isEmailVerified: true, // OAuth emails are considered verified
//             preferences: {
//               currency: 'USD',
//               language: 'en',
//               timezone: 'UTC',
//               notifications: {
//                 email: true,
//                 push: true,
//                 budgetAlerts: true,
//                 goalReminders: true
//               },
//               privacy: {
//                 shareData: false,
//                 analytics: true
//               }
//             },
//             profile: {
//               city: '',
//               country: '',
//               familySize: 1,
//               ageRange: '',
//               occupation: '',
//               financialExperience: 'beginner'
//             },
//             subscription: {
//               plan: 'free',
//               status: 'active',
//               startDate: new Date(),
//               endDate: null
//             },
//             createdAt: new Date(),
//             updatedAt: new Date()
//           }
          
//           const result = await db.collection("users").insertOne(newUser)
//           token.id = result.insertedId.toString()
//           token.preferences = newUser.preferences
//           token.profile = newUser.profile
//         } else {
//           token.id = existingUser._id.toString()
//           token.isEmailVerified = existingUser.isEmailVerified
//           token.preferences = existingUser.preferences
//           token.profile = existingUser.profile
          
//           // Update last login for OAuth users too
//           await db.collection("users").updateOne(
//             { _id: existingUser._id },
//             { 
//               $set: { 
//                 lastLogin: new Date(),
//                 updatedAt: new Date()
//               }
//             }
//           )
//         }
//       }
      
//       return token
//     },
//     async session({ session, token }) {
//       if (token) {
//         session.user.id = token.id
//         session.user.isEmailVerified = token.isEmailVerified
//         session.user.preferences = token.preferences
//         session.user.profile = token.profile
//       }
//       return session
//     },
//     async signIn({ user, account, profile }) {
//       // Allow OAuth sign-ins
//       if (account?.provider === "google") {
//         return true
//       }
      
//       // For credentials, user object will be null if authorization failed
//       return user !== null
//     }
//   },
//   pages: {
//     signIn: "/auth/signin",
//     signUp: "/auth/signup",
//     error: "/auth/error", 
//     verifyRequest: "/auth/verify-request",
//     newUser: "/onboarding"
//   },
//   events: {
//     async signIn({ user, account, profile, isNewUser }) {
//       console.log(`User signed in: ${user.email}`)
      
//       if (isNewUser && account?.provider === "google") {
//         // Send welcome email for new OAuth users
//         try {
//           const { emailService } = await import('./emailService')
//           await emailService.sendWelcomeEmail(user)
//         } catch (error) {
//           console.error('Failed to send welcome email:', error)
//         }
//       }
//     },
//     async signOut({ token }) {
//       console.log(`User signed out: ${token?.email}`)
//     }
//   },
//   debug: process.env.NODE_ENV === 'development',
//   trustHost: true,
//   secret: process.env.NEXTAUTH_SECRET
// })


// lib/auth.js
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import { MongoClient } from "mongodb"
import { connectToDatabase } from "./database"
import { encryptionService } from "./encryption"
import { loginSchema } from "./validations"

// Create MongoDB client promise for the adapter
let clientPromise

async function getMongoClientPromise() {
  if (!clientPromise) {
    const client = new MongoClient(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      bufferMaxEntries: 0,
      bufferCommands: false,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    clientPromise = client.connect()
  }
  return clientPromise
}

export const authConfig = {
  adapter: MongoDBAdapter(getMongoClientPromise(), { 
    databaseName: process.env.NEXTAUTH_DATABASE_NAME || "smart-financial-planner"
  }),
  
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log("Missing credentials")
            return null
          }

          const validatedData = loginSchema.parse(credentials)
          
          const db = await connectToDatabase()
          const user = await db.collection("users").findOne({
            email: validatedData.email.toLowerCase()
          })
          
          if (!user) {
            console.log("User not found")
            return null
          }
          
          if (!user.isEmailVerified) {
            console.log("Email not verified")
            throw new Error("Please verify your email before signing in")
          }
          
          const isValidPassword = await encryptionService.verifyPassword(
            validatedData.password, 
            user.password
          )
          
          if (!isValidPassword) {
            console.log("Invalid password")
            return null
          }
          
          // Update last login
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
            image: user.avatar || null,
            isEmailVerified: user.isEmailVerified,
            preferences: user.preferences || {},
            profile: user.profile || {}
          }
        } catch (error) {
          console.error("Authentication error:", error)
          return null
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
      allowDangerousEmailAccountLinking: true, // Allow linking OAuth accounts
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          emailVerified: profile.email_verified ? new Date() : null
        }
      }
    })
  ],
  
  session: { 
    strategy: "database", // Use database strategy for better OAuth account linking
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      try {
        // Allow all OAuth sign-ins
        if (account?.provider === "google") {
          // Check if user already exists
          const db = await connectToDatabase()
          const existingUser = await db.collection("users").findOne({
            email: user.email.toLowerCase()
          })
          
          if (existingUser && !existingUser.password && account.provider === "google") {
            // This is a Google-only user, allow sign-in
            return true
          } else if (existingUser && existingUser.password) {
            // User exists with password (credentials), link the accounts
            return true
          } else if (!existingUser) {
            // New user, create account
            const newUser = {
              email: user.email.toLowerCase(),
              name: user.name,
              avatar: user.image,
              isEmailVerified: true,
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
            
            await db.collection("users").insertOne(newUser)
            return true
          }
        }
        
        // For credentials, user object will be null if authorization failed
        return user !== null
      } catch (error) {
        console.error("SignIn callback error:", error)
        return false
      }
    },
    
    async session({ session, token, user }) {
      try {
        if (session?.user) {
          // Get user data from database
          const db = await connectToDatabase()
          const dbUser = await db.collection("users").findOne({
            email: session.user.email.toLowerCase()
          })
          
          if (dbUser) {
            session.user.id = dbUser._id.toString()
            session.user.isEmailVerified = dbUser.isEmailVerified
            session.user.preferences = dbUser.preferences || {}
            session.user.profile = dbUser.profile || {}
            
            // Get profile image from userprofiles collection if available
            const userProfile = await db.collection("userprofiles").findOne({
              email: session.user.email
            })
            
            if (userProfile?.profileImage) {
              session.user.image = userProfile.profileImage
            } else if (dbUser.avatar) {
              session.user.image = dbUser.avatar
            }
          }
        }
        return session
      } catch (error) {
        console.error("Session callback error:", error)
        return session
      }
    }
  },
  
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
    newUser: "/onboarding"
  },
  
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log(`User signed in: ${user.email} via ${account?.provider || 'credentials'}`)
      
      if (isNewUser && account?.provider === "google") {
        try {
          const { emailService } = await import('./emailService')
          await emailService.sendWelcomeEmail(user)
        } catch (error) {
          console.error('Failed to send welcome email:', error)
        }
      }
    },
    
    async signOut({ session, token }) {
      console.log(`User signed out: ${session?.user?.email || token?.email}`)
    },
    
    async createUser({ user }) {
      console.log(`New user created: ${user.email}`)
    },
    
    async linkAccount({ user, account, profile }) {
      console.log(`Account linked: ${account.provider} for ${user.email}`)
    }
  },
  
  debug: process.env.NODE_ENV === 'development',
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
  
  // Additional configuration for production
  useSecureCookies: process.env.NODE_ENV === 'production',
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? '.mywealthwise.tech' : undefined
      }
    }
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)