import * as dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

const isProduction = process.env.NODE_ENV === "production";

export const config = {
  port: Number(process.env.BACKEND_PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",

  corsOrigin: process.env.CORS_ORIGIN || "http://localhost",

  db: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5433,
    name: process.env.DB_NAME || "campaign_manager",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    url: process.env.DATABASE_URL,
  },

  jwt: {
    secret: process.env.JWT_SECRET || "your-super-secret-jwt-key",
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
  },

  cookie: {
    name: "token",
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  },
};
