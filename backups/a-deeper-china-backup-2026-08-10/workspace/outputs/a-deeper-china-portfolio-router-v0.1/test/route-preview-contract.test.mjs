import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateRoutePreview } from '../src/route-preview-contract.mjs';
import { generateRoutePreview } from '../bin/client-roadbook.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));

test('Shanghai preview sample satisfies the public preview contract', () => {
  const file = path.resolve(here, '../samples/route-preview-shanghai-20260910-13.json');
  const result = validateRoutePreview(JSON.parse(fs.readFileSync(file, 'utf8')));
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
});

test('preview contract rejects complete-route fields and internal IDs', () => {
  const result = validateRoutePreview({
    valid: true, schema_version: '1.0', status: 'preview_only', product_id: 'route_preview',
    city: 'Shanghai', route_thesis: 'A thesis', candidate_modules: ['Bund'],
    days: [], selected_module_ids: ['SHM01'],
    commercial: { payment_allowed: false, quote_allowed: false, product_name: 'Free Route Preview', upgrade_product_id: 'deep_roadbook', upgrade_reason: 'Upgrade' },
    delivery_boundary: 'Not a complete itinerary.'
  });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(item => item.includes('days')));
  assert.ok(result.errors.some(item => item.includes('internal module ID')));
});

test('generated preview is contract-valid before site delivery', async () => {
  const input = {
    city_unit: 'shanghai',
    travel: { start_date: '2026-10-10', end_date: '2026-10-12' },
    message: 'First visit for architecture without rushing',
    client: {
      party: { adults: 2, children_ages: [] },
      arrival: { date_time: '2026-10-10T09:00:00+08:00', place: 'airport' },
      departure: { date_time: '2026-10-12T20:00:00+08:00', place: 'station' },
      overnight_area: 'central city', pace: 'moderate', mobility_notes: 'none reported after asking',
      priorities: ['architecture'], avoid: ['rushing'], food_restrictions: 'none',
      budget_context: 'comfortable', output_language: 'English'
    }
  };
  const preview = await generateRoutePreview(input);
  assert.equal(validateRoutePreview(preview).valid, true);
});
