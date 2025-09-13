import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/database'
import { emailService } from '@/lib/emailService'
import { z } from 'zod'

const resendSchema = z.object({
  email: z.string().email()
})

export async function POST(request) {
  try {
    const body = await request.json()
    const { email } = resendSchema.parse(body)

    const db = await connectToDatabase()
    const user = await db.collection("users").findOne({
      email: email.toLowerCase()
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' }, 
        { status: 404 }
      )
    }

    if (user.isEmailVerified) {
      return NextResponse.json(
        { error: 'Email already verified' }, 
        { status: 400 }
      )
    }

    // Send verification email
    await emailService.sendVerificationEmail(user)

    return NextResponse.json(
      { message: 'Verification email sent successfully' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { error: 'Failed to send verification email' }, 
      { status: 500 }
    )
  }
}