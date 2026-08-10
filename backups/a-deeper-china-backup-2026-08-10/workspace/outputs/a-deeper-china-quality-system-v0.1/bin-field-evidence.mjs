#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fieldRunToEvidence } from './field-run-evidence.mjs';

const inputPath = process.argv[2];
const startIndex = process.argv.indexOf('--travel-start');
const travelStart = startIndex >= 0 ? process.argv[startIndex + 1] : null;

if (!inputPath || !travelStart) {
  process.stderr.write('Usage: node bin-field-evidence.mjs path/to/field-record.json --travel-start YYYY-MM-DD\n');
  process.exitCode = 2;
} else {
  const record = JSON.parse(fs.readFileSync(path.resolve(inputPath), 'utf8'));
  const result = fieldRunToEvidence(record, { travelStart });
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (!result.valid) process.exitCode = 1;
}

