import test from 'node:test';
import assert from 'node:assert/strict';
import { loadFieldTaskPacket, findFieldTask } from './field-task-packet-loader.mjs';
import { createFieldRecordTemplate } from './field-record-template.mjs';

test('supplemental V0.2 field packs merge without losing V0.1 tasks', () => {
  const packet = loadFieldTaskPacket();
  assert.equal(packet.schema_version, '0.2');
  assert.ok(packet.packs.some(pack => pack.city === 'Shanghai'));
  assert.ok(packet.packs.some(pack => pack.city === 'Beijing'));
  assert.ok(packet.packs.some(pack => pack.city === 'Jingdezhen'));
  assert.ok(packet.packs.flatMap(pack => pack.tasks).length >= 22);
});

test('new P1 task can create an incomplete record but not evidence', () => {
  const found = findFieldTask('Beijing', 'BJ-FIELD-001');
  assert.ok(found.task);
  const result = createFieldRecordTemplate({ city: 'Beijing', task_id: 'BJ-FIELD-001' });
  assert.equal(result.valid, true);
  assert.equal(result.record.result, 'incomplete');
  assert.deepEqual(result.record.evidence, []);
});
