"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, BookOpen, Trophy, CheckCircle, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { LEARNING_TOPICS } from "@/lib/learningContent";

export default function LearningPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [completedTopics, setCompletedTopics] = useState([]);
    const [achievements, setAchievements] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProgress();
    }, []);

    const fetchProgress = async () => {
        try {
            const [progressRes, achievementsRes] = await Promise.all([
                fetch("/api/learning/progress"),
                fetch("/api/learning/achievements")
            ]);

            const progressData = await progressRes.json();
            const achievementsData = await achievementsRes.json();

            if (progressData.success) {
                setCompletedTopics(progressData.progress.map(p => p.topicId));
            }
            if (achievementsData.success) {
                setAchievements(achievementsData);
            }
        } catch (err) {
            console.error("Failed to fetch learning data", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredTopics = LEARNING_TOPICS.filter(topic =>
        topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const completionPercentage = achievements?.stats?.completionPercentage || 0;

    return (
        <DashboardLayout title="Learning Hub">
            <div className="space-y-6">
                {/* Header with Progress */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                            <BookOpen className="h-7 w-7 text-indigo-600" />
                            Financial Learning Hub
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                            Master personal finance concepts with structured lessons and quizzes
                        </p>
                    </div>

                    {/* Achievement Summary */}
                    {!loading && achievements && (
                        <Card className="border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20">
                            <CardContent className="py-3 px-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <Trophy className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                        <span className="text-sm font-medium dark:text-white">
                                            {achievements.stats.completedTopics}/{achievements.stats.totalTopics} Topics
                                        </span>
                                    </div>
                                    <div className="w-24">
                                        <Progress value={completionPercentage} className="h-2 bg-indigo-200 dark:bg-indigo-800" />
                                    </div>
                                    <div className="flex gap-1">
                                        {achievements.earnedAchievements.map(a => (
                                            <span key={a.id} title={a.name} className="text-xl">{a.emoji}</span>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search topics..."
                        className="pl-10 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700"
                    />
                </div>

                {/* Topics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTopics.map((topic) => {
                        const isCompleted = completedTopics.includes(topic.id);

                        return (
                            <Card
                                key={topic.id}
                                className={`group cursor-pointer transition-all hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-700 ${isCompleted ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-900/10" : ""
                                    }`}
                                onClick={() => router.push(`/dashboard/learning/${topic.id}`)}
                            >
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <span className="text-4xl">{topic.emoji}</span>
                                        {isCompleted && (
                                            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-full">
                                                <CheckCircle className="h-3.5 w-3.5" />
                                                <span className="text-xs font-medium">Done</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                                            {topic.category}
                                        </span>
                                        <h3 className="font-bold text-lg dark:text-zinc-100 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                            {topic.title}
                                        </h3>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
                                            {topic.shortDesc}
                                        </p>
                                    </div>

                                    <div className="mt-4 flex items-center justify-between">
                                        <span className="text-xs text-zinc-400 dark:text-zinc-500">
                                            {topic.quiz.length} quiz questions
                                        </span>
                                        <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {filteredTopics.length === 0 && (
                    <div className="text-center py-12">
                        <Search className="h-12 w-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
                        <p className="text-zinc-500 dark:text-zinc-400">No topics found matching &quot;{searchQuery}&quot;</p>
                    </div>
                )}

                {/* Next Achievement */}
                {!loading && achievements?.nextAchievement && (
                    <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
                        <CardContent className="py-4">
                            <div className="flex items-center gap-4">
                                <span className="text-3xl opacity-50">{achievements.nextAchievement.emoji}</span>
                                <div className="flex-1">
                                    <h4 className="font-semibold dark:text-white">
                                        Next: {achievements.nextAchievement.name}
                                    </h4>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                        Complete {achievements.nextAchievement.remaining} more topic{achievements.nextAchievement.remaining > 1 ? 's' : ''} to unlock!
                                    </p>
                                </div>
                                <Sparkles className="h-6 w-6 text-amber-500" />
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
}
