# WealthWise | Judge Quick Reference Card
## AI-Powered Financial Planner for India

---

### THE PROBLEM
- 76% of Indians do not track expenses
- Finance apps are English-only, need downloads, require internet
- No affordable solution for tier-2/3 cities

### THE SOLUTION
> AI-powered PWA: Track expenses, create budgets, achieve goals
> Works in 10 languages, offline, completely FREE

---

### TECH STACK AT A GLANCE

```
Frontend:    Next.js 15 + React 19 + Tailwind CSS
Backend:     42 REST API Endpoints
Database:    MongoDB Atlas (Cloud)
AI:          Google Gemini 2.5 Flash
Auth:        NextAuth v5 + Email OTP
Deployment:  Vercel (Serverless)
Type:        Progressive Web App (PWA)
```

---

### 6 CORE FEATURES

| # | Feature | Technology |
|---|---------|------------|
| 1 | AI Budget Generation | Gemini AI + Rule Engine |
| 2 | Voice Expense Entry | Web Speech API |
| 3 | 10 Indian Languages | Google Translate |
| 4 | Offline Mode | Service Worker + Cache |
| 5 | Goal Tracking | Visual Progress Charts |
| 6 | Debt Management | Loan Calculator + Reminders |

---

### SECURITY (Bank-Grade)

| What | How |
|------|-----|
| Passwords | bcryptjs hashed (never stored plain) |
| Login | 6-digit OTP, 10-min expiry |
| Data | AES-256-GCM encryption |
| Transport | HTTPS/TLS 1.3 |
| Sessions | Secure HTTP-only cookies |

---

### KEY NUMBERS

| 42 | API Endpoints |
| 10 | Languages Supported |
| 15+ | Indian Cities (Cost Data) |
| 12 | Expense Categories |
| 0 | Cost to Users |

---

### UNIQUE VALUE PROPOSITION

| Others | WealthWise |
|--------|------------|
| English only | 10 Indian languages |
| App download required | Works in browser (PWA) |
| Needs internet | Works offline |
| Paid premium features | 100% Free |
| Generic budgets | AI + city-specific costs |

---

### INNOVATION HIGHLIGHTS

1. **Hybrid AI Budget Engine**
   - Algorithm: City-specific cost calculations
   - AI: Personalized tips from Gemini
   - Fallback: Works even if AI fails

2. **Indian Context Recognition**
   - Understands: chai tapri, auto, kirana, Swiggy
   - Maps to proper expense categories

3. **Production-Ready Admin Panel**
   - RBAC with 4 permission levels
   - Audit logging, analytics dashboard

---

### SOCIAL IMPACT

Empowering Indians who have:
- Limited English proficiency
- Limited smartphone storage
- Unreliable internet access
- No formal financial education

---

### ARCHITECTURE

```
[User] --> [Next.js App] --> [MongoDB]
                |
                +--> [Gemini AI]
                |
                +--> [Service Worker] --> [Offline Cache]
```

---

### QUESTIONS?

| Topic | Ask About |
|-------|-----------|
| AI | How budget generation works |
| Security | OTP flow, encryption methods |
| PWA | Service Worker, offline sync |
| Languages | Google Translate integration |
| Database | MongoDB schema design |

---

**Live at:** [Production URL]
**Team:** [Your Names]
**Email:** iamaakash1006@gmail.com

---

*Anveshana Finale 2025*
