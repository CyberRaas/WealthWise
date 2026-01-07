# WealthWise - AI-Powered Financial Planner

### Anveshana Finale 2025 | Judge Handout

---

## 1. Problem & Solution

### The Problem

| Statistic               | Reality                                                 |
| ----------------------- | ------------------------------------------------------- |
| **76%** of Indians      | Do not track their expenses                             |
| **85%** of finance apps | Are English-only                                        |
| **Result**              | Millions lack access to proper financial planning tools |

### Our Solution: WealthWise

> A web-based AI-powered financial planner that helps Indians track expenses, create personalized budgets, and achieve financial goals — **in 10 Indian languages, completely free.**

### Core Features

| Feature                     | What It Does                                                                           |
| --------------------------- | -------------------------------------------------------------------------------------- |
| **🤖 AI Budget Generator**  | Creates personalized budgets using city-specific costs + Gemini AI                     |
| **🎤 Voice Expense Entry**  | Speak expenses naturally; auto-categorizes Indian merchants                            |
| **🌐 10 Languages**         | Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, English |
| **🎯 Goal & Debt Tracking** | Visual progress for savings goals + loan management with reminders                     |

---

## 2. System Architecture

### User Journey Flow

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                            USER JOURNEY                                       │
└──────────────────────────────────────────────────────────────────────────────┘

  ┌─────────────┐      ┌─────────────────────────────────────┐      ┌─────────────────┐
  │   SIGN UP   │      │         ONBOARDING PAGE             │      │  AI BUDGET      │
  │  (Google /  │ ──▶  │  User enters:                       │ ──▶  │  GENERATED      │
  │   Email)    │      │  • Monthly Income                   │      │  ✓ Personalized │
  └─────────────┘      │  • City (for cost calculation)      │      │  ✓ Category-wise│
                       │  • Family Size                      │      │  ✓ AI Tips      │
                       │  • Financial Goals                  │      └────────┬────────┘
                       │  • Preferred Language               │               │
                       └─────────────────────────────────────┘               │
                                                                             ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              FULL APP ACCESS UNLOCKED                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │  Dashboard  │  │  Expense    │  │   Goals     │  │    Debt     │  │  Insights   │   │
│  │  Overview   │  │  Tracking   │  │  Tracker    │  │  Manager    │  │  & Reports  │   │
│  │             │  │  + Voice    │  │             │  │             │  │             │   │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Technical Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER (Browser)                          │
└─────────────────────────────┬───────────────────────────────────┘
                              │ HTTPS Request
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NEXT.JS 15 APPLICATION                        │
│  ┌─────────────────────────┐  ┌──────────────────────────────┐  │
│  │      FRONTEND           │  │         BACKEND              │  │
│  │  ┌─────────────────┐    │  │  ┌────────────────────────┐  │  │
│  │  │ React 19 + UI   │    │  │  │  42 REST API Routes    │  │  │
│  │  │ - Dashboard     │    │  │  │  - /api/auth/*         │  │  │
│  │  │ - Budget View   │    │  │  │  - /api/budget/*       │  │  │
│  │  │ - Expense Entry │    │  │  │  - /api/expenses/*     │  │  │
│  │  │ - Goal Tracker  │    │  │  │  - /api/goals/*        │  │  │
│  │  │ - Voice Input   │    │  │  │  - /api/admin/*        │  │  │
│  │  └─────────────────┘    │  │  └────────────────────────┘  │  │
│  └─────────────────────────┘  └──────────────────────────────┘  │
└────────────────┬───────────────────────────┬────────────────────┘
                 │                           │
                 ▼                           ▼
┌────────────────────────────┐  ┌────────────────────────────────┐
│      MONGODB ATLAS         │  │       GOOGLE GEMINI AI         │
│  ┌──────────────────────┐  │  │  ┌──────────────────────────┐  │
│  │ • User Profiles      │  │  │  │ • Budget Personalization │  │
│  │ • Expense Records    │  │  │  │ • Financial Tips         │  │
│  │ • Budget Data        │  │  │  │ • Spending Insights      │  │
│  │ • Goals & Debts      │  │  │  │ • Indian Context Aware   │  │
│  │ • Admin Audit Logs   │  │  │  └──────────────────────────┘  │
│  └──────────────────────┘  │  └────────────────────────────────┘
└────────────────────────────┘
```

### Data Flow Example: AI Budget Generation

```
User Input (Income, City, Family Size)
        │
        ▼
┌───────────────────────────────────┐
│  1. Rule-Based Engine             │ ── Uses 15+ Indian city cost data
│     ↓                             │
│  2. Gemini AI Enhancement         │ ── Adds personalized recommendations
│     ↓                             │
│  3. Final Budget + Tips           │ ── Returned to user
└───────────────────────────────────┘
```

---

## 3. Technology Stack & Security

### Technology Choices

| Layer              | Technology              | Purpose                           |
| ------------------ | ----------------------- | --------------------------------- |
| **Frontend**       | React 19 + Tailwind CSS | Fast, responsive UI               |
| **Backend**        | Next.js 15 (App Router) | Full-stack framework with 42 APIs |
| **Database**       | MongoDB Atlas           | Cloud-hosted, auto-scaling NoSQL  |
| **AI Engine**      | Google Gemini 2.5 Flash | Personalized financial advice     |
| **Authentication** | NextAuth v5 + OTP       | Google OAuth + Email verification |
| **Voice Input**    | Web Speech API          | Browser-native speech recognition |
| **Deployment**     | Vercel                  | Serverless, global CDN            |

### Security Implementation (Bank-Grade)

| Security Layer          | Implementation                             |
| ----------------------- | ------------------------------------------ |
| 🔐 **Password Storage** | bcryptjs hashing (10 salt rounds)          |
| 📱 **Login OTP**        | 6-digit code, 10-min expiry, rate-limited  |
| 🔒 **Data Encryption**  | AES-256-GCM for sensitive data             |
| 🌐 **Transport**        | HTTPS with TLS 1.3                         |
| 🍪 **Sessions**         | Secure, HTTP-only cookies (XSS protection) |

---

## 4. Key Innovations & Impact

### Technical Innovations

| Innovation                      | Description                                                                                  |
| ------------------------------- | -------------------------------------------------------------------------------------------- |
| **Hybrid AI Budget Engine**     | Combines rule-based city-cost algorithms with Gemini AI; graceful fallback if AI unavailable |
| **Indian Merchant Recognition** | Voice input understands "chai tapri", "auto", "kirana", "Swiggy" and auto-categorizes        |
| **10-Language Support**         | Solved production translation challenges for seamless multilingual experience                |
| **Admin Dashboard**             | Role-Based Access Control (RBAC), user management, audit logging                             |

### Project Metrics

| Metric             | Value         |
| ------------------ | ------------- |
| API Endpoints      | 42            |
| Languages          | 10            |
| City Cost Data     | 15+ cities    |
| Expense Categories | 12            |
| Cost to User       | **₹0 (Free)** |

### Social Impact

| Audience                | Benefit                                       |
| ----------------------- | --------------------------------------------- |
| **Students**            | Learn budgeting, track pocket money           |
| **Young Professionals** | First salary management, savings goals        |
| **Homemakers**          | Household budgets in regional languages       |
| **Tier-2/3 Residents**  | Accessible financial tools in native language |

---

<div align="center">

### 🌐 Live Demo: [wealthwise.vercel.app]

**WealthWise — Making Financial Planning Accessible to Every Indian**

_Contact: iamaakash1006@gmail.com_

</div>
