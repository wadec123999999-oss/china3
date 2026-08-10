import { startConversation } from './conversation.mjs';
import { assessPortfolioRoadbookRelease } from './release.mjs';
import { buildRuntimeInput } from './runtime-input.mjs';
import { isFutureDateTime } from '../../a-deeper-china-quality-system-v0.1/date-boundary.mjs';

function isoDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

function isEvidenceLink(value) {
  return typeof value === 'string' && /^https?:\/\//.test(value);
}

function nonEmpty(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function validDateTime(value) {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

/** Minimum information required before a paid roadbook may enter human review. */
export function validateClientIntake(client) {
  const gaps = [];
  if (!client || typeof client !== 'object') return { valid: false, gaps: ['client intake is required.'] };
  const adults = client.party?.adults;
  const children = client.party?.children_ages;
  if (!Number.isInteger(adults) || adults < 0) gaps.push('client.party.adults must be a non-negative integer.');
  if (!Array.isArray(children) || children.some(age => !Number.isInteger(age) || age < 0 || age > 17)) gaps.push('client.party.children_ages must list each child age, or be an empty array.');
  if (Number.isInteger(adults) && Array.isArray(children) && adults + children.length < 1) gaps.push('client party must include at least one traveller.');
  for (const leg of ['arrival', 'departure']) {
    if (!validDateTime(client[leg]?.date_time)) gaps.push(`client.${leg}.date_time is required as an ISO date-time.`);
    if (!nonEmpty(client[leg]?.place)) gaps.push(`client.${leg}.place is required.`);
  }
  if (!nonEmpty(client.overnight_area)) gaps.push('client.overnight_area is required.');
  if (!['slow', 'moderate', 'full'].includes(client.pace)) gaps.push('client.pace must be slow, moderate or full.');
  if (!nonEmpty(client.mobility_notes)) gaps.push('client.mobility_notes is required; use "none reported" only after asking.');
  if (!Array.isArray(client.priorities) || !client.priorities.length || client.priorities.some(item => !nonEmpty(item))) gaps.push('client.priorities must contain at least one confirmed priority.');
  if (!Array.isArray(client.avoid) || !client.avoid.length || client.avoid.some(item => !nonEmpty(item))) gaps.push('client.avoid must record at least one avoidance or "none stated".');
  for (const field of ['food_restrictions', 'budget_context', 'output_language']) {
    if (!nonEmpty(client[field])) gaps.push(`client.${field} is required.`);
  }
  return { valid: gaps.length === 0, gaps };
}

const intakeQuestions = [
  { match: 'client intake is required', id: 'party', question: 'Who is travelling—how many adults, and are there any children? Please include each child’s age.' },
  { match: 'client.party', id: 'party', question: 'Who is travelling—how many adults, and are there any children? Please include each child’s age.' },
  { match: 'client party must', id: 'party', question: 'Who is travelling—how many adults, and are there any children? Please include each child’s age.' },
  { match: 'client.arrival', id: 'arrival', question: 'What is your confirmed arrival date, local time and arrival station or airport?' },
  { match: 'client.departure', id: 'departure', question: 'What is your confirmed departure date, local time and departure station or airport?' },
  { match: 'client.overnight_area', id: 'overnight_area', question: 'Which neighbourhood or hotel area will you stay in? A hotel name is also fine.' },
  { match: 'client.pace', id: 'pace', question: 'Would you prefer a slow, moderate or full sightseeing pace?' },
  { match: 'client.mobility_notes', id: 'mobility', question: 'Does anyone have limits involving stairs, long walks, heat, standing or early starts?' },
  { match: 'client.priorities', id: 'priorities', question: 'If the trip could answer only one or two questions about China, what would you most want to understand or experience?' },
  { match: 'client.avoid', id: 'avoid', question: 'What would make this trip feel wrong for you—crowds, rushing, shopping stops, early mornings, staged experiences, or something else?' },
  { match: 'client.food_restrictions', id: 'food_restrictions', question: 'Are there any allergies, dietary restrictions or spice limits we must design around?' },
  { match: 'client.budget_context', id: 'budget_context', question: 'For paid admissions and optional experiences, should we design around a value, comfortable or premium budget?' },
  { match: 'client.output_language', id: 'output_language', question: 'Which language should the final roadbook use?' }
];

export function nextClientIntakeQuestion(client) {
  const intake = validateClientIntake(client);
  if (intake.valid) return null;
  const rule = intakeQuestions.find(item => intake.gaps.some(gap => gap.includes(item.match)));
  return rule ? { id: rule.id, question: rule.question, reason: intake.gaps.find(gap => gap.includes(rule.match)) } : null;
}

/** A source/check ID is not evidence. It needs a dated, attributable record. */
export function validateEvidenceRecord(record, travelStart) {
  if (!record || typeof record !== 'object') return { valid: false, reason: 'evidence record must be an object' };
  if (!['current_source', 'dynamic_check', 'field_run'].includes(record.kind)) return { valid: false, reason: 'evidence kind must be current_source, dynamic_check or field_run' };
  if (typeof record.id !== 'string' || !record.id.trim()) return { valid: false, reason: 'evidence id is required' };
  if (!isoDate(record.applies_to_travel_start) || record.applies_to_travel_start !== travelStart) return { valid: false, reason: `${record.id}: evidence must explicitly apply to this travel start date` };
  if (typeof record.checked_by !== 'string' || record.checked_by.trim().length < 2) return { valid: false, reason: `${record.id}: checked_by is required` };
  if (typeof record.checked_at !== 'string' || Number.isNaN(Date.parse(record.checked_at))) return { valid: false, reason: `${record.id}: checked_at must be an ISO date-time` };
  if (isFutureDateTime(record.checked_at)) return { valid: false, reason: `${record.id}: checked_at cannot be in the future relative to the audit date` };
  if (!isEvidenceLink(record.evidence_url)) return { valid: false, reason: `${record.id}: an official page, screenshot or call-record URL is required` };
  if (typeof record.finding !== 'string' || record.finding.trim().length < 8) return { valid: false, reason: `${record.id}: a concrete finding is required` };
  if (record.kind === 'field_run') {
    const moduleIds = Array.isArray(record.module_ids) ? record.module_ids : Array.isArray(record.route_modules) ? record.route_modules : [];
    if (!moduleIds.length || moduleIds.some(id => typeof id !== 'string' || !id.trim())) return { valid: false, reason: `${record.id}: field_run module_ids are required` };
    if (!['pass', 'conditional_pass', 'fail', 'incomplete'].includes(record.result)) return { valid: false, reason: `${record.id}: field_run result is required` };
    if (record.result !== 'pass') return { valid: false, reason: `${record.id}: only a field_run result of pass can support release` };
  }
  return { valid: true };
}

/**
 * Produce a handoff object, not an itinerary or an approval. City runtimes own
 * module selection; the quality system owns the eventual release decision.
 */
export function createRoadbookBrief({
  message = '', city_unit, runtime_city, module_ids = [], travel = {}, client = null, evidence_records = [], reviewer = null,
} = {}) {
  const conversation = startConversation(message);
  const start_date = isoDate(travel.start_date);
  const end_date = isoDate(travel.end_date);
  const errors = [];
  if (!city_unit) errors.push('city_unit is required before a city runtime can select modules.');
  if (!Array.isArray(module_ids) || !module_ids.length) errors.push('module_ids are required; this layer must not invent an itinerary.');
  if (!start_date || !end_date) errors.push('real travel start_date and end_date are required for a client-ready roadbook.');
  if (start_date && end_date && start_date > end_date) errors.push('travel.end_date must be on or after travel.start_date.');
  const intake = validateClientIntake(client);
  errors.push(...intake.gaps);
  const next_client_question = nextClientIntakeQuestion(client);
  const runtime_handoff = city_unit && intake.valid
    ? buildRuntimeInput({city_unit, runtime_city, travel, client, message, module_ids})
    : null;
  if (runtime_handoff && !runtime_handoff.valid) errors.push(...runtime_handoff.errors);
  const evidence = Array.isArray(evidence_records) ? evidence_records : [];
  const evidenceResults = evidence.map(record => ({ record, ...validateEvidenceRecord(record, start_date) }));
  const invalidEvidence = evidenceResults.filter(item => !item.valid).map(item => item.reason);
  const completed_check_ids = evidenceResults.filter(item => item.valid && item.record.kind === 'dynamic_check').map(item => item.record.id);
  const current_source_ids = evidenceResults.filter(item => item.valid && item.record.kind === 'current_source').map(item => item.record.id);
  const completed_field_module_ids = evidenceResults
    .filter(item => item.valid && item.record.kind === 'field_run' && item.record.result === 'pass')
    .flatMap(item => Array.isArray(item.record.module_ids) ? item.record.module_ids : item.record.route_modules || []);

  const release = city_unit && Array.isArray(module_ids) && module_ids.length
    ? assessPortfolioRoadbookRelease({ city_unit, module_ids, completed_check_ids, current_source_ids, completed_field_module_ids })
    : null;
  const release_gaps = release?.reasons ?? [];
  const can_handoff_to_human_review = errors.length === 0 && invalidEvidence.length === 0 && release?.status === 'human_checked_ready';

  return {
    kind: 'a_deeper_china_roadbook_brief', version: '0.1',
    status: can_handoff_to_human_review ? 'eligible_for_human_review_signature' : 'research_draft',
    customer_language: { original_message: String(message), extracted_request: conversation.extracted_request },
    hypotheses_to_confirm: conversation.likely_unstated_needs_to_confirm,
    route_direction: conversation.best_fit_city_direction,
    selected_scope: city_unit ? { city_unit, module_ids } : null,
    travel: { start_date, end_date },
    client_intake: client && typeof client === 'object' ? client : null,
    next_client_question,
    runtime_handoff,
    reviewer: reviewer && typeof reviewer === 'object' ? reviewer : null,
    evidence_records: evidence,
    completed_field_module_ids,
    release_assessment: release,
    required_before_human_review_signature: [...errors, ...invalidEvidence, ...release_gaps],
    boundaries: [
      'This brief does not create an itinerary, reservation, guide, transport, accommodation or third-party experience sale.',
      'Hypotheses are questions for the traveller, not inferred facts or preferences.',
      'Only a dated human review record may label a client roadbook Human-checked.'
    ]
  };
}
