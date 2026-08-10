import test from 'node:test';
import assert from 'node:assert/strict';
import { fieldRunToEvidence } from '../../a-deeper-china-quality-system-v0.1/field-run-evidence.mjs';

test('a passed field run becomes auditable evidence for its route modules', () => {
  const result = fieldRunToEvidence({
    task_id: 'SH-FIELD-001',
    route_modules: ['SHM04'],
    result: 'pass',
    applies_to_travel_start: '2026-09-10',
    tester: 'Ming Chen',
    checked_at: '2026-08-03T15:00:00+08:00',
    finding: 'The tested entrance and English wayfinding worked for the selected route.',
    evidence: [{ type: 'photo', reference: 'https://example.com/photo.jpg', description: 'Entrance evidence' }]
  }, { travelStart: '2026-09-10' });
  assert.equal(result.valid, true);
  assert.equal(result.evidence.kind, 'field_run');
  assert.deepEqual(result.evidence.module_ids, ['SHM04']);
});

test('conditional or local-only field records cannot become release evidence', () => {
  const result = fieldRunToEvidence({
    task_id: 'JM-FIELD-002',
    route_modules: ['JMM03'],
    result: 'conditional_pass',
    applies_to_travel_start: '2026-09-10',
    tester: 'Ming Chen',
    checked_at: '2026-08-03T15:00:00+08:00',
    finding: 'Only a conditional public route was observed.',
    evidence: [{ type: 'photo', reference: '/local/photo.jpg', description: 'Local evidence' }]
  }, { travelStart: '2026-09-10' });
  assert.equal(result.valid, false);
});

test('future field-run check time cannot become release evidence', () => {
  const result = fieldRunToEvidence({
    task_id: 'SH-FIELD-001', route_modules: ['SHM04'], result: 'pass',
    applies_to_travel_start: '2026-09-10', tester: 'Ming Chen',
    checked_at: '2026-09-01T15:00:00+08:00',
    finding: 'The route was checked with a documented entry and exit.',
    evidence: [{ type: 'photo', reference: 'https://example.com/photo.jpg' }]
  }, { travelStart: '2026-09-10' });
  assert.equal(result.valid, false);
  assert.match(result.errors[0], /future/);
});
