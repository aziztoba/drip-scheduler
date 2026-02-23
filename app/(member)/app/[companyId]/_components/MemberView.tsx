"use client";

import { useState } from "react";
import ModuleCard from "./ModuleCard";

export interface ModuleData {
  id:         string;
  title:      string;
  content:    string | null;
  videoUrl:   string | null;
  unlockDay:  number;
  isUnlocked: boolean;
}

interface Props {
  courseTitle:          string;
  daysSinceJoin:        number;
  modules:              ModuleData[];
  membershipId:         string;
  initialCompletedIds:  string[];
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
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-lg font-semibold text-white truncate">{courseTitle}</h1>
        <span className="ml-3 shrink-0 px-3 py-1 bg-indigo-500 text-white text-xs font-medium rounded-full">
          Day {daysSinceJoin}
        </span>
      </div>

      {/* Overall progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
          <span>{completedCount} of {totalCount} modules completed</span>
          <span>{Math.round(progressPct)}%</span>
        </div>
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Module list */}
      {modules.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-10">
          No modules have been added yet.
        </p>
      ) : (
        modules.map((mod) => (
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
        ))
      )}
    </div>
  );
}
