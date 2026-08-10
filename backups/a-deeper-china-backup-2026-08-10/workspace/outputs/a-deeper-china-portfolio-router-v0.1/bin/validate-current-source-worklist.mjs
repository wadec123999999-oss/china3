#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { validateCurrentSourceWorklist } from '../src/current-source-worklist-validator.mjs';

const inputPath = process.argv[2];
if (!inputPath) {
  process.stderr.write('Usage: node bin/validate-current-source-worklist.mjs path/to/worklist.json\n');
  process.exitCode = 2;
} else {
  const worklist = JSON.parse(fs.readFileSync(path.resolve(inputPath), 'utf8'));
  const result = validateCurrentSourceWorklist(worklist);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (!result.valid) process.exitCode = 1;
}
