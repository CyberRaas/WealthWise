import Groq from 'groq-sdk';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// Default model to use - Llama 3.3 70B is a good balance of speed and intelligence
export const GROQ_MODEL = 'llama-3.3-70b-versatile';

export default groq;
