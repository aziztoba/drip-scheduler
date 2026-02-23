/**
 * lib/ownership.ts
 *
 * Shared helpers that verify a resource belongs to the authenticated company.
 * Every mutating API route calls one of these before touching the DB.
 */

import { db, courses, modules } from "@/db";
import { eq, and } from "drizzle-orm";

/**
 * Returns true if the course exists and belongs to the given company.
 * Use before any PATCH / DELETE on a course.
 */
export async function checkCourseOwnership(
  courseId: string,
  companyId: string
): Promise<boolean> {
  const [row] = await db
    .select({ id: courses.id })
    .from(courses)
    .where(and(eq(courses.id, courseId), eq(courses.companyId, companyId)))
    .limit(1);

  return !!row;
}

/**
 * Returns true if the module exists, belongs to the given course,
 * AND that course belongs to the given company.
 * Use before any PATCH / DELETE on a module.
 */
export async function checkModuleOwnership(
  moduleId: string,
  courseId: string,
  companyId: string
): Promise<boolean> {
  if (!(await checkCourseOwnership(courseId, companyId))) return false;

  const [row] = await db
    .select({ id: modules.id })
    .from(modules)
    .where(and(eq(modules.id, moduleId), eq(modules.courseId, courseId)))
    .limit(1);

  return !!row;
}
