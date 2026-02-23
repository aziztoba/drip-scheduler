import { getSession } from "@/lib/auth";
import { db, companies } from "@/db";
import { eq } from "drizzle-orm";
import CopyButton from "./_components/CopyButton";
import NotificationsToggle from "./_components/NotificationsToggle";
import DisconnectButton from "./_components/DisconnectButton";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) return null;

  const [company] = await db
    .select({ whopCompanyId: companies.whopCompanyId, plan: companies.plan, createdAt: companies.createdAt })
    .from(companies)
    .where(eq(companies.id, session.companyId))
    .limit(1);

  const appUrl      = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const webhookUrl  = `${appUrl}/api/webhooks/whop`;
  const memberUrl   = `${appUrl}/app/${company?.whopCompanyId ?? session.companyId}`;
  const isPro       = company?.plan === "pro";

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">App configuration and integration details</p>
      </div>

      <div className="space-y-5">

        {/* ── General ─────────────────────────────────────────────────────── */}
        <section className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">General</h2>
          <dl className="space-y-4">

            <div className="flex items-center justify-between">
              <dt className="text-sm text-slate-500">App name</dt>
              <dd className="text-sm font-medium text-slate-900">Drip Content Scheduler</dd>
            </div>

            <div className="flex items-center justify-between gap-4">
              <dt className="text-sm text-slate-500 shrink-0">Whop Company ID</dt>
              <dd className="flex items-center gap-2 min-w-0">
                <code className="text-sm font-mono text-slate-700 truncate">
                  {company?.whopCompanyId ?? "—"}
                </code>
                {company?.whopCompanyId && (
                  <CopyButton value={company.whopCompanyId} />
                )}
              </dd>
            </div>

            <div className="flex items-center justify-between">
              <dt className="text-sm text-slate-500">Plan</dt>
              <dd>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                    isPro
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-indigo-600 border-indigo-300"
                  }`}
                >
                  {isPro ? "Pro Plan" : "Free Plan"}
                </span>
              </dd>
            </div>

          </dl>
        </section>

        {/* ── Webhook ──────────────────────────────────────────────────────── */}
        <section className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-1">Webhook</h2>
          <p className="text-xs text-slate-500 mb-4">
            Add this URL to your Whop app&apos;s webhook settings to automatically track
            when members join.
          </p>

          <div className="flex items-center gap-2 mb-3">
            <code className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono text-slate-700 truncate">
              {webhookUrl}
            </code>
            <CopyButton value={webhookUrl} />
          </div>

          <p className="text-xs text-slate-400">
            Events to subscribe:{" "}
            <code className="bg-slate-100 px-1 rounded text-slate-600">
              membership.went_valid
            </code>{" "}
            <code className="bg-slate-100 px-1 rounded text-slate-600">
              membership.went_invalid
            </code>
          </p>
        </section>

        {/* ── Member Experience ─────────────────────────────────────────────── */}
        <section className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-1">Member Experience</h2>
          <p className="text-xs text-slate-500 mb-4">
            Add this as an iframe page in your Whop hub so members can access their drip content.
          </p>

          <div className="flex items-center gap-2">
            <code className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono text-slate-700 truncate">
              {memberUrl}
            </code>
            <CopyButton value={memberUrl} />
          </div>
        </section>

        {/* ── Notifications ─────────────────────────────────────────────────── */}
        <section className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Notifications</h2>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-900">
                Notify members when a module unlocks
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Members receive an in-app Whop notification each time a new module unlocks
                for them.
              </p>
            </div>
            <NotificationsToggle />
          </div>
        </section>

        {/* ── Danger Zone ───────────────────────────────────────────────────── */}
        <section className="bg-white rounded-xl border border-red-200 p-6">
          <h2 className="text-sm font-semibold text-red-600 mb-1">Danger Zone</h2>
          <p className="text-xs text-slate-500 mb-4">
            Disconnecting will clear your session. Your data is preserved and you can
            reconnect at any time.
          </p>
          <DisconnectButton />
        </section>

      </div>
    </div>
  );
}
