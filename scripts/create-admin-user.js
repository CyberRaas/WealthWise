/**
 * Create Admin User Script
 *
 * Creates a new user with super_admin role
 */

const { MongoClient } = require('mongodb')
const bcrypt = require('bcryptjs')
const fs = require('fs')
const path = require('path')

// Load environment variables from .env.local
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8')
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '')
        process.env[key.trim()] = value
      }
    })
  }
}
loadEnv()

// Admin user details
const ADMIN_USER = {
  email: 'wealthwise@gmail.com',
  password: 'Akash@123',
  name: 'WealthWise Admin'
}

async function createAdminUser() {
  console.log('🔐 Create Admin User Script')
  console.log('===========================')
  console.log(`📧 Email: ${ADMIN_USER.email}`)
  console.log(`👤 Name: ${ADMIN_USER.name}`)
  console.log('')

  const mongoUri = process.env.MONGODB_URI

  if (!mongoUri) {
    console.error('❌ Error: MONGODB_URI not found in .env.local')
    process.exit(1)
  }

  let client

  try {
    console.log('📡 Connecting to MongoDB...')
    client = new MongoClient(mongoUri)
    await client.connect()
    console.log('✅ Connected to MongoDB')

    const dbName = process.env.MONGODB_DB_NAME || 'smart-financial-planner'
    const db = client.db(dbName)
    const usersCollection = db.collection('users')

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email: ADMIN_USER.email.toLowerCase() })

    if (existingUser) {
      console.log('⚠️  User already exists. Updating to super_admin...')

      // Hash password
      const hashedPassword = await bcrypt.hash(ADMIN_USER.password, 12)

      await usersCollection.updateOne(
        { email: ADMIN_USER.email.toLowerCase() },
        {
          $set: {
            password: hashedPassword,
            role: 'super_admin',
            isEmailVerified: true,
            adminProfile: {
              permissions: [],
              department: 'Owner',
              adminNotes: 'Primary admin account',
              lastAdminAction: null,
              adminCreatedAt: new Date(),
              adminCreatedBy: null
            },
            updatedAt: new Date()
          }
        }
      )
      console.log('✅ User updated to super_admin!')
    } else {
      console.log('➕ Creating new admin user...')

      // Hash password
      const hashedPassword = await bcrypt.hash(ADMIN_USER.password, 12)

      const newUser = {
        email: ADMIN_USER.email.toLowerCase(),
        name: ADMIN_USER.name,
        password: hashedPassword,
        avatar: null,
        isEmailVerified: true,
        emailVerified: new Date(),
        role: 'super_admin',
        status: 'active',
        preferences: {
          language: 'en',
          currency: 'INR',
          timezone: 'Asia/Kolkata',
          dateFormat: 'DD/MM/YYYY',
          numberFormat: 'indian',
          notifications: {
            email: true,
            push: true,
            budgetAlerts: true,
            goalReminders: true,
            weeklyReports: true,
            monthlyReports: true
          },
          privacy: {
            shareData: false,
            analytics: true,
            profileVisibility: 'private'
          },
          theme: 'system',
          dashboard: {
            defaultView: 'overview',
            compactMode: false
          }
        },
        profile: {
          city: '',
          country: 'India',
          familySize: 1,
          ageRange: '26-35',
          occupation: 'Administrator',
          financialExperience: 'advanced',
          bio: '',
          phone: '',
          dateOfBirth: null
        },
        subscription: {
          plan: 'premium',
          status: 'active',
          startDate: new Date(),
          endDate: null,
          features: ['basic_budgeting', 'expense_tracking', 'ai_insights', 'voice_input']
        },
        security: {
          lastLogin: null,
          loginCount: 0,
          twoFactorEnabled: false,
          passwordChangedAt: new Date()
        },
        onboarding: {
          completed: true,
          currentStep: 'completed',
          completedSteps: ['welcome', 'profile', 'preferences', 'budget_setup'],
          skippedSteps: []
        },
        activity: {
          lastActiveAt: new Date(),
          totalSessions: 0,
          averageSessionDuration: 0,
          featuresUsed: []
        },
        adminProfile: {
          permissions: [],
          department: 'Owner',
          adminNotes: 'Primary admin account',
          lastAdminAction: null,
          adminCreatedAt: new Date(),
          adminCreatedBy: null
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await usersCollection.insertOne(newUser)
      console.log('✅ Admin user created successfully!')
    }

    console.log('')
    console.log('🎉 Setup Complete!')
    console.log('==================')
    console.log('')
    console.log('Login credentials:')
    console.log(`  Email:    ${ADMIN_USER.email}`)
    console.log(`  Password: ${ADMIN_USER.password}`)
    console.log('')
    console.log('This account will redirect to /admin after login.')

  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  } finally {
    if (client) {
      await client.close()
      console.log('')
      console.log('📡 Disconnected from MongoDB')
    }
  }
}

createAdminUser()
