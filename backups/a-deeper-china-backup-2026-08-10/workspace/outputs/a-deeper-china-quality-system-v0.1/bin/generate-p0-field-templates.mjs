#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createFieldRecordTemplate } from '../field-record-template.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.join(here, '../现场记录模板_P0_20260803');
const targets = [
  ['Shanghai', 'SH-FIELD-001'],
  ['Shanghai', 'SH-FIELD-002'],
  ['Shanghai', 'SH-FIELD-003'],
  ['Shanghai', 'SH-FIELD-004'],
  ['Chongqing', 'CQ-FIELD-001'],
  ['Chongqing', 'CQ-FIELD-002'],
  ['Chongqing', 'CQ-FIELD-003'],
  ['Chongqing', 'CQ-FIELD-004']
];

fs.mkdirSync(outputDir, { recursive: true });
const manifest = [];
for (const [city, task_id] of targets) {
  const result = createFieldRecordTemplate({ city, task_id });
  if (!result.valid) throw new Error(`${city}/${task_id}: ${result.errors.join('; ')}`);
  const filename = `${task_id}.json`;
  fs.writeFileSync(path.join(outputDir, filename), `${JSON.stringify(result.record, null, 2)}\n`, 'utf8');
  manifest.push({ city, task_id, filename, result: result.record.result, evidence_count: result.record.evidence.length });
}

fs.writeFileSync(path.join(outputDir, 'MANIFEST.json'), `${JSON.stringify({
  schema_version: '0.1',
  generated_at: '2026-08-03',
  boundary: 'All records are incomplete templates. No field evidence is present.',
  records: manifest
}, null, 2)}\n`, 'utf8');
console.log(`Generated ${manifest.length} incomplete P0 templates in ${outputDir}`);
