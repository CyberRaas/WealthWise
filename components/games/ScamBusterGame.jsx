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
  SCAM_SCENARIOS,
  SCAM_CATEGORIES,
  SCAM_BUSTER_CONFIG,
  getScenarios,
} from "@/lib/scamBusterGame";
import { GameEngine, calculateGameResult } from "@/lib/gameEngine";
import { useSpeech } from "@/hooks/useSpeech";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronRight,
  RotateCcw,
  Trophy,
  Lightbulb,
  Clock,
  Zap,
  Target,
  BookOpen,
  Volume2,
  VolumeX,
} from "lucide-react";
import confetti from "canvas-confetti";

export default function ScamBusterGame({ onComplete, onXPEarned, userTrack }) {
  const [gameState, setGameState] = useState("intro"); // intro, playing, feedback, result
  const [scenarios, setScenarios] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [showLesson, setShowLesson] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [totalXP, setTotalXP] = useState(0);
  const { voiceEnabled, toggleVoice, speak, stop } = useSpeech();

  // Initialize game
  const startGame = () => {
    const gameScenarios = getScenarios({
      limit: SCAM_BUSTER_CONFIG.scenariosPerGame,
      random: true,
      track: userTrack || null,
    });
    setScenarios(gameScenarios);
    setCurrentIndex(0);
    setAnswers([]);
    setSelectedOption(null);
    setShowLesson(false);
    setTotalXP(0);
    setGameState("playing");
    setTimeLeft(60);
  };

  // Narrate scenario when it changes
  useEffect(() => {
    if (gameState === 'playing' && currentScenario && voiceEnabled) {
      speak(currentScenario.title + '. ' + currentScenario.scenario);
    }
  }, [currentIndex, gameState, voiceEnabled]);

  // Timer effect
  useEffect(() => {
    if (gameState !== "playing" || showLesson) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up - auto select wrong answer
          handleAnswer(null);
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, showLesson, currentIndex]);

  const currentScenario = scenarios[currentIndex];

  const handleAnswer = (optionId) => {
    if (selectedOption !== null) return; // Already answered

    setSelectedOption(optionId);

    const option = currentScenario?.options.find((o) => o.id === optionId);
    const isCorrect = option?.isCorrect || false;

    // Calculate XP for this answer
    const xpEarned = isCorrect ? currentScenario.xpReward : 0;
    setTotalXP((prev) => prev + xpEarned);

    setAnswers((prev) => [
      ...prev,
      {
        scenarioId: currentScenario.id,
        optionId,
        isCorrect,
        xpEarned,
      },
    ]);

    setGameState("feedback");
  };

  // Narrate feedback
  useEffect(() => {
    if (gameState === 'feedback' && voiceEnabled) {
      const lastAnswer = answers[answers.length - 1];
      if (lastAnswer?.isCorrect) {
        speak('Correct!');
      } else {
        speak('Incorrect.');
      }
    }
  }, [gameState, answers.length]);

  const handleNext = () => {
    if (currentIndex < scenarios.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setShowLesson(false);
      setGameState("playing");
      setTimeLeft(60);
    } else {
      // Game complete
      setGameState("result");

      // Celebrate if good score
      const correctCount = answers.filter((a) => a.isCorrect).length;
      if (correctCount >= scenarios.length * 0.6) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }

      // Report XP earned
      if (onXPEarned) {
        const bonusXP =
          correctCount === scenarios.length
            ? SCAM_BUSTER_CONFIG.xp.perfect
            : SCAM_BUSTER_CONFIG.xp.complete;
        onXPEarned(totalXP + bonusXP);
      }

      if (onComplete) {
        onComplete({
          correct: correctCount,
          total: scenarios.length,
          xpEarned: totalXP,
        });
      }
    }
  };

  const getResultMessage = () => {
    const correctCount = answers.filter((a) => a.isCorrect).length;
    const percentage = (correctCount / scenarios.length) * 100;

    if (percentage === 100)
      return {
        emoji: "🏆",
        title: "Scam Buster Master!",
        message: "You identified ALL scams correctly!",
      };
    if (percentage >= 80)
      return {
        emoji: "🌟",
        title: "Excellent!",
        message: "You have sharp fraud detection skills!",
      };
    if (percentage >= 60)
      return {
        emoji: "👍",
        title: "Good Job!",
        message: "You can spot most scams. Keep learning!",
      };
    if (percentage >= 40)
      return {
        emoji: "📚",
        title: "Keep Learning",
        message: "Review the lessons to improve your skills.",
      };
    return {
      emoji: "⚠️",
      title: "Stay Alert!",
      message: "Scammers are tricky. Practice more to protect yourself.",
    };
  };

  // Intro Screen
  if (gameState === "intro") {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-4xl">
            🕵️
          </div>
          <CardTitle className="text-2xl">{SCAM_BUSTER_CONFIG.name}</CardTitle>
          <CardDescription className="text-lg">
            {SCAM_BUSTER_CONFIG.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* How to Play */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-500" />
              How to Play
            </h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">1.</span>
                Read real-world scam scenarios
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">2.</span>
                Choose how you would respond
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">3.</span>
                See the consequences of your choice
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">4.</span>
                Learn the key lesson to stay safe
              </li>
            </ul>
          </div>

          {/* Scam Types */}
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Scam Types You'll Learn About
            </h3>
            <div className="flex flex-wrap gap-2">
              {Object.values(SCAM_CATEGORIES)
                .slice(0, 6)
                .map((cat) => (
                  <Badge key={cat.id} variant="outline" className="text-xs">
                    {cat.icon} {cat.name}
                  </Badge>
                ))}
            </div>
          </div>

          {/* Start Button */}
          <Button
            size="lg"
            className="w-full bg-gradient-to-r from-red-500 to-orange-600 text-white"
            onClick={startGame}
          >
            <Shield className="w-5 h-5 mr-2" />
            Start Scam Busting
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
          {/* Voice Toggle */}
          <div className="flex justify-center">
            <button
              onClick={toggleVoice}
              aria-label={voiceEnabled ? 'Disable voice narration' : 'Enable voice narration'}
              aria-pressed={voiceEnabled}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                voiceEnabled
                  ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              {voiceEnabled ? '🔊 Voice ON' : '🔇 Voice OFF'}
            </button>
          </div>
          <p className="text-xs text-center text-slate-500">
            {SCAM_BUSTER_CONFIG.scenariosPerGame} scenarios • Earn XP for
            correct answers
          </p>
        </CardContent>
      </Card>
    );
  }

  // Playing / Feedback Screen
  if (gameState === "playing" || gameState === "feedback") {
    const selectedOpt = currentScenario?.options.find(
      (o) => o.id === selectedOption,
    );

    return (
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Progress Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-600 dark:text-slate-400">
                Question {currentIndex + 1} of {scenarios.length}
              </span>
              <span className="font-medium text-emerald-600">
                +{totalXP} XP
              </span>
            </div>
            <Progress
              value={((currentIndex + 1) / scenarios.length) * 100}
              className="h-2"
            />
          </div>

          {/* Timer */}
          {gameState === "playing" && (
            <div className="flex items-center gap-2">
              <button
                onClick={toggleVoice}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title={voiceEnabled ? 'Voice ON' : 'Voice OFF'}
                aria-label={voiceEnabled ? 'Disable voice narration' : 'Enable voice narration'}
                aria-pressed={voiceEnabled}
              >
                {voiceEnabled ? <Volume2 className="w-4 h-4 text-emerald-500" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
              </button>
              <div
                className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                  timeLeft < 15
                    ? "bg-red-100 text-red-600"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                <Clock className="w-4 h-4" />
                <span className="font-mono font-medium">{timeLeft}s</span>
              </div>
            </div>
          )}
        </div>

        {/* Scenario Card */}
        <Card role="region" aria-label={`Scam scenario ${currentIndex + 1} of ${scenarios.length}`}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                {SCAM_CATEGORIES[currentScenario?.category]?.icon}{" "}
                {SCAM_CATEGORIES[currentScenario?.category]?.name}
              </Badge>
              <Badge variant="outline">{currentScenario?.difficulty}</Badge>
            </div>
            <CardTitle className="text-xl mt-3">
              {currentScenario?.title}
            </CardTitle>
            {currentScenario?.titleHindi && (
              <p className="text-sm text-slate-500 dark:text-slate-400 italic mt-1">{currentScenario.titleHindi}</p>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Scenario Text */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line">
                {currentScenario?.scenario}
              </p>
              {currentScenario?.scenarioHindi && (
                <p className="text-sm text-slate-500 dark:text-slate-400 italic mt-2">{currentScenario.scenarioHindi}</p>
              )}
            </div>

            {/* Question */}
            <div>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                {currentScenario?.question}
              </h3>
              {currentScenario?.questionHindi && (
                <p className="text-sm text-slate-500 dark:text-slate-400 italic -mt-2 mb-4">{currentScenario.questionHindi}</p>
              )}

              {/* Options */}
              <div className="space-y-3" role="group" aria-label="Answer options">
                {currentScenario?.options.map((option) => {
                  const isSelected = selectedOption === option.id;
                  const showResult = gameState === "feedback";
                  const isCorrect = option.isCorrect;

                  let optionClass =
                    "border-slate-200 dark:border-slate-700 hover:border-slate-300";
                  if (showResult) {
                    if (isCorrect) {
                      optionClass =
                        "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20";
                    } else if (isSelected && !isCorrect) {
                      optionClass =
                        "border-red-500 bg-red-50 dark:bg-red-900/20";
                    }
                  } else if (isSelected) {
                    optionClass =
                      "border-blue-500 bg-blue-50 dark:bg-blue-900/20";
                  }

                  return (
                    <motion.button
                      key={option.id}
                      whileHover={!showResult ? { scale: 1.01 } : {}}
                      whileTap={!showResult ? { scale: 0.99 } : {}}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${optionClass} ${
                        showResult ? "cursor-default" : "cursor-pointer"
                      }`}
                      onClick={() => !showResult && handleAnswer(option.id)}
                      disabled={showResult}
                      aria-label={`Option ${option.id.toUpperCase()}: ${option.text}${showResult && isCorrect ? ' (Correct answer)' : ''}${showResult && isSelected && !isCorrect ? ' (Your incorrect answer)' : ''}`}
                      aria-pressed={isSelected}
                    >
                      <div className="flex items-start gap-3">
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
                            option.id.toUpperCase()
                          )}
                        </div>
                        <span className="flex-1 text-slate-700 dark:text-slate-300">
                          {option.text}
                          {option.textHindi && (
                            <span className="block text-xs text-slate-500 dark:text-slate-400 italic mt-1">{option.textHindi}</span>
                          )}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Feedback Section */}
            <AnimatePresence>
              {gameState === "feedback" && selectedOpt && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                  role="alert"
                  aria-live="assertive"
                >
                  {/* Consequence */}
                  <div
                    className={`rounded-xl p-4 ${
                      selectedOpt.isCorrect
                        ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800"
                        : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {selectedOpt.isCorrect ? (
                        <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p
                          className={`font-semibold ${selectedOpt.isCorrect ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"}`}
                        >
                          {selectedOpt.isCorrect
                            ? "✅ Correct!"
                            : "❌ Wrong Choice!"}
                        </p>
                        <p className="text-sm mt-1 text-slate-600 dark:text-slate-300">
                          {selectedOpt.consequence}
                        </p>
                        {selectedOpt.consequenceHindi && (
                          <p className="text-xs mt-1 text-slate-500 dark:text-slate-400 italic">{selectedOpt.consequenceHindi}</p>
                        )}
                        {selectedOpt.isCorrect && (
                          <p className="text-sm mt-2 font-medium text-emerald-600">
                            +{currentScenario.xpReward} XP earned!
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Lesson Toggle */}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowLesson(!showLesson)}
                  >
                    <Lightbulb className="w-4 h-4 mr-2 text-amber-500" />
                    {showLesson ? "Hide" : "Show"} Key Lesson
                  </Button>

                  {/* Lesson */}
                  <AnimatePresence>
                    {showLesson && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800"
                      >
                        <p className="font-medium text-amber-800 dark:text-amber-300">
                          {currentScenario.lesson}
                        </p>
                        {currentScenario.lessonHindi && (
                          <p className="text-sm mt-1 text-amber-700/80 dark:text-amber-400/80 italic">{currentScenario.lessonHindi}</p>
                        )}

                        {currentScenario.tips && (
                          <div className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-800">
                            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-2">
                              Quick Tips:
                            </p>
                            <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                              {currentScenario.tips.map((tip, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2"
                                >
                                  <span>•</span>
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Next Button */}
                  <Button
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                    onClick={handleNext}
                  >
                    {currentIndex < scenarios.length - 1 ? (
                      <>
                        Next Scenario
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

  // Result Screen
  if (gameState === "result") {
    const result = getResultMessage();
    const correctCount = answers.filter((a) => a.isCorrect).length;
    const bonusXP =
      correctCount === scenarios.length
        ? SCAM_BUSTER_CONFIG.xp.perfect
        : SCAM_BUSTER_CONFIG.xp.complete;
    const finalXP = totalXP + bonusXP;

    return (
      <Card className="max-w-lg mx-auto">
        <CardHeader className="text-center">
          <motion.div
            className="text-6xl mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
          >
            {result.emoji}
          </motion.div>
          <CardTitle className="text-2xl">{result.title}</CardTitle>
          <CardDescription className="text-lg">
            {result.message}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Score */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-emerald-600">
                {correctCount}/{scenarios.length}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Correct Answers
              </div>
            </div>
            <div className="bg-violet-50 dark:bg-violet-900/20 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-violet-600">
                +{finalXP}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                XP Earned
              </div>
            </div>
          </div>

          {/* XP Breakdown */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-2">
            <h4 className="font-semibold text-sm">XP Breakdown</h4>
            <div className="flex justify-between text-sm">
              <span>Correct Answers</span>
              <span className="font-medium">+{totalXP}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Completion Bonus</span>
              <span className="font-medium">+{bonusXP}</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-emerald-600">+{finalXP} XP</span>
            </div>
          </div>

          {/* Answer Review */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Your Answers</h4>
            <div className="flex gap-2 flex-wrap">
              {answers.map((ans, idx) => (
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
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
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
              <BookOpen className="w-4 h-4 mr-2" />
              Back to Menu
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
