"use client";

import { usePathname } from "next/navigation";

import { DesktopNav, MobileBottomNav } from "@/components/mobile/AppNav";

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";

  if (isLogin) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0b0d0f]/92 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Portfolio
            </p>
            <p className="text-sm font-semibold text-zinc-200">
              Portfolio mobile
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-zinc-400">
            Read only
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <DesktopNav />
        <div className="min-w-0 flex-1">{children}</div>
      </div>

      <MobileBottomNav />
    </div>
  );
}
