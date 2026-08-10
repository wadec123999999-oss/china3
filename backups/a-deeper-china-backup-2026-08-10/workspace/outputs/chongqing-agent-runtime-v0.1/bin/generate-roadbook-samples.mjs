import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { decide } from "../src/core.mjs";
import { renderRoadbookMarkdown } from "../src/roadbook.mjs";
import { regressionCases } from "../fixtures/regression-cases.mjs";

const runtimeDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const databasePath = process.argv[2]
  ?? path.resolve(runtimeDir, "../chongqing-agent-database-20260729/重庆主城智能体数据库_V1.0.json");
const outputDir = path.resolve(runtimeDir, "samples");
const database = JSON.parse(await fs.readFile(databasePath, "utf8"));

const sampleSpecs = [
  ["TC51", "sample-1day-first-visit.md"],
  ["TC52", "sample-1day-history.md"],
  ["TC53", "sample-1day-food.md"],
  ["TC54", "sample-1day-repeat-visitor.md"],
  ["TC01", "sample-3day-family-draft.md"],
];

await fs.mkdir(outputDir, { recursive: true });
for (const [testId, filename] of sampleSpecs) {
  const fixture = regressionCases.find((item) => item.id === testId);
  if (!fixture) throw new Error(`Missing fixture ${testId}`);
  const input = { ...fixture.input, locale: "en" };
  const decision = decide(database, input);
  const markdown = renderRoadbookMarkdown(decision, input);
  await fs.writeFile(path.resolve(outputDir, filename), markdown, "utf8");
}

process.stdout.write(`Generated ${sampleSpecs.length} roadbook samples in ${outputDir}\n`);
