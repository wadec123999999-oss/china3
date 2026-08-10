import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const registry = JSON.parse(fs.readFileSync(path.join(root, '现场核验总登记册_V1.0.json'), 'utf8'));
const rows = [];
for (const city of registry.cities) {
  const runtime = path.join(root, '..', city.runtime);
  const progressScript = path.join(runtime, 'bin/field-progress.mjs');
  let progress = null;
  if (fs.existsSync(progressScript)) {
    const result = spawnSync(process.execPath, [progressScript], { encoding: 'utf8' });
    if (result.status === 0) {
      try { progress = JSON.parse(result.stdout); } catch { progress = { parse_error: true }; }
    } else progress = { command_error: true };
  }
  const checks = progress?.launchChecks ?? progress?.launch_checks ?? [];
  rows.push({
    city: city.city,
    registryStatus: city.status,
    launchChecks: city.launch_checks.length,
    progressAvailable: Boolean(progress),
    receivedRuns: progress?.receivedRuns ?? (progress?.totalRuns !== undefined && progress?.receivedRuns === undefined ? progress.totalRuns : 0),
    passedRuns: progress?.passedRuns ?? 0,
    readyChecks: checks.filter(check => check.ready).length,
    totalChecks: checks.length || city.launch_checks.length,
    experienceSellable: progress?.experienceProducts?.filter(product => product.sellable).length ?? (progress?.taiChiSellable ? 1 : 0)
  });
}
const summary = {
  generated_at: '2026-08-03',
  cities: rows.length,
  cities_with_progress_command: rows.filter(row => row.progressAvailable).length,
  cities_with_any_received_runs: rows.filter(row => row.receivedRuns > 0).length,
  cities_with_ready_checks: rows.filter(row => row.readyChecks > 0).length,
  cities_with_sellable_experience: rows.filter(row => row.experienceSellable > 0).length,
  rows
};
console.log(JSON.stringify(summary, null, 2));
