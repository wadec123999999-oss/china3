#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { generateRoutePreview } from './client-roadbook.mjs';

const inputPath = process.argv.slice(2).find(arg => !arg.startsWith('--'));
if (!inputPath) {
  process.stderr.write('Usage: node bin/route-preview.mjs path/to/client-brief.json\n');
  process.exitCode = 2;
} else {
  const text = inputPath === '-' ? fs.readFileSync(0, 'utf8') : fs.readFileSync(path.resolve(inputPath), 'utf8');
  const result = await generateRoutePreview(JSON.parse(text));
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (!result.valid) process.exitCode = 1;
}
