"use client";

import { CheckCircle, Lock, Play, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

const LEVELS = [
    {
        id: 1,
        title: "Financial Foundations",
        description: "Start your journey with the basics of money management.",
        progress: 100,
        status: "completed",
        modules: ["Needs vs Wants", "The 50/30/20 Rule", "Setting Smart Goals"],
    },
    {
        id: 2,
        title: "Building Security",
        description: "Protect yourself from life's surprises.",
        progress: 40,
        status: "in-progress",
        modules: ["Emergency Funds", "Insurance Basics", "Managing Debt"],
    },
    {
        id: 3,
        title: "Growing Wealth",
        description: "Make your money work for you through investing.",
        progress: 0,
        status: "locked",
        modules: ["Power of Compounding", "Stocks vs Bonds", "Mutual Funds & SIPs"],
    },
];

export function LearningPath() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Your Learning Journey</h2>
                <span className="text-sm text-muted-foreground">Level 2 of 10</span>
            </div>

            <div className="relative space-y-8 pl-4 border-l-2 border-dashed border-zinc-200 dark:border-zinc-800 ml-4">
                {LEVELS.map((level, index) => (
                    <motion.div
                        key={level.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative pl-8"
                    >
                        {/* Status Indicator */}
                        <div className={cn(
                            "absolute -left-[21px] top-1 h-10 w-10 rounded-full border-4 border-white dark:border-zinc-950 flex items-center justify-center shadow-sm",
                            level.status === "completed" ? "bg-green-500" :
                                level.status === "in-progress" ? "bg-indigo-600" : "bg-zinc-200 dark:bg-zinc-800"
                        )}>
                            {level.status === "completed" ? <CheckCircle className="h-5 w-5 text-white" /> :
                                level.status === "in-progress" ? <Play className="h-4 w-4 text-white ml-0.5" /> :
                                    <Lock className="h-4 w-4 text-zinc-400" />}
                        </div>

                        {/* Content Card */}
                        <div className={cn(
                            "group rounded-xl border p-5 transition-all hover:shadow-md",
                            level.status === "locked" ? "opacity-60 bg-zinc-50 dark:bg-zinc-900 border-dashed" : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                        )}>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h3 className="font-semibold text-lg flex items-center gap-2">
                                        {level.title}
                                        {level.status === "in-progress" && (
                                            <span className="text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                                                Current
                                            </span>
                                        )}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mt-1">{level.description}</p>
                                </div>

                                {level.status !== "locked" && (
                                    <div className="w-full md:w-32">
                                        <div className="flex justify-between text-xs mb-1.5">
                                            <span>{level.progress}%</span>
                                        </div>
                                        <Progress value={level.progress} className="h-2" />
                                    </div>
                                )}
                            </div>

                            {level.status !== "locked" && (
                                <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 grid gap-2">
                                    {level.modules.map((module, i) => (
                                        <div key={i} className="flex items-center gap-3 text-sm p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer">
                                            <div className={cn(
                                                "h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium",
                                                level.status === "completed" || (level.status === "in-progress" && i === 0)
                                                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                    : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800"
                                            )}>
                                                {i + 1}
                                            </div>
                                            <span>{module}</span>
                                            <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground opacity-0 group-hover:opacity-100" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
