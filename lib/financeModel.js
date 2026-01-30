
// Financial Model Constants and Logic mapped from finance_app.py

export const INVESTMENT_SCHEMES = {
    // --- GOVERNMENT ---
    ppf: {
        id: "ppf",
        name: "Public Provident Fund (PPF)",
        type: "Government",
        risk: "Very Low",
        roi: 7.1,
        lock_in: "15 Years",
        tax_status: "EEE (Exempt-Exempt-Exempt)",
        desc: "Government-backed, completely safe. Tax-free returns. Best for long-term safety.",
        min: 500, max: 150000
    },
    nps: {
        id: "nps",
        name: "National Pension System (NPS)",
        type: "Government",
        risk: "Low-Moderate",
        roi: 10.5, // Avg hist
        lock_in: "Age 60",
        tax_status: "EET (Partial Tax on Exit)",
        desc: "Pension scheme with equity exposure. Extra ₹50k tax deduction u/s 80CCD(1B).",
        min: 500, max: "Unlimited"
    },
    ssy: {
        id: "ssy",
        name: "Sukanya Samriddhi Yojana (SSY)",
        type: "Government",
        risk: "Very Low",
        roi: 8.2,
        lock_in: "21 Years (Girl Child only)",
        tax_status: "EEE",
        desc: "Highest rate among government schemes. Specifically for girl child's future.",
        min: 250, max: 150000
    },

    // --- EQUITY ---
    index_fund: {
        id: "index_fund",
        name: "Index Fund (Nifty 50)",
        type: "Mutual Fund",
        risk: "Moderate",
        roi: 12.5, // Hist avg
        lock_in: "None",
        tax_status: "LTCG > 1L taxed at 12.5%",
        desc: "Low-cost market matching returns. Best starting point for equity.",
        min: 500, max: "Unlimited"
    },
    elss: {
        id: "elss",
        name: "ELSS Tax Saver Fund",
        type: "Mutual Fund",
        risk: "High",
        roi: 14.0,
        lock_in: "3 Years",
        tax_status: "LTCG > 1L taxed at 12.5% (80C Benefit)",
        desc: "Shortest lock-in tax saver. High growth potential with volatility.",
        min: 500, max: "Unlimited"
    },

    // --- GOLD ---
    sgb: {
        id: "sgb",
        name: "Sovereign Gold Bond (SGB)",
        type: "Gold",
        risk: "Moderate",
        roi: 11.0, // Gold Rate + 2.5%
        lock_in: "8 Years",
        tax_status: "Tax Free on Maturity",
        desc: "Gold appreciation + 2.5% fixed interest. Best way to own gold.",
        min: 4800, max: "4KG"
    },

    // --- FIXED INCOME ---
    fd: {
        id: "fd",
        name: "Bank Fixed Deposit",
        type: "Fixed Income",
        risk: "Very Low",
        roi: 7.0,
        lock_in: "Flexible",
        tax_status: "Fully Taxable",
        desc: "Guaranteed returns, chemically pure safety. Returns barely beat inflation.",
        min: 1000, max: "Unlimited"
    }
}

export const PERSONA_PROMPTS = {
    "General": `You are a Certified Financial Planner (CFP). 
     Focus: Holistic health, risk management, retirement, and safety.
     Tone: Professional, empathetic, cautious.
     KPIs: Emergency Fund coverage, Debt-to-Income Ratio, Insurance adequacy.`,

    "Growth": `You are a Hedge Fund Growth Analyst.
     Focus: Maximizing Alpha, aggressive equity allocation, compound growth.
     Tone: Analytical, direct, focused on ROI.
     KPIs: Portfolio Beta, CAGR, Asset Allocation (Equity %).`,

    "Budget Agent": `You are a strict Budgeting Coach.
     Focus: Expense tracking, cutting leakage, living within means.
     Tone: Practical, encouraging but firm, detail-oriented.
     KPIs: Monthly Burn Rate, Savings Rate, Discretionary Spending.`,

    "Savings Agent": `You are a Savings Optimization Expert.
     Focus: Liquidity, goal-based savings, emergency funds, short-term yields.
     Tone: Helpful, resource-focused, steady.
     KPIs: Emergency Fund Months, Goal Progress, Liquid Cash.`,

    "Debt Manager": `You are a Debt Elimination Strategist.
     Focus: Interest reduction, snowball/avalanche methods, credit score repair.
     Tone: Supportive, non-judgmental, strategic.
     KPIs: Debt-to-Income Ratio, Interest Saved, Debt Free Date.`,

    "Investment Scout": `You are a Market Opportunities Scout.
     Focus: Identifying high-growth assets, market trends, asset allocation.
     Tone: Insightful, forward-looking, data-driven.
     KPIs: Portfolio Diversity, Expected Returns, Market Alpha.`,

    "Tax": `You are a Senior Tax Strategist.
     Focus: Tax efficiency, 80C/80D utilization, Tax Loss Harvesting.
     Tone: Technical, precise, regulatory-focused.
     KPIs: Taxable Income, Deductions Utilized, Post-Tax Returns.`,

    "Frugal": `You are a 'FIRE' (Financial Independence, Retire Early) Coach.
     Focus: Savings rate, cutting expenses, minimalism, freedom.
     Tone: Strict, practical, no-nonsense.
     KPIs: Savings Rate (%), Expense Leakage, Burn Rate.`,

    "Psych": `You are a Behavioral Finance Expert.
     Focus: Biases (Loss Aversion, FOMO), decision frameworks, mental models.
     Tone: Psychological, thoughtful, probing.
     KPIs: Impulse Buy Frequency, Decision Confidence Score.`
}

export const KPI_DATA = {
    "General": [
        { label: "Safety Score", value: "85/100", delta: "+5", deltaType: "positive" },
        { label: "Free Cash Flow", value: "₹1.2L", delta: "+12%", deltaType: "positive" },
        { label: "Debt-to-Income", value: "12%", delta: "-2%", deltaType: "positive" },
        { label: "Insured", value: "Yes", delta: "Stable", deltaType: "neutral" }
    ],
    "Growth": [
        { label: "Portfolio Alpha", value: "4.2", delta: "+0.3", deltaType: "positive" },
        { label: "Equity Alloc", value: "75%", delta: "+5%", deltaType: "positive" },
        { label: "Beta", value: "1.15", delta: "High", deltaType: "warning" },
        { label: "CAGR", value: "14%", delta: "+1%", deltaType: "positive" }
    ],
    "Budget Agent": [
        { label: "Monthly Burn", value: "₹45k", delta: "-₹2k", deltaType: "positive" },
        { label: "Savings Rate", value: "30%", delta: "+5%", deltaType: "positive" },
        { label: "Needs/Wants", value: "50/30", delta: "Good", deltaType: "positive" },
        { label: "Leakage", value: "₹1.5k", delta: "-₹500", deltaType: "positive" }
    ],
    "Savings Agent": [
        { label: "Emergency Fund", value: "6 Mo", delta: "+1 Mo", deltaType: "positive" },
        { label: "Goal Progress", value: "65%", delta: "+5%", deltaType: "positive" },
        { label: "Liquidity", value: "High", delta: "Stable", deltaType: "neutral" },
        { label: "Yield", value: "7.5%", delta: "+0.5%", deltaType: "positive" }
    ],
    "Debt Manager": [
        { label: "Total Debt", value: "₹2.5L", delta: "-₹10k", deltaType: "positive" },
        { label: "Avg Rate", value: "14%", delta: "-1%", deltaType: "positive" },
        { label: "DTI Ratio", value: "25%", delta: "-2%", deltaType: "positive" },
        { label: "Credit Score", value: "750", delta: "+15", deltaType: "positive" }
    ],
    "Investment Scout": [
        { label: "Risk Score", value: "Mod-High", delta: "Stable", deltaType: "neutral" },
        { label: "Exp. Return", value: "15%", delta: "+2%", deltaType: "positive" },
        { label: "Diversity", value: "High", delta: "Good", deltaType: "positive" },
        { label: "Market Opps", value: "3", delta: "New", deltaType: "positive" }
    ],
    "Tax": [
        { label: "Taxable Income", value: "₹12.5L", delta: "High", deltaType: "warning" },
        { label: "80C Utilized", value: "100%", delta: "Max", deltaType: "positive" },
        { label: "Tax Harv.", value: "₹45k", delta: "New", deltaType: "positive" },
        { label: "Eff. Rate", value: "18%", delta: "-2%", deltaType: "positive" }
    ],
    "Frugal": [
        { label: "Savings Rate", value: "42%", delta: "+10%", deltaType: "positive" },
        { label: "Burn Rate", value: "₹35k/mo", delta: "-5k", deltaType: "positive" },
        { label: "Leakage", value: "₹4.2k", delta: "-1k", deltaType: "positive" },
        { label: "Freedom Date", value: "2032", delta: "-6mo", deltaType: "positive" }
    ],
    "Psych": [
        { label: "Impulse Buys", value: "2", delta: "-3", deltaType: "positive" },
        { label: "Confidence", value: "High", delta: "Stable", deltaType: "neutral" },
        { label: "FOMO Score", value: "2/10", delta: "Low", deltaType: "positive" },
        { label: "Clarity", value: "High", delta: "Stable", deltaType: "neutral" }
    ]
}

// Helper to generate investment plan
export function generateInvestmentPlan(goal, riskProf, amount) {
    const recs = []

    // Goal-Based Rules
    if (goal === "Tax Saving") {
        recs.push(INVESTMENT_SCHEMES["ppf"])
        recs.push(INVESTMENT_SCHEMES["elss"])
        recs.push(INVESTMENT_SCHEMES["nps"])
    } else if (goal === "Emergency Fund") {
        recs.push(INVESTMENT_SCHEMES["fd"])
    } else if (goal === "Retirement") {
        recs.push(INVESTMENT_SCHEMES["nps"])
        recs.push(INVESTMENT_SCHEMES["ppf"])
    } else { // Wealth Creation
        recs.push(INVESTMENT_SCHEMES["index_fund"])
        recs.push(INVESTMENT_SCHEMES["sgb"])
        if (["High", "Very High"].includes(riskProf)) {
            recs.push(INVESTMENT_SCHEMES["elss"])
        }
    }

    return recs
}
