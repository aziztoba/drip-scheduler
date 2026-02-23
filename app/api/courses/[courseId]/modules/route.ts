/**
 * POST /api/courses/[courseId]/modules
 *
 * Adds a new module to a course. Position is auto-set to max+1.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { checkCourseOwnership } from "@/lib/ownership";
import { db, modules } from "@/db";
import { eq } from "drizzle-orm";
import { max } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
): Promise<NextResponse> {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { courseId } = await params;
  if (!(await checkCourseOwnership(courseId, session.companyId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);

  if (!body || typeof body.title !== "string" || body.title.trim().length === 0) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  if (body.title.length > 256) {
    return NextResponse.json(
      { error: "title must be 256 characters or fewer" },
      { status: 400 }
    );
  }
  if (
    typeof body.unlockDay !== "number" ||
    !Number.isInteger(body.unlockDay) ||
    body.unlockDay < 0
  ) {
    return NextResponse.json(
      { error: "unlockDay must be a non-negative integer" },
      { status: 400 }
    );
  }

  // Append after the last existing module
  const posResult = await db
    .select({ maxPos: max(modules.position) })
    .from(modules)
    .where(eq(modules.courseId, courseId));

  const position = (posResult[0]?.maxPos ?? -1) + 1;

  const [module] = await db
    .insert(modules)
    .values({
      courseId,
      title: body.title.trim(),
      unlockDay: body.unlockDay,
      content: typeof body.content === "string" ? body.content || null : null,
      videoUrl: typeof body.videoUrl === "string" ? body.videoUrl || null : null,
      position,
    })
    .returning();

  return NextResponse.json(module, { status: 201 });
}
