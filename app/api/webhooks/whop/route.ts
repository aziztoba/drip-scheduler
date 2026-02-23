/**
 * POST /api/webhooks/whop
 *
 * Receives and processes Whop membership lifecycle events.
 *
 * Events handled:
 *   membership.went_valid   → upsert into memberships table
 *   membership.went_invalid → set status = "expired"
 *
 * All other events are acknowledged (200 OK) and ignored.
 */

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import {
  verifyWhopWebhookSignature,
  parseWebhookEvent,
  type MembershipEventData,
} from "@/lib/whop/webhooks";
import { db, memberships, companies } from "@/db";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest): Promise<NextResponse> {
  // ── Read raw body (required for HMAC verification) ────────────────────────
  const rawBody = await req.text();

  // Whop sends the signature in the x-whop-signature header
  const signature = req.headers.get("x-whop-signature");
  const webhookSecret = process.env.WHOP_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("[Webhook] WHOP_WEBHOOK_SECRET not configured");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  // ── Signature verification ─────────────────────────────────────────────────
  if (!verifyWhopWebhookSignature(rawBody, signature, webhookSecret)) {
    console.warn("[Webhook] Rejected — invalid signature", { signature });
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // ── Parse event ────────────────────────────────────────────────────────────
  const event = parseWebhookEvent(rawBody);
  if (!event) {
    return NextResponse.json({ error: "Malformed payload" }, { status: 400 });
  }

  console.log(`[Webhook] ${event.action}`, JSON.stringify(event.data));

  // ── Dispatch ───────────────────────────────────────────────────────────────
  try {
    switch (event.action) {
      case "membership.went_valid":
        await handleMembershipActivated(event.data as unknown as MembershipEventData);
        break;

      case "membership.went_invalid":
        await handleMembershipDeactivated(event.data as unknown as MembershipEventData);
        break;

      default:
        console.log(`[Webhook] Unhandled action: ${event.action}`);
    }

    // Always return 200 so Whop stops retrying.
    return NextResponse.json({ received: true });

  } catch (error) {
    console.error(`[Webhook] Error processing "${event.action}":`, error);
    // Return 500 so Whop retries delivery on transient failures.
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}

// ── Handlers ──────────────────────────────────────────────────────────────────

async function handleMembershipActivated(data: MembershipEventData): Promise<void> {
  // Look up our internal company record by Whop's company ID
  const [company] = await db
    .select({ id: companies.id })
    .from(companies)
    .where(eq(companies.whopCompanyId, data.company_id))
    .limit(1);

  if (!company) {
    // Creator hasn't connected our app yet — ignore
    console.warn(`[Webhook] No company found for whop_company_id: ${data.company_id}`);
    return;
  }

  // created_at from Whop is a unix timestamp (seconds)
  const joinedAt = new Date(data.created_at * 1000);

  // Upsert — handles re-activations (member cancels then rejoins)
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
