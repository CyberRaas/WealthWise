// Modern OTP service with rate limiting and security
import crypto from 'crypto'
import { encryptionService } from './encryption.js'
import config from './config.js'

export class OTPService {
  constructor() {
    this.otpLength = 6
    this.otpExpiry = 10 * 60 * 1000 // 10 minutes
    this.maxAttempts = 5
    this.resendCooldown = 60 * 1000 // 1 minute
    this.rateLimitWindow = 15 * 60 * 1000 // 15 minutes
    this.maxOtpPerWindow = 5
  }

  /**
   * Generate a secure 6-digit OTP
   */
  generateOTP() {
    // Generate cryptographically secure random 6-digit number
    const randomBytes = crypto.randomBytes(4)
    const randomNumber = randomBytes.readUInt32BE(0)
    const otp = String(randomNumber % 1000000).padStart(6, '0')
    
    return otp
  }

  /**
   * Hash OTP for secure storage
   */
  async hashOTP(otp) {
    return await encryptionService.hashPassword(otp)
  }

  /**
   * Verify OTP against hash
   */
  async verifyOTP(otp, hashedOtp) {
    return await encryptionService.verifyPassword(otp, hashedOtp)
  }

  /**
   * Create OTP data for database storage
   */
  async createOTPData(email, type) {
    const otp = this.generateOTP()
    const hashedOtp = await this.hashOTP(otp)
    const expiresAt = new Date(Date.now() + this.otpExpiry)
    
    return {
      otp, // Plain OTP for sending via email/SMS
      otpData: {
        email: email.toLowerCase(),
        hashedOtp,
        type,
        expiresAt,
        attempts: 0,
        createdAt: new Date(),
        verified: false
      }
    }
  }

  /**
   * Validate OTP attempt
   */
  async validateOTPAttempt(storedOtpData, providedOtp) {
    // Check if OTP has expired
    if (new Date() > storedOtpData.expiresAt) {
      return {
        success: false,
        error: 'OTP has expired',
        code: 'OTP_EXPIRED'
      }
    }

    // Check if already verified
    if (storedOtpData.verified) {
      return {
        success: false,
        error: 'OTP already used',
        code: 'OTP_ALREADY_USED'
      }
    }

    // Check attempts limit
    if (storedOtpData.attempts >= this.maxAttempts) {
      return {
        success: false,
        error: 'Too many invalid attempts',
        code: 'TOO_MANY_ATTEMPTS'
      }
    }

    // Verify OTP
    const isValid = await this.verifyOTP(providedOtp, storedOtpData.hashedOtp)
    
    if (!isValid) {
      return {
        success: false,
        error: 'Invalid OTP',
        code: 'INVALID_OTP',
        attemptsRemaining: this.maxAttempts - (storedOtpData.attempts + 1)
      }
    }

    return {
      success: true,
      message: 'OTP verified successfully'
    }
  }

  /**
   * Check rate limiting for OTP requests
   */
  checkRateLimit(otpHistory) {
    const now = new Date()
    const windowStart = new Date(now.getTime() - this.rateLimitWindow)
    
    const recentRequests = otpHistory.filter(request => 
      request.createdAt > windowStart
    )

    if (recentRequests.length >= this.maxOtpPerWindow) {
      const oldestRequest = recentRequests[0]
      const timeUntilReset = oldestRequest.createdAt.getTime() + this.rateLimitWindow - now.getTime()
      
      return {
        allowed: false,
        timeUntilReset: Math.ceil(timeUntilReset / 1000), // seconds
        message: `Too many OTP requests. Try again in ${Math.ceil(timeUntilReset / 1000 / 60)} minutes.`
      }
    }

    return { allowed: true }
  }

  /**
   * Check resend cooldown
   */
  checkResendCooldown(lastOtpTime) {
    if (!lastOtpTime) return { allowed: true }
    
    const now = new Date()
    const timeSinceLastOtp = now.getTime() - lastOtpTime.getTime()
    
    if (timeSinceLastOtp < this.resendCooldown) {
      const timeUntilResend = this.resendCooldown - timeSinceLastOtp
      
      return {
        allowed: false,
        timeUntilResend: Math.ceil(timeUntilResend / 1000), // seconds
        message: `Please wait ${Math.ceil(timeUntilResend / 1000)} seconds before requesting another OTP.`
      }
    }

    return { allowed: true }
  }

  /**
   * Generate email content for OTP
   */
  generateEmailContent(otp, type, userName = 'User') {
    const templates = {
      registration: {
        subject: 'Verify Your Account - WealthWise ',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #2563eb; text-align: center; margin-bottom: 30px;">Welcome to WealthWise !</h2>
              <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Hi ${userName},</p>
              <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Thank you for registering! Please use the OTP below to verify your account:</p>
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
                <h1 style="font-size: 32px; color: #2563eb; margin: 0; letter-spacing: 8px; font-weight: bold;">${otp}</h1>
              </div>
              <p style="font-size: 14px; color: #6b7280; text-align: center; margin-bottom: 20px;">This OTP will expire in 10 minutes.</p>
              <p style="font-size: 14px; color: #6b7280;">If you didn't request this, please ignore this email.</p>
            </div>
          </div>
        `
      },
      login: {
        subject: 'Login Verification - WealthWise ',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #2563eb; text-align: center; margin-bottom: 30px;">Login Verification</h2>
              <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Hi ${userName},</p>
              <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Use this OTP to complete your login:</p>
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
                <h1 style="font-size: 32px; color: #2563eb; margin: 0; letter-spacing: 8px; font-weight: bold;">${otp}</h1>
              </div>
              <p style="font-size: 14px; color: #6b7280; text-align: center; margin-bottom: 20px;">This OTP will expire in 10 minutes.</p>
              <p style="font-size: 14px; color: #6b7280;">If you didn't request this, please secure your account immediately.</p>
            </div>
          </div>
        `
      },
      password_reset: {
        subject: 'Password Reset OTP - WealthWise ',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #dc2626; text-align: center; margin-bottom: 30px;">Password Reset Request</h2>
              <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Hi ${userName},</p>
              <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Use this OTP to reset your password:</p>
              <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0; border: 2px solid #fecaca;">
                <h1 style="font-size: 32px; color: #dc2626; margin: 0; letter-spacing: 8px; font-weight: bold;">${otp}</h1>
              </div>
              <p style="font-size: 14px; color: #6b7280; text-align: center; margin-bottom: 20px;">This OTP will expire in 10 minutes.</p>
              <p style="font-size: 14px; color: #6b7280;">If you didn't request this, please ignore this email and consider changing your password.</p>
            </div>
          </div>
        `
      }
    }

    return templates[type] || templates.registration
  }
}

// Create singleton instance
export const otpService = new OTPService()
export default otpService
