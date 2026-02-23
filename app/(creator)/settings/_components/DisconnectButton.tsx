"use client";

import { useState } from "react";

export default function DisconnectButton() {
  const [confirming, setConfirming] = useState(false);
  const [loading,    setLoading]    = useState(false);

  async function handleDisconnect() {
    setLoading(true);
    await fetch("/api/auth/session", { method: "DELETE" });
    window.location.href = "/";
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-3">
        <p className="text-sm text-slate-600">This will log you out. Continue?</p>
        <button
          onClick={handleDisconnect}
          disabled={loading}
          className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Logging out…" : "Yes, disconnect"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
    >
      Disconnect Whop
    </button>
  );
}
