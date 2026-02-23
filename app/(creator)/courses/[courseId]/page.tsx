import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db, courses, modules } from "@/db";
import { eq, and, asc } from "drizzle-orm";
import CourseEditor from "./_components/CourseEditor";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const [session, { courseId }] = await Promise.all([getSession(), params]);
  if (!session) return null;

  const [course] = await db
    .select()
    .from(courses)
    .where(and(eq(courses.id, courseId), eq(courses.companyId, session.companyId)))
    .limit(1);

  if (!course) notFound();

  const courseModules = await db
    .select()
    .from(modules)
    .where(eq(modules.courseId, courseId))
    .orderBy(asc(modules.position));

  return <CourseEditor course={course} initialModules={courseModules} />;
}
