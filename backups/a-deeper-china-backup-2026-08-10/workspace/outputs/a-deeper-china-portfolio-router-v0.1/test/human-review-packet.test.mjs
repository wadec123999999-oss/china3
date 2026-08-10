import test from 'node:test';
import assert from 'node:assert/strict';
import { createHumanReviewPacket, renderPacketMarkdown } from '../bin/human-review-packet.mjs';

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

test('human review packet stays draft-only and lists release evidence gaps', async () => {
  const packet = await createHumanReviewPacket({
    city_unit: 'shanghai',
    message: 'First visit to China. We want architecture without rushing.',
    travel: { start_date: '2026-09-10', end_date: '2026-09-13' },
    client
  });
  assert.equal(packet.valid, true);
  assert.equal(packet.status, 'draft_only');
  assert.ok(packet.required_check_ids.length > 0 || packet.acceptable_current_source_ids.length > 0);
  assert.ok(packet.human_readable_checks.length > 0);
  assert.equal(packet.source_pack_audit.valid, true);
  assert.ok(packet.source_pack_audit.record_count > 0);
  assert.equal(packet.current_source_tasks.status, 'pending_current_check');
  assert.ok(packet.current_source_tasks.tasks.length > 0);
  assert.equal(packet.review_record_template.decision, 'draft_only');
  assert.deepEqual(packet.review_record_template.completed_field_module_ids, []);
  assert.match(renderPacketMarkdown(packet), /Human review packet/);
  assert.match(renderPacketMarkdown(packet), /Human-readable checks before delivery/);
  assert.match(renderPacketMarkdown(packet), /Source-pack audit/);
  assert.match(renderPacketMarkdown(packet), /Current-source tasks for these travel dates/);
  assert.match(renderPacketMarkdown(packet), /exact travel dates/);
});

test('completed current-source worklist evidence reaches the release assessment', async () => {
  const packet = await createHumanReviewPacket({
    city_unit: 'shanghai',
    module_ids: ['SHM04'],
    message: 'First visit to China. We want one museum question.',
    travel: { start_date: '2026-09-10', end_date: '2026-09-13' },
    client,
    current_source_worklist: {
      tasks: [{
        task_id: 'CST-SHANGHAI-01',
        source_id: 'SRC-SHANGHAI-20260803-REFRESH01',
        module_ids: ['SHM04'],
        applies_to_travel_start: '2026-09-10',
        applies_to_travel_end: '2026-09-13',
        status: 'complete',
        required_evidence: {
          checked_by: 'Ming Chen',
          checked_at: '2026-08-03T10:00:00+08:00',
          evidence_url: 'https://example.com/shanghai-museum-check',
          finding: 'The official museum rule was checked for the exact client travel dates.'
        }
      }]
    }
  });
  assert.equal(packet.valid, true);
  assert.equal(packet.current_source_worklist_conversion.evidence.length, 1);
  assert.equal(packet.status, 'human_checked_ready');
  assert.equal(packet.release_assessment.status, 'human_checked_ready');
  assert.deepEqual(packet.review_record_template.current_source_ids, ['SRC-SHANGHAI-20260803-REFRESH01']);
});
