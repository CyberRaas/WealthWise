# WealthWise - Codebase Context

> AI-powered personal finance management platform for Indian users.

---

## Project Overview

**WealthWise** is a comprehensive financial planning application built for the Indian market. It combines AI-powered budget generation, expense tracking with voice input in 10 Indian languages, goal/debt management, investment recommendations, and a complete admin panel.

**Stack:** Next.js 15 | React 19 | MongoDB Atlas | Google Gemini AI | Tailwind v4 | NextAuth v5

---

## Directory Structure

```
wealthwise-1/
├── app/                    # Next.js App Router pages & API routes
│   ├── api/                # 27 API route directories (42+ endpoints)
│   ├── auth/               # Authentication pages (signin, signup, verify)
│   ├── dashboard/          # Main dashboard views (19 sub-routes)
│   ├── admin/              # Admin panel pages
│   ├── onboarding/         # User onboarding flow
│   ├── layout.js           # Root layout with providers
│   └── page.js             # Landing page
├── components/             # React components (organized by feature)
│   ├── ui/                 # shadcn/ui base components
│   ├── dashboard/          # Dashboard-specific components
│   ├── budget/             # Budget management components
│   ├── expenses/           # Expense tracking components
│   ├── investment/         # Investment recommendation UI
│   ├── split/              # Split expense features
│   └── ...                 # 26 feature directories
├── lib/                    # Server utilities & business logic
│   ├── auth.js             # NextAuth configuration
│   ├── budgetGenerator.js  # AI budget engine (58KB)
│   ├── investmentRecommendationEngine.js
│   ├── voiceProcessor.js   # Voice input processing
│   ├── i18n.js             # 10 Indian languages support
│   └── ...                 # 37 utility files
├── models/                 # Mongoose schemas (11 models)
├── contexts/               # React contexts (4 files)
├── hooks/                  # Custom React hooks
├── middleware.js           # Auth & rate limiting middleware
└── public/                 # Static assets
```

---

## Key Features

| Feature | Description | Key Files |
|---------|-------------|-----------|
| **AI Budget** | Gemini-powered personalized budgets for 15+ Indian cities | `lib/budgetGenerator.js`, `lib/advancedBudgetEngine.js` |
| **Voice Expense** | Voice input in 10 Indian languages | `lib/voiceProcessor.js`, `components/voice/` |
| **Goal Tracking** | Financial goal setting & progress | `models/UserProfile.js`, `app/api/goals/` |
| **Debt Management** | Loan tracking with payoff strategies | `models/Debt.js`, `lib/debtSimplifier.js` |
| **Investment** | Risk-profiled investment recommendations | `lib/investmentRecommendationEngine.js`, `models/RiskProfile.js` |
| **Split Expenses** | Group expense splitting | `models/SplitExpense.js`, `models/SplitGroup.js` |
| **Admin Panel** | RBAC-based user management | `app/admin/`, `contexts/AdminContext.js` |
| **Retention** | User engagement & retention engine | `lib/retentionEngine.js`, `components/retention/` |

---

## Database Models

```
User.js              → Authentication (email, googleId, role)
UserProfile.js       → User financial data (income, city, goals)
Debt.js              → Loan/debt tracking
RiskProfile.js       → Investment risk assessment
InvestmentRecommendation.js → Generated investment suggestions
SplitExpense.js      → Shared expense records
SplitGroup.js        → Expense sharing groups
Settlement.js        → Group expense settlements
LearningProgress.js  → Financial education tracking
AdminAuditLog.js     → Admin action logging
SystemConfig.js      → System-wide configuration
```

---

## API Routes Overview

| Category | Routes | Purpose |
|----------|--------|---------|
| `/api/auth/*` | 9 routes | Registration, login, OTP, Google OAuth |
| `/api/budget/*` | 2 routes | Budget generation & retrieval |
| `/api/expenses/*` | 2 routes | CRUD for expenses |
| `/api/goals/*` | 1 route | Financial goal management |
| `/api/debt/*` | 2 routes | Debt tracking |
| `/api/investment/*` | 4 routes | Investment recommendations, risk profiles |
| `/api/split/*` | 6 routes | Split expense management |
| `/api/admin/*` | 8 routes | User management, analytics, audit logs |
| `/api/notifications/*` | 3 routes | Push notifications |
| `/api/chat/*` | 1 route | AI chatbot (Groq) |

---

## Authentication Flow

```
User → Signin/Signup → Email+OTP or Google OAuth
     → NextAuth v5 → JWT Session → Middleware Check
     → Onboarding (if new) → Dashboard
```

**Security Layers:**
- TLS 1.3 encryption
- Rate limiting (5 login attempts/15min)
- bcryptjs password hashing (10 rounds)
- OTP verification (6-digit, 10-min expiry)
- HTTP-only secure cookies
- AES-256-GCM data encryption

---

## Role-Based Access Control

| Role | Permissions |
|------|-------------|
| **user** | Own data CRUD, AI features, dashboard |
| **moderator** | + View all users, analytics |
| **admin** | + Manage users, delete accounts, audit logs, system config |

---

## Key Configuration Files

| File | Purpose |
|------|---------|
| `.env.local` | Environment variables (DB, API keys, secrets) |
| `middleware.js` | Auth checks, rate limiting, route protection |
| `lib/auth.js` | NextAuth configuration |
| `next.config.mjs` | Next.js configuration |
| `components.json` | shadcn/ui configuration |

---

## External Services

| Service | Purpose |
|---------|---------|
| **MongoDB Atlas** | Primary database |
| **Google Gemini 2.5** | AI budget generation & insights |
| **Groq** | AI chatbot |
| **Nodemailer** | OTP email delivery |
| **Sentry** | Error monitoring |
| **Vercel** | Hosting & edge functions |

---

## Development Commands

```bash
npm run dev           # Start dev server (Turbopack)
npm run build         # Production build
npm run lint          # ESLint
npm run verify-auth   # Verify auth configuration
npm run cleanup-db    # Clean invalid profiles
```

---

## Quick Start

1. Clone & install: `npm install`
2. Copy `.env.local.example` to `.env.local` and fill in values
3. Run: `npm run dev`
4. Open: http://localhost:3000

---

## Related Documentation

- [ARCHITECTURE_DIAGRAM.md](./ARCHITECTURE_DIAGRAM.md) - Detailed system architecture
- [FEATURE_DEVELOPMENT_PLAN.md](./FEATURE_DEVELOPMENT_PLAN.md) - Roadmap
- [ROADMAP_PS7.md](./ROADMAP_PS7.md) - PS7 specific roadmap

---

*Last Updated: January 2026 | Anveshna 2025 Project*
