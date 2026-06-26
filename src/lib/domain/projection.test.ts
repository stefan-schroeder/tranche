import { test } from "node:test";
import assert from "node:assert/strict";
import { projectGoalDate } from "./projection";
import type { ProjectionInput } from "./projection";

const NOW = new Date("2025-01-15T12:00:00Z");

// projectGoalDate formats the projected date with local-time setMonth + UTC toISOString.
// Replicate that exact arithmetic so the assertion is timezone-independent.
function expectedDate(months: number): string {
  const d = new Date(NOW);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

test("projectGoalDate: already at goal returns 0 months and today", () => {
  const r = projectGoalDate(
    { currentValue: 1000, goalAmount: 1000, monthlyContribution: 0, annualReturnRate: 0 },
    NOW,
  );
  assert.equal(r.monthsToGoal, 0);
  assert.equal(r.projectedDate, "2025-01-15");
});

test("projectGoalDate: compounding reaches the goal", () => {
  // 900 -> 1000, +10/mo at 12% annual (1%/mo): the balance crosses 1000 at month 6.
  const input: ProjectionInput = {
    currentValue: 900,
    goalAmount: 1000,
    monthlyContribution: 10,
    annualReturnRate: 0.12,
  };
  const r = projectGoalDate(input, NOW);
  assert.equal(r.monthsToGoal, 6);
  assert.equal(r.projectedDate, expectedDate(6));
});

test("projectGoalDate: never reaching the goal returns nulls", () => {
  // No contribution and no return, below goal: MAX_MONTHS is exhausted.
  const r = projectGoalDate(
    { currentValue: 0, goalAmount: 1000, monthlyContribution: 0, annualReturnRate: 0 },
    NOW,
  );
  assert.equal(r.monthsToGoal, null);
  assert.equal(r.projectedDate, null);
});
