import { redirect } from "next/navigation";
import { Inter } from "next/font/google";
import { getSession } from "@/lib/auth";
import Sidebar from "./_components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export default async function CreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/api/auth/whop/login");

  return (
    <div
      className={`${inter.className} flex h-screen overflow-hidden`}
      style={{ background: "#080E1A", color: "#E2E8F7" }}
    >
      <Sidebar />
      <main
        className="flex-1 min-w-0 overflow-y-auto px-8 py-8"
        style={{ background: "#080E1A" }}
      >
        {children}
      </main>
    </div>
  );
}
