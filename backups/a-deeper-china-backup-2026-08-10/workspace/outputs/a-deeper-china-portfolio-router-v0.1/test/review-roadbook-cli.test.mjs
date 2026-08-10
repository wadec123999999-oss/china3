import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateReviewRecord } from '../bin/review-roadbook.mjs';

const base = {
  schema_version: '0.1',
  review_id: 'RBR-SHANGHAI-TEST-001',
  city_unit: 'shanghai',
  city: 'Shanghai',
  module_ids: ['SHM01'],
  travel_start: '2026-09-10',
  travel_end: '2026-09-13',
  reviewed_at: '2026-08-03T10:00:00+08:00',
  reviewer: 'Test reviewer',
  completed_check_ids: [],
  current_source_ids: [],
  evidence_links: [],
  decision: 'human_checked_ready',
  notes: ''
};

test('review-roadbook keeps an unsupported human-checked declaration as draft_only', () => {
  const result = evaluateReviewRecord(base);
  assert.equal(result.valid, false);
  assert.equal(result.status, 'draft_only');
  assert.match(result.next_action, /draft_only/);
});
