// Modern MongoDB connection with proper error handling for Vercel serverless
import { MongoClient } from 'mongodb'

// Global MongoDB client and database cache
let cachedClient = null
let cachedDb = null
let clientPromise = null

// MongoDB connection options optimized for serverless
const mongoOptions = {
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 30000, // 30 seconds for serverless cold starts
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
  family: 4,
  retryWrites: true,
  retryReads: true,
  w: 'majority',
}

export async function connectToDatabase() {
  // Return cached connection if available
  if (cachedClient && cachedDb) {
    try {
      // Verify the connection is still alive
      await cachedClient.db().admin().ping()
      return cachedDb
    } catch (error) {
      console.warn('⚠️ Cached connection failed, reconnecting...', error.message)
      cachedClient = null
      cachedDb = null
    }
  }

  // Create new connection
  try {
    const mongoUri = process.env.MONGODB_URI
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set')
    }

    console.log('🔌 Connecting to MongoDB...')
    const client = new MongoClient(mongoUri, mongoOptions)
    
    // Connect to MongoDB with timeout handling
    await client.connect()
    
    // Verify connection
    await client.db().admin().ping()
    
    // Get database instance
    const db = client.db()
    
    // Cache the connection
    cachedClient = client
    cachedDb = db
    
    // Set up database indexes and constraints (non-blocking)
    setupDatabase(db).catch(err => console.error('Index setup error:', err))
    
    console.log('✅ Connected to MongoDB successfully')
    return db
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error)
    cachedClient = null
    cachedDb = null
    throw new Error(`Database connection failed: ${error.message}`)
  }
}

// Database setup function
async function setupDatabase(db) {
  try {
    // Users collection indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true })
    await db.collection('users').createIndex({ emailVerificationToken: 1 }, { sparse: true })
    await db.collection('users').createIndex({ passwordResetToken: 1 }, { sparse: true })
    await db.collection('users').createIndex({ createdAt: 1 })
    
    // Sessions collection indexes (for NextAuth)
    await db.collection('sessions').createIndex({ sessionToken: 1 }, { unique: true })
    await db.collection('sessions').createIndex({ userId: 1 })
    await db.collection('sessions').createIndex({ expires: 1 }, { expireAfterSeconds: 0 })
    
    // Accounts collection indexes (for NextAuth OAuth)
    await db.collection('accounts').createIndex({ provider: 1, providerAccountId: 1 }, { unique: true })
    await db.collection('accounts').createIndex({ userId: 1 })
    
    // Verification tokens collection indexes
    await db.collection('verification_tokens').createIndex({ token: 1 }, { unique: true })
    await db.collection('verification_tokens').createIndex({ identifier: 1, token: 1 }, { unique: true })
    await db.collection('verification_tokens').createIndex({ expires: 1 }, { expireAfterSeconds: 0 })
    
    console.log('✅ Database indexes created successfully')
  } catch (error) {
    // Ignore duplicate index errors
    if (error.code !== 85) {
      console.error('Database setup warning:', error.message)
    }
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  if (cachedClient) {
    await cachedClient.close()
    console.log('📦 MongoDB connection closed.')
  }
  process.exit(0)
})

process.on('SIGTERM', async () => {
  if (cachedClient) {
    await cachedClient.close()
    console.log('📦 MongoDB connection closed.')
  }
  process.exit(0)
})

// For NextAuth MongoDB adapter
const clientPromise = (async () => {
  try {
    const { client } = await connectToDatabase()
    return client
  } catch (error) {
    console.error('Failed to create MongoDB client promise:', error)
    throw error
  }
})()

export default clientPromise
