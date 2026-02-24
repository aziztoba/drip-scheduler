import { getSession } from "@/lib/auth";
import { db, courses } from "@/db";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { BookOpen, Plus, ChevronRight } from "lucide-react";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;

  const creatorCourses = await db
    .select()
    .from(courses)
    .where(eq(courses.companyId, session.companyId))
    .orderBy(courses.createdAt);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#E2E8F7" }}>
            Your Courses
          </h1>
          <p className="text-sm mt-1" style={{ color: "#94A3B8" }}>
            Manage drip schedules for your Whop community
          </p>
        </div>
        <Link
          href="/courses/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{
            background: "linear-gradient(90deg, #6366F1, #A855F7)",
            boxShadow: "0 2px 16px rgba(99,102,241,0.3)",
          }}
        >
          <Plus size={15} />
          New Course
        </Link>
      </div>

      {/* Course list */}
      {creatorCourses.length === 0 ? (
        <div
          className="rounded-2xl p-16 text-center"
          style={{
            background: "#0D1526",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(99,102,241,0.15)" }}
          >
            <BookOpen size={24} style={{ color: "#A855F7" }} />
          </div>
          <h2 className="text-lg font-semibold mb-2" style={{ color: "#E2E8F7" }}>
            No courses yet
          </h2>
          <p className="text-sm mb-6 max-w-sm mx-auto" style={{ color: "#94A3B8" }}>
            Create your first course and configure when each module unlocks for members.
          </p>
          <Link
            href="/courses/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white"
            style={{
              background: "linear-gradient(90deg, #6366F1, #A855F7)",
              boxShadow: "0 2px 16px rgba(99,102,241,0.25)",
            }}
          >
            <Plus size={15} />
            Create your first course
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {creatorCourses.map((course) => (
            <div
              key={course.id}
              className="rounded-2xl p-5 flex items-center justify-between transition-colors"
              style={{
                background: "#0D1526",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(99,102,241,0.15)" }}
                >
                  <BookOpen size={18} style={{ color: "#A855F7" }} />
                </div>
                <div>
                  <h3 className="font-semibold" style={{ color: "#E2E8F7" }}>
                    {course.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={
                        course.isPublished
                          ? { background: "rgba(34,197,94,0.15)", color: "#22C55E" }
                          : { background: "rgba(245,158,11,0.15)", color: "#F59E0B" }
                      }
                    >
                      {course.isPublished ? "Published" : "Draft"}
                    </span>
                    <span className="text-xs" style={{ color: "#475569" }}>
                      Created {new Date(course.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <Link
                href={`/courses/${course.id}`}
                className="flex items-center gap-1 text-sm font-medium transition-opacity hover:opacity-80"
                style={{ color: "#A855F7" }}
              >
                Manage
                <ChevronRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
