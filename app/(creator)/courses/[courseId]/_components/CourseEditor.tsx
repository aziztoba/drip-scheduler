"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Course, Module } from "@/db";
import ModuleList from "./ModuleList";
import ModuleForm from "./ModuleForm";

interface Props {
  course: Course;
  initialModules: Module[];
}

export default function CourseEditor({ course, initialModules }: Props) {
  const router = useRouter();
  const [moduleList, setModuleList] = useState<Module[]>(initialModules);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialModules[0]?.id ?? null
  );
  const [isPublished, setIsPublished] = useState(course.isPublished);
  const [publishing, setPublishing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [simulateDay, setSimulateDay] = useState(1);

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
    if (selectedId === moduleId) {
      setSelectedId(remaining[0]?.id ?? null);
    }
  }

  function handleReorder(reordered: Module[]) {
    setModuleList(reordered);
    // Fire-and-forget — optimistic UI, errors are non-fatal
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
            className="text-sm text-slate-400 hover:text-slate-600 transition-colors mb-1 block"
          >
            ← Back to courses
          </a>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900">{course.title}</h1>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                isPublished
                  ? "bg-green-100 text-green-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {isPublished ? "Published" : "Draft"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-6">
          <button
            onClick={handleTogglePublish}
            disabled={publishing}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 ${
              isPublished
                ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {publishing ? "Saving..." : isPublished ? "Unpublish" : "Publish"}
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
          >
            Delete
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
            <div className="bg-white rounded-xl border border-slate-200 p-16 text-center">
              <p className="text-slate-400 text-sm">
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
        <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-slate-700">Preview as member</h2>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              Simulate day
              <input
                type="number"
                min={0}
                value={simulateDay}
                onChange={(e) => setSimulateDay(Math.max(0, Number(e.target.value)))}
                className="w-16 px-2 py-1 text-sm border border-slate-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </label>
            <span className="text-xs text-slate-400">
              {moduleList.filter((m) => m.unlockDay <= simulateDay).length} of{" "}
              {moduleList.length} modules unlocked
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Green dot = unlocked on that day · Grey dot = still locked
          </p>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">Delete course?</h2>
            <p className="text-sm text-slate-500 mb-5">
              This will permanently delete this course and all its modules. Members will
              lose access immediately.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDeleteCourse}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {deleting ? "Deleting..." : "Yes, delete"}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
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
