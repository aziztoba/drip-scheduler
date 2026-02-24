/**
 * GET /api/auth/whop/login
 *
 * Initiates the Whop OAuth flow with PKCE.
 *
 * Cookies are set on a 200 HTML response (not a 302 redirect) to guarantee
 * the browser processes Set-Cookie before following the redirect. Some
 * environments (Vercel edge, certain proxies) strip Set-Cookie headers from
 * 3xx redirect responses, causing the oauth_nonce cookie to be absent in the
 * callback → "Invalid state parameter".
 *
 * state = nonce only (short opaque string). The codeVerifier is stored in its
 * own cookie because Whop truncates long state values.
 */

import { NextResponse } from "next/server";
import { buildWhopOAuthUrl } from "@/lib/whop/client";
import { randomBytes, createHash } from "crypto";

function base64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 10, // 10 minutes
  path: "/",
};

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

  const nonce = randomBytes(16).toString("hex"); // 32 hex chars — Whop preserves this
  const state = nonce;

  const authUrl = buildWhopOAuthUrl(state, codeChallenge, nonce);

  // Return a 200 HTML page that stores the cookies BEFORE redirecting.
  // This is more reliable than NextResponse.redirect() + Set-Cookie because
  // some environments strip Set-Cookie headers from 3xx responses.
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Signing in…</title>
  <style>
    body { font-family: system-ui, sans-serif; display: flex; align-items: center;
           justify-content: center; min-height: 100vh; margin: 0; background: #080E1A; }
    p { color: #94A3B8; font-size: 14px; }
  </style>
</head>
<body>
  <p>Redirecting to Whop…</p>
  <script>window.location.replace(${JSON.stringify(authUrl)});</script>
</body>
</html>`;

  const response = new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });

  response.cookies.set("oauth_nonce", nonce, COOKIE_OPTS);
  response.cookies.set("oauth_code_verifier", codeVerifier, COOKIE_OPTS);

  return response;
}
