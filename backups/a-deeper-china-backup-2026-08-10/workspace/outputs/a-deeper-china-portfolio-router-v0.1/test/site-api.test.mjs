import test from 'node:test';
import assert from 'node:assert/strict';
import { handleSiteApiRequest, publicDestinations } from '../src/site-api.mjs';
import { buildRuntimeInput } from '../src/runtime-input.mjs';

const client = {
  party: { adults: 2, children_ages: [] },
  arrival: { date_time: '2026-10-10T09:00:00+08:00', place: 'airport' },
  departure: { date_time: '2026-10-12T20:00:00+08:00', place: 'station' },
  overnight_area: 'central city',
  pace: 'moderate',
  mobility_notes: 'none reported after asking',
  priorities: ['architecture and history'],
  avoid: ['rushing'],
  food_restrictions: 'none',
  budget_context: 'comfortable',
  output_language: 'English'
};

async function body(response) {
  return response.json();
}

test('destinations endpoint exposes public product metadata only', async () => {
  const response = await handleSiteApiRequest(new Request('http://localhost/api/destinations'));
  const result = await body(response);
  assert.equal(response.status, 200);
  assert.equal(result.destinations.length, 10);
  assert.ok(result.destinations.every(item => item.id && item.product_status && !('modules' in item)));
});

test('route direction endpoint turns a natural-language message into a guarded response', async () => {
  const response = await handleSiteApiRequest(new Request('http://localhost/api/route-direction', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ message: 'We have three nights in Shanghai and want architecture without rushing.' })
  }));
  const result = await body(response);
  assert.equal(response.status, 200);
  assert.equal(result.internal_status, 'research_draft');
  assert.ok(result.best_fit_city_direction.some(item => item.city === 'Shanghai'));
});

test('route preview is a free fit-check and never returns the complete roadbook', async () => {
  const response = await handleSiteApiRequest(new Request('http://localhost/api/route-preview', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      city_unit: 'shanghai',
      travel: { start_date: '2026-10-10', end_date: '2026-10-12' },
      client,
      message: 'First visit for architecture without rushing'
    })
  }));
  const result = await body(response);
  assert.equal(response.status, 200);
  assert.equal(result.valid, true);
  assert.equal(result.product_id, 'route_preview');
  assert.equal(result.status, 'preview_only');
  assert.equal(result.commercial.payment_allowed, false);
  assert.equal(result.commercial.quote_allowed, false);
  assert.ok(result.candidate_modules.length <= 2);
  assert.ok(!('days' in result));
  assert.ok(!('markdown' in result));
  assert.doesNotMatch(JSON.stringify(result), /SHM\d+/);
});

test('runtime-input and dispatch endpoints compose without exposing raw database records', async () => {
  const inputResponse = await handleSiteApiRequest(new Request('http://localhost/api/runtime-input', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ city_unit: 'shanghai', client, message: 'First visit for architecture' })
  }));
  const handoff = await body(inputResponse);
  assert.equal(handoff.valid, true);
  const dispatchResponse = await handleSiteApiRequest(new Request('http://localhost/api/dispatch-runtime', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify(handoff)
  }));
  const result = await body(dispatchResponse);
  assert.equal(result.output_capability, 'day_sequence_draft');
  assert.ok(Array.isArray(result.days));
  assert.ok(result.commercial.digital_roadbook);
  assert.equal(result.commercial.third_party_experience.may_take_payment, false);
  assert.equal(result.commercial.product_catalog.products.length, 3);
  assert.match(result.roadbook_markdown, /Day 1/);
  assert.equal(result.public_roadbook.schema_version, '1.1');
  assert.equal(result.public_roadbook.delivery_status.public_state, result.public_roadbook.status);
  assert.equal(result.public_roadbook.delivery_status.booking_created, false);
  assert.equal(result.public_roadbook.delivery_status.current_checks_required, true);
  assert.ok(Array.isArray(result.public_roadbook.days));
  assert.equal(result.public_roadbook.route_controls.stop_when_answered, true);
  assert.ok(!('selected_module_ids' in result.public_roadbook));
  assert.ok(result.public_roadbook.trip_context);
  assert.ok(result.public_roadbook.trip_context.inferred_needs.every(item => !('id' in item) && !('confidence' in item)));
  assert.ok(result.public_roadbook.days[0].modules.every(module => module.anchor && module.stop_rule && module.main_friction));
  assert.equal('points' in result, false);
});

test('roadbook carries the sanitized customer trip brief into the output', async () => {
  const inputResponse = await handleSiteApiRequest(new Request('http://localhost/api/runtime-input', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      city_unit: 'shanghai',
      travel: { start_date: '2026-09-10', end_date: '2026-09-13' },
      client: { ...client, pace: 'slow', overnight_area: "People's Square" },
      message: 'First visit for architecture without rushing'
    })
  }));
  const handoff = await body(inputResponse);
  assert.deepEqual(handoff.trip_context, {
    arrival_date: '2026-09-10',
    departure_date: '2026-09-13',
    arrival_time_local: '09:00',
    departure_time_local: '20:00',
    usable_time_window: 'arrival day / 1 full day / departure day',
    nights: 3,
    adults: 2,
    children: 0,
    party_size: 2,
    pace: 'slow',
    overnight_area: "People's Square",
    output_language: 'English',
    explicit_priorities: ['architecture and history'],
    explicit_avoidances: ['rushing'],
    inferred_needs: [{
      id: 'orientation_over_checklist',
      confidence: 0.65,
      reason: 'first-visit wording can mean the traveller needs a legible starting point, not more landmarks.',
      confirmation_question: 'Would you rather understand one city clearly than try to cover its famous places?'
    }]
  });
  const dispatchResponse = await handleSiteApiRequest(new Request('http://localhost/api/dispatch-runtime', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(handoff)
  }));
  const result = await body(dispatchResponse);
  assert.match(result.roadbook_markdown, /Dates: 2026-09-10 → 2026-09-13/);
  assert.match(result.roadbook_markdown, /Overnight area: People's Square/);
});

test('roadbook brief endpoint preserves release boundary', async () => {
  const response = await handleSiteApiRequest(new Request('http://localhost/api/roadbook-brief', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      message: 'A calm first Shanghai trip',
      city_unit: 'shanghai',
      module_ids: ['SHM01'],
      travel: { start_date: '2026-10-10', end_date: '2026-10-12' },
      client
    })
  }));
  const result = await body(response);
  assert.equal(result.status, 'research_draft');
  assert.ok(result.release_assessment);
  assert.match(result.release_assessment.customer_facing_label, /Research roadbook draft/);
});

test('Chongqing special renderer also returns a customer-facing draft', async () => {
  const handoff = buildRuntimeInput({
    city_unit: 'chengdu_chongqing',
    runtime_city: 'chongqing',
    client: { ...client, priorities: ['cyberpunk city photography'] },
    message: 'First visit to Chongqing'
  });
  const response = await handleSiteApiRequest(new Request('http://localhost/api/dispatch-runtime', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(handoff)
  }));
  const result = await body(response);
  assert.equal(result.output_capability, 'day_sequence_draft');
  assert.match(result.roadbook_markdown, /Day 1/);
  assert.match(result.roadbook_markdown, /Booking boundary/);
});

test('legacy city renderers receive the customer-facing decision layer', async () => {
  const handoff = buildRuntimeInput({
    city_unit: 'beijing',
    client,
    message: 'First visit for architecture without rushing'
  });
  const response = await handleSiteApiRequest(new Request('http://localhost/api/dispatch-runtime', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(handoff)
  }));
  const result = await body(response);
  assert.match(result.roadbook_markdown, /Decision layer/);
  assert.match(result.roadbook_markdown, /Route thesis/);
  assert.match(result.roadbook_markdown, /Fallback logic/);
  assert.doesNotMatch(result.roadbook_markdown, /BJM01/);
});

test('malformed and unsupported requests fail without calling runtimes', async () => {
  const malformed = await handleSiteApiRequest(new Request('http://localhost/api/route-direction', { method: 'POST', body: '{' }));
  assert.equal(malformed.status, 400);
  const missingMessage = await handleSiteApiRequest(new Request('http://localhost/api/route-direction', { method: 'POST', body: '{}' }));
  assert.equal(missingMessage.status, 400);
  const unsupported = await handleSiteApiRequest(new Request('http://localhost/api/does-not-exist', { method: 'POST', body: '{}' }));
  assert.equal(unsupported.status, 404);
  assert.equal(publicDestinations().length, 10);
});
