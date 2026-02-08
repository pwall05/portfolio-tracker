import { formatDateTime } from "@/lib/format";
import { getCompanyThesisData, getFinancialOverview } from "@/lib/data";

type CompanyPageProps = {
  params: { symbol: string };
};

export default async function CompanyPage({ params }: CompanyPageProps) {
  const symbol = params?.symbol?.toUpperCase() ?? "UNKNOWN";
  const thesis = await getCompanyThesisData(symbol);
  const { lastUpdated } = await getFinancialOverview();

  const freshnessLabel = lastUpdated
    ? `Financials sync: ${formatDateTime(lastUpdated)}`
    : "Financials sync: pending";

  return (
    <main className="grid gap-8 lg:grid-cols-[1.55fr_0.75fr]">
      <div className="space-y-10">
        <section className="space-y-4 rounded-3xl border border-white/10 bg-white/5 px-6 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                Company Thesis
              </p>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {thesis.symbol} Thesis
              </h1>
              <p className="text-zinc-300">
                Company-specific logic connected to your portfolio.
              </p>
            </div>
            <span className="rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs uppercase tracking-[0.2em] text-zinc-300">
              {freshnessLabel}
            </span>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
              Portfolio Snapshot
            </p>
            <div className="mt-4 space-y-2 text-sm text-zinc-200">
              <p>Position size: {thesis.snapshot.positionSize}</p>
              <p>Cost basis: {thesis.snapshot.costBasis}</p>
              <p>Current price: {thesis.snapshot.currentPrice}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
              Key Questions
            </p>
            <div className="mt-4 space-y-2 text-sm text-zinc-200">
              {thesis.keyQuestions.map((question) => (
                <p key={question}>{question}</p>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-2xl font-semibold">Highlights</h2>
          <div className="mt-4 grid gap-3">
            {thesis.highlights.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-black/30 px-5 py-4"
              >
                <p className="text-sm text-zinc-200">{item}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <aside className="space-y-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
            Thesis Status
          </p>
          <div className="mt-4 space-y-3 text-sm text-zinc-300">
            <p>Conviction: {thesis.status.conviction}</p>
            <p>Risk level: {thesis.status.riskLevel}</p>
            <p>Time horizon: {thesis.status.timeHorizon}</p>
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
            Next Actions
          </p>
          <div className="mt-4 space-y-3 text-sm text-zinc-300">
            {thesis.nextActions.map((action) => (
              <div
                key={action}
                className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3"
              >
                <p>{action}</p>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </main>
  );
}
