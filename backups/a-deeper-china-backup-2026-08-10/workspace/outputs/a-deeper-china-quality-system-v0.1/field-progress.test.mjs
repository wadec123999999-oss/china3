import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanFieldRecords } from './field-progress.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));

test('P0 progress scanner sees only incomplete templates before field work', () => {
  const report = scanFieldRecords({ directory: path.join(here, '现场记录模板_P0_20260803'), travelStart: '2026-09-10' });
  assert.equal(report.valid, true);
  assert.equal(report.total, 8);
  assert.equal(report.incomplete, 8);
  assert.equal(report.pass, 0);
  assert.equal(report.evidence_eligible, 0);
});
