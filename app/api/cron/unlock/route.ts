/**
 * GET /api/cron/unlock
 *
 * Daily cron job — runs at 08:00 UTC via Vercel Cron (see vercel.json).
 *
 * Finds every (membership × module) pair where:
 *   • The membership is active
 *   • (joined_at + unlock_day) = today
 *   • A notification has NOT already been sent
 *
 * Sends a Whop in-app notification and logs it to prevent duplicates.
 */

import { NextRequest, NextResponse } from "next/server";
import { db, memberships, modules, courses, companies, notificationsLog } from "@/db";
import { sendWhopNotification } from "@/lib/whop/client";
import { sql } from "drizzle-orm";

export async function GET(req: NextRequest): Promise<NextResponse> {
  // ── Auth: only Vercel's cron runner may call this ─────────────────────────
  const auth = req.headers.get("Authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  console.log(`[Cron] Running unlock job for ${today.toISOString()}`);

  try {
    // ── Find all modules unlocking today for active members ───────────────
    //
    // Logic:
    //   unlockDate = DATE(joined_at) + unlock_day days
    //   fire when unlockDate = today
    //
    // LEFT JOIN on notifications_log ensures we never double-notify.
    const result = await db.execute(sql`
      SELECT
        mem.id             AS membership_id,
        mem.whop_user_id   AS user_id,
        mod.id             AS module_id,
        mod.title          AS module_title,
        cor.title          AS course_title,
        comp.access_token  AS access_token
      FROM memberships   mem
      JOIN companies     comp ON comp.id = mem.company_id
      JOIN courses       cor  ON cor.company_id = comp.id
                              AND cor.is_published = true
      JOIN modules       mod  ON mod.course_id = cor.id
      LEFT JOIN notifications_log nl
                              ON nl.membership_id = mem.id
                              AND nl.module_id = mod.id
      WHERE mem.status = 'active'
        AND nl.id IS NULL
        AND (
          (mem.joined_at::date + (mod.unlock_day || ' days')::interval)::date
          = ${today.toISOString().slice(0, 10)}::date
        )
    `);

    type UnlockRow = {
      membership_id: string;
      user_id: string;
      module_id: string;
      module_title: string;
      course_title: string;
      access_token: string;
    };

    const rows = result.rows as UnlockRow[];
    console.log(`[Cron] Found ${rows.length} unlocks to process`);

    let sent = 0;
    let failed = 0;

    for (const row of rows) {
      try {
        // Send Whop in-app notification
        await sendWhopNotification(row.user_id, row.access_token, {
          title: "New content unlocked! 🎉",
          body: `"${row.module_title}" in ${row.course_title} is now available.`,
        });

        // Record the notification so it won't be sent again
        await db.insert(notificationsLog).values({
          membershipId: row.membership_id,
          moduleId: row.module_id,
        });

        sent++;
      } catch (err) {
        console.error(`[Cron] Failed for membership ${row.membership_id}:`, err);
        failed++;
        // Continue processing other rows
      }
    }

    console.log(`[Cron] Done — sent: ${sent}, failed: ${failed}`);

    return NextResponse.json({
      success: true,
      date: today.toISOString(),
      notifications_sent: sent,
      notifications_failed: failed,
    });

  } catch (error) {
    console.error("[Cron] Job failed:", error);
    return NextResponse.json({ error: "Cron job failed" }, { status: 500 });
  }
}
