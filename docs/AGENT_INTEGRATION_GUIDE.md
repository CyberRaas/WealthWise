# 🚀 Quick Start Guide: Integrating Autonomous Agents

## Step-by-Step Integration (30 Minutes)

### 1. Initialize Event Bus (5 minutes)

**File: `lib/events/index.js`** (Create this)

```javascript
export { eventBus, EVENTS } from "./EventBus.js";
```

### 2. Initialize Agents (5 minutes)

**File: `lib/agents/index.js`** (Create this)

```javascript
import { incomeAgent } from "./IncomeAgent.js";
import { spendingPatternAgent } from "./SpendingPatternAgent.js";

// Initialize all agents
export function initializeAgents() {
  console.log("🤖 Initializing Autonomous Agents...");

  // Agents auto-register with event bus in their constructors
  const agents = {
    income: incomeAgent,
    spending: spendingPatternAgent,
  };

  console.log("✅ Agents initialized:", Object.keys(agents));

  return agents;
}

export { incomeAgent, spendingPatternAgent };
```

### 3. Integrate with Existing Voice Processor (10 minutes)

**File: `lib/voiceProcessor.js`** (Modify existing)

Add at the top:

```javascript
import { eventBus, EVENTS } from "./events/EventBus.js";
```

Modify the `processVoiceInput` function:

```javascript
async processVoiceInput(voiceText) {
  try {
    console.log('Processing voice input:', voiceText)

    // First try rule-based extraction for common patterns
    const ruleBasedResult = this.extractWithRules(voiceText)
    if (ruleBasedResult.confidence > 0.8) {
      // 🆕 EMIT EVENT FOR AGENTS
      eventBus.emit(EVENTS.VOICE_EXPENSE_DETECTED, {
        voiceText,
        extracted: ruleBasedResult,
        userId: 'current-user-id', // Get from session
        timestamp: new Date()
      })

      return ruleBasedResult
    }

    // Fallback to AI processing for complex cases
    const aiResult = await this.extractWithAI(voiceText)

    // 🆕 EMIT EVENT FOR AGENTS
    if (aiResult.success) {
      eventBus.emit(EVENTS.VOICE_EXPENSE_DETECTED, {
        voiceText,
        extracted: aiResult,
        userId: 'current-user-id', // Get from session
        timestamp: new Date()
      })
    }

    return aiResult

  } catch (error) {
    console.error('Voice processing error:', error)
    return {
      success: false,
      error: 'Failed to process voice input',
      confidence: 0
    }
  }
}
```

### 4. Integrate with Expense API (10 minutes)

**File: `app/api/expenses/route.js`** (Modify existing)

Add at the top:

```javascript
import { eventBus, EVENTS } from "@/lib/events/EventBus";
```

In your POST handler (add after expense is saved):

```javascript
export async function POST(request) {
  try {
    // ... existing expense creation code ...

    const expense = await Expense.create({
      userId,
      amount,
      category,
      description,
      date,
    });

    // 🆕 EMIT EVENT FOR AGENTS
    eventBus.emit(EVENTS.EXPENSE_ADDED, {
      userId,
      amount,
      category,
      description,
      date,
      expenseId: expense._id,
    });

    return NextResponse.json({
      success: true,
      expense,
    });
  } catch (error) {
    // ... error handling ...
  }
}
```

### 5. Initialize on App Start

**File: `app/layout.js`** (Modify existing)

Add at the top:

```javascript
import { initializeAgents } from "@/lib/agents";
```

In the component (before return):

```javascript
export default function RootLayout({ children }) {
  // Initialize agents on app start
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      initializeAgents()
    }
  }, [])

  return (
    // ... existing layout code ...
  )
}
```

---

## Testing the Integration (Quick Tests)

### Test 1: Voice Expense Detection

```javascript
// In browser console
import { voiceProcessor } from "@/lib/voiceProcessor";
import { eventBus, EVENTS } from "@/lib/events/EventBus";

// Listen for agent events
eventBus.on(EVENTS.AGENT_ALERT, (data) => {
  console.log("🚨 Agent Alert:", data);
});

// Process a voice expense
await voiceProcessor.processVoiceInput("₹800 ka Swiggy order kiya");

// You should see agent analysis in console!
```

### Test 2: Income Variability

```javascript
import { incomeAgent } from "@/lib/agents/IncomeAgent";

// Analyze income variability
const analysis = await incomeAgent.analyzeIncomeVariability("user-123");
console.log("Income Analysis:", analysis);
```

### Test 3: Spending Patterns

```javascript
import { spendingPatternAgent } from "@/lib/agents/SpendingPatternAgent";

// Get pattern summary
const summary = spendingPatternAgent.getPatternSummary("user-123");
console.log("Spending Patterns:", summary);
```

---

## Creating the Agent Dashboard (Optional - 30 minutes)

**File: `components/agents/AgentDashboard.js`** (Create new)

```javascript
"use client";
import { useState, useEffect } from "react";
import { eventBus, EVENTS } from "@/lib/events/EventBus";

export function AgentDashboard() {
  const [activities, setActivities] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    // Listen for agent activities
    const agentActionListener = eventBus.on(EVENTS.AGENT_ACTION, (data) => {
      setActivities((prev) =>
        [
          {
            id: Date.now(),
            agent: data.agent,
            action: data.action,
            timestamp: new Date(),
          },
          ...prev,
        ].slice(0, 10)
      );
    });

    // Listen for agent alerts
    const agentAlertListener = eventBus.on(EVENTS.AGENT_ALERT, (data) => {
      setAlerts((prev) =>
        [
          {
            id: Date.now(),
            ...data,
            timestamp: new Date(),
          },
          ...prev,
        ].slice(0, 5)
      );
    });

    return () => {
      eventBus.off(EVENTS.AGENT_ACTION, agentActionListener);
      eventBus.off(EVENTS.AGENT_ALERT, agentAlertListener);
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <h3 className="font-bold text-yellow-800 mb-2">🤖 Agent Alerts</h3>
          {alerts.map((alert) => (
            <div key={alert.id} className="mb-2 p-2 bg-white rounded">
              <p className="text-sm font-medium">
                {alert.intervention?.message}
              </p>
              {alert.intervention?.suggestion && (
                <p className="text-xs text-gray-600 mt-1">
                  💡 {alert.intervention.suggestion}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Activity Feed */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-bold mb-3">🤖 Autonomous Agent Activity</h3>
        <div className="space-y-2">
          {activities.length === 0 ? (
            <p className="text-gray-500 text-sm">No agent activity yet</p>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between text-sm border-b pb-2"
              >
                <div>
                  <span className="font-medium">{activity.agent}</span>
                  <span className="text-gray-600 ml-2">
                    {activity.action.type}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(activity.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
```

Add to your dashboard:

```javascript
import { AgentDashboard } from "@/components/agents/AgentDashboard";

// In your dashboard component
<AgentDashboard />;
```

---

## Demo Script for Hackathon

### Setup (Show judges)

```
1. Open app on mobile/laptop
2. Show dashboard with agent activity panel
3. Explain: "Our multi-agent system runs autonomously in the background"
```

### Demo Flow

**Scene 1: Voice Expense + Pattern Detection**

```
🎤 Say: "₹800 ka Swiggy order kiya"

Expected:
✅ Voice processed
✅ Expense detected
✅ Agent analyzes pattern
✅ Alert shows: "You've ordered food 3 times this week!"
✅ Suggestion: "Cook at home to save ₹2,000/month"
```

**Scene 2: Income Variability**

```
Navigate to Income section
Add variable income entries:
- Week 1: ₹12,000
- Week 2: ₹8,000
- Week 3: ₹5,000

Expected:
✅ Income Agent detects variability
✅ Flex Budget activated automatically
✅ Dashboard shows adaptive budget
✅ Alert: "Income is variable - Flex Budget activated"
```

**Scene 3: Proactive Coaching**

```
Try to add another food expense:
🎤 "₹500 ka dinner order"

Expected:
✅ Pattern Agent intervenes BEFORE confirmation
✅ Alert: "⚠️ You've already spent ₹1,300 on food today"
✅ Shows alternatives: Cook (Save ₹350), Local dhaba (Save ₹200)
✅ User can proceed or cancel
```

**Scene 4: Show Agent Dashboard**

```
Point to agent activity feed:
✅ Real-time activity log
✅ Shows all agent actions
✅ Autonomous decision-making visible
```

---

## Key Points for Presentation

### What to Emphasize

1. **True Autonomy**

   - "Agents run in the background 24/7"
   - "No manual intervention needed"
   - "Learns from every transaction"

2. **Proactive, Not Reactive**

   - "Alerts BEFORE overspending, not after"
   - "Predicts low-income periods"
   - "Suggests alternatives in real-time"

3. **Multi-Agent Collaboration**

   - "Income Agent + Spending Agent work together"
   - "Event-driven architecture"
   - "Coordinated decision-making"

4. **Built for Gig Workers**
   - "Adapts to variable income"
   - "Understands irregular patterns"
   - "Voice-first for low literacy"

---

## Troubleshooting

### Issue: Events not firing

**Solution**: Check if agents are initialized

```javascript
import { initializeAgents } from "@/lib/agents";
initializeAgents();
```

### Issue: No alerts showing

**Solution**: Check event listeners in AgentDashboard

```javascript
// Verify in console
eventBus.getRegisteredEvents();
```

### Issue: Voice not triggering agents

**Solution**: Verify event emission

```javascript
// Add debug log in voiceProcessor.js
eventBus.emit(EVENTS.VOICE_EXPENSE_DETECTED, data);
console.log("Event emitted:", data);
```

---

## Next Steps After Integration

1. ✅ Test all agent features
2. ✅ Record demo videos (backup)
3. ✅ Prepare presentation slides
4. ✅ Practice pitch (3-5 minutes)
5. ✅ Deploy to production (Vercel)

---

## Deployment Checklist

- [ ] All agent files added to `lib/agents/`
- [ ] Event bus integrated in `lib/events/`
- [ ] Voice processor emits events
- [ ] Expense API emits events
- [ ] Agents initialized in layout
- [ ] Agent dashboard added to UI
- [ ] Tested on localhost
- [ ] Deployed to Vercel
- [ ] Demo scenarios work
- [ ] Mobile responsive

---

**Time to Complete**: 1-2 hours
**Difficulty**: Medium
**Impact**: HIGH (Makes you stand out!) 🚀

Good luck with the integration! 💪
