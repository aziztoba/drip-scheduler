import { redirect } from "next/navigation";
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

  // Canonicalize to the logged-in creator's Whop company id.
  if (companyId !== session.whopCompanyId) {
    redirect(`/dashboard/${session.whopCompanyId}`);
  }

  return DashboardPage();
}
