import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateCurrentSourceWorklist, validateCurrentSourceTask } from '../src/current-source-worklist-validator.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const samplePath = path.resolve(here, '../../a-deeper-china-quality-system-v0.1/日期化来源工作单_2026-09-10_2026-09-13.json');

test('generated Shanghai/Chongqing worklist is valid but still pending', () => {
  const worklist = JSON.parse(fs.readFileSync(samplePath, 'utf8'));
  const result = validateCurrentSourceWorklist(worklist);
  assert.equal(result.valid, true);
  assert.equal(result.total, 4);
  assert.equal(result.pending, 4);
  assert.equal(result.complete, 0);
});

test('partial or future evidence cannot complete a current-source task', () => {
  const base = {
    task_id: 'CST-TEST-01', module_ids: ['SHM04'], applies_to_travel_start: '2026-09-10', applies_to_travel_end: '2026-09-13', status: 'complete',
    required_evidence: { checked_by: 'Ming Chen', checked_at: '2026-09-01T10:00:00+08:00', evidence_url: 'https://example.com/check', finding: 'Checked the exact travel-date rule.' }
  };
  const result = validateCurrentSourceTask(base);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(error => error.includes('future')));
  const partial = validateCurrentSourceTask({ ...base, status: 'pending', required_evidence: { checked_by: 'Ming Chen', checked_at: null, evidence_url: null, finding: null } });
  assert.equal(partial.valid, false);
});
