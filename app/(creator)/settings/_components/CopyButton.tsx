"use client";

import { useState } from "react";

export default function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
        copied
          ? "bg-green-50 text-green-700 border-green-200"
          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
      }`}
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}
