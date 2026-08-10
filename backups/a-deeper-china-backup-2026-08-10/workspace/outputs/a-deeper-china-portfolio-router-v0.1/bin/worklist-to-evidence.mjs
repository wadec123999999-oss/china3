#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { currentSourceWorklistToEvidence } from '../src/current-source-worklist-evidence.mjs';

const inputPath = process.argv[2];
const travelIndex = process.argv.indexOf('--travel-start');
const travelStart = travelIndex >= 0 ? process.argv[travelIndex + 1] : null;
if (!inputPath || !travelStart) {
  process.stderr.write('Usage: node bin/worklist-to-evidence.mjs path/to/worklist.json --travel-start YYYY-MM-DD\n');
  process.exitCode = 2;
} else {
  const worklist = JSON.parse(fs.readFileSync(path.resolve(inputPath), 'utf8'));
  const result = currentSourceWorklistToEvidence(worklist, { travelStart });
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (!result.valid) process.exitCode = 1;
}
