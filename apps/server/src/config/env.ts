import dotenv from "dotenv";
import path from "path";

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });

export const env = {
  PORT: parseInt(process.env.API_PORT || "3001", 10),
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: process.env.DATABASE_URL!,

  // AI Provider (Groq recommended)
  GROQ_API_KEY: process.env.GROQ_API_KEY || "",

  // Google AI for embeddings (RAG)
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "souqona-access-secret-change-me",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "souqona-refresh-secret-change-me",
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
} as const;

// Validate required env vars at startup
const required = ["DATABASE_URL"] as const;
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}
