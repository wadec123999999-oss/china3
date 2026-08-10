import test from 'node:test';
import assert from 'node:assert/strict';
import { createCurrentSourceTasks } from '../src/current-source-tasks.mjs';

test('Shanghai client dates produce empty dynamic-source tasks without fake evidence', () => {
  const result = createCurrentSourceTasks({
    city: 'Shanghai',
    module_ids: ['SHM01', 'SHM04'],
    travel_start: '2026-09-10',
    travel_end: '2026-09-13'
  });
  assert.equal(result.valid, true);
  assert.equal(result.status, 'pending_current_check');
  assert.ok(result.tasks.length >= 2);
  assert.ok(result.tasks.every(task => task.status === 'pending'));
  assert.ok(result.tasks.every(task => task.required_evidence.checked_by === null));
  assert.ok(result.tasks.every(task => task.applies_to_travel_start === '2026-09-10'));
});

test('weak-source city still produces no false current-source task', () => {
  const result = createCurrentSourceTasks({
    city: 'Wudang Mountains',
    module_ids: ['WDM02'],
    travel_start: '2026-09-10',
    travel_end: '2026-09-13'
  });
  assert.equal(result.valid, true);
  assert.equal(result.status, 'no_dynamic_tasks_for_selected_scope');
  assert.deepEqual(result.tasks, []);
});

test('invalid or future travel dates are rejected before reading source files', () => {
  const result = createCurrentSourceTasks({
    city: 'Shanghai',
    module_ids: ['SHM01'],
    travel_start: '2026-09-14',
    travel_end: '2026-09-10'
  });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(error => error.includes('on or after')));
});
