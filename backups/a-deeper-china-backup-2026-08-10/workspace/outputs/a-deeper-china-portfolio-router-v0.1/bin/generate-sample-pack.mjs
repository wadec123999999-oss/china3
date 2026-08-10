import fs from 'node:fs';
import path from 'node:path';
import { buildRuntimeInput } from '../src/runtime-input.mjs';
import { dispatchRuntime, renderRuntimeRoadbook } from '../src/runtime-dispatch.mjs';
import { createPublicRoadbook } from '../src/roadbook-enhancer.mjs';

const outputDir = path.resolve(process.cwd(), '../../roadbook-sample-pack-v1.1');
fs.mkdirSync(outputDir, { recursive: true });

const cases = [
  ['shanghai', null, 'Shanghai', ['architecture'], 'First visit to China. We want architecture without rushing.'],
  ['beijing', null, 'Beijing', ['architecture', 'history'], 'First visit to China. We want imperial history and architecture without rushing.'],
  ['chengdu_chongqing', 'chengdu', 'Chengdu', ['tea', 'food'], 'First visit. We want tea, public life and Sichuan food at a slower pace.'],
  ['chengdu_chongqing', 'chongqing', 'Chongqing', ['architecture', 'food'], 'First visit. We want to understand the mountain city without chasing viewpoints.'],
  ['guangzhou_shenzhen', 'guangzhou', 'Guangzhou', ['architecture', 'food'], 'First visit. We want port-city history and Cantonese food culture.'],
  ['guangzhou_shenzhen', 'shenzhen', 'Shenzhen', ['technology', 'urbanism'], 'We want public-facing technology and city systems, not private company access.'],
  ['guilin_yangshuo', null, 'Guilin–Yangshuo', ['landscape', 'walking'], 'We want karst landscapes at a calm pace and do not want to cycle.'],
  ['hangzhou_suzhou', 'hangzhou', 'Hangzhou', ['tea', 'landscape'], 'We want water, tea and a slower change of pace from Shanghai.'],
  ['hangzhou_suzhou', 'suzhou', 'Suzhou', ['gardens', 'architecture'], 'We want one meaningful garden and a canal-city reading, not a checklist.'],
  ['quanzhou_dehua', null, 'Quanzhou–Dehua', ['maritime', 'religion'], 'We want to understand Quanzhou as a port and living religious city.'],
  ['jingdezhen', null, 'Jingdezhen', ['porcelain', 'material process'], 'We want to understand porcelain, kilns and contemporary making.'],
  ['wudang', null, 'Wudang Mountains', ['heritage architecture'], 'We want mountain architecture and Taoist heritage without access promises.'],
  ['jingmai', null, 'Jingmai Mountain', ['tea landscape', 'walking'], 'We want tea forests and mountain landscape without private village access.']
];

const baseClient = {
  party: { adults: 2, children_ages: [] },
  arrival: { date_time: '2026-09-10T09:00:00+08:00', place: 'airport or station to confirm' },
  departure: { date_time: '2026-09-13T20:00:00+08:00', place: 'airport or station to confirm' },
  overnight_area: 'to confirm',
  pace: 'slow',
  mobility_notes: 'none reported after asking',
  avoid: ['rushing'],
  food_restrictions: 'none reported',
  budget_context: 'comfortable',
  output_language: 'English'
};

const index = [];
for (const [city_unit, runtime_city, label, priorities, message] of cases) {
  const client = { ...baseClient, priorities };
  const handoff = buildRuntimeInput({
    city_unit,
    runtime_city: runtime_city || undefined,
    travel: { start_date: '2026-09-10', end_date: '2026-09-13' },
    client,
    message
  });
  if (!handoff.valid) throw new Error(`${label}: ${handoff.errors.join('; ')}`);
  const decision = await dispatchRuntime(handoff);
  const markdown = await renderRuntimeRoadbook(handoff);
  const publicRoadbook = createPublicRoadbook({
    runtime: handoff.runtime,
    decision,
    tripContext: handoff.trip_context,
    markdown
  });
  const slug = label.toLowerCase().replaceAll('–', '-').replaceAll(' ', '-');
  const markdownFile = `${slug}-research-roadbook-v1.1.md`;
  const jsonFile = `${slug}-public-roadbook-v1.1.json`;
  fs.writeFileSync(path.join(outputDir, markdownFile), `${markdown.trim()}\n`, 'utf8');
  fs.writeFileSync(path.join(outputDir, jsonFile), `${JSON.stringify(publicRoadbook, null, 2)}\n`, 'utf8');
  index.push({ city: label, markdownFile, jsonFile, status: publicRoadbook.status });
}

fs.writeFileSync(path.join(outputDir, 'README.md'), [
  '# A Deeper China | Roadbook sample pack V1.1',
  '',
  'Generated from the current city runtimes and customer-facing decision layer.',
  '',
  '- These are research drafts, not human-checked itineraries.',
  '- Dates, party size, pace and output language are included as sanitized trip context.',
  '- Each city has both a customer Markdown sample and a structured `public_roadbook` JSON sample.',
  '- Sample arrival/departure times are illustrative and not customer-confirmed.',
  '- Dynamic opening, transport, weather, access and venue details still require dated checks.',
  '',
  '| City | Markdown | Structured JSON | Status |',
  '|---|---|---|---|',
  ...index.map(item => `| ${item.city} | ${item.markdownFile} | ${item.jsonFile} | ${item.status} |`),
  ''
].join('\n'), 'utf8');

console.log(`Generated ${index.length} samples in ${outputDir}`);
