// scripts/check-env.js
// Run this script to verify your environment variables

// Load environment variables from .env.local
const fs = require('fs')
const path = require('path')

const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim()
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=')
      const value = valueParts.join('=')
      if (key && value) {
        process.env[key.trim()] = value.trim()
      }
    }
  })
  console.log('✅ Loaded .env.local file\n')
} else {
  console.log('⚠️  No .env.local file found\n')
}

console.log('🔍 Checking Environment Variables for NextAuth...\n')

const requiredVars = [
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'MONGODB_URI'
]

let hasErrors = false

requiredVars.forEach(varName => {
  const value = process.env[varName]
  if (!value) {
    console.log(`❌ ${varName}: NOT SET`)
    hasErrors = true
  } else {
    // Mask sensitive values
    const maskedValue = varName.includes('SECRET') || varName.includes('URI')
      ? value.substring(0, 10) + '...' + value.substring(value.length - 4)
      : value
    console.log(`✅ ${varName}: ${maskedValue}`)
  }
})

console.log('\n📋 Additional Checks:\n')

// Check NEXTAUTH_URL format
const nextauthUrl = process.env.NEXTAUTH_URL
if (nextauthUrl) {
  console.log(`NEXTAUTH_URL: ${nextauthUrl}`)

  if (!nextauthUrl.startsWith('https://') && process.env.NODE_ENV === 'production') {
    console.log('⚠️  WARNING: NEXTAUTH_URL should use https:// in production')
    hasErrors = true
  }

  if (nextauthUrl.endsWith('/')) {
    console.log('⚠️  WARNING: NEXTAUTH_URL should not end with a trailing slash')
    hasErrors = true
  }

  console.log(`\n📍 Expected Google Redirect URI:\n   ${nextauthUrl}/api/auth/callback/google`)
} else {
  console.log('❌ NEXTAUTH_URL is not set!')
  hasErrors = true
}

// Check NODE_ENV
console.log(`\n🌍 Environment: ${process.env.NODE_ENV || 'development'}`)

if (hasErrors) {
  console.log('\n❌ Configuration issues detected! Please fix the above errors.\n')
  process.exit(1)
} else {
  console.log('\n✅ All environment variables are properly configured!\n')
}
