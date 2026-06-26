import { test } from "node:test";
import assert from "node:assert/strict";
import { summarize } from "./networth";

test("summarize totals the breakdown and allocates shares", () => {
  // Powers-of-two totals keep the shares exact in IEEE floats.
  const s = summarize({ cash: 2000, investments: 2000, predictionMarkets: 4000 });
  assert.equal(s.total, 8000);
  assert.equal(s.allocation.cash, 0.25);
  assert.equal(s.allocation.investments, 0.25);
  assert.equal(s.allocation.predictionMarkets, 0.5);
  assert.equal(
    s.allocation.cash + s.allocation.investments + s.allocation.predictionMarkets,
    1,
  );
});

test("summarize guards against divide-by-zero on an empty breakdown", () => {
  const s = summarize({ cash: 0, investments: 0, predictionMarkets: 0 });
  assert.equal(s.total, 0);
  assert.equal(s.allocation.cash, 0); // 0, not NaN
  assert.equal(s.allocation.investments, 0);
  assert.equal(s.allocation.predictionMarkets, 0);
});
