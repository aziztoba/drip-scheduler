"use client";

import { useState } from "react";

interface Props {
  moduleId:         string;
  title:            string;
  content:          string | null;
  videoUrl:         string | null;
  isUnlocked:       boolean;
  isCompleted:      boolean;
  unlockDay:        number;
  membershipId:     string;
  onToggleComplete: (moduleId: string, completed: boolean) => void;
}

export default function ModuleCard({
  moduleId,
  title,
  content,
  videoUrl,
  isUnlocked,
  isCompleted,
  unlockDay,
  membershipId,
  onToggleComplete,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [saving,   setSaving]   = useState(false);

  async function handleToggle(completed: boolean) {
    setSaving(true);
    try {
      const res = await fetch("/api/member/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ membershipId, moduleId, completed }),
      });
      if (res.ok) onToggleComplete(moduleId, completed);
    } finally {
      setSaving(false);
    }
  }

  // ── LOCKED ────────────────────────────────────────────────────────────────
  if (!isUnlocked) {
    return (
      <div
        className="bg-gray-900 rounded-xl border border-gray-800 p-4 mb-3 opacity-60"
        style={{ borderLeft: "3px solid #374151" }}
      >
        <div className="flex items-center gap-3">
          <svg className="w-4 h-4 text-gray-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="flex-1 text-sm text-gray-500 truncate">{title}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-400 shrink-0">
            Unlocks Day {unlockDay}
          </span>
        </div>
      </div>
    );
  }

  // ── UNLOCKED ──────────────────────────────────────────────────────────────
  const borderColor = isCompleted ? "#22c55e" : "#6366f1";

  return (
    <div
      className="bg-gray-900 rounded-xl border border-gray-800 mb-3 overflow-hidden"
      style={{ borderLeft: `3px solid ${borderColor}` }}
    >
      {/* Header — clickable to expand/collapse */}
      <button
        className="w-full flex items-center gap-3 px-4 py-4 text-left"
        onClick={() => setExpanded((e) => !e)}
      >
        {isCompleted ? (
          /* Green checkmark circle */
          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shrink-0">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        ) : (
          /* Empty indigo circle */
          <div className="w-5 h-5 rounded-full border-2 border-indigo-400 shrink-0" />
        )}

        <span className="flex-1 text-sm font-medium text-white truncate">{title}</span>

        <span className="text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-400 shrink-0">
          Day {unlockDay}
        </span>

        <svg
          className={`w-4 h-4 text-gray-500 ml-1 shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className="px-4 pb-4">
          {videoUrl && (
            <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden mb-4">
              <iframe
                src={videoUrl}
                className="w-full h-full"
                allowFullScreen
                title={title}
              />
            </div>
          )}

          {content && (
            <div
              className="prose prose-invert prose-sm max-w-none mb-4 text-gray-300"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}

          {isCompleted ? (
            <button
              onClick={() => handleToggle(false)}
              disabled={saving}
              className="text-xs text-gray-400 underline underline-offset-2 hover:text-gray-200 disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving…" : "Mark incomplete"}
            </button>
          ) : (
            <button
              onClick={() => handleToggle(true)}
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving…" : "Mark complete"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
