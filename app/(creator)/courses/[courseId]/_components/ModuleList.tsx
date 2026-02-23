"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Module } from "@/db";

interface Props {
  modules: Module[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onReorder: (reordered: Module[]) => void;
  onAddModule: () => void;
  simulateDay?: number | undefined;
}

function SortableModuleItem({
  module,
  isSelected,
  onSelect,
  simulateDay,
}: {
  module: Module;
  isSelected: boolean;
  onSelect: (id: string) => void;
  simulateDay?: number | undefined;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: module.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer ${
        isSelected
          ? "bg-indigo-50 border border-indigo-200"
          : "bg-white border border-slate-200 hover:border-slate-300"
      }`}
      onClick={() => onSelect(module.id)}
    >
      {/* Drag handle — stopPropagation so clicking it doesn't select the row */}
      <button
        {...attributes}
        {...listeners}
        className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing touch-none shrink-0"
        onClick={(e) => e.stopPropagation()}
        aria-label="Drag to reorder"
      >
        ⠿
      </button>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate">{module.title}</p>
        <span className="text-xs text-slate-400">
          Day {module.unlockDay === 0 ? "0 (instant)" : module.unlockDay}
        </span>
      </div>

      {/* Preview dot — green if unlocked on simulateDay, grey if locked */}
      {simulateDay !== undefined && (
        <span
          className={`w-2 h-2 rounded-full shrink-0 ${
            module.unlockDay <= simulateDay ? "bg-green-400" : "bg-slate-300"
          }`}
          title={module.unlockDay <= simulateDay ? "Unlocked" : "Locked"}
        />
      )}
    </div>
  );
}

export default function ModuleList({
  modules,
  selectedId,
  onSelect,
  onReorder,
  onAddModule,
  simulateDay,
}: Props) {
  const sensors = useSensors(useSensor(PointerSensor));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = modules.findIndex((m) => m.id === active.id);
    const newIndex = modules.findIndex((m) => m.id === over.id);
    onReorder(arrayMove(modules, oldIndex, newIndex));
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-slate-700">Modules</h2>
        <span className="text-xs text-slate-400">{modules.length}</span>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={modules.map((m) => m.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-1.5">
            {modules.map((mod) => (
              <SortableModuleItem
                key={mod.id}
                module={mod}
                isSelected={selectedId === mod.id}
                onSelect={onSelect}
                simulateDay={simulateDay}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {modules.length === 0 && (
        <p className="text-center text-xs text-slate-400 py-6">No modules yet</p>
      )}

      <button
        onClick={onAddModule}
        className="mt-3 w-full py-2 text-sm text-indigo-600 hover:text-indigo-800 border border-dashed border-indigo-200 hover:border-indigo-400 rounded-lg transition-colors"
      >
        + Add module
      </button>
    </div>
  );
}
