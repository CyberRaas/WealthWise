import { getGroqChatCompletion } from "@/lib/groq";
import { NextResponse } from "next/server";
import { auth } from '@/lib/auth'
import dbConnect from '@/lib/dbConnect'
import UserProfile from '@/models/UserProfile'

export async function POST(req) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await dbConnect()
        const userProfile = await UserProfile.findOne({ userId: session.user.id })

        const userContext = userProfile ? `
        User Profile:
        - Name: ${userProfile.fullName || 'User'}
        - Monthly Income: ₹${userProfile.monthlyIncome || 0}
        - Budget: ₹${userProfile.budget?.totalAmount || 0}
        - Expenses: ${userProfile.expenses?.length || 0} transactions
        - Goals: ${userProfile.savingsGoals?.map(g => g.name).join(', ') || 'None'}
        ` : ""

        const { history, context } = await req.json();

        // Inject user profile into the context
        const enhancedContext = `
        ${context || ''}
        
        ${userContext}
        `

        if (!history || !Array.isArray(history)) {
            return NextResponse.json({ error: "Invalid history format" }, { status: 400 });
        }

        const stream = await getGroqChatCompletion(history, enhancedContext);

        const readableStream = new ReadableStream({
            async start(controller) {
                for await (const chunk of stream) {
                    const content = chunk.choices[0]?.delta?.content || "";
                    if (content) {
                        controller.enqueue(new TextEncoder().encode(content));
                    }
                }
                controller.close();
            },
        });

        return new NextResponse(readableStream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
            },
        });
    } catch (error) {
        console.error("Error in chat API:", error);

        // Check for common Groq errors
        if (error.status === 401 || error.message?.includes("API key")) {
            return NextResponse.json({ error: "Invalid or missing API Key. Please check your .env.local file." }, { status: 401 });
        }

        return NextResponse.json({ error: "Failed to generate response: " + (error.message || "Unknown error") }, { status: 500 });
    }
}
