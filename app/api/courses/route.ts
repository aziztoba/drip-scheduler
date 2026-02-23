/**
 * POST /api/courses
 *
 * Creates a new course for the authenticated creator's company.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db, courses } from "@/db";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  const description =
    typeof body.description === "string" ? body.description.trim() || null : null;

  const [course] = await db
    .insert(courses)
    .values({
      companyId: session.companyId,
      title: body.title.trim(),
      description,
    })
    .returning();

  return NextResponse.json(course, { status: 201 });
}
