/**
 * /experiences/[experienceId]
 *
 * Whop's recommended member-facing route. The experienceId in the URL is the
 * Whop page/experience ID (e.g. exp_xxx) injected by the Whop iframe.
 *
 * Auth flow:
 *  1. Read x-whop-user-token from request headers (injected by Whop iframe).
 *  2. Call validateToken() to verify the token and extract userId.
 *  3. Call hasAccess() to confirm the user holds a valid membership for this experience.
 *  4. Resolve the experience ID → internal company ID via our resource map.
 *  5. Look up the member's DB membership record and render the drip course UI.
 */

import { headers } from "next/headers";
import { validateToken, hasAccess } from "@whop-apps/sdk";
import { db, memberships, courses, modules, progress } from "@/db";
import { eq, and, asc } from "drizzle-orm";
import { resolveCompanyFromWhopResourceId } from "@/lib/whop/resource-map";
import MemberView, { type ModuleData } from "@/app/(member)/app/[companyId]/_components/MemberView";

// ── Error screen ──────────────────────────────────────────────────────────────

function ErrorScreen({ title, message }: { title: string; message: string }) {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4 px-6">
      <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
        <span className="text-white font-bold text-sm">D</span>
      </div>
      <div className="text-center">
        <h2 className="text-white font-semibold mb-1">{title}</h2>
        <p className="text-gray-400 text-sm max-w-md">{message}</p>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ExperiencePage({
  params,
  searchParams,
}: {
  params: Promise<{ experienceId: string }>;
  searchParams: Promise<{ preview?: string; token?: string }>;
}) {
  const [{ experienceId }, sp] = await Promise.all([params, searchParams]);

  // ── Resolve experience → internal company ─────────────────────────────────
  const resolved = await resolveCompanyFromWhopResourceId(experienceId);
  if (!resolved) {
    return (
      <ErrorScreen
        title="Experience not linked"
        message="This Whop experience id is not mapped to a company in the app yet. Save the experience id on the company record and try again."
      />
    );
  }
  const companyId = resolved.internalCompanyId;

  // ── Resolve membership ────────────────────────────────────────────────────
  let membership: typeof memberships.$inferSelect | undefined;

  if (sp.preview) {
    // Creator preview mode — load by membership ID directly, no token needed
    const [row] = await db
      .select()
      .from(memberships)
      .where(and(eq(memberships.id, sp.preview), eq(memberships.companyId, companyId)))
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
    const requestHeaders = await headers();
    const token = requestHeaders.get("x-whop-user-token");

    let userId: string;

    if (
      process.env.NODE_ENV !== "production" &&
      (sp.token === "dev" || sp.token === "test")
    ) {
      // DEV BYPASS: ?token=dev in non-production
      const [any] = await db
        .select({ whopUserId: memberships.whopUserId })
        .from(memberships)
        .where(and(eq(memberships.companyId, companyId), eq(memberships.status, "active")))
        .limit(1);

      if (!any) {
        return (
          <ErrorScreen
            title="No membership found"
            message="Dev bypass active. Run: npx tsx scripts/seed-membership.ts <companyId>"
          />
        );
      }
      userId = any.whopUserId;
    } else if (token) {
      // ── 1. Verify the user token ────────────────────────────────────────
      const verified = await validateToken({ token, dontThrow: true });
      if (!verified?.userId) {
        return (
          <ErrorScreen
            title="Access denied"
            message="Your session is invalid or expired. Please reload."
          />
        );
      }

      // ── 2. Confirm the user has access to this experience ───────────────
      const allowed = await hasAccess({ to: experienceId, token });
      if (!allowed) {
        return (
          <ErrorScreen
            title="No access"
            message="You don't have an active membership for this experience."
          />
        );
      }

      userId = verified.userId;
    } else {
      return (
        <ErrorScreen
          title="Access denied"
          message="This page must be opened inside Whop. No access token was provided."
        />
      );
    }

    // ── 3. Look up DB membership ──────────────────────────────────────────
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

  const moduleData: ModuleData[] = allModules.map((mod) => ({
    id: mod.id,
    title: mod.title,
    content: mod.content,
    videoUrl: mod.videoUrl,
    unlockDay: mod.unlockDay,
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
