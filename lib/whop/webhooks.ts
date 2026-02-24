/**
 * lib/whop/webhooks.ts
 *
 * Types and payload helpers for Whop webhook events.
 * Signature verification is handled by makeWebhookHandler from @whop-apps/sdk.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface WhopWebhookEvent<T = Record<string, unknown>> {
  action: string;
  data: T;
}

/**
 * Shape of a membership object sent by Whop v5 webhooks.
 * Corresponds to AppMembership in the Whop OpenAPI schema.
 */
export interface MembershipEventData {
  id: string;
  user_id?: string;
  /** Experience / page ID — maps to companies.whopExperienceId */
  page_id: string;
  status: string;
  valid: boolean;
  /** Unix timestamp in seconds */
  created_at: number;
}
