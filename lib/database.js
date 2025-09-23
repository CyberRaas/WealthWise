// Modern MongoDB connection with proper error handling
import { MongoClient } from 'mongodb'
import config from './config.js'

// Global MongoDB client promise
let cachedClient = null
let cachedDb = null

export async function connectToDatabase() {
  // Return cached connection if available
  if (cachedClient && cachedDb) {
    return cachedDb
  }

  // Create new connection
  try {
    const client = new MongoClient(config.database.uri, config.database.options)
    
    // Connect to MongoDB
    await client.connect()
    
    // Get database instance
    const db = client.db()
    
    // Cache the connection
    cachedClient = client
    cachedDb = db
    
    // Set up database indexes and constraints
    await setupDatabase(db)
    
    console.log('✅ Connected to MongoDB')
    return db
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error)
    throw new Error(`Database connection failed: ${error.message}`)
  }
}

// Export client for NextAuth MongoDB adapter
export async function getMongoClient() {
  if (cachedClient) {
    return cachedClient
  }
  
  try {
    const client = new MongoClient(config.database.uri, config.database.options)
    await client.connect()
    cachedClient = client
    return client
  } catch (error) {
    console.error('❌ MongoDB client connection failed:', error)
    throw new Error(`Database client connection failed: ${error.message}`)
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
    return await getMongoClient()
  } catch (error) {
    console.error('Failed to create MongoDB client promise:', error)
    throw error
  }
})()

export default clientPromise
