// Static learning content with topics, explanations, and quizzes
// This replaces the AI-generated content with curated material

export const LEARNING_TOPICS = [
    {
        id: "50-30-20-rule",
        title: "The 50/30/20 Rule",
        category: "Budgeting",
        emoji: "🍰",
        shortDesc: "A simple budgeting method: 50% for needs, 30% for wants, and 20% for savings.",
        content: `
## What is the 50/30/20 Rule?

The 50/30/20 rule is a simple budgeting framework that divides your after-tax income into three categories:

### 50% - Needs
Essential expenses you can't avoid:
- Rent or mortgage
- Groceries
- Utilities (electricity, water, gas)
- Insurance
- Minimum debt payments
- Transportation to work

### 30% - Wants
Non-essential spending that improves quality of life:
- Dining out
- Entertainment (movies, subscriptions)
- Shopping for non-essentials
- Hobbies
- Vacations

### 20% - Savings & Debt
Building your financial future:
- Emergency fund
- Retirement savings
- Extra debt payments
- Investments

## Why It Works
This rule is effective because it's **simple to remember** and **flexible enough** to adapt to most income levels. It forces you to prioritize savings while still allowing for enjoyment.

## Pro Tip
If you're in debt, consider flipping to 50/20/30 - putting 30% toward debt repayment until you're debt-free.
    `,
        quiz: [
            {
                question: "What percentage should go to 'needs' according to the 50/30/20 rule?",
                options: ["30%", "50%", "20%", "40%"],
                correctIndex: 1
            },
            {
                question: "Which of these is a 'want', not a 'need'?",
                options: ["Rent", "Netflix subscription", "Electricity bill", "Groceries"],
                correctIndex: 1
            },
            {
                question: "What should you do with the 20% savings portion?",
                options: ["Spend on hobbies", "Build emergency fund & investments", "Pay for groceries", "Use for entertainment"],
                correctIndex: 1
            }
        ]
    },
    {
        id: "emergency-fund",
        title: "Emergency Fund",
        category: "Security",
        emoji: "☔️",
        shortDesc: "Money set aside to cover unexpected expenses like medical bills or job loss.",
        content: `
## What is an Emergency Fund?

An emergency fund is a **safety net** of money set aside specifically for unexpected expenses or financial emergencies.

### Why You Need One
Life is unpredictable. Without an emergency fund, a surprise expense can:
- Force you into debt
- Cause you to miss bill payments
- Create a cycle of financial stress

### How Much Should You Save?
| Life Stage | Recommended Amount |
|------------|-------------------|
| Starting out | ₹10,000 - ₹25,000 |
| Stable job | 3 months of expenses |
| Family/responsibilities | 6 months of expenses |

### What Counts as an Emergency?
✅ **Yes:**
- Job loss
- Medical emergency
- Car breakdown
- Home repairs (roof leak, broken appliance)

❌ **No:**
- Vacation "emergencies"
- Sales or discounts
- New phone release

### Where to Keep It
Keep your emergency fund in a **high-interest savings account** that's:
- Easily accessible
- Separate from your regular spending account
- Earning some interest

## The First Step
Start with a goal of ₹10,000. Even ₹500/month will get you there in under 2 years.
    `,
        quiz: [
            {
                question: "How many months of expenses should a stable worker typically save?",
                options: ["1 month", "3 months", "12 months", "6 weeks"],
                correctIndex: 1
            },
            {
                question: "Where should you keep your emergency fund?",
                options: ["Under your mattress", "In stocks", "High-interest savings account", "In your regular spending account"],
                correctIndex: 2
            }
        ]
    },
    {
        id: "compound-interest",
        title: "Compound Interest",
        category: "Investing",
        emoji: "🚀",
        shortDesc: "Interest on interest. It makes your money grow faster over time.",
        content: `
## The Magic of Compound Interest

Albert Einstein reportedly called compound interest the **"eighth wonder of the world."**

### Simple vs Compound Interest
- **Simple Interest**: You earn interest only on your original amount.
- **Compound Interest**: You earn interest on your original amount PLUS the interest you've already earned.

### A Real Example
If you invest ₹10,000 at 10% annual interest:

| Year | Simple Interest | Compound Interest |
|------|-----------------|-------------------|
| 1 | ₹11,000 | ₹11,000 |
| 5 | ₹15,000 | ₹16,105 |
| 10 | ₹20,000 | ₹25,937 |
| 20 | ₹30,000 | ₹67,275 |

After 20 years, compound interest gives you **more than double** what simple interest would!

### The Rule of 72
Want to know how long it takes to double your money? Divide 72 by your interest rate.
- At 8% return: 72 ÷ 8 = **9 years** to double
- At 12% return: 72 ÷ 12 = **6 years** to double

### Key Takeaway
**Start early.** Even small amounts grow significantly over time. A 25-year-old investing ₹5,000/month will have far more at 60 than a 35-year-old investing ₹10,000/month.
    `,
        quiz: [
            {
                question: "What makes compound interest different from simple interest?",
                options: ["It has a lower rate", "You earn interest on your interest", "It only works with stocks", "It requires a minimum balance"],
                correctIndex: 1
            },
            {
                question: "Using the Rule of 72, how long to double money at 12% return?",
                options: ["12 years", "8 years", "6 years", "3 years"],
                correctIndex: 2
            },
            {
                question: "Why is starting early important for compound interest?",
                options: ["Banks give better rates to young people", "More time = more compounding cycles", "Taxes are lower for young investors", "It doesn't matter when you start"],
                correctIndex: 1
            }
        ]
    },
    {
        id: "credit-score",
        title: "Credit Score",
        category: "Debt",
        emoji: "📊",
        shortDesc: "A 3-digit number that tells lenders how likely you are to pay back a loan.",
        content: `
## Understanding Your Credit Score

Your credit score is a number (typically 300-900 in India) that represents your **creditworthiness**.

### Why It Matters
A good credit score can:
- Get you **lower interest rates** on loans
- Make it easier to rent an apartment
- Sometimes affect job applications
- Get you **higher credit limits**

### Score Ranges (India - CIBIL)
| Score | Rating | Impact |
|-------|--------|--------|
| 750-900 | Excellent | Best rates, easy approvals |
| 700-749 | Good | Most loans approved |
| 650-699 | Fair | Higher interest rates |
| 550-649 | Poor | Difficult to get credit |
| 300-549 | Very Poor | Usually rejected |

### What Affects Your Score?
1. **Payment History (35%)** - Do you pay on time?
2. **Credit Utilization (30%)** - How much of your limit do you use?
3. **Credit History Length (15%)** - How old are your accounts?
4. **Credit Mix (10%)** - Do you have different types of credit?
5. **New Credit (10%)** - Have you applied for credit recently?

### Quick Tips to Improve
- Always pay at least the minimum on time
- Keep credit utilization below 30%
- Don't close old credit cards
- Check your report for errors annually
    `,
        quiz: [
            {
                question: "What is considered an 'excellent' credit score in India?",
                options: ["500-600", "600-700", "750-900", "900-1000"],
                correctIndex: 2
            },
            {
                question: "What factor affects your credit score the MOST?",
                options: ["Credit mix", "Payment history", "New credit applications", "Account age"],
                correctIndex: 1
            }
        ]
    },
    {
        id: "inflation",
        title: "Inflation",
        category: "Economics",
        emoji: "🎈",
        shortDesc: "The rate at which prices for goods and services rise, reducing purchasing power.",
        content: `
## What is Inflation?

Inflation is the **gradual increase in prices** over time, which means your money buys less than it used to.

### A Simple Example
If inflation is 6% per year:
- A ₹100 item today will cost ₹106 next year
- Your ₹100 note will only buy ₹94 worth of stuff

### Why Inflation Happens
- Too much money in the economy
- Rising production costs
- Increased demand for goods
- Global supply chain issues

### India's Inflation Rate
India typically experiences 4-7% inflation annually. This means:
- ₹1,00,000 today = ₹50,000 purchasing power in ~12 years
- Money in a savings account earning 3.5% is actually **losing value**

### How to Beat Inflation
Your investments need to earn MORE than inflation to grow your wealth:

| Option | Typical Return | Beats Inflation? |
|--------|---------------|------------------|
| Savings Account | 3-4% | ❌ No |
| Fixed Deposit | 5-7% | ⚠️ Barely |
| PPF | 7-8% | ✅ Yes |
| Equity/Stocks | 10-15% | ✅ Yes |

### Key Insight
**Keeping all your money in a savings account is actually losing money** when adjusted for inflation. You need investments that outpace inflation.
    `,
        quiz: [
            {
                question: "What does inflation do to your money's purchasing power?",
                options: ["Increases it", "Decreases it", "Has no effect", "Only affects rich people"],
                correctIndex: 1
            },
            {
                question: "If inflation is 6% and your savings earn 4%, what happens to your money?",
                options: ["It grows by 10%", "It stays the same", "It loses real value", "It doubles"],
                correctIndex: 2
            },
            {
                question: "Which investment typically beats inflation?",
                options: ["Savings account at 3%", "Cash under mattress", "Equity investments at 12%", "All of the above"],
                correctIndex: 2
            }
        ]
    },
    {
        id: "sip",
        title: "SIP (Systematic Investment Plan)",
        category: "Investing",
        emoji: "📅",
        shortDesc: "Investing a fixed amount regularly in a mutual fund scheme.",
        content: `
## What is a SIP?

A Systematic Investment Plan (SIP) allows you to invest a **fixed amount regularly** (monthly/weekly) into mutual funds.

### Why SIP Works
1. **Rupee Cost Averaging**: You buy more units when prices are low, fewer when high
2. **Discipline**: Automatic deductions build investing habits
3. **Flexibility**: Start with as little as ₹500/month
4. **Power of Compounding**: Regular investments grow exponentially

### SIP vs Lump Sum
| Aspect | SIP | Lump Sum |
|--------|-----|----------|
| Investment | Spread over time | All at once |
| Risk | Lower (averaged) | Higher |
| Best for | Regular income | Windfall/bonus |
| Timing stress | None | High |

### A Real Example
₹5,000/month SIP at 12% return:
- After 5 years: ₹4.1 lakhs (invested ₹3 lakhs)
- After 10 years: ₹11.6 lakhs (invested ₹6 lakhs)
- After 20 years: ₹49.9 lakhs (invested ₹12 lakhs)

### How to Start
1. Complete KYC (PAN, Aadhaar)
2. Choose a mutual fund (index funds are great for beginners)
3. Set up auto-debit from your bank
4. Forget and let it grow!

### Pro Tip
Increase your SIP by 10% every year (step-up SIP) to supercharge your wealth building.
    `,
        quiz: [
            {
                question: "What is the main advantage of 'Rupee Cost Averaging' in SIP?",
                options: ["Guaranteed returns", "You buy more when prices are low", "Zero risk", "Higher interest rates"],
                correctIndex: 1
            },
            {
                question: "What's the minimum amount you can typically start a SIP with?",
                options: ["₹10,000", "₹1,000", "₹500", "₹50,000"],
                correctIndex: 2
            }
        ]
    }
];

// Helper to get topic by ID
export function getTopicById(id) {
    return LEARNING_TOPICS.find(topic => topic.id === id);
}

// Get all topic IDs
export function getAllTopicIds() {
    return LEARNING_TOPICS.map(topic => topic.id);
}
