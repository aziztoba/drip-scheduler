/**
 * lib/whop/webhooks.ts
 *
 * Webhook signature verification and payload parsing.
 * Whop signs every webhook with HMAC-SHA256.
 */

import { createHmac, timingSafeEqual } from "crypto";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface WhopWebhookEvent<T = Record<string, unknown>> {
  action: string;
  data: T;
}

export interface MembershipEventData {
  id: string;
  user_id: string;
  company_id: string;
  status: string;
  created_at: number; // unix timestamp in seconds — multiply by 1000 for JS Date
  user?: {
    id: string;
    username: string;
  };
}

// ── Signature verification ────────────────────────────────────────────────────

/**
 * Verifies the HMAC-SHA256 signature from Whop webhooks.
 *
 * Whop sends the signature in the `x-whop-signature` header as:
 *   sha256=<hex_digest>
 *
 * This uses timingSafeEqual to prevent timing attacks.
 */
export function verifyWhopWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string
): boolean {
  if (!signatureHeader) return false;

  try {
    const hmac = createHmac("sha256", secret).update(rawBody).digest("hex");
    const expected = Buffer.from(`sha256=${hmac}`, "utf8");
    const received = Buffer.from(signatureHeader, "utf8");

    // Lengths must match before timingSafeEqual
    if (expected.length !== received.length) return false;

    return timingSafeEqual(expected, received);
  } catch {
    return false;
  }
}

// ── Payload parsing ───────────────────────────────────────────────────────────

export function parseWebhookEvent(body: string): WhopWebhookEvent | null {
  try {
    return JSON.parse(body) as WhopWebhookEvent;
  } catch {
    return null;
  }
}
