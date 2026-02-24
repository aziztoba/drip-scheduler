"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Course, Module } from "@/db";
import ModuleList from "./ModuleList";
import ModuleForm from "./ModuleForm";
import { ArrowLeft, Eye, Trash2 } from "lucide-react";

interface Props {
  course: Course;
  initialModules: Module[];
}

export default function CourseEditor({ course, initialModules }: Props) {
  const router = useRouter();
  const [moduleList, setModuleList]           = useState<Module[]>(initialModules);
  const [selectedId, setSelectedId]           = useState<string | null>(initialModules[0]?.id ?? null);
  const [isPublished, setIsPublished]         = useState(course.isPublished);
  const [publishing, setPublishing]           = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting]               = useState(false);
  const [simulateDay, setSimulateDay]         = useState(1);

  const selectedModule = moduleList.find((m) => m.id === selectedId) ?? null;

  async function handleAddModule() {
    const res = await fetch(`/api/courses/${course.id}/modules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "New Module", unlockDay: 0 }),
    });
    if (!res.ok) return;
    const mod = (await res.json()) as Module;
    setModuleList((prev) => [...prev, mod]);
    setSelectedId(mod.id);
  }

  async function handleTogglePublish() {
    setPublishing(true);
    const res = await fetch(`/api/courses/${course.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !isPublished }),
    });
    if (res.ok) setIsPublished((prev) => !prev);
    setPublishing(false);
  }

  async function handleDeleteCourse() {
    setDeleting(true);
    const res = await fetch(`/api/courses/${course.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/dashboard");
    } else {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  function handleModuleUpdate(updated: Module) {
    setModuleList((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  }

  function handleModuleDelete(moduleId: string) {
    const remaining = moduleList.filter((m) => m.id !== moduleId);
    setModuleList(remaining);
    if (selectedId === moduleId) setSelectedId(remaining[0]?.id ?? null);
  }

  function handleReorder(reordered: Module[]) {
    setModuleList(reordered);
    fetch(`/api/courses/${course.id}/modules/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: reordered.map((m) => m.id) }),
    });
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <a
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm mb-2 transition-opacity hover:opacity-70"
            style={{ color: "#94A3B8" }}
          >
            <ArrowLeft size={13} /> Back to courses
          </a>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold" style={{ color: "#E2E8F7" }}>
              {course.title}
            </h1>
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={
                isPublished
                  ? { background: "rgba(34,197,94,0.15)", color: "#22C55E" }
                  : { background: "rgba(245,158,11,0.15)", color: "#F59E0B" }
              }
            >
              {isPublished ? "Published" : "Draft"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-5">
          <button
            onClick={handleTogglePublish}
            disabled={publishing}
            className="px-4 py-2 text-sm font-medium rounded-xl transition-opacity hover:opacity-80 disabled:opacity-50"
            style={
              isPublished
                ? {
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#94A3B8",
                  }
                : {
                    background: "rgba(34,197,94,0.15)",
                    border: "1px solid rgba(34,197,94,0.25)",
                    color: "#22C55E",
                  }
            }
          >
            {publishing ? "Saving..." : isPublished ? "Unpublish" : "Publish"}
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 rounded-xl transition-colors"
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.2)",
              color: "#EF4444",
            }}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Two-panel layout */}
      <div className="flex gap-5 items-start">
        <div className="w-64 shrink-0">
          <ModuleList
            modules={moduleList}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onReorder={handleReorder}
            onAddModule={handleAddModule}
            simulateDay={simulateDay}
          />
        </div>

        <div className="flex-1 min-w-0">
          {selectedModule ? (
            <ModuleForm
              key={selectedModule.id}
              courseId={course.id}
              module={selectedModule}
              onUpdate={handleModuleUpdate}
              onDelete={handleModuleDelete}
            />
          ) : (
            <div
              className="rounded-2xl p-16 text-center"
              style={{
                background: "#0D1526",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <p className="text-sm" style={{ color: "#475569" }}>
                {moduleList.length === 0
                  ? 'Click "+ Add module" to create your first module.'
                  : "Select a module from the list to edit it."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Preview as member */}
      {moduleList.length > 0 && (
        <div
          className="mt-6 rounded-2xl p-4"
          style={{
            background: "#0D1526",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Eye size={14} style={{ color: "#A855F7" }} />
              <h2 className="text-sm font-semibold" style={{ color: "#E2E8F7" }}>
                Preview as member
              </h2>
            </div>
            <label
              className="flex items-center gap-2 text-sm"
              style={{ color: "#94A3B8" }}
            >
              Simulate day
              <input
                type="number"
                min={0}
                value={simulateDay}
                onChange={(e) => setSimulateDay(Math.max(0, Number(e.target.value)))}
                className="w-16 px-2 py-1 text-sm text-center rounded-lg focus:outline-none"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#E2E8F7",
                }}
              />
            </label>
            <span className="text-xs" style={{ color: "#475569" }}>
              {moduleList.filter((m) => m.unlockDay <= simulateDay).length} of{" "}
              {moduleList.length} modules unlocked
            </span>
          </div>
          <p className="text-xs mt-2" style={{ color: "#475569" }}>
            Green dot = unlocked on that day · Grey dot = still locked
          </p>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: "rgba(0,0,0,0.7)" }}>
          <div
            className="rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl"
            style={{
              background: "#0D1526",
              border: "1px solid rgba(239,68,68,0.2)",
            }}
          >
            <h2 className="text-lg font-semibold mb-2" style={{ color: "#E2E8F7" }}>
              Delete course?
            </h2>
            <p className="text-sm mb-5" style={{ color: "#94A3B8" }}>
              This will permanently delete this course and all its modules.
              Members will lose access immediately.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDeleteCourse}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium rounded-xl disabled:opacity-50 transition-opacity hover:opacity-80"
                style={{ background: "#EF4444", color: "#fff" }}
              >
                {deleting ? "Deleting..." : "Yes, delete"}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm rounded-xl transition-colors"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#94A3B8",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
