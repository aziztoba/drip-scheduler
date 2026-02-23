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
    // Avoid hydration mismatch — render placeholder until client mounts
    return <div className="w-10 h-6 bg-slate-200 rounded-full animate-pulse" />;
  }

  return (
    <button
      role="switch"
      aria-checked={enabled}
      onClick={toggle}
      className={`relative inline-flex w-10 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 ${
        enabled ? "bg-indigo-600" : "bg-slate-200"
      }`}
    >
      <span
        className={`inline-block w-4 h-4 rounded-full bg-white shadow transition-transform mt-1 ${
          enabled ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  );
}
