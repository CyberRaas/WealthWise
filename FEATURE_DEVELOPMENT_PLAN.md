# 🚀 WealthWise Feature Development Plan

## Expense Splitting + Investment Recommendations

---

## 📋 Overview

This document outlines the development plan for two major features requested by Anveshna 2025 judges:

1. **Expense Splitting** - Splitwise-like group expense management
2. **Investment Recommendations** - Smart, personalized investment suggestions

---

## 🎯 Development Phases

### Phase 1: MVP Foundation (Week 1-2)

- [x] Create data models (SplitGroup, SplitExpense, Settlement, RiskProfile, InvestmentRecommendation)
- [x] Implement core APIs for expense splitting
- [x] Implement core APIs for investment recommendations
- [x] Build basic UI components

### Phase 2: Core Features (Week 3-4)

- [x] Unequal and percentage splits
- [x] Debt simplification algorithm
- [x] Full investment scheme database
- [x] AI-powered insights integration

### Phase 3: Polish & Advanced (Week 5-6)

- [ ] Non-registered member handling
- [ ] Email notifications
- [ ] Goal-based recommendations
- [ ] Investment tracking

### Phase 4: Production Hardening (Week 7)

- [ ] Testing & security audit
- [ ] Performance optimization
- [ ] Documentation

---

## 📁 File Structure

```
NEW FILES CREATED:
├── models/
│   ├── SplitGroup.js              ✅ Created
│   ├── SplitExpense.js            ✅ Created
│   ├── Settlement.js              ✅ Created
│   ├── RiskProfile.js             ✅ Created
│   └── InvestmentRecommendation.js ✅ Created
│
├── lib/
│   ├── debtSimplifier.js          ✅ Created
│   ├── investmentSchemes.js       ✅ Created
│   ├── investmentRecommendationEngine.js ✅ Created
│   └── investmentCompliance.js    ✅ Created
│
├── app/api/
│   ├── split/
│   │   ├── groups/route.js        ✅ Created
│   │   ├── groups/[id]/route.js   ✅ Created
│   │   ├── groups/[id]/members/route.js ✅ Created
│   │   ├── expenses/route.js      ✅ Created
│   │   ├── expenses/[id]/route.js ✅ Created
│   │   └── settlements/route.js   ✅ Created
│   │
│   └── investment/
│       ├── risk-profile/route.js  ✅ Created
│       ├── recommendations/route.js ✅ Created
│       └── schemes/route.js       ✅ Created
│
├── app/dashboard/
│   ├── split/page.js              ✅ Created
│   └── investments/page.js        ✅ Created
│
└── components/
    ├── split/
    │   ├── GroupList.jsx          ✅ Created
    │   ├── GroupDetail.jsx        ✅ Created
    │   ├── CreateGroupModal.jsx   ✅ Created
    │   ├── AddExpenseModal.jsx    ✅ Created
    │   ├── SettleUpModal.jsx      ✅ Created
    │   └── index.js               ✅ Created
    │
    └── investment/
        ├── RiskAssessment.jsx     ✅ Created
        ├── RecommendationDisplay.jsx ✅ Created
        └── SchemeExplorer.jsx     ✅ Created
```

---

## 🔧 Feature 1: Expense Splitting

### User Flow

```
Create Group → Add Members → Add Expenses → View Balances → Settle Up
```

### Core Functionality

- Create named groups with emoji icons
- Add members (registered or by name/email)
- Add expenses with payer and split configuration
- Equal, exact, and percentage splits
- Calculate who owes whom
- Simplify debts to minimum transactions
- Record settlements

### Data Models

#### SplitGroup

- name, emoji, type
- members[] with role (admin/member)
- balances (calculated)
- totalExpenses, expenseCount

#### SplitExpense

- groupId, description, amount, category
- paidBy (memberId, name)
- splitType (equal/exact/percentage)
- splitAmong[] with individual amounts

#### Settlement

- from, to (member info)
- amount, method (cash/upi/bank)
- status (pending/completed)

---

## 💰 Feature 2: Investment Recommendations

### User Flow

```
Detect Savings → Risk Assessment (3 questions) → Generate Recommendations → Show Projections
```

### Core Functionality

- Detect available savings from budget
- 3-question risk assessment quiz
- Generate risk profile (conservative/moderate/aggressive)
- Recommend schemes based on profile
- Show wealth growth projections
- Provide AI-powered insights
- Display required disclaimers

### Investment Schemes Covered

| Category     | Schemes                                     |
| ------------ | ------------------------------------------- |
| Government   | PPF, NPS, SSY                               |
| Fixed Income | Bank FD, RD                                 |
| Mutual Funds | Index Funds, ELSS, Debt Funds, Liquid Funds |
| Gold         | SGB, Gold ETF                               |

### Compliance Requirements

- Clear "not investment advice" disclaimers
- "Market-linked, returns not guaranteed" warnings
- SEBI mutual fund disclaimer
- Simulation/projection disclaimers

---

## 🔐 Security Considerations

| Feature             | Security Measure              |
| ------------------- | ----------------------------- |
| Group Access        | Only members can view/edit    |
| Balance Calculation | Server-side only              |
| Investment Data     | Encrypted at rest             |
| API Access          | Rate limiting, authentication |

---

## 📊 Database Indexes

```javascript
// SplitGroup
{ createdBy: 1 }
{ 'members.userId': 1 }

// SplitExpense
{ groupId: 1, date: -1 }
{ 'paidBy.memberId': 1 }

// RiskProfile
{ userId: 1 } // unique

// InvestmentRecommendation
{ userId: 1, generatedAt: -1 }
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas connection
- Gemini API key (for AI features)

### Development Commands

```bash
# Start development server
npm run dev

# Run tests (when added)
npm test
```

---

## 📝 Implementation Log

### January 7, 2026

- Created development plan
- Implemented Phase 1 data models:
  - SplitGroup.js
  - SplitExpense.js
  - Settlement.js
  - RiskProfile.js
  - InvestmentRecommendation.js

---

## 👥 Contributing

Follow the phase-wise development approach:

1. Complete current phase before moving to next
2. Test each module independently
3. Document changes in this file

---

_WealthWise - Making Financial Planning Accessible to Every Indian_
