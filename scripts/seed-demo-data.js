/**
 * Demo Account Seed Script
 * 
 * Seeds the currently logged-in user's profile with realistic data for demo purposes.
 * This runs CLIENT-SIDE — navigate to /dashboard, open browser console, paste & run.
 * 
 * Usage: Open browser console on /dashboard and paste this file contents, or
 *        import as a component and trigger via a hidden admin button.
 * 
 * Alternative: Run via API route /api/admin/seed-demo (see below)
 */

// ─── Expense Data (last 2 months, Indian context) ───
const DEMO_EXPENSES = [
  // Current month
  { amount: 12000, category: 'Home & Utilities', description: 'Monthly rent', date: '2026-02-01' },
  { amount: 3500, category: 'Food & Dining', description: 'BigBasket grocery order', date: '2026-02-02' },
  { amount: 800, category: 'Transportation', description: 'Metro card recharge', date: '2026-02-03' },
  { amount: 250, category: 'Food & Dining', description: 'Chai and samosa at office canteen', date: '2026-02-04' },
  { amount: 2000, category: 'Healthcare', description: 'Doctor consultation + medicines', date: '2026-02-05' },
  { amount: 499, category: 'Entertainment', description: 'Netflix subscription', date: '2026-02-06' },
  { amount: 1500, category: 'Shopping', description: 'Amazon - phone cover and earphones', date: '2026-02-07' },
  { amount: 3000, category: 'Food & Dining', description: 'Weekly vegetables + fruits from mandi', date: '2026-02-08' },
  { amount: 450, category: 'Transportation', description: 'Ola auto to hospital', date: '2026-02-05' },
  { amount: 1200, category: 'Home & Utilities', description: 'Electricity bill', date: '2026-02-04' },
  { amount: 599, category: 'Home & Utilities', description: 'Jio WiFi recharge', date: '2026-02-01' },
  { amount: 350, category: 'Food & Dining', description: 'Zomato - dinner delivery', date: '2026-02-07' },
  // Last month
  { amount: 12000, category: 'Home & Utilities', description: 'Monthly rent', date: '2026-01-01' },
  { amount: 4200, category: 'Food & Dining', description: 'Monthly groceries + milk', date: '2026-01-03' },
  { amount: 800, category: 'Transportation', description: 'Metro card recharge', date: '2026-01-02' },
  { amount: 2500, category: 'Shopping', description: 'Winter jacket from Myntra sale', date: '2026-01-10' },
  { amount: 1500, category: 'Entertainment', description: 'Movie tickets + popcorn (family)', date: '2026-01-15' },
  { amount: 500, category: 'Healthcare', description: 'Pharmacy - cold medicine', date: '2026-01-20' },
  { amount: 3000, category: 'Food & Dining', description: 'Republic Day party food', date: '2026-01-26' },
  { amount: 2000, category: 'Other', description: 'Donation to local temple', date: '2026-01-14' },
  { amount: 1200, category: 'Home & Utilities', description: 'Electricity bill', date: '2026-01-05' },
  { amount: 599, category: 'Home & Utilities', description: 'Jio WiFi recharge', date: '2026-01-01' },
  { amount: 700, category: 'Transportation', description: 'Uber rides (3)', date: '2026-01-18' },
  { amount: 300, category: 'Food & Dining', description: 'Street food with friends', date: '2026-01-16' },
]

// ─── Goals Data ───
const DEMO_GOALS = [
  {
    name: 'Emergency Fund',
    description: '6 months of expenses saved for unexpected events',
    targetAmount: 150000,
    currentAmount: 45000,
    targetMonths: 18,
    category: 'Security',
    priority: 'High',
  },
  {
    name: 'New Laptop',
    description: 'Save for a good laptop for work/study',
    targetAmount: 65000,
    currentAmount: 28000,
    targetMonths: 6,
    category: 'Education',
    priority: 'Medium',
  },
  {
    name: 'Goa Trip',
    description: 'Family vacation fund',
    targetAmount: 30000,
    currentAmount: 12000,
    targetMonths: 4,
    category: 'Travel',
    priority: 'Low',
  },
  {
    name: 'Skill Course',
    description: 'Online certification in data analytics',
    targetAmount: 15000,
    currentAmount: 15000,
    targetMonths: 3,
    category: 'Education',
    priority: 'High',
    status: 'completed',
  },
]

// ─── Game Progress (localStorage) ───
const DEMO_GAME_PROGRESS = {
  totalXP: 825,
  level: 5,
  levelName: 'Finance Explorer',
  gamesPlayed: 6,
  gamesCompleted: ['scam-buster', 'life-decisions', 'fitness-test'],
  achievements: ['first_game', 'scam_master'],
  streak: 3,
  lastPlayed: new Date().toISOString(),
}

const DEMO_SCAM_BUSTER_RESULT = {
  correct: 10,
  total: 10,
  completedAt: new Date().toISOString(),
}

const DEMO_LIFE_DECISIONS_RESULT = {
  grade: 'A',
  behaviorTags: ['planned', 'optimal'],
  savings: 42000,
  debt: 0,
  completedAt: new Date().toISOString(),
}

const DEMO_LEARNING_PROGRESS = {
  modulesCompleted: 4,
  totalModules: 10,
}

// ─── Seed Function (call from browser console or component) ───
export async function seedDemoData() {
  const results = { expenses: 0, goals: 0, gameProgress: false, errors: [] }

  // 1. Seed expenses via API
  for (const expense of DEMO_EXPENSES) {
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense),
      })
      if (res.ok) results.expenses++
      else results.errors.push(`Expense: ${expense.description} - ${res.status}`)
    } catch (e) {
      results.errors.push(`Expense: ${expense.description} - ${e.message}`)
    }
  }

  // 2. Seed goals via API
  for (const goal of DEMO_GOALS) {
    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goal),
      })
      if (res.ok) results.goals++
      else results.errors.push(`Goal: ${goal.name} - ${res.status}`)
    } catch (e) {
      results.errors.push(`Goal: ${goal.name} - ${e.message}`)
    }
  }

  // 3. Seed game progress to localStorage
  try {
    localStorage.setItem('wealthwise_game_progress', JSON.stringify(DEMO_GAME_PROGRESS))
    localStorage.setItem('wealthwise_scam_buster_result', JSON.stringify(DEMO_SCAM_BUSTER_RESULT))
    localStorage.setItem('wealthwise_life_decisions_result', JSON.stringify(DEMO_LIFE_DECISIONS_RESULT))
    localStorage.setItem('wealthwise_learning_progress', JSON.stringify(DEMO_LEARNING_PROGRESS))
    results.gameProgress = true
  } catch (e) {
    results.errors.push(`LocalStorage: ${e.message}`)
  }

  console.log('🌱 Demo seed complete:', results)
  return results
}

// ─── Auto-run if pasted directly in console ───
if (typeof window !== 'undefined' && !window.__SEED_LOADED) {
  window.__SEED_LOADED = true
  window.seedDemoData = seedDemoData
  console.log('✅ Demo seed script loaded. Run: seedDemoData()')
}
