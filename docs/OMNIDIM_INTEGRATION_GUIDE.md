# Omnidim.io Voice Coach Integration

## 🎯 What is Omnidim?

Omnidim is a production-ready voice AI platform that provides:

- Voice recognition & text-to-speech
- Natural language processing
- Conversation management
- Multi-language support
- Easy web integration

## 📦 Integration Status

✅ **Completed:**

- Widget component created (`components/coach/OmnidimWidget.js`)
- Service layer implemented (`lib/omnidim/omnidimService.js`)
- API routes for context & webhooks
- Global widget integration in layout
- User context building
- Custom styling to match app theme

## 🔧 Setup Instructions

### Step 1: Environment Variables

Add these to your `.env.local` file:

```bash
# Omnidim Configuration
OMNIDIM_SECRET_KEY=633a7cbac66435840f28d0410506dc4b
OMNIDIM_API_KEY=your_api_key_here  # Get from Omnidim dashboard
```

### Step 2: Configure Omnidim Dashboard

1. **Go to Omnidim.io dashboard**
2. **Widget Configuration:**

   - Widget Type: ✅ Voice Widget (as shown in screenshot)
   - Style: ✅ Full Interface (with message history)
   - Title: "WealthWise Coach" or "Personalized Financial Coach Agent"
   - Position: Bottom Right
   - Width: 400px, Height: 600px

3. **AI Training (Important!):**
   Configure your AI with financial coaching capabilities:

   **System Prompt:**

   ```
   You are WealthWise Coach, a friendly and knowledgeable AI financial advisor
   for Indian users. You help users:

   - Track and analyze their expenses
   - Create and stick to budgets
   - Set and achieve financial goals
   - Make smart spending decisions
   - Understand their financial health

   Context about the user:
   - You have access to their real-time financial data
   - Monthly income, spending, budget, and goals
   - Recent transactions and patterns

   Communication style:
   - Friendly but professional
   - Use simple language (avoid jargon)
   - Support Hindi and English naturally
   - Be encouraging and motivational (not judgmental)
   - Provide actionable advice
   - Use Indian currency (₹) and context

   Available actions:
   - Check budget status
   - Add expenses via voice
   - Get spending summaries
   - Check goal progress
   - Provide personalized tips

   Always be helpful, accurate, and supportive!
   ```

4. **Custom Actions (Advanced):**
   Add these custom actions in Omnidim:

   - `check_budget` - Get current budget status
   - `add_expense` - Add expense via voice (params: amount, category, description)
   - `get_spending_summary` - Get spending summary (params: period)
   - `check_goal_progress` - Check savings goals

5. **Webhook URL:**
   Set webhook to: `https://yourdomain.com/api/omnidim/webhook`

### Step 3: Test the Integration

1. Start your dev server:

   ```bash
   npm run dev
   ```

2. Login to your app

3. Look for the floating coach button (bottom-right corner)

4. Click and try these voice commands:
   - "How much did I spend this month?"
   - "Am I over budget?"
   - "How are my savings goals?"
   - "मेरा बजट कैसा चल रहा है?" (Hindi)

## 🎨 Customization

### Change Widget Appearance

Edit `components/coach/OmnidimWidget.js`:

```javascript
<style jsx global>{`
  /* Change primary color */
  .omnidim-widget-button {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
  }

  /* Change message bubble colors */
  .omnidim-user-message {
    background-color: #10b981 !important;
  }
`}</style>
```

### Update Welcome Message

In `OmnidimWidget.js`, edit the `handleWidgetLoad` function:

```javascript
window.Omnidim.setWelcomeMessage(
  `👋 Hi ${session.user.name}! I'm your WealthWise Coach. Ask me anything!`
);
```

### Add More Context

Edit `lib/omnidim/omnidimService.js` → `buildFinancialContext()` function to include more user data.

## 📊 Available User Context

The AI coach has access to:

✅ User's monthly income
✅ Total spending (current month)
✅ Spending by category
✅ Budget status & utilization
✅ Active savings goals & progress
✅ Recent transactions (last 5)
✅ Savings rate
✅ Top spending categories

## 🔗 Integration Points

### Automatic Context Updates

Context is automatically updated:

- When user logs in
- When widget loads
- After adding expenses
- After updating goals
- After budget changes

### Manual Context Update

To manually update context when data changes:

```javascript
// In your expense/budget/goal update handler
await fetch("/api/omnidim/context", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ context: newContext }),
});
```

## 🎤 Voice Commands Examples

Train your Omnidim AI to understand:

**Budget Queries:**

- "How's my budget looking?"
- "Am I over budget?"
- "How much budget do I have left?"
- "बजट कितना बचा है?" (Hindi)

**Spending Analysis:**

- "How much did I spend on food?"
- "What's my biggest expense?"
- "Show me my spending"
- "मैंने कितना खर्च किया?" (Hindi)

**Goal Tracking:**

- "How close am I to my vacation goal?"
- "Will I reach my savings goal?"
- "What are my goals?"

**Add Expense:**

- "I spent 500 rupees on food"
- "Add expense: 2000 for shopping"
- "मैंने 300 रुपये खर्च किये" (Hindi)

**Advice:**

- "How can I save more?"
- "Should I buy this?"
- "Give me money saving tips"

## 🚀 Advanced Features

### Custom Actions

When user says "Add expense of 500 for food", Omnidim can:

1. Trigger `add_expense` action
2. Your webhook receives it
3. `omnidimService.handleCustomAction()` processes it
4. Expense is added to database
5. AI confirms: "Added food expense of ₹500"

### Proactive Notifications

You can trigger coach messages programmatically:

```javascript
// When user overspends
if (spentPercentage > 90) {
  window.Omnidim?.sendMessage({
    type: "notification",
    message: "⚠️ You've used 90% of your budget this month!",
  });
}
```

### Analytics Tracking

Track user interactions:

```javascript
await omnidimService.trackEvent(userId, "budget_query", {
  query: "How much did I spend?",
  response_time: 1.2,
  satisfaction: "positive",
});
```

## 🔐 Security Best Practices

1. **Never expose API keys in frontend**

   - Keep `OMNIDIM_API_KEY` in `.env.local`
   - Only use `secret_key` in widget script

2. **Validate webhook signatures**

   - Verify all incoming webhooks
   - Check timestamp to prevent replay attacks

3. **Sanitize user input**

   - Validate all expense data before saving
   - Prevent SQL injection in queries

4. **Rate limiting**
   - Limit API calls per user
   - Prevent abuse of webhook endpoints

## 📈 Monitoring & Analytics

### Track These Metrics:

1. **Engagement:**

   - Daily active users of coach
   - Messages per session
   - Average session duration

2. **Performance:**

   - Response time
   - Context load time
   - Error rates

3. **User Satisfaction:**
   - Positive/negative feedback
   - Feature usage (voice vs text)
   - Query types (most common)

### Add Analytics:

```javascript
// In OmnidimWidget.js
window.Omnidim.on("message", (message) => {
  // Track with your analytics tool
  gtag("event", "coach_query", {
    query_type: message.intent,
    user_id: session.user.id,
  });
});
```

## 🐛 Troubleshooting

### Widget Not Appearing

1. Check if script loaded:

   ```javascript
   console.log(window.Omnidim); // Should not be undefined
   ```

2. Verify secret key is correct

3. Check browser console for errors

4. Ensure user is authenticated

### Context Not Loading

1. Check API routes are working:

   ```bash
   curl http://localhost:3000/api/omnidim/context
   ```

2. Verify user has financial data

3. Check browser network tab for failed requests

### Voice Not Working

1. Check microphone permissions
2. Test on HTTPS (required for voice)
3. Try different browser
4. Check Omnidim dashboard settings

## 🔄 Next Steps

1. **Configure Omnidim AI:**

   - Add system prompt
   - Train with financial vocabulary
   - Test conversations

2. **Enable Custom Actions:**

   - Configure webhook endpoint
   - Test expense addition
   - Test budget queries

3. **Customize Appearance:**

   - Match your brand colors
   - Adjust position/size
   - Add custom greetings

4. **Test Extensively:**

   - Try various queries
   - Test in Hindi & English
   - Check mobile responsiveness

5. **Monitor & Optimize:**
   - Track usage metrics
   - Gather user feedback
   - Improve AI responses

## 📞 Support

- **Omnidim Documentation:** https://omnidim.io/docs
- **API Reference:** https://omnidim.io/api
- **Community:** https://community.omnidim.io

## ✨ Features to Add Later

- [ ] Proactive spending alerts
- [ ] Daily financial summaries
- [ ] Investment advice integration
- [ ] Bill payment reminders
- [ ] Multi-user family accounts
- [ ] Export conversation history
- [ ] Scheduled check-ins

---

**Built with ❤️ for WealthWise users**
