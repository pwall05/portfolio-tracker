"use client";

import { useState } from "react";

type SyncStatus = "idle" | "syncing" | "done" | "error";

const TOKEN_KEY = "portfolio-sync-token";

export default function SyncButton() {
  const [status, setStatus] = useState<SyncStatus>("idle");

  const handleSync = async () => {
    setStatus("syncing");

    const stored = window.sessionStorage.getItem(TOKEN_KEY) ?? "";
    const token = window.prompt("Enter sync token", stored) ?? "";

    if (!token.trim()) {
      setStatus("error");
      return;
    }

    window.sessionStorage.setItem(TOKEN_KEY, token.trim());

    try {
      const response = await fetch("/api/admin/sync", {
        method: "POST",
        headers: {
          "x-sync-token": token.trim(),
        },
      });

      if (!response.ok) {
        throw new Error("Sync failed");
      }

      setStatus("done");
      window.location.reload();
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  return (
    <button
      type="button"
      onClick={handleSync}
      disabled={status === "syncing"}
      className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.2em] transition ${
        status === "syncing"
          ? "border-white/10 bg-white/10 text-zinc-400"
          : "border-white/20 bg-white/5 text-zinc-200 hover:border-white/40"
      }`}
    >
      {status === "syncing"
        ? "Syncing..."
        : status === "done"
        ? "Synced"
        : status === "error"
        ? "Sync failed"
        : "Sync now"}
    </button>
  );
}
