// Pure tranche math. No I/O, no clock — `now` is always passed in.
import type { Tranche, PayFrequency, TaggedPosition } from "./types";

const PAYCHECKS_PER_YEAR: Record<PayFrequency, number> = {
  weekly: 52,
  biweekly: 26,
  semimonthly: 24,
  monthly: 12,
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export type TrancheStatus = "complete" | "on_track" | "at_risk" | "behind" | "unreachable";

export interface ContributionResult {
  currentValue: number;
  amountNeeded: number;
  paychecksRemaining: number;
  requiredPerPaycheck: number;
  percentOfPaycheck: number; // 0..1, share of one paycheck this tranche demands
  progress: number; // 0..1, currentValue / goalAmount
  status: TrancheStatus;
}

/** Sum shares × current price for every position tagged to a tranche. */
export function trancheCurrentValue(positions: TaggedPosition[]): number {
  return positions.reduce((sum, p) => sum + p.shares * p.currentPrice, 0);
}

/**
 * How much must go into this tranche each paycheck to hit its goal by the target date.
 * `now` is injected so this is deterministic and unit-testable.
 */
export function calcContribution(
  tranche: Tranche,
  currentValue: number,
  paycheckAmount: number,
  freq: PayFrequency,
  now: Date,
): ContributionResult {
  const goal = tranche.goalAmount;
  const progress = goal > 0 ? clamp(currentValue / goal, 0, 1) : 1;
  const amountNeeded = goal - currentValue;

  // Already funded.
  if (amountNeeded <= 0) {
    return {
      currentValue,
      amountNeeded: 0,
      paychecksRemaining: 0,
      requiredPerPaycheck: 0,
      percentOfPaycheck: 0,
      progress: 1,
      status: "complete",
    };
  }

  const days = (new Date(tranche.targetDate).getTime() - now.getTime()) / MS_PER_DAY;
  const paychecksRemaining = Math.max(0, Math.floor((days / 365) * PAYCHECKS_PER_YEAR[freq]));

  // Deadline already passed (or too close to fit a single paycheck): goal can't be met on schedule.
  if (paychecksRemaining === 0) {
    return {
      currentValue,
      amountNeeded,
      paychecksRemaining: 0,
      requiredPerPaycheck: amountNeeded,
      percentOfPaycheck: paycheckAmount > 0 ? amountNeeded / paycheckAmount : Infinity,
      progress,
      status: "unreachable",
    };
  }

  const requiredPerPaycheck = amountNeeded / paychecksRemaining;
  const percentOfPaycheck = paycheckAmount > 0 ? requiredPerPaycheck / paycheckAmount : Infinity;

  return {
    currentValue,
    amountNeeded,
    paychecksRemaining,
    requiredPerPaycheck,
    percentOfPaycheck,
    progress,
    status: statusFromShare(percentOfPaycheck),
  };
}

// A tranche is healthier the smaller a slice of each paycheck it needs.
function statusFromShare(percentOfPaycheck: number): TrancheStatus {
  if (percentOfPaycheck <= 0.3) return "on_track";
  if (percentOfPaycheck <= 0.6) return "at_risk";
  return "behind";
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}
