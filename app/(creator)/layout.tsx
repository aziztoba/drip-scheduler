import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Sidebar from "./_components/Sidebar";

export default async function CreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/api/auth/whop/login");

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 min-w-0 px-8 py-8">{children}</main>
    </div>
  );
}
