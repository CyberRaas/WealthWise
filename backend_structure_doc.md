# WealthWise  - Backend Architecture Document

**Version:** 1.0  
**Date:** July 26, 2025  
**Prepared by:** Backend Engineering Team  
**Technology Stack:** Next.js 15, MongoDB, Gemini AI  

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Database Schema Design](#database-schema-design)
3. [API Structure](#api-structure)
4. [Authentication & Authorization](#authentication--authorization)
5. [AI Integration Layer](#ai-integration-layer)
6. [Service Layer Architecture](#service-layer-architecture)
7. [Data Flow & Processing](#data-flow--processing)
8. [Error Handling & Validation](#error-handling--validation)
9. [Performance & Caching](#performance--caching)
10. [Security Implementation](#security-implementation)
11. [Deployment Architecture](#deployment-architecture)

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Database**: MongoDB Atlas
- **AI Service**: Google Gemini AI
- **Authentication**: NextAuth.js v5
- **File Storage**: MongoDB GridFS / Cloudinary
- **Caching**: Redis (for sessions and frequently accessed data)
- **Email**: Resend / SendGrid
- **Currency API**: ExchangeRate-API / Fixer.io

### Architecture Pattern
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │────│   API Routes    │────│   Service Layer │
│   (Frontend)    │    │   (Controllers) │    │   (Business)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Middleware    │    │   Data Access   │
                       │   (Auth/Cors)   │    │   Layer (DAO)   │
                       └─────────────────┘    └─────────────────┘
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │    MongoDB      │
                                              │    Database     │
                                              └─────────────────┘
```

## Database Schema Design

### Core Collections

#### 1. Users Collection
```javascript
{
  _id: ObjectId,
  email: String, // unique
  password: String, // hashed
  name: String,
  avatar: String,
  isEmailVerified: Boolean,
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  preferences: {
    currency: String, // USD, INR, EUR, etc.
    language: String,
    timezone: String,
    notifications: {
      email: Boolean,
      push: Boolean,
      budgetAlerts: Boolean,
      goalReminders: Boolean
    },
    privacy: {
      shareData: Boolean,
      analytics: Boolean
    }
  },
  profile: {
    city: String,
    country: String,
    familySize: Number,
    ageRange: String,
    occupation: String,
    financialExperience: String
  },
  subscription: {
    plan: String, // free, premium
    status: String,
    startDate: Date,
    endDate: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### 2. Budgets Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId, // ref: Users
  name: String,
  type: String, // personal, shared, family
  monthlyIncome: Number,
  currency: String,
  allocations: {
    housing: { percentage: Number, amount: Number },
    food: { percentage: Number, amount: Number },
    transportation: { percentage: Number, amount: Number },
    utilities: { percentage: Number, amount: Number },
    healthcare: { percentage: Number, amount: Number },
    entertainment: { percentage: Number, amount: Number },
    savings: { percentage: Number, amount: Number },
    emergency: { percentage: Number, amount: Number },
    investments: { percentage: Number, amount: Number },
    miscellaneous: { percentage: Number, amount: Number }
  },
  aiGenerated: Boolean,
  aiRecommendations: String,
  lastModified: Date,
  version: Number, // for budget history
  isActive: Boolean,
  collaborators: [{
    userId: ObjectId,
    role: String, // view, edit, admin
    addedAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

#### 3. Expenses Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId, // ref: Users
  budgetId: ObjectId, // ref: Budgets
  amount: Number,
  currency: String,
  category: String,
  subcategory: String,
  description: String,
  merchant: String,
  date: Date,
  paymentMethod: String,
  tags: [String],
  receipt: {
    filename: String,
    url: String,
    ocrData: {
      merchantName: String,
      amount: Number,
      date: Date,
      items: [String],
      confidence: Number
    }
  },
  location: {
    lat: Number,
    lng: Number,
    address: String
  },
  isRecurring: Boolean,
  recurringPattern: {
    frequency: String, // weekly, monthly, yearly
    endDate: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### 4. Goals Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId, // ref: Users
  budgetId: ObjectId, // ref: Budgets
  name: String,
  description: String,
  type: String, // emergency_fund, vacation, home_purchase, debt_repayment, custom
  targetAmount: Number,
  currentAmount: Number,
  currency: String,
  targetDate: Date,
  priority: String, // high, medium, low
  status: String, // active, paused, completed, cancelled
  milestones: [{
    percentage: Number,
    achievedAt: Date,
    celebration: String
  }],
  monthlySavingRequired: Number,
  budgetAllocation: Number, // percentage from budget
  linkedExpenses: [ObjectId], // ref: Expenses
  aiInsights: String,
  progressHistory: [{
    amount: Number,
    date: Date,
    note: String
  }],
  createdAt: Date,
  updatedAt: Date
}
```

#### 5. ChatConversations Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId, // ref: Users
  title: String,
  messages: [{
    role: String, // user, assistant, system
    content: String,
    timestamp: Date,
    metadata: {
      budgetContext: ObjectId,
      goalContext: ObjectId,
      expenseContext: ObjectId,
      actionButtons: [String],
      suggestions: [String]
    }
  }],
  context: {
    budgetData: Object,
    recentExpenses: [Object],
    activeGoals: [Object],
    userPreferences: Object
  },
  isActive: Boolean,
  lastMessageAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### 6. Reports Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId, // ref: Users
  budgetId: ObjectId, // ref: Budgets
  type: String, // monthly, quarterly, yearly, custom
  period: {
    startDate: Date,
    endDate: Date
  },
  data: {
    totalIncome: Number,
    totalExpenses: Number,
    savingsRate: Number,
    categoryBreakdown: Object,
    goalProgress: Object,
    trends: Object,
    insights: [String]
  },
  format: String, // pdf, csv, json
  filePath: String,
  isShared: Boolean,
  sharedWith: [ObjectId],
  generatedAt: Date,
  expiresAt: Date
}
```

#### 7. Notifications Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId, // ref: Users
  type: String, // budget_alert, goal_milestone, expense_reminder, ai_insight
  title: String,
  message: String,
  data: Object, // contextual data
  isRead: Boolean,
  priority: String, // low, medium, high
  deliveryMethod: [String], // app, email, push
  scheduledFor: Date,
  sentAt: Date,
  createdAt: Date
}
```

### Indexes Strategy
```javascript
// Users
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "emailVerificationToken": 1 })
db.users.createIndex({ "passwordResetToken": 1 })

// Budgets
db.budgets.createIndex({ "userId": 1, "isActive": 1 })
db.budgets.createIndex({ "collaborators.userId": 1 })
db.budgets.createIndex({ "createdAt": -1 })

// Expenses
db.expenses.createIndex({ "userId": 1, "date": -1 })
db.expenses.createIndex({ "budgetId": 1, "category": 1 })
db.expenses.createIndex({ "date": -1, "amount": -1 })
db.expenses.createIndex({ "merchant": 1 })

// Goals
db.goals.createIndex({ "userId": 1, "status": 1 })
db.goals.createIndex({ "targetDate": 1, "status": 1 })

// Chat Conversations
db.chatconversations.createIndex({ "userId": 1, "lastMessageAt": -1 })
db.chatconversations.createIndex({ "isActive": 1 })

// Notifications
db.notifications.createIndex({ "userId": 1, "isRead": 1, "createdAt": -1 })
db.notifications.createIndex({ "scheduledFor": 1, "sentAt": 1 })
```

## API Structure

### Authentication Routes
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/verify-email
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
POST   /api/auth/refresh-token
GET    /api/auth/me
PUT    /api/auth/update-profile
```

### Budget Management Routes
```
GET    /api/budgets                    # Get user budgets
POST   /api/budgets                    # Create budget
GET    /api/budgets/:id               # Get specific budget
PUT    /api/budgets/:id               # Update budget
DELETE /api/budgets/:id               # Delete budget
POST   /api/budgets/:id/generate-ai   # Generate AI budget
POST   /api/budgets/:id/share         # Share budget
PUT    /api/budgets/:id/collaborate   # Manage collaborators
GET    /api/budgets/:id/history       # Budget version history
```

### Expense Management Routes
```
GET    /api/expenses                  # Get expenses with filters
POST   /api/expenses                  # Create expense
GET    /api/expenses/:id             # Get specific expense
PUT    /api/expenses/:id             # Update expense
DELETE /api/expenses/:id             # Delete expense
POST   /api/expenses/upload-receipt  # Upload and process receipt
POST   /api/expenses/bulk-import     # Bulk import expenses
GET    /api/expenses/categories      # Get expense categories
```

### Goals Management Routes
```
GET    /api/goals                     # Get user goals
POST   /api/goals                     # Create goal
GET    /api/goals/:id                # Get specific goal
PUT    /api/goals/:id                # Update goal
DELETE /api/goals/:id                # Delete goal
POST   /api/goals/:id/progress       # Update goal progress
GET    /api/goals/:id/insights       # Get AI insights for goal
```

### AI Chat Routes
```
GET    /api/chat                      # Get chat conversations
POST   /api/chat                      # Create new conversation
GET    /api/chat/:id                 # Get conversation messages
POST   /api/chat/:id/message         # Send message
DELETE /api/chat/:id                 # Delete conversation
POST   /api/chat/quick-ask           # Quick AI query
```

### Analytics & Reports Routes
```
GET    /api/analytics/dashboard       # Dashboard analytics
GET    /api/analytics/spending        # Spending analytics
GET    /api/analytics/trends          # Trend analysis
GET    /api/analytics/insights        # AI insights
POST   /api/reports/generate          # Generate report
GET    /api/reports                   # Get user reports
GET    /api/reports/:id              # Download report
DELETE /api/reports/:id              # Delete report
```

### Utility Routes
```
GET    /api/currencies                # Supported currencies
GET    /api/currencies/rates          # Exchange rates
GET    /api/categories               # Expense categories
POST   /api/ocr/process              # Process receipt OCR
GET    /api/notifications            # Get notifications
PUT    /api/notifications/:id/read   # Mark notification as read
```

## Authentication & Authorization

### NextAuth.js Configuration
```javascript
// lib/auth.js
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import { connectToDatabase } from "./mongodb"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(connectToDatabase()),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        
        const db = await connectToDatabase()
        const user = await db.collection("users").findOne({
          email: credentials.email
        })
        
        if (!user || !await bcrypt.compare(credentials.password, user.password)) {
          return null
        }
        
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.avatar
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    })
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
      }
      return session
    }
  },
  pages: {
    signIn: "/auth/signin",
    signUp: "/auth/signup",
    error: "/auth/error"
  }
})
```

### Middleware for Route Protection
```javascript
// middleware.js
import { auth } from "./lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isAuthenticated = !!req.auth

  // Public routes
  const publicRoutes = ["/", "/auth/signin", "/auth/signup", "/auth/forgot-password"]
  const isPublicRoute = publicRoutes.includes(pathname)

  // API routes that require authentication
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth/")) {
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  // Protected pages
  if (!isPublicRoute && !pathname.startsWith("/api/")) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/auth/signin", req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ]
}
```

## AI Integration Layer

### Gemini AI Service
```javascript
// lib/gemini.js
import { GoogleGenerativeAI } from "@google/generative-ai"

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-pro" })
  }

  async generateBudget(userProfile, income, demographics) {
    const prompt = `
      Generate a personalized budget allocation for a user with the following profile:
      - Monthly Income: ${income} ${userProfile.currency}
      - City: ${demographics.city}
      - Family Size: ${demographics.familySize}
      - Age Range: ${demographics.ageRange}
      - Occupation: ${demographics.occupation}
      
      Provide realistic percentage allocations for these categories:
      housing, food, transportation, utilities, healthcare, entertainment, 
      savings, emergency, investments, miscellaneous
      
      Also provide brief explanations for each allocation.
      Respond in JSON format.
    `

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      return JSON.parse(response.text())
    } catch (error) {
      console.error("Gemini budget generation error:", error)
      return this.getFallbackBudget()
    }
  }

  async getChatResponse(message, context) {
    const prompt = `
      You are a financial advisor AI helping users with budgeting and financial planning.
      
      User Context:
      - Budget: ${JSON.stringify(context.budget)}
      - Recent Expenses: ${JSON.stringify(context.recentExpenses)}
      - Goals: ${JSON.stringify(context.goals)}
      
      User Message: ${message}
      
      Provide helpful, actionable financial advice. Be conversational but professional.
      If suggesting budget changes, be specific about amounts and categories.
    `

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error("Gemini chat error:", error)
      return "I'm sorry, I'm having trouble processing your request right now. Please try again later."
    }
  }

  async analyzeSpendingPatterns(expenses, budget) {
    const prompt = `
      Analyze the following spending patterns and provide insights:
      
      Budget Allocations: ${JSON.stringify(budget.allocations)}
      Recent Expenses: ${JSON.stringify(expenses)}
      
      Provide:
      1. Spending trend analysis
      2. Areas of overspending
      3. Optimization recommendations
      4. Seasonal patterns if any
      
      Respond in JSON format with structured insights.
    `

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      return JSON.parse(response.text())
    } catch (error) {
      console.error("Gemini analysis error:", error)
      return { insights: [], recommendations: [] }
    }
  }

  async generateGoalRecommendations(userProfile, currentGoals, budget) {
    const prompt = `
      Based on the user's financial profile, suggest new financial goals:
      
      User Profile: ${JSON.stringify(userProfile)}
      Current Goals: ${JSON.stringify(currentGoals)}
      Budget: ${JSON.stringify(budget)}
      
      Suggest 3-5 realistic financial goals with:
      - Goal name and description
      - Recommended target amount
      - Suggested timeline
      - Required monthly savings
      
      Respond in JSON format.
    `

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      return JSON.parse(response.text())
    } catch (error) {
      console.error("Gemini goal recommendations error:", error)
      return { recommendations: [] }
    }
  }

  getFallbackBudget() {
    return {
      allocations: {
        housing: { percentage: 30, explanation: "Standard housing allocation" },
        food: { percentage: 15, explanation: "Food and groceries" },
        transportation: { percentage: 15, explanation: "Transport costs" },
        utilities: { percentage: 10, explanation: "Basic utilities" },
        healthcare: { percentage: 5, explanation: "Health insurance and medical" },
        entertainment: { percentage: 5, explanation: "Recreation and entertainment" },
        savings: { percentage: 10, explanation: "Emergency savings" },
        emergency: { percentage: 5, explanation: "Emergency fund" },
        investments: { percentage: 5, explanation: "Long-term investments" },
        miscellaneous: { percentage: 0, explanation: "Other expenses" }
      }
    }
  }
}

export const geminiService = new GeminiService()
```

### OCR Processing Service
```javascript
// lib/ocr.js
import Tesseract from 'tesseract.js'
import { geminiService } from './gemini'

class OCRService {
  async processReceipt(imageBuffer) {
    try {
      // Extract text using Tesseract
      const { data: { text } } = await Tesseract.recognize(imageBuffer, 'eng', {
        logger: m => console.log(m)
      })

      // Use Gemini to structure the extracted data
      const structuredData = await this.structureReceiptData(text)
      
      return {
        rawText: text,
        structured: structuredData,
        confidence: structuredData.confidence || 0.8
      }
    } catch (error) {
      console.error("OCR processing error:", error)
      throw new Error("Failed to process receipt")
    }
  }

  async structureReceiptData(rawText) {
    const prompt = `
      Parse the following receipt text and extract structured information:
      
      Receipt Text: ${rawText}
      
      Extract and return in JSON format:
      {
        "merchant": "store name",
        "date": "YYYY-MM-DD",
        "amount": number,
        "items": ["item1", "item2"],
        "category": "suggested expense category",
        "confidence": number (0-1)
      }
      
      If information is unclear, set confidence lower.
    `

    try {
      const response = await geminiService.model.generateContent(prompt)
      const result = await response.response
      return JSON.parse(result.text())
    } catch (error) {
      console.error("Receipt structuring error:", error)
      return {
        merchant: "Unknown",
        date: new Date().toISOString().split('T')[0],
        amount: 0,
        items: [],
        category: "miscellaneous",
        confidence: 0.3
      }
    }
  }
}

export const ocrService = new OCRService()
```

## Service Layer Architecture

### Budget Service
```javascript
// services/budgetService.js
import { connectToDatabase } from '../lib/mongodb'
import { geminiService } from '../lib/gemini'
import { ObjectId } from 'mongodb'

export class BudgetService {
  constructor() {
    this.db = null
  }

  async getDatabase() {
    if (!this.db) {
      this.db = await connectToDatabase()
    }
    return this.db
  }

  async createBudget(userId, budgetData) {
    const db = await this.getDatabase()
    
    const budget = {
      userId: new ObjectId(userId),
      name: budgetData.name || 'My Budget',
      type: budgetData.type || 'personal',
      monthlyIncome: budgetData.monthlyIncome,
      currency: budgetData.currency,
      allocations: budgetData.allocations,
      aiGenerated: budgetData.aiGenerated || false,
      aiRecommendations: budgetData.aiRecommendations || '',
      isActive: true,
      version: 1,
      collaborators: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db.collection('budgets').insertOne(budget)
    return { ...budget, _id: result.insertedId }
  }

  async generateAIBudget(userId, userProfile, income, demographics) {
    try {
      const aiResponse = await geminiService.generateBudget(userProfile, income, demographics)
      
      const budgetData = {
        monthlyIncome: income,
        currency: userProfile.currency,
        allocations: this.calculateAmounts(aiResponse.allocations, income),
        aiGenerated: true,
        aiRecommendations: aiResponse.explanation || 'AI-generated budget based on your profile'
      }

      return await this.createBudget(userId, budgetData)
    } catch (error) {
      console.error('AI budget generation failed:', error)
      throw new Error('Failed to generate AI budget')
    }
  }

  async updateBudget(budgetId, userId, updates) {
    const db = await this.getDatabase()
    
    const updateData = {
      ...updates,
      updatedAt: new Date(),
      version: { $inc: 1 }
    }

    const result = await db.collection('budgets').findOneAndUpdate(
      { _id: new ObjectId(budgetId), userId: new ObjectId(userId) },
      { $set: updateData, $inc: { version: 1 } },
      { returnDocument: 'after' }
    )

    if (!result.value) {
      throw new Error('Budget not found or access denied')
    }

    return result.value
  }

  async getBudgets(userId, filters = {}) {
    const db = await this.getDatabase()
    
    const query = {
      $or: [
        { userId: new ObjectId(userId) },
        { 'collaborators.userId': new ObjectId(userId) }
      ],
      ...filters
    }

    return await db.collection('budgets')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray()
  }

  calculateAmounts(allocations, income) {
    const result = {}
    for (const [category, data] of Object.entries(allocations)) {
      result[category] = {
        percentage: data.percentage,
        amount: (income * data.percentage) / 100
      }
    }
    return result
  }

  async shareBudget(budgetId, userId, collaboratorEmail, role = 'view') {
    const db = await this.getDatabase()
    
    // Find collaborator by email
    const collaborator = await db.collection('users').findOne({ email: collaboratorEmail })
    if (!collaborator) {
      throw new Error('User not found')
    }

    // Add collaborator to budget
    const result = await db.collection('budgets').updateOne(
      { _id: new ObjectId(budgetId), userId: new ObjectId(userId) },
      {
        $addToSet: {
          collaborators: {
            userId: collaborator._id,
            role: role,
            addedAt: new Date()
          }
        }
      }
    )

    if (result.matchedCount === 0) {
      throw new Error('Budget not found or access denied')
    }

    return { success: true, message: 'Budget shared successfully' }
  }
}
```

### Expense Service
```javascript
// services/expenseService.js
import { connectToDatabase } from '../lib/mongodb'
import { ocrService } from '../lib/ocr'
import { ObjectId } from 'mongodb'

export class ExpenseService {
  constructor() {
    this.db = null
  }

  async getDatabase() {
    if (!this.db) {
      this.db = await connectToDatabase()
    }
    return this.db
  }

  async createExpense(userId, expenseData) {
    const db = await this.getDatabase()
    
    const expense = {
      userId: new ObjectId(userId),
      budgetId: expenseData.budgetId ? new ObjectId(expenseData.budgetId) : null,
      amount: expenseData.amount,
      currency: expenseData.currency,
      category: expenseData.category,
      subcategory: expenseData.subcategory,
      description: expenseData.description,
      merchant: expenseData.merchant,
      date: new Date(expenseData.date),
      paymentMethod: expenseData.paymentMethod,
      tags: expenseData.tags || [],
      receipt: expenseData.receipt || null,
      location: expenseData.location || null,
      isRecurring: expenseData.isRecurring || false,
      recurringPattern: expenseData.recurringPattern || null,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db.collection('expenses').insertOne(expense)
    
    // Update budget tracking if budgetId provided
    if (expense.budgetId) {
      await this.updateBudgetSpending(expense.budgetId, expense.category, expense.amount)
    }

    return { ...expense, _id: result.insertedId }
  }

  async processReceiptUpload(userId, imageBuffer, budgetId) {
    try {
      const ocrResult = await ocrService.processReceipt(imageBuffer)
      
      const expenseData = {
        budgetId,
        amount: ocrResult.structured.amount,
        currency: 'USD', // Default, should be from user preferences
        category: ocrResult.structured.category,
        description: `Receipt from ${ocrResult.structured.merchant}`,
        merchant: ocrResult.structured.merchant,
        date: ocrResult.structured.date,
        receipt: {
          filename: `receipt_${Date.now()}.jpg`,
          ocrData: ocrResult.structured
        }
      }

      return await this.createExpense(userId, expenseData)
    } catch (error) {
      console.error('Receipt processing error:', error)
      throw new Error('Failed to process receipt')
    }
  }

  async getExpenses(userId, filters = {}) {
    const db = await this.getDatabase()
    
    const query = { userId: new ObjectId(userId) }
    
    // Apply filters
    if (filters.budgetId) {
      query.budgetId = new ObjectId(filters.budgetId)
    }
    if (filters.category) {
      query.category = filters.category
    }
    if (filters.startDate && filters.endDate) {
      query.date = {
        $gte: new Date(filters.startDate),
        $lte: new Date(filters.endDate)
      }
    }
    if (filters.minAmount || filters.maxAmount) {
      query.amount = {}
      if (filters.minAmount) query.amount.$gte = filters.minAmount
      if (filters.maxAmount) query.amount.$lte = filters.maxAmount
    }

    return await db.collection('expenses')
      .find(query)
      .sort({ date: -1 })
      .limit(filters.limit || 100)
      .toArray()
  }

  async updateBudgetSpending(budgetId, category, amount) {
    const db = await this.getDatabase()
    
    // This could be implemented as a separate spending tracking collection
    // or as computed values from expenses when needed
    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
    
    await db.collection('budget_spending').updateOne(
      { budgetId: new ObjectId(budgetId), month: currentMonth },
      {
        $inc: { [`categories.${category}`]: amount },
        $setOnInsert: { createdAt: new Date() },
        $set: { updatedAt: new Date() }
      },
      { upsert: true }
    )
  }

  async getBudgetSpendingAnalysis(budgetId, month) {
    const db = await this.getDatabase()
    
    const [budget, spending] = await Promise.all([
      db.collection('budgets').findOne({ _id: new ObjectId(budgetId) }),
      db.collection('budget_spending').findOne({ 
        budgetId: new ObjectId(budgetId), 
        month 
      })
    ])

    if (!budget) {
      throw new Error('Budget not found')
    }

    const analysis = {}
    for (const [category, allocation] of Object.entries(budget.allocations)) {
      const spent = spending?.categories?.[category] || 0
      analysis[category] = {
        allocated: allocation.amount,
        spent: spent,
        remaining: allocation.amount - spent,
        percentage: allocation.percentage,
        utilizationRate: (spent / allocation.amount) * 100
      }
    }

    return analysis
  }
}
```

### Goal Service
```javascript
// services/goalService.js
import { connectToDatabase } from '../lib/mongodb'
import { geminiService } from '../lib/gemini'
import { ObjectId } from 'mongodb'

export class GoalService {
  constructor() {
    this.db = null
  }

  async getDatabase() {
    if (!this.db) {
      this.db = await connectToDatabase()
    }
    return this.db
  }

  async createGoal(userId, goalData) {
    const db = await this.getDatabase()
    
    const monthlySavingRequired = this.calculateMonthlySaving(
      goalData.targetAmount,
      goalData.targetDate
    )
    
    const goal = {
      userId: new ObjectId(userId),
      budgetId: goalData.budgetId ? new ObjectId(goalData.budgetId) : null,
      name: goalData.name,
      description: goalData.description,
      type: goalData.type,
      targetAmount: goalData.targetAmount,
      currentAmount: goalData.currentAmount || 0,
      currency: goalData.currency,
      targetDate: new Date(goalData.targetDate),
      priority: goalData.priority || 'medium',
      status: 'active',
      milestones: [],
      monthlySavingRequired,
      budgetAllocation: goalData.budgetAllocation || 0,
      linkedExpenses: [],
      aiInsights: '',
      progressHistory: [{
        amount: goalData.currentAmount || 0,
        date: new Date(),
        note: 'Goal created'
      }],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db.collection('goals').insertOne(goal)
    return { ...goal, _id: result.insertedId }
  }

  async updateGoalProgress(goalId, userId, amount, note = '') {
    const db = await this.getDatabase()
    
    const goal = await db.collection('goals').findOne({
      _id: new ObjectId(goalId),
      userId: new ObjectId(userId)
    })

    if (!goal) {
      throw new Error('Goal not found')
    }

    const newAmount = goal.currentAmount + amount
    const progressPercentage = (newAmount / goal.targetAmount) * 100
    
    // Check for milestone achievements
    const milestones = this.checkMilestones(goal.milestones, progressPercentage)
    
    const updateData = {
      currentAmount: newAmount,
      updatedAt: new Date(),
      $push: {
        progressHistory: {
          amount: amount,
          date: new Date(),
          note: note
        }
      }
    }

    if (milestones.length > 0) {
      updateData.milestones = [...goal.milestones, ...milestones]
    }

    if (newAmount >= goal.targetAmount) {
      updateData.status = 'completed'
    }

    const result = await db.collection('goals').findOneAndUpdate(
      { _id: new ObjectId(goalId), userId: new ObjectId(userId) },
      updateData,
      { returnDocument: 'after' }
    )

    return result.value
  }

  async getGoalInsights(goalId, userId) {
    const db = await this.getDatabase()
    
    const goal = await db.collection('goals').findOne({
      _id: new ObjectId(goalId),
      userId: new ObjectId(userId)
    })

    if (!goal) {
      throw new Error('Goal not found')
    }

    try {
      const insights = await geminiService.generateGoalInsights(goal)
      
      // Update goal with AI insights
      await db.collection('goals').updateOne(
        { _id: new ObjectId(goalId) },
        { $set: { aiInsights: insights, updatedAt: new Date() } }
      )

      return insights
    } catch (error) {
      console.error('Goal insights generation error:', error)
      return 'Unable to generate insights at this time.'
    }
  }

  calculateMonthlySaving(targetAmount, targetDate) {
    const now = new Date()
    const target = new Date(targetDate)
    const monthsDiff = (target.getFullYear() - now.getFullYear()) * 12 + 
                      (target.getMonth() - now.getMonth())
    
    return monthsDiff > 0 ? targetAmount / monthsDiff : targetAmount
  }

  checkMilestones(existingMilestones, currentPercentage) {
    const milestoneMarks = [25, 50, 75, 100]
    const achievedPercentages = existingMilestones.map(m => m.percentage)
    const newMilestones = []

    for (const mark of milestoneMarks) {
      if (currentPercentage >= mark && !achievedPercentages.includes(mark)) {
        newMilestones.push({
          percentage: mark,
          achievedAt: new Date(),
          celebration: this.getMilestoneCelebration(mark)
        })
      }
    }

    return newMilestones
  }

  getMilestoneCelebration(percentage) {
    const celebrations = {
      25: "Great start! You're 25% towards your goal! 🎉",
      50: "Halfway there! Keep up the excellent work! 🚀",
      75: "You're in the home stretch! 75% complete! 💪",
      100: "Congratulations! Goal achieved! 🏆"
    }
    return celebrations[percentage] || "Milestone achieved!"
  }
}
```

### Chat Service
```javascript
// services/chatService.js
import { connectToDatabase } from '../lib/mongodb'
import { geminiService } from '../lib/gemini'
import { ObjectId } from 'mongodb'

export class ChatService {
  constructor() {
    this.db = null
  }

  async getDatabase() {
    if (!this.db) {
      this.db = await connectToDatabase()
    }
    return this.db
  }

  async createConversation(userId, title = "New Conversation") {
    const db = await this.getDatabase()
    
    const conversation = {
      userId: new ObjectId(userId),
      title,
      messages: [{
        role: 'assistant',
        content: 'Hello! I\'m your AI financial assistant. How can I help you with your budget today?',
        timestamp: new Date(),
        metadata: {
          actionButtons: [
            'Analyze my spending',
            'Review my budget',
            'Check goal progress',
            'Get saving tips'
          ]
        }
      }],
      context: {},
      isActive: true,
      lastMessageAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db.collection('chatconversations').insertOne(conversation)
    return { ...conversation, _id: result.insertedId }
  }

  async sendMessage(conversationId, userId, message) {
    const db = await this.getDatabase()
    
    // Get conversation and validate ownership
    const conversation = await db.collection('chatconversations').findOne({
      _id: new ObjectId(conversationId),
      userId: new ObjectId(userId)
    })

    if (!conversation) {
      throw new Error('Conversation not found')
    }

    // Get user context for AI
    const context = await this.getUserContext(userId)
    
    // Add user message
    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date()
    }

    // Get AI response
    let aiResponse
    try {
      aiResponse = await geminiService.getChatResponse(message, context)
    } catch (error) {
      console.error('AI response error:', error)
      aiResponse = "I'm sorry, I'm having trouble processing your request right now. Please try again later."
    }

    const assistantMessage = {
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date(),
      metadata: {
        suggestions: await this.generateSuggestions(message, context)
      }
    }

    // Update conversation
    const result = await db.collection('chatconversations').findOneAndUpdate(
      { _id: new ObjectId(conversationId) },
      {
        $push: {
          messages: { $each: [userMessage, assistantMessage] }
        },
        $set: {
          context: context,
          lastMessageAt: new Date(),
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    )

    return {
      conversation: result.value,
      newMessages: [userMessage, assistantMessage]
    }
  }

  async getUserContext(userId) {
    const db = await this.getDatabase()
    
    const [user, budgets, recentExpenses, activeGoals] = await Promise.all([
      db.collection('users').findOne({ _id: new ObjectId(userId) }),
      db.collection('budgets').find({ 
        userId: new ObjectId(userId), 
        isActive: true 
      }).toArray(),
      db.collection('expenses').find({ 
        userId: new ObjectId(userId) 
      }).sort({ date: -1 }).limit(10).toArray(),
      db.collection('goals').find({ 
        userId: new ObjectId(userId), 
        status: 'active' 
      }).toArray()
    ])

    return {
      userProfile: user?.profile || {},
      budget: budgets[0] || null,
      recentExpenses: recentExpenses || [],
      activeGoals: activeGoals || []
    }
  }

  async generateSuggestions(message, context) {
    const suggestions = []
    
    // Generate contextual suggestions based on message content
    if (message.toLowerCase().includes('budget')) {
      suggestions.push('Show my budget breakdown', 'Optimize my allocations')
    }
    
    if (message.toLowerCase().includes('spend')) {
      suggestions.push('Analyze spending patterns', 'Show recent expenses')
    }
    
    if (message.toLowerCase().includes('save')) {
      suggestions.push('Create savings goal', 'Find ways to save more')
    }
    
    if (message.toLowerCase().includes('goal')) {
      suggestions.push('Check goal progress', 'Create new goal')
    }

    return suggestions.slice(0, 3) // Limit to 3 suggestions
  }

  async getConversations(userId, limit = 10) {
    const db = await this.getDatabase()
    
    return await db.collection('chatconversations')
      .find({ userId: new ObjectId(userId) })
      .sort({ lastMessageAt: -1 })
      .limit(limit)
      .toArray()
  }
}
```

## Data Flow & Processing

### Request Processing Pipeline
```javascript
// lib/requestPipeline.js
export class RequestPipeline {
  constructor() {
    this.middlewares = []
  }

  use(middleware) {
    this.middlewares.push(middleware)
  }

  async process(req, res, handler) {
    let index = 0
    
    const next = async (error) => {
      if (error) {
        return this.handleError(error, res)
      }
      
      if (index >= this.middlewares.length) {
        return await handler(req, res)
      }
      
      const middleware = this.middlewares[index++]
      await middleware(req, res, next)
    }
    
    await next()
  }

  handleError(error, res) {
    console.error('Request pipeline error:', error)
    
    const statusCode = error.statusCode || 500
    const message = error.message || 'Internal server error'
    
    res.status(statusCode).json({
      error: true,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    })
  }
}

// Middleware functions
export const authMiddleware = async (req, res, next) => {
  try {
    const session = await auth()
    if (!session?.user) {
      const error = new Error('Unauthorized')
      error.statusCode = 401
      throw error
    }
    req.user = session.user
    next()
  } catch (error) {
    next(error)
  }
}

export const validationMiddleware = (schema) => {
  return async (req, res, next) => {
    try {
      const validatedData = await schema.parseAsync(req.body)
      req.validatedData = validatedData
      next()
    } catch (error) {
      error.statusCode = 400
      next(error)
    }
  }
}

export const rateLimitMiddleware = (options = {}) => {
  const { windowMs = 15 * 60 * 1000, max = 100 } = options
  const requests = new Map()
  
  return async (req, res, next) => {
    const key = req.ip || 'unknown'
    const now = Date.now()
    const windowStart = now - windowMs
    
    // Clean old entries
    if (requests.has(key)) {
      const userRequests = requests.get(key).filter(time => time > windowStart)
      requests.set(key, userRequests)
    }
    
    const userRequests = requests.get(key) || []
    
    if (userRequests.length >= max) {
      const error = new Error('Too many requests')
      error.statusCode = 429
      throw error
    }
    
    userRequests.push(now)
    requests.set(key, userRequests)
    
    next()
  }
}
```

### Background Job Processing
```javascript
// lib/jobProcessor.js
import { connectToDatabase } from './mongodb'
import { geminiService } from './gemini'

class JobProcessor {
  constructor() {
    this.jobs = new Map()
    this.isProcessing = false
  }

  async addJob(type, data, delay = 0) {
    const job = {
      id: Date.now().toString(),
      type,
      data,
      scheduledFor: new Date(Date.now() + delay),
      attempts: 0,
      maxAttempts: 3,
      status: 'pending'
    }

    this.jobs.set(job.id, job)
    
    if (!this.isProcessing) {
      this.startProcessing()
    }
    
    return job.id
  }

  async startProcessing() {
    if (this.isProcessing) return
    this.isProcessing = true

    while (this.jobs.size > 0) {
      const now = new Date()
      const readyJobs = Array.from(this.jobs.values())
        .filter(job => job.status === 'pending' && job.scheduledFor <= now)
        .sort((a, b) => a.scheduledFor - b.scheduledFor)

      if (readyJobs.length === 0) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        continue
      }

      for (const job of readyJobs) {
        try {
          await this.processJob(job)
          this.jobs.delete(job.id)
        } catch (error) {
          console.error(`Job ${job.id} failed:`, error)
          job.attempts++
          
          if (job.attempts >= job.maxAttempts) {
            job.status = 'failed'
            this.jobs.delete(job.id)
          } else {
            job.scheduledFor = new Date(Date.now() + 5000 * job.attempts) // Exponential backoff
          }
        }
      }
    }

    this.isProcessing = false
  }

  async processJob(job) {
    console.log(`Processing job ${job.id} of type ${job.type}`)
    
    switch (job.type) {
      case 'send_notification':
        await this.sendNotification(job.data)
        break
      case 'generate_insights':
        await this.generateInsights(job.data)
        break
      case 'process_recurring_expenses':
        await this.processRecurringExpenses(job.data)
        break
      case 'update_goal_progress':
        await this.updateGoalProgress(job.data)
        break
      default:
        throw new Error(`Unknown job type: ${job.type}`)
    }
  }

  async sendNotification(data) {
    const db = await connectToDatabase()
    
    const notification = {
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      data: data.notificationData || {},
      isRead: false,
      priority: data.priority || 'medium',
      deliveryMethod: data.deliveryMethod || ['app'],
      sentAt: new Date(),
      createdAt: new Date()
    }

    await db.collection('notifications').insertOne(notification)
    
    // Here you would integrate with email service, push notifications, etc.
    if (data.deliveryMethod?.includes('email')) {
      // await emailService.send(data.email, data.title, data.message)
    }
  }

  async generateInsights(data) {
    const db = await connectToDatabase()
    const { userId, type } = data
    
    if (type === 'weekly_spending') {
      const expenses = await db.collection('expenses')
        .find({ 
          userId: data.userId,
          date: { 
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
          }
        })
        .toArray()
      
      const budget = await db.collection('budgets')
        .findOne({ userId: data.userId, isActive: true })
      
      if (expenses.length > 0 && budget) {
        const insights = await geminiService.analyzeSpendingPatterns(expenses, budget)
        
        await this.addJob('send_notification', {
          userId: data.userId,
          type: 'ai_insight',
          title: 'Weekly Spending Insights',
          message: insights.summary || 'Your weekly spending analysis is ready!',
          notificationData: { insights }
        })
      }
    }
  }

  async processRecurringExpenses(data) {
    const db = await connectToDatabase()
    
    // Find expenses that should recur today
    const recurringExpenses = await db.collection('expenses')
      .find({ 
        isRecurring: true,
        'recurringPattern.nextDate': { $lte: new Date() }
      })
      .toArray()

    for (const expense of recurringExpenses) {
      // Create new expense based on recurring pattern
      const newExpense = {
        ...expense,
        _id: undefined,
        date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      await db.collection('expenses').insertOne(newExpense)
      
      // Update next recurring date
      const nextDate = this.calculateNextRecurringDate(
        expense.recurringPattern.frequency,
        expense.date
      )
      
      await db.collection('expenses').updateOne(
        { _id: expense._id },
        { $set: { 'recurringPattern.nextDate': nextDate } }
      )
    }
  }

  calculateNextRecurringDate(frequency, lastDate) {
    const date = new Date(lastDate)
    
    switch (frequency) {
      case 'weekly':
        date.setDate(date.getDate() + 7)
        break
      case 'monthly':
        date.setMonth(date.getMonth() + 1)
        break
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1)
        break
    }
    
    return date
  }
}

export const jobProcessor = new JobProcessor()
```

## Error Handling & Validation

### Zod Validation Schemas
```javascript
// lib/validationSchemas.js
import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  terms: z.boolean().refine(val => val === true, 'You must accept the terms')
})

export const budgetSchema = z.object({
  name: z.string().min(1, 'Budget name is required'),
  monthlyIncome: z.number().positive('Income must be positive'),
  currency: z.enum(['USD', 'EUR', 'GBP', 'INR', 'JPY']),
  allocations: z.object({
    housing: z.object({
      percentage: z.number().min(0).max(100),
      amount: z.number().min(0)
    }),
    food: z.object({
      percentage: z.number().min(0).max(100),
      amount: z.number().min(0)
    }),
    transportation: z.object({
      percentage: z.number().min(0).max(100),
      amount: z.number().min(0)
    }),
    utilities: z.object({
      percentage: z.number().min(0).max(100),
      amount: z.number().min(0)
    }),
    healthcare: z.object({
      percentage: z.number().min(0).max(100),
      amount: z.number().min(0)
    }),
    entertainment: z.object({
      percentage: z.number().min(0).max(100),
      amount: z.number().min(0)
    }),
    savings: z.object({
      percentage: z.number().min(0).max(100),
      amount: z.number().min(0)
    }),
    emergency: z.object({
      percentage: z.number().min(0).max(100),
      amount: z.number().min(0)
    }),
    investments: z.object({
      percentage: z.number().min(0).max(100),
      amount: z.number().min(0)
    }),
    miscellaneous: z.object({
      percentage: z.number().min(0).max(100),
      amount: z.number().min(0)
    })
  }).refine(
    (allocations) => {
      const totalPercentage = Object.values(allocations)
        .reduce((sum, category) => sum + category.percentage, 0)
      return Math.abs(totalPercentage - 100) < 0.01
    },
    { message: 'Total allocation must equal 100%' }
  )
})

export const expenseSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().min(3).max(3),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  merchant: z.string().optional(),
  date: z.string().datetime('Invalid date format'),
  paymentMethod: z.string().optional(),
  budgetId: z.string().optional()
})

export const goalSchema = z.object({
  name: z.string().min(1, 'Goal name is required'),
  description: z.string().optional(),
  type: z.enum(['emergency_fund', 'vacation', 'home_purchase', 'debt_repayment', 'custom']),
  targetAmount: z.number().positive('Target amount must be positive'),
  currentAmount: z.number().min(0, 'Current amount cannot be negative').optional(),
  currency: z.string().min(3).max(3),
  targetDate: z.string().datetime('Invalid target date'),
  priority: z.enum(['high', 'medium', 'low']).optional(),
  budgetId: z.string().optional()
})
```

### Global Error Handler
```javascript
// lib/errorHandler.js
export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.isOperational = true
    
    Error.captureStackTrace(this, this.constructor)
  }
}

export const errorHandler = (error, req, res) => {
  let { statusCode = 500, message = 'Something went wrong', code } = error

  // MongoDB duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0]
    message = `${field} already exists`
    statusCode = 400
    code = 'DUPLICATE_KEY'
  }

  // MongoDB validation error
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message)
    message = errors.join(', ')
    statusCode = 400
    code = 'VALIDATION_ERROR'
  }

  // Zod validation error
  if (error.name === 'ZodError') {
    const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
    message = errors.join(', ')
    statusCode = 400
    code = 'VALIDATION_ERROR'
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    message = 'Invalid token'
    statusCode = 401
    code = 'INVALID_TOKEN'
  }

  if (error.name === 'TokenExpiredError') {
    message = 'Token expired'
    statusCode = 401
    code = 'TOKEN_EXPIRED'
  }

  // Log error for monitoring
  console.error('Error:', {
    message: error.message,
    stack: error.stack,
    statusCode,
    code,
    url: req?.url,
    method: req?.method,
    user: req?.user?.id
  })

  // Send error response
  res.status(statusCode).json({
    error: true,
    message,
    code,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: error.stack,
      details: error 
    })
  })
}

export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
```

## Performance & Caching

### Redis Caching Strategy
```javascript
// lib/cache.js
import Redis from 'ioredis'

class CacheService {
  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')
    this.defaultTTL = 3600 // 1 hour
  }

  async get(key) {
    try {
      const value = await this.redis.get(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }

  async set(key, value, ttl = this.defaultTTL) {
    try {
      await this.redis.setex(key, ttl, JSON.stringify(value))
      return true
    } catch (error) {
      console.error('Cache set error:', error)
      return false
    }
  }

  async del(key) {
    try {
      await this.redis.del(key)
      return true
    } catch (error) {
      console.error('Cache delete error:', error)
      return false
    }
  }

  async invalidatePattern(pattern) {
    try {
      const keys = await this.redis.keys(pattern)
      if (keys.length > 0) {
        await this.redis.del(...keys)
      }
      return true
    } catch (error) {
      console.error('Cache invalidate error:', error)
      return false
    }
  }

  // Specific cache methods
  async cacheBudget(userId, budget) {
    const key = `budget:${userId}`
    await this.set(key, budget, 1800) // 30 minutes
  }

  async getCachedBudget(userId) {
    const key = `budget:${userId}`
    return await this.get(key)
  }

  async cacheExpenses(userId, filters, expenses) {
    const key = `expenses:${userId}:${this.hashFilters(filters)}`
    await this.set(key, expenses, 600) // 10 minutes
  }

  async getCachedExpenses(userId, filters) {
    const key = `expenses:${userId}:${this.hashFilters(filters)}`
    return await this.get(key)
  }

  hashFilters(filters) {
    return Buffer.from(JSON.stringify(filters)).toString('base64')
  }

  async invalidateUserCache(userId) {
    await this.invalidatePattern(`*:${userId}:*`)
    await this.invalidatePattern(`budget:${userId}`)
    await this.invalidatePattern(`goals:${userId}`)
  }
}

export const cacheService = new CacheService()

// Cache middleware
export const cacheMiddleware = (keyGenerator, ttl = 300) => {
  return async (req, res, next) => {
    if (req.method !== 'GET') {
      return next()
    }

    const key = keyGenerator(req)
    const cachedData = await cacheService.get(key)

    if (cachedData) {
      return res.json(cachedData)
    }

    // Override res.json to cache the response
    const originalJson = res.json
    res.json = function(body) {
      cacheService.set(key, body, ttl)
      return originalJson.call(this, body)
    }

    next()
  }
}
```

### Database Optimization
```javascript
// lib/aggregationPipelines.js
export const aggregationPipelines = {
  // Get spending analytics with category breakdown
  getSpendingAnalytics: (userId, startDate, endDate) => [
    {
      $match: {
        userId: userId,
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: "$category",
        totalAmount: { $sum: "$amount" },
        count: { $sum: 1 },
        avgAmount: { $avg: "$amount" },
        expenses: { $push: "$ROOT" }
      }
    },
    {
      $sort: { totalAmount: -1 }
    }
  ],

  // Get monthly spending trends
  getMonthlyTrends: (userId, months = 12) => [
    {
      $match: {
        userId: userId,
        date: { 
          $gte: new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000) 
        }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: "$date" },
          month: { $month: "$date" },
          category: "$category"
        },
        totalAmount: { $sum: "$amount" },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: {
          year: "$_id.year",
          month: "$_id.month"
        },
        categories: {
          $push: {
            category: "$_id.category",
            amount: "$totalAmount",
            count: "$count"
          }
        },
        totalSpent: { $sum: "$totalAmount" }
      }
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1 }
    }
  ],

  // Get budget utilization analysis
  getBudgetUtilization: (budgetId, startDate, endDate) => [
    {
      $match: {
        budgetId: budgetId,
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: "$category",
        spent: { $sum: "$amount" },
        transactions: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: "budgets",
        localField: "_id",
        foreignField: "_id",
        as: "budget",
        pipeline: [
          { $match: { _id: budgetId } },
          { $project: { allocations: 1 } }
        ]
      }
    }
  ],

  // Get goal progress summary
  getGoalProgressSummary: (userId) => [
    {
      $match: {
        userId: userId,
        status: { $in: ["active", "completed"] }
      }
    },
    {
      $addFields: {
        progressPercentage: {
          $multiply: [
            { $divide: ["$currentAmount", "$targetAmount"] },
            100
          ]
        },
        daysRemaining: {
          $divide: [
            { $subtract: ["$targetDate", new Date()] },
            1000 * 60 * 60 * 24
          ]
        }
      }
    },
    {
      $group: {
        _id: "$status",
        totalGoals: { $sum: 1 },
        totalTargetAmount: { $sum: "$targetAmount" },
        totalCurrentAmount: { $sum: "$currentAmount" },
        avgProgress: { $avg: "$progressPercentage" },
        goals: { $push: "$ROOT" }
      }
    }
  ]
}

// Database connection with optimizations
export const connectToDatabase = async () => {
  if (global._mongoConnection) {
    return global._mongoConnection
  }

  const client = new MongoClient(process.env.MONGODB_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    bufferMaxEntries: 0,
    useUnifiedTopology: true,
    readPreference: 'secondaryPreferred'
  })

  try {
    await client.connect()
    const db = client.db(process.env.MONGODB_DB_NAME)
    
    // Connection event handlers
    client.on('error', (err) => {
      console.error('MongoDB connection error:', err)
    })

    client.on('close', () => {
      console.log('MongoDB connection closed')
      global._mongoConnection = null
    })

    global._mongoConnection = db
    return db
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error)
    throw error
  }
}
```

## Security Implementation

### Data Encryption & Privacy
```javascript
// lib/encryption.js
import crypto from 'crypto'
import bcrypt from 'bcryptjs'

export class EncryptionService {
  constructor() {
    this.algorithm = 'aes-256-gcm'
    this.secretKey = process.env.ENCRYPTION_SECRET || crypto.randomBytes(32)
  }

  // Encrypt sensitive data
  encrypt(text) {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipher(this.algorithm, this.secretKey)
    cipher.setAAD(Buffer.from('additional-data'))
    
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    const authTag = cipher.getAuthTag()
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    }
  }

  // Decrypt sensitive data
  decrypt(encryptedData) {
    const { encrypted, iv, authTag } = encryptedData
    const decipher = crypto.createDecipher(this.algorithm, this.secretKey)
    
    decipher.setAAD(Buffer.from('additional-data'))
    decipher.setAuthTag(Buffer.from(authTag, 'hex'))
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  }

  // Hash passwords
  async hashPassword(password) {
    const saltRounds = 12
    return await bcrypt.hash(password, saltRounds)
  }

  // Verify passwords
  async verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash)
  }

  // Generate secure tokens
  generateToken(length = 32) {
    return crypto.randomBytes(length).toString('hex')
  }

  // Hash sensitive identifiers
  hashIdentifier(identifier) {
    return crypto.createHash('sha256').update(identifier).digest('hex')
  }
}

export const encryptionService = new EncryptionService()
```

### Input Sanitization
```javascript
// lib/sanitization.js
import DOMPurify from 'isomorphic-dompurify'
import validator from 'validator'

export class SanitizationService {
  // Sanitize HTML content
  sanitizeHtml(dirty) {
    return DOMPurify.sanitize(dirty, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
      ALLOWED_ATTR: ['href']
    })
  }

  // Sanitize and validate email
  sanitizeEmail(email) {
    const sanitized = validator.normalizeEmail(email)
    if (!validator.isEmail(sanitized)) {
      throw new Error('Invalid email format')
    }
    return sanitized
  }

  // Sanitize numeric inputs
  sanitizeNumber(value, options = {}) {
    const num = parseFloat(value)
    if (isNaN(num)) {
      throw new Error('Invalid number format')
    }
    
    const { min = -Infinity, max = Infinity, decimals } = options
    
    if (num < min || num > max) {
      throw new Error(`Number must be between ${min} and ${max}`)
    }
    
    return decimals !== undefined ? 
      parseFloat(num.toFixed(decimals)) : num
  }

  // Sanitize strings
  sanitizeString(str, options = {}) {
    const { maxLength = 255, minLength = 0, allowEmpty = true } = options
    
    if (!str && !allowEmpty) {
      throw new Error('String cannot be empty')
    }
    
    const sanitized = validator.escape(str.toString().trim())
    
    if (sanitized.length < minLength || sanitized.length > maxLength) {
      throw new Error(`String length must be between ${minLength} and ${maxLength}`)
    }
    
    return sanitized
  }

  // Sanitize MongoDB ObjectId
  sanitizeObjectId(id) {
    if (!validator.isMongoId(id)) {
      throw new Error('Invalid ObjectId format')
    }
    return id
  }

  // Sanitize currency code
  sanitizeCurrency(currency) {
    const validCurrencies = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD']
    const upper = currency.toUpperCase()
    
    if (!validCurrencies.includes(upper)) {
      throw new Error('Invalid currency code')
    }
    
    return upper
  }

  // Sanitize date
  sanitizeDate(date) {
    const parsedDate = new Date(date)
    if (isNaN(parsedDate.getTime())) {
      throw new Error('Invalid date format')
    }
    return parsedDate
  }
}

export const sanitizationService = new SanitizationService()
```

### API Security Middleware
```javascript
// lib/securityMiddleware.js
import helmet from 'helmet'
import cors from 'cors'
import rateLimit from 'express-rate-limit'

export const securityMiddleware = [
  // Basic security headers
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://apis.google.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://api.gemini.com"]
      }
    }
  }),

  // CORS configuration
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
    optionsSuccessStatus: 200
  }),

  // Rate limiting
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 100 : 1000,
    message: 'Too many requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false
  })
]

// Specific rate limits for different endpoints
export const createRateLimit = (options) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000,
    max: options.max || 100,
    message: options.message || 'Rate limit exceeded',
    skip: (req) => {
      // Skip rate limiting for authenticated users with premium accounts
      return req.user?.subscription?.plan === 'premium'
    }
  })
}

// API key validation middleware
export const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key']
  
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Invalid API key' })
  }
  
  next()
}
```

## Deployment Architecture

### Environment Configuration
```javascript
// lib/config.js
export const config = {
  // Database
  mongodb: {
    uri: process.env.MONGODB_URI,
    dbName: process.env.MONGODB_DB_NAME,
    options: {
      maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE) || 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    }
  },

  // Redis Cache
  redis: {
    url: process.env.REDIS_URL,
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB) || 0
  },

  // AI Services
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || 'gemini-1.5-pro',
    maxTokens: parseInt(process.env.GEMINI_MAX_TOKENS) || 2048
  },

  // Authentication
  auth: {
    secret: process.env.NEXTAUTH_SECRET,
    url: process.env.NEXTAUTH_URL,
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }
  },

  // File Upload
  upload: {
    maxSize: parseInt(process.env.MAX_UPLOAD_SIZE) || 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET
    }
  },

  // Email
  email: {
    provider: process.env.EMAIL_PROVIDER || 'resend',
    resend: {
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.EMAIL_FROM || 'noreply@smartfinancialplanner.com'
    }
  },

  // External APIs
  exchangeRate: {
    apiKey: process.env.EXCHANGE_RATE_API_KEY,
    baseUrl: 'https://api.exchangerate-api.com/v4/latest'
  },

  // Security
  security: {
    encryptionSecret: process.env.ENCRYPTION_SECRET,
    jwtSecret: process.env.JWT_SECRET,
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']
  },

  // Application
  app: {
    name: 'WealthWise ',
    version: process.env.APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT) || 3000,
    logLevel: process.env.LOG_LEVEL || 'info'
  }
}

// Validate required environment variables
export const validateConfig = () => {
  const required = [
    'MONGODB_URI',
    'NEXTAUTH_SECRET',
    'GEMINI_API_KEY'
  ]

  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}
```

### Docker Configuration
```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/smartfinancialplanner
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongo
      - redis
    restart: unless-stopped

  mongo:
    image: mongo:6.0
    restart: unless-stopped
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
      MONGO_INITDB_DATABASE: smartfinancialplanner
    volumes:
      - mongo_data:/data/db
      - ./mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    restart: unless-stopped

volumes:
  mongo_data:
  redis_data:
```

### CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:6.0
        ports:
          - 27017:27017
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: npm run lint
      
      - name: Run type checking
        run: npm run type-check
      
      - name: Run tests
        run: npm run test
        env:
          MONGODB_URI: mongodb://localhost:27017/test
          REDIS_URL: redis://localhost:6379
          NEXTAUTH_SECRET: test-secret
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
        env:
          NEXT_TELEMETRY_DISABLED: 1
      
      - name: Build Docker image
        run: |
          docker build -t smartfinancialplanner:${{ github.sha }} .
          docker tag smartfinancialplanner:${{ github.sha }} smartfinancialplanner:latest
      
      - name: Deploy to production
        run: |
          # Deploy to your chosen platform (Vercel, AWS, GCP, etc.)
          echo "Deploying to production..."
```

### Health Monitoring
```javascript
// lib/healthCheck.js
import { connectToDatabase } from './mongodb'
import { cacheService } from './cache'
import { geminiService } from './gemini'

export class HealthCheckService {
  async checkDatabase() {
    try {
      const db = await connectToDatabase()
      await db.admin().ping()
      return { status: 'healthy', latency: Date.now() }
    } catch (error) {
      return { status: 'unhealthy', error: error.message }
    }
  }

  async checkCache() {
    try {
      const start = Date.now()
      await cacheService.redis.ping()
      return { status: 'healthy', latency: Date.now() - start }
    } catch (error) {
      return { status: 'unhealthy', error: error.message }
    }
  }

  async checkAI() {
    try {
      const start = Date.now()
      // Simple test query
      await geminiService.model.generateContent('Hello')
      return { status: 'healthy', latency: Date.now() - start }
    } catch (error) {
      return { status: 'unhealthy', error: error.message }
    }
  }

  async getSystemHealth() {
    const [database, cache, ai] = await Promise.all([
      this.checkDatabase(),
      this.checkCache(),
      this.checkAI()
    ])

    const overall = database.status === 'healthy' && 
                   cache.status === 'healthy' && 
                   ai.status === 'healthy'

    return {
      status: overall ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        database,
        cache,
        ai
      },
      version: process.env.APP_VERSION || '1.0.0',
      uptime: process.uptime()
    }
  }
}

export const healthCheckService = new HealthCheckService()

// Health check API endpoint
// pages/api/health.js
import { healthCheckService } from '../../lib/healthCheck'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const health = await healthCheckService.getSystemHealth()
    const statusCode = health.status === 'healthy' ? 200 : 503
    res.status(statusCode).json(health)
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    })
  }
}
```

## API Route Examples

### Sample API Implementation
```javascript
// pages/api/budgets/index.js
import { auth } from '../../../lib/auth'
import { BudgetService } from '../../../services/budgetService'
import { validationMiddleware } from '../../../lib/requestPipeline'
import { budgetSchema } from '../../../lib/validationSchemas'
import { cacheService } from '../../../lib/cache'
import { errorHandler, asyncHandler } from '../../../lib/errorHandler'

const budgetService = new BudgetService()

const handler = asyncHandler(async (req, res) => {
  const session = await auth()
  if (!session?.user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const userId = session.user.id

  switch (req.method) {
    case 'GET':
      return await getBudgets(req, res, userId)
    case 'POST':
      return await createBudget(req, res, userId)
    default:
      return res.status(405).json({ error: 'Method not allowed' })
  }
})

const getBudgets = async (req, res, userId) => {
  // Check cache first
  const cacheKey = `budgets:${userId}`
  const cachedBudgets = await cacheService.get(cacheKey)
  
  if (cachedBudgets) {
    return res.json({ success: true, data: cachedBudgets })
  }

  const filters = {
    isActive: req.query.active === 'true' ? true : undefined,
    type: req.query.type
  }

  const budgets = await budgetService.getBudgets(userId, filters)
  
  // Cache the results
  await cacheService.set(cacheKey, budgets, 1800) // 30 minutes
  
  res.json({ success: true, data: budgets })
}

const createBudget = async (req, res, userId) => {
  // Validate request data
  const validatedData = budgetSchema.parse(req.body)
  
  const budget = await budgetService.createBudget(userId, validatedData)
  
  // Invalidate cache
  await cacheService.invalidatePattern(`budgets:${userId}*`)
  
  res.status(201).json({ success: true, data: budget })
}

export default handler
```

## Conclusion

This backend architecture document provides a comprehensive foundation for building the WealthWise  application using Next.js 15, MongoDB, and Gemini AI. The structure emphasizes:

### Key Features Implemented:
- **Scalable Architecture**: Modular service layer with clear separation of concerns
- **Robust Data Models**: Comprehensive MongoDB schemas with proper indexing
- **AI Integration**: Seamless Gemini AI integration for budget generation and insights
- **Security First**: Authentication, validation, encryption, and sanitization
- **Performance Optimized**: Caching strategies, database optimization, and efficient queries
- **Error Handling**: Comprehensive error handling and logging
- **Monitoring**: Health checks and system monitoring capabilities

### Next Steps for Implementation:
1. Set up the development environment with all required services
2. Implement core authentication and user management
3. Build the budget management system with AI integration
4. Develop the expense tracking and OCR functionality
5. Create the goal management and progress tracking features
6. Implement the AI chat system with contextual responses
7. Add analytics and reporting capabilities
8. Set up monitoring, logging, and deployment pipelines

### Scalability Considerations:
- **Database**: MongoDB with proper indexing and aggregation pipelines
- **Caching**: Redis for session management and frequently accessed data
- **AI Services**: Rate limiting and fallback mechanisms for Gemini AI
- **File Storage**: Cloudinary integration for receipt images
- **Background Jobs**: Job queue system for processing tasks
- **Monitoring**: Health checks and performance monitoring

This architecture provides a solid foundation that can handle the complexity requirements outlined in the original app flow document while maintaining performance, security, and scalability standards.