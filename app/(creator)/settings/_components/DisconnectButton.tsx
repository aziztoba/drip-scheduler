"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";

export default function DisconnectButton() {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading]       = useState(false);

  async function handleDisconnect() {
    setLoading(true);
    await fetch("/api/auth/session", { method: "DELETE" });
    window.location.href = "/";
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-3">
        <p className="text-sm" style={{ color: "#94A3B8" }}>
          This will log you out. Continue?
        </p>
        <button
          onClick={handleDisconnect}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium rounded-xl disabled:opacity-50 transition-opacity hover:opacity-80"
          style={{ background: "#EF4444", color: "#fff" }}
        >
          {loading ? "Logging out…" : "Yes, disconnect"}
        </button>
        <button
          onClick={() => setConfirming(false)}
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
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-colors hover:opacity-80"
      style={{
        background: "rgba(239,68,68,0.1)",
        border: "1px solid rgba(239,68,68,0.25)",
        color: "#EF4444",
      }}
    >
      <LogOut size={14} />
      Disconnect Whop
    </button>
  );
}
