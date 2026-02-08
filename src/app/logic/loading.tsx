export default function Loading() {
  return (
    <main className="grid gap-8 lg:grid-cols-[1.55fr_0.75fr] animate-pulse">
      <div className="space-y-8">
        <section className="rounded-3xl border border-white/10 bg-white/5 px-6 py-8">
          <div className="space-y-4">
            <div className="h-3 w-24 rounded-full bg-white/10" />
            <div className="h-8 w-72 rounded-full bg-white/10" />
            <div className="h-4 w-56 rounded-full bg-white/10" />
          </div>
          <div className="mt-6 h-10 w-48 rounded-full bg-white/10" />
        </section>
        <section className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`trend-${index}`}
              className="h-24 rounded-2xl border border-white/10 bg-black/30"
            />
          ))}
        </section>
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="h-6 w-40 rounded-full bg-white/10" />
          <div className="mt-6 grid gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`company-${index}`}
                className="h-16 rounded-2xl border border-white/10 bg-black/30"
              />
            ))}
          </div>
        </section>
      </div>
      <aside className="space-y-6">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={`aside-${index}`}
            className="h-40 rounded-3xl border border-white/10 bg-white/5"
          />
        ))}
      </aside>
    </main>
  );
}
