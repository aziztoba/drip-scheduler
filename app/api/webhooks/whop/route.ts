/**
 * POST /api/webhooks/whop
 *
 * Receives and processes Whop membership lifecycle events.
 * Prefers Whop SDK webhook unwrapping (Standard Webhooks compatible) when configured,
 * and falls back to the legacy x-whop-signature HMAC verification used by this app.
 */

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db, memberships, companies } from "@/db";
import { eq } from "drizzle-orm";
import {
  parseWebhookEvent,
  type MembershipEventData,
  verifyWhopWebhookSignature,
} from "@/lib/whop/webhooks";
import { unwrapWhopWebhookViaSdk } from "@/lib/whop/sdk";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const rawBody = await req.text();
  const webhookSecret = process.env.WHOP_WEBHOOK_SECRET;
  const legacySignature = req.headers.get("x-whop-signature");

  if (!webhookSecret) {
    console.error("[Webhook] WHOP_WEBHOOK_SECRET not configured");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  let parsed: unknown = await unwrapWhopWebhookViaSdk(rawBody, req.headers);
  if (!parsed) {
    if (!verifyWhopWebhookSignature(rawBody, legacySignature, webhookSecret)) {
      console.warn("[Webhook] Rejected - invalid signature", { legacySignature });
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
    parsed = parseWebhookEvent(rawBody);
  }

  const event = normalizeWebhookEvent(parsed);
  if (!event) {
    return NextResponse.json({ error: "Malformed payload" }, { status: 400 });
  }

  console.log(`[Webhook] ${event.action}`, JSON.stringify(event.data));

  try {
    switch (event.action) {
      case "membership.went_valid":
        await handleMembershipActivated(event.data as MembershipEventData);
        break;
      case "membership.went_invalid":
        await handleMembershipDeactivated(event.data as MembershipEventData);
        break;
      default:
        console.log(`[Webhook] Unhandled action: ${event.action}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`[Webhook] Error processing "${event.action}":`, error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}

function normalizeWebhookEvent(input: unknown): { action: string; data: unknown } | null {
  if (!input || typeof input !== "object") return null;
  const obj = input as Record<string, unknown>;

  if (typeof obj.action === "string" && "data" in obj) {
    return { action: obj.action, data: obj.data };
  }

  if (typeof obj.type === "string" && "data" in obj) {
    return { action: obj.type, data: obj.data };
  }

  return null;
}

async function handleMembershipActivated(data: MembershipEventData): Promise<void> {
  const [company] = await db
    .select({ id: companies.id })
    .from(companies)
    .where(eq(companies.whopCompanyId, data.company_id))
    .limit(1);

  if (!company) {
    console.warn(`[Webhook] No company found for whop_company_id: ${data.company_id}`);
    return;
  }

  const joinedAt = new Date(data.created_at * 1000);

  await db
    .insert(memberships)
    .values({
      whopMembershipId: data.id,
      companyId: company.id,
      whopUserId: data.user_id,
      joinedAt,
      status: "active",
      username: data.user?.username ?? null,
    })
    .onConflictDoUpdate({
      target: memberships.whopMembershipId,
      set: {
        status: "active",
        joinedAt,
        username: data.user?.username ?? null,
      },
    });

  console.log(`[Webhook] Membership activated: ${data.id} (user: ${data.user_id})`);
}

async function handleMembershipDeactivated(data: MembershipEventData): Promise<void> {
  await db
    .update(memberships)
    .set({ status: "expired" })
    .where(eq(memberships.whopMembershipId, data.id));

  console.log(`[Webhook] Membership expired: ${data.id}`);
}

