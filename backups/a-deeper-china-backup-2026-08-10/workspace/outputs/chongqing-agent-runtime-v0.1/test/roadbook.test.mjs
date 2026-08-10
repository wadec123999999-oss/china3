import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { decide } from "../src/core.mjs";
import { buildRoadbookData, renderRoadbookMarkdown } from "../src/roadbook.mjs";
import { regressionCases } from "../fixtures/regression-cases.mjs";

const runtimeDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const database = JSON.parse(await fs.readFile(
  path.resolve(runtimeDir, "../chongqing-agent-database-20260729/重庆主城智能体数据库_V1.0.json"),
  "utf8",
));
const paidRoadbookStandard = await fs.readFile(
  path.resolve(runtimeDir, "../chongqing-agent-database-20260729/重庆付费深度路书产品与交付标准_V1.0.md"),
  "utf8",
);

function fixture(id, locale = "en") {
  const source = regressionCases.find((item) => item.id === id);
  assert.ok(source, `fixture ${id} must exist`);
  return { ...source.input, locale };
}

test("all 24 route modules have controlled English copy", () => {
  const rows = database.route_module_localizations;
  assert.equal(rows.length, 24);
  assert.equal(new Set(rows.map((item) => item["模块ID"])).size, 24);
  assert.deepEqual(
    rows.map((item) => item["模块ID"]),
    Array.from({ length: 24 }, (_, index) => `RM${String(index + 1).padStart(2, "0")}`),
  );
  for (const row of rows) {
    for (const field of [
      "英文名称",
      "英文核心节点",
      "英文承诺",
      "英文核心解释",
      "英文观察任务",
      "英文现实提醒",
      "英文必须确认",
      "翻译边界",
    ]) {
      assert.ok(String(row[field] ?? "").trim(), `${row["模块ID"]} missing ${field}`);
    }
    assert.equal(row["编辑状态"], "editorial_v1");
  }
});

test("English decisions use controlled localized module fields", () => {
  const result = decide(database, fixture("TC51", "en"));
  assert.equal(result.locale, "en");
  assert.ok(result.days[0].modules.length > 0);
  for (const module of result.days[0].modules) {
    assert.equal(module.localizationStatus, "editorial_v1");
    for (const value of [
      module.name,
      module.nodes,
      module.promise,
      module.explanation,
      module.observationTask,
      module.practicalNote,
    ]) {
      assert.ok(!/[\u3400-\u9fff]/u.test(value), `${module.moduleId} contains untranslated CJK: ${value}`);
    }
  }
});

test("Chinese locale preserves source-language route content", () => {
  const result = decide(database, fixture("TC51", "zh-CN"));
  assert.equal(result.locale, "zh-CN");
  assert.ok(result.days[0].modules.some((module) => /[\u3400-\u9fff]/u.test(module.name)));
  assert.ok(result.days[0].modules.every((module) => module.localizationStatus === "source_language_fallback"));
});

test("guest-facing roadbook omits scores and internal profile labels", () => {
  const input = fixture("TC51", "en");
  const markdown = renderRoadbookMarkdown(decide(database, input), input);
  assert.match(markdown, /^# Chongqing Roadbook/m);
  assert.match(markdown, /## Day 1/);
  assert.match(markdown, /## Release checks/);
  assert.match(markdown, /## Booking boundary/);
  assert.doesNotMatch(markdown, /\bscore\b/i);
  assert.doesNotMatch(markdown, /首次经典|赛博摄影|文化历史|美食生活|亲子轻松|复游客/u);
  assert.doesNotMatch(markdown, /first-time visitor|urban-visual creator|history-focused visitor|food and everyday-life visitor|family or low-friction visitor|repeat visitor/i);
  assert.doesNotMatch(markdown, /\bRM\d{2}\b/);
  assert.ok(markdown.length > 1800);
});

test("V1.2 exposes customer decisions and executable fallback controls", () => {
  const input = fixture("TC60", "en");
  const decision = decide(database, input);
  const roadbook = buildRoadbookData(decision, input);
  const markdown = renderRoadbookMarkdown(decision, input);
  assert.match(markdown, /## Client decision brief/);
  assert.match(markdown, /\*\*Route shape:\*\*/);
  assert.match(markdown, /\*\*Body and time budget:\*\*/);
  assert.match(markdown, /\*\*Low-energy version:\*\*/);
  assert.match(markdown, /\*\*Rain version:\*\*/);
  assert.match(markdown, /## What was deliberately left out/);
  assert.ok(roadbook.days.flatMap((day) => day.modules).every((module) => module.routeShape && module.lowEnergyVersion && module.rainVersion));
  assert.doesNotMatch(markdown, /\bRM\d{2}\b/);
});

test("database decision profiles become customer-visible trade-offs", () => {
  const input = fixture("TC60", "en");
  const decision = decide(database, input);
  const roadbook = buildRoadbookData(decision, input);
  const markdown = renderRoadbookMarkdown(decision, input);
  assert.ok(roadbook.clientDecisionLedger.length > 0);
  assert.match(markdown, /## Client decision ledger/);
  assert.match(markdown, /Why this over a nearby alternative/);
  assert.doesNotMatch(markdown, /RM\d{2}/);
});

test("all selected Chongqing points carry point-level decision profiles", () => {
  const input = fixture("TC60", "en");
  const result = decide(database, input);
  const selected = result.days.flatMap((day) => day.modules);
  assert.ok(selected.every((module) => module.decisionProfile));
  assert.ok(selected.flatMap((module) => module.pointProfiles).every((point) => point.guest_value && point.choose_rule && point.stop_after));
  assert.equal(result.pointDecisionLayerVersion, "1.0");
});

test("research-candidate experience never becomes a booking promise in prose", () => {
  const input = fixture("TC47", "en");
  const decision = decide(database, input);
  const markdown = renderRoadbookMarkdown(decision, input);
  assert.equal(decision.commercial.mayQuote, false);
  assert.equal(decision.commercial.mayTakePayment, false);
  assert.equal(decision.commercial.digitalRoadbook.mayTakePayment, true);
  assert.equal(decision.commercial.digitalRoadbook.requiresHumanReview, true);
  assert.match(markdown, /research candidate/i);
  assert.match(markdown, /no experience payment should be taken/i);
  assert.doesNotMatch(markdown, /confirmed booking|your guide is available|pay now/i);
});

test("incomplete safety intake can offer but cannot charge for a digital roadbook", () => {
  const input = fixture("TC01", "en");
  const decision = decide(database, input);
  assert.equal(decision.status, "needs_confirmation");
  assert.equal(decision.commercial.digitalRoadbook.mayOffer, true);
  assert.equal(decision.commercial.digitalRoadbook.mayTakePayment, false);
  assert.match(decision.commercial.digitalRoadbook.boundary, /never authorises payment for a guide/i);
});

test("paid roadbook standard keeps digital payment separate from experience payment", () => {
  assert.match(paidRoadbookStandard, /commercial\.mayTakePayment/);
  assert.match(paidRoadbookStandard, /commercial\.digitalRoadbook\.mayTakePayment/);
  assert.match(paidRoadbookStandard, /不含任何体验、订位、票务、导游/u);
  assert.match(paidRoadbookStandard, /US\$49/);
  assert.match(paidRoadbookStandard, /US\$99/);
});

test("wheelchair evidence gap produces an explicit no-route roadbook", () => {
  const input = fixture("TC59", "en");
  const decision = decide(database, input);
  const roadbook = buildRoadbookData(decision, input);
  const markdown = renderRoadbookMarkdown(decision, input);
  assert.ok(roadbook.days.every((day) => day.modules.length === 0));
  assert.match(markdown, /No route is proposed/i);
  assert.match(markdown, /continuous step-free access/i);
  assert.doesNotMatch(markdown, /Fully accessible/i);
});

test("severe-allergy roadbook excludes the unverified food module", () => {
  const input = fixture("TC13", "en");
  const decision = decide(database, input);
  const selected = decision.days.flatMap((day) => day.modules.map((module) => module.moduleId));
  const markdown = renderRoadbookMarkdown(decision, input);
  assert.ok(!selected.includes("RM12"));
  assert.match(markdown, /written venue confirmation of ingredients and cross-contamination controls/i);
  assert.doesNotMatch(markdown, /Safe for your allergy/i);
});
