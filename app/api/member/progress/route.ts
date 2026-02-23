/**
 * POST /api/member/progress
 *
 * Marks a module as completed or incomplete for a member.
 * No creator session required — open to members, gated by membershipId existence.
 *
 * Body: { membershipId: string, moduleId: string, completed: boolean }
 *
 * Requires UNIQUE(membership_id, module_id) on the progress table.
 * Run scripts/migrate-progress.ts once before using this endpoint.
 */

import { NextRequest, NextResponse } from "next/server";
import { db, memberships, progress } from "@/db";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.json().catch(() => null) as {
    membershipId?: unknown;
    moduleId?: unknown;
    completed?: unknown;
  } | null;

  if (
    !body ||
    typeof body.membershipId !== "string" ||
    typeof body.moduleId !== "string" ||
    typeof body.completed !== "boolean"
  ) {
    return NextResponse.json(
      { error: "membershipId (string), moduleId (string), and completed (boolean) are required" },
      { status: 400 }
    );
  }

  const { membershipId, moduleId, completed } = body;

  // Verify the membership exists in our DB (basic existence guard)
  const [membership] = await db
    .select({ id: memberships.id })
    .from(memberships)
    .where(eq(memberships.id, membershipId))
    .limit(1);

  if (!membership) {
    return NextResponse.json({ error: "Membership not found" }, { status: 404 });
  }

  if (completed) {
    // INSERT — skip silently if the row already exists (idempotent)
    await db
      .insert(progress)
      .values({ membershipId, moduleId })
      .onConflictDoNothing();
  } else {
    // DELETE — remove the completion record
    await db
      .delete(progress)
      .where(and(eq(progress.membershipId, membershipId), eq(progress.moduleId, moduleId)));
  }

  return NextResponse.json({ ok: true });
}
