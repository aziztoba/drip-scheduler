import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { validateToken } from "@whop-apps/sdk";
import { getSession } from "@/lib/auth";
import DashboardPage from "../page";

export default async function CompanyDashboardPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const [{ companyId }, session] = await Promise.all([params, getSession()]);

  if (!session) {
    redirect("/api/auth/whop/login");
  }

  // If embedded in Whop, verify the injected user token via the SDK.
  // Falls back silently when the header is absent (direct browser navigation).
  const hdrs = await headers();
  const token = hdrs.get("x-whop-user-token");
  if (token) {
    const verified = await validateToken({ token, dontThrow: true });
    if (!verified?.userId) {
      redirect("/api/auth/whop/login");
    }
  }

  // Canonicalize to the logged-in creator's Whop company id.
  if (companyId !== session.whopCompanyId) {
    redirect(`/dashboard/${session.whopCompanyId}`);
  }

  return DashboardPage();
}
