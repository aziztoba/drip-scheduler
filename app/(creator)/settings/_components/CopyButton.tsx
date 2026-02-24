"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

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
      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border transition-colors"
      style={
        copied
          ? {
              background: "rgba(34,197,94,0.12)",
              borderColor: "rgba(34,197,94,0.25)",
              color: "#22C55E",
            }
          : {
              background: "rgba(255,255,255,0.04)",
              borderColor: "rgba(255,255,255,0.1)",
              color: "#94A3B8",
            }
      }
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}
