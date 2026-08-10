import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const runtimeDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const databasePath = process.argv[3] ?? path.resolve(runtimeDir, '../chongqing-agent-database-20260729/重庆主城智能体数据库_V1.0.json');
const runId = process.argv[2];
if (!runId) throw new Error('Usage: node bin/new-field-record.mjs RUN001');
const database = JSON.parse(await fs.readFile(databasePath, 'utf8'));
const run = database.field_run_plan?.find(item => item.run_id === runId);
if (!run) throw new Error(`Unknown run_id: ${runId}`);
const target = path.resolve(runtimeDir, 'field-records', `${runId}.draft.json`);
try { await fs.access(target); throw new Error(`Refusing to overwrite existing draft: ${target}`); } catch (error) { if (error.code !== 'ENOENT') throw error; }
const record = {
  run_id: run.run_id,
  launch_check_id: run.launch_check_id,
  field_date: '',
  tester: '',
  companion_tester: null,
  weather_crowd: '',
  start_time: '',
  end_time: '',
  actual_minutes: '',
  steps: '',
  stairs_slope: '',
  entrance_exit: '',
  toilet_seating_water: '',
  crowd_safety_privacy: '',
  fallback_exit: '',
  safety_blocking: false,
  result: 'incomplete',
  conditions: null,
  failure_reason: null,
  issues_changes: '',
  evidence: []
};
await fs.writeFile(target, `${JSON.stringify(record, null, 2)}\n`, 'utf8');
console.log(`Created draft field record: ${target}`);
console.log('Fill every field with dated evidence, then rename to RUNxxx.json and run bin/validate-field-record.mjs.');
