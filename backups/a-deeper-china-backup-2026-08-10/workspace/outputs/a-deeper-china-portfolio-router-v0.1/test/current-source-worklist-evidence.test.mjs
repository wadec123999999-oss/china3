import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { currentSourceWorklistToEvidence } from '../src/current-source-worklist-evidence.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const sample = JSON.parse(fs.readFileSync(path.resolve(here, '../../a-deeper-china-quality-system-v0.1/日期化来源工作单_2026-09-10_2026-09-13.json'), 'utf8'));

test('pending worklist produces no evidence records', () => {
  const result = currentSourceWorklistToEvidence(sample, { travelStart: '2026-09-10' });
  assert.equal(result.valid, true);
  assert.equal(result.evidence.length, 0);
  assert.equal(result.pending_count, 4);
});

test('a complete valid task converts to a current_source evidence record', () => {
  const task = {
    task_id: 'CST-TEST-01', source_id: 'SRC-TEST-01', module_ids: ['SHM04'],
    applies_to_travel_start: '2026-09-10', applies_to_travel_end: '2026-09-13', status: 'complete',
    required_evidence: {
      checked_by: 'Ming Chen', checked_at: '2026-08-03T10:00:00+08:00', evidence_url: 'https://example.com/check',
      finding: 'The official rule was checked for the exact travel dates.'
    }
  };
  const result = currentSourceWorklistToEvidence({ tasks: [task] }, { travelStart: '2026-09-10' });
  assert.equal(result.valid, true);
  assert.deepEqual(result.evidence[0], {
    kind: 'current_source', id: 'SRC-TEST-01', module_ids: ['SHM04'], applies_to_travel_start: '2026-09-10',
    checked_by: 'Ming Chen', checked_at: '2026-08-03T10:00:00+08:00', evidence_url: 'https://example.com/check',
    finding: 'The official rule was checked for the exact travel dates.'
  });
});

test('a complete task with a mismatched travel start cannot convert', () => {
  const task = {
    task_id: 'CST-TEST-02', source_id: 'SRC-TEST-02', module_ids: ['SHM04'],
    applies_to_travel_start: '2026-09-11', applies_to_travel_end: '2026-09-13', status: 'complete',
    required_evidence: { checked_by: 'Ming Chen', checked_at: '2026-08-03T10:00:00+08:00', evidence_url: 'https://example.com/check', finding: 'Checked the source.' }
  };
  const result = currentSourceWorklistToEvidence({ tasks: [task] }, { travelStart: '2026-09-10' });
  assert.equal(result.valid, false);
  assert.equal(result.evidence.length, 0);
});
