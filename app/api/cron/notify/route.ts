/**
 * GET /api/cron/notify
 *
 * Daily cron job — runs at 09:00 UTC via Vercel Cron (see vercel.json).
 * Finds every module that unlocks TODAY for each active member and sends
 * a Whop in-app notification if one hasn't already been sent.
 *
 * Manual trigger (local testing):
 *   curl -H "Authorization: Bearer <CRON_SECRET>" http://localhost:3000/api/cron/notify
 */

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db, memberships, courses, modules, companies, notificationsLog } from "@/db";
import { eq, and } from "drizzle-orm";
import { sendWhopNotification } from "@/lib/whop/client";

export async function GET(req: NextRequest): Promise<NextResponse> {
  // ── Auth ──────────────────────────────────────────────────────────────────
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  let processed = 0;
  let notified  = 0;
  const errors: string[] = [];

  // ── 1. All active memberships ─────────────────────────────────────────────
  const activeMemberships = await db
    .select()
    .from(memberships)
    .where(eq(memberships.status, "active"));

  console.log(`[Cron] Processing ${activeMemberships.length} active memberships`);

  for (const membership of activeMemberships) {
    processed++;

    try {
      // ── 2a. Find published course for this company ──────────────────────
      const [course] = await db
        .select()
        .from(courses)
        .where(
          and(
            eq(courses.companyId, membership.companyId),
            eq(courses.isPublished, true)
          )
        )
        .limit(1);

      if (!course) continue;

      // ── 2b. Load all modules ────────────────────────────────────────────
      const allModules = await db
        .select()
        .from(modules)
        .where(eq(modules.courseId, course.id));

      // ── 2c. Days since join ─────────────────────────────────────────────
      const daysSinceJoin =
        Math.floor((now - membership.joinedAt.getTime()) / 86400000) + 1;

      // ── 2d. Modules unlocking EXACTLY today ─────────────────────────────
      const todayModules = allModules.filter((m) => m.unlockDay === daysSinceJoin);
      if (todayModules.length === 0) continue;

      // ── Get company access token ────────────────────────────────────────
      const [company] = await db
        .select({ accessToken: companies.accessToken })
        .from(companies)
        .where(eq(companies.id, membership.companyId))
        .limit(1);

      if (!company) continue;

      for (const mod of todayModules) {
        // ── 2e. Skip if already notified ───────────────────────────────────
        const [alreadySent] = await db
          .select({ id: notificationsLog.id })
          .from(notificationsLog)
          .where(
            and(
              eq(notificationsLog.membershipId, membership.id),
              eq(notificationsLog.moduleId, mod.id)
            )
          )
          .limit(1);

        if (alreadySent) continue;

        // ── 2f. Send notification ──────────────────────────────────────────
        await sendWhopNotification(membership.whopUserId, company.accessToken, {
          title: "New module unlocked 🎉",
          body: `"${mod.title}" is now available in your course.`,
        });

        // ── 2g. Log so we never send twice ────────────────────────────────
        await db.insert(notificationsLog).values({
          membershipId: membership.id,
          moduleId:     mod.id,
        });

        notified++;
        console.log(
          `[Cron] Notified user ${membership.whopUserId} about "${mod.title}"`
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`membership ${membership.id}: ${msg}`);
      console.error(`[Cron] Error for membership ${membership.id}:`, msg);
    }
  }

  console.log(`[Cron] Done — processed: ${processed}, notified: ${notified}, errors: ${errors.length}`);

  return NextResponse.json({ processed, notified, errors });
}
