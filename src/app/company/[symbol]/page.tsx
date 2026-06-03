import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { getMobileCompany } from "@/lib/mobile/snapshot";

type CompanyPageProps = {
  params: Promise<{ symbol: string }>;
};

export const dynamic = "force-dynamic";

const moneyFormatter = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
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

function positionTone(value?: number) {
  if (!value) {
    return "text-zinc-300";
  }

  return value < 0 ? "text-rose-300" : "text-emerald-300";
}

function TextSection({
  title,
  children,
}: {
  title: string;
  children?: string;
}) {
  if (!children) {
    return null;
  }

  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
      <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-400">
        {title}
      </h2>
      <p className="mt-3 whitespace-pre-line text-sm leading-6 text-zinc-200">
        {children}
      </p>
    </section>
  );
}

function ListSection({
  title,
  items,
}: {
  title: string;
  items?: string[];
}) {
  if (!items?.length) {
    return null;
  }

  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
      <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-400">
        {title}
      </h2>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <p key={item} className="text-sm leading-6 text-zinc-200">
            {item}
          </p>
        ))}
      </div>
    </section>
  );
}

export default async function CompanyPage({ params }: CompanyPageProps) {
  const { symbol } = await params;
  const company = await getMobileCompany(symbol);

  if (!company) {
    notFound();
  }

  return (
    <main className="space-y-5 pb-24">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Portfolio
      </Link>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-200/80">
            {company.position ? "Portfolio position" : "Company thesis"}
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white">
            {company.ticker}
          </h1>
          <p className="mt-1 text-base text-zinc-300">{company.name}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="rounded bg-white/10 px-2 py-1 text-xs uppercase tracking-[0.12em] text-zinc-200">
            {company.status === "currently holding" ? "Holding" : company.status}
          </span>
          <span className="rounded bg-emerald-400/10 px-2 py-1 text-xs text-emerald-200">
            {company.basket || "No basket"}
          </span>
          <span className="rounded bg-sky-400/10 px-2 py-1 text-xs text-sky-200">
            {company.primaryThesis?.label || "No primary thesis"}
          </span>
        </div>

        {company.position ? (
          <div className="grid gap-2 sm:grid-cols-4">
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
              <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                Value
              </p>
              <p className="mt-1 text-lg font-semibold">
                {formatMoney(company.position.value)}
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
              <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                Weight
              </p>
              <p className="mt-1 text-lg font-semibold">
                {formatPercent(company.position.weight)}
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
              <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                Open P&L
              </p>
              <p
                className={`mt-1 text-lg font-semibold ${positionTone(
                  company.position.openPnl
                )}`}
              >
                {formatSignedMoney(company.position.openPnl)}
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
              <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                Option Legs
              </p>
              <p className="mt-1 text-lg font-semibold">
                {company.position.optionLegs}
              </p>
            </div>
          </div>
        ) : null}

        <div className="grid gap-2 sm:grid-cols-3">
          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
              Price
            </p>
            <p className="mt-1 text-lg font-semibold">
              {company.market?.price || "Quote pending"}
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
              Day
            </p>
            <p
              className={`mt-1 text-lg font-semibold ${
                company.market?.dayChange?.startsWith("-")
                  ? "text-rose-300"
                  : "text-emerald-300"
              }`}
            >
              {company.market?.dayChange || "—"}
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
              Market Cap
            </p>
            <p className="mt-1 text-lg font-semibold">
              {company.market?.marketCap || "—"}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-400">
          Snapshot
        </h2>
        <div className="mt-3 space-y-3 text-sm leading-6 text-zinc-200">
          {company.profileSummary?.oneLiner ? (
            <p>{company.profileSummary.oneLiner}</p>
          ) : null}
          <div className="grid gap-2 text-xs text-zinc-400 sm:grid-cols-2">
            <p>Sector: {company.sector || "—"}</p>
            <p>Asset: {company.assetType || "—"}</p>
            <p className="break-words">
              Profile: {company.companyProfilePath}
            </p>
            <p className="break-words">
              Thesis: {company.companyThesisPath || "—"}
            </p>
          </div>
        </div>
      </section>

      <TextSection title="Core thesis">
        {company.thesisSections?.coreThesis}
      </TextSection>
      <TextSection title="Current view">
        {company.thesisSections?.currentView}
      </TextSection>
      <TextSection title="Dissenting view">
        {company.thesisSections?.dissentingView}
      </TextSection>
      <ListSection title="Evidence" items={company.thesisSections?.evidence} />
      <ListSection title="Risks" items={company.thesisSections?.risks} />
      <TextSection title="Investment implications">
        {company.thesisSections?.investmentImplications}
      </TextSection>
      <TextSection title="What would change my mind">
        {company.thesisSections?.whatWouldChangeMyMind}
      </TextSection>
      <ListSection title="Company profile risks" items={company.profileSummary?.keyRisks} />

      {company.primaryThesis ? (
        <section className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-400">
            Related thesis
          </h2>
          <div className="mt-3 flex items-start gap-2 text-sm text-sky-200">
            <ExternalLink className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>
              {company.primaryThesis.label}
              <span className="block break-words text-zinc-500">
                {company.primaryThesis.path}
              </span>
            </p>
          </div>
        </section>
      ) : null}
    </main>
  );
}
