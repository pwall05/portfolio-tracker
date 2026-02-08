import Link from "next/link";

import { formatDateTime } from "@/lib/format";
import { getFinancialOverview, getPortfolioOverview } from "@/lib/data";

export default async function Home() {
  const {
    stats,
    holdings,
    transactions,
    aggregates,
    positions,
    insightCard,
    spotlight,
    alerts,
  } = await getPortfolioOverview();

  const { lastUpdated } = await getFinancialOverview();
  const freshnessLabel = lastUpdated
    ? `Financials sync: ${formatDateTime(lastUpdated)}`
    : "Financials sync: pending";

  return (
    <main className="grid gap-8 lg:grid-cols-[1.55fr_0.75fr]">
      <div className="space-y-10">
        <section className="space-y-6 rounded-3xl border border-white/10 bg-white/5 px-6 py-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
              Portfolio Overview
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Portfolio Tracker
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-zinc-900">
              Add Holding
            </button>
            <button className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white/90">
              Import
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/10 bg-black/30 px-6 py-5"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                  {stat.label}
                </p>
                <p className="mt-3 text-2xl font-semibold text-white">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                Holdings
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Core positions
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-zinc-300">
                Updated just now
              </div>
              <div className="rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs uppercase tracking-[0.2em] text-zinc-400">
                {freshnessLabel}
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            {holdings.length > 0 ? (
              holdings.map((holding) => (
                <Link
                  key={holding.symbol}
                  href={`/company/${holding.symbol}`}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/30 px-5 py-4 transition hover:border-white/30"
                >
                  <div>
                    <p className="text-base font-semibold text-white">
                      {holding.symbol}
                      <span className="ml-2 text-sm font-normal text-zinc-400">
                        {holding.name}
                      </span>
                    </p>
                    <p className="text-sm text-zinc-400">
                      {holding.shares} shares
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="h-8 w-24 rounded-full bg-gradient-to-r from-emerald-400/50 via-white/20 to-white/5" />
                    <div className="text-right">
                      <p className="text-base font-semibold text-white">
                        {holding.price}
                      </p>
                      <p
                        className={`text-sm ${
                          holding.dayChange.startsWith("-")
                            ? "text-rose-400"
                            : "text-emerald-400"
                        }`}
                      >
                        {holding.dayChange}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-2xl border border-white/10 bg-black/30 px-5 py-8 text-sm text-zinc-400">
                No holdings yet. Add your first position to start tracking.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                Transactions
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Activity log
              </h2>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-zinc-300">
              Sample data
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                Add transaction
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {[
                  { label: "Symbol", placeholder: "AAPL" },
                  { label: "Action", placeholder: "Buy / Sell" },
                  { label: "Quantity", placeholder: "0.00" },
                  { label: "Price", placeholder: "$0.00" },
                  { label: "Date", placeholder: "YYYY-MM-DD" },
                ].map((field) => (
                  <div key={field.label} className="flex flex-col gap-2">
                    <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                      {field.label}
                    </span>
                    <div className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-300">
                      {field.placeholder}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-zinc-900">
                  Save transaction
                </button>
                <button className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white/90">
                  Upload CSV
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                Aggregates (AAPL)
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {aggregates.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-lg border border-white/10 bg-black/40 px-4 py-3"
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                      {item.label}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-zinc-400">
                These update from transactions (logic later).
              </p>
            </div>
          </div>

          <div className="mt-8 overflow-hidden rounded-2xl border border-white/10">
            <div className="grid grid-cols-5 gap-4 border-b border-white/10 bg-black/40 px-4 py-3 text-xs uppercase tracking-[0.2em] text-zinc-400">
              <span>Symbol</span>
              <span>Action</span>
              <span>Quantity</span>
              <span>Price</span>
              <span>Date</span>
            </div>
            <div className="divide-y divide-white/10">
              {transactions.length > 0 ? (
                transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="grid grid-cols-5 gap-4 bg-black/20 px-4 py-3 text-sm text-zinc-200"
                  >
                    <span className="font-semibold text-white">
                      {tx.symbol}
                    </span>
                    <span
                      className={
                        tx.action === "Buy"
                          ? "text-emerald-400"
                          : "text-rose-400"
                      }
                    >
                      {tx.action}
                    </span>
                    <span>{tx.quantity}</span>
                    <span>{tx.price}</span>
                    <span>{tx.date}</span>
                  </div>
                ))
              ) : (
                <div className="px-4 py-6 text-sm text-zinc-400">
                  No transactions yet.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                Position Summary
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Aggregated by holding
              </h2>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-zinc-300">
              Preview
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
            <div className="grid grid-cols-6 gap-4 border-b border-white/10 bg-black/40 px-4 py-3 text-xs uppercase tracking-[0.2em] text-zinc-400">
              <span>Symbol</span>
              <span>Shares</span>
              <span>Avg Cost</span>
              <span>Market Value</span>
              <span>Unrealized</span>
              <span>Realized</span>
            </div>
            <div className="divide-y divide-white/10">
              {positions.length > 0 ? (
                positions.map((position) => (
                  <div
                    key={position.symbol}
                    className="grid grid-cols-6 gap-4 bg-black/20 px-4 py-3 text-sm text-zinc-200"
                  >
                    <span className="font-semibold text-white">
                      {position.symbol}
                    </span>
                    <span>{position.shares}</span>
                    <span>{position.avgCost}</span>
                    <span>{position.marketValue}</span>
                    <span className="text-emerald-400">
                      {position.unrealized}
                    </span>
                    <span
                      className={
                        position.realized === "—"
                          ? "text-zinc-500"
                          : "text-emerald-400"
                      }
                    >
                      {position.realized}
                    </span>
                  </div>
                ))
              ) : (
                <div className="px-4 py-6 text-sm text-zinc-400">
                  No position data yet.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      <aside className="space-y-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
            Insights
          </p>
          <h3 className="mt-2 text-xl font-semibold">{insightCard.title}</h3>
          <div className="mt-4 space-y-3 text-sm text-zinc-300">
            {insightCard.items.length > 0 ? (
              insightCard.items.map((item) => <p key={item}>{item}</p>)
            ) : (
              <p className="text-sm text-zinc-400">
                Add a focus list for today.
              </p>
            )}
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
            Company Spotlight
          </p>
          <h3 className="mt-2 text-xl font-semibold">
            {spotlight.name} ({spotlight.symbol})
          </h3>
          <div className="mt-4 space-y-2 text-sm text-zinc-300">
            {spotlight.details.map((detail) => (
              <p key={detail}>{detail}</p>
            ))}
          </div>
          <Link
            href={`/company/${spotlight.symbol}`}
            className="mt-4 inline-flex rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.2em] text-zinc-200"
          >
            Open thesis
          </Link>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
            Alerts
          </p>
          <div className="mt-4 space-y-3 text-sm text-zinc-300">
            {alerts.length > 0 ? (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3"
                >
                  <p>{alert.text}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-400">No alerts right now.</p>
            )}
          </div>
        </div>
      </aside>
    </main>
  );
}
