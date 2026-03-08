import 'dotenv/config';

export const config = {
  PORT: Number(process.env.PORT) || 4000,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  OLLAMA_HOST: process.env.OLLAMA_HOST || 'http://localhost:11434',
  DEFAULT_MODEL_PROVIDER: process.env.DEFAULT_MODEL_PROVIDER || 'gemini', // 'gemini' | 'ollama'
  DEFAULT_GEMINI_MODEL: process.env.DEFAULT_GEMINI_MODEL || 'gemini-2.5-flash',
  DEFAULT_OLLAMA_MODEL: process.env.DEFAULT_OLLAMA_MODEL || 'qwen2.5',
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  DEFAULT_GROQ_MODEL: process.env.DEFAULT_GROQ_MODEL || 'llama-3.3-70b-versatile',
  AGENT_SECRET_TOKEN: process.env.AGENT_SECRET_TOKEN || '',
  NESTJS_API_URL: process.env.NESTJS_API_URL || 'http://localhost:3000/api',
};
