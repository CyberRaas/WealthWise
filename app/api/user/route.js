import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { connectToDatabase } from "@/lib/database"
import { encryptionService } from "@/lib/encryption"
import { updateProfileSchema } from "@/lib/validations"
import { AppError, ValidationError, asyncHandler, formatErrorResponse } from "@/lib/errors"
import { ObjectId } from "mongodb"

// GET /api/user - Get current user profile
async function getUserHandler(req) {
  const session = await auth()
  
  if (!session?.user) {
    throw new AppError('Authentication required', 401, 'UNAUTHORIZED')
  }
  
  const db = await connectToDatabase()
  const user = await db.collection("users").findOne(
    { _id: new ObjectId(session.user.id) },
    { 
      projection: { 
        password: 0, 
        passwordResetToken: 0, 
        passwordResetExpires: 0,
        emailVerificationToken: 0,
        emailVerificationExpires: 0
      } 
    }
  )
  
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND')
  }
  
  return NextResponse.json({
    success: true,
    data: { user }
  })
}

// PUT /api/user - Update user profile
async function updateUserHandler(req) {
  const session = await auth()
  
  if (!session?.user) {
    throw new AppError('Authentication required', 401, 'UNAUTHORIZED')
  }
  
  const body = await req.json()
  const validatedData = updateProfileSchema.parse(body)
  
  const db = await connectToDatabase()
  
  // Check if email is being changed and if it already exists
  if (validatedData.email) {
    const existingUser = await db.collection("users").findOne({
      email: validatedData.email.toLowerCase(),
      _id: { $ne: new ObjectId(session.user.id) }
    })
    
    if (existingUser) {
      throw new AppError('User with this email already exists', 409, 'DUPLICATE_EMAIL')
    }
  }
  
  // Prepare update data
  const updateData = {
    updatedAt: new Date()
  }
  
  if (validatedData.name) updateData.name = validatedData.name
  if (validatedData.avatar) updateData.avatar = validatedData.avatar
  if (validatedData.preferences) updateData.preferences = validatedData.preferences
  if (validatedData.profile) updateData.profile = validatedData.profile
  
  // If email is being changed, reset verification
  if (validatedData.email) {
    updateData.email = validatedData.email.toLowerCase()
    updateData.isEmailVerified = false
    
    const emailVerification = encryptionService.generateEmailVerificationToken()
    updateData.emailVerificationToken = emailVerification.token
    updateData.emailVerificationExpires = emailVerification.expiresAt
    
    // Send verification email for new email
    try {
      const { emailService } = await import('@/lib/emailService')
      await emailService.sendEmailVerification({
        email: validatedData.email,
        name: session.user.name || 'User'
      }, emailVerification.token)
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError)
    }
  }
  
  // Update user in database
  const result = await db.collection("users").findOneAndUpdate(
    { _id: new ObjectId(session.user.id) },
    { $set: updateData },
    { 
      returnDocument: 'after',
      projection: { 
        password: 0, 
        passwordResetToken: 0, 
        passwordResetExpires: 0,
        emailVerificationToken: 0,
        emailVerificationExpires: 0
      }
    }
  )
  
  if (!result.value) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND')
  }
  
  return NextResponse.json({
    success: true,
    message: validatedData.email ? "Profile updated. Please verify your new email address." : "Profile updated successfully",
    data: { user: result.value }
  })
}

export const GET = asyncHandler(getUserHandler)
export const PUT = asyncHandler(updateUserHandler)
