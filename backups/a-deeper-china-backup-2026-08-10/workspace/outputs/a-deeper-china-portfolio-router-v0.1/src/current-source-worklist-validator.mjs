import { isFutureDateTime } from '../../a-deeper-china-quality-system-v0.1/date-boundary.mjs';

function isHttps(value) {
  return typeof value === 'string' && /^https:\/\//.test(value);
}

export function validateCurrentSourceTask(task = {}) {
  const errors = [];
  if (!task || typeof task !== 'object') return { valid: false, status: 'invalid', errors: ['task must be an object'] };
  if (typeof task.task_id !== 'string' || !task.task_id.trim()) errors.push('task_id is required');
  if (!Array.isArray(task.module_ids) || task.module_ids.length === 0) errors.push('module_ids are required');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(task.applies_to_travel_start || '')) errors.push('applies_to_travel_start is required');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(task.applies_to_travel_end || '')) errors.push('applies_to_travel_end is required');
  if (task.applies_to_travel_start && task.applies_to_travel_end && task.applies_to_travel_start > task.applies_to_travel_end) errors.push('travel end must not precede travel start');
  const evidence = task.required_evidence && typeof task.required_evidence === 'object' ? task.required_evidence : {};
  const values = [evidence.checked_by, evidence.checked_at, evidence.evidence_url, evidence.finding];
  const anyEvidence = values.some(value => value !== null && value !== undefined && value !== '');
  const complete = task.status === 'complete';
  if (!complete && anyEvidence) errors.push('pending task cannot contain partial evidence; mark complete only after all fields are filled');
  if (complete) {
    if (typeof evidence.checked_by !== 'string' || evidence.checked_by.trim().length < 2) errors.push('checked_by is required for a complete task');
    if (typeof evidence.checked_at !== 'string' || Number.isNaN(Date.parse(evidence.checked_at))) errors.push('checked_at must be an ISO date-time');
    else if (isFutureDateTime(evidence.checked_at)) errors.push('checked_at cannot be in the future relative to the audit date');
    if (!isHttps(evidence.evidence_url)) errors.push('evidence_url must be an HTTPS traceable link');
    if (typeof evidence.finding !== 'string' || evidence.finding.trim().length < 8) errors.push('finding must be a concrete conclusion');
  }
  return { valid: errors.length === 0, status: complete ? 'complete' : 'pending', errors: [...new Set(errors)] };
}

export function validateCurrentSourceWorklist(worklist = {}) {
  const tasks = Array.isArray(worklist.city_results)
    ? worklist.city_results.flatMap(item => (item.tasks || []).map(task => ({ ...task, city: item.city })))
    : Array.isArray(worklist.tasks) ? worklist.tasks : [];
  const results = tasks.map(task => ({ city: task.city || null, task_id: task.task_id || null, ...validateCurrentSourceTask(task) }));
  return {
    valid: results.every(result => result.valid),
    total: results.length,
    pending: results.filter(result => result.status === 'pending').length,
    complete: results.filter(result => result.status === 'complete').length,
    results
  };
}
