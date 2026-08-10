import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { summarizeFieldProgress, validateFieldRunRecord } from "../src/field-ops.mjs";

const runtimeDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const database = JSON.parse(await fs.readFile(
  path.resolve(runtimeDir, "../chongqing-agent-database-20260729/重庆主城智能体数据库_V1.0.json"),
  "utf8",
));
const example = JSON.parse(await fs.readFile(path.resolve(runtimeDir, "field-records/RUN001.example.json"), "utf8"));
const operationsPack = await fs.readFile(
  path.resolve(runtimeDir, "../chongqing-agent-database-20260729/重庆首发现场运营与放行包_V1.0.md"),
  "utf8",
);

test("field-run template validates only against a known V1.0 run", () => {
  const result = validateFieldRunRecord(database, example);
  assert.equal(result.valid, true, result.errors.join("; "));
  assert.equal(result.launchCheckId, "LFV001");
});

test("a missing evidence record cannot be treated as a passed field run", () => {
  const invalid = { ...example, evidence: [] };
  const result = validateFieldRunRecord(database, invalid);
  assert.equal(result.valid, false);
  assert.match(result.errors.join("; "), /at least two evidence items/);
});

test("field passes alone never sell an experience before supplier admission", () => {
  const records = database.field_run_plan.map((run) => ({
    ...example,
    run_id: run.run_id,
    result: "pass",
    safety_blocking: false,
  }));
  const summary = summarizeFieldProgress(database, records);
  assert.equal(summary.passedRuns, 19);
  assert.ok(summary.launchChecks.every((check) => check.ready));
  assert.ok(summary.experienceProducts.every((product) => product.fieldChecksPassed));
  assert.ok(summary.experienceProducts.every((product) => product.sellable === false));
});

test("operations pack covers every V1.0 field run and launch check", () => {
  for (const run of database.field_run_plan) {
    assert.match(operationsPack, new RegExp(`\\b${run.run_id}\\b`), `${run.run_id} missing from operations pack`);
  }
  for (const check of database.launch_field_checks) {
    assert.match(operationsPack, new RegExp(`\\b${check.launch_check_id}\\b`), `${check.launch_check_id} missing from operations pack`);
  }
  for (const supplier of database.supplier_candidates) {
    assert.match(operationsPack, new RegExp(`\\b${supplier.supplier_id}\\b`), `${supplier.supplier_id} missing from operations pack`);
  }
});
