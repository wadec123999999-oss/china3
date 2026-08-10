import test from 'node:test';
import assert from 'node:assert/strict';
import { progress, validateRecord } from '../src/field-ops.mjs';
import { buildBlankRecord } from '../bin/new-field-record.mjs';

const evidence = [{ type: 'photo', reference: 'photo-1', description: 'entry' }, { type: 'track', reference: 'track-1', description: 'route' }];

test('a normal field record accepts two traceable evidence items', () => {
  const record = { run_id: 'SHRUN001', field_date: '2026-08-02', tester: 'tester', object: 'museum', result: 'pass', safety_blocking: false, evidence };
  assert.deepEqual(validateRecord(record), []);
});

test('Tai Chi cannot pass without all seven release gates', () => {
  const record = { run_id: 'SHRUN006', field_date: '2026-08-02', tester: 'tester', object: 'Tai Chi', result: 'pass', safety_blocking: false, evidence, supplier_gate_results: { english_trial: 'pass' } };
  assert.ok(validateRecord(record).some(x => x.includes('Tai Chi gate not passed')));
});

test('a failed or missing launch record does not make a route ready', () => {
  const report = progress([{ run_id: 'SHRUN001', result: 'pass', safety_blocking: false }]);
  assert.equal(report.find(x => x.id === 'SHLFV001').ready, true);
  assert.equal(report.find(x => x.id === 'SHLFV002').ready, false);
});

test('blank field records cannot be mistaken for evidence', () => {
  const record = buildBlankRecord('SHRUN001');
  assert.equal(record.field_date, '');
  assert.equal(record.result, 'incomplete');
  assert.ok(validateRecord(record).some(error => error.includes('Missing field_date')));
  assert.ok(validateRecord(record).some(error => error.includes('At least two evidence')));
});

test('Tai Chi blank record retains all seven release gates as an explicit empty object', () => {
  const record = buildBlankRecord('SHRUN006');
  assert.deepEqual(record.supplier_gate_results, {});
  assert.ok(validateRecord(record).some(error => error.includes('Tai Chi gate not passed')));
});

test('future field dates cannot pass', () => {
  const record = { run_id: 'SHRUN001', field_date: '2099-01-01', tester: 'tester', object: 'museum', result: 'pass', safety_blocking: false, evidence };
  assert.ok(validateRecord(record).some(error => error.includes('cannot be in the future')));
});

test('example placeholders cannot pass as real evidence', () => {
  const record = { run_id: 'SHRUN001', field_date: '2026-08-02', tester: 'tester', object: 'museum', result: 'pass', safety_blocking: false, evidence: [{ type: 'photo', reference: 'replace-with-real-photo', description: 'replace with a real photo' }, { type: 'map_card', reference: 'map-1', description: 'route' }] };
  assert.ok(validateRecord(record).some(error => error.includes('placeholder')));
});
