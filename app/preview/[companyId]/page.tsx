/**
 * /preview/[companyId]
 *
 * Development preview of the member experience — no real Whop token required.
 * [companyId] is the Whop company ID, e.g. biz_vFfyXpp5c37Bv3
 *
 * Auth:
 *  - Always accessible when NODE_ENV !== "production"
 *  - In production: only accessible when ?preview_secret=<PREVIEW_SECRET> matches
 */

import { db, companies, courses, modules } from "@/db";
import { eq, and, asc } from "drizzle-orm";
import MemberView, { type ModuleData } from "@/app/(member)/app/[companyId]/_components/MemberView";

// ── Error screen ──────────────────────────────────────────────────────────────

function ErrorScreen({ title, message }: { title: string; message: string }) {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4 px-6">
      <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center">
        <span className="text-black font-bold text-lg">⚠</span>
      </div>
      <div className="text-center">
        <h2 className="text-white font-semibold mb-1">{title}</h2>
        <p className="text-gray-400 text-sm max-w-xs">{message}</p>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function PreviewPage({
  params,
  searchParams,
}: {
  params:       Promise<{ companyId: string }>;
  searchParams: Promise<{ preview_secret?: string }>;
}) {
  const [{ companyId: whopCompanyId }, sp] = await Promise.all([params, searchParams]);

  // ── Auth guard ────────────────────────────────────────────────────────────
  const isDev         = process.env.NODE_ENV !== "production";
  const secretMatches = process.env.PREVIEW_SECRET && sp.preview_secret === process.env.PREVIEW_SECRET;

  if (!isDev && !secretMatches) {
    return (
      <ErrorScreen
        title="Not found"
        message="This preview URL is not available in production without a valid preview_secret."
      />
    );
  }

  // ── Look up company by Whop company ID ────────────────────────────────────
  const [company] = await db
    .select()
    .from(companies)
    .where(eq(companies.whopCompanyId, whopCompanyId))
    .limit(1);

  if (!company) {
    return (
      <ErrorScreen
        title="Company not found"
        message={`No company with Whop ID "${whopCompanyId}" has installed the app yet.`}
      />
    );
  }

  // ── Fetch first published course ──────────────────────────────────────────
  const [course] = await db
    .select()
    .from(courses)
    .where(and(eq(courses.companyId, company.id), eq(courses.isPublished, true)))
    .orderBy(asc(courses.createdAt))
    .limit(1);

  if (!course) {
    return (
      <ErrorScreen
        title="No published course"
        message="This company has no published courses yet. Publish one in the creator dashboard."
      />
    );
  }

  // ── Fetch modules — all shown as unlocked (no drip logic in preview) ──────
  const allModules = await db
    .select()
    .from(modules)
    .where(eq(modules.courseId, course.id))
    .orderBy(asc(modules.unlockDay), asc(modules.position));

  const moduleData: ModuleData[] = allModules.map((mod) => ({
    id:         mod.id,
    title:      mod.title,
    content:    mod.content,
    videoUrl:   mod.videoUrl,
    unlockDay:  mod.unlockDay,
    isUnlocked: true, // preview: skip drip unlock logic
  }));

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Preview banner */}
      <div
        className="text-center text-sm font-semibold py-2 px-4"
        style={{ background: "#EAB308", color: "#000" }}
      >
        ⚠️ Preview mode — not a real member session
      </div>

      <MemberView
        courseTitle={course.title}
        daysSinceJoin={1}
        modules={moduleData}
        membershipId="preview"
        initialCompletedIds={[]}
      />
    </div>
  );
}
