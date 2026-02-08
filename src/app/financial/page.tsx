import SyncButton from "@/components/financial/SyncButton";
import { formatDateTime } from "@/lib/format";
import { getFinancialOverview } from "@/lib/data";

function buildPolylinePoints(values: number[], width = 240, height = 80) {
  if (values.length === 0) {
    return "";
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = values.length === 1 ? 0 : width / (values.length - 1);

  return values
    .map((value, index) => {
      const x = (step * index).toFixed(1);
      const y = (height - ((value - min) / range) * height).toFixed(1);
      return `${x},${y}`;
    })
    .join(" ");
}

export default async function FinancialPage() {
  const {
    baseSymbol,
    compareSymbol,
    compareSparkline,
    financialSnapshot,
    history,
    kpiRows,
    labels,
    lastUpdated,
    lastSync,
    syncLogs,
    modelPipelineSteps,
    operatingMarginSeries,
    freeCashFlowSeries,
    sparkline,
    upcomingWork,
  } = await getFinancialOverview();

  const lastUpdatedLabel = lastUpdated
    ? `Last sync: ${formatDateTime(lastUpdated)}`
    : "Last sync: pending";

  const lastSyncLabel = lastSync
    ? `Last job: ${formatDateTime(lastSync.synced_at)} (${lastSync.status})`
    : "Last job: none";

  const operatingMarginPoints = buildPolylinePoints(operatingMarginSeries ?? []);
  const freeCashFlowPoints = buildPolylinePoints(freeCashFlowSeries ?? []);

  return (
    <main className="grid gap-8 lg:grid-cols-[1.55fr_0.75fr]">
      <div className="space-y-10">
        <section className="space-y-4 rounded-3xl border border-white/10 bg-white/5 px-6 py-6">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
            Financial Information
          </p>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Historical results, then projections
              </h1>
              <p className="mt-2 text-zinc-300">
                Start with clean history; layer forecasting models later.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="space-y-2 text-right">
                <span className="block rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs uppercase tracking-[0.2em] text-zinc-300">
                  {lastUpdatedLabel}
                </span>
                <span className="block rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs uppercase tracking-[0.2em] text-zinc-400">
                  {lastSyncLabel}
                </span>
              </div>
              <SyncButton />
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {history.length > 0 ? (
            history.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/10 bg-black/30 px-6 py-5"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                  {item.label}
                </p>
                <p className="mt-3 text-2xl font-semibold text-white">
                  {item.value}
                </p>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-white/10 bg-black/30 px-6 py-8 text-sm text-zinc-400 sm:col-span-3">
              No financial history loaded yet.
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                Charts
              </p>
              <h2 className="mt-2 text-2xl font-semibold">KPI trends</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-zinc-400">
              <div className="rounded-full border border-white/10 bg-black/30 px-4 py-2">
                Compare:{" "}
                <span className="text-zinc-200">{compareSymbol}</span>
              </div>
              {["3Y", "5Y", "Max"].map((range) => (
                <span
                  key={range}
                  className={`rounded-full border border-white/10 px-4 py-2 ${
                    range === "5Y"
                      ? "bg-white text-zinc-900"
                      : "bg-black/30 text-zinc-300"
                  }`}
                >
                  {range}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    Revenue ({baseSymbol} vs {compareSymbol})
                  </p>
                  <p className="mt-2 text-2xl font-semibold">
                    {history[0]?.value ?? "—"}
                  </p>
                </div>
                <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-emerald-300">
                  Annual view
                </span>
              </div>
              <div className="mt-6 flex h-28 items-end gap-2">
                {sparkline.length > 0 ? (
                  sparkline.map((value, index) => (
                    <div
                      key={`rev-${index}`}
                      className="flex-1 transition-transform duration-300 hover:-translate-y-1"
                    >
                      <div
                        className="w-full rounded-full bg-gradient-to-t from-emerald-400/30 to-emerald-400/70 shadow-[0_0_18px_rgba(52,211,153,0.35)]"
                        style={{ height: `${value}%` }}
                      />
                      <div
                        className="mt-1 w-full rounded-full bg-gradient-to-t from-sky-400/30 to-sky-400/70 shadow-[0_0_18px_rgba(56,189,248,0.35)]"
                        style={{ height: `${compareSparkline[index] ?? 0}%` }}
                      />
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-zinc-400">
                    Revenue history not available.
                  </div>
                )}
              </div>
              <div className="mt-4 flex justify-between text-xs text-zinc-500">
                {labels.length > 0
                  ? labels.map((label) => <span key={label}>{label}</span>)
                  : ["—", "—", "—", "—", "—"].map((label, index) => (
                      <span key={`${label}-${index}`}>{label}</span>
                    ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-zinc-400">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  {baseSymbol}
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-sky-400" />
                  {compareSymbol}
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                KPI selector
              </p>
              <div className="mt-4 space-y-3">
                {kpiRows.length > 0 ? (
                  kpiRows.map((row) => (
                    <div
                      key={row.name}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm transition hover:border-white/30"
                    >
                      <div>
                        <span className="text-zinc-200">{row.name}</span>
                        <p className="text-xs text-zinc-500">
                          {baseSymbol} vs {compareSymbol}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-white">{row.value}</p>
                        <p className="text-xs text-emerald-300">{row.trend}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-sm text-zinc-400">
                    KPI data not available yet.
                  </div>
                )}
              </div>
              <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                  Overlay
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs uppercase tracking-[0.2em] text-zinc-400">
                  {["Revenue", "Margins", "FCF", "EPS"].map((item) => (
                    <span
                      key={item}
                      className={`rounded-full border border-white/10 px-3 py-2 ${
                        item === "Revenue"
                          ? "bg-white text-zinc-900"
                          : "bg-black/30 text-zinc-300"
                      }`}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    Operating Margin
                  </p>
                  <p className="mt-2 text-2xl font-semibold">
                    {history[1]?.value ?? "—"}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-zinc-300">
                  {baseSymbol}
                </span>
              </div>
              <div className="mt-6 h-28 rounded-2xl border border-white/10 bg-black/40 p-3">
                <svg
                  viewBox="0 0 240 80"
                  className="h-full w-full"
                  aria-hidden="true"
                >
                  {operatingMarginPoints ? (
                    <polyline
                      fill="none"
                      stroke="rgba(52,211,153,0.9)"
                      strokeWidth="2"
                      points={operatingMarginPoints}
                    />
                  ) : (
                    <polyline
                      fill="none"
                      stroke="rgba(52,211,153,0.4)"
                      strokeWidth="2"
                      points="0,60 60,55 120,48 180,44 240,40"
                    />
                  )}
                </svg>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    Free Cash Flow
                  </p>
                  <p className="mt-2 text-2xl font-semibold">
                    {history[2]?.value ?? "—"}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-zinc-300">
                  {baseSymbol}
                </span>
              </div>
              <div className="mt-6 h-28 rounded-2xl border border-white/10 bg-black/40 p-3">
                <svg
                  viewBox="0 0 240 80"
                  className="h-full w-full"
                  aria-hidden="true"
                >
                  {freeCashFlowPoints ? (
                    <polyline
                      fill="none"
                      stroke="rgba(56,189,248,0.9)"
                      strokeWidth="2"
                      points={freeCashFlowPoints}
                    />
                  ) : (
                    <polyline
                      fill="none"
                      stroke="rgba(56,189,248,0.4)"
                      strokeWidth="2"
                      points="0,70 60,62 120,56 180,50 240,44"
                    />
                  )}
                </svg>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Sync History</h2>
            <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Last 5 runs
            </span>
          </div>
          <div className="mt-4 grid gap-3">
            {syncLogs.length > 0 ? (
              syncLogs.map((log) => (
                <div
                  key={`${log.synced_at}-${log.symbols}`}
                  className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-sm text-zinc-200"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-white">
                      {formatDateTime(log.synced_at)}
                    </span>
                    <span
                      className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.2em] ${
                        log.status === "success"
                          ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                          : "border-rose-400/30 bg-rose-400/10 text-rose-300"
                      }`}
                    >
                      {log.status}
                    </span>
                  </div>
                  <p className="mt-2 text-xs uppercase tracking-[0.2em] text-zinc-500">
                    {log.symbols}
                  </p>
                  {log.message ? (
                    <p className="mt-2 text-sm text-zinc-400">{log.message}</p>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-white/10 bg-black/30 px-5 py-6 text-sm text-zinc-400">
                No sync runs yet.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-2xl font-semibold">Model pipeline</h2>
          <div className="mt-4 grid gap-3">
            {modelPipelineSteps.map((step) => (
              <div
                key={step}
                className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4"
              >
                <p className="text-sm text-zinc-200">{step}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-zinc-500">
                  Coming soon
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <aside className="space-y-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
            Snapshot
          </p>
          <div className="mt-4 space-y-3 text-sm text-zinc-300">
            {financialSnapshot.length > 0 ? (
              financialSnapshot.map((item) => <p key={item}>{item}</p>)
            ) : (
              <p className="text-sm text-zinc-400">No snapshot data.</p>
            )}
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
            Upcoming Work
          </p>
          <div className="mt-4 space-y-3 text-sm text-zinc-300">
            {upcomingWork.length > 0 ? (
              upcomingWork.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3"
                >
                  <p>{item}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-400">Nothing queued yet.</p>
            )}
          </div>
        </div>
      </aside>
    </main>
  );
}
