/**
 * WealthWise Game Engine
 * Core framework for financial literacy games
 * 
 * Supports:
 * - Track-based personas (Farmer, Woman, Student, Young Adult)
 * - Score & XP tracking
 * - Achievement integration
 * - Progress persistence
 */

// ============================================
// USER TRACKS / PERSONAS
// ============================================

export const USER_TRACKS = {
  farmer: {
    id: 'farmer',
    name: 'The Farmer',
    nameHindi: 'किसान',
    icon: '🌾',
    color: 'emerald',
    colorClass: 'bg-emerald-500',
    description: 'Manage seasonal income, save for lean periods, and protect your harvest',
    descriptionHindi: 'मौसमी आय का प्रबंधन करें, कमज़ोर समय के लिए बचत करें',
    challenges: [
      'Irregular and seasonal income',
      'Limited access to formal finance',
      'Weather and market uncertainties',
      'Managing crop loans'
    ],
    skills: ['Cash Flow Management', 'Savings Discipline', 'Credit Awareness', 'Risk Protection'],
    financialThemes: ['budgeting', 'savings', 'insurance', 'credit'],
    difficulty: 'intermediate',
    ageGroup: '25-55'
  },
  woman: {
    id: 'woman',
    name: 'The Woman',
    nameHindi: 'महिला',
    icon: '👩',
    color: 'pink',
    colorClass: 'bg-pink-500',
    description: 'Master household finances, grow your savings, and secure your family\'s future',
    descriptionHindi: 'घरेलू वित्त में महारत हासिल करें, अपनी बचत बढ़ाएं',
    challenges: [
      'Managing household budgets',
      'Separating personal & household finances',
      'Digital payment safety',
      'Long-term savings planning'
    ],
    skills: ['Budget Management', 'Digital Safety', 'Savings Goals', 'Financial Independence'],
    financialThemes: ['budgeting', 'savings', 'digital_finance', 'fraud_prevention'],
    difficulty: 'beginner',
    ageGroup: '20-50'
  },
  student: {
    id: 'student',
    name: 'The Student',
    nameHindi: 'विद्यार्थी',
    icon: '📚',
    color: 'blue',
    colorClass: 'bg-blue-500',
    description: 'Build smart money habits early and learn to make your allowance last',
    descriptionHindi: 'जल्दी स्मार्ट पैसे की आदतें बनाएं',
    challenges: [
      'Limited income (pocket money/stipend)',
      'Needs vs wants decisions',
      'Peer pressure spending',
      'No real financial experience'
    ],
    skills: ['Basic Budgeting', 'Saving Habits', 'Smart Spending', 'Digital Safety'],
    financialThemes: ['budgeting', 'savings', 'needs_wants', 'fraud_prevention'],
    difficulty: 'beginner',
    ageGroup: '13-22'
  },
  young_adult: {
    id: 'young_adult',
    name: 'The Young Adult',
    nameHindi: 'युवा',
    icon: '💼',
    color: 'violet',
    colorClass: 'bg-violet-500',
    description: 'Navigate career growth, investments, and life\'s big financial decisions',
    descriptionHindi: 'करियर विकास, निवेश और जीवन के बड़े वित्तीय निर्णय',
    challenges: [
      'First salary management',
      'Investment decisions',
      'Vulnerability to scams',
      'Long-term planning (retirement, home)'
    ],
    skills: ['Income Management', 'Investment Basics', 'Fraud Prevention', 'Tax Planning'],
    financialThemes: ['budgeting', 'investments', 'insurance', 'fraud_prevention', 'taxes'],
    difficulty: 'intermediate',
    ageGroup: '22-35'
  }
}

// ============================================
// GAME TYPES
// ============================================

export const GAME_TYPES = {
  QUIZ: 'quiz',
  SIMULATION: 'simulation',
  SCENARIO: 'scenario',
  CHALLENGE: 'challenge'
}

// ============================================
// FINANCIAL THEMES (Rule of Three compliance)
// ============================================

export const FINANCIAL_THEMES = {
  budgeting: {
    id: 'budgeting',
    name: 'Budgeting',
    nameHindi: 'बजट',
    icon: '📊',
    color: 'blue'
  },
  savings: {
    id: 'savings',
    name: 'Savings',
    nameHindi: 'बचत',
    icon: '🐷',
    color: 'green'
  },
  investments: {
    id: 'investments',
    name: 'Investments',
    nameHindi: 'निवेश',
    icon: '📈',
    color: 'purple'
  },
  insurance: {
    id: 'insurance',
    name: 'Insurance',
    nameHindi: 'बीमा',
    icon: '🛡️',
    color: 'teal'
  },
  fraud_prevention: {
    id: 'fraud_prevention',
    name: 'Fraud Prevention',
    nameHindi: 'धोखाधड़ी से बचाव',
    icon: '🚨',
    color: 'red'
  },
  digital_finance: {
    id: 'digital_finance',
    name: 'Digital Finance',
    nameHindi: 'डिजिटल वित्त',
    icon: '📱',
    color: 'cyan'
  },
  credit: {
    id: 'credit',
    name: 'Credit & Loans',
    nameHindi: 'ऋण',
    icon: '💳',
    color: 'orange'
  },
  taxes: {
    id: 'taxes',
    name: 'Tax Planning',
    nameHindi: 'कर योजना',
    icon: '📋',
    color: 'slate'
  },
  consumer_rights: {
    id: 'consumer_rights',
    name: 'Consumer Rights',
    nameHindi: 'उपभोक्ता अधिकार',
    icon: '⚖️',
    color: 'amber'
  },
  retirement: {
    id: 'retirement',
    name: 'Retirement Planning',
    nameHindi: 'सेवानिवृत्ति योजना',
    icon: '🏖️',
    color: 'emerald'
  }
}

// ============================================
// XP & LEVELING SYSTEM
// ============================================

export const XP_CONFIG = {
  levels: [
    { level: 1, name: 'Financial Newbie', nameHindi: 'वित्तीय नौसिखिया', xpRequired: 0, badge: '🌱' },
    { level: 2, name: 'Money Learner', nameHindi: 'धन शिक्षार्थी', xpRequired: 100, badge: '📖' },
    { level: 3, name: 'Budget Beginner', nameHindi: 'बजट शुरुआती', xpRequired: 300, badge: '💰' },
    { level: 4, name: 'Savings Starter', nameHindi: 'बचत शुरुआती', xpRequired: 600, badge: '🐷' },
    { level: 5, name: 'Finance Explorer', nameHindi: 'वित्त खोजकर्ता', xpRequired: 1000, badge: '🔍' },
    { level: 6, name: 'Money Manager', nameHindi: 'धन प्रबंधक', xpRequired: 1500, badge: '📊' },
    { level: 7, name: 'Investment Initiate', nameHindi: 'निवेश शुरुआती', xpRequired: 2200, badge: '📈' },
    { level: 8, name: 'Wealth Builder', nameHindi: 'धन निर्माता', xpRequired: 3000, badge: '🏗️' },
    { level: 9, name: 'Financial Pro', nameHindi: 'वित्तीय प्रो', xpRequired: 4000, badge: '⭐' },
    { level: 10, name: 'Money Master', nameHindi: 'धन गुरु', xpRequired: 5500, badge: '👑' },
    { level: 11, name: 'Wealth Wizard', nameHindi: 'धन जादूगर', xpRequired: 7500, badge: '🧙' },
    { level: 12, name: 'Financial Guru', nameHindi: 'वित्तीय गुरु', xpRequired: 10000, badge: '🏆' }
  ],

  // XP rewards for different actions
  rewards: {
    game_complete: 50,
    game_perfect: 100,
    quiz_correct: 10,
    scenario_correct: 25,
    daily_login: 5,
    streak_bonus: 20,
    first_time_bonus: 50,
    challenge_complete: 75
  }
}

// ============================================
// GAME ENGINE CLASS
// ============================================

export class GameEngine {
  constructor(userId, userTrack = 'young_adult') {
    this.userId = userId
    this.userTrack = userTrack
    this.currentScore = 0
    this.totalXP = 0
    this.currentLevel = 1
    this.gamesPlayed = {}
    this.achievements = []
  }

  /**
   * Get user's current level based on XP
   */
  static calculateLevel(totalXP) {
    const levels = XP_CONFIG.levels
    for (let i = levels.length - 1; i >= 0; i--) {
      if (totalXP >= levels[i].xpRequired) {
        return levels[i]
      }
    }
    return levels[0]
  }

  /**
   * Get XP needed for next level
   */
  static getXPForNextLevel(totalXP) {
    const levels = XP_CONFIG.levels
    const currentLevel = GameEngine.calculateLevel(totalXP)
    const nextLevelIndex = levels.findIndex(l => l.level === currentLevel.level) + 1

    if (nextLevelIndex >= levels.length) {
      return { needed: 0, progress: 100, isMaxLevel: true }
    }

    const nextLevel = levels[nextLevelIndex]
    const xpInCurrentLevel = totalXP - currentLevel.xpRequired
    const xpNeededForNext = nextLevel.xpRequired - currentLevel.xpRequired
    const progress = Math.round((xpInCurrentLevel / xpNeededForNext) * 100)

    return {
      needed: nextLevel.xpRequired - totalXP,
      progress,
      isMaxLevel: false,
      nextLevel
    }
  }

  /**
   * Award XP to user
   */
  static awardXP(action, multiplier = 1) {
    const baseXP = XP_CONFIG.rewards[action] || 10
    return Math.round(baseXP * multiplier)
  }

  /**
   * Get track-specific content
   */
  static getTrackContent(trackId) {
    return USER_TRACKS[trackId] || USER_TRACKS.young_adult
  }

  /**
   * Check if user can play a game based on their track
   */
  static canPlayGame(gameThemes, userTrack) {
    const track = USER_TRACKS[userTrack]
    if (!track) return true

    // Check if at least one game theme matches track themes
    return gameThemes.some(theme => track.financialThemes.includes(theme))
  }

  /**
   * Get difficulty multiplier for XP
   */
  static getDifficultyMultiplier(difficulty) {
    const multipliers = {
      easy: 0.75,
      beginner: 1,
      intermediate: 1.25,
      advanced: 1.5,
      expert: 2
    }
    return multipliers[difficulty] || 1
  }
}

// ============================================
// GAME RESULT CALCULATOR
// ============================================

export function calculateGameResult(answers, totalQuestions, gameType = 'quiz') {
  const correct = answers.filter(a => a.isCorrect).length
  const percentage = Math.round((correct / totalQuestions) * 100)

  let grade, message, xpMultiplier

  if (percentage >= 90) {
    grade = 'A+'
    message = 'Outstanding! You\'re a financial genius! 🏆'
    xpMultiplier = 2
  } else if (percentage >= 80) {
    grade = 'A'
    message = 'Excellent work! You really know your stuff! ⭐'
    xpMultiplier = 1.5
  } else if (percentage >= 70) {
    grade = 'B'
    message = 'Good job! Keep learning! 💪'
    xpMultiplier = 1.25
  } else if (percentage >= 60) {
    grade = 'C'
    message = 'Not bad! There\'s room for improvement. 📚'
    xpMultiplier = 1
  } else if (percentage >= 50) {
    grade = 'D'
    message = 'Keep practicing! You\'ll get better! 🌱'
    xpMultiplier = 0.75
  } else {
    grade = 'F'
    message = 'Don\'t give up! Review and try again! 💡'
    xpMultiplier = 0.5
  }

  const baseXP = gameType === 'simulation' ? XP_CONFIG.rewards.game_complete :
    gameType === 'scenario' ? XP_CONFIG.rewards.scenario_correct * correct :
      XP_CONFIG.rewards.quiz_correct * correct

  const earnedXP = Math.round(baseXP * xpMultiplier)

  return {
    correct,
    total: totalQuestions,
    percentage,
    grade,
    message,
    earnedXP,
    isPerfect: percentage === 100
  }
}

export default GameEngine
