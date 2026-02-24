"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Settings } from "lucide-react";
import { Logo } from "@/components/dripcourse/Logo";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Courses", icon: LayoutDashboard },
  { href: "/members",   label: "Members",  icon: Users },
];

const BOTTOM_ITEMS = [
  { href: "/settings", label: "Settings", icon: Settings },
];

function NavItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
      style={{
        background: active ? "rgba(99,102,241,0.12)" : "transparent",
        color: active ? "#E2E8F7" : "#94A3B8",
        borderLeft: active ? "2px solid #6366F1" : "2px solid transparent",
        marginLeft: active ? 0 : 2,
      }}
    >
      <Icon
        className="w-4 h-4 shrink-0"
        style={{ color: active ? "#A855F7" : "#475569" }}
      />
      {label}
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard" || pathname.startsWith("/courses");
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <aside
      className="w-56 flex flex-col py-5 px-3 shrink-0"
      style={{
        background: "#0D1526",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Logo */}
      <div className="px-2 mb-8">
        <Logo compact={false} />
      </div>

      {/* Main nav */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.href} {...item} active={isActive(item.href)} />
        ))}
      </nav>

      {/* Bottom nav */}
      <nav className="space-y-1">
        {BOTTOM_ITEMS.map((item) => (
          <NavItem key={item.href} {...item} active={isActive(item.href)} />
        ))}
      </nav>
    </aside>
  );
}
