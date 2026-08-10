import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { regressionCases } from "../fixtures/regression-cases.mjs";
import { runRegression } from "../src/regression.mjs";

const runtimeDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const databasePath = process.argv[2]
  ?? path.resolve(runtimeDir, "../chongqing-agent-database-20260729/重庆主城智能体数据库_V1.0.json");
const reportPath = process.argv[3]
  ?? path.resolve(runtimeDir, "reports/regression-results-v0.1.json");

const database = JSON.parse(await fs.readFile(databasePath, "utf8"));
const report = runRegression(database, regressionCases);
await fs.mkdir(path.dirname(reportPath), { recursive: true });
await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

process.stdout.write(
  `${report.passedCases}/${report.totalCases} cases passed; ${report.assertionCount} assertions; report: ${reportPath}\n`,
);
if (report.failedCases > 0) process.exitCode = 1;
