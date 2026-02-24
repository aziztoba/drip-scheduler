"use client";

import { useState } from "react";
import type { Module } from "@/db";
import { Trash2, Check } from "lucide-react";

interface Props {
  courseId: string;
  module: Module;
  onUpdate: (updated: Module) => void;
  onDelete: (moduleId: string) => void;
}

const INPUT_STYLE: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.04)",
  color: "#E2E8F7",
  fontSize: 14,
  outline: "none",
};

const LABEL_STYLE: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 500,
  color: "#E2E8F7",
  marginBottom: 6,
};

export default function ModuleForm({ courseId, module, onUpdate, onDelete }: Props) {
  const [title, setTitle]       = useState(module.title);
  const [unlockDay, setUnlockDay] = useState(String(module.unlockDay));
  const [videoUrl, setVideoUrl] = useState(module.videoUrl ?? "");
  const [content, setContent]   = useState(module.content ?? "");
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [saved, setSaved]       = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = parseInt(unlockDay, 10);
    if (!title.trim()) { setError("Title is required"); return; }
    if (isNaN(parsed) || parsed < 0) { setError("Unlock day must be 0 or greater"); return; }

    setSaving(true);
    const res = await fetch(`/api/courses/${courseId}/modules/${module.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        unlockDay: parsed,
        videoUrl: videoUrl.trim() || null,
        content: content || null,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError((data as { error?: string }).error ?? "Failed to save");
    } else {
      onUpdate(data as Module);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm("Delete this module? This cannot be undone.")) return;
    setDeleting(true);
    const res = await fetch(`/api/courses/${courseId}/modules/${module.id}`, { method: "DELETE" });
    if (res.ok) onDelete(module.id);
    else setDeleting(false);
  }

  return (
    <form
      onSubmit={handleSave}
      className="rounded-2xl p-6 space-y-5"
      style={{ background: "#0D1526", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* Form header */}
      <div
        className="flex items-center justify-between pb-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <h2 className="text-sm font-semibold" style={{ color: "#E2E8F7" }}>
          Edit Module
        </h2>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-opacity hover:opacity-80 disabled:opacity-40"
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.2)",
            color: "#EF4444",
          }}
        >
          <Trash2 size={12} />
          {deleting ? "Deleting..." : "Delete module"}
        </button>
      </div>

      <div>
        <label style={LABEL_STYLE}>Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={256}
          style={INPUT_STYLE}
        />
      </div>

      <div>
        <label style={LABEL_STYLE}>
          Unlock day{" "}
          <span style={{ color: "#475569", fontWeight: 400 }}>(0 = available immediately)</span>
        </label>
        <input
          type="number"
          min={0}
          value={unlockDay}
          onChange={(e) => setUnlockDay(e.target.value)}
          style={{ ...INPUT_STYLE, width: 128 }}
        />
      </div>

      <div>
        <label style={LABEL_STYLE}>Video URL</label>
        <input
          type="url"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="https://youtube.com/watch?v=..."
          style={INPUT_STYLE}
        />
      </div>

      <div>
        <label style={LABEL_STYLE}>Content</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Module content (HTML or plain text)..."
          rows={10}
          style={{ ...INPUT_STYLE, resize: "vertical", fontFamily: "monospace" }}
        />
      </div>

      {error && (
        <p
          className="text-sm px-3 py-2 rounded-xl"
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.2)",
            color: "#EF4444",
          }}
        >
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(90deg, #6366F1, #A855F7)" }}
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
        {saved && (
          <span
            className="flex items-center gap-1.5 text-sm"
            style={{ color: "#22C55E" }}
          >
            <Check size={14} /> Saved
          </span>
        )}
      </div>
    </form>
  );
}
