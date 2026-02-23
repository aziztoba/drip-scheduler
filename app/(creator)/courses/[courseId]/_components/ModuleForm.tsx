"use client";

import { useState } from "react";
import type { Module } from "@/db";

interface Props {
  courseId: string;
  module: Module;
  onUpdate: (updated: Module) => void;
  onDelete: (moduleId: string) => void;
}

export default function ModuleForm({ courseId, module, onUpdate, onDelete }: Props) {
  const [title, setTitle] = useState(module.title);
  const [unlockDay, setUnlockDay] = useState(String(module.unlockDay));
  const [videoUrl, setVideoUrl] = useState(module.videoUrl ?? "");
  const [content, setContent] = useState(module.content ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = parseInt(unlockDay, 10);
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (isNaN(parsed) || parsed < 0) {
      setError("Unlock day must be 0 or greater");
      return;
    }

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
    const res = await fetch(`/api/courses/${courseId}/modules/${module.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      onDelete(module.id);
    } else {
      setDeleting(false);
    }
  }

  return (
    <form
      onSubmit={handleSave}
      className="bg-white rounded-xl border border-slate-200 p-6 space-y-4"
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-700">Edit Module</h2>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors"
        >
          {deleting ? "Deleting..." : "Delete module"}
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={256}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Unlock day{" "}
          <span className="text-slate-400 font-normal">(0 = available immediately)</span>
        </label>
        <input
          type="number"
          min={0}
          value={unlockDay}
          onChange={(e) => setUnlockDay(e.target.value)}
          className="w-32 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Video URL
        </label>
        <input
          type="url"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="https://youtube.com/watch?v=..."
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Content</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Module content (HTML or plain text)..."
          rows={10}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y font-mono"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
        {saved && <span className="text-sm text-green-600">Saved!</span>}
      </div>
    </form>
  );
}
