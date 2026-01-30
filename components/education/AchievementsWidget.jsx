"use client";

import { useState, useEffect } from "react";
import { Trophy, Star, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function AchievementsWidget({ className }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAchievements();
    }, []);

    const fetchAchievements = async () => {
        try {
            const res = await fetch("/api/learning/achievements");
            const result = await res.json();
            if (result.success) {
                setData(result);
            }
        } catch (err) {
            console.error("Failed to fetch achievements", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Card className={cn("animate-pulse", className)}>
                <CardHeader className="pb-2">
                    <div className="h-5 w-32 bg-zinc-200 dark:bg-zinc-700 rounded" />
                </CardHeader>
                <CardContent>
                    <div className="h-16 bg-zinc-100 dark:bg-zinc-800 rounded" />
                </CardContent>
            </Card>
        );
    }

    if (!data) return null;

    const { stats, earnedAchievements, nextAchievement } = data;

    return (
        <Card className={cn("border-zinc-200 dark:border-zinc-700", className)}>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 dark:text-white">
                    <Trophy className="h-4 w-4 text-amber-500" />
                    Learning Achievements
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Progress */}
                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-zinc-600 dark:text-zinc-400">
                            {stats.completedTopics} of {stats.totalTopics} topics
                        </span>
                        <span className="font-medium text-indigo-600 dark:text-indigo-400">
                            {stats.completionPercentage}%
                        </span>
                    </div>
                    <Progress value={stats.completionPercentage} className="h-2" />
                </div>

                {/* Earned Badges */}
                {earnedAchievements.length > 0 ? (
                    <div className="flex items-center gap-3">
                        {earnedAchievements.map((achievement) => (
                            <div
                                key={achievement.id}
                                className="flex flex-col items-center"
                                title={achievement.description}
                            >
                                <span className="text-2xl">{achievement.emoji}</span>
                                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                                    {achievement.name.split(" ")[0]}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-2">
                        <Target className="h-8 w-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-1" />
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            Complete topics to earn badges!
                        </p>
                    </div>
                )}

                {/* Next Achievement */}
                {nextAchievement && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 flex items-center gap-3">
                        <span className="text-xl opacity-50">{nextAchievement.emoji}</span>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium dark:text-white truncate">
                                Next: {nextAchievement.name}
                            </p>
                            <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                                {nextAchievement.remaining} more to go
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
