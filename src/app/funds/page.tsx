"use client";

import { useEffect, useState } from "react";
import type { ContributionResult } from "@/lib/domain/funds";
import type { Fund, Priority } from "@/lib/domain/types";

type FundWithContribution = Fund & ContributionResult;

const STATUS_STYLES: Record<ContributionResult["status"], string> = {
  complete: "bg-indigo-500/20 text-indigo-300",
  on_track: "bg-green-500/20 text-green-400",
  at_risk: "bg-amber-500/20 text-amber-400",
  behind: "bg-red-500/20 text-red-400",
  unreachable: "bg-red-500/20 text-red-400",
};

const STATUS_LABEL: Record<ContributionResult["status"], string> = {
  complete: "Complete",
  on_track: "On track",
  at_risk: "At risk",
  behind: "Behind",
  unreachable: "Unreachable",
};

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export default function FundsPage() {
  const [funds, setFunds] = useState<FundWithContribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadFunds() {
    setLoading(true);
    try {
      const res = await fetch("/api/funds");
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      setFunds(await res.json());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load funds");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFunds();
  }, []);

  async function handleDelete(id: number) {
    await fetch(`/api/funds/${id}`, { method: "DELETE" });
    await loadFunds();
  }

  return (
    <div className="min-h-screen flex-1 bg-gray-950 px-8 py-12 text-gray-50">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold tracking-tight">Sub-Funds</h1>
        <p className="mt-1 text-sm text-gray-400">
          Goal-based funds carved out of your brokerage account.
        </p>

        <FundForm onCreated={loadFunds} />

        {loading && <p className="mt-8 text-gray-500">Loading…</p>}
        {error && <p className="mt-8 text-red-400">{error}</p>}

        {!loading && !error && funds.length === 0 && (
          <p className="mt-8 text-gray-500">No funds yet — create one above.</p>
        )}

        <div className="mt-8 flex flex-col gap-4">
          {funds.map((fund) => (
            <FundCard key={fund.id} fund={fund} onDelete={() => handleDelete(fund.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function FundCard({ fund, onDelete }: { fund: FundWithContribution; onDelete: () => void }) {
  const progressPct = Math.round(fund.progress * 100);
  return (
    <div className="rounded-xl bg-gray-900 p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: fund.color }} />
          <h2 className="font-medium">{fund.name}</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[fund.status]}`}>
            {STATUS_LABEL[fund.status]}
          </span>
          <button
            onClick={onDelete}
            className="text-xs text-gray-500 hover:text-red-400"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-800">
        <div
          className="h-full rounded-full bg-indigo-500"
          style={{ width: `${Math.min(100, progressPct)}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-sm text-gray-400">
        <span>
          {currency.format(fund.currentValue)} of {currency.format(fund.goalAmount)} goal
        </span>
        <span>{fund.targetDate}</span>
      </div>

      {fund.status !== "complete" && (
        <p className="mt-2 text-sm text-gray-300">
          Need {currency.format(fund.requiredPerPaycheck)}/paycheck to hit goal by {fund.targetDate}
        </p>
      )}
    </div>
  );
}

function FundForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState("");
  const [goalAmount, setGoalAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch("/api/funds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          goalAmount: Number(goalAmount),
          targetDate,
          priority,
          color: "#6366f1",
        }),
      });
      setName("");
      setGoalAmount("");
      setTargetDate("");
      setPriority("medium");
      onCreated();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-wrap items-end gap-3 rounded-xl bg-gray-900 p-4">
      <Field label="Name">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-40 rounded-md bg-gray-800 px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </Field>
      <Field label="Goal ($)">
        <input
          required
          type="number"
          min="0"
          value={goalAmount}
          onChange={(e) => setGoalAmount(e.target.value)}
          className="w-28 rounded-md bg-gray-800 px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </Field>
      <Field label="Target date">
        <input
          required
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          className="rounded-md bg-gray-800 px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </Field>
      <Field label="Priority">
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          className="rounded-md bg-gray-800 px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </Field>
      <button
        type="submit"
        disabled={submitting}
        className="ml-auto rounded-md bg-indigo-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-400 disabled:opacity-50"
      >
        {submitting ? "Creating…" : "Create fund"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-gray-400">
      {label}
      {children}
    </label>
  );
}
