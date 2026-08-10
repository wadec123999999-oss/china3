import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { decide, validateInput } from "../src/core.mjs";
import { regressionCases } from "../fixtures/regression-cases.mjs";
import { evaluateFixture } from "../src/regression.mjs";

const runtimeDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const databasePath = path.resolve(
  runtimeDir,
  "../chongqing-agent-database-20260729/重庆主城智能体数据库_V1.0.json",
);
const database = JSON.parse(await fs.readFile(databasePath, "utf8"));

test("database and fixture integrity", () => {
  assert.equal(database.metadata.version, "1.0");
  assert.equal(database.route_modules.length, 24);
  assert.equal(database.route_module_localizations.length, 24);
  assert.equal(database.regression_tests.length, 60);
  assert.equal(regressionCases.length, 60);
  assert.equal(new Set(regressionCases.map((item) => item.id)).size, 60);
  assert.deepEqual(
    regressionCases.map((item) => item.id),
    Array.from({ length: 60 }, (_, index) => `TC${String(index + 1).padStart(2, "0")}`),
  );
});

for (const fixture of regressionCases) {
  test(`${fixture.id} ${fixture.sourceConversation}`, () => {
    const report = evaluateFixture(database, fixture);
    assert.equal(report.passed, true, report.failures.join("\n"));
  });
}

test("invalid requests are rejected before ranking", () => {
  const invalid = structuredClone(regressionCases[0].input);
  invalid.trip.days = 9;
  assert.throws(() => decide(database, invalid), /invalid input/);
});
