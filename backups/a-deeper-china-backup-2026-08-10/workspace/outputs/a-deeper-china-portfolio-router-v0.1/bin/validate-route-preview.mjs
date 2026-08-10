#!/usr/bin/env node
import fs from 'node:fs';
import { validateRoutePreview } from '../src/route-preview-contract.mjs';

const inputPath = process.argv[2];
if (!inputPath) {
  process.stderr.write('Usage: node bin/validate-route-preview.mjs path/to/preview.json\n');
  process.exitCode = 2;
} else {
  const result = validateRoutePreview(JSON.parse(fs.readFileSync(inputPath, 'utf8')));
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (!result.valid) process.exitCode = 1;
}
