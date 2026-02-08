import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portfolio Tracker",
  description: "Track holdings, thesis, and financial history.",
};

const navItems = [
  { href: "/", label: "Portfolio" },
  { href: "/logic", label: "Investment Logic" },
  { href: "/financial", label: "Financial Info" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 font-sans text-white antialiased">
        <div className="relative min-h-screen overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_55%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,_rgba(24,24,27,0.9),_rgba(9,9,11,0.85))]" />

          <header className="relative border-b border-white/10 bg-zinc-950/70 backdrop-blur">
            <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-6 px-6 py-5 sm:px-10">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 text-xs font-semibold tracking-widest">
                  PT
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                    Portfolio Tracker
                  </p>
                  <p className="text-base font-semibold">
                    get the fucking capital
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm">
                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                  <span className="text-zinc-400">Total:</span>{" "}
                  <span className="font-semibold">$128,402</span>
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-emerald-300">
                  +$1,240 today
                </div>
              </div>
            </div>
          </header>

          <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-10 sm:px-10 lg:flex-row">
            <aside className="flex w-full flex-row gap-2 lg:w-60 lg:flex-col">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300 transition hover:border-white/30 hover:text-white lg:flex-none"
                >
                  {item.label}
                </Link>
              ))}
              <div className="hidden rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-xs text-zinc-400 lg:block">
                Quick status
                <div className="mt-3 space-y-2 text-sm text-zinc-200">
                  <p>Next review: Feb 10</p>
                  <p>Watchlist: 8 names</p>
                </div>
              </div>
            </aside>

            <div className="flex-1">{children}</div>
          </div>
        </div>
      </body>
    </html>
  );
}
