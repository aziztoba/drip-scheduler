import { db, companies } from "@/db";
import { eq } from "drizzle-orm";

export interface ResolvedWhopResource {
  internalCompanyId: string;
  whopCompanyId: string;
  matchedBy: "company" | "experience" | "internal";
}

/**
 * Resolves a Whop route resource identifier into our internal company id.
 * Supports:
 * - Whop company ids (e.g. biz_xxx)
 * - Whop experience ids (if persisted on companies.whopExperienceId)
 * - Internal company UUIDs (legacy links)
 */
export async function resolveCompanyFromWhopResourceId(
  resourceId: string
): Promise<ResolvedWhopResource | null> {
  if (!resourceId) return null;

  const byExperience = await db
    .select({ id: companies.id, whopCompanyId: companies.whopCompanyId })
    .from(companies)
    .where(eq(companies.whopExperienceId, resourceId))
    .limit(1);
  if (byExperience[0]) {
    return {
      internalCompanyId: byExperience[0].id,
      whopCompanyId: byExperience[0].whopCompanyId,
      matchedBy: "experience",
    };
  }

  const byCompany = await db
    .select({ id: companies.id, whopCompanyId: companies.whopCompanyId })
    .from(companies)
    .where(eq(companies.whopCompanyId, resourceId))
    .limit(1);
  if (byCompany[0]) {
    return {
      internalCompanyId: byCompany[0].id,
      whopCompanyId: byCompany[0].whopCompanyId,
      matchedBy: "company",
    };
  }

  const byInternal = await db
    .select({ id: companies.id, whopCompanyId: companies.whopCompanyId })
    .from(companies)
    .where(eq(companies.id, resourceId))
    .limit(1);
  if (byInternal[0]) {
    return {
      internalCompanyId: byInternal[0].id,
      whopCompanyId: byInternal[0].whopCompanyId,
      matchedBy: "internal",
    };
  }

  return null;
}

