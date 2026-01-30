
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import dbConnect from '@/lib/dbConnect'
import UserProfile from '@/models/UserProfile'
import groq, { GROQ_MODEL } from '@/lib/groqClient'

export async function POST(req) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await dbConnect()
        const userProfile = await UserProfile.findOne({ userId: session.user.id })

        const { action, ...data } = await req.json()

        // Construct User Context String
        const userContext = userProfile ? `
        User Profile:
        - Name: ${userProfile.fullName || 'User'}
        - Age: ${userProfile.age || 'Unknown'}
        - City: ${userProfile.city || 'Unknown'}
        - Monthly Income: ₹${userProfile.monthlyIncome || 0}
        - Family Size: ${userProfile.familySize || 1}

        Financial Data:
        - Budget: ₹${userProfile.budget?.totalAmount || 'Not Set'}
        - Expenses: ${userProfile.expenses?.length || 0} recorded transactions
        - Savings Goals: ${userProfile.savingsGoals?.map(g => `${g.name} (₹${g.currentAmount}/₹${g.targetAmount})`).join(', ') || 'None'}
        ` : "User profile data not available."

        let responseContent = ""

        if (action === 'chat') {
            const { messages, context, personaPrompt, userMessage } = data

            const systemPrompt = `
        STRICT CONTEXT PROTOCOL:
        You are a Financial Forensic Analyst. Answer using the provided Context if available.
        If the answer is not in the context, use your general knowledge but mention "Based on general knowledge...".
        
        CITATION REQUIREMENT:
        - Use [Source: Filename] tags if using document data.
        
        USER FINANCIAL PROFILE:
        ${userContext}
        
        CONTEXT:
        ${context}
        
        PERSONA:
        ${personaPrompt}
        `

            const completion = await groq.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...messages.map(m => ({ role: m.role, content: m.content })),
                    { role: 'user', content: userMessage }
                ],
                model: GROQ_MODEL,
            })
            responseContent = completion.choices[0]?.message?.content

        } else if (action === 'debate') {
            const { p1, p2, prompt, persona1, persona2 } = data
            // The prompt is already constructed on client, or we construct it here.
            // Client passed the full prompt or parts. Let's use the one passed.
            // Actually for security/cleanliness, let's construct here if needed, but client construction is easier for custom inputs.
            // Let's assume 'prompt' is the full instruction.

            const fullPrompt = `
        DEBATE TOPIC: ${prompt}
        
        PERSONA A (${p1}): ${persona1}
        PERSONA B (${p2}): ${persona2}
        
        INSTRUCTIONS:
        1. Simulate a short, intense debate between A and B.
        2. Each must stay strictly in character.
        3. Provide a Final Verdict/Synthesis.
        `

            const completion = await groq.chat.completions.create({
                messages: [{ role: 'user', content: fullPrompt }],
                model: GROQ_MODEL,
            })
            responseContent = completion.choices[0]?.message?.content

        } else if (action === 'agent') {
            const { prompt } = data // Client constructs the specific agent prompt

            const completion = await groq.chat.completions.create({
                messages: [{ role: 'user', content: prompt }],
                model: GROQ_MODEL,
            })
            responseContent = completion.choices[0]?.message?.content
        }

        return NextResponse.json({ result: responseContent })

    } catch (error) {
        console.error('Financial Model API Error:', error)
        console.error('Error Details:', JSON.stringify(error, Object.getOwnPropertyNames(error)))
        return NextResponse.json(
            { error: 'Failed to process request', details: error.message },
            { status: 500 }
        )
    }
}
