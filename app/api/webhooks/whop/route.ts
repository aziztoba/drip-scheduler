/**
 * POST /api/webhooks/whop
 *
 * Receives and processes Whop membership lifecycle events.
 * Uses makeWebhookHandler from @whop-apps/sdk for Standard Webhooks signature
 * verification and typed payload parsing.
 *
 * Handled events:
 *  - membership.went_valid   → upsert membership as active
 *  - membership.went_invalid → mark membership as expired
 */

export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { makeWebhookHandler } from "@whop-apps/sdk";
import { db, memberships } from "@/db";
import { eq } from "drizzle-orm";
import { resolveCompanyFromWhopResourceId } from "@/lib/whop/resource-map";
import type { MembershipEventData } from "@/lib/whop/webhooks";

const handle = makeWebhookHandler({
  signatureKey: process.env.WHOP_WEBHOOK_SECRET,
});

export function POST(req: NextRequest): Promise<Response> {
  return handle(req, {
    membershipWentValid: async (data) => {
      await handleMembershipActivated(data as unknown as MembershipEventData);
    },
    membershipWentInvalid: async (data) => {
      await handleMembershipDeactivated(data as unknown as MembershipEventData);
    },
  });
}

async function handleMembershipActivated(data: MembershipEventData): Promise<void> {
  const userId = data.user_id;
  if (!userId) {
    console.warn("[Webhook] membership.went_valid missing user_id", data.id);
    return;
  }

  // Resolve page_id (Whop experience/page) → internal company
  const resolved = await resolveCompanyFromWhopResourceId(data.page_id);
  if (!resolved) {
    console.warn(`[Webhook] No company found for page_id: ${data.page_id}`);
    return;
  }

  const joinedAt = new Date(data.created_at * 1000);

  await db
    .insert(memberships)
    .values({
      whopMembershipId: data.id,
      companyId: resolved.internalCompanyId,
      whopUserId: userId,
      joinedAt,
      status: "active",
      username: null,
    })
    .onConflictDoUpdate({
      target: memberships.whopMembershipId,
      set: {
        status: "active",
        joinedAt,
      },
    });

  console.log(`[Webhook] Membership activated: ${data.id} (user: ${userId})`);
}

async function handleMembershipDeactivated(data: MembershipEventData): Promise<void> {
  await db
    .update(memberships)
    .set({ status: "expired" })
    .where(eq(memberships.whopMembershipId, data.id));

  console.log(`[Webhook] Membership deactivated: ${data.id}`);
}
