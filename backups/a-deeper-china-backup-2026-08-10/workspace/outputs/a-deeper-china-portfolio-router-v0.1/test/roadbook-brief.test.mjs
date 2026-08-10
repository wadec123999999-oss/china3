import test from 'node:test';
import assert from 'node:assert/strict';
import { createRoadbookBrief, nextClientIntakeQuestion, validateClientIntake } from '../src/roadbook-brief.mjs';

const completeClient = {
  party: { adults: 2, children_ages: [] },
  arrival: { date_time: '2026-10-10T09:00:00+08:00', place: 'Beijing Capital Airport' },
  departure: { date_time: '2026-10-11T20:00:00+08:00', place: 'Beijing South Railway Station' },
  overnight_area: 'Wangfujing', pace: 'moderate', mobility_notes: 'none reported after asking',
  priorities: ['imperial urban order and history'], avoid: ['rushed attraction checklist'],
  food_restrictions: 'none reported', budget_context: 'comfortable with normal public admission fees', output_language: 'English'
};

test('paid-roadbook intake catches hidden operational gaps', () => {
  const result = validateClientIntake({ party: { adults: 1, children_ages: [] } });
  assert.equal(result.valid, false);
  assert.ok(result.gaps.some(item => item.includes('arrival.date_time')));
  assert.ok(result.gaps.some(item => item.includes('mobility_notes')));
});

test('intake asks one highest-priority question instead of dumping the form', () => {
  assert.equal(nextClientIntakeQuestion(null).id, 'party');
  const partial = { party: { adults: 2, children_ages: [] } };
  assert.equal(nextClientIntakeQuestion(partial).id, 'arrival');
  assert.match(nextClientIntakeQuestion(partial).question, /arrival date/i);
  assert.equal(nextClientIntakeQuestion(completeClient), null);
});

test('brief refuses to invent modules or a client travel date', () => {
  const brief = createRoadbookBrief({ message: 'First visit to Shanghai with my parents.' });
  assert.equal(brief.status, 'research_draft');
  assert.equal(brief.required_before_human_review_signature.some(item => item.includes('module_ids')), true);
  assert.equal(brief.required_before_human_review_signature.some(item => item.includes('start_date')), true);
  assert.equal(brief.hypotheses_to_confirm.some(item => item.id === 'recovery_and_frictions'), true);
  assert.equal(brief.next_client_question.id, 'party');
});

test('a bare source ID does not make a brief eligible', () => {
  const brief = createRoadbookBrief({
    message: 'I have two days in Beijing and care about history.', city_unit: 'beijing', module_ids: ['BJM01'],
    travel: { start_date: '2026-10-10', end_date: '2026-10-11' }, client: completeClient,
    current_source_ids: ['SRC-BEIJING-20260802-002']
  });
  assert.equal(brief.status, 'research_draft');
  assert.equal(brief.release_assessment.status, 'draft_only');
});

test('brief only becomes eligible for human signature after dated, attributable evidence', () => {
  const brief = createRoadbookBrief({
    message: 'I have two days in Beijing and care about history.',
    city_unit: 'beijing', module_ids: ['BJM01'],
    travel: { start_date: '2026-10-10', end_date: '2026-10-11' },
    client: completeClient,
    evidence_records: [{
      kind: 'current_source', id: 'SRC-BEIJING-20260802-002', applies_to_travel_start: '2026-10-10',
      checked_by: 'Ming Chen', checked_at: '2026-08-03T10:30:00+08:00',
      evidence_url: 'https://english.beijing.gov.cn/specials/ticketing/attractions/202407/t20240717_3751593.html',
      finding: 'Official page was checked for the client date; reservation route remains available.'
    }]
  });
  assert.equal(brief.status, 'eligible_for_human_review_signature');
  assert.equal(brief.next_client_question, null);
  assert.equal(brief.runtime_handoff.runtime, 'beijing');
  assert.equal(brief.runtime_handoff.runtime_input.days, 2);
  assert.equal(brief.release_assessment.status, 'human_checked_ready');
  assert.equal(brief.boundaries.some(item => item.includes('Human-checked')), true);
});

test('a passed field_run can satisfy a dynamic module without accepting a conditional run', () => {
  const fieldRun = {
    kind: 'field_run', id: 'BJM-FIELD-001', module_ids: ['BJM01'], result: 'pass',
    applies_to_travel_start: '2026-10-10', checked_by: 'Ming Chen', checked_at: '2026-08-03T10:30:00+08:00',
    evidence_url: 'https://example.com/field-run-palace.jpg',
    finding: 'The route was completed with the confirmed entrance and a documented exit.'
  };
  const brief = createRoadbookBrief({
    message: 'I have two days in Beijing and care about history.', city_unit: 'beijing', module_ids: ['BJM01'],
    travel: { start_date: '2026-10-10', end_date: '2026-10-11' }, client: completeClient,
    evidence_records: [fieldRun]
  });
  assert.equal(brief.status, 'eligible_for_human_review_signature');
  assert.deepEqual(brief.completed_field_module_ids, ['BJM01']);
  const conditional = createRoadbookBrief({
    message: 'I have two days in Beijing and care about history.', city_unit: 'beijing', module_ids: ['BJM01'],
    travel: { start_date: '2026-10-10', end_date: '2026-10-11' }, client: completeClient,
    evidence_records: [{ ...fieldRun, result: 'conditional_pass' }]
  });
  assert.equal(conditional.status, 'research_draft');
});
