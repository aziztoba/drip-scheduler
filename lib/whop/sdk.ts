type WhopAccessLevel = "customer" | "admin" | "no_access";

export interface WhopAccessResponse {
  has_access: boolean;
  access_level: WhopAccessLevel;
}

export interface VerifiedWhopUser {
  userId: string;
}

type WhopSdkLike = {
  verifyUserToken: (
    headers: Headers,
    opts?: { dontThrow?: boolean }
  ) => Promise<{ userId?: string }>;
  users: {
    checkAccess: (resourceId: string, user: { id: string }) => Promise<WhopAccessResponse>;
  };
  webhooks?: {
    unwrap: (body: string, ctx: { headers: Record<string, string> }) => unknown;
  };
};

let cachedSdk: WhopSdkLike | null | undefined;

async function getWhopSdk(): Promise<WhopSdkLike | null> {
  if (cachedSdk !== undefined) return cachedSdk;

  try {
    const mod = (await import("@whop/sdk")) as {
      Whop?: new (opts: Record<string, string>) => WhopSdkLike;
      default?: new (opts: Record<string, string>) => WhopSdkLike;
    };

    const WhopCtor = mod.Whop ?? mod.default;
    if (!WhopCtor) {
      cachedSdk = null;
      return cachedSdk;
    }

    const appID = process.env.NEXT_PUBLIC_WHOP_APP_ID;
    const apiKey = process.env.WHOP_API_KEY;
    if (!appID || !apiKey) {
      cachedSdk = null;
      return cachedSdk;
    }

    cachedSdk = new WhopCtor({
      appID,
      apiKey,
      ...(process.env.WHOP_WEBHOOK_SECRET
        ? { webhookKey: Buffer.from(process.env.WHOP_WEBHOOK_SECRET).toString("base64") }
        : {}),
    });
    return cachedSdk;
  } catch {
    cachedSdk = null;
    return cachedSdk;
  }
}

export async function verifyWhopUserTokenViaSdk(
  hdrs: Headers
): Promise<VerifiedWhopUser | null> {
  const sdk = await getWhopSdk();
  if (!sdk) return null;

  try {
    const result = await sdk.verifyUserToken(hdrs, { dontThrow: true });
    if (!result?.userId) return null;
    return { userId: result.userId };
  } catch {
    return null;
  }
}

export async function checkWhopAccessViaSdk(
  resourceId: string,
  userId: string
): Promise<WhopAccessResponse | null> {
  const sdk = await getWhopSdk();
  if (!sdk) return null;

  try {
    return await sdk.users.checkAccess(resourceId, { id: userId });
  } catch {
    return null;
  }
}

export async function unwrapWhopWebhookViaSdk(
  body: string,
  headers: Headers
): Promise<unknown | null> {
  const sdk = await getWhopSdk();
  if (!sdk?.webhooks?.unwrap) return null;

  try {
    return sdk.webhooks.unwrap(body, { headers: Object.fromEntries(headers.entries()) });
  } catch {
    return null;
  }
}
