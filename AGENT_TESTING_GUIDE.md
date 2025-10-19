# Agent System Testing Guide

This guide helps you test the autonomous agent system.

## Quick Start

### 1. Initialize Agents

Agents are automatically initialized on first API call. To manually initialize:

```javascript
// In your browser console or via API
fetch('/api/agents/status').then(r => r.json()).then(console.log)
```

### 2. Run All Agents Manually

```bash
# Via API
curl -X POST http://localhost:3000/api/agents/run \
  -H "Content-Type: application/json" \
  -d '{}'
```

Or use the Agent Dashboard:
- Navigate to `/dashboard/agents`
- Click "Run All Agents"

### 3. Run Specific Agent

```bash
curl -X POST http://localhost:3000/api/agents/run \
  -H "Content-Type: application/json" \
  -d '{"agent": "IncomeAnalyzer"}'
```

---

## Testing Each Agent

### 🔍 Income Analyzer Agent

**Purpose:** Detects income variability and classifies user type

**Test Scenarios:**

1. **Add Variable Income:**
```bash
# Add gig earnings for multiple weeks
POST /api/gig/earnings
{
  "platform": "swiggy",
  "amount": 6000,
  "date": "2024-10-12"
}

POST /api/gig/earnings
{
  "platform": "swiggy",
  "amount": 4000,
  "date": "2024-10-15"
}

# Run agent
POST /api/agents/run
{ "agent": "IncomeAnalyzer" }
```

**Expected Results:**
- Detects income type: "variable"
- Calculates volatility score
- Sends notification about income drop
- Updates user profile with income classification

**Verify:**
```bash
GET /api/agents/notifications?unreadOnly=true
```

---

### 🤖 Financial Coach Agent

**Purpose:** Real-time spending monitoring and overspending alerts

**Test Scenarios:**

1. **Trigger Overspending Alert:**
```bash
# First, check budget categories
GET /api/profile

# Add expenses that exceed budget
POST /api/expenses
{
  "category": "Entertainment",
  "amount": 2000,
  "description": "Movie tickets",
  "date": "2024-10-19"
}

# Run coach agent
POST /api/agents/run
{ "agent": "FinancialCoach" }
```

**Expected Results:**
- Detects overspending (>80% of budget)
- Sends alert with severity level
- Provides personalized tips via Gemini AI

2. **Test Behavioral Pattern Detection:**
```bash
# Add multiple expenses on weekends
# Coach agent will detect weekend overspending pattern
```

**Verify:**
- Check `/dashboard/agents` for notifications
- Notification should include:
  - Budget usage percentage
  - Remaining amount
  - Days left in month
  - AI-generated tip

---

### 💰 Smart Savings Agent

**Purpose:** Auto-detect surplus and allocate to goals

**Test Scenarios:**

1. **Create Surplus:**
```bash
# Ensure your spending is below budget
# Add a goal first
POST /api/goals
{
  "name": "Emergency Fund",
  "targetAmount": 50000,
  "currentAmount": 0,
  "priority": "high"
}

# Run savings agent
POST /api/agents/run
{ "agent": "SmartSavings" }
```

**Expected Results:**
- Calculates budget surplus
- Suggests allocation to goals
- Sends notification with breakdown

2. **Test Round-Up Savings:**
```bash
# Add expenses with odd amounts (₹183, ₹456, etc.)
# Agent will calculate potential round-up savings
```

**Verify:**
```bash
GET /api/agents/notifications
# Should show savings opportunity notification
```

---

### 📊 Financial Health Monitor Agent

**Purpose:** Overall financial health tracking

**Test Scenarios:**

1. **High Debt Test:**
```bash
# Add debt
POST /api/debt
{
  "type": "taken",
  "name": "Personal Loan",
  "amount": 50000,
  "interestRate": 12,
  "duration": 24
}

# Run health monitor
POST /api/agents/run
{ "agent": "FinancialHealthMonitor" }
```

**Expected Results:**
- Calculates debt-to-income ratio
- Sends warning if ratio > 40%
- Overall health score decreases

2. **Low Emergency Fund Test:**
```bash
# Ensure no emergency fund goal exists
# Run agent
POST /api/agents/run
{ "agent": "FinancialHealthMonitor" }
```

**Expected Results:**
- Alert about insufficient emergency fund
- Recommendation to build 6 months coverage

**Verify Health Score:**
```bash
GET /api/profile
# Check financialHealthScore field
```

---

## Testing Multi-Agent Collaboration

### Scenario: Income Drop

**Setup:**
1. User has regular income of ₹20,000/month
2. This month, income drops to ₹12,000

**Test Steps:**

```bash
# 1. Add income drop
POST /api/gig/earnings
{
  "platform": "uber",
  "amount": 3000,
  "date": "2024-10-19"
}
# (Repeat for low amounts to total ₹12,000 for the month)

# 2. Run all agents
POST /api/agents/run

# 3. Check coordinated response
GET /api/agents/notifications
```

**Expected Multi-Agent Response:**
1. **IncomeAnalyzer**: Detects 40% income drop → Triggers "income_drop" event
2. **FinancialCoach**: Receives trigger → Recommends budget cuts
3. **SmartSavings**: Receives trigger → Pauses auto-savings
4. **HealthMonitor**: Updates health score

**Verify:**
- User receives ONE consolidated notification (not 4 separate ones)
- Budget is automatically adjusted
- Health score reflects the change

---

## Testing Gig Worker Features

### 1. Earnings Tracking

```bash
# Add multiple platforms
POST /api/gig/earnings
{
  "platform": "swiggy",
  "amount": 500,
  "tripCount": 5,
  "expenses": { "fuel": 100 }
}

POST /api/gig/earnings
{
  "platform": "uber",
  "amount": 800,
  "tripCount": 3,
  "expenses": { "fuel": 150 }
}

# Get insights
GET /api/gig/insights
```

**Expected Results:**
- Best earning days analysis
- Best earning hours
- Platform comparison
- Weekly target tracking
- Expense ratio warnings

### 2. Dynamic Budget Adjustment

```bash
# Check current budget
GET /api/profile

# Add low income
POST /api/gig/earnings
{ "platform": "swiggy", "amount": 1000 }

# Trigger auto-adjustment
# (Happens automatically via IncomeAnalyzer)

# Verify adjusted budget
GET /api/profile
# Check generatedBudget.adjusted
```

---

## Testing Scheduled Execution (Cron)

### Local Testing

```bash
# Set CRON_SECRET in .env
CRON_SECRET=test-secret-123

# Call cron endpoint
curl -X GET http://localhost:3000/api/cron/run-agents \
  -H "Authorization: Bearer test-secret-123"
```

### Vercel Testing

1. Deploy to Vercel
2. Set `CRON_SECRET` in Vercel environment variables
3. Cron runs automatically every 6 hours
4. Check execution logs in Vercel dashboard

---

## Testing Notifications

### 1. View Notifications

```bash
GET /api/agents/notifications
```

### 2. Mark as Read

```bash
PATCH /api/agents/notifications
{
  "notificationId": "notification-id-here"
}

# Or mark all as read
PATCH /api/agents/notifications
{
  "markAllRead": true
}
```

### 3. Delete Notification

```bash
DELETE /api/agents/notifications?id=notification-id
```

---

## Verification Checklist

After running agents, verify:

- [ ] Notifications created in database
- [ ] Agent state saved in Redis
- [ ] Agent interactions logged
- [ ] User profile updated (if applicable)
- [ ] Multi-agent triggers created (if applicable)
- [ ] Email sent (for high-priority alerts)

### Database Verification

```javascript
// MongoDB queries
db.notifications.find({ userId: ObjectId("user-id") }).sort({ createdAt: -1 })
db.agent_interactions.find({ userId: ObjectId("user-id") }).sort({ timestamp: -1 })
db.agent_triggers.find({ userId: ObjectId("user-id"), processed: false })
db.financial_health_history.find({ userId: ObjectId("user-id") }).sort({ timestamp: -1 })
```

### Redis Verification

```bash
# Redis CLI
redis-cli

# Check agent states
KEYS agent:*
GET agent:IncomeAnalyzer:user-id:state
```

---

## Debugging Tips

### Enable Agent Logging

```javascript
// In lib/agents/BaseAgent.js
// Logs are already enabled via console.log
// Check server logs or Vercel logs
```

### Check Agent Status

```bash
GET /api/agents/status
```

Returns:
- All registered agents
- Run counts
- Success rates
- Last run times

### Manual Agent Initialization

```javascript
// In browser console
import { initializeAgents } from '@/lib/agents'
const manager = initializeAgents()
```

---

## Performance Testing

### Load Test

Test with multiple users:

```bash
# Run agents for 100 users
for i in {1..100}; do
  curl -X POST /api/cron/run-agents \
    -H "Authorization: Bearer $CRON_SECRET" &
done
```

### Response Time

Expected response times:
- Single agent run: < 2 seconds
- All agents run: < 5 seconds
- Cron job (all users): < 300 seconds

---

## Common Issues

### 1. Agents Not Running

**Check:**
- Redis connection (fallback to in-memory if Redis fails)
- MongoDB connection
- User has completed onboarding
- Agent is enabled

### 2. No Notifications

**Check:**
- Agent decision logic (may not trigger if no issues found)
- Notification thresholds
- User preferences

### 3. Cron Job Fails

**Check:**
- CRON_SECRET matches
- Vercel deployment successful
- Environment variables set

---

## Success Metrics

After testing, you should see:

1. **IncomeAnalyzer:**
   - Income classification in user profile
   - Income predictions saved
   - Volatility score calculated

2. **FinancialCoach:**
   - Budget health score updated
   - Overspending alerts sent
   - Spending patterns identified

3. **SmartSavings:**
   - Surplus detected and allocated
   - Goal progress updated
   - Milestone celebrations triggered

4. **FinancialHealthMonitor:**
   - Overall health score calculated
   - Health history tracked
   - Warnings sent for critical issues

---

## Next Steps

1. Test all scenarios above
2. Review agent dashboard at `/dashboard/agents`
3. Check gig worker dashboard at `/dashboard/gig-worker`
4. Verify email notifications (if configured)
5. Test on mobile devices
6. Conduct user acceptance testing

Happy Testing! 🚀
