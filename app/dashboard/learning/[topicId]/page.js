"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TopicQuiz } from "@/components/education/TopicQuiz";
import { getTopicById } from "@/lib/learningContent";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { MarkdownRenderer } from "@/components/education/MarkdownRenderer";
import toast from "react-hot-toast";

export default function TopicDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [topic, setTopic] = useState(null);
    const [showQuiz, setShowQuiz] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkProgress = async () => {
            try {
                const res = await fetch("/api/learning/progress");
                const data = await res.json();
                if (data.success) {
                    const completed = data.progress.find(p => p.topicId === params.topicId);
                    if (completed) {
                        setIsCompleted(true);
                    }
                }
            } catch (err) {
                console.error("Failed to check progress", err);
            } finally {
                setLoading(false);
            }
        };

        const topicData = getTopicById(params.topicId);
        if (topicData) {
            setTopic(topicData);
        }

        // Check if already completed
        checkProgress();
    }, [params.topicId]);

    const handleQuizComplete = async (score, total) => {
        const passed = score >= Math.ceil(total / 2);

        if (passed) {
            try {
                const res = await fetch("/api/learning/progress", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        topicId: params.topicId,
                        quizScore: score,
                        totalQuestions: total
                    })
                });

                if (res.ok) {
                    setIsCompleted(true);
                    toast.success("Topic completed! Check your achievements!");
                }
            } catch (err) {
                console.error("Failed to save progress", err);
                toast.error("Failed to save progress");
            }
        }
    };

    if (!topic && !loading) {
        return (
            <DashboardLayout title="Topic Not Found">
                <div className="text-center py-12">
                    <p className="text-zinc-500 dark:text-zinc-400">Topic not found.</p>
                    <Button onClick={() => router.push("/dashboard/learning")} className="mt-4">
                        Back to Learning Hub
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    if (loading || !topic) {
        return (
            <DashboardLayout title="Loading...">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-700 rounded" />
                    <div className="h-64 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title={topic.title}>
            <div className="w-full space-y-6">
                {/* Back button */}
                <Button
                    variant="ghost"
                    onClick={() => router.push("/dashboard/learning")}
                    className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Learning Hub
                </Button>

                {/* Header */}
                <div className="flex items-center gap-4">
                    <span className="text-5xl">{topic.emoji}</span>
                    <div>
                        <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                            {topic.category}
                        </span>
                        <h1 className="text-3xl font-bold dark:text-white">{topic.title}</h1>
                        {isCompleted && (
                            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 mt-1">
                                <CheckCircle className="h-4 w-4" />
                                <span className="text-sm font-medium">Completed</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Content Card */}
                <Card className="border-zinc-200 dark:border-zinc-800">
                    <CardContent className="pt-6">
                        {!showQuiz ? (
                            <>
                                <div className="max-w-none">
                                    <MarkdownRenderer content={topic.content} />
                                </div>

                                <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                                            <BookOpen className="h-5 w-5" />
                                            <span>Ready to test your knowledge?</span>
                                        </div>
                                        <Button
                                            onClick={() => setShowQuiz(true)}
                                            className="bg-indigo-600 hover:bg-indigo-700"
                                        >
                                            {isCompleted ? "Retake Quiz" : "Take Quiz"}
                                        </Button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold dark:text-white">Quiz: {topic.title}</h3>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowQuiz(false)}
                                    >
                                        Back to Content
                                    </Button>
                                </div>
                                <TopicQuiz
                                    questions={topic.quiz}
                                    topicId={topic.id}
                                    onComplete={handleQuizComplete}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
