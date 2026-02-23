import { getSession } from "@/lib/auth";
import { db, courses } from "@/db";
import { eq } from "drizzle-orm";
import Link from "next/link";

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
          <h1 className="text-2xl font-bold text-slate-900">Your Courses</h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage drip schedules for your Whop community
          </p>
        </div>
        <Link
          href="/courses/new"
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + New Course
        </Link>
      </div>

      {/* Course list */}
      {creatorCourses.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-16 text-center">
          <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📚</span>
          </div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">No courses yet</h2>
          <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
            Create your first course and configure when each module unlocks for members.
          </p>
          <Link
            href="/courses/new"
            className="inline-flex items-center px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Create your first course
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {creatorCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between hover:border-indigo-200 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                  <span className="text-lg">📖</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{course.title}</h3>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        course.isPublished
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {course.isPublished ? "Published" : "Draft"}
                    </span>
                    <span className="text-xs text-slate-400">
                      Created {new Date(course.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <Link
                href={`/courses/${course.id}`}
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Manage →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
