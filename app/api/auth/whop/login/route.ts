/**
 * GET /api/auth/whop/login
 *
 * Starts the Whop OAuth flow with PKCE (required by Whop for all client types).
 *
 * - `state` cookie  → CSRF protection (verified in callback)
 * - `oauth_verifier` cookie → PKCE code_verifier (used in token exchange)
 */

import { NextResponse } from "next/server";
import { buildWhopOAuthUrl } from "@/lib/whop/client";
import { randomBytes, createHash } from "crypto";

function base64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export async function GET(): Promise<NextResponse> {
  if (!process.env.WHOP_CLIENT_ID || !process.env.WHOP_REDIRECT_URI) {
    return NextResponse.json(
      { error: "OAuth not configured — check environment variables" },
      { status: 500 }
    );
  }

  const codeVerifier  = base64url(randomBytes(48));
  const codeChallenge = base64url(createHash("sha256").update(codeVerifier).digest());
  const state         = randomBytes(16).toString("hex");
  const nonce         = randomBytes(16).toString("hex");

  console.log("[Auth] Login  → verifier first8:", codeVerifier.slice(0, 8), "len:", codeVerifier.length);
  console.log("[Auth] Login  → challenge first8:", codeChallenge.slice(0, 8), "len:", codeChallenge.length);

  const authUrl  = buildWhopOAuthUrl(state, codeChallenge, nonce);
  console.log("[Auth] Redirect URL:", authUrl);
  const response = NextResponse.redirect(authUrl);

  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 10, // 10 minutes — plenty of time to complete the OAuth flow
    path: "/",
  };

  response.cookies.set("oauth_state",    state,        cookieOpts);
  response.cookies.set("oauth_verifier", codeVerifier, cookieOpts);

  return response;
}
