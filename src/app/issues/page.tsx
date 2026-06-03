import IssueList from "@/components/mobile/IssueList";
import { getMobileSnapshot } from "@/lib/mobile/snapshot";

export const dynamic = "force-dynamic";

export default async function IssuesPage() {
  const snapshot = await getMobileSnapshot();
  const errors = snapshot.issues.filter((issue) => issue.severity === "error");
  const warnings = snapshot.issues.filter(
    (issue) => issue.severity === "warning"
  );

  return (
    <main className="space-y-5 pb-24">
      <section className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-200/80">
          Issues
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Vault contract checks
        </h1>
        <div className="grid grid-cols-3 gap-2 pt-2">
          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
              Total
            </p>
            <p className="mt-1 text-xl font-semibold">{snapshot.issues.length}</p>
          </div>
          <div className="rounded-lg border border-rose-400/25 bg-rose-400/10 p-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-rose-200/70">
              Errors
            </p>
            <p className="mt-1 text-xl font-semibold text-rose-100">
              {errors.length}
            </p>
          </div>
          <div className="rounded-lg border border-amber-400/25 bg-amber-400/10 p-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-amber-200/70">
              Warnings
            </p>
            <p className="mt-1 text-xl font-semibold text-amber-100">
              {warnings.length}
            </p>
          </div>
        </div>
      </section>

      <IssueList issues={snapshot.issues} />
    </main>
  );
}
