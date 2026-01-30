"use client";

import { useState } from "react";
import { CheckCircle, XCircle, ArrowRight, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export function TopicQuiz({ questions, topicId, onComplete }) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);
    const [quizComplete, setQuizComplete] = useState(false);

    const question = questions[currentQuestion];
    const isCorrect = selectedAnswer === question?.correctIndex;

    const handleAnswerSelect = (index) => {
        if (showResult) return;
        setSelectedAnswer(index);
    };

    const handleSubmit = () => {
        if (selectedAnswer === null) return;

        setShowResult(true);
        if (isCorrect) {
            setScore((prev) => prev + 1);
        }
    };

    const handleNext = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion((prev) => prev + 1);
            setSelectedAnswer(null);
            setShowResult(false);
        } else {
            // Quiz complete
            const finalScore = score + (isCorrect ? 1 : 0);
            setQuizComplete(true);
            onComplete?.(finalScore, questions.length);
        }
    };

    if (quizComplete) {
        const finalScore = score;
        const passed = finalScore >= Math.ceil(questions.length / 2);

        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
            >
                <div
                    className={cn(
                        "w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center",
                        passed
                            ? "bg-emerald-100 dark:bg-emerald-900/30"
                            : "bg-amber-100 dark:bg-amber-900/30"
                    )}
                >
                    {passed ? (
                        <Trophy className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                        <XCircle className="h-10 w-10 text-amber-600 dark:text-amber-400" />
                    )}
                </div>

                <h3 className="text-2xl font-bold mb-2 dark:text-white">
                    {passed ? "Great Job!" : "Keep Learning!"}
                </h3>

                <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-4">
                    You scored{" "}
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        {finalScore}/{questions.length}
                    </span>
                </p>

                {passed ? (
                    <p className="text-emerald-600 dark:text-emerald-400 font-medium">
                        🎉 Topic completed! Check your trophies on the dashboard.
                    </p>
                ) : (
                    <p className="text-amber-600 dark:text-amber-400">
                        Review the material and try again to earn completion.
                    </p>
                )}
            </motion.div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Progress */}
            <div className="flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
                <span>
                    Question {currentQuestion + 1} of {questions.length}
                </span>
                <span>Score: {score}</span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2">
                <div
                    className="bg-indigo-600 h-2 rounded-full transition-all"
                    style={{
                        width: `${((currentQuestion + 1) / questions.length) * 100}%`,
                    }}
                />
            </div>

            {/* Question */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentQuestion}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                >
                    <h4 className="text-lg font-semibold dark:text-white">
                        {question.question}
                    </h4>

                    <div className="space-y-3">
                        {question.options.map((option, index) => {
                            const isSelected = selectedAnswer === index;
                            const isCorrectAnswer = index === question.correctIndex;

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleAnswerSelect(index)}
                                    disabled={showResult}
                                    className={cn(
                                        "w-full p-4 rounded-lg border-2 text-left transition-all",
                                        "hover:border-indigo-400 dark:hover:border-indigo-600",
                                        isSelected && !showResult &&
                                        "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20",
                                        !isSelected && !showResult &&
                                        "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800",
                                        showResult && isCorrectAnswer &&
                                        "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20",
                                        showResult && isSelected && !isCorrectAnswer &&
                                        "border-red-500 bg-red-50 dark:bg-red-900/20"
                                    )}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="dark:text-zinc-100">{option}</span>
                                        {showResult && isCorrectAnswer && (
                                            <CheckCircle className="h-5 w-5 text-emerald-600" />
                                        )}
                                        {showResult && isSelected && !isCorrectAnswer && (
                                            <XCircle className="h-5 w-5 text-red-600" />
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
                {!showResult ? (
                    <Button
                        onClick={handleSubmit}
                        disabled={selectedAnswer === null}
                        className="bg-indigo-600 hover:bg-indigo-700"
                    >
                        Check Answer
                    </Button>
                ) : (
                    <Button
                        onClick={handleNext}
                        className="bg-indigo-600 hover:bg-indigo-700"
                    >
                        {currentQuestion < questions.length - 1 ? (
                            <>
                                Next <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                        ) : (
                            "Complete Quiz"
                        )}
                    </Button>
                )}
            </div>
        </div>
    );
}
