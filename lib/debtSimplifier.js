/**
 * Debt Simplification Algorithm
 * Minimizes the number of transactions needed to settle group debts
 * 
 * @module lib/debtSimplifier
 */

/**
 * Calculate net balances from expenses
 * @param {Array} expenses - Array of SplitExpense documents
 * @param {Array} members - Array of group members
 * @returns {Array} Array of {memberId, memberName, balance}
 */
export function calculateBalances(expenses, members) {
  const balanceMap = new Map()

  // Initialize all active members with 0 balance
  members
    .filter(m => m.status === 'active')
    .forEach(m => {
      balanceMap.set(m._id.toString(), {
        memberId: m._id,
        memberName: m.name,
        balance: 0,
        paid: 0,      // Total amount paid
        owes: 0       // Total amount owed
      })
    })

  // Process each expense
  expenses.forEach(expense => {
    if (expense.isDeleted) return

    const payerId = expense.paidBy.memberId.toString()

    // Payer gets positive balance (is owed money)
    const payer = balanceMap.get(payerId)
    if (payer) {
      payer.balance += expense.amount
      payer.paid += expense.amount
    }

    // Each person in split gets negative balance (owes money)
    expense.splitAmong.forEach(split => {
      const memberId = split.memberId.toString()
      const member = balanceMap.get(memberId)
      if (member) {
        member.balance -= split.amount
        member.owes += split.amount
      }
    })
  })

  // Round balances to 2 decimal places
  const balances = Array.from(balanceMap.values()).map(b => ({
    ...b,
    balance: Math.round(b.balance * 100) / 100,
    paid: Math.round(b.paid * 100) / 100,
    owes: Math.round(b.owes * 100) / 100
  }))

  return balances
}

/**
 * Apply settlements to balances
 * @param {Array} balances - Current balances
 * @param {Array} settlements - Array of Settlement documents
 * @returns {Array} Updated balances after settlements
 */
export function applySettlements(balances, settlements) {
  const balanceMap = new Map(
    balances.map(b => [b.memberId.toString(), { ...b }])
  )

  settlements.forEach(settlement => {
    if (settlement.status !== 'completed') return

    const fromId = settlement.from.memberId.toString()
    const toId = settlement.to.memberId.toString()

    const fromMember = balanceMap.get(fromId)
    const toMember = balanceMap.get(toId)

    if (fromMember) {
      fromMember.balance += settlement.amount // Paying reduces negative balance
    }

    if (toMember) {
      toMember.balance -= settlement.amount // Receiving reduces positive balance
    }
  })

  return Array.from(balanceMap.values()).map(b => ({
    ...b,
    balance: Math.round(b.balance * 100) / 100
  }))
}

/**
 * Simplify debts to minimum transactions using greedy algorithm
 * 
 * Algorithm:
 * 1. Separate members into creditors (positive balance) and debtors (negative)
 * 2. Sort both by amount (descending)
 * 3. Match largest debtor with largest creditor
 * 4. Create transaction for minimum of both amounts
 * 5. Reduce both amounts and repeat
 * 
 * Time Complexity: O(n log n) for sorting + O(n) for matching
 * 
 * @param {Array} balances - Array of {memberId, memberName, balance}
 * @returns {Array} Array of simplified transactions
 */
export function simplifyDebts(balances) {
  // Separate creditors (positive balance) and debtors (negative balance)
  const creditors = [] // People who are owed money
  const debtors = []   // People who owe money

  balances.forEach(({ memberId, memberName, balance }) => {
    // Ignore negligible amounts (less than ₹1)
    if (balance > 0.99) {
      creditors.push({
        memberId,
        memberName,
        amount: Math.round(balance * 100) / 100
      })
    } else if (balance < -0.99) {
      debtors.push({
        memberId,
        memberName,
        amount: Math.round(-balance * 100) / 100
      })
    }
  })

  // Sort by amount (descending) for optimal matching
  creditors.sort((a, b) => b.amount - a.amount)
  debtors.sort((a, b) => b.amount - a.amount)

  const transactions = []

  let i = 0 // debtor index
  let j = 0 // creditor index

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i]
    const creditor = creditors[j]

    // Settle the minimum of what debtor owes and creditor is owed
    const settleAmount = Math.min(debtor.amount, creditor.amount)

    if (settleAmount >= 1) { // Only create transaction if >= ₹1
      transactions.push({
        from: {
          memberId: debtor.memberId,
          memberName: debtor.memberName
        },
        to: {
          memberId: creditor.memberId,
          memberName: creditor.memberName
        },
        amount: Math.round(settleAmount * 100) / 100
      })
    }

    // Reduce amounts
    debtor.amount -= settleAmount
    creditor.amount -= settleAmount

    // Move to next debtor/creditor if settled
    if (debtor.amount < 1) i++
    if (creditor.amount < 1) j++
  }

  return transactions
}

/**
 * Get detailed balance summary for a group
 * @param {Array} expenses - All group expenses
 * @param {Array} settlements - All group settlements
 * @param {Array} members - Group members
 * @returns {Object} Detailed balance summary
 */
export function getBalanceSummary(expenses, settlements, members) {
  // Calculate base balances from expenses
  const baseBalances = calculateBalances(expenses, members)

  // Apply settlements
  const currentBalances = applySettlements(baseBalances, settlements)

  // Get simplified transactions
  const simplifiedTransactions = simplifyDebts(currentBalances)

  // Calculate summary stats
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.isDeleted ? 0 : e.amount), 0)
  const totalSettled = settlements
    .filter(s => s.status === 'completed')
    .reduce((sum, s) => sum + s.amount, 0)

  const totalOwed = currentBalances
    .filter(b => b.balance > 0)
    .reduce((sum, b) => sum + b.balance, 0)

  const isSettled = simplifiedTransactions.length === 0

  return {
    balances: currentBalances,
    simplifiedTransactions,
    stats: {
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      totalSettled: Math.round(totalSettled * 100) / 100,
      totalOwed: Math.round(totalOwed * 100) / 100,
      expenseCount: expenses.filter(e => !e.isDeleted).length,
      settlementCount: settlements.filter(s => s.status === 'completed').length,
      transactionsNeeded: simplifiedTransactions.length,
      isSettled
    }
  }
}

/**
 * Get what a specific member owes or is owed
 * @param {Array} balances - Current balances
 * @param {string} memberId - Member to check
 * @returns {Object} Member's debt details
 */
export function getMemberDebts(balances, memberId) {
  const memberBalance = balances.find(
    b => b.memberId.toString() === memberId.toString()
  )

  if (!memberBalance) {
    return {
      balance: 0,
      owes: [],
      isOwed: [],
      totalOwes: 0,
      totalIsOwed: 0
    }
  }

  const simplifiedTransactions = simplifyDebts(balances)

  // Find transactions involving this member
  const owes = simplifiedTransactions
    .filter(t => t.from.memberId.toString() === memberId.toString())
    .map(t => ({
      to: t.to,
      amount: t.amount
    }))

  const isOwed = simplifiedTransactions
    .filter(t => t.to.memberId.toString() === memberId.toString())
    .map(t => ({
      from: t.from,
      amount: t.amount
    }))

  return {
    balance: memberBalance.balance,
    owes,
    isOwed,
    totalOwes: owes.reduce((sum, o) => sum + o.amount, 0),
    totalIsOwed: isOwed.reduce((sum, o) => sum + o.amount, 0)
  }
}

/**
 * Validate that total credits equal total debits (should always be true)
 * @param {Array} balances - Balances to validate
 * @returns {boolean} True if balanced
 */
export function validateBalances(balances) {
  const total = balances.reduce((sum, b) => sum + b.balance, 0)
  return Math.abs(total) < 0.01 // Allow for floating point errors
}

/**
 * Format currency for display
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: INR)
 * @returns {string} Formatted amount
 */
export function formatCurrency(amount, currency = 'INR') {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })

  return formatter.format(amount)
}

/**
 * Get human-readable balance description
 * @param {number} balance - Balance amount
 * @param {string} memberName - Member name
 * @returns {string} Description
 */
export function getBalanceDescription(balance, memberName) {
  if (Math.abs(balance) < 1) {
    return `${memberName} is settled up`
  } else if (balance > 0) {
    return `${memberName} gets back ${formatCurrency(balance)}`
  } else {
    return `${memberName} owes ${formatCurrency(-balance)}`
  }
}

export default {
  calculateBalances,
  applySettlements,
  simplifyDebts,
  getBalanceSummary,
  getMemberDebts,
  validateBalances,
  formatCurrency,
  getBalanceDescription
}
