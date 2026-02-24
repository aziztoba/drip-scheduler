"use client";

import { useState } from "react";
import { Lock, ChevronDown, CheckCircle2, Circle, Check } from "lucide-react";

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
  const [saving, setSaving]     = useState(false);

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
        className="rounded-2xl p-4"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.05)",
          borderLeft: "2px solid rgba(255,255,255,0.06)",
          opacity: 0.6,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <Lock size={13} style={{ color: "#475569" }} />
          </div>
          <span
            className="flex-1 text-sm truncate"
            style={{ color: "#475569" }}
          >
            {title}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full shrink-0"
            style={{
              background: "rgba(255,255,255,0.05)",
              color: "#475569",
            }}
          >
            Unlocks Day {unlockDay}
          </span>
        </div>
      </div>
    );
  }

  // ── UNLOCKED ──────────────────────────────────────────────────────────────
  const accentColor = isCompleted ? "#22C55E" : "#6366F1";

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "#0D1526",
        border: "1px solid rgba(255,255,255,0.06)",
        borderLeft: `2px solid ${accentColor}`,
      }}
    >
      {/* Header */}
      <button
        className="w-full flex items-center gap-3 px-4 py-4 text-left"
        onClick={() => setExpanded((e) => !e)}
      >
        {isCompleted ? (
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "#22C55E" }}
          >
            <Check size={11} className="text-white" strokeWidth={3} />
          </div>
        ) : (
          <div
            className="w-5 h-5 rounded-full border-2 shrink-0"
            style={{ borderColor: "#6366F1" }}
          />
        )}

        <span
          className="flex-1 text-sm font-medium truncate"
          style={{ color: "#E2E8F7" }}
        >
          {title}
        </span>

        <span
          className="text-xs px-2 py-0.5 rounded-full shrink-0"
          style={{
            background: "rgba(255,255,255,0.05)",
            color: "#475569",
          }}
        >
          Day {unlockDay}
        </span>

        <ChevronDown
          size={15}
          className="shrink-0 transition-transform ml-1"
          style={{
            color: "#475569",
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {/* Expanded body */}
      {expanded && (
        <div
          className="px-4 pb-5"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          {videoUrl && (
            <div
              className="rounded-xl overflow-hidden mb-4 mt-4"
              style={{ aspectRatio: "16/9", background: "#080E1A" }}
            >
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
              className="prose prose-invert prose-sm max-w-none mb-4 mt-4"
              style={{ color: "#94A3B8" }}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}

          <div className="mt-4">
            {isCompleted ? (
              <button
                onClick={() => handleToggle(false)}
                disabled={saving}
                className="text-xs transition-opacity hover:opacity-70 disabled:opacity-40"
                style={{ color: "#94A3B8", textDecoration: "underline" }}
              >
                {saving ? "Saving…" : "Mark incomplete"}
              </button>
            ) : (
              <button
                onClick={() => handleToggle(true)}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50 transition-opacity hover:opacity-90"
                style={{
                  background: "linear-gradient(90deg, #6366F1, #A855F7)",
                  boxShadow: "0 2px 12px rgba(99,102,241,0.3)",
                }}
              >
                <CheckCircle2 size={15} />
                {saving ? "Saving…" : "Mark complete"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
