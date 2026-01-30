import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import LearningProgress from "@/models/LearningProgress";
import { LEARNING_TOPICS } from "@/lib/learningContent";

// Achievement tiers
const ACHIEVEMENTS = [
    { id: "bronze", name: "Bronze Learner", emoji: "🥉", requiredTopics: 2, description: "Complete 2 topics" },
    { id: "silver", name: "Silver Scholar", emoji: "🥈", requiredTopics: 4, description: "Complete 4 topics" },
    { id: "gold", name: "Gold Master", emoji: "🥇", requiredTopics: 6, description: "Complete all topics" },
];

// GET: Calculate and return achievements
export async function GET(req) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const completedTopics = await LearningProgress.countDocuments({
            userId: session.user.id
        });

        const totalTopics = LEARNING_TOPICS.length;

        // Calculate earned achievements
        const earnedAchievements = ACHIEVEMENTS.filter(
            achievement => completedTopics >= achievement.requiredTopics
        );

        // Calculate next achievement
        const nextAchievement = ACHIEVEMENTS.find(
            achievement => completedTopics < achievement.requiredTopics
        );

        return NextResponse.json({
            success: true,
            stats: {
                completedTopics,
                totalTopics,
                completionPercentage: Math.round((completedTopics / totalTopics) * 100)
            },
            earnedAchievements,
            nextAchievement: nextAchievement ? {
                ...nextAchievement,
                progress: completedTopics,
                remaining: nextAchievement.requiredTopics - completedTopics
            } : null
        });
    } catch (error) {
        console.error("Error fetching achievements:", error);
        return NextResponse.json({ error: "Failed to fetch achievements" }, { status: 500 });
    }
}
