import { test } from "node:test";
import assert from "node:assert/strict";
import { calcContribution, trancheCurrentValue } from "./tranches";
import type { Tranche } from "./types";

// `now` is injected, so everything here is deterministic. Date math in
// calcContribution is pure UTC millisecond arithmetic, so these are timezone-safe.
const NOW = new Date("2025-01-01T00:00:00Z");

// NOW=2025-01-01 -> TARGET=2025-07-01 is exactly 181 days. Biweekly (26/yr):
// floor((181/365) * 26) = 12 paychecks remain. The boundary cases below are tuned
// against this fixed paycheck count.
const TARGET = "2025-07-01";
const PAYCHECKS = 12;

function tranche(goalAmount: number, targetDate: string): Tranche {
  return { id: 1, name: "t", goalAmount, targetDate, priority: "medium", color: "#000" };
}

function approx(actual: number, expected: number): void {
  assert.ok(Math.abs(actual - expected) < 1e-12, `${actual} !~= ${expected}`);
}

test("calcContribution: a funded tranche is complete", () => {
  const r = calcContribution(tranche(5000, TARGET), 5000, 2000, "biweekly", NOW);
  assert.equal(r.status, "complete");
  assert.equal(r.amountNeeded, 0);
  assert.equal(r.paychecksRemaining, 0);
  assert.equal(r.requiredPerPaycheck, 0);
  assert.equal(r.percentOfPaycheck, 0);
  assert.equal(r.progress, 1);
  assert.equal(r.currentValue, 5000);
});

test("calcContribution: an overfunded tranche is complete with progress capped at 1", () => {
  const r = calcContribution(tranche(5000, TARGET), 6000, 2000, "biweekly", NOW);
  assert.equal(r.status, "complete");
  assert.equal(r.progress, 1);
  assert.equal(r.currentValue, 6000);
});

test("calcContribution: percentOfPaycheck at the 0.3 boundary is on_track", () => {
  // amountNeeded 7200 / 12 paychecks = 600 / 2000 paycheck = exactly 0.3.
  const r = calcContribution(tranche(10000, TARGET), 2800, 2000, "biweekly", NOW);
  assert.equal(r.paychecksRemaining, PAYCHECKS);
  assert.equal(r.requiredPerPaycheck, 600);
  approx(r.percentOfPaycheck, 0.3);
  approx(r.progress, 0.28);
  assert.equal(r.status, "on_track");
});

test("calcContribution: just above 0.3 is at_risk", () => {
  // amountNeeded 7212 / 12 = 601 / 2000 = 0.3005.
  const r = calcContribution(tranche(10000, TARGET), 2788, 2000, "biweekly", NOW);
  approx(r.percentOfPaycheck, 0.3005);
  assert.equal(r.status, "at_risk");
});

test("calcContribution: percentOfPaycheck at the 0.6 boundary is at_risk", () => {
  // amountNeeded 14400 / 12 = 1200 / 2000 = exactly 0.6.
  const r = calcContribution(tranche(20000, TARGET), 5600, 2000, "biweekly", NOW);
  assert.equal(r.requiredPerPaycheck, 1200);
  approx(r.percentOfPaycheck, 0.6);
  assert.equal(r.status, "at_risk");
});

test("calcContribution: above 0.6 is behind", () => {
  // amountNeeded 18000 / 12 = 1500 / 2000 = 0.75.
  const r = calcContribution(tranche(18000, TARGET), 0, 2000, "biweekly", NOW);
  approx(r.percentOfPaycheck, 0.75);
  assert.equal(r.status, "behind");
});

test("calcContribution: a passed deadline is unreachable", () => {
  const r = calcContribution(tranche(10000, "2024-06-01"), 2000, 2000, "biweekly", NOW);
  assert.equal(r.status, "unreachable");
  assert.equal(r.paychecksRemaining, 0);
  assert.equal(r.amountNeeded, 8000);
  assert.equal(r.requiredPerPaycheck, 8000); // the whole shortfall, since no paychecks remain
  assert.equal(r.percentOfPaycheck, 4);
  approx(r.progress, 0.2);
});

test("calcContribution: a zero paycheck on the normal path yields an Infinite share", () => {
  const r = calcContribution(tranche(10000, TARGET), 0, 0, "biweekly", NOW);
  assert.equal(r.paychecksRemaining, PAYCHECKS);
  assert.equal(r.percentOfPaycheck, Infinity);
  assert.equal(r.status, "behind");
});

test("calcContribution: a zero paycheck past the deadline yields an Infinite share", () => {
  const r = calcContribution(tranche(10000, "2024-06-01"), 0, 0, "biweekly", NOW);
  assert.equal(r.paychecksRemaining, 0);
  assert.equal(r.percentOfPaycheck, Infinity);
  assert.equal(r.status, "unreachable");
});

test("calcContribution: paychecksRemaining follows the pay frequency", () => {
  assert.equal(calcContribution(tranche(10000, TARGET), 0, 2000, "monthly", NOW).paychecksRemaining, 5);
  assert.equal(calcContribution(tranche(10000, TARGET), 0, 2000, "weekly", NOW).paychecksRemaining, 25);
});

test("calcContribution: a zero-goal tranche avoids divide-by-zero (progress 1, complete)", () => {
  const r = calcContribution(tranche(0, TARGET), 0, 2000, "biweekly", NOW);
  assert.equal(r.status, "complete");
  assert.equal(r.progress, 1);
});

test("trancheCurrentValue sums shares * current price", () => {
  assert.equal(
    trancheCurrentValue([
      { ticker: "A", shares: 10, currentPrice: 100 },
      { ticker: "B", shares: 5, currentPrice: 20 },
    ]),
    1100,
  );
});

test("trancheCurrentValue of no positions is 0", () => {
  assert.equal(trancheCurrentValue([]), 0);
});
