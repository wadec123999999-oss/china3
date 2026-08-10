import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const packet = JSON.parse(fs.readFileSync(path.join(here, 'field-review-task-packs_V0.1.json'), 'utf8'));

test('priority field-review packs are structured and unstarted', () => {
  assert.equal(packet.schema_version, '0.1');
  assert.equal(packet.packs.length, 4);
  const tasks = packet.packs.flatMap(pack => pack.tasks);
  assert.ok(tasks.length >= 10);
  for (const task of tasks) {
    for (const key of ['task_id', 'city', 'object', 'method', 'why', 'must_record', 'minimum_evidence', 'pass_criteria', 'blocking_condition', 'cannot_promote_to']) {
      // City is inherited from the pack; all other fields must be explicit.
      if (key !== 'city') assert.ok(task[key], `${task.task_id}: ${key}`);
    }
    assert.ok(Array.isArray(task.must_record) && task.must_record.length > 0);
    assert.ok(Array.isArray(task.minimum_evidence) && task.minimum_evidence.length > 0);
    assert.ok(!JSON.stringify(task).match(/field_verified|human_checked_ready|booking confirmed/i));
  }
});

test('field-review packs cover both public access and community/supplier boundaries', () => {
  const text = JSON.stringify(packet);
  assert.match(text, /passport\/identity/);
  assert.match(text, /private workshop/);
  assert.match(text, /community consent/);
  assert.match(text, /cannot_promote_to/);
});

