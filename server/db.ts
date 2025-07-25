import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Default to a local development database if DATABASE_URL is not set
const databaseUrl = process.env.DATABASE_URL || "postgresql://localhost:5432/resilience_dev";

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

console.log("Connecting to database:", databaseUrl.replace(/\/\/.*@/, "//***:***@"));

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle({ client: pool, schema });