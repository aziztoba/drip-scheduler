import type { Config } from "drizzle-kit";
import { config } from "dotenv";

// Load .env.local so drizzle-kit CLI can read DATABASE_URL
config({ path: ".env.local" });

export default {
  schema: "./db/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
} satisfies Config;
