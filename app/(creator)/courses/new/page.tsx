"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

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

export default function NewCoursePage() {
  const router = useRouter();
  const [title, setTitle]             = useState("");
  const [description, setDescription] = useState("");
  const [error, setError]             = useState<string | null>(null);
  const [submitting, setSubmitting]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError("Title is required"); return; }
    setSubmitting(true);
    setError(null);
    try {
      const res  = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), description: description.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError((data as { error?: string }).error ?? "Something went wrong"); return; }
      router.push(`/courses/${(data as { id: string }).id}`);
    } catch {
      setError("Network error — please try again");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-lg">
      <div className="mb-8">
        <a
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm mb-3 transition-opacity hover:opacity-70"
          style={{ color: "#94A3B8" }}
        >
          <ArrowLeft size={14} /> Back to courses
        </a>
        <h1 className="text-2xl font-bold" style={{ color: "#E2E8F7" }}>
          New Course
        </h1>
        <p className="text-sm mt-1" style={{ color: "#94A3B8" }}>
          Add a title to get started. You can configure modules after.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl p-6 space-y-5"
        style={{ background: "#0D1526", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div>
          <label
            className="block text-sm font-medium mb-1.5"
            style={{ color: "#E2E8F7" }}
          >
            Course title <span style={{ color: "#EF4444" }}>*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. 30-Day Trading Masterclass"
            maxLength={256}
            style={INPUT_STYLE}
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-1.5"
            style={{ color: "#E2E8F7" }}
          >
            Description{" "}
            <span className="font-normal" style={{ color: "#475569" }}>
              (optional)
            </span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What will members learn in this course?"
            rows={3}
            style={{ ...INPUT_STYLE, resize: "none" }}
          />
        </div>

        {error && (
          <p
            className="text-sm px-3 py-2 rounded-xl"
            style={{ background: "rgba(239,68,68,0.12)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" }}
          >
            {error}
          </p>
        )}

        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(90deg, #6366F1, #A855F7)" }}
          >
            {submitting ? "Creating..." : "Create course"}
          </button>
          <a
            href="/dashboard"
            className="text-sm transition-colors"
            style={{ color: "#475569" }}
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
