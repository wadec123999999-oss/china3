/**
 * Convert a validated generic field record into the evidence-record shape
 * accepted by createRoadbookBrief(). It never upgrades incomplete,
 * conditional or failed records.
 */
export function fieldRunToEvidence(record = {}, { travelStart } = {}) {
  const moduleIds = Array.isArray(record.module_ids) ? record.module_ids : Array.isArray(record.route_modules) ? record.route_modules : [];
  const evidence = Array.isArray(record.evidence) ? record.evidence : [];
  const evidenceUrl = record.evidence_url || evidence.map(item => item?.reference).find(reference => /^https?:\/\//.test(String(reference || '')));
  if (record.result !== 'pass') return { valid: false, errors: [`${record.task_id || record.run_id || 'field_run'}: only pass records can become release evidence`] };
  if (!moduleIds.length) return { valid: false, errors: ['field_run must include module_ids or route_modules'] };
  if (!travelStart || record.applies_to_travel_start !== travelStart) return { valid: false, errors: ['field_run must explicitly apply to the client travel start date'] };
  if (typeof record.tester !== 'string' || record.tester.trim().length < 2) return { valid: false, errors: ['field_run tester is required'] };
  if (typeof record.checked_at !== 'string' || Number.isNaN(Date.parse(record.checked_at))) return { valid: false, errors: ['field_run checked_at is required'] };
  if (isFutureDateTime(record.checked_at)) return { valid: false, errors: ['field_run checked_at cannot be in the future relative to the audit date'] };
  if (!/^https?:\/\//.test(String(evidenceUrl || ''))) return { valid: false, errors: ['field_run needs at least one HTTPS evidence reference'] };
  if (typeof record.finding !== 'string' || record.finding.trim().length < 8) return { valid: false, errors: ['field_run finding is required'] };
  return {
    valid: true,
    evidence: {
      kind: 'field_run',
      id: record.task_id || record.run_id,
      module_ids: moduleIds,
      result: record.result,
      applies_to_travel_start: travelStart,
      checked_by: record.tester,
      checked_at: record.checked_at,
      evidence_url: evidenceUrl,
      finding: record.finding
    }
  };
}
import { isFutureDateTime } from './date-boundary.mjs';
