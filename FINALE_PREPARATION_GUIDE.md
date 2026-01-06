# WealthWise - Finale Technical Preparation Guide

## For Anveshana Competition

---

# SECTION 1: PROJECT OVERVIEW (Know This First!)

## What is WealthWise?

**One-Line Answer:**
> "WealthWise is an AI-powered financial planning app that helps Indians track expenses, create budgets, and achieve financial goals - all in their own language."

**Key Highlights:**
- Works on any device (phone, tablet, computer)
- Supports 10 Indian languages
- Works offline (no internet needed for basic features)
- Uses AI to give personalized advice
- Completely FREE to use

---

# SECTION 2: TECHNOLOGY STACK (What We Used)

## Simple Explanation

| Technology | What It Does | Why We Chose It |
|------------|--------------|-----------------|
| **Next.js** | Framework for building the app | Fast, modern, handles both website and server |
| **React** | Creates the user interface | Most popular, easy to build interactive pages |
| **MongoDB** | Stores all user data | Flexible, works great with JavaScript |
| **Tailwind CSS** | Makes the app look beautiful | Quick styling, responsive design |
| **Google Gemini AI** | Provides smart suggestions | Latest AI, understands Indian context |
| **NextAuth** | Handles login/signup | Secure, supports Google login |

## Architecture Diagram (Draw This on Poster)

```
┌─────────────────────────────────────────────────────────────┐
│                         USER                                 │
│                    (Phone/Computer)                          │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    NEXT.JS APP                               │
│  ┌─────────────────┐    ┌─────────────────┐                 │
│  │    FRONTEND     │    │     BACKEND     │                 │
│  │  (What user     │    │   (API Routes)  │                 │
│  │   sees)         │    │   42 endpoints  │                 │
│  └────────┬────────┘    └────────┬────────┘                 │
└───────────┼──────────────────────┼──────────────────────────┘
            │                      │
            │                      ▼
            │         ┌────────────────────────┐
            │         │      MONGODB           │
            │         │  (Database - stores    │
            │         │   users, expenses,     │
            │         │   budgets, goals)      │
            │         └────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────┐
│                    GOOGLE GEMINI AI                          │
│         (Generates budgets, gives financial tips)            │
└─────────────────────────────────────────────────────────────┘
```

---

# SECTION 3: FEATURES EXPLAINED SIMPLY

## Feature 1: Smart Budget Generation

**What it does:** Creates a personalized budget based on user's income, city, and family size.

**How it works:**
1. User enters: Income (₹50,000), City (Mumbai), Family Size (4)
2. Our algorithm checks real costs in Mumbai
3. AI adds personalized tips
4. User gets complete budget breakdown

**Example Output:**
```
Housing:     ₹15,000 (30%)
Food:        ₹10,000 (20%)
Transport:   ₹5,000  (10%)
Savings:     ₹10,000 (20%)
Others:      ₹10,000 (20%)
```

---

## Feature 2: Expense Tracking

**What it does:** Records all spending and shows where money goes.

**How it works:**
1. User adds expense: "₹500 on Swiggy"
2. App auto-categorizes: Food & Dining
3. Dashboard updates instantly
4. Charts show spending patterns

**Smart Feature:** Voice input - just say "spent 200 on auto" and it records!

---

## Feature 3: Financial Goals

**What it does:** Helps users save for specific targets.

**Example:**
- Goal: Buy iPhone (₹80,000)
- Timeline: 8 months
- Monthly saving needed: ₹10,000
- App tracks progress with visual bar

---

## Feature 4: Debt Management

**What it does:** Tracks money borrowed or lent.

**Features:**
- Add loans taken or given
- Track interest calculations
- Payment reminders
- Payment history

---

## Feature 5: Multi-Language Support

**What it does:** Entire app works in 10 Indian languages.

**Supported Languages:**
1. English
2. Hindi
3. Tamil
4. Telugu
5. Bengali
6. Marathi
7. Gujarati
8. Kannada
9. Malayalam
10. Punjabi

**Why it matters:** Financial literacy for everyone, not just English speakers.

---

## Feature 6: Works Offline (PWA)

**What it does:** App works even without internet.

**How:**
- App saves important data on device
- User can view dashboard offline
- When internet returns, data syncs automatically

**What is PWA?**
> Progressive Web App - A website that works like a mobile app. Can be installed on phone, works offline, sends notifications.

---

# SECTION 4: COMMON JUDGE QUESTIONS & ANSWERS

## Category A: Basic Technical Questions

### Q1: "What technologies did you use?"

**Answer:**
> "We used Next.js as our main framework with React for the user interface. MongoDB stores our data, and we integrated Google's Gemini AI for smart budget suggestions. For security, we use NextAuth with OTP verification."

---

### Q2: "Why did you choose these technologies?"

**Answer:**
> "We chose technologies that are:
> 1. **Free** - No licensing costs
> 2. **Modern** - Industry standard in 2024
> 3. **Scalable** - Can handle millions of users
> 4. **Fast** - Quick load times even on slow networks
>
> Next.js lets us build frontend and backend together, reducing complexity."

---

### Q3: "What is Next.js?"

**Answer:**
> "Next.js is a framework built on top of React. It gives us:
> - Server-side rendering (pages load faster)
> - API routes (backend in same project)
> - Easy deployment
> - Built-in optimizations
>
> Think of React as the engine, Next.js as the complete car."

---

### Q4: "What is MongoDB?"

**Answer:**
> "MongoDB is a NoSQL database that stores data in JSON-like documents.
>
> **Traditional Database (SQL):**
> ```
> Table: Users
> | ID | Name | Email |
> | 1  | John | j@x.com |
> ```
>
> **MongoDB:**
> ```
> {
>   name: "John",
>   email: "j@x.com",
>   expenses: [...],
>   goals: [...]
> }
> ```
>
> MongoDB is flexible - we can add new fields without changing structure."

---

### Q5: "What is an API?"

**Answer:**
> "API stands for Application Programming Interface. It's how different parts of our app communicate.
>
> **Example:**
> - User clicks 'Add Expense'
> - Frontend sends request to API: `POST /api/expenses`
> - API saves data to database
> - API responds: 'Success'
> - Frontend shows confirmation
>
> We have 42 APIs for different functions like login, expenses, budgets, goals."

---

## Category B: Security Questions

### Q6: "How do you keep user data safe?"

**Answer:**
> "We have multiple security layers:
>
> 1. **Passwords are hashed** - We never store actual passwords. We use bcryptjs to convert passwords into unreadable code.
>
> 2. **OTP Verification** - 6-digit code sent to email, expires in 10 minutes
>
> 3. **Encrypted data** - Sensitive information encrypted using AES-256 (same as banks)
>
> 4. **HTTPS** - All data transferred is encrypted
>
> 5. **Session tokens** - Stored in secure cookies, not accessible by JavaScript"

---

### Q7: "What is password hashing?"

**Answer:**
> "Hashing converts a password into unreadable text that cannot be reversed.
>
> ```
> Password: 'mypassword123'
>     ↓ (hashing)
> Stored: '$2a$10$xKz...' (60 characters)
> ```
>
> Even if someone steals our database, they cannot read passwords. When user logs in, we hash their input and compare hashes."

---

### Q8: "What is OTP and how does it work?"

**Answer:**
> "OTP = One Time Password
>
> **Our Flow:**
> 1. User enters email
> 2. Server generates random 6-digit number
> 3. OTP is hashed and stored (expires in 10 minutes)
> 4. OTP sent to user's email
> 5. User enters OTP
> 6. Server verifies by comparing hashes
>
> **Security:**
> - Only 5 OTP requests allowed per 15 minutes
> - Only 5 wrong attempts allowed
> - 1-minute wait between resend requests"

---

## Category C: AI Questions

### Q9: "How does AI generate budgets?"

**Answer:**
> "Our AI budget generation has two parts:
>
> **Part 1: Algorithm (Rule-based)**
> - We have real cost data for 15+ Indian cities
> - Mumbai rent: ₹18,000-35,000
> - Delhi rent: ₹12,000-25,000
> - Algorithm calculates based on income and family size
>
> **Part 2: AI Enhancement (Gemini)**
> - We send user profile to Google Gemini
> - AI adds personalized explanations
> - AI provides saving tips
> - AI considers user's specific situation
>
> **Why both?**
> If AI fails, algorithm still works. User always gets a budget."

---

### Q10: "What is Gemini AI?"

**Answer:**
> "Gemini is Google's latest AI model, similar to ChatGPT.
>
> **We use it for:**
> 1. Budget explanations - Why allocate ₹X for food
> 2. Saving tips - How to reduce spending
> 3. Financial insights - Patterns in spending
>
> **How we call it:**
> - Send user data to Gemini API
> - Gemini processes and returns suggestions
> - We display suggestions to user
>
> **Fallback:**
> If Gemini is unavailable, we show pre-written tips instead."

---

## Category D: Feature Questions

### Q11: "How does voice expense entry work?"

**Answer:**
> "We use the browser's built-in Speech Recognition API.
>
> **Flow:**
> 1. User clicks microphone icon
> 2. Browser starts listening
> 3. User says: 'Spent 500 on Swiggy'
> 4. Browser converts speech to text
> 5. Our code extracts: Amount=500, Merchant=Swiggy
> 6. Auto-categorize: Swiggy → Food & Dining
> 7. Expense saved
>
> **Indian Context:**
> We understand local terms:
> - 'chai tapri' → Food
> - 'auto' → Transport
> - 'kirana' → Groceries"

---

### Q12: "How does offline mode work?"

**Answer:**
> "We use a Service Worker - a script that runs in the background.
>
> **On First Visit:**
> - Service Worker downloads and caches important files
> - Dashboard, icons, styles are saved on device
>
> **When Offline:**
> - Service Worker intercepts requests
> - Returns cached files instead of going to internet
> - User sees their last-known data
>
> **When Online Again:**
> - New data syncs with server
> - Cache updates with fresh content"

---

### Q13: "How does multi-language work?"

**Answer:**
> "We integrate Google Translate at the page level.
>
> **Flow:**
> 1. User selects language (e.g., Hindi)
> 2. We set a cookie: `googtrans=/en/hi`
> 3. Google Translate script loads
> 4. Entire page translated automatically
>
> **Why Google Translate?**
> - Translating 500+ text strings manually = months of work
> - Google Translate = instant support for 10 languages
> - Quality is good enough for financial context"

---

## Category E: PWA Questions

### Q14: "What is a PWA?"

**Answer:**
> "PWA = Progressive Web App
>
> **It's a website that acts like an app:**
> - Can be installed on home screen
> - Works offline
> - Fast loading
> - Can send notifications
>
> **Benefits over Native App:**
> | Native App | PWA |
> |------------|-----|
> | Download from store | Open in browser |
> | 50-100 MB size | 2 MB initial |
> | Separate Android/iOS code | One code for all |
> | Store approval needed | Deploy instantly |
> | Updates via store | Auto-updates |"

---

### Q15: "Why PWA instead of mobile app?"

**Answer:**
> "Three main reasons:
>
> 1. **Accessibility** - Works on any device with a browser
> 2. **Storage** - Many Indians have phones with limited storage. PWA uses minimal space.
> 3. **Development** - One codebase instead of separate Android + iOS apps
>
> Our target users (students, young professionals) benefit from not needing to download another app."

---

## Category F: Database Questions

### Q16: "How is data organized in your database?"

**Answer:**
> "We have 3 main collections:
>
> **1. Users** - Basic account info
> ```
> {
>   email: 'user@email.com',
>   name: 'Rahul',
>   preferences: { language: 'hi', theme: 'dark' }
> }
> ```
>
> **2. UserProfiles** - Financial data
> ```
> {
>   monthlyIncome: 50000,
>   expenses: [...],
>   goals: [...],
>   budget: {...}
> }
> ```
>
> **3. Debts** - Loan tracking
> ```
> {
>   type: 'taken',
>   amount: 10000,
>   interestRate: 5,
>   dueDate: '2024-12-31'
> }
> ```"

---

### Q17: "What are database indexes?"

**Answer:**
> "Indexes make searching faster - like an index in a book.
>
> **Without Index:**
> Finding user by email = Check all 100,000 records = Slow
>
> **With Index:**
> Finding user by email = Direct lookup = Fast
>
> **Our Indexes:**
> - Email (unique) - Fast login
> - UserId - Fast profile lookup
> - Due date - Fast upcoming payment queries"

---

## Category G: Challenges & Future

### Q18: "What was your biggest challenge?"

**Answer:**
> "Making AI understand Indian financial context.
>
> **Problem:**
> Generic AI didn't understand Indian terms like 'chai tapri' or Indian spending patterns.
>
> **Solution:**
> 1. Built custom merchant-category mapping
> 2. Added city-wise cost data (15+ cities)
> 3. Included Indian context in AI prompts
> 4. Created fallback rules for unknown terms
>
> **Another Challenge:**
> Google Translate not working in production (worked on localhost).
>
> **Solution:**
> Set translation cookies on multiple domain variations to ensure compatibility."

---

### Q19: "What would you improve with more time?"

**Answer:**
> "Key improvements planned:
>
> 1. **Bank Integration** - Auto-import transactions from bank accounts
>
> 2. **Family Budgets** - Shared household expense tracking
>
> 3. **ML Predictions** - Predict next month's expenses
>
> 4. **WhatsApp Bot** - Add expenses via WhatsApp message
>
> 5. **Investment Tracking** - Mutual funds, stocks portfolio"

---

### Q20: "How will this scale to more users?"

**Answer:**
> "Our architecture supports growth:
>
> 1. **Serverless** - Vercel auto-scales based on traffic
> 2. **MongoDB Atlas** - Cloud database scales automatically
> 3. **Caching** - Service Worker reduces server load by 80%
> 4. **CDN** - Content served from nearest location globally
>
> **Current capacity:** ~10,000 users on free tier
> **With paid tier:** Millions of users"

---

# SECTION 5: DEMO SCRIPT (Practice This!)

## Demo Flow (5 minutes)

### Step 1: Introduction (30 seconds)
> "This is WealthWise, an AI-powered financial planner for Indians. Let me show you how it works."

### Step 2: Sign Up (45 seconds)
- Show Google login (one-click)
- OR show email + OTP flow
- Mention: "OTP expires in 10 minutes for security"

### Step 3: Onboarding (60 seconds)
- Enter income: ₹50,000
- Select city: Mumbai
- Enter family size: 4
- Click Generate Budget
- Show AI-generated budget with explanations

### Step 4: Add Expense (45 seconds)
- Click "Add Expense"
- Enter: ₹500, Food, Swiggy
- Show how it appears in dashboard
- **Impressive:** Use voice input - "Spent 200 on auto"

### Step 5: Dashboard (60 seconds)
- Show expense chart
- Show budget vs actual
- Show financial insights
- Point out health score

### Step 6: Special Features (60 seconds)
- Switch language to Hindi (show translation)
- Toggle dark mode
- Show goals section
- Mention offline capability

### Step 7: Close (30 seconds)
> "WealthWise makes financial planning accessible to every Indian - in their own language, on any device, completely free."

---

# SECTION 6: QUICK REVISION CARD

## Print This and Keep!

```
┌─────────────────────────────────────────────────────────────┐
│                 WEALTHWISE QUICK FACTS                       │
├─────────────────────────────────────────────────────────────┤
│ TECH STACK:                                                  │
│ • Frontend: Next.js 15, React 19, Tailwind CSS              │
│ • Backend: Next.js API Routes (42 endpoints)                │
│ • Database: MongoDB Atlas                                    │
│ • AI: Google Gemini 2.5 Flash                               │
│ • Auth: NextAuth v5 + OTP                                   │
├─────────────────────────────────────────────────────────────┤
│ KEY FEATURES:                                                │
│ • AI Budget Generation (algorithm + Gemini)                 │
│ • Expense Tracking (voice input supported)                  │
│ • 10 Indian Languages                                       │
│ • Works Offline (PWA)                                       │
│ • Goal & Debt Management                                    │
├─────────────────────────────────────────────────────────────┤
│ SECURITY:                                                    │
│ • Password: bcryptjs hashing (10 rounds)                    │
│ • OTP: 6 digits, 10 min expiry, rate limited               │
│ • Data: AES-256-GCM encryption                              │
│ • Transport: HTTPS/TLS                                      │
├─────────────────────────────────────────────────────────────┤
│ NUMBERS TO REMEMBER:                                         │
│ • 42 API endpoints                                          │
│ • 10 languages supported                                    │
│ • 15+ cities cost data                                      │
│ • 6-digit OTP, 10 min expiry                               │
│ • AES-256 encryption (bank-level)                          │
│ • Zero cost to users                                        │
├─────────────────────────────────────────────────────────────┤
│ WHY WEALTHWISE?                                              │
│ • 76% Indians don't track expenses                          │
│ • Existing apps: English-only, paid features               │
│ • WealthWise: Free, multilingual, works offline            │
└─────────────────────────────────────────────────────────────┘
```

---

# SECTION 7: IF YOU DON'T KNOW THE ANSWER

## Use These Phrases:

**If you partially know:**
> "That's a great question. From what I understand, [explain what you know]. We could explore this further by [suggest approach]."

**If you don't know:**
> "I'm not certain about that specific detail, but I can explain how [related concept] works in our system."

**If it's outside scope:**
> "That feature isn't implemented yet, but it's on our roadmap. Currently, we handle this by [current approach]."

---

# SECTION 8: BODY LANGUAGE TIPS

1. **Stand confidently** - feet shoulder-width apart
2. **Make eye contact** - with all judges, not just one
3. **Point to demo/poster** - when explaining features
4. **Speak slowly** - judges need time to understand
5. **Pause after key points** - let information sink in
6. **Smile** - shows confidence and enthusiasm
7. **Use hands** - to illustrate concepts
8. **If nervous** - take a deep breath before answering

---

# SECTION 9: FINAL CHECKLIST

## Before Presentation:

- [ ] Test demo account works
- [ ] Clear browser cache
- [ ] Check internet connection
- [ ] Have backup mobile hotspot
- [ ] Poster is clean and visible
- [ ] Practice demo flow 3 times
- [ ] Review this guide once more

## Things to Carry:

- [ ] Laptop (fully charged)
- [ ] Charger
- [ ] Mobile hotspot device
- [ ] Poster
- [ ] This guide (printed)
- [ ] Water bottle

---

**ALL THE BEST FOR THE FINALE!**

*Remember: You built this project. You know it better than anyone. Be confident!*
