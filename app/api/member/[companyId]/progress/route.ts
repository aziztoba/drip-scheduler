/**
 * POST /api/member/[companyId]/progress
 *
 * Marks a module as completed for the authenticated member.
 * Refuses if the module is still locked (server-side drip check).
 *
 * Auth: x-whop-user-token header verified via validateToken + hasAccess from @whop-apps/sdk.
 * Body: { moduleId: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { validateToken, hasAccess } from "@whop-apps/sdk";
import { calculateDripStatus } from "@/lib/drip";
import { db, memberships, modules, courses, progress } from "@/db";
import { eq, and } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
): Promise<NextResponse> {
  const { companyId } = await params;

  // ── Verify Whop iframe user token ─────────────────────────────────────────
  const token = req.headers.get("x-whop-user-token");
  if (!token) {
    return NextResponse.json({ error: "No user token provided" }, { status: 401 });
  }

  const verified = await validateToken({ token, dontThrow: true });
  if (!verified?.userId) {
    return NextResponse.json({ error: "Invalid user token" }, { status: 401 });
  }

  const allowed = await hasAccess({ to: companyId, headers: req.headers });
  if (!allowed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const userId = verified.userId;

  // ── Validate body ─────────────────────────────────────────────────────────
  const body = await req.json().catch(() => null);
  if (!body || typeof body.moduleId !== "string" || body.moduleId.trim().length === 0) {
    return NextResponse.json({ error: "moduleId is required" }, { status: 400 });
  }

  const moduleId = body.moduleId as string;

  // ── Look up their active membership ───────────────────────────────────────
  const [membership] = await db
    .select()
    .from(memberships)
    .where(
      and(eq(memberships.whopUserId, userId), eq(memberships.status, "active"))
    )
    .limit(1);

  if (!membership) {
    return NextResponse.json({ error: "No active membership found" }, { status: 403 });
  }

  // ── Verify module belongs to the same company as the membership ───────────
  const [mod] = await db
    .select({
      id: modules.id,
      title: modules.title,
      unlockDay: modules.unlockDay,
      position: modules.position,
    })
    .from(modules)
    .innerJoin(courses, eq(modules.courseId, courses.id))
    .where(
      and(eq(modules.id, moduleId), eq(courses.companyId, membership.companyId))
    )
    .limit(1);

  if (!mod) {
    return NextResponse.json({ error: "Module not found" }, { status: 404 });
  }

  // ── Enforce drip gate — refuse if module is still locked ──────────────────
  const dripStatuses = calculateDripStatus(membership.joinedAt, [mod]);
  if (!dripStatuses[0]?.isUnlocked) {
    return NextResponse.json({ error: "Module is not yet unlocked" }, { status: 403 });
  }

  // ── Upsert progress (idempotent) ──────────────────────────────────────────
  const [existing] = await db
    .select({ id: progress.id })
    .from(progress)
    .where(
      and(eq(progress.membershipId, membership.id), eq(progress.moduleId, moduleId))
    )
    .limit(1);

  if (!existing) {
    await db.insert(progress).values({ membershipId: membership.id, moduleId });
  }

  return NextResponse.json({ ok: true });
}
