import { getSession } from "@/lib/auth";
import { db, companies } from "@/db";
import { eq } from "drizzle-orm";
import CopyButton from "./_components/CopyButton";
import NotificationsToggle from "./_components/NotificationsToggle";
import DisconnectButton from "./_components/DisconnectButton";
import { Webhook, Globe, Bell, AlertTriangle } from "lucide-react";

const SECTION_STYLE: React.CSSProperties = {
  background: "#0D1526",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 16,
  padding: 24,
};

const DIVIDER: React.CSSProperties = {
  borderBottom: "1px solid rgba(255,255,255,0.06)",
  marginBottom: 16,
  paddingBottom: 16,
};

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) return null;

  const [company] = await db
    .select({ whopCompanyId: companies.whopCompanyId, plan: companies.plan, createdAt: companies.createdAt })
    .from(companies)
    .where(eq(companies.id, session.companyId))
    .limit(1);

  const appUrl     = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const webhookUrl = `${appUrl}/api/webhooks/whop`;
  const memberUrl  = `${appUrl}/experiences/${company?.whopCompanyId ?? session.companyId}`;
  const isPro      = company?.plan === "pro";

  return (
    <div style={{ maxWidth: 640 }}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "#E2E8F7" }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: "#94A3B8" }}>
          App configuration and integration details
        </p>
      </div>

      <div className="space-y-4">

        {/* General */}
        <section style={SECTION_STYLE}>
          <h2 className="text-sm font-semibold mb-4" style={{ color: "#E2E8F7" }}>General</h2>
          <dl className="space-y-4">
            <div className="flex items-center justify-between" style={DIVIDER}>
              <dt className="text-sm" style={{ color: "#94A3B8" }}>App name</dt>
              <dd className="text-sm font-medium" style={{ color: "#E2E8F7" }}>
                DripCourse
              </dd>
            </div>

            <div className="flex items-center justify-between gap-4" style={DIVIDER}>
              <dt className="text-sm shrink-0" style={{ color: "#94A3B8" }}>Whop Company ID</dt>
              <dd className="flex items-center gap-2 min-w-0">
                <code
                  className="text-sm font-mono truncate"
                  style={{ color: "#A855F7" }}
                >
                  {company?.whopCompanyId ?? "—"}
                </code>
                {company?.whopCompanyId && <CopyButton value={company.whopCompanyId} />}
              </dd>
            </div>

            <div className="flex items-center justify-between">
              <dt className="text-sm" style={{ color: "#94A3B8" }}>Plan</dt>
              <dd>
                <span
                  className="text-xs font-semibold px-3 py-1 rounded-full"
                  style={
                    isPro
                      ? {
                          background: "linear-gradient(90deg, #6366F1, #A855F7)",
                          color: "#fff",
                        }
                      : {
                          background: "rgba(99,102,241,0.15)",
                          border: "1px solid rgba(99,102,241,0.3)",
                          color: "#A855F7",
                        }
                  }
                >
                  {isPro ? "Pro Plan" : "Free Plan"}
                </span>
              </dd>
            </div>
          </dl>
        </section>

        {/* Webhook */}
        <section style={SECTION_STYLE}>
          <div className="flex items-center gap-2 mb-1">
            <Webhook size={15} style={{ color: "#A855F7" }} />
            <h2 className="text-sm font-semibold" style={{ color: "#E2E8F7" }}>Webhook</h2>
          </div>
          <p className="text-xs mb-4" style={{ color: "#94A3B8" }}>
            Add this URL to your Whop app&apos;s webhook settings to automatically track when members join.
          </p>
          <div className="flex items-center gap-2 mb-3">
            <code
              className="flex-1 px-3 py-2 text-sm font-mono truncate rounded-xl"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#94A3B8",
              }}
            >
              {webhookUrl}
            </code>
            <CopyButton value={webhookUrl} />
          </div>
          <p className="text-xs" style={{ color: "#475569" }}>
            Events to subscribe:{" "}
            <code
              className="px-1.5 py-0.5 rounded-md text-xs"
              style={{ background: "rgba(255,255,255,0.06)", color: "#A855F7" }}
            >
              membership.went_valid
            </code>{" "}
            <code
              className="px-1.5 py-0.5 rounded-md text-xs"
              style={{ background: "rgba(255,255,255,0.06)", color: "#A855F7" }}
            >
              membership.went_invalid
            </code>
          </p>
        </section>

        {/* Member Experience */}
        <section style={SECTION_STYLE}>
          <div className="flex items-center gap-2 mb-1">
            <Globe size={15} style={{ color: "#A855F7" }} />
            <h2 className="text-sm font-semibold" style={{ color: "#E2E8F7" }}>Member Experience</h2>
          </div>
          <p className="text-xs mb-4" style={{ color: "#94A3B8" }}>
            Add this as an iframe page in your Whop hub so members can access their drip content.
          </p>
          <div className="flex items-center gap-2">
            <code
              className="flex-1 px-3 py-2 text-sm font-mono truncate rounded-xl"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#94A3B8",
              }}
            >
              {memberUrl}
            </code>
            <CopyButton value={memberUrl} />
          </div>
        </section>

        {/* Notifications */}
        <section style={SECTION_STYLE}>
          <div className="flex items-center gap-2 mb-4">
            <Bell size={15} style={{ color: "#A855F7" }} />
            <h2 className="text-sm font-semibold" style={{ color: "#E2E8F7" }}>Notifications</h2>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium" style={{ color: "#E2E8F7" }}>
                Notify members when a module unlocks
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#94A3B8" }}>
                Members receive an in-app Whop notification each time a new module unlocks for them.
              </p>
            </div>
            <NotificationsToggle />
          </div>
        </section>

        {/* Danger Zone */}
        <section
          style={{
            ...SECTION_STYLE,
            border: "1px solid rgba(239,68,68,0.2)",
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={15} style={{ color: "#EF4444" }} />
            <h2 className="text-sm font-semibold" style={{ color: "#EF4444" }}>Danger Zone</h2>
          </div>
          <p className="text-xs mb-4" style={{ color: "#94A3B8" }}>
            Disconnecting will clear your session. Your data is preserved and you can reconnect at any time.
          </p>
          <DisconnectButton />
        </section>

      </div>
    </div>
  );
}
