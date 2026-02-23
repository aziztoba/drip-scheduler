/**
 * /app/[companyId]?token=<whop_user_token>
 * /app/[companyId]?preview=<membershipId>   ← creator preview (skips token check)
 *
 * Dark-themed drip course view. Served inside Whop's iframe.
 * Server component — all DB fetches happen server-side.
 * MemberView island owns expand/collapse + progress bar state.
 */

import { db, memberships, courses, modules, progress } from "@/db";
import { eq, and, asc } from "drizzle-orm";
import MemberView, { type ModuleData } from "./_components/MemberView";

// ── Error screen ─────────────────────────────────────────────────────────────

function ErrorScreen({ title, message }: { title: string; message: string }) {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4 px-6">
      <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
        <span className="text-white font-bold text-sm">D</span>
      </div>
      <div className="text-center">
        <h2 className="text-white font-semibold mb-1">{title}</h2>
        <p className="text-gray-400 text-sm max-w-xs">{message}</p>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function MemberCoursePage({
  params,
  searchParams,
}: {
  params:       Promise<{ companyId: string }>;
  searchParams: Promise<{ token?: string; preview?: string }>;
}) {
  const [{ companyId }, { token, preview }] = await Promise.all([params, searchParams]);

  // ── Resolve membership ───────────────────────────────────────────────────
  let membership: typeof memberships.$inferSelect | undefined;

  if (preview) {
    // Creator preview mode — load by membership ID directly, no token needed
    const [row] = await db
      .select()
      .from(memberships)
      .where(and(eq(memberships.id, preview), eq(memberships.companyId, companyId)))
      .limit(1);
    membership = row;

    if (!membership) {
      return (
        <ErrorScreen
          title="Preview not found"
          message="The membership ID in the preview link doesn't exist or belongs to a different company."
        />
      );
    }
  } else {
    // Normal member flow — verify Whop token
    if (!token) {
      return <ErrorScreen title="Access denied" message="No access token provided." />;
    }

    let userId: string;

    // DEV BYPASS: token=dev or token=test in non-production
    if (process.env.NODE_ENV !== "production" && (token === "dev" || token === "test")) {
      const [anyMembership] = await db
        .select({ whopUserId: memberships.whopUserId })
        .from(memberships)
        .where(and(eq(memberships.companyId, companyId), eq(memberships.status, "active")))
        .limit(1);

      if (!anyMembership) {
        return (
          <ErrorScreen
            title="No membership found"
            message="Dev bypass active. Run: npx tsx scripts/seed-membership.ts <companyId>"
          />
        );
      }
      userId = anyMembership.whopUserId;
    } else {
      try {
        const res = await fetch("https://api.whop.com/oauth/userinfo", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        if (!res.ok) {
          return <ErrorScreen title="Access denied" message="Your session is invalid or expired. Please reload." />;
        }
        const info = (await res.json()) as { sub?: string };
        if (!info.sub) {
          return <ErrorScreen title="Access denied" message="Could not verify your identity." />;
        }
        userId = info.sub;
      } catch {
        return <ErrorScreen title="Access denied" message="Could not reach Whop. Please try again." />;
      }
    }

    const [row] = await db
      .select()
      .from(memberships)
      .where(
        and(
          eq(memberships.whopUserId, userId),
          eq(memberships.companyId, companyId),
          eq(memberships.status, "active")
        )
      )
      .limit(1);

    membership = row;

    if (!membership) {
      return (
        <ErrorScreen
          title="No active membership"
          message="We couldn't find an active membership for your account."
        />
      );
    }
  }

  // ── Load course ───────────────────────────────────────────────────────────
  const [course] = await db
    .select()
    .from(courses)
    .where(and(eq(courses.companyId, companyId), eq(courses.isPublished, true)))
    .orderBy(asc(courses.createdAt))
    .limit(1);

  if (!course) {
    return (
      <ErrorScreen
        title="No course yet"
        message="The creator hasn't published a course yet. Check back soon."
      />
    );
  }

  // ── Load modules + progress ───────────────────────────────────────────────
  const allModules = await db
    .select()
    .from(modules)
    .where(eq(modules.courseId, course.id))
    .orderBy(asc(modules.unlockDay), asc(modules.position));

  const daysSinceJoin =
    Math.floor((Date.now() - membership.joinedAt.getTime()) / 86400000) + 1;

  const completedRows = await db
    .select({ moduleId: progress.moduleId })
    .from(progress)
    .where(eq(progress.membershipId, membership.id));

  const completedIds = new Set(completedRows.map((r) => r.moduleId));

  // Serialise for the client component
  const moduleData: ModuleData[] = allModules.map((mod) => ({
    id:         mod.id,
    title:      mod.title,
    content:    mod.content,
    videoUrl:   mod.videoUrl,
    unlockDay:  mod.unlockDay,
    isUnlocked: mod.unlockDay <= daysSinceJoin,
  }));

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <MemberView
        courseTitle={course.title}
        daysSinceJoin={daysSinceJoin}
        modules={moduleData}
        membershipId={membership.id}
        initialCompletedIds={[...completedIds]}
      />
    </div>
  );
}
