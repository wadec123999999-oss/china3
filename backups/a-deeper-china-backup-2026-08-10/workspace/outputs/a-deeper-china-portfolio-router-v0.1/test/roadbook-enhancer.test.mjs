import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRuntimeInput } from '../src/runtime-input.mjs';
import { dispatchRuntime, renderRuntimeRoadbook } from '../src/runtime-dispatch.mjs';
import { validatePublicRoadbook } from '../src/public-roadbook-contract.mjs';

const client = {
  party: { adults: 2, children_ages: [] },
  arrival: { date_time: '2026-09-10T09:00:00+08:00', place: 'airport' },
  departure: { date_time: '2026-09-13T20:00:00+08:00', place: 'station' },
  overnight_area: 'central city',
  pace: 'moderate',
  mobility_notes: 'none reported after asking',
  priorities: ['architecture and history'],
  avoid: ['rushing'],
  food_restrictions: 'none',
  budget_context: 'comfortable',
  output_language: 'English'
};

const cases = [
  ['shanghai'],
  ['beijing'],
  ['chengdu_chongqing', 'chengdu'],
  ['chengdu_chongqing', 'chongqing'],
  ['guangzhou_shenzhen', 'guangzhou'],
  ['guangzhou_shenzhen', 'shenzhen'],
  ['guilin_yangshuo'],
  ['hangzhou_suzhou', 'hangzhou'],
  ['hangzhou_suzhou', 'suzhou'],
  ['quanzhou_dehua'],
  ['jingdezhen'],
  ['wudang'],
  ['jingmai']
];

test('all portfolio roadbooks expose a decision layer without internal IDs', async () => {
  for (const [city_unit, runtime_city] of cases) {
    const handoff = buildRuntimeInput({
      city_unit,
      runtime_city,
      client,
      message: 'First visit architecture without rushing'
    });
    const result = await dispatchRuntime(handoff);
    const markdown = await renderRuntimeRoadbook(handoff);
    const publicRoadbook = (await import('../src/roadbook-enhancer.mjs')).createPublicRoadbook({
      runtime: handoff.runtime,
      decision: result,
      tripContext: handoff.trip_context,
      markdown
    });
    assert.equal(result.valid, true, `${city_unit}/${runtime_city ?? ''}`);
    assert.match(markdown, /Decision layer|The route thesis|Design frame/);
    assert.doesNotMatch(markdown, /(?:[A-Z]{2,4}M\d{2})/);
  assert.ok(['research_draft', 'draft_for_human_review', 'human_checked_ready'].includes(publicRoadbook.status));
  assert.equal(publicRoadbook.delivery_status.public_state, publicRoadbook.status);
  assert.equal(publicRoadbook.delivery_status.booking_created, false);
    assert.equal(publicRoadbook.delivery_status.current_checks_required, true);
    assert.deepEqual(validatePublicRoadbook(publicRoadbook), { valid: true, errors: [] });
    assert.equal(publicRoadbook.route_controls.stop_when_answered, true);
    assert.ok(publicRoadbook.days.flatMap(day => day.modules).every(module =>
      typeof module.anchor === 'string' && module.anchor.length > 10 &&
      typeof module.what_to_notice === 'string' &&
      typeof module.stop_rule === 'string' &&
      typeof module.main_friction === 'string'
    ));
  }
});

test('city-specific editorial controls survive into public outputs', async () => {
  const handoff = buildRuntimeInput({
    city_unit: 'beijing',
    client,
    message: 'First visit for the Great Wall and imperial history without rushing'
  });
  const decision = await dispatchRuntime(handoff);
  const { createPublicRoadbook } = await import('../src/roadbook-enhancer.mjs');
  const publicRoadbook = createPublicRoadbook({
    runtime: handoff.runtime,
    decision,
    tripContext: handoff.trip_context
  });
  const wall = publicRoadbook.days.flatMap(day => day.modules).find(module => module.name.includes('Great Wall'));
  assert.ok(wall);
  assert.match(wall.stop_rule, /turnaround|highest point|success/i);
});
