"use client";

import Link from "next/link";
import HeroCards, { Stat } from "./hero-cards";
import Nav from "./nav";

export default function HomeDashboard({ name }: { name?: string | null }) {
  const firstName = name?.trim().split(" ")[0];

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#F3F5F7]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        :root { --font-sans: 'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif; }
        .font-jakarta { font-family: var(--font-sans); }
      `}</style>

      <Nav variant="light" authed />

      <div className="mx-auto grid w-full max-w-[1180px] flex-1 grid-cols-1 content-center gap-6 px-4 pb-14 md:grid-cols-2 md:px-0">
        <div className="flex flex-col justify-center space-y-8 pr-2">
          <div>
            <h1 className="text-5xl md:text-6xl font-semibold leading-[1.05] tracking-tight text-slate-900">
              Welcome back
              {firstName ? (
                <>
                  ,
                  <br />
                  {firstName}.
                </>
              ) : (
                "."
              )}
            </h1>
            <p className="mt-4 max-w-md text-slate-600">
              Pick up where you left off — review your{" "}
              <span className="font-medium text-slate-900">
                tranches and contribution pace
              </span>{" "}
              in one place. Connectors for Chase, Schwab, Kalshi, and Polymarket
              land here once API keys are wired up.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/tranches"
              className="cursor-pointer rounded-full bg-emerald-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2"
            >
              View tranches
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-2 md:max-w-sm">
            <Stat label="Connectors" value="Chase · Schwab" />
            <Stat label="Markets" value="Kalshi · Polymarket" />
          </div>
        </div>

        <HeroCards />
      </div>

      <footer className="mx-auto w-full max-w-[1180px] px-4 pb-10 text-center text-xs text-slate-400 md:px-0">
        © {new Date().getFullYear()} Tranche.
      </footer>
    </div>
  );
}
