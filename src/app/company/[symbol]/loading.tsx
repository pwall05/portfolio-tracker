export default function Loading() {
  return (
    <main className="grid gap-8 lg:grid-cols-[1.55fr_0.75fr] animate-pulse">
      <div className="space-y-8">
        <section className="rounded-3xl border border-white/10 bg-white/5 px-6 py-8">
          <div className="space-y-4">
            <div className="h-3 w-28 rounded-full bg-white/10" />
            <div className="h-8 w-48 rounded-full bg-white/10" />
            <div className="h-4 w-56 rounded-full bg-white/10" />
          </div>
        </section>
        <section className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={`card-${index}`}
              className="h-40 rounded-2xl border border-white/10 bg-black/30"
            />
          ))}
        </section>
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="h-6 w-40 rounded-full bg-white/10" />
          <div className="mt-4 grid gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`highlight-${index}`}
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
