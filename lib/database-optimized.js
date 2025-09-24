// Optimized MongoDB connection with connection pooling and caching
import { MongoClient } from 'mongodb'
import config from './config.js'

class DatabaseManager {
  constructor() {
    this.client = null
    this.db = null
    this.isConnecting = false
    this.connectionPromise = null
    this.connectionCount = 0
    this.maxRetries = 3
    this.retryDelay = 1000
  }

  async connect(retryCount = 0) {
    // Return existing connection if available
    if (this.db && this.client?.topology?.isConnected()) {
      return this.db
    }

    // Wait for existing connection attempt
    if (this.isConnecting && this.connectionPromise) {
      return this.connectionPromise
    }

    this.isConnecting = true
    this.connectionPromise = this._performConnection(retryCount)

    try {
      const db = await this.connectionPromise
      this.isConnecting = false
      return db
    } catch (error) {
      this.isConnecting = false
      this.connectionPromise = null
      throw error
    }
  }

  async _performConnection(retryCount) {
    try {
      // Enhanced connection options for production
      const options = {
        ...config.database.options,
        maxPoolSize: process.env.NODE_ENV === 'production' ? 20 : 10,
        minPoolSize: process.env.NODE_ENV === 'production' ? 5 : 2,
        maxIdleTimeMS: 30000,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4,
        retryWrites: true,
        retryReads: true,
        readPreference: 'primary',
        writeConcern: {
          w: 'majority',
          j: true,
          wtimeout: 10000
        }
      }

      this.client = new MongoClient(config.database.uri, options)

      // Connect with timeout
      await Promise.race([
        this.client.connect(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Connection timeout')), 10000)
        )
      ])

      this.db = this.client.db()

      // Setup database indexes and optimization
      await this._setupDatabase()

      // Setup connection event handlers
      this._setupEventHandlers()

      this.connectionCount++
      console.log(`✅ MongoDB connected (attempt ${this.connectionCount})`)

      return this.db
    } catch (error) {
      console.error(`❌ MongoDB connection failed (attempt ${retryCount + 1}):`, error.message)

      // Retry logic
      if (retryCount < this.maxRetries) {
        console.log(`⏳ Retrying connection in ${this.retryDelay}ms...`)
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * (retryCount + 1)))
        return this._performConnection(retryCount + 1)
      }

      throw new Error(`Database connection failed after ${this.maxRetries} attempts: ${error.message}`)
    }
  }

  async _setupDatabase() {
    try {
      // Create indexes with background option for production
      const indexOptions = { background: true }

      // Users collection indexes
      await Promise.all([
        this.db.collection('users').createIndex({ email: 1 }, { ...indexOptions, unique: true }),
        this.db.collection('users').createIndex({ 'preferences.language': 1 }, indexOptions),
        this.db.collection('users').createIndex({ status: 1, createdAt: -1 }, indexOptions),
        this.db.collection('users').createIndex({ 'onboarding.completed': 1 }, indexOptions),
        this.db.collection('users').createIndex({ 'activity.lastActiveAt': -1 }, indexOptions)
      ])

      // Expenses collection indexes
      await Promise.all([
        this.db.collection('expenses').createIndex({ userId: 1, date: -1 }, indexOptions),
        this.db.collection('expenses').createIndex({ userId: 1, category: 1 }, indexOptions),
        this.db.collection('expenses').createIndex({ createdAt: -1 }, indexOptions)
      ])

      // Goals collection indexes
      await Promise.all([
        this.db.collection('goals').createIndex({ userId: 1, isActive: 1 }, indexOptions),
        this.db.collection('goals').createIndex({ userId: 1, targetDate: 1 }, indexOptions)
      ])

      // Sessions and auth-related indexes
      await Promise.all([
        this.db.collection('sessions').createIndex({ sessionToken: 1 }, { ...indexOptions, unique: true }),
        this.db.collection('sessions').createIndex({ expires: 1 }, { ...indexOptions, expireAfterSeconds: 0 }),
        this.db.collection('accounts').createIndex({ userId: 1 }, indexOptions),
        this.db.collection('verification_tokens').createIndex({ token: 1 }, { ...indexOptions, unique: true }),
        this.db.collection('verification_tokens').createIndex({ expires: 1 }, { ...indexOptions, expireAfterSeconds: 0 })
      ])

      console.log('✅ Database indexes created successfully')
    } catch (error) {
      // Ignore duplicate index errors (code 85)
      if (error.code !== 85) {
        console.warn('⚠️ Database index creation warning:', error.message)
      }
    }
  }

  _setupEventHandlers() {
    if (!this.client) return

    this.client.on('serverOpening', () => {
      console.log('📡 MongoDB server connection opening')
    })

    this.client.on('serverClosed', () => {
      console.log('📡 MongoDB server connection closed')
    })

    this.client.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error)
    })

    this.client.on('timeout', () => {
      console.warn('⏰ MongoDB connection timeout')
    })

    this.client.on('close', () => {
      console.log('📦 MongoDB connection closed')
      this.db = null
    })
  }

  async disconnect() {
    if (this.client) {
      await this.client.close()
      this.client = null
      this.db = null
      console.log('📦 MongoDB disconnected')
    }
  }

  // Get database instance with automatic reconnection
  async getDatabase() {
    if (!this.db || !this.client?.topology?.isConnected()) {
      return await this.connect()
    }
    return this.db
  }

  // Health check
  async healthCheck() {
    try {
      const db = await this.getDatabase()
      await db.admin().ping()
      return { status: 'healthy', connectionCount: this.connectionCount }
    } catch (error) {
      return { status: 'unhealthy', error: error.message }
    }
  }

  // Get connection stats
  getStats() {
    return {
      isConnected: this.client?.topology?.isConnected() || false,
      connectionCount: this.connectionCount,
      hasDatabase: !!this.db
    }
  }
}

// Create singleton instance
const dbManager = new DatabaseManager()

// Export the connect function for backward compatibility
export const connectToDatabase = () => dbManager.connect()

// Graceful shutdown handlers
const gracefulShutdown = async () => {
  console.log('🔄 Graceful shutdown initiated...')
  await dbManager.disconnect()
  process.exit(0)
}

process.on('SIGINT', gracefulShutdown)
process.on('SIGTERM', gracefulShutdown)
process.on('SIGQUIT', gracefulShutdown)

// Handle uncaught exceptions
process.on('uncaughtException', async (error) => {
  console.error('💥 Uncaught Exception:', error)
  await dbManager.disconnect()
  process.exit(1)
})

process.on('unhandledRejection', async (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason)
  await dbManager.disconnect()
  process.exit(1)
})

export default dbManager