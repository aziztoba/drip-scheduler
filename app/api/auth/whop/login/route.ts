/**
 * GET /api/auth/whop/login
 *
 * Initiates the Whop OAuth flow with PKCE.
 * Encodes the code_verifier inside the state parameter so it survives
 * the round-trip through Whop without relying on a separate cookie.
 *
 * state format:  <32-byte-hex>.<base64url(codeVerifier)>
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

  // PKCE
  const codeVerifier  = base64url(randomBytes(48));
  const codeChallenge = base64url(createHash("sha256").update(codeVerifier).digest());

  // Whop only returns the state value unchanged if it's a short opaque string.
  // Embedding the codeVerifier inside state is unreliable (Whop may truncate it).
  // Instead, store codeVerifier in a cookie alongside the nonce.
  const nonce = randomBytes(16).toString("hex");
  const state = nonce; // state = nonce only (short, opaque)

  // nonce is passed both as state AND as a separate ?nonce= param required
  // by Whop's OIDC implementation.
  const authUrl = buildWhopOAuthUrl(state, codeChallenge, nonce);

  const response = NextResponse.redirect(authUrl);

  // Store nonce for CSRF verification
  response.cookies.set("oauth_nonce", nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10,
    path: "/",
  });

  // Store codeVerifier separately (can't rely on Whop preserving full state)
  response.cookies.set("oauth_code_verifier", codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10,
    path: "/",
  });

  return response;
}
