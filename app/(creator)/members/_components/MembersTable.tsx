"use client";

import { useState } from "react";
import Link from "next/link";

export interface MemberRow {
  id: string;
  whopUserId: string;
  username: string | null;
  joinedAt: string; // serialised ISO string from server
  status: "active" | "cancelled" | "expired";
  completedCount: number;
}

interface Props {
  rows: MemberRow[];
  totalModules: number;
  companyId: string;
}

const PAGE_SIZE = 20;

export default function MembersTable({ rows, totalModules, companyId }: Props) {
  const [search, setSearch]   = useState("");
  const [page, setPage]       = useState(0);

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
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by username or user ID…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          className="w-full max-w-sm px-4 py-2 text-sm border border-slate-200 rounded-lg bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
      </div>

      {visible.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-slate-400 text-sm">No members match your search.</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {["User ID", "Joined", "Days Active", "Progress", "Status", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visible.map((member) => {
                  const joined       = new Date(member.joinedAt);
                  const daysActive   = Math.floor((Date.now() - joined.getTime()) / 86400000);
                  const pct          = totalModules > 0
                    ? Math.round((member.completedCount / totalModules) * 100)
                    : 0;

                  return (
                    <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                      {/* User ID */}
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-slate-900 truncate max-w-[140px]">
                          {member.username ?? "—"}
                        </div>
                        <div className="text-xs text-slate-400 font-mono truncate max-w-[140px]">
                          {member.whopUserId}
                        </div>
                      </td>

                      {/* Joined */}
                      <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap">
                        {joined.toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </td>

                      {/* Days Active */}
                      <td className="px-5 py-3.5 text-slate-600">
                        {daysActive}d
                      </td>

                      {/* Progress */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2 min-w-[140px]">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500 whitespace-nowrap shrink-0">
                            {member.completedCount} / {totalModules}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            member.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {member.status === "active" ? "Active" : "Expired"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/app/${companyId}?preview=${member.id}`}
                          target="_blank"
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium border border-indigo-200 px-2.5 py-1 rounded-lg hover:bg-indigo-50 transition-colors"
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
            <div className="flex items-center justify-between mt-4 text-sm text-slate-600">
              <span>
                {safePage * PAGE_SIZE + 1}–{Math.min((safePage + 1) * PAGE_SIZE, filtered.length)}{" "}
                of {filtered.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={safePage === 0}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  ← Prev
                </button>
                <span className="text-slate-400 text-xs">
                  {safePage + 1} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={safePage >= totalPages - 1}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
