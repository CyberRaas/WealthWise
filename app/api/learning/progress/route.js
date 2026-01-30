import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import LearningProgress from "@/models/LearningProgress";
import { getTopicById } from "@/lib/learningContent";

// GET: Fetch user's completed topics
export async function GET(req) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const progress = await LearningProgress.find({
            userId: session.user.id
        }).lean();

        return NextResponse.json({
            success: true,
            progress: progress.map(p => ({
                topicId: p.topicId,
                quizScore: p.quizScore,
                totalQuestions: p.totalQuestions,
                completedAt: p.completedAt
            }))
        });
    } catch (error) {
        console.error("Error fetching learning progress:", error);
        return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 });
    }
}

// POST: Mark topic as completed
export async function POST(req) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { topicId, quizScore, totalQuestions } = await req.json();

        // Validate topic exists
        const topic = getTopicById(topicId);
        if (!topic) {
            return NextResponse.json({ error: "Topic not found" }, { status: 404 });
        }

        await dbConnect();

        // Upsert progress (update if exists, create if not)
        const progress = await LearningProgress.findOneAndUpdate(
            { userId: session.user.id, topicId },
            {
                quizScore,
                totalQuestions,
                completedAt: new Date()
            },
            { upsert: true, new: true }
        );

        return NextResponse.json({
            success: true,
            progress: {
                topicId: progress.topicId,
                quizScore: progress.quizScore,
                totalQuestions: progress.totalQuestions,
                completedAt: progress.completedAt
            }
        });
    } catch (error) {
        console.error("Error saving learning progress:", error);
        return NextResponse.json({ error: "Failed to save progress" }, { status: 500 });
    }
}
