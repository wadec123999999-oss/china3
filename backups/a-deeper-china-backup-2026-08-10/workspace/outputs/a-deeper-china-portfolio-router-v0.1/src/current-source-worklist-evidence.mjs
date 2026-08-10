import { validateCurrentSourceTask } from './current-source-worklist-validator.mjs';

function flattenTasks(worklist = {}) {
  if (Array.isArray(worklist.city_results)) {
    return worklist.city_results.flatMap(item => (item.tasks || []).map(task => ({ ...task, city: item.city })));
  }
  return Array.isArray(worklist.tasks) ? worklist.tasks : [];
}

/**
 * Convert only complete, independently validated current-source tasks into
 * evidence records accepted by createRoadbookBrief(). Pending tasks are
 * intentionally ignored; invalid complete tasks stop the conversion.
 */
export function currentSourceWorklistToEvidence(worklist = {}, { travelStart } = {}) {
  const tasks = flattenTasks(worklist);
  const evidence = [];
  const errors = [];
  for (const task of tasks) {
    if (task.status !== 'complete') continue;
    const validation = validateCurrentSourceTask(task);
    if (!validation.valid) {
      errors.push(`${task.task_id || 'current-source-task'}: ${validation.errors.join('; ')}`);
      continue;
    }
    if (!travelStart || task.applies_to_travel_start !== travelStart) {
      errors.push(`${task.task_id}: task travel start does not match the requested roadbook travel start`);
      continue;
    }
    const checked = task.required_evidence;
    evidence.push({
      kind: 'current_source',
      id: task.source_id || task.task_id,
      module_ids: task.module_ids,
      applies_to_travel_start: task.applies_to_travel_start,
      checked_by: checked.checked_by,
      checked_at: checked.checked_at,
      evidence_url: checked.evidence_url,
      finding: checked.finding
    });
  }
  return { valid: errors.length === 0, evidence, errors, pending_count: tasks.filter(task => task.status !== 'complete').length };
}
