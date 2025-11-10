# 🧪 Testing Guide: Enhanced AI Budget Generation

**Purpose:** Test the improved budget generation system with diverse user profiles  
**Date:** October 16, 2025

---

## 🎯 Test Scenarios

### Test 1: Young Tech Professional (Aggressive Savings)

```json
{
  "monthlyIncome": 80000,
  "city": "Bangalore",
  "familySize": 1,
  "age": 26,
  "occupation": "Software Engineer"
}
```

**Expected:**

- Savings: 25-30% (aggressive)
- Housing: 25-30% (single person)
- Tips about equity SIP and long-term investing
- Recommendation: High equity allocation

---

### Test 2: Mid-Career Family (Balanced)

```json
{
  "monthlyIncome": 60000,
  "city": "Pune",
  "familySize": 4,
  "age": 38,
  "occupation": "Engineer"
}
```

**Expected:**

- Savings: 15-20%
- Housing: 30-35% (4 members)
- Food: 25-30% (family of 4)
- Insurance recommendations prominent
- Healthcare emphasis

---

### Test 3: High Cost City (Mumbai Premium)

```json
{
  "monthlyIncome": 100000,
  "city": "Mumbai",
  "familySize": 3,
  "age": 35,
  "occupation": "Business"
}
```

**Expected:**

- Housing: 35-40% (Mumbai premium)
- Transport: 10-12% (Mumbai traffic)
- Tips about rent vs EMI
- Recommendations for real estate

---

### Test 4: Lower Income (Tight Budget)

```json
{
  "monthlyIncome": 30000,
  "city": "Kolkata",
  "familySize": 2,
  "age": 28,
  "occupation": "Teacher"
}
```

**Expected:**

- Savings: 10-15% (realistic)
- Housing: 25-30% (affordable city)
- Tips about small SIPs (₹500-1000)
- PPF recommendations

---

### Test 5: Senior Professional (Conservative)

```json
{
  "monthlyIncome": 75000,
  "city": "Chennai",
  "familySize": 2,
  "age": 55,
  "occupation": "Doctor"
}
```

**Expected:**

- Savings: 20-25%
- Healthcare: 8-10% (age-appropriate)
- Tips about retirement planning
- Debt fund recommendations
- Senior citizen schemes

---

### Test 6: Freelancer (Variable Income)

```json
{
  "monthlyIncome": 50000,
  "city": "Delhi",
  "familySize": 1,
  "age": 30,
  "occupation": "Freelancer"
}
```

**Expected:**

- Savings: 25-30% (buffer for variability)
- Tips about 12-month emergency fund
- Recommendations for irregular income planning

---

### Test 7: Large Family (High Expenses)

```json
{
  "monthlyIncome": 70000,
  "city": "Hyderabad",
  "familySize": 6,
  "age": 42,
  "occupation": "Business"
}
```

**Expected:**

- Food: 30-35% (6 members)
- Savings: 10-15% (realistic for large family)
- Healthcare: 8-10%
- Insurance recommendations critical

---

## ✅ Validation Checklist

For each test, verify:

### Budget Structure:

- [ ] Total allocation = 100% (±1%)
- [ ] All categories have positive amounts
- [ ] Percentages match calculated amounts
- [ ] No category exceeds realistic maximum

### Realistic Ranges:

- [ ] Savings: 10-40%
- [ ] Housing: 20-45%
- [ ] Food: 15-35%
- [ ] Transport: 5-20%
- [ ] Healthcare: 3-15%
- [ ] Entertainment: 2-15%

### AI Output Quality:

- [ ] Explanations exist and make sense
- [ ] Tips are actionable (not generic)
- [ ] Recommendations have specific amounts
- [ ] City-specific advice is present
- [ ] Age-appropriate strategies mentioned

### Personalization:

- [ ] City costs reflected correctly
- [ ] Family size impacts food/housing
- [ ] Age impacts savings strategy
- [ ] Occupation insights present

### Fallback Safety:

- [ ] Budget generated even if AI fails
- [ ] Fallback tips are relevant
- [ ] Recommendations are still actionable

---

## 🧪 How to Test

### Method 1: Via Dashboard (Recommended)

1. Create test user account
2. Go through onboarding with test profile
3. Generate budget
4. Review output in dashboard
5. Check logs for AI success/fallback

### Method 2: Direct API Call

```bash
# PowerShell
$headers = @{
    "Content-Type" = "application/json"
    "Cookie" = "your-session-cookie"
}

$body = @{
    monthlyIncome = 80000
    city = "Bangalore"
    familySize = 1
    age = 26
    occupation = "Software Engineer"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/budget/generate" -Method POST -Headers $headers -Body $body
```

### Method 3: Test Script (Recommended for bulk testing)

```javascript
// Create test-budget.js
const profiles = [
  {
    income: 80000,
    city: "Bangalore",
    family: 1,
    age: 26,
    occupation: "Software Engineer",
  },
  { income: 60000, city: "Pune", family: 4, age: 38, occupation: "Engineer" },
  // ... add more profiles
];

for (const profile of profiles) {
  const result = await fetch("/api/budget/generate", {
    method: "POST",
    body: JSON.stringify(profile),
  });
  console.log(`Profile ${profile.age}/${profile.city}:`, result);
}
```

---

## 📊 Success Criteria

### Minimum Requirements:

✅ All 7 test budgets generate successfully  
✅ Total = 100% for all budgets  
✅ Savings ≥ 10% for all profiles  
✅ Housing ≤ 45% for all profiles  
✅ AI success rate > 70% (5/7 tests)

### Optimal Performance:

🎯 AI success rate > 80%  
🎯 Confidence scores > 0.7  
🎯 All tips are specific and actionable  
🎯 Recommendations include rupee amounts  
🎯 City-specific advice in all outputs

---

## 🐛 Common Issues & Solutions

### Issue 1: AI Returns Generic Budget

**Solution:** Check if city-specific data is being passed to prompt

### Issue 2: Total ≠ 100%

**Solution:** Budget balancing function should auto-correct

### Issue 3: Savings Too Low

**Solution:** Income adjustments should boost savings for higher incomes

### Issue 4: All Tests Use Fallback

**Solution:**

- Check GEMINI_API_KEY is set
- Verify API quota not exceeded
- Check internet connectivity

---

## 📈 Metrics to Track

Create a test results table:

| Profile | AI Success | Confidence | Savings % | Housing % | Total % | User-Friendly |
| ------- | ---------- | ---------- | --------- | --------- | ------- | ------------- |
| Test 1  | ✅ Yes     | 0.85       | 28%       | 28%       | 100%    | ⭐⭐⭐⭐⭐    |
| Test 2  | ✅ Yes     | 0.82       | 18%       | 32%       | 100%    | ⭐⭐⭐⭐⭐    |
| Test 3  | ❌ No      | 0.75       | 20%       | 38%       | 100%    | ⭐⭐⭐⭐      |
| ...     | ...        | ...        | ...       | ...       | ...     | ...           |

**Target:** 80%+ AI success, 0.75+ confidence, all budgets = 100%

---

## 🎓 User Feedback Questions

After testing, ask:

1. Does the budget feel realistic for your situation?
2. Are the tips actionable and helpful?
3. Do recommendations have specific amounts?
4. Is the city cost consideration accurate?
5. Would you follow this budget?

**Target:** 80%+ positive responses

---

## 🔄 Iterative Improvement

Based on test results:

1. Identify which profiles AI struggles with
2. Enhance prompts for those scenarios
3. Adjust validation rules if needed
4. Improve fallback quality
5. Re-test and measure improvement

---

## 📝 Test Log Template

```
Date: October 16, 2025
Tester: [Your Name]
Environment: Development

Test 1: Young Tech Professional
- AI Success: ✅ Yes
- Confidence: 0.87
- Savings: 28% ✅
- Housing: 28% ✅
- Total: 100% ✅
- Tips Quality: Excellent - specific SIP amounts
- Recommendations: All had rupee amounts
- Notes: Mumbai rent data accurate

Test 2: Mid-Career Family
- [Fill in results]

Overall Results:
- AI Success Rate: 6/7 (85%)
- Average Confidence: 0.81
- All Budgets Valid: ✅
- User Feedback: Positive

Issues Found:
- None

Recommendations:
- Ready for production
```

---

## 🚀 Ready for Production?

Check all boxes:

- [ ] All 7 tests pass
- [ ] AI success > 70%
- [ ] No budget validation errors
- [ ] Tips are actionable
- [ ] Recommendations are specific
- [ ] Fallback works perfectly
- [ ] User feedback positive
- [ ] Documentation updated

**If all checked:** Deploy with confidence! 🎉

---

**Testing Completed:** [Date]  
**Status:** ⬜ In Progress | ⬜ Completed | ⬜ Issues Found  
**Sign-off:** [Your Name]
