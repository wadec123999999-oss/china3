import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateFieldRunRecord } from "../src/field-ops.mjs";

const runtimeDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const recordPath = process.argv[2];
const databasePath = process.argv[3]
  ?? path.resolve(runtimeDir, "../chongqing-agent-database-20260729/重庆主城智能体数据库_V1.0.json");

if (!recordPath) {
  process.stderr.write("Usage: node bin/validate-field-record.mjs /absolute/path/record.json [database.json]\n");
  process.exit(1);
}

const [database, record] = await Promise.all([
  fs.readFile(databasePath, "utf8").then(JSON.parse),
  fs.readFile(path.resolve(recordPath), "utf8").then(JSON.parse),
]);
const result = validateFieldRunRecord(database, record);
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
process.exit(result.valid ? 0 : 2);
