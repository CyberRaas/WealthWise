
const Groq = require('groq-sdk');
require('dotenv').config({ path: '.env.local' });

console.log("API Key present:", !!process.env.GROQ_API_KEY);

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

async function main() {
    try {
        console.log("Attempting to connect to Groq...");
        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: 'Hello' }],
            model: 'llama-3.3-70b-versatile',
        });
        console.log("Success:", completion.choices[0]?.message?.content);
    } catch (error) {
        console.error("Groq Error:", error);
    }
}

main();
