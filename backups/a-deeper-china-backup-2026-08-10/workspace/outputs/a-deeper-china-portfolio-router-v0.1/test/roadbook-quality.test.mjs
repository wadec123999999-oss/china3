import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scoreRoadbookMarkdown } from '../src/roadbook-quality.mjs';
import { generateClientRoadbook } from '../bin/client-roadbook.mjs';

const sample = {
  city_unit: 'shanghai',
  message: 'This is our first visit to China. We love architecture and do not want to rush.',
  travel: { start_date: '2026-09-10', end_date: '2026-09-13' },
  client: {
    party: { adults: 2, children_ages: [] },
    arrival: { date_time: '2026-09-10T12:00:00+08:00', place: 'airport' },
    departure: { date_time: '2026-09-13T12:00:00+08:00', place: 'airport' },
    overnight_area: 'to confirm', pace: 'slow', mobility_notes: 'none reported after asking',
    priorities: ['architecture'], avoid: ['rushing'], food_restrictions: 'none',
    budget_context: 'comfortable', output_language: 'English'
  }
};

test('database roadbook clears the decision-led quality gate', async () => {
  const result = await generateClientRoadbook(sample);
  const scored = scoreRoadbookMarkdown(result.markdown);
  assert.equal(scored.final_score >= 85, true);
  assert.equal(scored.band, 'decision_led');
  assert.deepEqual(scored.internal_matches, []);
});

test('generic attraction list is identified as incomplete', () => {
  const generic = `# Shanghai\n\n## Day 1\nVisit the Bund, Yu Garden and Nanjing Road.\n\n## Day 2\nVisit Wukang Road and Shanghai Museum.\n\n## Tips\nUse the metro and book tickets in advance.`;
  const scored = scoreRoadbookMarkdown(generic);
  assert.equal(scored.band, 'generic_or_incomplete');
  assert.equal(scored.final_score < 65, true);
});

test('quality CLI input fixture remains available for manual review', () => {
  const fixture = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../samples/client-brief-shanghai-20260910-13-illustrative.json');
  assert.equal(fs.existsSync(fixture), true);
});
