/**
 * POST /api/courses/[courseId]/modules/reorder
 *
 * Accepts a new ordered array of module IDs and updates each module's
 * position field. Called after a drag-to-reorder on the course editor.
 *
 * Body: { order: string[] }  — full array of module IDs in new order
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { checkCourseOwnership } from "@/lib/ownership";
import { db, modules } from "@/db";
import { eq } from "drizzle-orm";

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
  if (
    !body ||
    !Array.isArray(body.order) ||
    body.order.some((id: unknown) => typeof id !== "string")
  ) {
    return NextResponse.json(
      { error: "order must be an array of module ID strings" },
      { status: 400 }
    );
  }

  const order = body.order as string[];

  await Promise.all(
    order.map((moduleId, index) =>
      db.update(modules).set({ position: index }).where(eq(modules.id, moduleId))
    )
  );

  return NextResponse.json({ ok: true });
}
