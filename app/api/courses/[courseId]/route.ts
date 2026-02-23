/**
 * PATCH  /api/courses/[courseId]  — update title, description, or isPublished
 * DELETE /api/courses/[courseId]  — delete course (modules cascade via FK)
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { checkCourseOwnership } from "@/lib/ownership";
import { db, courses } from "@/db";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
): Promise<NextResponse> {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { courseId } = await params;
  if (!(await checkCourseOwnership(courseId, session.companyId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({})) as Record<string, unknown>;

  const updates: Partial<{
    title: string;
    description: string | null;
    isPublished: boolean;
  }> = {};

  if (typeof body.title === "string") {
    if (body.title.trim().length === 0) {
      return NextResponse.json({ error: "title cannot be empty" }, { status: 400 });
    }
    if (body.title.length > 256) {
      return NextResponse.json(
        { error: "title must be 256 characters or fewer" },
        { status: 400 }
      );
    }
    updates.title = body.title.trim();
  }

  if ("description" in body) {
    updates.description =
      typeof body.description === "string" ? body.description.trim() || null : null;
  }

  if (typeof body.isPublished === "boolean") {
    updates.isPublished = body.isPublished;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const [updated] = await db
    .update(courses)
    .set(updates)
    .where(eq(courses.id, courseId))
    .returning();

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
): Promise<NextResponse> {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { courseId } = await params;
  if (!(await checkCourseOwnership(courseId, session.companyId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.delete(courses).where(eq(courses.id, courseId));

  return NextResponse.json({ ok: true });
}
