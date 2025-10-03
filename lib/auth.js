// // import NextAuth from "next-auth"
// // import CredentialsProvider from "next-auth/providers/credentials"
// // import GoogleProvider from "next-auth/providers/google"
// // import { MongoDBAdapter } from "@auth/mongodb-adapter"
// // import { connectToDatabase } from "./database"
// // import { encryptionService } from "./encryption"
// // import { loginSchema } from "./validations"
// // import { ObjectId } from "mongodb"
// // import config from "./config"

// // // Create MongoDB client promise for the adapter
// // let clientPromise

// // if (process.env.NODE_ENV === "development") {
// //   // In development mode, use a global variable so that the value
// //   // is preserved across module reloads caused by HMR (hot module replacement).
// //   if (!global._mongoClientPromise) {
// //     const { MongoClient } = await import("mongodb")
// //     const client = new MongoClient(process.env.MONGODB_URI, {
// //       maxPoolSize: 10,
// //       serverSelectionTimeoutMS: 5000,
// //       socketTimeoutMS: 45000,
// //       family: 4,
// //     })
// //     global._mongoClientPromise = client.connect()
// //   }
// //   clientPromise = global._mongoClientPromise
// // } else {
// //   // In production mode, it's best to not use a global variable.
// //   const { MongoClient } = await import("mongodb")
// //   const client = new MongoClient(process.env.MONGODB_URI, {
// //     maxPoolSize: 10,
// //     serverSelectionTimeoutMS: 5000,
// //     socketTimeoutMS: 45000,
// //     family: 4,
// //   })
// //   clientPromise = client.connect()
// // }

// // export const { handlers, auth, signIn, signOut } = NextAuth({
// //   adapter: MongoDBAdapter(clientPromise),
// //   providers: [
// //     CredentialsProvider({
// //       name: "credentials",
// //       credentials: {
// //         email: { label: "Email", type: "email" },
// //         password: { label: "Password", type: "password" }
// //       },
// //       async authorize(credentials) {
// //         try {
// //           // Validate input
// //           const validatedData = loginSchema.parse(credentials)
          
// //           const db = await connectToDatabase()
// //           const user = await db.collection("users").findOne({
// //             email: validatedData.email.toLowerCase()
// //           })
          
// //           if (!user) {
// //             return null
// //           }
          
// //           // Check if email is verified
// //           if (!user.isEmailVerified) {
// //             throw new Error("Please verify your email before signing in")
// //           }
          
// //           // Verify password
// //           const isValidPassword = await encryptionService.verifyPassword(
// //             validatedData.password, 
// //             user.password
// //           )
          
// //           if (!isValidPassword) {
// //             return null
// //           }
          
// //           // Update last login
// //           await db.collection("users").updateOne(
// //             { _id: user._id },
// //             { 
// //               $set: { 
// //                 lastLogin: new Date(),
// //                 updatedAt: new Date()
// //               }
// //             }
// //           )
          
// //           return {
// //             id: user._id.toString(),
// //             email: user.email,
// //             name: user.name,
// //             image: user.avatar,
// //             isEmailVerified: user.isEmailVerified,
// //             preferences: user.preferences,
// //             profile: user.profile
// //           }
// //         } catch (error) {
// //           console.error("Authentication error:", error)
// //           return null
// //         }
// //       }
// //     }),
    
// //     // Google Provider - Always include if environment variables exist
// //     ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
// //       GoogleProvider({
// //         clientId: process.env.GOOGLE_CLIENT_ID,
// //         clientSecret: process.env.GOOGLE_CLIENT_SECRET,
// //         authorization: {
// //           params: {
// //             prompt: "consent",
// //             access_type: "offline",
// //             response_type: "code"
// //           }
// //         },
// //         profile(profile) {
// //           return {
// //             id: profile.sub,
// //             name: profile.name,
// //             email: profile.email,
// //             image: profile.picture,
// //             isEmailVerified: profile.email_verified
// //           }
// //         }
// //       })
// //     ] : [])
// //   ],
// //   session: { 
// //     strategy: "jwt",
// //     maxAge: 30 * 24 * 60 * 60, // 30 days
// //     updateAge: 24 * 60 * 60, // 24 hours
// //   },
// //   callbacks: {
// //     async jwt({ token, user, account }) {
// //       // Initial sign in
// //       if (user) {
// //         token.id = user.id
// //         token.isEmailVerified = user.isEmailVerified
// //         token.preferences = user.preferences
// //         token.profile = user.profile
// //       }
      
// //       // Handle OAuth sign in
// //       if (account?.provider === "google") {
// //         const db = await connectToDatabase()
// //         const existingUser = await db.collection("users").findOne({
// //           email: token.email
// //         })
        
// //         if (!existingUser) {
// //           // Create new user for OAuth
// //           const newUser = {
// //             email: token.email,
// //             name: token.name,
// //             avatar: token.picture,
// //             isEmailVerified: true, // OAuth emails are considered verified
// //             preferences: {
// //               currency: 'USD',
// //               language: 'en',
// //               timezone: 'UTC',
// //               notifications: {
// //                 email: true,
// //                 push: true,
// //                 budgetAlerts: true,
// //                 goalReminders: true
// //               },
// //               privacy: {
// //                 shareData: false,
// //                 analytics: true
// //               }
// //             },
// //             profile: {
// //               city: '',
// //               country: '',
// //               familySize: 1,
// //               ageRange: '',
// //               occupation: '',
// //               financialExperience: 'beginner'
// //             },
// //             subscription: {
// //               plan: 'free',
// //               status: 'active',
// //               startDate: new Date(),
// //               endDate: null
// //             },
// //             createdAt: new Date(),
// //             updatedAt: new Date()
// //           }
          
// //           const result = await db.collection("users").insertOne(newUser)
// //           token.id = result.insertedId.toString()
// //           token.preferences = newUser.preferences
// //           token.profile = newUser.profile
// //         } else {
// //           token.id = existingUser._id.toString()
// //           token.isEmailVerified = existingUser.isEmailVerified
// //           token.preferences = existingUser.preferences
// //           token.profile = existingUser.profile
          
// //           // Update last login for OAuth users too
// //           await db.collection("users").updateOne(
// //             { _id: existingUser._id },
// //             { 
// //               $set: { 
// //                 lastLogin: new Date(),
// //                 updatedAt: new Date()
// //               }
// //             }
// //           )
// //         }
// //       }
      
// //       return token
// //     },
// //     async session({ session, token }) {
// //       if (token) {
// //         session.user.id = token.id
// //         session.user.isEmailVerified = token.isEmailVerified
// //         session.user.preferences = token.preferences
// //         session.user.profile = token.profile
// //       }
// //       return session
// //     },
// //     async signIn({ user, account, profile }) {
// //       // Allow OAuth sign-ins
// //       if (account?.provider === "google") {
// //         return true
// //       }
      
// //       // For credentials, user object will be null if authorization failed
// //       return user !== null
// //     }
// //   },
// //   pages: {
// //     signIn: "/auth/signin",
// //     signUp: "/auth/signup",
// //     error: "/auth/error", 
// //     verifyRequest: "/auth/verify-request",
// //     newUser: "/onboarding"
// //   },
// //   events: {
// //     async signIn({ user, account, profile, isNewUser }) {
// //       console.log(`User signed in: ${user.email}`)
      
// //       if (isNewUser && account?.provider === "google") {
// //         // Send welcome email for new OAuth users
// //         try {
// //           const { emailService } = await import('./emailService')
// //           await emailService.sendWelcomeEmail(user)
// //         } catch (error) {
// //           console.error('Failed to send welcome email:', error)
// //         }
// //       }
// //     },
// //     async signOut({ token }) {
// //       console.log(`User signed out: ${token?.email}`)
// //     }
// //   },
// //   debug: process.env.NODE_ENV === 'development',
// //   trustHost: true,
// //   secret: process.env.NEXTAUTH_SECRET
// // })


// // lib/auth.js
// import NextAuth from "next-auth"
// import CredentialsProvider from "next-auth/providers/credentials"
// import GoogleProvider from "next-auth/providers/google"
// import { MongoDBAdapter } from "@auth/mongodb-adapter"
// import { connectToDatabase } from "./database"
// import { encryptionService } from "./encryption"
// import { loginSchema } from "./validations"
// import { ObjectId } from "mongodb"

// // Create MongoDB client promise for the adapter
// let clientPromise

// if (process.env.NODE_ENV === "development") {
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
//           const validatedData = loginSchema.parse(credentials)
          
//           const db = await connectToDatabase()
//           const user = await db.collection("users").findOne({
//             email: validatedData.email.toLowerCase()
//           })
          
//           if (!user) {
//             return null
//           }
          
//           if (!user.isEmailVerified) {
//             throw new Error("Please verify your email before signing in")
//           }
          
//           const isValidPassword = await encryptionService.verifyPassword(
//             validatedData.password, 
//             user.password
//           )
          
//           if (!isValidPassword) {
//             return null
//           }
          
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
    
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       authorization: {
//         params: {
//           prompt: "consent",
//           access_type: "offline",
//           response_type: "code",
//           scope: "openid email profile"
//         }
//       },
//       profile(profile) {
//         return {
//           id: profile.sub,
//           name: profile.name,
//           email: profile.email,
//           image: profile.picture,
//           isEmailVerified: profile.email_verified
//         }
//       }
//     })
//   ],
//   session: { 
//     strategy: "jwt",
//     maxAge: 30 * 24 * 60 * 60, // 30 days
//     updateAge: 24 * 60 * 60, // 24 hours
//   },
//   callbacks: {
//     async jwt({ token, user, account }) {
//       if (user) {
//         token.id = user.id
//         token.isEmailVerified = user.isEmailVerified
//         token.preferences = user.preferences
//         token.profile = user.profile
//       }
      
//       if (account?.provider === "google") {
//         try {
//           const db = await connectToDatabase()
//           const existingUser = await db.collection("users").findOne({
//             email: token.email
//           })
          
//           if (!existingUser) {
//             const newUser = {
//               email: token.email,
//               name: token.name,
//               avatar: token.picture,
//               isEmailVerified: true,
//               preferences: {
//                 currency: 'USD',
//                 language: 'en',
//                 timezone: 'UTC',
//                 notifications: {
//                   email: true,
//                   push: true,
//                   budgetAlerts: true,
//                   goalReminders: true
//                 },
//                 privacy: {
//                   shareData: false,
//                   analytics: true
//                 }
//               },
//               profile: {
//                 city: '',
//                 country: '',
//                 familySize: 1,
//                 ageRange: '',
//                 occupation: '',
//                 financialExperience: 'beginner'
//               },
//               subscription: {
//                 plan: 'free',
//                 status: 'active',
//                 startDate: new Date(),
//                 endDate: null
//               },
//               createdAt: new Date(),
//               updatedAt: new Date()
//             }
            
//             const result = await db.collection("users").insertOne(newUser)
//             token.id = result.insertedId.toString()
//             token.preferences = newUser.preferences
//             token.profile = newUser.profile
//           } else {
//             token.id = existingUser._id.toString()
//             token.isEmailVerified = existingUser.isEmailVerified
//             token.preferences = existingUser.preferences
//             token.profile = existingUser.profile
            
//             await db.collection("users").updateOne(
//               { _id: existingUser._id },
//               { 
//                 $set: { 
//                   lastLogin: new Date(),
//                   updatedAt: new Date()
//                 }
//               }
//             )
//           }
//         } catch (error) {
//           console.error("Error in JWT callback:", error)
//           return token
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
        
//         // Fetch latest profile image from database
//         try {
//           const db = await connectToDatabase()
//           const userProfile = await db.collection("userprofiles").findOne({
//             email: session.user.email
//           })
          
//           if (userProfile && userProfile.profileImage) {
//             session.user.image = userProfile.profileImage
//           }
//         } catch (error) {
//           console.error('Error fetching profile image:', error)
//         }
//       }
//       return session
//     },
    
//     async signIn({ user, account, profile }) {
//       if (account?.provider === "google") {
//         return true
//       }
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


// lib/auth.js - PRODUCTION READY VERSION
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import { connectToDatabase } from "./database"
import { encryptionService } from "./encryption"
import { loginSchema } from "./validations"

// Create MongoDB client promise for the adapter
let clientPromise

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    const { MongoClient } = await import("mongodb")
    const client = new MongoClient(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
    })
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  const { MongoClient } = await import("mongodb")
  const client = new MongoClient(process.env.MONGODB_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4,
  })
  clientPromise = client.connect()
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
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
            profile: user.profile
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
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          isEmailVerified: profile.email_verified
        }
      },
      // Add these for better error handling
      allowDangerousEmailAccountLinking: false,
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
      }
      
      if (account?.provider === "google") {
        try {
          const db = await connectToDatabase()
          const existingUser = await db.collection("users").findOne({
            email: token.email
          })
          
          if (!existingUser) {
            const newUser = {
              email: token.email,
              name: token.name,
              avatar: token.picture,
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
            
            const result = await db.collection("users").insertOne(newUser)
            token.id = result.insertedId.toString()
            token.preferences = newUser.preferences
            token.profile = newUser.profile
          } else {
            token.id = existingUser._id.toString()
            token.isEmailVerified = existingUser.isEmailVerified
            token.preferences = existingUser.preferences || {}
            token.profile = existingUser.profile || {}
            
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
          }
        } catch (error) {
          console.error("Error in JWT callback:", error)
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
    
    // ADD THIS: Redirect callback to handle errors properly
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
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
  debug: process.env.NODE_ENV === 'development',
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
  
  // ADD THESE for production
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
        secure: process.env.NODE_ENV === 'production'
      }
    }
  }
})