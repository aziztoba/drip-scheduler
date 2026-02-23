/**
 * scripts/register-webhook.ts
 *
 * Registers the Whop webhook endpoint with Whop's API so Whop
 * sends membership lifecycle events to this app.
 *
 * Run with:
 *   npx tsx scripts/register-webhook.ts
 *
 * For local testing you need a public URL (e.g. ngrok):
 *   npx ngrok http 3000
 *   Then set NEXT_PUBLIC_APP_URL=https://<your-ngrok-id>.ngrok.io in .env.local
 */

import { config } from "dotenv";
config({ path: ".env.local" });

async function main() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const clientSecret = process.env.WHOP_CLIENT_SECRET;

  if (!appUrl) {
    console.error("Error: NEXT_PUBLIC_APP_URL is not set in .env.local");
    console.error(
      "Remember to use your ngrok URL for local testing. Run: npx ngrok http 3000"
    );
    process.exit(1);
  }

  if (!clientSecret) {
    console.error("Error: WHOP_CLIENT_SECRET is not set in .env.local");
    process.exit(1);
  }

  const webhookUrl = `${appUrl}/api/webhooks/whop`;
  console.log(`Registering webhook: ${webhookUrl}`);

  const res = await fetch("https://api.whop.com/api/v2/webhooks", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${clientSecret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: webhookUrl,
      events: ["membership.went_valid", "membership.went_invalid"],
    }),
  });

  const data = await res.json();
  console.log(`Response (${res.status}):`, JSON.stringify(data, null, 2));

  if (!res.ok) {
    console.error("Registration failed.");
    process.exit(1);
  }

  console.log("\nWebhook registered successfully.");
  console.log(
    "\nRemember to use your ngrok URL in NEXT_PUBLIC_APP_URL for local testing."
  );
  console.log("Run: npx ngrok http 3000");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
