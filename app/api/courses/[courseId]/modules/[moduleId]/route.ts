/**
 * PATCH  /api/courses/[courseId]/modules/[moduleId]  — update module fields
 * DELETE /api/courses/[courseId]/modules/[moduleId]  — delete module
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { checkModuleOwnership } from "@/lib/ownership";
import { db, modules } from "@/db";
import { eq } from "drizzle-orm";

type Params = { params: Promise<{ courseId: string; moduleId: string }> };

export async function PATCH(req: NextRequest, { params }: Params): Promise<NextResponse> {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { courseId, moduleId } = await params;
  if (!(await checkModuleOwnership(moduleId, courseId, session.companyId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({})) as Record<string, unknown>;

  const updates: Partial<{
    title: string;
    content: string | null;
    videoUrl: string | null;
    unlockDay: number;
    position: number;
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

  if ("content" in body) {
    updates.content = typeof body.content === "string" ? body.content || null : null;
  }

  if ("videoUrl" in body) {
    updates.videoUrl = typeof body.videoUrl === "string" ? body.videoUrl || null : null;
  }

  if ("unlockDay" in body) {
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
    updates.unlockDay = body.unlockDay;
  }

  if ("position" in body) {
    if (
      typeof body.position !== "number" ||
      !Number.isInteger(body.position) ||
      body.position < 0
    ) {
      return NextResponse.json(
        { error: "position must be a non-negative integer" },
        { status: 400 }
      );
    }
    updates.position = body.position;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const [updated] = await db
    .update(modules)
    .set(updates)
    .where(eq(modules.id, moduleId))
    .returning();

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Params): Promise<NextResponse> {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { courseId, moduleId } = await params;
  if (!(await checkModuleOwnership(moduleId, courseId, session.companyId))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.delete(modules).where(eq(modules.id, moduleId));

  return NextResponse.json({ ok: true });
}
