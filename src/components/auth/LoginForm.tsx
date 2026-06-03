"use client";

import { FormEvent, useState } from "react";
import { LockKeyhole } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });

    setLoading(false);

    if (!response.ok) {
      setError(
        response.status === 503
          ? "Password protection is not configured."
          : "That password did not work."
      );
      return;
    }

    // Sanitize the "next" redirect to prevent open redirect attacks.
    // Only allow same-origin relative paths starting with / (but not //).
    const rawNext = searchParams.get("next") || "/";
    const safeNext =
      rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";

    router.replace(safeNext);
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto w-full max-w-sm rounded-lg border border-white/10 bg-white/[0.04] p-5"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-emerald-400/30 bg-emerald-400/10 text-emerald-100">
        <LockKeyhole className="h-5 w-5" aria-hidden="true" />
      </div>
      <h1 className="mt-5 text-2xl font-semibold tracking-tight text-white">
        Portfolio
      </h1>
      <p className="mt-2 text-sm leading-6 text-zinc-400">
        Enter the app password to continue.
      </p>

      <label className="mt-6 block">
        <span className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
          Password
        </span>
        <input
          autoComplete="current-password"
          autoFocus
          className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-base text-white outline-none transition placeholder:text-zinc-600 focus:border-emerald-400/50"
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          value={password}
        />
      </label>

      {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}

      <button
        className="mt-5 h-11 w-full rounded-lg bg-white text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={loading || password.length === 0}
        type="submit"
      >
        {loading ? "Checking..." : "Unlock"}
      </button>
    </form>
  );
}
