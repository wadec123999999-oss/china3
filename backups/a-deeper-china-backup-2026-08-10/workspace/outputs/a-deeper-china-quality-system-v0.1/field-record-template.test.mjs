import test from 'node:test';
import assert from 'node:assert/strict';
import { createFieldRecordTemplate, validateFieldRecord } from './field-record-template.mjs';

test('Shanghai field task produces a fillable incomplete record', () => {
  const result = createFieldRecordTemplate({ city: 'Shanghai', task_id: 'SH-FIELD-001' });
  assert.equal(result.valid, true);
  assert.equal(result.record.result, 'incomplete');
  assert.equal(result.record.tester, null);
  assert.ok(result.record.observations['English wayfinding'] === null);
  assert.deepEqual(validateFieldRecord(result.record), { valid: true, errors: [] });
});

test('a completed field record needs evidence and a concrete finding', () => {
  const template = createFieldRecordTemplate({ city: 'Chongqing', task_id: 'CQ-FIELD-001', field_date: '2026-08-03' }).record;
  const incomplete = { ...template, result: 'pass', tester: 'Test reviewer' };
  const rejected = validateFieldRecord(incomplete);
  assert.equal(rejected.valid, false);
  assert.ok(rejected.errors.some(error => error.includes('two evidence')));
  assert.ok(rejected.errors.some(error => error.includes('finding')));
});

test('future field dates cannot be generated', () => {
  const result = createFieldRecordTemplate({ city: 'Jingmai Mountain', task_id: 'JM-FIELD-001', field_date: '2026-08-04' });
  assert.equal(result.valid, false);
  assert.match(result.errors[0], /no later than 2026-08-03/);
});

test('weak task templates cannot imply release', () => {
  const result = createFieldRecordTemplate({ city: 'Jingmai Mountain', task_id: 'JM-FIELD-002' });
  assert.equal(result.valid, true);
  assert.equal(result.record.result, 'incomplete');
  assert.match(result.record.notes, /Template only/);
  assert.ok(result.record.cannot_promote_to.includes('private tea ceremony'));
});

