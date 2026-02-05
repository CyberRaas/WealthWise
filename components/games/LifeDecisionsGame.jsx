"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  LIFE_DECISIONS_CONFIG,
  MONTHLY_DECISIONS,
  LIFE_EVENTS,
  getMonthlyDecision,
  calculateImpact,
  getFinalGrade,
} from "@/lib/lifeDecisionsGame";
import {
  Wallet,
  TrendingUp,
  PiggyBank,
  CreditCard,
  Heart,
  ChevronRight,
  Trophy,
  RotateCcw,
  Calendar,
  DollarSign,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  CheckCircle,
  Sparkles,
  Target,
} from "lucide-react";
import confetti from "canvas-confetti";

export default function LifeDecisionsGame({ onComplete, onXPEarned }) {
  const [gameState, setGameState] = useState("intro"); // intro, playing, event, result
  const [currentMonth, setCurrentMonth] = useState(1);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showImpact, setShowImpact] = useState(false);

  // Financial State
  const [finances, setFinances] = useState({
    savings: LIFE_DECISIONS_CONFIG.startingState.savings,
    investments: LIFE_DECISIONS_CONFIG.startingState.investments,
    debt: LIFE_DECISIONS_CONFIG.startingState.debt,
    creditScore: LIFE_DECISIONS_CONFIG.startingState.creditScore,
    emergencyFund: LIFE_DECISIONS_CONFIG.startingState.emergencyFund,
    happiness: LIFE_DECISIONS_CONFIG.startingState.happiness,
  });

  const [decisions, setDecisions] = useState([]);
  const [totalScore, setTotalScore] = useState(0);
  const [pendingEvent, setPendingEvent] = useState(null);

  const currentDecision = MONTHLY_DECISIONS[currentMonth];

  // Start game
  const startGame = () => {
    setFinances({
      savings: LIFE_DECISIONS_CONFIG.startingState.savings,
      investments: LIFE_DECISIONS_CONFIG.startingState.investments,
      debt: LIFE_DECISIONS_CONFIG.startingState.debt,
      creditScore: LIFE_DECISIONS_CONFIG.startingState.creditScore,
      emergencyFund: LIFE_DECISIONS_CONFIG.startingState.emergencyFund,
      happiness: LIFE_DECISIONS_CONFIG.startingState.happiness,
    });
    setCurrentMonth(1);
    setDecisions([]);
    setTotalScore(0);
    setSelectedOption(null);
    setShowImpact(false);
    setPendingEvent(null);
    setGameState("playing");
  };

  // Handle decision
  const handleDecision = (option) => {
    if (showImpact) return;

    setSelectedOption(option);

    // Calculate impacts
    const impact = option.impact;
    const newFinances = { ...finances };

    if (impact.savings)
      newFinances.savings = Math.max(0, newFinances.savings + impact.savings);
    if (impact.investments)
      newFinances.investments = Math.max(
        0,
        newFinances.investments + impact.investments,
      );
    if (impact.debt)
      newFinances.debt = Math.max(0, newFinances.debt + impact.debt);
    if (impact.creditScore)
      newFinances.creditScore = Math.min(
        900,
        Math.max(300, newFinances.creditScore + impact.creditScore),
      );
    if (impact.emergencyFund)
      newFinances.emergencyFund = Math.max(
        0,
        newFinances.emergencyFund + impact.emergencyFund,
      );
    if (impact.happiness)
      newFinances.happiness = Math.min(
        100,
        Math.max(0, newFinances.happiness + impact.happiness),
      );

    setFinances(newFinances);
    setTotalScore((prev) => prev + option.score);
    setDecisions((prev) => [
      ...prev,
      {
        month: currentMonth,
        option: option.id,
        score: option.score,
        title: currentDecision.title,
      },
    ]);

    setShowImpact(true);

    // Check for random life event
    if (currentDecision.event && Math.random() > 0.5) {
      setPendingEvent(currentDecision.event);
    }
  };

  // Move to next month
  const handleNext = () => {
    if (pendingEvent) {
      setGameState("event");
      return;
    }

    if (currentMonth < LIFE_DECISIONS_CONFIG.monthsPerGame) {
      setCurrentMonth((prev) => prev + 1);
      setSelectedOption(null);
      setShowImpact(false);
      setGameState("playing");
    } else {
      // Game complete
      finishGame();
    }
  };

  // Handle life event
  const handleEvent = (choiceIdx) => {
    const eventChoice = pendingEvent.choices?.[choiceIdx];
    if (eventChoice?.impact) {
      const newFinances = { ...finances };
      Object.entries(eventChoice.impact).forEach(([key, value]) => {
        if (newFinances[key] !== undefined) {
          newFinances[key] = Math.max(0, newFinances[key] + value);
        }
      });
      setFinances(newFinances);
    }

    setPendingEvent(null);

    if (currentMonth < LIFE_DECISIONS_CONFIG.monthsPerGame) {
      setCurrentMonth((prev) => prev + 1);
      setSelectedOption(null);
      setShowImpact(false);
      setGameState("playing");
    } else {
      finishGame();
    }
  };

  // Finish game
  const finishGame = () => {
    setGameState("result");

    const grade = getFinalGrade(totalScore, finances);
    if (grade.letter === "A" || grade.letter === "B") {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    // Calculate total XP
    const xpEarned =
      Math.round(totalScore * 10) + LIFE_DECISIONS_CONFIG.xp.complete;

    if (onXPEarned) {
      onXPEarned(xpEarned);
    }

    if (onComplete) {
      onComplete({
        score: totalScore,
        finances,
        xpEarned,
      });
    }
  };

  // Financial metric card
  const MetricCard = ({
    icon: Icon,
    label,
    value,
    prefix = "",
    suffix = "",
    color = "blue",
  }) => (
    <div
      className={`bg-${color}-50 dark:bg-${color}-900/20 rounded-lg p-3 text-center`}
    >
      <Icon className={`w-5 h-5 mx-auto mb-1 text-${color}-500`} />
      <div className={`text-lg font-bold text-${color}-600`}>
        {prefix}
        {typeof value === "number" ? value.toLocaleString() : value}
        {suffix}
      </div>
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
    </div>
  );

  // Impact indicator
  const ImpactBadge = ({ value, label }) => {
    if (!value || value === 0) return null;
    const isPositive = value > 0;
    return (
      <Badge
        className={`${isPositive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}
      >
        {isPositive ? (
          <ArrowUp className="w-3 h-3 mr-1" />
        ) : (
          <ArrowDown className="w-3 h-3 mr-1" />
        )}
        {label}: {isPositive ? "+" : ""}
        {value.toLocaleString()}
      </Badge>
    );
  };

  // Intro Screen
  if (gameState === "intro") {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-4xl">
            🎮
          </div>
          <CardTitle className="text-2xl">
            {LIFE_DECISIONS_CONFIG.name}
          </CardTitle>
          <CardDescription className="text-lg">
            {LIFE_DECISIONS_CONFIG.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Starting State */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Wallet className="w-4 h-4 text-violet-500" />
              Your Starting Point
            </h3>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 text-center">
                <div className="font-bold text-emerald-600">
                  ₹
                  {LIFE_DECISIONS_CONFIG.startingState.savings.toLocaleString()}
                </div>
                <div className="text-xs text-slate-500">Savings</div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                <div className="font-bold text-blue-600">
                  {LIFE_DECISIONS_CONFIG.startingState.creditScore}
                </div>
                <div className="text-xs text-slate-500">Credit Score</div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center">
                <div className="font-bold text-red-600">
                  ₹{LIFE_DECISIONS_CONFIG.startingState.debt.toLocaleString()}
                </div>
                <div className="text-xs text-slate-500">Debt</div>
              </div>
            </div>
          </div>

          {/* How to Play */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-3">
            <h3 className="font-semibold">How to Play</h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <Calendar className="w-4 h-4 mt-0.5 text-violet-500" />
                Play through 6 months of financial decisions
              </li>
              <li className="flex items-start gap-2">
                <Target className="w-4 h-4 mt-0.5 text-violet-500" />
                Each choice impacts your savings, debt, and credit score
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 mt-0.5 text-violet-500" />
                Handle unexpected life events along the way
              </li>
              <li className="flex items-start gap-2">
                <Trophy className="w-4 h-4 mt-0.5 text-violet-500" />
                End with the best financial health to win!
              </li>
            </ul>
          </div>

          {/* Start Button */}
          <Button
            size="lg"
            className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white"
            onClick={startGame}
          >
            <Wallet className="w-5 h-5 mr-2" />
            Start Your Financial Journey
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Playing Screen
  if (gameState === "playing" && currentDecision) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Progress & Stats */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Badge variant="outline" className="text-base px-4 py-2">
            <Calendar className="w-4 h-4 mr-2" />
            Month {currentMonth} of {LIFE_DECISIONS_CONFIG.monthsPerGame}
          </Badge>
          <Badge className="bg-emerald-100 text-emerald-700 text-base px-4 py-2">
            Score: {totalScore}
          </Badge>
        </div>

        <Progress
          value={(currentMonth / LIFE_DECISIONS_CONFIG.monthsPerGame) * 100}
          className="h-2"
        />

        {/* Financial Dashboard */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-2 text-center">
            <PiggyBank className="w-4 h-4 mx-auto mb-1 text-emerald-500" />
            <div className="text-sm font-bold text-emerald-600">
              ₹{finances.savings.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500">Savings</div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 text-center">
            <TrendingUp className="w-4 h-4 mx-auto mb-1 text-blue-500" />
            <div className="text-sm font-bold text-blue-600">
              ₹{finances.investments.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500">Invested</div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2 text-center">
            <CreditCard className="w-4 h-4 mx-auto mb-1 text-red-500" />
            <div className="text-sm font-bold text-red-600">
              ₹{finances.debt.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500">Debt</div>
          </div>
          <div className="bg-violet-50 dark:bg-violet-900/20 rounded-lg p-2 text-center">
            <Target className="w-4 h-4 mx-auto mb-1 text-violet-500" />
            <div className="text-sm font-bold text-violet-600">
              {finances.creditScore}
            </div>
            <div className="text-xs text-slate-500">Credit</div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-2 text-center">
            <Wallet className="w-4 h-4 mx-auto mb-1 text-amber-500" />
            <div className="text-sm font-bold text-amber-600">
              ₹{finances.emergencyFund.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500">Emergency</div>
          </div>
          <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-2 text-center">
            <Heart className="w-4 h-4 mx-auto mb-1 text-pink-500" />
            <div className="text-sm font-bold text-pink-600">
              {finances.happiness}%
            </div>
            <div className="text-xs text-slate-500">Happy</div>
          </div>
        </div>

        {/* Decision Card */}
        <Card>
          <CardHeader>
            <Badge variant="outline" className="w-fit mb-2">
              {currentDecision.category}
            </Badge>
            <CardTitle className="text-xl">{currentDecision.title}</CardTitle>
            <CardDescription>{currentDecision.description}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Scenario */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
              <p className="text-slate-700 dark:text-slate-300">
                {currentDecision.scenario}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {currentDecision.options.map((option, idx) => {
                const isSelected = selectedOption?.id === option.id;
                const isDisabled = showImpact && !isSelected;

                return (
                  <motion.button
                    key={option.id}
                    whileHover={!showImpact ? { scale: 1.01 } : {}}
                    whileTap={!showImpact ? { scale: 0.99 } : {}}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20"
                        : isDisabled
                          ? "border-slate-200 opacity-50 cursor-not-allowed"
                          : "border-slate-200 dark:border-slate-700 hover:border-violet-300"
                    }`}
                    onClick={() => !showImpact && handleDecision(option)}
                    disabled={isDisabled}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          isSelected
                            ? "bg-violet-500 text-white"
                            : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <div className="flex-1">
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          {option.text}
                        </span>

                        {/* Show impact after selection */}
                        {showImpact && isSelected && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-3 space-y-2"
                          >
                            <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                              {option.outcome}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <ImpactBadge
                                value={option.impact.savings}
                                label="Savings"
                              />
                              <ImpactBadge
                                value={option.impact.investments}
                                label="Invest"
                              />
                              <ImpactBadge
                                value={option.impact.debt}
                                label="Debt"
                              />
                              <ImpactBadge
                                value={option.impact.creditScore}
                                label="Credit"
                              />
                              <ImpactBadge
                                value={option.impact.emergencyFund}
                                label="Emergency"
                              />
                              <ImpactBadge
                                value={option.impact.happiness}
                                label="Happy"
                              />
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge
                                className={
                                  option.score >= 80
                                    ? "bg-emerald-500"
                                    : option.score >= 50
                                      ? "bg-amber-500"
                                      : "bg-red-500"
                                }
                              >
                                +{option.score} points
                              </Badge>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Lesson & Next */}
            <AnimatePresence>
              {showImpact && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Tip */}
                  {currentDecision.tip && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        💡 <strong>Tip:</strong> {currentDecision.tip}
                      </p>
                    </div>
                  )}

                  {/* Next Button */}
                  <Button
                    className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white"
                    onClick={handleNext}
                  >
                    {pendingEvent ? (
                      <>
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Life Event!
                      </>
                    ) : currentMonth < LIFE_DECISIONS_CONFIG.monthsPerGame ? (
                      <>
                        Next Month
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </>
                    ) : (
                      <>
                        See Results
                        <Trophy className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Life Event Screen
  if (gameState === "event" && pendingEvent) {
    return (
      <Card className="max-w-lg mx-auto">
        <CardHeader className="text-center">
          <motion.div
            className="text-5xl mb-4"
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", bounce: 0.5 }}
          >
            {pendingEvent.icon || "⚡"}
          </motion.div>
          <Badge className="mx-auto mb-2 bg-amber-100 text-amber-700">
            Life Event!
          </Badge>
          <CardTitle className="text-xl">{pendingEvent.title}</CardTitle>
          <CardDescription>{pendingEvent.description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4">
            <p className="text-slate-700 dark:text-slate-300">
              {pendingEvent.scenario}
            </p>
          </div>

          {pendingEvent.choices ? (
            <div className="space-y-3">
              {pendingEvent.choices.map((choice, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  className="w-full justify-start h-auto py-3"
                  onClick={() => handleEvent(idx)}
                >
                  {choice.text}
                </Button>
              ))}
            </div>
          ) : (
            <Button
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white"
              onClick={() => handleEvent(0)}
            >
              Continue
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Result Screen
  if (gameState === "result") {
    const grade = getFinalGrade(totalScore, finances);
    const xpEarned =
      Math.round(totalScore * 10) + LIFE_DECISIONS_CONFIG.xp.complete;

    return (
      <Card className="max-w-lg mx-auto">
        <CardHeader className="text-center">
          <motion.div
            className="text-6xl mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
          >
            {grade.emoji}
          </motion.div>
          <CardTitle className="text-2xl">Grade: {grade.letter}</CardTitle>
          <CardDescription className="text-lg">{grade.message}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Final Score */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-violet-50 dark:bg-violet-900/20 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-violet-600">
                {totalScore}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Final Score
              </div>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-emerald-600">
                +{xpEarned}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                XP Earned
              </div>
            </div>
          </div>

          {/* Final Financial State */}
          <div className="space-y-3">
            <h4 className="font-semibold">Your Final Financial State</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <span className="flex items-center gap-2">
                  <PiggyBank className="w-4 h-4 text-emerald-500" />
                  Savings
                </span>
                <span className="font-bold">
                  ₹{finances.savings.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <span className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  Investments
                </span>
                <span className="font-bold">
                  ₹{finances.investments.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <span className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-red-500" />
                  Debt
                </span>
                <span className="font-bold">
                  ₹{finances.debt.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <span className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-violet-500" />
                  Credit Score
                </span>
                <span className="font-bold">{finances.creditScore}</span>
              </div>
            </div>
          </div>

          {/* Net Worth */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-4 text-white text-center">
            <div className="text-sm opacity-90">Net Worth</div>
            <div className="text-2xl font-bold">
              ₹
              {(
                finances.savings +
                finances.investments +
                finances.emergencyFund -
                finances.debt
              ).toLocaleString()}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white"
              onClick={startGame}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Play Again
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setGameState("intro")}
            >
              Back to Menu
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
