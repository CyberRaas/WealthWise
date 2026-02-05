"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Heart,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Shield,
  Target,
  PiggyBank,
  CreditCard,
  Zap,
} from "lucide-react";

/**
 * Financial Health Score Widget
 *
 * Calculates a score from 0-100 based on:
 * - Savings Rate (30%)
 * - Debt-to-Income Ratio (25%)
 * - Emergency Fund Coverage (20%)
 * - Goal Progress (15%)
 * - Financial Literacy Score (10%)
 */

const SCORE_GRADES = [
  {
    min: 90,
    grade: "A+",
    label: "Excellent",
    color: "text-emerald-600",
    bgColor: "bg-emerald-500",
    description: "Outstanding financial health!",
  },
  {
    min: 80,
    grade: "A",
    label: "Great",
    color: "text-green-600",
    bgColor: "bg-green-500",
    description: "Strong financial foundation",
  },
  {
    min: 70,
    grade: "B",
    label: "Good",
    color: "text-lime-600",
    bgColor: "bg-lime-500",
    description: "On the right track",
  },
  {
    min: 60,
    grade: "C",
    label: "Fair",
    color: "text-yellow-600",
    bgColor: "bg-yellow-500",
    description: "Room for improvement",
  },
  {
    min: 50,
    grade: "D",
    label: "Needs Work",
    color: "text-orange-600",
    bgColor: "bg-orange-500",
    description: "Focus on key areas",
  },
  {
    min: 0,
    grade: "F",
    label: "Critical",
    color: "text-red-600",
    bgColor: "bg-red-500",
    description: "Immediate action needed",
  },
];

const FACTORS = [
  {
    id: "savings",
    name: "Savings Rate",
    icon: PiggyBank,
    weight: 30,
    color: "text-emerald-500",
  },
  {
    id: "debt",
    name: "Debt Ratio",
    icon: CreditCard,
    weight: 25,
    color: "text-blue-500",
  },
  {
    id: "emergency",
    name: "Emergency Fund",
    icon: Shield,
    weight: 20,
    color: "text-violet-500",
  },
  {
    id: "goals",
    name: "Goal Progress",
    icon: Target,
    weight: 15,
    color: "text-amber-500",
  },
  {
    id: "literacy",
    name: "Financial Literacy",
    icon: Zap,
    weight: 10,
    color: "text-pink-500",
  },
];

export default function FinancialHealthScore({
  income = 0,
  expenses = 0,
  savings = 0,
  debt = 0,
  emergencyFund = 0,
  goalProgress = 0, // 0-100
  className = "",
}) {
  const [score, setScore] = useState(0);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [factorScores, setFactorScores] = useState({});

  // Calculate individual factor scores
  useEffect(() => {
    const calculateScore = () => {
      // 1. Savings Rate (0-100, target: 20%+)
      const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;
      const savingsScore = Math.min(100, Math.max(0, savingsRate * 5)); // 20% savings = 100 score

      // 2. Debt-to-Income Ratio (0-100, target: <30%)
      const debtRatio = income > 0 ? (debt / (income * 12)) * 100 : 0;
      const debtScore = Math.max(0, Math.min(100, 100 - debtRatio * 2)); // 0% debt = 100, 50%+ = 0

      // 3. Emergency Fund Coverage (0-100, target: 6 months)
      const monthlyExpenses = expenses || income * 0.8;
      const emergencyMonths =
        monthlyExpenses > 0 ? emergencyFund / monthlyExpenses : 0;
      const emergencyScore = Math.min(100, (emergencyMonths / 6) * 100); // 6 months = 100

      // 4. Goal Progress (directly from input)
      const goalsScore = Math.min(100, Math.max(0, goalProgress));

      // 5. Financial Literacy (from game progress)
      let literacyScore = 0;
      try {
        const gameProgress = localStorage.getItem("wealthwise_game_progress");
        if (gameProgress) {
          const progress = JSON.parse(gameProgress);
          literacyScore = Math.min(100, (progress.totalXP / 500) * 100); // 500 XP = 100 score
        }
      } catch (e) {
        literacyScore = 0;
      }

      const factors = {
        savings: Math.round(savingsScore),
        debt: Math.round(debtScore),
        emergency: Math.round(emergencyScore),
        goals: Math.round(goalsScore),
        literacy: Math.round(literacyScore),
      };

      setFactorScores(factors);

      // Calculate weighted total
      const totalScore = Math.round(
        factors.savings * 0.3 +
          factors.debt * 0.25 +
          factors.emergency * 0.2 +
          factors.goals * 0.15 +
          factors.literacy * 0.1,
      );

      setScore(totalScore);
    };

    calculateScore();
  }, [income, expenses, savings, debt, emergencyFund, goalProgress]);

  // Animate score on change
  useEffect(() => {
    let start = animatedScore;
    const end = score;
    const duration = 1000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = Math.round(start + (end - start) * eased);
      setAnimatedScore(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [score]);

  // Get grade info
  const getGradeInfo = (score) => {
    return (
      SCORE_GRADES.find((g) => score >= g.min) ||
      SCORE_GRADES[SCORE_GRADES.length - 1]
    );
  };

  const gradeInfo = getGradeInfo(score);

  // Get trend (would need historical data in production)
  const trend = score >= 60 ? "up" : "down";

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Financial Health Score
          </CardTitle>
          <Badge
            variant="outline"
            className={`${gradeInfo.color} border-current`}
          >
            {gradeInfo.grade}
          </Badge>
        </div>
        <CardDescription className="text-sm">
          {gradeInfo.description}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Score Circle */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative w-32 h-32">
            {/* Background circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="currentColor"
                strokeWidth="12"
                className="text-slate-200 dark:text-slate-700"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="currentColor"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${animatedScore * 3.52} 352`}
                className={gradeInfo.color}
                style={{ transition: "stroke-dasharray 1s ease-out" }}
              />
            </svg>

            {/* Score display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-bold ${gradeInfo.color}`}>
                {animatedScore}
              </span>
              <span className="text-xs text-slate-500">out of 100</span>
            </div>
          </div>
        </div>

        {/* Status Row */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {trend === "up" ? (
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">
              <TrendingUp className="h-3 w-3 mr-1" />
              Improving
            </Badge>
          ) : (
            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0">
              <TrendingDown className="h-3 w-3 mr-1" />
              Needs Attention
            </Badge>
          )}
          {score >= 70 && (
            <Badge className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 border-0">
              <Sparkles className="h-3 w-3 mr-1" />
              Well Managed
            </Badge>
          )}
        </div>

        {/* Factor Breakdown */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Score Breakdown
          </p>

          {FACTORS.map((factor) => {
            const Icon = factor.icon;
            const factorScore = factorScores[factor.id] || 0;
            return (
              <div key={factor.id} className="flex items-center gap-3">
                <Icon className={`h-4 w-4 ${factor.color} flex-shrink-0`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-600 dark:text-slate-400 truncate">
                      {factor.name}
                    </span>
                    <span className="font-medium">{factorScore}%</span>
                  </div>
                  <Progress value={factorScore} className="h-1.5" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Improvement Tips */}
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs font-medium text-slate-500 mb-2">Quick Win</p>
          {score < 50 && (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              🎯 Start by tracking all your expenses this week
            </p>
          )}
          {score >= 50 && score < 70 && (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              💰 Aim to save 20% of your income each month
            </p>
          )}
          {score >= 70 && score < 90 && (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              📈 Consider increasing your emergency fund to 6 months
            </p>
          )}
          {score >= 90 && (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              🏆 Excellent! Explore investment options to grow wealth
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
