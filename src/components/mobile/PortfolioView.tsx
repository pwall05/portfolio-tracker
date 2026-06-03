"use client";

import type { ComponentType } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BriefcaseBusiness,
  ChevronRight,
  Eye,
  Layers3,
  Search,
  WalletCards,
} from "lucide-react";

import type {
  MobileCompany,
  MobilePortfolioExposure,
  MobilePortfolioHolding,
  MobilePortfolioSnapshot,
} from "@/lib/mobile/types";

type ViewMode = "holdings" | "allocation" | "accounts" | "watch";

type HoldingRow = MobilePortfolioHolding & {
  company?: MobileCompany;
};

const viewModes: Array<{
  value: ViewMode;
  label: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}> = [
  { value: "holdings", label: "Holdings", icon: BriefcaseBusiness },
  { value: "allocation", label: "Mix", icon: Layers3 },
  { value: "accounts", label: "Accounts", icon: WalletCards },
  { value: "watch", label: "Watch", icon: Eye },
];

const moneyFormatter = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("en-CA", {
  maximumFractionDigits: 0,
});

const percentFormatter = new Intl.NumberFormat("en-CA", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
  style: "percent",
});

function formatMoney(value?: number) {
  if (value === undefined || !Number.isFinite(value)) {
    return "-";
  }

  return moneyFormatter.format(value);
}

function formatSignedMoney(value?: number) {
  if (value === undefined || !Number.isFinite(value)) {
    return "-";
  }

  const prefix = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${prefix}${formatMoney(Math.abs(value))}`;
}

function formatPercent(value?: number) {
  if (value === undefined || !Number.isFinite(value)) {
    return "-";
  }

  return percentFormatter.format(value);
}

function formatSignedPercent(value?: number) {
  if (value === undefined || !Number.isFinite(value)) {
    return "-";
  }

  const prefix = value > 0 ? "+" : "";
  return `${prefix}${formatPercent(value)}`;
}

function formatReportDate(value?: string) {
  if (!value) {
    return "Report pending";
  }

  const dateMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const date = dateMatch
    ? new Date(
        Number(dateMatch[1]),
        Number(dateMatch[2]) - 1,
        Number(dateMatch[3])
      )
    : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return `Report ${date.toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
  })}`;
}

function positionTone(value?: number) {
  if (!value) {
    return "text-zinc-300";
  }

  return value < 0 ? "text-rose-300" : "text-emerald-300";
}

function getExcerpt(company: MobileCompany) {
  return (
    company.thesisSections?.currentView ||
    company.thesisSections?.coreThesis ||
    company.profileSummary?.oneLiner ||
    company.profileSummary?.whyItMatters ||
    "No short thesis excerpt yet."
  );
}

function getCompanyText(company: MobileCompany) {
  return [
    company.ticker,
    company.name,
    company.status,
    company.basket,
    company.primaryThesis?.label,
    company.sector,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function getHoldingText(holding: HoldingRow) {
  return [
    holding.ticker,
    holding.name,
    holding.basket,
    holding.primaryThesis,
    holding.company?.sector,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function buildExposures(
  holdings: HoldingRow[],
  key: "basket" | "primaryThesis",
  totalValue: number
): MobilePortfolioExposure[] {
  const groups = new Map<string, { value: number; companies: string[] }>();

  for (const holding of holdings) {
    const label = holding[key] || "Unassigned";
    const current = groups.get(label) || { value: 0, companies: [] };
    current.value += holding.value;
    current.companies.push(holding.ticker);
    groups.set(label, current);
  }

  return Array.from(groups.entries())
    .map(([label, item]) => ({
      label,
      value: item.value,
      weight: totalValue > 0 ? item.value / totalValue : 0,
      companies: item.companies.sort(),
    }))
    .sort((a, b) => b.value - a.value);
}

function MetricCard({
  label,
  value,
  tone,
  detail,
}: {
  label: string;
  value: string;
  tone?: string;
  detail?: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
      <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </p>
      <p className={`mt-1 text-lg font-semibold ${tone || "text-white"}`}>
        {value}
      </p>
      {detail ? <p className="mt-1 text-xs text-zinc-500">{detail}</p> : null}
    </div>
  );
}

function HoldingCard({ holding }: { holding: HoldingRow }) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-base font-semibold text-white">{holding.ticker}</p>
            {holding.optionLegs > 0 ? (
              <span className="rounded bg-amber-400/10 px-2 py-1 text-[11px] text-amber-200">
                {holding.optionLegs} opt
              </span>
            ) : null}
          </div>
          <p className="mt-1 truncate text-sm text-zinc-300">{holding.name}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-base font-semibold text-white">
            {formatMoney(holding.value)}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            {formatPercent(holding.weight)}
          </p>
        </div>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-emerald-300"
          style={{ width: `${Math.min(100, Math.max(2, holding.weight * 100))}%` }}
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded bg-emerald-400/10 px-2 py-1 text-xs text-emerald-200">
          {holding.basket}
        </span>
        <span className="rounded bg-sky-400/10 px-2 py-1 text-xs text-sky-200">
          {holding.primaryThesis}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 text-xs">
        <span className="text-zinc-500">
          {holding.company?.sector || holding.company?.assetType || "Position"}
        </span>
        <span className={`font-medium ${positionTone(holding.openPnl)}`}>
          {formatSignedMoney(holding.openPnl)} open P&L
        </span>
      </div>
    </>
  );

  if (!holding.company) {
    return (
      <article className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
        {content}
      </article>
    );
  }

  return (
    <Link
      href={`/company/${encodeURIComponent(holding.ticker)}`}
      className="block rounded-lg border border-white/10 bg-white/[0.04] p-4 transition hover:border-white/25 hover:bg-white/[0.06]"
    >
      {content}
    </Link>
  );
}

function ExposureSection({
  title,
  items,
}: {
  title: string;
  items: MobilePortfolioExposure[];
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-200">{title}</h2>
        <span className="text-xs text-zinc-500">{items.length}</span>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <article
            key={`${title}-${item.label}`}
            className="rounded-lg border border-white/10 bg-white/[0.04] p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-white">{item.label}</p>
                <p className="mt-1 truncate text-xs text-zinc-500">
                  {item.companies.join(" / ")}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold text-white">
                  {formatMoney(item.value)}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  {formatPercent(item.weight)}
                </p>
              </div>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-sky-300"
                style={{
                  width: `${Math.min(100, Math.max(2, item.weight * 100))}%`,
                }}
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function WatchCard({ company }: { company: MobileCompany }) {
  return (
    <Link
      href={`/company/${encodeURIComponent(company.ticker)}`}
      className="block rounded-lg border border-white/10 bg-white/[0.04] p-4 transition hover:border-white/25 hover:bg-white/[0.06]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-base font-semibold text-white">{company.ticker}</p>
            <span className="rounded bg-white/10 px-2 py-1 text-[11px] uppercase tracking-[0.12em] text-zinc-300">
              Watch
            </span>
          </div>
          <p className="mt-1 truncate text-sm text-zinc-300">{company.name}</p>
        </div>
        <ChevronRight
          className="mt-1 h-4 w-4 shrink-0 text-zinc-500"
          aria-hidden="true"
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded bg-emerald-400/10 px-2 py-1 text-xs text-emerald-200">
          {company.basket || "No basket"}
        </span>
        <span className="rounded bg-sky-400/10 px-2 py-1 text-xs text-sky-200">
          {company.primaryThesis?.label || "No thesis"}
        </span>
      </div>

      <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-300">
        {getExcerpt(company)}
      </p>
    </Link>
  );
}

export default function PortfolioView({
  snapshot,
}: {
  snapshot: MobilePortfolioSnapshot;
}) {
  const [viewMode, setViewMode] = useState<ViewMode>("holdings");
  const [query, setQuery] = useState("");

  useEffect(() => {
    window.localStorage.setItem(
      "portfolio.mobile.snapshot",
      JSON.stringify(snapshot)
    );
  }, [snapshot]);

  const companyByTicker = useMemo(
    () =>
      new Map(
        snapshot.companies.map((company) => [company.ticker.toUpperCase(), company])
      ),
    [snapshot.companies]
  );

  const holdings = useMemo<HoldingRow[]>(() => {
    if (snapshot.portfolio?.holdings.length) {
      return snapshot.portfolio.holdings.map((holding) => ({
        ...holding,
        company: companyByTicker.get(holding.ticker.toUpperCase()),
      }));
    }

    return snapshot.companies
      .filter((company) => company.position)
      .map((company) => ({
        ...company.position!,
        company,
      }))
      .sort((a, b) => b.value - a.value);
  }, [companyByTicker, snapshot.companies, snapshot.portfolio]);

  const totalValue =
    snapshot.portfolio?.totals?.totalEquity ||
    holdings.reduce((sum, holding) => sum + holding.value, 0);
  const totalOpenPnl = holdings.reduce((sum, holding) => sum + holding.openPnl, 0);
  const holdingTickers = useMemo(
    () => new Set(holdings.map((holding) => holding.ticker.toUpperCase())),
    [holdings]
  );

  const normalizedQuery = query.trim().toLowerCase();
  const visibleHoldings = normalizedQuery
    ? holdings.filter((holding) => getHoldingText(holding).includes(normalizedQuery))
    : holdings;

  const watchlist = useMemo(() => {
    const companies = snapshot.companies
      .filter(
        (company) =>
          company.status === "watching" &&
          !holdingTickers.has(company.ticker.toUpperCase())
      )
      .sort((a, b) => a.ticker.localeCompare(b.ticker));

    if (!normalizedQuery) {
      return companies;
    }

    return companies.filter((company) =>
      getCompanyText(company).includes(normalizedQuery)
    );
  }, [holdingTickers, normalizedQuery, snapshot.companies]);

  const basketExposure =
    snapshot.portfolio?.baskets.length && totalValue > 0
      ? snapshot.portfolio.baskets
      : buildExposures(holdings, "basket", totalValue);
  const thesisExposure =
    snapshot.portfolio?.theses.length && totalValue > 0
      ? snapshot.portfolio.theses
      : buildExposures(holdings, "primaryThesis", totalValue);
  const issueCount = snapshot.issues.length;

  return (
    <main className="space-y-5 pb-24">
      <section className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-200/80">
              Portfolio
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white">
              {formatMoney(totalValue)}
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              {formatReportDate(snapshot.portfolio?.reportDate)}
              {snapshot.portfolio?.generatedAt ? (
                <span className="text-zinc-600"> / data refreshed</span>
              ) : null}
            </p>
          </div>
          <Link
            href="/issues"
            className={`flex h-10 min-w-10 items-center justify-center rounded-lg border px-3 text-sm ${
              issueCount > 0
                ? "border-amber-400/40 bg-amber-400/10 text-amber-200"
                : "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
            }`}
            aria-label={`${issueCount} data issues`}
          >
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            <span className="ml-2">{issueCount}</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <MetricCard
            label="Positions"
            value={numberFormatter.format(holdings.length)}
            detail={`${watchlist.length} watch`}
          />
          <MetricCard
            label="Open P&L"
            value={formatSignedMoney(totalOpenPnl)}
            tone={positionTone(totalOpenPnl)}
          />
          <MetricCard
            label="Week"
            value={formatSignedMoney(snapshot.portfolio?.totals?.weekChange)}
            tone={positionTone(snapshot.portfolio?.totals?.weekChange)}
            detail={formatSignedPercent(snapshot.portfolio?.totals?.weekChangePercent)}
          />
          <MetricCard
            label="YTD"
            value={formatSignedMoney(snapshot.portfolio?.totals?.ytdChange)}
            tone={positionTone(snapshot.portfolio?.totals?.ytdChange)}
            detail={formatSignedPercent(snapshot.portfolio?.totals?.ytdChangePercent)}
          />
        </div>

        <div className="rounded-lg border border-white/10 bg-zinc-900/80 p-2">
          <div className="flex items-center gap-2 rounded-md border border-white/10 bg-black/25 px-3 py-2">
            <Search className="h-4 w-4 text-zinc-500" aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search ticker, company, basket"
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
            />
          </div>
          <div className="mt-2 grid grid-cols-4 gap-1">
            {viewModes.map((mode) => {
              const Icon = mode.icon;
              return (
                <button
                  key={mode.value}
                  type="button"
                  onClick={() => setViewMode(mode.value)}
                  className={`flex h-10 items-center justify-center gap-1 rounded-md text-xs font-medium transition ${
                    viewMode === mode.value
                      ? "bg-white text-zinc-950"
                      : "text-zinc-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden={true} />
                  <span className="hidden min-[390px]:inline">{mode.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {viewMode === "holdings" ? (
        <section className="space-y-2">
          {visibleHoldings.map((holding) => (
            <HoldingCard key={holding.ticker} holding={holding} />
          ))}
        </section>
      ) : null}

      {viewMode === "allocation" ? (
        <div className="space-y-5">
          <ExposureSection title="Basket allocation" items={basketExposure} />
          <ExposureSection title="Thesis allocation" items={thesisExposure} />
        </div>
      ) : null}

      {viewMode === "accounts" ? (
        <section className="space-y-2">
          {(snapshot.portfolio?.accounts || []).map((account) => (
            <article
              key={account.label}
              className="rounded-lg border border-white/10 bg-white/[0.04] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{account.label}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {formatPercent(account.weight)}
                  </p>
                </div>
                <p className="text-base font-semibold text-white">
                  {formatMoney(account.value)}
                </p>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-amber-300"
                  style={{
                    width: `${Math.min(100, Math.max(2, account.weight * 100))}%`,
                  }}
                />
              </div>
            </article>
          ))}
        </section>
      ) : null}

      {viewMode === "watch" ? (
        <section className="space-y-2">
          {watchlist.map((company) => (
            <WatchCard key={company.ticker} company={company} />
          ))}
        </section>
      ) : null}
    </main>
  );
}
