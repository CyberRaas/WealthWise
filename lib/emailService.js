import nodemailer from 'nodemailer'

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })
  }

  async sendEmail({ to, subject, html, text }) {
    try {
      const mailOptions = {
        from: `"Smart Financial Planner" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
        text
      }

      const result = await this.transporter.sendMail(mailOptions)
      console.log('Email sent successfully:', result.messageId)
      return { success: true, messageId: result.messageId }
    } catch (error) {
      console.error('Email sending failed:', error)
      return { success: false, error: error.message }
    }
  }

  async sendWelcomeEmail(user) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to Smart Financial Planner</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Smart Financial Planner!</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.name}!</h2>
            <p>Thank you for joining Smart Financial Planner. We're excited to help you take control of your finances and achieve your financial goals.</p>
            
            <h3>What's Next?</h3>
            <ul>
              <li>Complete your profile setup</li>
              <li>Create your first budget</li>
              <li>Set up your financial goals</li>
              <li>Start tracking your expenses</li>
            </ul>
            
            <p>Our AI-powered assistant is ready to help you make smart financial decisions every step of the way.</p>
            
            <a href="${process.env.NEXTAUTH_URL}/dashboard" class="button">Get Started</a>
          </div>
          <div class="footer">
            <p>Happy budgeting!<br>The Smart Financial Planner Team</p>
          </div>
        </div>
      </body>
      </html>
    `

    const text = `
      Welcome to Smart Financial Planner!
      
      Hello ${user.name}!
      
      Thank you for joining Smart Financial Planner. We're excited to help you take control of your finances and achieve your financial goals.
      
      What's Next?
      - Complete your profile setup
      - Create your first budget
      - Set up your financial goals
      - Start tracking your expenses
      
      Visit ${process.env.NEXTAUTH_URL}/dashboard to get started.
      
      Happy budgeting!
      The Smart Financial Planner Team
    `

    return await this.sendEmail({
      to: user.email,
      subject: 'Welcome to Smart Financial Planner!',
      html,
      text
    })
  }

  async sendEmailVerification(user, token) {
    const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}`
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Verify Your Email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Verify Your Email Address</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.name}!</h2>
            <p>Thank you for registering with Smart Financial Planner. To complete your registration, please verify your email address by clicking the button below.</p>
            
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
            
            <p><strong>This link will expire in 24 hours.</strong></p>
            
            <p>If you didn't create an account with Smart Financial Planner, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            <p>Best regards,<br>The Smart Financial Planner Team</p>
          </div>
        </div>
      </body>
      </html>
    `

    const text = `
      Verify Your Email Address
      
      Hello ${user.name}!
      
      Thank you for registering with Smart Financial Planner. To complete your registration, please verify your email address by visiting this link:
      
      ${verificationUrl}
      
      This link will expire in 24 hours.
      
      If you didn't create an account with Smart Financial Planner, you can safely ignore this email.
      
      Best regards,
      The Smart Financial Planner Team
    `

    return await this.sendEmail({
      to: user.email,
      subject: 'Verify Your Email Address',
      html,
      text
    })
  }

  async sendPasswordReset(user, token) {
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Your Password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reset Your Password</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.name}!</h2>
            <p>You requested to reset your password for your Smart Financial Planner account. Click the button below to create a new password.</p>
            
            <a href="${resetUrl}" class="button">Reset Password</a>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${resetUrl}</p>
            
            <div class="warning">
              <strong>Security Notice:</strong>
              <ul>
                <li>This link will expire in 1 hour for your security</li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>Your password will remain unchanged until you create a new one</li>
              </ul>
            </div>
          </div>
          <div class="footer">
            <p>Stay secure,<br>The Smart Financial Planner Team</p>
          </div>
        </div>
      </body>
      </html>
    `

    const text = `
      Reset Your Password
      
      Hello ${user.name}!
      
      You requested to reset your password for your Smart Financial Planner account. Visit this link to create a new password:
      
      ${resetUrl}
      
      Security Notice:
      - This link will expire in 1 hour for your security
      - If you didn't request this reset, please ignore this email
      - Your password will remain unchanged until you create a new one
      
      Stay secure,
      The Smart Financial Planner Team
    `

    return await this.sendEmail({
      to: user.email,
      subject: 'Reset Your Password - Smart Financial Planner',
      html,
      text
    })
  }
}

export const emailService = new EmailService()
