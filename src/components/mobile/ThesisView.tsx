"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Layers3, Network } from "lucide-react";

import type {
  MobileCompany,
  MobilePortfolioSnapshot,
} from "@/lib/mobile/types";

type GroupMode = "basket" | "primaryThesis";

function getCompanyLogic(company: MobileCompany) {
  return (
    company.thesisSections?.coreThesis ||
    company.thesisSections?.currentView ||
    company.profileSummary?.oneLiner ||
    "No thesis summary yet."
  );
}

function groupCompanies(companies: MobileCompany[], mode: GroupMode) {
  const groups = new Map<string, MobileCompany[]>();

  for (const company of companies) {
    const label =
      mode === "basket"
        ? company.basket || "Unassigned"
        : company.primaryThesis?.label || "No primary thesis";
    const current = groups.get(label) || [];
    current.push(company);
    groups.set(label, current);
  }

  return Array.from(groups.entries())
    .map(([label, items]) => ({
      label,
      items: items.sort((a, b) => a.ticker.localeCompare(b.ticker)),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export default function ThesisView({
  snapshot,
}: {
  snapshot: MobilePortfolioSnapshot;
}) {
  const [mode, setMode] = useState<GroupMode>("basket");
  const groups = useMemo(
    () => groupCompanies(snapshot.companies, mode),
    [mode, snapshot.companies]
  );

  return (
    <main className="space-y-5 pb-24">
      <section className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-200/80">
          Thesis
        </p>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Basket logic
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              {snapshot.theses.length} investment thesis notes,{" "}
              {snapshot.baskets.length} baskets.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1 rounded-lg border border-white/10 bg-zinc-900/80 p-1">
          <button
            type="button"
            onClick={() => setMode("basket")}
            className={`flex h-10 items-center justify-center gap-2 rounded-md text-sm font-medium ${
              mode === "basket"
                ? "bg-white text-zinc-950"
                : "text-zinc-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Layers3 className="h-4 w-4" aria-hidden="true" />
            Basket
          </button>
          <button
            type="button"
            onClick={() => setMode("primaryThesis")}
            className={`flex h-10 items-center justify-center gap-2 rounded-md text-sm font-medium ${
              mode === "primaryThesis"
                ? "bg-white text-zinc-950"
                : "text-zinc-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Network className="h-4 w-4" aria-hidden="true" />
            Thesis
          </button>
        </div>
      </section>

      <section className="space-y-4">
        {groups.map((group) => (
          <div
            key={group.label}
            className="rounded-lg border border-white/10 bg-white/[0.03]"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <h2 className="text-sm font-semibold text-white">{group.label}</h2>
              <span className="rounded bg-white/10 px-2 py-1 text-xs text-zinc-300">
                {group.items.length}
              </span>
            </div>
            <div className="divide-y divide-white/10">
              {group.items.map((company) => (
                <Link
                  key={company.ticker}
                  href={`/company/${encodeURIComponent(company.ticker)}`}
                  className="block px-4 py-3 transition hover:bg-white/[0.04]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-white">
                          {company.ticker}
                        </p>
                        <p className="truncate text-sm text-zinc-300">
                          {company.name}
                        </p>
                      </div>
                      <p className="mt-1 text-xs text-sky-200">
                        {company.primaryThesis?.label || "No primary thesis"}
                      </p>
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-400">
                        {getCompanyLogic(company)}
                      </p>
                    </div>
                    <ChevronRight
                      className="mt-1 h-4 w-4 shrink-0 text-zinc-500"
                      aria-hidden="true"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
