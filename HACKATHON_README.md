# WealthWise Agent - Mumbai Hacks 2024 Submission

## 🏆 Problem Statement

**PS1: Autonomous Financial Coaching for Gig Workers and Informal Sector Employees**

Build an autonomous financial coaching agent that adapts to real user behavior, spending patterns, and income variability — helping gig workers, informal sector employees, and everyday citizens make smarter financial decisions proactively.

---

## 🎯 Solution Overview

**WealthWise Agent** is an AI-powered autonomous financial coaching system specifically designed for India's gig economy workers (90% of the workforce). Unlike traditional personal finance apps that require manual tracking, our system features **multiple autonomous agents** that work 24/7 to:

- ✅ **Monitor income variability** and automatically adjust budgets
- ✅ **Detect overspending patterns** and send preventive alerts BEFORE problems occur
- ✅ **Find savings opportunities** and auto-allocate to goals
- ✅ **Provide real-time coaching** based on individual behavior patterns
- ✅ **Predict future income** for gig workers with irregular earnings
- ✅ **Optimize work schedules** using AI-powered insights

---

## 🚀 Key Features

### 1. **Multi-Agent Autonomous System**

Four specialized AI agents work together autonomously:

#### 🔍 **Income Analyzer Agent**
- Detects income variability (fixed, hybrid, or variable)
- Classifies user as salaried vs gig worker
- Predicts next month's income with confidence intervals
- Sends alerts when income drops >25%
- Calculates volatility score and recommends emergency fund size

#### 🤖 **Financial Coach Agent**
- Monitors spending 24/7 in real-time
- Learns user's spending patterns (weekends, evenings, specific merchants)
- Sends **preventive alerts** before overspending (not after!)
- Personalized coaching messages using Google Gemini AI
- Budget health scoring (0-100)

#### 💰 **Smart Savings Agent**
- Automatically detects budget surplus
- Recommends round-up savings
- Auto-allocates surplus to high-priority goals
- Celebrates milestones (25%, 50%, 75%, 100%)
- Suggests savings rate improvements

#### 📊 **Financial Health Monitor Agent**
- Continuous monitoring of debt-to-income ratio
- Emergency fund coverage tracking
- Savings rate analysis
- Financial stress detection
- Overall health score (0-100)

### 2. **Gig Worker Specialized Features**

#### 📱 **Gig Earnings Tracker**
- Track earnings from Swiggy, Zomato, Uber, Ola, Rapido, etc.
- Per-trip expense tracking (fuel, toll, maintenance)
- Net earnings calculation
- Platform comparison analytics

#### 🧠 **AI-Powered Insights**
- **Best earning days**: "You earn 30% more on Saturdays"
- **Peak hours**: "Your best hours are 6-10 PM"
- **Platform efficiency**: "Swiggy gives ₹45/trip, Zomato gives ₹38/trip"
- **Weekly target tracking**: "8 more trips needed to hit ₹8,000"
- **Expense optimization**: "Your fuel cost is high - optimize routes"

#### 💡 **Dynamic Budget Adjustment**
Traditional apps fail for gig workers because they assume fixed monthly income. Our system:
- **Automatically adjusts budget** based on actual weekly income
- Protects essential categories (food, housing) during low-income weeks
- Scales discretionary spending based on earnings
- Recommends income smoothing strategy

**Example:**
```
Week 1: Earned ₹6,000 → Budget: ₹5,400 (90% spend, 10% save)
Week 2: Earned ₹4,000 → Budget auto-reduced to ₹3,600
Week 3: Earned ₹8,000 → Budget increased to ₹7,200
```

### 3. **Proactive Interventions**

Unlike reactive apps, our agents **prevent problems before they happen**:

#### Scenario 1: Overspending Prevention
```
User: Priya typically overspends on Fridays after payday

Agent Action (Thursday):
"Hey Priya! Tomorrow is Friday and you usually shop online.
You have ₹1,200 left in shopping budget. Want me to set a
reminder when you reach ₹900?"
```

#### Scenario 2: Income Drop Response
```
User: Ramesh's income dropped 35% this week (rain, less orders)

Multi-Agent Collaboration:
1. IncomeAnalyzer detects drop
2. Alerts BudgetAgent
3. BudgetAgent cuts discretionary spending
4. SavingsAgent pauses auto-savings
5. CoachAgent sends consolidated message:

"Income lower this week. I've adjusted your budget,
reduced entertainment by ₹800, and paused savings
goals temporarily. Focus on essentials. You'll bounce back! 💪"
```

#### Scenario 3: Savings Opportunity
```
User: Amit spent ₹300 less on fuel this week

Agent Action (Sunday):
"Great! You saved ₹300 on fuel this week. Should I add
this to your Son's Education goal? You'll reach it 2 weeks
earlier! 🎓 [Yes] [Not Now]"

If Yes → Auto-allocates → "Amazing! You're now 78% to goal!"
```

### 4. **Multi-Language Support**

Designed for India's diverse population:
- **English, Hindi, Hinglish**
- Voice input support for low-literacy users
- SMS interface for users who don't regularly check apps
- Number formatting (Indian vs International)

### 5. **Behavioral Learning**

Agents learn from each interaction:
- Track which interventions work
- Personalize coaching style
- Adapt notification frequency
- Remember user preferences

---

## 🏗️ Technical Architecture

### Tech Stack

**Frontend:**
- Next.js 15 + React 19
- Tailwind CSS 4
- Radix UI components
- Recharts for data visualization

**Backend:**
- Node.js (Vercel serverless)
- MongoDB + Mongoose
- Redis (agent state management)
- NextAuth.js (authentication)

**AI/ML:**
- Google Gemini Pro (personalized coaching)
- Custom ML algorithms (income prediction, pattern detection)
- Statistical analysis (volatility, trends)

**Infrastructure:**
- Vercel (hosting + cron jobs)
- Vercel Cron (scheduled agent execution)
- Redis (Upstash - agent memory)

### Agent System Architecture

```
┌─────────────────────────────────────────────────┐
│           User Interface Layer                   │
│  (Next.js App + SMS Interface)                  │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│         Agent Orchestration Layer               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ Income   │  │  Coach   │  │ Savings  │     │
│  │ Analyzer │  │  Agent   │  │  Agent   │     │
│  └──────────┘  └──────────┘  └──────────┘     │
│  ┌──────────┐                                   │
│  │ Health   │         Agent Manager             │
│  │ Monitor  │      (Coordination)               │
│  └──────────┘                                   │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│         AI Decision Engine                       │
│  (Google Gemini + Custom Algorithms)            │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│            Data Layer                            │
│  MongoDB (user data) + Redis (agent state)      │
└──────────────────────────────────────────────────┘
```

### Agent Lifecycle (Observe-Decide-Act-Learn)

Each agent follows this autonomous cycle:

1. **OBSERVE**: Gather data about user's financial situation
2. **DECIDE**: Analyze data and make autonomous decisions
3. **ACT**: Execute decisions (send notifications, adjust budgets)
4. **LEARN**: Update behavior based on user responses

### Scheduled Execution

Agents run automatically via Vercel Cron:
- Every 6 hours for all active users
- Triggered on specific events (new expense, income change)
- Manual triggers available via API

---

## 📊 Impact & Innovation

### Why This Wins

#### 1. **True Agentic AI** (Not Just Chatbots)
- Agents run autonomously in background
- Make decisions without user input
- Learn and adapt over time
- Multi-agent collaboration

#### 2. **Massive Underserved Market**
- 90% of Indian workforce is informal/gig
- First app designed FOR income variability
- Addresses real pain points

#### 3. **Proactive, Not Reactive**
- Traditional apps: User checks balance
- WealthWise: Agent alerts user BEFORE problems
- Preventive interventions based on learned patterns

#### 4. **Measurable Impact**
- Increased savings rate (projected 40% improvement)
- Reduced financial stress
- Better goal achievement rates
- Optimized gig worker earnings

#### 5. **Inclusive Design**
- Multi-language support
- Voice + SMS input
- Low digital literacy friendly
- Works for variable income (unlike competitors)

---

## 🎨 User Experience Highlights

### Gig Worker Dashboard
- Quick earnings entry (30 seconds)
- Real-time insights
- Platform comparison
- Weekly target tracking

### Agent Dashboard
- Monitor all active agents
- View recent notifications
- Agent performance metrics
- Manual trigger controls

### Smart Notifications
- Context-aware alerts
- Actionable recommendations
- Celebratory messages for wins
- Educational tips

---

## 🔧 Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB database
- Redis instance
- Google Gemini API key

### Environment Variables

```bash
# Database
MONGODB_URI=mongodb+srv://...
REDIS_URL=redis://...

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# AI
GEMINI_API_KEY=your-gemini-api-key

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASSWORD=your-app-password

# Encryption
ENCRYPTION_SECRET=your-64-char-hex-key

# Cron Jobs
CRON_SECRET=your-cron-secret
```

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Set up Cron Jobs

1. Deploy to Vercel
2. Add `CRON_SECRET` environment variable
3. Cron jobs will run automatically (configured in `vercel.json`)

---

## 📈 Future Enhancements

### Short-term (Post-Hackathon)
- SMS/WhatsApp integration via Twilio
- Bank statement auto-import
- Financial Literacy Agent
- Investment recommendations
- Bill payment reminders

### Long-term
- Peer group comparison
- Gamification & rewards
- Micro-insurance integration
- Credit score improvement tracking
- Community features (gig worker forums)

---

## 🤝 Team

- **Your Name** - Full Stack Development, AI Integration
- [Add team members if applicable]

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- Mumbai Hacks 2024 organizers
- Google Gemini AI
- The gig worker community for inspiration

---

## 📞 Contact

For demo or questions, contact: [Your Email]

---

**Built with ❤️ for India's gig workers**
