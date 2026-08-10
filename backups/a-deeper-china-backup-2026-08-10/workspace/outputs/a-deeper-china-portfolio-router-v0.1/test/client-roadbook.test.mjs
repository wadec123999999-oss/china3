import test from 'node:test';
import assert from 'node:assert/strict';
import { generateClientRoadbook } from '../bin/client-roadbook.mjs';

const client = {
  party: { adults: 2, children_ages: [] },
  arrival: { date_time: '2026-09-10T09:00:00+08:00', place: 'airport' },
  departure: { date_time: '2026-09-13T20:00:00+08:00', place: 'airport' },
  overnight_area: 'to confirm',
  pace: 'slow',
  mobility_notes: 'none reported after asking',
  priorities: ['architecture'],
  avoid: ['rushing'],
  food_restrictions: 'none',
  budget_context: 'comfortable',
  output_language: 'English'
};

test('client-roadbook CLI composes a research draft without claiming release', async () => {
  const result = await generateClientRoadbook({
    city_unit: 'shanghai',
    message: 'This is our first visit to China. We love architecture and do not want to rush.',
    travel: { start_date: '2026-09-10', end_date: '2026-09-13' },
    client
  });
  assert.equal(result.valid, true);
  assert.equal(result.status, 'research_draft');
  assert.equal(result.runtime, 'shanghai');
  assert.ok(result.selected_module_ids.length > 0);
  assert.equal(result.commercial.recommended_product, 'deep_roadbook');
  assert.equal(result.commercial.digital_roadbook.may_take_payment, true);
  assert.equal(result.commercial.digital_roadbook.field_verification_required_for_payment, false);
  assert.equal(result.commercial.digital_roadbook.field_verification_required_for_human_checked_label, true);
  assert.equal(result.commercial.third_party_experience.may_take_payment, false);
  assert.equal(result.commercial.product_catalog.products.length, 3);
  assert.match(result.markdown, /Trip brief used for this draft/);
  assert.match(result.markdown, /Usable time:/);
  assert.match(result.markdown, /one question, one physical anchor and a defined point at which to stop/);
  assert.match(result.markdown, /Hypotheses to confirm/);
  assert.doesNotMatch(result.markdown, /SHM\d+/);
});
