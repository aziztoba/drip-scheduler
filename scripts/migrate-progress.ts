/**
 * scripts/migrate-progress.ts
 *
 * One-off migration: adds a UNIQUE constraint on progress(membership_id, module_id).
 * This is required for the ON CONFLICT DO NOTHING logic in POST /api/member/progress.
 *
 * Run once with:
 *   npx tsx scripts/migrate-progress.ts
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set in .env.local");
  }

  const sql = neon(process.env.DATABASE_URL);

  console.log("Adding UNIQUE(membership_id, module_id) to progress table...");

  try {
    await sql`
      ALTER TABLE progress
      ADD CONSTRAINT progress_membership_module_unique
      UNIQUE (membership_id, module_id)
    `;
    console.log("Done. Unique constraint added.");
  } catch (err: unknown) {
    // 42P07 = duplicate_object — constraint already exists, nothing to do
    if ((err as { code?: string })?.code === "42P07") {
      console.log("Constraint already exists — skipping.");
    } else {
      throw err;
    }
  }
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
