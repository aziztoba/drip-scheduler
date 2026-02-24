/**
 * GET /api/member/[companyId]/courses
 *
 * Returns courses + lock/unlock status for the authenticated member.
 * Called by the member iframe view.
 *
 * Auth:
 *  - validateToken(token) verifies the x-whop-user-token header via Whop SDK.
 *  - hasAccess({ to: companyId }) confirms the user holds a membership for this resource.
 */

import { NextRequest, NextResponse } from "next/server";
import { validateToken, hasAccess } from "@whop-apps/sdk";
import { calculateDripStatus } from "@/lib/drip";
import { db, memberships, courses, modules } from "@/db";
import { eq, and, asc } from "drizzle-orm";

export async function GET(
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

  // ── Look up their membership ───────────────────────────────────────────────
  const [membership] = await db
    .select()
    .from(memberships)
    .where(
      and(
        eq(memberships.whopUserId, userId),
        eq(memberships.status, "active")
      )
    )
    .limit(1);

  if (!membership) {
    return NextResponse.json({ error: "No active membership found" }, { status: 403 });
  }

  // ── Fetch published courses for this company ───────────────────────────────
  const companyCourses = await db
    .select()
    .from(courses)
    .where(and(eq(courses.companyId, membership.companyId), eq(courses.isPublished, true)));

  // ── For each course, calculate module statuses ─────────────────────────────
  const coursesWithStatus = await Promise.all(
    companyCourses.map(async (course) => {
      const courseModules = await db
        .select({
          id: modules.id,
          title: modules.title,
          unlockDay: modules.unlockDay,
          position: modules.position,
          content: modules.content,
          videoUrl: modules.videoUrl,
        })
        .from(modules)
        .where(eq(modules.courseId, course.id))
        .orderBy(asc(modules.position));

      const statuses = calculateDripStatus(membership.joinedAt, courseModules);

      return {
        id: course.id,
        title: course.title,
        description: course.description,
        modules: statuses.map((s) => ({
          id: s.id,
          title: s.title,
          position: s.position,
          unlockDay: s.unlockDay,
          isUnlocked: s.isUnlocked,
          daysRemaining: s.daysRemaining,
          unlockDate: s.unlockDate.toISOString(),
          // Only send content for unlocked modules
          content: s.isUnlocked
            ? courseModules.find((m) => m.id === s.id)?.content ?? null
            : null,
          videoUrl: s.isUnlocked
            ? courseModules.find((m) => m.id === s.id)?.videoUrl ?? null
            : null,
        })),
      };
    })
  );

  return NextResponse.json({ courses: coursesWithStatus });
}
