/**
 * lib/whop/client.ts
 *
 * Thin wrapper around Whop's REST API.
 * All functions are async and throw on network/API errors.
 */

const WHOP_API_BASE = "https://api.whop.com/api/v2";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface WhopUser {
  id: string;
  username: string;
  email?: string;
}

export interface WhopMembership {
  id: string;
  user_id: string;
  company_id: string;
  status: "active" | "expired" | "cancelled";
  created_at: string;
  user: WhopUser;
}

export interface WhopTokenResponse {
  access_token: string;
  token_type: string;
  company_id: string;
}

// ── OAuth ─────────────────────────────────────────────────────────────────────

/**
 * Builds the Whop OAuth authorization URL with PKCE (S256) + OIDC nonce.
 * Endpoint: https://api.whop.com/oauth/authorize (confirmed in Whop docs).
 * No client_secret needed — PKCE (code_verifier) replaces it at token exchange.
 */
export function buildWhopOAuthUrl(
  state: string,
  codeChallenge: string,
  nonce: string
): string {
  const params = new URLSearchParams({
    client_id: process.env.WHOP_CLIENT_ID!,
    redirect_uri: process.env.WHOP_REDIRECT_URI!,
    response_type: "code",
    scope: "openid profile",
    state,
    nonce,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });
  return `https://api.whop.com/oauth/authorize?${params.toString()}`;
}

/**
 * Exchanges an authorization code for an access token.
 * Whop uses OAuth 2.1 + PKCE — client_secret is NOT sent; code_verifier replaces it.
 */
export async function exchangeWhopCode(code: string, codeVerifier: string): Promise<WhopTokenResponse> {
  // RFC 6749 §4.1.3 requires application/x-www-form-urlencoded for token requests.
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: process.env.WHOP_REDIRECT_URI!,
    client_id: process.env.WHOP_CLIENT_ID!,
    client_secret: process.env.WHOP_CLIENT_SECRET!,
    code_verifier: codeVerifier,
  });

  console.log("[Whop] Token request body keys:", [...body.keys()].join(", "));
  console.log("[Whop] code_verifier length:", codeVerifier.length, "first8:", codeVerifier.slice(0, 8));

  const res = await fetch("https://api.whop.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const data = await res.json() as Record<string, unknown>;
  console.log("[Whop] Token response:", JSON.stringify(data));

  if (!res.ok) {
    throw new Error(`Whop token exchange failed (${res.status}): ${JSON.stringify(data)}`);
  }

  const company_id =
    (data.company_id as string) ??
    (data.agent_id as string) ??
    (process.env.WHOP_COMPANY_ID as string) ??
    "unknown";

  return {
    access_token: data.access_token as string,
    token_type: (data.token_type as string) ?? "bearer",
    company_id,
  };
}

// ── Memberships ───────────────────────────────────────────────────────────────

export async function getWhopMembership(
  membershipId: string,
  accessToken: string
): Promise<WhopMembership> {
  const res = await fetch(`${WHOP_API_BASE}/memberships/${membershipId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Whop API error ${res.status}: ${await res.text()}`);
  }

  return res.json() as Promise<WhopMembership>;
}

// ── Notifications ─────────────────────────────────────────────────────────────

/**
 * Sends an in-app notification to a Whop user.
 * Called by the daily cron job when a module unlocks.
 */
export async function sendWhopNotification(
  userId: string,
  accessToken: string,
  notification: { title: string; body: string }
): Promise<void> {
  const res = await fetch(`${WHOP_API_BASE}/notifications`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: userId,
      title: notification.title,
      body: notification.body,
    }),
  });

  if (!res.ok) {
    // Log but don't throw — one failed notification shouldn't crash the cron job
    console.error(
      `[Whop] Failed to notify user ${userId}: ${res.status} ${await res.text()}`
    );
  }
}

// ── Iframe verification ───────────────────────────────────────────────────────

/**
 * Verifies the user token sent by Whop's iframe SDK.
 * Returns the user's ID + company ID if valid, null otherwise.
 *
 * In production: replace with Whop's official SDK verification method
 * once the iframeSDK package is available in your app.
 */
export async function verifyWhopIframeToken(
  token: string
): Promise<{ user_id: string; company_id: string } | null> {
  try {
    const res = await fetch(`${WHOP_API_BASE}/me`, {
      headers: { Authorization: `Bearer ${token}` },
      // Cache for 60 seconds to avoid hammering the API on every page render
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { id: string; company_id: string };
    return { user_id: data.id, company_id: data.company_id };
  } catch {
    return null;
  }
}