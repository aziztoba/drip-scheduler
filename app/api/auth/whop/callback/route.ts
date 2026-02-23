/**
 * GET /api/auth/whop/callback
 *
 * Handles the OAuth redirect from Whop after the creator authorizes the app.
 * Verifies the CSRF state cookie, exchanges the code for an access token,
 * calls the userinfo endpoint to get the real company_id,
 * upserts the company record, then issues a session cookie.
 */

import { NextRequest, NextResponse } from "next/server";
import { exchangeWhopCode } from "@/lib/whop/client";
import { createSession } from "@/lib/auth";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = req.nextUrl;
  const code           = searchParams.get("code");
  const stateParam     = searchParams.get("state");
  const oauthError     = searchParams.get("error");
  const oauthErrorDesc = searchParams.get("error_description");
  const storedState    = req.cookies.get("oauth_state")?.value;
  const codeVerifier   = req.cookies.get("oauth_verifier")?.value;

  // ── Surface any OAuth error Whop sent back ────────────────────────────────
  if (oauthError) {
    console.error("[Auth] OAuth error from Whop:", oauthError, oauthErrorDesc);
    return NextResponse.json(
      { error: oauthError, detail: oauthErrorDesc ?? "No detail provided" },
      { status: 400 }
    );
  }

  // ── CSRF check ────────────────────────────────────────────────────────────
  if (!stateParam || !storedState || stateParam !== storedState) {
    console.warn("[Auth] State mismatch", { stateParam, storedState });
    return NextResponse.json({ error: "Invalid state parameter" }, { status: 400 });
  }

  if (!code) {
    console.warn("[Auth] No code param. Full query:", req.nextUrl.search);
    return NextResponse.json({ error: "No authorization code received" }, { status: 400 });
  }

  if (!codeVerifier) {
    return NextResponse.json({ error: "Missing PKCE verifier cookie" }, { status: 400 });
  }

  try {
    // ── Exchange code for access token ────────────────────────────────────
    const tokenData = await exchangeWhopCode(code, codeVerifier);
    const { access_token } = tokenData;

    if (!access_token) {
      throw new Error(`No access_token in response: ${JSON.stringify(tokenData)}`);
    }

    // ── Fetch real company_id from userinfo endpoint ───────────────────────
    // The token body may not contain company_id reliably; userinfo always does.
    console.log("[Auth] Fetching userinfo…");
    const userinfoRes = await fetch("https://api.whop.com/oauth/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
      cache: "no-store",
    });

    if (!userinfoRes.ok) {
      throw new Error(`Userinfo call failed (${userinfoRes.status}): ${await userinfoRes.text()}`);
    }

    const userinfo = (await userinfoRes.json()) as {
      sub?: string;
      company_id?: string;
      username?: string;
    };

    console.log("[Auth] Userinfo sub:", userinfo.sub, "company_id:", userinfo.company_id);

    const company_id =
      userinfo.company_id ??
      process.env.WHOP_COMPANY_ID ??
      null;

    if (!company_id) {
      throw new Error(
        "Could not determine company_id from userinfo or WHOP_COMPANY_ID env var. " +
        "Make sure the 'profile' scope is granted and WHOP_COMPANY_ID is set as a fallback."
      );
    }

    // ── Upsert company record ─────────────────────────────────────────────
    const { db, companies } = await import("@/db");
    const { eq } = await import("drizzle-orm");

    const existing = await db
      .select({ id: companies.id })
      .from(companies)
      .where(eq(companies.whopCompanyId, company_id))
      .limit(1);

    let internalCompanyId: string;

    if (existing.length > 0 && existing[0]) {
      await db
        .update(companies)
        .set({ accessToken: access_token })
        .where(eq(companies.whopCompanyId, company_id));
      internalCompanyId = existing[0].id;
      console.log("[Auth] Updated existing company:", internalCompanyId);
    } else {
      const [created] = await db
        .insert(companies)
        .values({ whopCompanyId: company_id, accessToken: access_token, plan: "free" })
        .returning({ id: companies.id });
      if (!created) throw new Error("Failed to create company record");
      internalCompanyId = created.id;
      console.log("[Auth] Created new company:", internalCompanyId);
    }

    // ── Issue session cookie + redirect to dashboard ──────────────────────
    const sessionToken = await createSession({
      companyId: internalCompanyId,
      whopCompanyId: company_id,
    });

    const response = NextResponse.redirect(new URL("/dashboard", req.url));

    response.cookies.set("drip_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    response.cookies.delete("oauth_state");
    response.cookies.delete("oauth_verifier");

    return response;

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[Auth] Callback failed:", message);
    return NextResponse.json({ error: "Authentication failed", detail: message }, { status: 500 });
  }
}
