"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  INSURANCE_TYPES,
  INSURANCE_QUIZ,
  INSURANCE_CONFIG,
  INSURANCE_CALCULATORS,
} from "@/lib/insuranceModule";
import {
  Shield,
  Heart,
  Car,
  Home,
  Trophy,
  CheckCircle,
  XCircle,
  ChevronRight,
  Calculator,
  BookOpen,
  HelpCircle,
  Lightbulb,
  RotateCcw,
  Info,
} from "lucide-react";
import confetti from "canvas-confetti";

const ICON_MAP = {
  life: Shield,
  health: Heart,
  vehicle: Car,
  home: Home,
};

export default function InsuranceModule({ onComplete, onXPEarned }) {
  const [activeTab, setActiveTab] = useState("learn");
  const [selectedType, setSelectedType] = useState(null);

  // Quiz state
  const [quizState, setQuizState] = useState("intro"); // intro, playing, result
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [totalXP, setTotalXP] = useState(0);

  // Calculator state
  const [calcType, setCalcType] = useState("life");
  const [calcInputs, setCalcInputs] = useState({
    age: 30,
    annualIncome: 500000,
    dependents: 2,
    existingCover: 0,
    cityType: "metro",
    familySize: 4,
    preExisting: false,
  });
  const [calcResult, setCalcResult] = useState(null);

  const question = INSURANCE_QUIZ[currentQuestion];

  // Start quiz
  const startQuiz = () => {
    setQuizState("playing");
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setQuizAnswers([]);
    setTotalXP(0);
  };

  // Handle answer
  const handleAnswer = (optionId) => {
    if (showExplanation) return;

    setSelectedAnswer(optionId);

    const isCorrect = optionId === question.correctAnswer;
    const xpEarned = isCorrect ? question.xpReward : 0;

    setTotalXP((prev) => prev + xpEarned);
    setQuizAnswers((prev) => [
      ...prev,
      {
        questionId: question.id,
        answer: optionId,
        isCorrect,
        xpEarned,
      },
    ]);

    setShowExplanation(true);
  };

  // Next question
  const handleNext = () => {
    if (currentQuestion < INSURANCE_QUIZ.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      // Quiz complete
      setQuizState("result");

      const correctCount = quizAnswers.filter((a) => a.isCorrect).length;
      if (correctCount >= INSURANCE_QUIZ.length * 0.7) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }

      // Report XP
      const bonusXP =
        correctCount === INSURANCE_QUIZ.length
          ? INSURANCE_CONFIG.xp.perfectQuiz
          : INSURANCE_CONFIG.xp.completeQuiz;

      if (onXPEarned) {
        onXPEarned(totalXP + bonusXP);
      }

      if (onComplete) {
        onComplete({
          correct: correctCount,
          total: INSURANCE_QUIZ.length,
          xpEarned: totalXP + bonusXP,
        });
      }
    }
  };

  // Calculate insurance
  const calculateInsurance = () => {
    if (calcType === "life") {
      const { age, annualIncome, dependents, existingCover } = calcInputs;
      const yearsToRetirement = 60 - age;
      const multiplier = dependents > 0 ? 10 + dependents * 2 : 8;
      const recommended = annualIncome * multiplier;
      const gap = Math.max(0, recommended - existingCover);

      setCalcResult({
        type: "life",
        recommended,
        existing: existingCover,
        gap,
        breakdown: {
          "Income Replacement": annualIncome * yearsToRetirement * 0.3,
          "Debt Coverage": annualIncome * 2,
          "Children Education": dependents * 1500000,
          "Emergency Buffer": annualIncome * 2,
        },
      });
    } else if (calcType === "health") {
      const { cityType, familySize, age, preExisting } = calcInputs;
      const baseAmount =
        cityType === "metro" ? 1000000 : cityType === "tier1" ? 750000 : 500000;
      const familyMultiplier = Math.min(1 + (familySize - 1) * 0.25, 2);
      const ageMultiplier = age > 50 ? 1.3 : age > 40 ? 1.15 : 1;
      const preExistingMultiplier = preExisting ? 1.2 : 1;

      const recommended = Math.round(
        baseAmount * familyMultiplier * ageMultiplier * preExistingMultiplier,
      );

      setCalcResult({
        type: "health",
        recommended,
        features: [
          "Room rent waiver",
          "Cashless hospitalization",
          "Pre & post hospitalization cover",
          "Day care procedures",
          cityType === "metro" ? "Metro city network" : "Pan-India network",
        ],
      });
    }
  };

  // Learn Tab Content
  const LearnContent = () => (
    <div className="space-y-6">
      {!selectedType ? (
        <>
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold mb-2">
              Choose an Insurance Type to Learn
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Understanding insurance is crucial for financial protection
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {Object.values(INSURANCE_TYPES).map((type) => {
              const Icon = ICON_MAP[type.id] || Shield;
              return (
                <motion.button
                  key={type.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-6 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-500 transition-all text-left"
                  onClick={() => setSelectedType(type.id)}
                >
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center mb-3`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-lg mb-1">{type.name}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {type.description}
                  </p>
                </motion.button>
              );
            })}
          </div>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {(() => {
            const type = INSURANCE_TYPES[selectedType];
            const Icon = ICON_MAP[selectedType] || Shield;

            return (
              <>
                <Button
                  variant="ghost"
                  className="mb-4"
                  onClick={() => setSelectedType(null)}
                >
                  ← Back to all types
                </Button>

                <div className="flex items-start gap-4">
                  <div
                    className={`w-16 h-16 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{type.name}</h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      {type.description}
                    </p>
                  </div>
                </div>

                {/* Key Benefits */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                      Key Benefits
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {type.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-emerald-500 mt-1">✓</span>
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Coverage Types */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Info className="w-5 h-5 text-blue-500" />
                      Coverage Types
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {type.coverageTypes.map((coverage, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg"
                        >
                          <h5 className="font-semibold mb-1">
                            {coverage.name}
                          </h5>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {coverage.description}
                          </p>
                          {coverage.recommended && (
                            <Badge className="mt-2 bg-emerald-100 text-emerald-700">
                              Recommended for most
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Important Tips */}
                <Card className="border-amber-200 dark:border-amber-800">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-amber-700 dark:text-amber-400">
                      <Lightbulb className="w-5 h-5" />
                      Important Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {type.tips.map((tip, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-300"
                        >
                          <span>💡</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </>
            );
          })()}
        </motion.div>
      )}
    </div>
  );

  // Quiz Tab Content
  const QuizContent = () => {
    if (quizState === "intro") {
      return (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto text-4xl">
            📝
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">
              Insurance Knowledge Quiz
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Test your understanding of insurance concepts
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span>Questions</span>
              <span className="font-medium">{INSURANCE_QUIZ.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>XP per correct answer</span>
              <span className="font-medium">15-25 XP</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Perfect score bonus</span>
              <span className="font-medium">+100 XP</span>
            </div>
          </div>

          <Button
            size="lg"
            className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white"
            onClick={startQuiz}
          >
            <BookOpen className="w-5 h-5 mr-2" />
            Start Quiz
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      );
    }

    if (quizState === "result") {
      const correctCount = quizAnswers.filter((a) => a.isCorrect).length;
      const percentage = (correctCount / INSURANCE_QUIZ.length) * 100;
      const bonusXP =
        correctCount === INSURANCE_QUIZ.length
          ? INSURANCE_CONFIG.xp.perfectQuiz
          : INSURANCE_CONFIG.xp.completeQuiz;

      let emoji = "📚";
      let message = "Keep learning!";
      if (percentage === 100) {
        emoji = "🏆";
        message = "Perfect score! You're an insurance expert!";
      } else if (percentage >= 80) {
        emoji = "🌟";
        message = "Excellent knowledge!";
      } else if (percentage >= 60) {
        emoji = "👍";
        message = "Good understanding!";
      }

      return (
        <div className="text-center space-y-6">
          <motion.div
            className="text-6xl"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
          >
            {emoji}
          </motion.div>

          <div>
            <h3 className="text-xl font-semibold mb-2">Quiz Complete!</h3>
            <p className="text-slate-600 dark:text-slate-400">{message}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4">
              <div className="text-3xl font-bold text-emerald-600">
                {correctCount}/{INSURANCE_QUIZ.length}
              </div>
              <div className="text-sm text-slate-600">Correct</div>
            </div>
            <div className="bg-violet-50 dark:bg-violet-900/20 rounded-xl p-4">
              <div className="text-3xl font-bold text-violet-600">
                +{totalXP + bonusXP}
              </div>
              <div className="text-sm text-slate-600">XP Earned</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {quizAnswers.map((ans, idx) => (
              <div
                key={idx}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                  ans.isCorrect ? "bg-emerald-500" : "bg-red-500"
                }`}
              >
                {idx + 1}
              </div>
            ))}
          </div>

          <Button
            className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white"
            onClick={startQuiz}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      );
    }

    // Playing state
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-600 dark:text-slate-400">
            Question {currentQuestion + 1} of {INSURANCE_QUIZ.length}
          </span>
          <Badge className="bg-emerald-100 text-emerald-700">
            +{totalXP} XP
          </Badge>
        </div>

        <Progress
          value={((currentQuestion + 1) / INSURANCE_QUIZ.length) * 100}
          className="h-2"
        />

        <Card>
          <CardHeader>
            <Badge variant="outline" className="w-fit mb-2">
              {question.category}
            </Badge>
            <CardTitle className="text-lg">{question.question}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {question.options.map((option, idx) => {
              const optionId = String.fromCharCode(97 + idx);
              const isSelected = selectedAnswer === optionId;
              const isCorrect = optionId === question.correctAnswer;
              const showResult = showExplanation;

              let optionClass =
                "border-slate-200 dark:border-slate-700 hover:border-slate-300";
              if (showResult) {
                if (isCorrect) {
                  optionClass =
                    "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20";
                } else if (isSelected && !isCorrect) {
                  optionClass = "border-red-500 bg-red-50 dark:bg-red-900/20";
                }
              } else if (isSelected) {
                optionClass =
                  "border-violet-500 bg-violet-50 dark:bg-violet-900/20";
              }

              return (
                <motion.button
                  key={optionId}
                  whileHover={!showResult ? { scale: 1.01 } : {}}
                  whileTap={!showResult ? { scale: 0.99 } : {}}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${optionClass}`}
                  onClick={() => !showResult && handleAnswer(optionId)}
                  disabled={showResult}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        showResult && isCorrect
                          ? "bg-emerald-500 text-white"
                          : showResult && isSelected && !isCorrect
                            ? "bg-red-500 text-white"
                            : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      {showResult && isCorrect ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : showResult && isSelected && !isCorrect ? (
                        <XCircle className="w-5 h-5" />
                      ) : (
                        optionId.toUpperCase()
                      )}
                    </div>
                    <span className="flex-1">{option}</span>
                  </div>
                </motion.button>
              );
            })}

            <AnimatePresence>
              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      💡 {question.explanation}
                    </p>
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white"
                    onClick={handleNext}
                  >
                    {currentQuestion < INSURANCE_QUIZ.length - 1 ? (
                      <>
                        Next Question
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
  };

  // Calculator Tab Content
  const CalculatorContent = () => (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h3 className="text-xl font-semibold mb-2">Insurance Calculator</h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          Find out how much coverage you need
        </p>
      </div>

      <div className="flex gap-2 justify-center">
        <Button
          variant={calcType === "life" ? "default" : "outline"}
          onClick={() => {
            setCalcType("life");
            setCalcResult(null);
          }}
        >
          <Shield className="w-4 h-4 mr-2" />
          Life
        </Button>
        <Button
          variant={calcType === "health" ? "default" : "outline"}
          onClick={() => {
            setCalcType("health");
            setCalcResult(null);
          }}
        >
          <Heart className="w-4 h-4 mr-2" />
          Health
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-6">
          {calcType === "life" ? (
            <>
              <div className="space-y-2">
                <Label>Your Age: {calcInputs.age}</Label>
                <Slider
                  value={[calcInputs.age]}
                  onValueChange={([v]) =>
                    setCalcInputs((prev) => ({ ...prev, age: v }))
                  }
                  min={18}
                  max={60}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label>Annual Income (₹)</Label>
                <Input
                  type="number"
                  value={calcInputs.annualIncome}
                  onChange={(e) =>
                    setCalcInputs((prev) => ({
                      ...prev,
                      annualIncome: parseInt(e.target.value) || 0,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Number of Dependents: {calcInputs.dependents}</Label>
                <Slider
                  value={[calcInputs.dependents]}
                  onValueChange={([v]) =>
                    setCalcInputs((prev) => ({ ...prev, dependents: v }))
                  }
                  min={0}
                  max={5}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label>Existing Life Cover (₹)</Label>
                <Input
                  type="number"
                  value={calcInputs.existingCover}
                  onChange={(e) =>
                    setCalcInputs((prev) => ({
                      ...prev,
                      existingCover: parseInt(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label>City Type</Label>
                <div className="flex gap-2">
                  {["metro", "tier1", "tier2"].map((city) => (
                    <Button
                      key={city}
                      variant={
                        calcInputs.cityType === city ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        setCalcInputs((prev) => ({ ...prev, cityType: city }))
                      }
                    >
                      {city === "metro"
                        ? "Metro"
                        : city === "tier1"
                          ? "Tier 1"
                          : "Tier 2/3"}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Family Size: {calcInputs.familySize}</Label>
                <Slider
                  value={[calcInputs.familySize]}
                  onValueChange={([v]) =>
                    setCalcInputs((prev) => ({ ...prev, familySize: v }))
                  }
                  min={1}
                  max={6}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label>Eldest Member Age: {calcInputs.age}</Label>
                <Slider
                  value={[calcInputs.age]}
                  onValueChange={([v]) =>
                    setCalcInputs((prev) => ({ ...prev, age: v }))
                  }
                  min={18}
                  max={70}
                  step={1}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="preExisting"
                  checked={calcInputs.preExisting}
                  onChange={(e) =>
                    setCalcInputs((prev) => ({
                      ...prev,
                      preExisting: e.target.checked,
                    }))
                  }
                  className="rounded"
                />
                <Label htmlFor="preExisting">
                  Pre-existing conditions in family
                </Label>
              </div>
            </>
          )}

          <Button
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
            onClick={calculateInsurance}
          >
            <Calculator className="w-4 h-4 mr-2" />
            Calculate
          </Button>

          <AnimatePresence>
            {calcResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-6 text-white text-center">
                  <div className="text-sm opacity-90">Recommended Cover</div>
                  <div className="text-3xl font-bold">
                    ₹{calcResult.recommended.toLocaleString()}
                  </div>
                </div>

                {calcResult.type === "life" && (
                  <>
                    {calcResult.gap > 0 && (
                      <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4">
                        <div className="text-sm text-amber-700 dark:text-amber-300">
                          ⚠️ You have a coverage gap of{" "}
                          <strong>₹{calcResult.gap.toLocaleString()}</strong>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">
                        Coverage Breakdown
                      </h4>
                      {Object.entries(calcResult.breakdown).map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className="flex justify-between text-sm p-2 bg-slate-50 dark:bg-slate-800/50 rounded"
                          >
                            <span>{key}</span>
                            <span className="font-medium">
                              ₹{value.toLocaleString()}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </>
                )}

                {calcResult.type === "health" && calcResult.features && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">
                      Look for these features
                    </h4>
                    <ul className="space-y-1">
                      {calcResult.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-2 text-sm"
                        >
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center border-b">
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-3 text-3xl">
          🛡️
        </div>
        <CardTitle className="text-xl">{INSURANCE_CONFIG.name}</CardTitle>
        <CardDescription>{INSURANCE_CONFIG.description}</CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="learn">
              <BookOpen className="w-4 h-4 mr-2" />
              Learn
            </TabsTrigger>
            <TabsTrigger value="quiz">
              <HelpCircle className="w-4 h-4 mr-2" />
              Quiz
            </TabsTrigger>
            <TabsTrigger value="calculator">
              <Calculator className="w-4 h-4 mr-2" />
              Calculator
            </TabsTrigger>
          </TabsList>

          <TabsContent value="learn">
            <LearnContent />
          </TabsContent>

          <TabsContent value="quiz">
            <QuizContent />
          </TabsContent>

          <TabsContent value="calculator">
            <CalculatorContent />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
