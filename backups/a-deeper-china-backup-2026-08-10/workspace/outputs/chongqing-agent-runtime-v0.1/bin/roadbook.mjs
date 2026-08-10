import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { decide } from "../src/core.mjs";
import { renderRoadbookMarkdown } from "../src/roadbook.mjs";

const runtimeDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const inputPath = process.argv[2];
const databasePath = process.argv[3]
  ?? path.resolve(runtimeDir, "../chongqing-agent-database-20260729/重庆主城智能体数据库_V1.0.json");

if (!inputPath) {
  console.error("Usage: node bin/roadbook.mjs <request.json> [database.json]");
  process.exitCode = 2;
} else {
  const [input, database] = await Promise.all([
    fs.readFile(path.resolve(inputPath), "utf8").then(JSON.parse),
    fs.readFile(databasePath, "utf8").then(JSON.parse),
  ]);
  process.stdout.write(renderRoadbookMarkdown(decide(database, input), input));
}
