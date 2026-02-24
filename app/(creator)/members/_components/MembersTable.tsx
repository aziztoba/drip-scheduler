"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

export interface MemberRow {
  id: string;
  whopUserId: string;
  username: string | null;
  joinedAt: string;
  status: "active" | "cancelled" | "expired";
  completedCount: number;
}

interface Props {
  rows: MemberRow[];
  totalModules: number;
  companyId: string;
}

const PAGE_SIZE = 20;

const TH_STYLE: React.CSSProperties = {
  textAlign: "left",
  padding: "10px 20px",
  fontSize: 11,
  fontWeight: 600,
  color: "#475569",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  whiteSpace: "nowrap",
  borderBottom: "1px solid rgba(255,255,255,0.06)",
};

export default function MembersTable({ rows, totalModules, companyId }: Props) {
  const [search, setSearch] = useState("");
  const [page, setPage]     = useState(0);

  const filtered = rows.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.whopUserId.toLowerCase().includes(q) ||
      (r.username ?? "").toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages - 1);
  const visible    = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  return (
    <div>
      {/* Search */}
      <div className="mb-4 relative max-w-sm">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: "#475569" }}
        />
        <input
          type="text"
          placeholder="Search by username or user ID…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          className="w-full pl-9 pr-4 py-2 text-sm rounded-xl focus:outline-none"
          style={{
            background: "#0D1526",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#E2E8F7",
          }}
        />
      </div>

      {visible.length === 0 ? (
        <div
          className="rounded-2xl p-12 text-center"
          style={{ background: "#0D1526", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <p className="text-sm" style={{ color: "#475569" }}>
            No members match your search.
          </p>
        </div>
      ) : (
        <>
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <table className="w-full text-sm" style={{ background: "#0D1526" }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                  {["User", "Joined", "Days Active", "Progress", "Status", "Actions"].map((h) => (
                    <th key={h} style={TH_STYLE}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((member, i) => {
                  const joined     = new Date(member.joinedAt);
                  const daysActive = Math.floor((Date.now() - joined.getTime()) / 86400000);
                  const pct        = totalModules > 0
                    ? Math.round((member.completedCount / totalModules) * 100)
                    : 0;

                  return (
                    <tr
                      key={member.id}
                      style={{
                        borderTop: i === 0 ? undefined : "1px solid rgba(255,255,255,0.04)",
                      }}
                    >
                      {/* User */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
                            style={{
                              background: "linear-gradient(135deg, #6366F1, #A855F7)",
                            }}
                          >
                            {(member.username ?? member.whopUserId).slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div
                              className="font-medium truncate max-w-[140px]"
                              style={{ color: "#E2E8F7" }}
                            >
                              {member.username ?? "—"}
                            </div>
                            <div
                              className="text-xs font-mono truncate max-w-[140px]"
                              style={{ color: "#475569" }}
                            >
                              {member.whopUserId}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Joined */}
                      <td className="px-5 py-3.5 whitespace-nowrap" style={{ color: "#94A3B8" }}>
                        {joined.toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </td>

                      {/* Days Active */}
                      <td className="px-5 py-3.5" style={{ color: "#94A3B8" }}>
                        {daysActive}d
                      </td>

                      {/* Progress */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2 min-w-[140px]">
                          <div
                            className="flex-1 h-1.5 rounded-full overflow-hidden"
                            style={{ background: "rgba(255,255,255,0.06)" }}
                          >
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${pct}%`,
                                background: "linear-gradient(90deg, #6366F1, #A855F7)",
                              }}
                            />
                          </div>
                          <span
                            className="text-xs whitespace-nowrap shrink-0"
                            style={{ color: "#475569" }}
                          >
                            {member.completedCount}/{totalModules}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                          style={
                            member.status === "active"
                              ? { background: "rgba(34,197,94,0.15)", color: "#22C55E" }
                              : { background: "rgba(255,255,255,0.06)", color: "#475569" }
                          }
                        >
                          {member.status === "active" ? "Active" : "Expired"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/experiences/${companyId}?preview=${member.id}`}
                          target="_blank"
                          className="text-xs font-medium px-2.5 py-1 rounded-lg transition-opacity hover:opacity-80"
                          style={{
                            background: "rgba(99,102,241,0.15)",
                            border: "1px solid rgba(99,102,241,0.25)",
                            color: "#A855F7",
                          }}
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              className="flex items-center justify-between mt-4 text-sm"
              style={{ color: "#94A3B8" }}
            >
              <span>
                {safePage * PAGE_SIZE + 1}–{Math.min((safePage + 1) * PAGE_SIZE, filtered.length)}{" "}
                of {filtered.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={safePage === 0}
                  className="p-1.5 rounded-lg transition-colors disabled:opacity-30"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="text-xs" style={{ color: "#475569" }}>
                  {safePage + 1} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={safePage >= totalPages - 1}
                  className="p-1.5 rounded-lg transition-colors disabled:opacity-30"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
