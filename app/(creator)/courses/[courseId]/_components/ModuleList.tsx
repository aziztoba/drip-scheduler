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
import { Plus, GripVertical } from "lucide-react";

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

  const isUnlocked = simulateDay !== undefined && module.unlockDay <= simulateDay;

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        background: isSelected ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.03)",
        border: isSelected
          ? "1px solid rgba(99,102,241,0.3)"
          : "1px solid rgba(255,255,255,0.06)",
        borderLeft: isSelected ? "2px solid #6366F1" : "2px solid transparent",
      }}
      className="flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-colors"
      onClick={() => onSelect(module.id)}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing touch-none shrink-0"
        style={{ color: "#475569" }}
        onClick={(e) => e.stopPropagation()}
        aria-label="Drag to reorder"
      >
        <GripVertical size={14} />
      </button>

      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium truncate"
          style={{ color: isSelected ? "#E2E8F7" : "#94A3B8" }}
        >
          {module.title}
        </p>
        <span className="text-xs" style={{ color: "#475569" }}>
          Day {module.unlockDay === 0 ? "0 (instant)" : module.unlockDay}
        </span>
      </div>

      {simulateDay !== undefined && (
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ background: isUnlocked ? "#22C55E" : "#334155" }}
          title={isUnlocked ? "Unlocked" : "Locked"}
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
    <div
      className="rounded-2xl p-4"
      style={{
        background: "#0D1526",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold" style={{ color: "#E2E8F7" }}>
          Modules
        </h2>
        <span
          className="text-xs px-2 py-0.5 rounded-full"
          style={{ background: "rgba(255,255,255,0.06)", color: "#475569" }}
        >
          {modules.length}
        </span>
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
        <p className="text-center text-xs py-6" style={{ color: "#475569" }}>
          No modules yet
        </p>
      )}

      <button
        onClick={onAddModule}
        className="mt-3 w-full py-2 text-sm flex items-center justify-center gap-1.5 rounded-xl border border-dashed transition-colors"
        style={{
          borderColor: "rgba(99,102,241,0.3)",
          color: "#A855F7",
        }}
      >
        <Plus size={14} /> Add module
      </button>
    </div>
  );
}
