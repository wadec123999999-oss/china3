import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { summarizeFieldProgress, validateFieldRunRecord } from "../src/field-ops.mjs";

const runtimeDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const recordsDir = process.argv[2] ?? path.resolve(runtimeDir, "field-records");
const databasePath = process.argv[3]
  ?? path.resolve(runtimeDir, "../chongqing-agent-database-20260729/重庆主城智能体数据库_V1.0.json");
const database = JSON.parse(await fs.readFile(databasePath, "utf8"));

let filenames = [];
try {
  filenames = (await fs.readdir(recordsDir)).filter((file) => /^RUN\d{3}\.json$/.test(file));
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
const records = await Promise.all(filenames.map(async (file) => {
  const fullPath = path.resolve(recordsDir, file);
  const record = JSON.parse(await fs.readFile(fullPath, "utf8"));
  const validation = validateFieldRunRecord(database, record);
  if (!validation.valid) throw new Error(`${file}: ${validation.errors.join("; ")}`);
  return record;
}));

process.stdout.write(`${JSON.stringify(summarizeFieldProgress(database, records), null, 2)}\n`);
