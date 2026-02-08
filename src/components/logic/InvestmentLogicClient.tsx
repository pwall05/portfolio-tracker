"use client";

import Link from "next/link";
import { useState } from "react";

import type { CompanyRef, MindmapTheme } from "@/lib/data";

type InvestmentLogicClientProps = {
  trends: string[];
  focusCompanies: CompanyRef[];
  mindmap: MindmapTheme[];
  portfolioPulse: string[];
  researchQueue: string[];
};

export default function InvestmentLogicClient({
  trends,
  focusCompanies,
  mindmap,
  portfolioPulse,
  researchQueue,
}: InvestmentLogicClientProps) {
  const [view, setView] = useState<"list" | "mindmap">("list");

  return (
    <main className="grid gap-8 lg:grid-cols-[1.55fr_0.75fr]">
      <div className="space-y-10">
        <section className="space-y-4 rounded-3xl border border-white/10 bg-white/5 px-6 py-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                Investment Logic
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                Thesis library + macro context
              </h1>
              <p className="mt-2 text-zinc-300">
                Capture the “why” behind each holding and how it connects to
                bigger trends.
              </p>
            </div>
            <div className="rounded-full border border-white/10 bg-black/40 p-1 text-xs uppercase tracking-[0.2em] text-zinc-300">
              <button
                type="button"
                onClick={() => setView("list")}
                className={
                  view === "list"
                    ? "rounded-full bg-white px-4 py-2 text-zinc-900"
                    : "px-4 py-2 text-zinc-300"
                }
              >
                List view
              </button>
              <button
                type="button"
                onClick={() => setView("mindmap")}
                className={
                  view === "mindmap"
                    ? "rounded-full bg-white px-4 py-2 text-zinc-900"
                    : "px-4 py-2 text-zinc-300"
                }
              >
                Mindmap
              </button>
            </div>
          </div>
        </section>

        {view === "list" ? (
          <div className="space-y-8">
            <section className="grid gap-4 sm:grid-cols-3">
              {trends.length > 0 ? (
                trends.map((trend) => (
                  <div
                    key={trend}
                    className="rounded-2xl border border-white/10 bg-black/30 px-6 py-5"
                  >
                    <p className="text-sm text-zinc-200">{trend}</p>
                    <p className="mt-3 text-xs uppercase tracking-[0.2em] text-zinc-500">
                      Macro trend
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-white/10 bg-black/30 px-6 py-8 text-sm text-zinc-400 sm:col-span-3">
                  No macro trends yet.
                </div>
              )}
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                    Company Thesis
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">Focus list</h2>
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-zinc-300">
                  Linked to portfolio
                </span>
              </div>

              <div className="mt-6 grid gap-3">
                {focusCompanies.length > 0 ? (
                  focusCompanies.map((company) => (
                    <Link
                      key={company.symbol}
                      href={`/company/${company.symbol}`}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-5 py-4 transition hover:border-white/30"
                    >
                      <div>
                        <p className="text-base font-semibold text-white">
                          {company.symbol}
                        </p>
                        <p className="text-sm text-zinc-400">
                          {company.name}
                        </p>
                      </div>
                      <span className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                        Thesis
                      </span>
                    </Link>
                  ))
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-sm text-zinc-400">
                    No focus companies added yet.
                  </div>
                )}
              </div>
            </section>
          </div>
        ) : (
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                  Mindmap View
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  Theme → Sub-theme → Company
                </h2>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-zinc-300">
                Preview
              </span>
            </div>

            <div className="relative mt-8 space-y-8">
              {mindmap.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-black/30 px-6 py-8 text-sm text-zinc-400">
                  Mindmap data will appear here once themes are defined.
                </div>
              ) : (
                <>
                  <div className="pointer-events-none absolute left-6 top-0 hidden h-full w-px bg-gradient-to-b from-white/20 via-white/10 to-transparent lg:block" />
                  {mindmap.map((theme) => (
                    <div
                      key={theme.theme}
                      className="relative rounded-2xl border border-white/10 bg-black/30 p-5 shadow-[0_0_30px_rgba(255,255,255,0.06)]"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                            Theme
                          </p>
                          <h3 className="mt-2 text-xl font-semibold text-white">
                            {theme.theme}
                          </h3>
                          <p className="mt-2 text-sm text-zinc-300">
                            {theme.summary}
                          </p>
                        </div>
                        <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-zinc-300">
                          {theme.subThemes.length} sub-themes
                        </span>
                      </div>

                      <div className="relative mt-6 grid gap-4 lg:grid-cols-2">
                        <div className="pointer-events-none absolute left-0 top-6 hidden h-full w-px bg-gradient-to-b from-white/20 via-white/10 to-transparent lg:block" />
                        {theme.subThemes.map((sub) => (
                          <div
                            key={sub.name}
                            className="relative rounded-2xl border border-white/10 bg-black/40 p-4 transition hover:border-white/30"
                          >
                            <div className="pointer-events-none absolute left-0 top-6 hidden h-px w-5 bg-white/20 lg:block" />
                            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                              Sub-theme
                            </p>
                            <h4 className="mt-2 text-lg font-semibold text-white">
                              {sub.name}
                            </h4>
                            <p className="mt-2 text-sm text-zinc-300">
                              {sub.summary}
                            </p>
                            <div className="mt-4 grid gap-2">
                              {sub.companies.map((company) => (
                                <Link
                                  key={company.symbol}
                                  href={`/company/${company.symbol}`}
                                  className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-200 transition hover:border-white/30 hover:bg-black/50"
                                >
                                  <span className="font-semibold text-white">
                                    {company.symbol}
                                  </span>
                                  <span className="text-xs text-zinc-400">
                                    {company.summary}
                                  </span>
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </section>
        )}
      </div>

      <aside className="space-y-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
            Portfolio Pulse
          </p>
          <div className="mt-4 space-y-3 text-sm text-zinc-300">
            {portfolioPulse.length > 0 ? (
              portfolioPulse.map((item) => <p key={item}>{item}</p>)
            ) : (
              <p className="text-sm text-zinc-400">No pulse data yet.</p>
            )}
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
            Research Queue
          </p>
          <div className="mt-4 space-y-3 text-sm text-zinc-300">
            {researchQueue.length > 0 ? (
              researchQueue.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3"
                >
                  <p>{item}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-400">
                Add research tasks to track.
              </p>
            )}
          </div>
        </div>
      </aside>
    </main>
  );
}
