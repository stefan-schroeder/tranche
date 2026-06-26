"use client";

import { useEffect, useState } from "react";
import { animate, useMotionValue, useMotionValueEvent } from "framer-motion";
import { RefreshCw, Building2, LineChart as LineChartIcon, TrendingUp } from "lucide-react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Nav from "@/components/ui/nav";

type Range = "7D" | "30D" | "90D" | "ALL";
const RANGES: Range[] = ["7D", "30D", "90D", "ALL"];

interface Summary {
  cash: number;
  investments: number;
  predictionMarkets: number;
  total: number;
  allocation: { cash: number; investments: number; predictionMarkets: number };
  lastUpdated: string;
}

interface Snapshot {
  date: string;
  total: number;
  cash: number;
  investments: number;
  predictionMarkets: number;
}

const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

function CountUp({ value }: { value: number }) {
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState(0);
  useMotionValueEvent(mv, "change", (v) => setDisplay(v));
  useEffect(() => {
    const controls = animate(mv, value, { duration: 0.9, ease: "easeOut" });
    return controls.stop;
  }, [mv, value]);
  return <>{usd(display)}</>;
}

function AccountCard({
  label,
  source,
  value,
  share,
  icon,
}: {
  label: string;
  source: string;
  value: number;
  share: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-white p-6 text-slate-800 shadow-lg ring-1 ring-slate-200">
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-emerald-50 p-2 text-emerald-700 ring-1 ring-emerald-100">
          {icon}
        </div>
        <div>
          <div className="text-sm font-medium text-slate-900">{label}</div>
          <div className="text-xs text-slate-500">{source}</div>
        </div>
      </div>
      <div className="mt-4 text-3xl font-semibold tracking-tight">{usd(value)}</div>
      <div className="mt-1 text-xs text-slate-500">{pct(share)} of net worth</div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-emerald-500"
          style={{ width: `${Math.round(share * 100)}%` }}
        />
      </div>
    </div>
  );
}

export default function NetWorthPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [history, setHistory] = useState<Snapshot[]>([]);
  const [range, setRange] = useState<Range>("30D");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadSummary() {
    const res = await fetch("/api/networth");
    if (!res.ok) throw new Error(`Net worth request failed: ${res.status}`);
    setSummary(await res.json());
  }

  async function loadHistory(r: Range) {
    const res = await fetch(`/api/networth/history?range=${r}`);
    if (!res.ok) throw new Error(`History request failed: ${res.status}`);
    setHistory(await res.json());
  }

  // `loading` starts true (initial state) and is reset in finally; callers that want
  // a fresh spinner (the Refresh button) flip it back on first — done from the user
  // event, never synchronously inside an effect.
  async function loadAll(r: Range) {
    try {
      await Promise.all([loadSummary(), loadHistory(r)]);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load net worth");
    } finally {
      setLoading(false);
    }
  }

  function refresh() {
    setLoading(true);
    loadAll(range);
  }

  function selectRange(r: Range) {
    setRange(r);
    loadHistory(r).catch((e) =>
      setError(e instanceof Error ? e.message : "Failed to load history"),
    );
  }

  useEffect(() => {
    // Fetch once on mount. loadAll only setStates after awaits (post-fetch), not
    // synchronously, so the cascading-render concern doesn't apply here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAll(range);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // % change over the selected range: earliest vs latest point in the current history.
  const changePct =
    history.length >= 2 && history[0].total > 0
      ? (history[history.length - 1].total - history[0].total) / history[0].total
      : 0;
  const changeUp = changePct >= 0;

  const lastUpdated = summary
    ? new Date(summary.lastUpdated).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#F3F5F7]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        :root { --font-sans: 'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif; }
        .font-jakarta { font-family: var(--font-sans); }
      `}</style>

      <Nav variant="light" authed />

      <div className="mx-auto w-full max-w-[1180px] flex-1 px-4 pb-14 md:px-0">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Net Worth</h1>
            <p className="mt-1 text-sm text-slate-500">
              Mock data until connectors are wired — Chase, Schwab, Kalshi &amp; Polymarket.
            </p>
          </div>
          <button
            onClick={refresh}
            disabled={loading}
            className="flex cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw className={"h-4 w-4 " + (loading ? "animate-spin" : "")} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-100">
            {error}
          </div>
        )}

        {/* Summary card */}
        <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-b from-emerald-900 to-emerald-800 p-8 text-emerald-50 shadow-lg">
          <div className="text-xs uppercase tracking-wider text-emerald-200">Total net worth</div>
          <div className="mt-2 text-5xl font-semibold tracking-tight tabular-nums">
            {summary ? <CountUp value={summary.total} /> : "—"}
          </div>
          <div className="mt-3 flex items-center gap-4 text-sm">
            <span
              className={
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-medium " +
                (changeUp ? "bg-emerald-700/50 text-emerald-50" : "bg-red-900/40 text-red-200")
              }
            >
              <TrendingUp className={"h-4 w-4 " + (changeUp ? "" : "rotate-180")} />
              {changeUp ? "+" : ""}
              {pct(changePct)} ({range})
            </span>
            <span className="text-emerald-200/80">Last updated {lastUpdated}</span>
          </div>
        </div>

        {/* Account breakdown */}
        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          <AccountCard
            label="Chase"
            source="Cash"
            value={summary?.cash ?? 0}
            share={summary?.allocation.cash ?? 0}
            icon={<Building2 className="h-5 w-5" />}
          />
          <AccountCard
            label="Schwab"
            source="Investments"
            value={summary?.investments ?? 0}
            share={summary?.allocation.investments ?? 0}
            icon={<LineChartIcon className="h-5 w-5" />}
          />
          <AccountCard
            label="Markets"
            source="Kalshi · Polymarket"
            value={summary?.predictionMarkets ?? 0}
            share={summary?.allocation.predictionMarkets ?? 0}
            icon={<TrendingUp className="h-5 w-5" />}
          />
        </div>

        {/* History chart */}
        <div className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-slate-200">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm font-medium text-slate-900">History</div>
            <div className="flex items-center gap-1 rounded-full bg-slate-100 p-1">
              {RANGES.map((r) => (
                <button
                  key={r}
                  onClick={() => selectRange(r)}
                  className={
                    "cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition " +
                    (range === r
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-900")
                  }
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history} margin={{ top: 8, right: 12, bottom: 0, left: 12 }}>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickFormatter={(d: string) =>
                    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                  }
                  minTickGap={32}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickFormatter={(v: number) => `$${Math.round(v / 1000)}k`}
                  width={48}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(v) => [usd(Number(v)), "Net worth"]}
                  labelFormatter={(label) =>
                    new Date(label as string).toLocaleDateString("en-US", { dateStyle: "medium" })
                  }
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#059669"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <footer className="mx-auto w-full max-w-[1180px] px-4 pb-10 text-center text-xs text-slate-400 md:px-0">
        © {new Date().getFullYear()} Tranche.
      </footer>
    </div>
  );
}
