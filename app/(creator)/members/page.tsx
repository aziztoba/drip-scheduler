import { getSession } from "@/lib/auth";
import { db, memberships, progress, modules, courses } from "@/db";
import { eq, and, count, desc } from "drizzle-orm";
import MembersTable, { type MemberRow } from "./_components/MembersTable";
import { Users, UserCheck, TrendingUp } from "lucide-react";

export default async function MembersPage() {
  const session = await getSession();
  if (!session) return null;

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

  const [modCountRow] = await db
    .select({ total: count(modules.id) })
    .from(modules)
    .innerJoin(courses, eq(modules.courseId, courses.id))
    .where(
      and(eq(courses.companyId, session.companyId), eq(courses.isPublished, true))
    );

  const totalModules = modCountRow?.total ?? 0;

  const totalMembers  = rows.length;
  const activeMembers = rows.filter((r) => r.status === "active").length;

  const avgCompletion =
    totalMembers === 0 || totalModules === 0
      ? 0
      : Math.round(
          rows.reduce((sum, r) => sum + (r.completedCount / totalModules) * 100, 0) /
            totalMembers
        );

  const tableRows: MemberRow[] = rows.map((r) => ({
    id:             r.id,
    whopUserId:     r.whopUserId,
    username:       r.username,
    joinedAt:       r.joinedAt.toISOString(),
    status:         r.status,
    completedCount: r.completedCount,
  }));

  const stats = [
    { label: "Total Members", value: totalMembers, icon: Users,      color: "#6366F1" },
    { label: "Active",        value: activeMembers, icon: UserCheck,  color: "#22C55E" },
    { label: "Avg. Completion", value: `${avgCompletion}%`, icon: TrendingUp, color: "#A855F7" },
  ];

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "#E2E8F7" }}>
          Members
        </h1>
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ background: "rgba(99,102,241,0.15)", color: "#A855F7" }}
        >
          {totalMembers} member{totalMembers !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-2xl p-5"
              style={{
                background: "#0D1526",
                border: "1px solid rgba(255,255,255,0.06)",
                borderTop: `2px solid ${stat.color}`,
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <p
                  className="text-xs uppercase tracking-wide font-semibold"
                  style={{ color: "#94A3B8" }}
                >
                  {stat.label}
                </p>
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: `${stat.color}20` }}
                >
                  <Icon size={15} style={{ color: stat.color }} />
                </div>
              </div>
              <p className="text-3xl font-bold" style={{ color: "#E2E8F7" }}>
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Empty state or table */}
      {totalMembers === 0 ? (
        <div
          className="rounded-2xl p-16 text-center"
          style={{
            background: "#0D1526",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <Users size={28} style={{ color: "#475569" }} />
          </div>
          <h2 className="text-lg font-semibold mb-2" style={{ color: "#E2E8F7" }}>
            No members yet
          </h2>
          <p className="text-sm max-w-sm mx-auto" style={{ color: "#94A3B8" }}>
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
