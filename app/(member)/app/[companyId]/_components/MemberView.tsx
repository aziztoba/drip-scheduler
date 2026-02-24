"use client";

import { useState } from "react";
import ModuleCard from "./ModuleCard";
import { Logo } from "@/components/dripcourse/Logo";

export interface ModuleData {
  id:         string;
  title:      string;
  content:    string | null;
  videoUrl:   string | null;
  unlockDay:  number;
  isUnlocked: boolean;
}

interface Props {
  courseTitle:         string;
  daysSinceJoin:       number;
  modules:             ModuleData[];
  membershipId:        string;
  initialCompletedIds: string[];
}

export default function MemberView({
  courseTitle,
  daysSinceJoin,
  modules,
  membershipId,
  initialCompletedIds,
}: Props) {
  const [completedIds, setCompletedIds] = useState(() => new Set(initialCompletedIds));

  function handleToggleComplete(moduleId: string, completed: boolean) {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (completed) next.add(moduleId);
      else next.delete(moduleId);
      return next;
    });
  }

  const completedCount = completedIds.size;
  const totalCount     = modules.length;
  const progressPct    = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080E1A",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Top bar */}
      <div
        className="sticky top-0 z-10 px-4 py-3"
        style={{
          background: "#0D1526",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3 min-w-0">
              <Logo compact />
              <h1
                className="text-sm font-semibold truncate"
                style={{ color: "#E2E8F7" }}
              >
                {courseTitle}
              </h1>
            </div>
            <span
              className="shrink-0 px-2.5 py-1 text-xs font-semibold rounded-full ml-2"
              style={{
                background: "linear-gradient(90deg, #6366F1, #A855F7)",
                color: "#fff",
              }}
            >
              Day {daysSinceJoin}
            </span>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-3">
            <div
              className="flex-1 h-1.5 rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${progressPct}%`,
                  background: "linear-gradient(90deg, #6366F1, #A855F7, #EC4899)",
                }}
              />
            </div>
            <span className="text-xs shrink-0" style={{ color: "#94A3B8" }}>
              {completedCount}/{totalCount} · {Math.round(progressPct)}%
            </span>
          </div>
        </div>
      </div>

      {/* Module list */}
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "20px 16px" }}>
        {modules.length === 0 ? (
          <p
            className="text-sm text-center py-16"
            style={{ color: "#475569" }}
          >
            No modules have been added yet.
          </p>
        ) : (
          <div className="space-y-3">
            {modules.map((mod) => (
              <ModuleCard
                key={mod.id}
                moduleId={mod.id}
                title={mod.title}
                content={mod.content}
                videoUrl={mod.videoUrl}
                isUnlocked={mod.isUnlocked}
                isCompleted={completedIds.has(mod.id)}
                unlockDay={mod.unlockDay}
                membershipId={membershipId}
                onToggleComplete={handleToggleComplete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
