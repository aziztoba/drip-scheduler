"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "drip_notify_on_unlock";

export default function NotificationsToggle() {
  const [enabled, setEnabled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setEnabled(localStorage.getItem(STORAGE_KEY) === "true");
    setMounted(true);
  }, []);

  function toggle() {
    const next = !enabled;
    setEnabled(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  }

  if (!mounted) {
    return (
      <div
        className="w-11 h-6 rounded-full animate-pulse"
        style={{ background: "rgba(255,255,255,0.08)" }}
      />
    );
  }

  return (
    <button
      role="switch"
      aria-checked={enabled}
      onClick={toggle}
      className="relative inline-flex w-11 h-6 rounded-full transition-colors focus:outline-none shrink-0"
      style={{
        background: enabled
          ? "linear-gradient(90deg, #6366F1, #A855F7)"
          : "rgba(255,255,255,0.1)",
        boxShadow: enabled ? "0 0 12px rgba(168,85,247,0.4)" : "none",
      }}
    >
      <span
        className="inline-block w-4 h-4 rounded-full bg-white shadow transition-transform mt-1"
        style={{ transform: enabled ? "translateX(20px)" : "translateX(4px)" }}
      />
    </button>
  );
}
