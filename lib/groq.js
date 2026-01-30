import Groq from "groq-sdk";

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  console.warn("GROQ_API_KEY is not set in environment variables.");
}

const groq = new Groq({
  apiKey: apiKey || "dummy_key", // Prevent crash on init, will fail on request if invalid
});

const SYSTEM_PROMPT = `You are the WealthWise AI, a calm, practical, and advisory financial assistant.
Your goal is to help users with budgeting, saving, spending psychology, and financial literacy.
You are NOT a financial advisor for specific investments. Do not promise returns or recommend specific stocks/crypto.
Always explain uncertainty.

Context about the user:
{CONTEXT}

Tone:
- Calm and reassuring.
- Concise but helpful.
- "Is this worth it?" checks should be objective but empathetic.
- Use Markdown for formatting (bolding, lists) to make text readable.

Guardrails:
- No "get rich quick" schemes.
- Disclaimers when discussing investment types.
- If asked about mental health/crisis, provide helpline resources immediately.
`;

export async function getGroqChatCompletion(history, context = "") {
  const systemMessage = {
    role: "system",
    content: SYSTEM_PROMPT.replace("{CONTEXT}", context || "No specific user context provided."),
  };

  const messages = [systemMessage, ...history];

  return groq.chat.completions.create({
    messages,
    model: "llama-3.3-70b-versatile", // Updated to latest supported model
    temperature: 0.6,
    max_tokens: 1024,
    stream: true,
  });
}
