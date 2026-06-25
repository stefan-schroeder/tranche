// Pure "what-if" projection: given a monthly contribution and assumed annual
// return, when does a tranche reach its goal? Used by the what-if simulator.

export interface ProjectionInput {
  currentValue: number;
  goalAmount: number;
  monthlyContribution: number;
  annualReturnRate: number; // e.g. 0.07 for 7%
}

export interface ProjectionResult {
  monthsToGoal: number | null; // null = never reaches goal under these assumptions
  projectedDate: string | null; // ISO date, computed from `now`
}

const MAX_MONTHS = 1200; // 100 years — treat anything beyond as "never"

/**
 * Compound monthly: balance grows by the monthly rate, then the contribution
 * is added. Returns how many months until balance >= goal.
 */
export function projectGoalDate(input: ProjectionInput, now: Date): ProjectionResult {
  const { currentValue, goalAmount, monthlyContribution, annualReturnRate } = input;

  if (currentValue >= goalAmount) {
    return { monthsToGoal: 0, projectedDate: toISODate(now) };
  }

  const monthlyRate = annualReturnRate / 12;
  let balance = currentValue;

  for (let month = 1; month <= MAX_MONTHS; month++) {
    balance = balance * (1 + monthlyRate) + monthlyContribution;
    if (balance >= goalAmount) {
      const date = new Date(now);
      date.setMonth(date.getMonth() + month);
      return { monthsToGoal: month, projectedDate: toISODate(date) };
    }
  }

  return { monthsToGoal: null, projectedDate: null };
}

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}
