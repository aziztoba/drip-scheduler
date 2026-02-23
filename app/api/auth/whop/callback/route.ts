/**
 * GET /api/auth/whop/callback
 *
 * Handles the OAuth redirect from Whop.
 * state format:  <nonce>.<codeVerifier>
 * The nonce is verified against the oauth_nonce cookie (CSRF).
 * The codeVerifier is extracted directly from state — no separate cookie needed.
 */

import { NextRequest, NextResponse } from "next/server";
import { exchangeWhopCode } from "@/lib/whop/client";
import { createSession, setSessionCookie } from "@/lib/auth";

const DB_ENABLED =
  !!process.env.DATABASE_URL &&
  !process.env.DATABASE_URL.includes("placeholder");

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = req.nextUrl;
  const code         = searchParams.get("code");
  const stateParam   = searchParams.get("state"); // state = nonce (Whop returns it unchanged)
  const storedNonce  = req.cookies.get("oauth_nonce")?.value;
  const codeVerifier = req.cookies.get("oauth_code_verifier")?.value;

  // ── CSRF check: state returned by Whop should match the nonce cookie ──────
  const nonce = stateParam; // state IS the nonce
  if (!nonce || !storedNonce || nonce !== storedNonce) {
    console.warn("[Auth] Nonce mismatch", { nonce, storedNonce });
    return NextResponse.json({ error: "Invalid state parameter" }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ error: "No authorization code received" }, { status: 400 });
  }

  if (!codeVerifier) {
    return NextResponse.json({ error: "Missing PKCE verifier — cookie not found" }, { status: 400 });
  }

  console.log("[Auth] code length:", code.length, "verifier length:", codeVerifier.length);

  try {
    // ── Exchange code for access token ────────────────────────────────────
    const tokenData = await exchangeWhopCode(code, codeVerifier);
    console.log("[Auth] Token keys:", Object.keys(tokenData));

    const { access_token, company_id } = tokenData;

    if (!access_token) {
      throw new Error(`No access_token in response: ${JSON.stringify(tokenData)}`);
    }

    let internalCompanyId: string;

    if (DB_ENABLED) {
      const { db, companies } = await import("@/db");
      const { eq } = await import("drizzle-orm");

      const existing = await db
        .select({ id: companies.id })
        .from(companies)
        .where(eq(companies.whopCompanyId, company_id))
        .limit(1);

      if (existing.length > 0 && existing[0]) {
        await db
          .update(companies)
          .set({ accessToken: access_token })
          .where(eq(companies.whopCompanyId, company_id));
        internalCompanyId = existing[0].id;
      } else {
        const [created] = await db
          .insert(companies)
          .values({ whopCompanyId: company_id, accessToken: access_token, plan: "free" })
          .returning({ id: companies.id });
        if (!created) throw new Error("Failed to create company record");
        internalCompanyId = created.id;
      }
    } else {
      console.log("[Auth] DB not configured — using company_id as internal ID");
      internalCompanyId = company_id ?? "dev-company";
    }

    // ── Create session + redirect ─────────────────────────────────────────
    const sessionToken = await createSession({
      companyId: internalCompanyId,
      whopCompanyId: company_id ?? internalCompanyId,
    });

    const response = NextResponse.redirect(new URL("/dashboard", req.url));

    response.cookies.set("drip_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    response.cookies.delete("oauth_nonce");
    response.cookies.delete("oauth_code_verifier");

    return response;

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[Auth] Callback failed:", message);
    return NextResponse.json({ error: "Authentication failed", detail: message }, { status: 500 });
  }
}
