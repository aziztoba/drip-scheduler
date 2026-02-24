/**
 * lib/whop/sdk.ts
 *
 * Thin re-export layer over @whop-apps/sdk.
 * Call sites that used the old @whop/sdk dynamic-import shim now resolve
 * directly to the installed SDK.
 */

import { validateToken, hasAccess } from "@whop-apps/sdk";

export type WhopAccessResponse = {
  has_access: boolean;
  access_level: "customer" | "admin" | "no_access";
};

export interface VerifiedWhopUser {
  userId: string;
}

/** Verifies an x-whop-user-token header value via the Whop SDK. */
export async function verifyWhopUserTokenViaSdk(
  hdrs: Headers
): Promise<VerifiedWhopUser | null> {
  const token = hdrs.get("x-whop-user-token");
  if (!token) return null;
  try {
    const result = await validateToken({ token, dontThrow: true });
    if (!result?.userId) return null;
    return { userId: result.userId };
  } catch {
    return null;
  }
}

/** Checks if a user (identified by their token) has access to a Whop resource. */
export async function checkWhopAccessViaSdk(
  resourceId: string,
  token: string
): Promise<WhopAccessResponse | null> {
  try {
    const ok = await hasAccess({ to: resourceId, token });
    return {
      has_access: ok,
      access_level: ok ? "customer" : "no_access",
    };
  } catch {
    return null;
  }
}
