# WealthWise - One Page Quick Reference

## THE PROJECT IN 30 SECONDS

> "WealthWise is an AI-powered financial planner that helps Indians track expenses, create budgets, and achieve goals - in 10 languages, working offline, completely free."

---

## TECH STACK (Memorize This!)

| Layer | Technology | One-Line Explanation |
|-------|------------|---------------------|
| Frontend | Next.js + React | Modern framework for fast, interactive websites |
| Styling | Tailwind CSS | Utility classes for beautiful responsive design |
| Database | MongoDB | Flexible document database for user data |
| AI | Google Gemini | Smart budget generation and financial tips |
| Auth | NextAuth + OTP | Secure login with email verification |
| PWA | Service Worker | Offline capability and app-like experience |

---

## 6 KEY FEATURES

| # | Feature | How It Works |
|---|---------|--------------|
| 1 | **AI Budget** | User enters income + city → Algorithm + AI creates personalized budget |
| 2 | **Expense Tracking** | Add expenses manually or via voice → Auto-categorized |
| 3 | **10 Languages** | Google Translate integration → Hindi, Tamil, Telugu, etc. |
| 4 | **Offline Mode** | Service Worker caches data → Works without internet |
| 5 | **Goals** | Set target amount + deadline → Track progress visually |
| 6 | **Debt Manager** | Track loans taken/given → Payment reminders |

---

## SECURITY (4 Layers)

```
1. PASSWORDS    → Hashed with bcryptjs (never stored as text)
2. OTP          → 6 digits, expires in 10 minutes, rate limited
3. DATA         → AES-256-GCM encryption (bank-level)
4. TRANSPORT    → HTTPS (all data encrypted in transit)
```

---

## IMPORTANT NUMBERS

| What | Number | Context |
|------|--------|---------|
| API Endpoints | 42 | Different functions (login, expenses, budget, etc.) |
| Languages | 10 | Indian regional languages supported |
| Cities | 15+ | Have real cost-of-living data |
| OTP Expiry | 10 min | Security measure |
| OTP Length | 6 digits | Random, secure |
| Encryption | AES-256 | Same as banks use |
| Cost to User | ₹0 | Completely free |

---

## TOP 5 JUDGE QUESTIONS

### Q1: "What technologies did you use?"
> "Next.js for frontend and backend, MongoDB for database, Google Gemini for AI, NextAuth for secure login with OTP verification."

### Q2: "How is data secured?"
> "Passwords hashed with bcryptjs, OTP verification for login, AES-256 encryption for sensitive data, all communication over HTTPS."

### Q3: "How does AI budget work?"
> "Two parts: First, our algorithm calculates based on city costs and income. Then, Gemini AI adds personalized explanations and tips."

### Q4: "Why PWA not mobile app?"
> "PWA works on all devices, needs no download, uses less storage, one codebase for all platforms, auto-updates."

### Q5: "What was your biggest challenge?"
> "Making AI understand Indian context - terms like 'chai tapri', city-specific costs. We built custom mappings and included context in AI prompts."

---

## DEMO FLOW (5 Steps)

```
1. SIGNUP      → Show Google login OR email+OTP (30 sec)
2. ONBOARDING  → Enter income, city → AI generates budget (60 sec)
3. ADD EXPENSE → Manual + Voice input demo (45 sec)
4. DASHBOARD   → Charts, insights, health score (60 sec)
5. FEATURES    → Language switch, dark mode, offline (60 sec)
```

---

## IF STUCK ON A QUESTION

**Know partial answer:**
> "From what I understand, [what you know]. We could explore this further."

**Don't know:**
> "I'm not certain about that detail, but I can explain [related concept]."

**Outside scope:**
> "That's not implemented yet, but it's planned. Currently we handle it by [current way]."

---

## ARCHITECTURE DIAGRAM (Draw on Poster)

```
    USER (Phone/Computer)
           │
           ▼
    ┌──────────────┐
    │   NEXT.JS    │
    │  ┌────┬────┐ │
    │  │ UI │ API│ │
    │  └────┴────┘ │
    └──────┬───────┘
           │
     ┌─────┴─────┐
     ▼           ▼
 MONGODB    GEMINI AI
 (Data)     (Smart Tips)
```

---

## UNIQUE SELLING POINTS

| Problem | Our Solution |
|---------|--------------|
| 76% Indians don't budget | Easy AI-generated budgets |
| Apps are English-only | 10 Indian languages |
| Apps need download | PWA - works in browser |
| Apps need internet | Works offline |
| Apps have paid features | Completely FREE |

---

## CONFIDENCE BOOSTERS

- You BUILT this - you know it best
- Judges want to see YOUR understanding
- It's okay to say "I'll find out"
- Speak slowly and clearly
- Smile and make eye contact

---

**YOU'VE GOT THIS!**
