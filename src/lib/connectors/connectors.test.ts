import { test } from "node:test";
import assert from "node:assert/strict";
import { MockConnector } from "./mock";
import { getConnector, loadNetWorthBreakdown } from "./index";
import { summarize } from "../domain/networth";

// Pure / in-memory: no DB, no network, no session.

test("MockConnector returns the fixed mock balances", async () => {
  const c = new MockConnector();
  assert.equal(await c.getCash(), 18450);
  assert.equal(await c.getInvestments(), 96320);
  assert.equal(await c.getPredictionMarkets(), 7240); // Kalshi 4200 + Polymarket 3040
  assert.deepEqual(await c.getPaycheck(), { amount: 2000, frequency: "biweekly" });
  assert.deepEqual(await c.getQuotes(["AAPL", "MSFT"]), { AAPL: 100, MSFT: 100 });
});

test("MockConnector.getQuotes of no tickers is an empty map", async () => {
  assert.deepEqual(await new MockConnector().getQuotes([]), {});
});

test("getConnector returns a memoized MockConnector singleton", () => {
  const a = getConnector();
  assert.ok(a instanceof MockConnector);
  assert.equal(getConnector(), a); // same instance on every call
});

test("loadNetWorthBreakdown composes the three balance sources", async () => {
  const breakdown = await loadNetWorthBreakdown(new MockConnector());
  assert.deepEqual(breakdown, { cash: 18450, investments: 96320, predictionMarkets: 7240 });
  // Ties the connector composition to the domain math: 18450 + 96320 + 7240.
  assert.equal(summarize(breakdown).total, 122010);
});
