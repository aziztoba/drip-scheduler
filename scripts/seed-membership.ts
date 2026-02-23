/**
 * scripts/seed-membership.ts
 *
 * Inserts a test membership with joinedAt = 7 days ago so several modules unlock.
 * Useful for testing the member view locally without a real Whop webhook.
 *
 * Usage:
 *   npx tsx scripts/seed-membership.ts <companyId>
 *
 * <companyId> is the internal UUID from the companies table.
 * Find it in Neon console or via:
 *   SELECT id, whop_company_id FROM companies;
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const companyId = process.argv[2];

  if (!companyId) {
    console.error("Usage: npx tsx scripts/seed-membership.ts <companyId>");
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    console.error("Error: DATABASE_URL is not set in .env.local");
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql, { schema });

  // Verify the company exists
  const [company] = await db
    .select({ id: schema.companies.id, whopCompanyId: schema.companies.whopCompanyId })
    .from(schema.companies)
    .where(eq(schema.companies.id, companyId))
    .limit(1);

  if (!company) {
    console.error(`Error: No company found with id: ${companyId}`);
    console.error("Run: SELECT id, whop_company_id FROM companies; to find valid IDs.");
    process.exit(1);
  }

  console.log(`Found company: ${company.whopCompanyId} (${company.id})`);

  // Create a test membership with joinedAt = 7 days ago
  const joinedAt = new Date();
  joinedAt.setDate(joinedAt.getDate() - 7);

  const whopMembershipId = `test_mem_${Date.now()}`;
  const whopUserId = `test_user_${Date.now()}`;

  const [membership] = await db
    .insert(schema.memberships)
    .values({
      whopMembershipId,
      companyId,
      whopUserId,
      joinedAt,
      status: "active",
      username: "test_member",
    })
    .returning({ id: schema.memberships.id });

  if (!membership) {
    console.error("Failed to insert membership.");
    process.exit(1);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  console.log("\n✅ Test membership created:");
  console.log(`   Membership ID : ${membership.id}`);
  console.log(`   Whop User ID  : ${whopUserId}`);
  console.log(`   Joined at     : ${joinedAt.toISOString()} (7 days ago)`);
  console.log(`   Status        : active`);
  console.log("\n📋 Creator preview URL (no token required):");
  console.log(`   ${appUrl}/app/${companyId}?preview=${membership.id}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
