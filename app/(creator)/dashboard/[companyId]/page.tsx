import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import DashboardPage from "../page";
import { verifyWhopUserAndAccess } from "@/lib/whop/client";

export default async function CompanyDashboardPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const [{ companyId }, session] = await Promise.all([params, getSession()]);

  if (!session) {
    redirect("/api/auth/whop/login");
  }

  // If embedded in Whop and a user token is present, validate dashboard access
  // against the Whop company id. Falls back silently when SDK is not configured.
  const hdrs = await headers();
  const token = hdrs.get("x-whop-user-token");
  if (token) {
    const access = await verifyWhopUserAndAccess(token, session.whopCompanyId);
    if (!access || (access.access_level && access.access_level === "no_access")) {
      redirect("/api/auth/whop/login");
    }
  }

  // Canonicalize to the logged-in creator's Whop company id.
  if (companyId !== session.whopCompanyId) {
    redirect(`/dashboard/${session.whopCompanyId}`);
  }

  return DashboardPage();
}
