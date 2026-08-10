import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateFieldRecord } from './field-record-template.mjs';
import { fieldRunToEvidence } from './field-run-evidence.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));

export function scanFieldRecords({ directory = path.join(here, '现场记录模板_P0_20260803'), travelStart = null } = {}) {
  if (!fs.existsSync(directory)) return { valid: false, errors: [`record directory does not exist: ${directory}`], records: [] };
  const files = fs.readdirSync(directory).filter(file => file.endsWith('.json') && !['MANIFEST.json', 'PROGRESS.json'].includes(file)).sort();
  const records = files.map(file => {
    const filePath = path.join(directory, file);
    let record;
    try {
      record = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
      return { file, task_id: null, result: 'invalid_json', valid: false, errors: [String(error.message)] };
    }
    const validation = validateFieldRecord(record);
    const evidence = validation.valid && travelStart ? fieldRunToEvidence(record, { travelStart }) : null;
    return {
      file,
      city: record.city || null,
      task_id: record.task_id || null,
      result: record.result || null,
      valid: validation.valid,
      validation_errors: validation.errors,
      evidence_eligible: evidence?.valid === true,
      evidence_errors: evidence && !evidence.valid ? evidence.errors : [],
      evidence_count: Array.isArray(record.evidence) ? record.evidence.length : 0,
      tester: record.tester || null,
      field_date: record.field_date || null,
      applies_to_travel_start: record.applies_to_travel_start || null
    };
  });
  return {
    valid: true,
    directory,
    travel_start: travelStart,
    total: records.length,
    incomplete: records.filter(item => item.result === 'incomplete').length,
    pass: records.filter(item => item.result === 'pass').length,
    conditional_pass: records.filter(item => item.result === 'conditional_pass').length,
    fail: records.filter(item => item.result === 'fail').length,
    evidence_eligible: records.filter(item => item.evidence_eligible).length,
    records
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const directoryIndex = process.argv.indexOf('--dir');
  const travelIndex = process.argv.indexOf('--travel-start');
  const directory = directoryIndex >= 0 ? path.resolve(process.argv[directoryIndex + 1]) : undefined;
  const travelStart = travelIndex >= 0 ? process.argv[travelIndex + 1] : null;
  process.stdout.write(`${JSON.stringify(scanFieldRecords({ directory, travelStart }), null, 2)}\n`);
}
