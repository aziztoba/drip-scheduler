import { getSession } from "@/lib/auth";
import { db, memberships, progress, modules, courses } from "@/db";
import { eq, and, count, desc } from "drizzle-orm";
import MembersTable, { type MemberRow } from "./_components/MembersTable";

export default async function MembersPage() {
  const session = await getSession();
  if (!session) return null;

  // ── Fetch memberships with completed-module count ─────────────────────────
  const rows = await db
    .select({
      id:             memberships.id,
      whopUserId:     memberships.whopUserId,
      username:       memberships.username,
      joinedAt:       memberships.joinedAt,
      status:         memberships.status,
      completedCount: count(progress.id),
    })
    .from(memberships)
    .leftJoin(progress, eq(progress.membershipId, memberships.id))
    .where(eq(memberships.companyId, session.companyId))
    .groupBy(memberships.id)
    .orderBy(desc(memberships.joinedAt));

  // ── Total modules across published courses for this company ───────────────
  const [modCountRow] = await db
    .select({ total: count(modules.id) })
    .from(modules)
    .innerJoin(courses, eq(modules.courseId, courses.id))
    .where(
      and(eq(courses.companyId, session.companyId), eq(courses.isPublished, true))
    );

  const totalModules = modCountRow?.total ?? 0;

  // ── Derived stats ─────────────────────────────────────────────────────────
  const totalMembers  = rows.length;
  const activeMembers = rows.filter((r) => r.status === "active").length;

  const avgCompletion =
    totalMembers === 0 || totalModules === 0
      ? 0
      : Math.round(
          rows.reduce((sum, r) => sum + (r.completedCount / totalModules) * 100, 0) /
            totalMembers
        );

  // Serialise dates for the client component
  const tableRows: MemberRow[] = rows.map((r) => ({
    id:             r.id,
    whopUserId:     r.whopUserId,
    username:       r.username,
    joinedAt:       r.joinedAt.toISOString(),
    status:         r.status,
    completedCount: r.completedCount,
  }));

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Members</h1>
        <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full">
          {totalMembers} member{totalMembers !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">
            Total Members
          </p>
          <p className="text-3xl font-bold text-slate-900">{totalMembers}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">
            Active
          </p>
          <p className="text-3xl font-bold text-green-600">{activeMembers}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">
            Avg. Completion
          </p>
          <p className="text-3xl font-bold text-indigo-600">{avgCompletion}%</p>
        </div>
      </div>

      {/* Empty state or table */}
      {totalMembers === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-16 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">👥</span>
          </div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">No members yet</h2>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            Members appear here automatically when they join via Whop.
            Share your Whop link to get started.
          </p>
        </div>
      ) : (
        <MembersTable
          rows={tableRows}
          totalModules={totalModules}
          companyId={session.companyId}
        />
      )}
    </div>
  );
}
