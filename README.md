# 🎮 WealthWise — Gamified Financial Literacy for Bharat

> **Innovate4FinLit Game Challenge — NCFE (National Centre for Financial Education)**

WealthWise is a **game-first** financial literacy platform that teaches budgeting, savings, insurance, fraud prevention, and investments through **interactive games, simulations, and decision-based learning** not textbooks.

Designed for India's diverse population — **farmers, women, students, and young adults**  with support for 10+ Indian languages, voice narration, offline mode (PWA) and low-bandwidth readiness.

---

## 🏗️ Problem Statement Alignment

| PS Requirement | WealthWise Implementation |
|---|---|
| **Rule of Three** (3+ financial themes) | ✅ 7 themes — Budgeting, Savings, Insurance, Fraud Prevention, Digital Finance, Credit, Investments |
| **Rural-Ready Technology** | ✅ PWA with offline support, low-bandwidth optimized, voice-first design |
| **Voice & Visuals over Text** | ✅ `speechSynthesis` narration in all games, visual-heavy UI, Hindi labels |
| **Behaviour over Theory** | ✅ Simulation-based (Life Decisions), decision-based (Scam Buster), consequence-driven |
| **4 User Tracks** | ✅ Farmer, Woman, Student, Young Adult — each with adapted content & scenarios |

---

## 🎯 Core Features

### 🕹️ Interactive Games (Not Quizzes)

| Game | Type | Financial Themes | Description |
|---|---|---|---|
| **Scam Buster** 🕵️ | Scenario-based | Fraud Prevention, Digital Safety | Spot real-world UPI, phishing, and loan scams |
| **Life Decisions** 🎮 | 6-month simulation | Budgeting, Savings, Investments, Debt | Make monthly financial choices with real consequences |
| **Insurance Academy** 🛡️ | Interactive learning | Insurance, Risk Assessment | Learn health, life, crop, and vehicle insurance |
| **Financial Fitness Test** 🏋️ | Adaptive assessment | All Themes | 10-question pre/post test — tracks literacy improvement |

### 🛤️ 4 User Tracks (Personas)

Each track adapts game scenarios, difficulty, and financial themes:

- 🌾 **The Farmer** — Seasonal income management, crop insurance, savings discipline
- 👩 **The Woman** — Household budgeting, SHG savings, digital safety, financial independence
- 📚 **The Student** — Needs vs wants, saving habits, avoiding peer pressure spending
- 💼 **The Young Adult** — Investment basics, tax planning, scam prevention, career finance

### 🧠 Proactive Intelligence (Guardian Layer)

- **Predictive Balance Alert** — Forecasts budget exhaustion based on spending velocity
- **Subscription Audit** — Detects unused recurring charges and calculates annual savings
- **Smart Nudge Engine** — Context-aware impulse interventions (weekend/late-night/rapid spend)
- **Goal Conflict Warning** — Warns before purchases that impact savings goals

### 🎮 Gamification System

- **XP & Leveling** — 12 levels from "Financial Newbie" 🌱 to "Financial Guru" 🏆
- **Track-based progression** — Different challenges per persona
- **Streak rewards** — Consecutive correct answers earn bonus XP
- **Pre/Post assessment** — Measurable literacy improvement via Financial Fitness Test

### 🌐 Accessibility & Inclusion

- **10+ Indian Languages** — Google Translate integration + Hindi UI labels
- **Voice-First Design** — `speechSynthesis` narration in all games (toggle on/off)
- **Offline Ready (PWA)** — Service worker, installable, works without internet
- **Low-Bandwidth Friendly** — Optimized assets, no heavy media
- **Dark Mode** — Full dark/light theme support

---

## 🏗️ Technical Architecture

```
┌────────────────────────────────────────────────┐
│                  Frontend (Next.js 15)         │
│  ┌──────────┐ ┌──────────┐ ┌────────────────┐ │
│  │ Landing   │ │ Games    │ │ Dashboard      │ │
│  │ (Game-    │ │ Hub      │ │ (Guardian +    │ │
│  │  First)   │ │ (4 games)│ │  Budget + XP)  │ │
│  └──────────┘ └──────────┘ └────────────────┘ │
│  ┌──────────────────────────────────────────┐  │
│  │ Components: Voice Hook, Track Selector,  │  │
│  │ Game Engine, Fitness Test, Nudge Engine   │  │
│  └──────────────────────────────────────────┘  │
├────────────────────────────────────────────────┤
│                  API Layer (Next.js Routes)     │
│  /api/onboarding  /api/budget  /api/guardian    │
│  /api/expenses    /api/goals   /api/insights    │
├────────────────────────────────────────────────┤
│             Backend Services                    │
│  ┌──────────┐ ┌──────────┐ ┌────────────────┐ │
│  │ MongoDB   │ │ Groq AI  │ │ NextAuth v5    │ │
│  │ (Atlas)   │ │ (Budget) │ │ (Auth)         │ │
│  └──────────┘ └──────────┘ └────────────────┘ │
├────────────────────────────────────────────────┤
│  PWA: Service Worker + Manifest + Offline Page │
└────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15.5 (App Router) |
| Runtime | React 19.1 |
| Auth | NextAuth v5 (beta) — MongoDB adapter |
| Database | MongoDB Atlas (Mongoose 8.17) |
| AI | Groq SDK — budget generation & insights |
| UI | Tailwind CSS 4, Radix UI, Framer Motion 12 |
| Charts | Recharts 3.1 |
| PWA | Custom service worker, web manifest |
| Voice | Web Speech API (`speechSynthesis`) |
| Monitoring | Sentry (client + server + edge) |
| Encryption | AES-256-GCM (server), Web Crypto API (edge) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas connection string
- Groq API key (for AI budget generation)

### Installation

```bash
git clone <repo-url>
cd WealthWise
npm install
```

### Environment Variables

Create `.env.local`:

```env
MONGODB_URI=mongodb+srv://...
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000
GROQ_API_KEY=your-groq-key
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 📂 Project Structure

```
WealthWise/
├── app/                    # Next.js App Router
│   ├── page.js             # Game-first landing page
│   ├── dashboard/          # Main dashboard + games hub
│   │   ├── games/          # Games page (4 games)
│   │   └── page.js         # Dashboard with Guardian widgets
│   ├── api/                # API routes
│   │   ├── onboarding/     # Track selection + profile
│   │   ├── budget/         # AI budget generation
│   │   ├── guardian/       # Proactive intelligence
│   │   └── ...
│   ├── auth/               # Sign in/up pages
│   └── onboarding/         # 7-step onboarding flow
├── components/
│   ├── games/              # Game components
│   │   ├── ScamBusterGame.jsx
│   │   ├── LifeDecisionsGame.jsx
│   │   ├── InsuranceModule.jsx
│   │   ├── FinancialFitnessTest.jsx
│   │   └── TrackSelector.jsx
│   ├── tools/              # Guardian intelligence widgets
│   ├── onboarding/         # Onboarding flow steps
│   └── ui/                 # Shared UI components (Radix)
├── hooks/
│   └── useSpeech.js        # Voice narration hook
├── lib/
│   ├── gameEngine.js       # XP, levels, tracks, themes
│   ├── scamBusterGame.js   # Scam scenarios & config
│   ├── lifeDecisionsGame.js# Life simulation config
│   └── i18n.js             # Translation system
├── models/
│   └── UserProfile.js      # User schema (tracks, demographics)
└── public/
    ├── sw.js               # Service worker (offline)
    └── manifest.json       # PWA manifest
```

---

## 🎓 Financial Themes Covered

1. **Budgeting** 📊 — 50-30-20 rule, seasonal income planning
2. **Savings** 🐷 — Emergency funds, SHG savings, PPF
3. **Insurance** 🛡️ — Health, life, crop (PMFBY), vehicle
4. **Fraud Prevention** 🚨 — UPI scams, phishing, Ponzi schemes
5. **Digital Finance** 📱 — UPI safety, digital payments
6. **Credit & Loans** 💳 — Interest comparison, moneylender awareness
7. **Consumer Rights** ⚖️ — Complaint filing, warranty rights
8. **Tax Planning** 📋 — New regime basics, Section 80C
9. **Investments** 📈 — SIP, PPF, government schemes

---

## 📊 Measuring Impact

- **Financial Fitness Test** — Pre-test at onboarding → post-test after games → measurable improvement
- **Theme-wise breakdown** — Identifies weak topics per user
- **XP & level tracking** — Engagement metrics
- **Track-specific analytics** — Per-persona performance data

---

