# WealthWise - AI-Powered Financial Planner
## Project Report | Anveshana 2025

---

# Table of Contents
1. Introduction
2. Problem Statement
3. Our Solution
4. Features
5. System Architecture
6. Technology Stack
7. Security Implementation
8. Innovation & Uniqueness
9. Social Impact
10. Future Scope
11. Conclusion

---

# 1. Introduction

**WealthWise** is a web-based AI-powered financial planning application designed specifically for the Indian population. It helps users track expenses, create personalized budgets, and achieve their financial goals — all in their preferred regional language, completely free of cost.

**Project URL:** https://wealthwise.vercel.app

---

# 2. Problem Statement

| Statistic | Reality |
|-----------|---------|
| **76%** of Indians | Do not track their expenses regularly |
| **85%** of finance apps | Are available only in English |
| **60%** of users | Abandon apps that require downloads |
| **45%** of rural Indians | Lack reliable internet access |

### The Core Problem
Millions of Indians struggle with financial planning because:
- Existing apps don't support regional languages
- Apps are too complex for first-time users
- Most require expensive subscriptions
- Language barriers prevent accessibility

---

# 3. Our Solution

> **WealthWise**: A web-based AI-powered financial planner that helps Indians track expenses, create personalized budgets, and achieve financial goals — in **10 Indian languages**, **completely free**.

### Why WealthWise is Different

| Challenge | WealthWise Solution |
|-----------|---------------------|
| English-only apps | 10 Indian languages support |
| Complex interfaces | Simple, intuitive design |
| Expensive subscriptions | 100% FREE forever |
| Generic budgets | AI-personalized for your city |
| Manual expense entry | Voice input in natural language |

---

# 4. Features

## 4.1 AI-Powered Budget Generator 🤖
- Uses Google Gemini AI to create personalized budgets
- Considers city-specific living costs (15+ Indian cities)
- Adapts to family size and income level
- Provides actionable financial tips

## 4.2 Voice Expense Entry 🎤
- Speak expenses naturally: "Spent 500 on Swiggy"
- Auto-categorizes Indian merchants (chai tapri, kirana, auto)
- Works in multiple languages
- Faster than typing

## 4.3 Multi-Language Support 🌐
Supported Languages:
1. English
2. Hindi (हिंदी)
3. Tamil (தமிழ்)
4. Telugu (తెలుగు)
5. Bengali (বাংলা)
6. Marathi (मराठी)
7. Gujarati (ગુજરાતી)
8. Kannada (ಕನ್ನಡ)
9. Malayalam (മലയാളം)
10. Punjabi (ਪੰਜਾਬੀ)

## 4.4 Goal Tracking 🎯
- Set savings goals with deadlines
- Visual progress tracking
- Smart reminders and tips
- Celebrate achievements

## 4.5 Debt Management 💳
- Track multiple loans/debts
- EMI calculators
- Payment reminders
- Debt-free timeline

## 4.6 Admin Dashboard 🔧
- User management with RBAC
- System analytics
- Audit logging for security

---

# 5. System Architecture

## 5.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    USER (Any Browser)                    │
└─────────────────────────────┬───────────────────────────┘
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────┐
│                 NEXT.JS 15 APPLICATION                   │
│  ┌─────────────────────┐  ┌─────────────────────────┐   │
│  │   FRONTEND          │  │       BACKEND           │   │
│  │   React 19 + UI     │  │    42 REST API Routes   │   │
│  └─────────────────────┘  └─────────────────────────┘   │
└────────────────┬──────────────────────┬─────────────────┘
                 │                      │
                 ▼                      ▼
┌───────────────────────┐  ┌───────────────────────────┐
│   MONGODB ATLAS       │  │   GOOGLE GEMINI 2.5 AI    │
│   (Cloud Database)    │  │   (AI Budget Engine)      │
└───────────────────────┘  └───────────────────────────┘
```

## 5.2 Database Collections

| Collection | Purpose |
|------------|---------|
| Users | Authentication & profiles |
| UserProfiles | Income, city, preferences |
| Expenses | All expense records |
| Budgets | AI-generated budgets |
| Goals | Savings targets |
| Debts | Loan tracking |
| AdminAuditLogs | Security logging |

## 5.3 API Endpoints

Total: **42 REST API Endpoints**

- Authentication: 6 endpoints
- Budget Management: 4 endpoints
- Expense Tracking: 6 endpoints
- Goals: 5 endpoints
- Debts: 5 endpoints
- Profile: 4 endpoints
- Admin: 8 endpoints
- Miscellaneous: 4 endpoints

---

# 6. Technology Stack

| Layer | Technology | Why We Chose It |
|-------|------------|-----------------|
| **Frontend** | React 19 + Tailwind CSS | Fast, responsive UI |
| **Backend** | Next.js 15 (App Router) | Full-stack, serverless |
| **Database** | MongoDB Atlas | Cloud-hosted, scalable |
| **AI Engine** | Google Gemini 2.5 Flash | Fast, accurate AI |
| **Authentication** | NextAuth v5 + OTP | Secure, flexible |
| **Voice Input** | Web Speech API | Browser-native |
| **UI Components** | shadcn/ui | Beautiful, accessible |
| **Deployment** | Vercel | Global CDN, free tier |

---

# 7. Security Implementation

## Bank-Grade Security Features

| Security Layer | Implementation |
|----------------|----------------|
| 🔐 **Password Storage** | bcryptjs hashing with 10 salt rounds |
| 📱 **Login Verification** | 6-digit OTP, 10-minute expiry, rate-limited |
| 🔒 **Data Encryption** | AES-256-GCM for sensitive data |
| 🌐 **Transport Security** | HTTPS with TLS 1.3 |
| 🍪 **Session Management** | Secure, HTTP-only cookies |
| 👮 **Admin Access** | Role-Based Access Control (RBAC) |
| 📋 **Audit Logging** | All admin actions logged |

---

# 8. Innovation & Uniqueness

## 8.1 Hybrid AI Budget Engine
- **Rule-based layer**: Uses actual city cost data for 15+ Indian cities
- **AI layer**: Gemini AI personalizes recommendations
- **Fallback system**: Works even if AI is unavailable

## 8.2 Indian Merchant Recognition
Our voice system understands Indian terms:
- "chai tapri" → Food & Dining
- "auto" → Transportation
- "kirana" → Groceries
- "Swiggy/Zomato" → Food & Dining
- "Ola/Uber" → Transportation

## 8.3 Truly Multilingual
Not just translated text — the entire UX considers:
- Right-to-left support where needed
- Cultural context in tips
- Local currency formatting

---

# 9. Social Impact

## Target Beneficiaries

| Audience | Benefit |
|----------|---------|
| **Students** | Learn budgeting, track pocket money |
| **Young Professionals** | First salary management |
| **Homemakers** | Household budgets in native language |
| **Tier-2/3 City Residents** | Financial tools without barriers |
| **Senior Citizens** | Simple interface, regional language |

## Addressing UN SDGs

- **SDG 1**: No Poverty (financial literacy)
- **SDG 4**: Quality Education (free learning tools)
- **SDG 10**: Reduced Inequalities (language accessibility)

---

# 10. Future Scope

1. **UPI Integration**: Direct expense tracking from bank SMS
2. **Investment Advisor**: AI-powered investment suggestions
3. **Family Sharing**: Joint family budget management
4. **Offline Mode**: PWA for areas with poor connectivity
5. **Government Schemes**: Integration with PM schemes
6. **Gamification**: Rewards for good financial habits

---

# 11. Conclusion

WealthWise addresses a critical gap in the Indian financial technology landscape by providing:

✅ **Accessibility** - 10 Indian languages
✅ **Affordability** - 100% free, forever
✅ **Intelligence** - AI-powered personalization
✅ **Security** - Bank-grade protection
✅ **Simplicity** - Voice input, intuitive design

We believe financial literacy should not be limited by language or economics. WealthWise is our contribution to making every Indian financially empowered.

---

## Project Metrics

| Metric | Value |
|--------|-------|
| API Endpoints | 42 |
| Languages Supported | 10 |
| Cities with Cost Data | 15+ |
| Expense Categories | 12 |
| Cost to User | ₹0 (FREE) |

---

## Contact Information

**Project Name:** WealthWise
**Live URL:** https://wealthwise.vercel.app
**Email:** iamaakash1006@gmail.com

---

*WealthWise — Making Financial Planning Accessible to Every Indian*
