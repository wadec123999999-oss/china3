import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { findFieldTask } from './field-task-packet-loader.mjs';
import { isFutureDateTime } from './date-boundary.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));

function todayIso() {
  return '2026-08-03';
}

function findTask(city, taskId) {
  return findFieldTask(city, taskId);
}

function observationKeys(values = []) {
  return Object.fromEntries(values.map(value => [value, null]));
}

export function createFieldRecordTemplate({ city, task_id, field_date = null } = {}) {
  const { task } = findTask(city, task_id);
  if (!task) return { valid: false, errors: [`unknown task: ${city || '(missing)'}/${task_id || '(missing)'}`] };
  if (field_date && (!/^\d{4}-\d{2}-\d{2}$/.test(field_date) || field_date > todayIso())) {
    return { valid: false, errors: ['field_date must be a valid date no later than 2026-08-03'] };
  }
  return {
    valid: true,
    record: {
      schema_version: '0.1',
      city,
      task_id,
      route_modules: task.route_modules,
      object: task.object,
      method: task.method,
      field_date,
      applies_to_travel_start: null,
      checked_at: null,
      tester: null,
      companion_tester: null,
      weather_crowd: null,
      start_time: null,
      end_time: null,
      actual_minutes: null,
      result: 'incomplete',
      safety_blocking: false,
      observations: observationKeys(task.must_record),
      finding: null,
      conditions: null,
      failure_reason: null,
      issues_changes: null,
      evidence: [],
      minimum_evidence: task.minimum_evidence,
      pass_criteria: task.pass_criteria,
      blocking_condition: task.blocking_condition,
      cannot_promote_to: task.cannot_promote_to,
      notes: 'Template only. Do not change result to pass without real dated evidence.'
    }
  };
}

export function validateFieldRecord(record = {}) {
  const errors = [];
  if (!record || typeof record !== 'object' || Array.isArray(record)) return { valid: false, errors: ['record must be an object'] };
  for (const field of ['schema_version', 'city', 'task_id', 'object', 'method', 'result', 'evidence']) {
    if (!(field in record)) errors.push(`missing ${field}`);
  }
  if (record.schema_version !== '0.1') errors.push('schema_version must be 0.1');
  if (!['pass', 'conditional_pass', 'fail', 'incomplete'].includes(record.result)) errors.push('invalid result');
  if (record.field_date !== null && record.field_date !== undefined) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(record.field_date)) errors.push('field_date must be YYYY-MM-DD');
    else if (record.field_date > todayIso()) errors.push('field_date cannot be in the future');
  }
  if (record.result !== 'incomplete' && (!/^\d{4}-\d{2}-\d{2}$/.test(record.applies_to_travel_start || ''))) errors.push('applies_to_travel_start is required for a concluded record');
  if (record.result !== 'incomplete') {
    if (typeof record.tester !== 'string' || record.tester.trim().length < 2) errors.push('tester is required for a concluded record');
    if (typeof record.checked_at !== 'string' || Number.isNaN(Date.parse(record.checked_at))) errors.push('checked_at is required for a concluded record');
    else if (isFutureDateTime(record.checked_at)) errors.push('checked_at cannot be in the future relative to the audit date');
    if (!Array.isArray(record.evidence) || record.evidence.length < 2) errors.push('a concluded record needs at least two evidence items');
    if (typeof record.finding !== 'string' || record.finding.trim().length < 8) errors.push('finding is required for a concluded record');
  }
  if (record.result === 'pass' && record.safety_blocking === true) errors.push('safety-blocking record cannot pass');
  if (record.result === 'conditional_pass' && (!record.conditions || String(record.conditions).trim().length < 8)) errors.push('conditional_pass requires conditions');
  if (record.result === 'fail' && (!record.failure_reason || String(record.failure_reason).trim().length < 8)) errors.push('fail requires failure_reason');
  if (JSON.stringify(record).match(/replace-with|example only|placeholder/i) && record.result === 'pass') errors.push('pass record contains placeholder text');
  return { valid: errors.length === 0, errors: [...new Set(errors)] };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [city, taskId, fieldDate = null] = process.argv.slice(2);
  if (!city || !taskId) throw new Error('Usage: node field-record-template.mjs <city> <task_id> [field_date]');
  process.stdout.write(`${JSON.stringify(createFieldRecordTemplate({ city, task_id: taskId, field_date: fieldDate }), null, 2)}\n`);
}
