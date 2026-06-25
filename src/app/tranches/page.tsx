"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import type { ContributionResult } from "@/lib/domain/tranches";
import type { Tranche, Priority } from "@/lib/domain/types";
import Nav from "@/components/ui/nav";

type TrancheWithContribution = Tranche & ContributionResult;

const STATUS_STYLES: Record<ContributionResult["status"], string> = {
  complete: "bg-indigo-50 text-indigo-600",
  on_track: "bg-emerald-50 text-emerald-700",
  at_risk: "bg-amber-50 text-amber-700",
  behind: "bg-red-50 text-red-600",
  unreachable: "bg-red-50 text-red-600",
};

const STATUS_LABEL: Record<ContributionResult["status"], string> = {
  complete: "Complete",
  on_track: "On track",
  at_risk: "At risk",
  behind: "Behind",
  unreachable: "Unreachable",
};

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export default function TranchesPage() {
  const [tranches, setTranches] = useState<TrancheWithContribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function loadTranches() {
    setLoading(true);
    try {
      const res = await fetch("/api/tranches");
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      setTranches(await res.json());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load tranches");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTranches();
  }, []);

  async function handleDelete(id: number) {
    await fetch(`/api/tranches/${id}`, { method: "DELETE" });
    await loadTranches();
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-[#F3F5F7]">
      <Nav variant="light" authed />

      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 md:px-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Tranches
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Goal-based tranches carved out of your brokerage account.
            </p>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex cursor-pointer items-center gap-1.5 rounded-full bg-emerald-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2"
          >
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showForm ? "Close" : "Add tranche"}
          </button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <TrancheForm
                onCreated={async () => {
                  await loadTranches();
                  setShowForm(false);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {loading && <p className="mt-8 text-slate-400">Loading…</p>}
        {error && <p className="mt-8 text-red-500">{error}</p>}

        {!loading && !error && tranches.length === 0 && (
          <p className="mt-8 text-slate-400">No tranches yet — add one above.</p>
        )}

        <div className="mt-6 flex flex-col gap-4">
          {tranches.map((tranche) => (
            <TrancheCard key={tranche.id} tranche={tranche} onDelete={() => handleDelete(tranche.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function TrancheCard({ tranche, onDelete }: { tranche: TrancheWithContribution; onDelete: () => void }) {
  const progressPct = Math.round(tranche.progress * 100);
  return (
    <div className="rounded-xl bg-white p-5 shadow-lg ring-1 ring-slate-200">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: tranche.color }} />
          <h2 className="font-medium text-slate-900">{tranche.name}</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[tranche.status]}`}>
            {STATUS_LABEL[tranche.status]}
          </span>
          <button
            onClick={onDelete}
            className="cursor-pointer text-xs text-slate-400 hover:text-red-500"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-emerald-50">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
          style={{ width: `${Math.min(100, progressPct)}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-sm text-slate-500">
        <span>
          {currency.format(tranche.currentValue)} of {currency.format(tranche.goalAmount)} goal
        </span>
        <span>{tranche.targetDate}</span>
      </div>

      {tranche.status !== "complete" && (
        <p className="mt-2 text-sm text-slate-600">
          Need {currency.format(tranche.requiredPerPaycheck)}/paycheck to hit goal by {tranche.targetDate}
        </p>
      )}
    </div>
  );
}

function TrancheForm({ onCreated }: { onCreated: () => void | Promise<void> }) {
  const [name, setName] = useState("");
  const [goalAmount, setGoalAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch("/api/tranches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          goalAmount: Number(goalAmount),
          targetDate,
          priority,
          color: "#10b981",
        }),
      });
      setName("");
      setGoalAmount("");
      setTargetDate("");
      setPriority("medium");
      await onCreated();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 flex flex-wrap items-end gap-3 rounded-xl bg-white p-4 shadow-lg ring-1 ring-slate-200"
    >
      <Field label="Name">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-40 rounded-md bg-slate-50 px-2 py-1.5 text-sm text-slate-900 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-600"
        />
      </Field>
      <Field label="Goal ($)">
        <input
          required
          type="number"
          min="0"
          value={goalAmount}
          onChange={(e) => setGoalAmount(e.target.value)}
          className="w-28 rounded-md bg-slate-50 px-2 py-1.5 text-sm text-slate-900 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-600"
        />
      </Field>
      <Field label="Target date">
        <input
          required
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          className="rounded-md bg-slate-50 px-2 py-1.5 text-sm text-slate-900 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-600"
        />
      </Field>
      <Field label="Priority">
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          className="rounded-md bg-slate-50 px-2 py-1.5 text-sm text-slate-900 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-600"
        >
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </Field>
      <button
        type="submit"
        disabled={submitting}
        className="ml-auto cursor-pointer rounded-full bg-emerald-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "Creating…" : "Create tranche"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-slate-500">
      {label}
      {children}
    </label>
  );
}
