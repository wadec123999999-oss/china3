#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const recordDirectory = path.resolve(here, '../field-records');

const tasks = {
  SHRUN001: 'People’s Square museum and civic-core route',
  SHRUN002: 'Bund-to-Pudong transition',
  SHRUN003: 'Hengfu / Wukang ethical walking loop',
  SHRUN004: 'Yangpu or West Bund public-space route',
  SHRUN005: 'Foreign-visitor roadbook usability test',
  SHRUN006: 'English Tai Chi product release'
};

export function buildBlankRecord(runId) {
  if (!Object.hasOwn(tasks, runId)) throw new Error(`Unknown run_id: ${runId}. Use SHRUN001 through SHRUN006.`);
  return {
    run_id: runId,
    field_date: '',
    tester: '',
    object: tasks[runId],
    weather_crowd: null,
    actual_minutes: null,
    route_entry_exit: null,
    toilet_seating_water: null,
    english_access: null,
    rain_heat_fallback: null,
    resident_privacy: null,
    supplier_gate_results: runId === 'SHRUN006' ? {} : null,
    safety_blocking: false,
    result: 'incomplete',
    conditions: null,
    issues_changes: null,
    evidence: []
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const runId = process.argv[2];
  if (!runId) throw new Error('Usage: node bin/new-field-record.mjs SHRUN001');
  const target = path.join(recordDirectory, `${runId}.json`);
  if (fs.existsSync(target)) throw new Error(`Refusing to overwrite existing record: ${target}`);
  fs.writeFileSync(target, `${JSON.stringify(buildBlankRecord(runId), null, 2)}\n`, 'utf8');
  console.log(`Created blank field record: ${target}`);
  console.log('Fill it with real dated evidence, then run bin/validate-field-record.mjs.');
}
