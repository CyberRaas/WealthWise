/**
 * Setup Super Admin Script
 *
 * This script grants super_admin privileges to a specified user.
 *
 * Usage:
 *   node scripts/setup-super-admin.js
 *
 * Or with a custom email:
 *   node scripts/setup-super-admin.js your-email@example.com
 */

const { MongoClient } = require('mongodb')
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

// Default email - change this or pass as argument
const DEFAULT_EMAIL = 'iamaakash1006@gmail.com'

async function setupSuperAdmin() {
  const email = process.argv[2] || DEFAULT_EMAIL

  console.log('🔐 Super Admin Setup Script')
  console.log('===========================')
  console.log(`📧 Email: ${email}`)
  console.log('')

  // Get MongoDB URI from environment
  const mongoUri = process.env.MONGODB_URI

  if (!mongoUri) {
    console.error('❌ Error: MONGODB_URI not found in .env.local')
    console.error('   Make sure you have a .env.local file with MONGODB_URI set')
    process.exit(1)
  }

  let client

  try {
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...')
    client = new MongoClient(mongoUri)
    await client.connect()
    console.log('✅ Connected to MongoDB')

    // Get database name from URI or use default
    const dbName = process.env.MONGODB_DB_NAME || 'smart-financial-planner'
    const db = client.db(dbName)
    const usersCollection = db.collection('users')

    // Find the user
    console.log(`🔍 Looking for user: ${email}`)
    const user = await usersCollection.findOne({ email: email.toLowerCase() })

    if (!user) {
      console.error(`❌ Error: User with email "${email}" not found`)
      console.error('   Make sure the user has registered first')
      process.exit(1)
    }

    console.log(`✅ Found user: ${user.name || 'Unknown'} (${user.email})`)
    console.log(`   Current role: ${user.role || 'user'}`)

    // Check if already super_admin
    if (user.role === 'super_admin') {
      console.log('')
      console.log('ℹ️  User is already a super_admin!')
      console.log('   No changes needed.')
      process.exit(0)
    }

    // Update to super_admin
    console.log('')
    console.log('🔄 Updating user to super_admin...')

    const result = await usersCollection.updateOne(
      { email: email.toLowerCase() },
      {
        $set: {
          role: 'super_admin',
          adminProfile: {
            permissions: [], // Super admin has all permissions by default
            department: 'Owner',
            adminNotes: 'Initial super admin setup',
            lastAdminAction: null,
            adminCreatedAt: new Date(),
            adminCreatedBy: null // Self-created
          },
          updatedAt: new Date()
        }
      }
    )

    if (result.modifiedCount === 1) {
      console.log('✅ Successfully updated user to super_admin!')
      console.log('')
      console.log('🎉 Setup Complete!')
      console.log('==================')
      console.log('')
      console.log('Next steps:')
      console.log('1. Sign out of the application (if logged in)')
      console.log('2. Sign back in')
      console.log('3. Navigate to /admin to access the Admin Panel')
      console.log('')
      console.log('Admin Panel URLs:')
      console.log('  - Local:      http://localhost:3000/admin')
      console.log('  - Production: https://www.mywealthwise.tech/admin')
    } else {
      console.error('❌ Failed to update user. No documents modified.')
      process.exit(1)
    }

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

// Run the script
setupSuperAdmin()
