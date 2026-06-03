import { CheckCircle2 } from "lucide-react";

import type { DataIssue } from "@/lib/mobile/types";

export default function IssueList({ issues }: { issues: DataIssue[] }) {
  if (issues.length === 0) {
    return (
      <div className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 p-4 text-emerald-100">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          <div>
            <h2 className="font-semibold">No contract issues found</h2>
            <p className="mt-1 text-sm text-emerald-100/75">
              The generated mobile snapshot matches the current vault contract.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {issues.map((issue) => (
        <article
          key={`${issue.filePath}-${issue.code}-${issue.message}`}
          className={`rounded-lg border p-4 ${
            issue.severity === "error"
              ? "border-rose-400/35 bg-rose-400/10"
              : "border-amber-400/35 bg-amber-400/10"
          }`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${
                issue.severity === "error"
                  ? "bg-rose-400/20 text-rose-100"
                  : "bg-amber-400/20 text-amber-100"
              }`}
            >
              {issue.severity}
            </span>
            {issue.ticker ? (
              <span className="rounded bg-white/10 px-2 py-1 text-xs text-zinc-200">
                {issue.ticker}
              </span>
            ) : null}
          </div>
          <h2 className="mt-3 text-base font-semibold text-white">
            {issue.message}
          </h2>
          <p className="mt-2 break-words text-sm text-zinc-400">
            {issue.filePath}
          </p>
          {issue.suggestedFix ? (
            <p className="mt-3 text-sm leading-6 text-zinc-200">
              {issue.suggestedFix}
            </p>
          ) : null}
        </article>
      ))}
    </div>
  );
}
