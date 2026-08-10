#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validatePublicRoadbook } from '../src/public-roadbook-contract.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const sampleDir = path.resolve(here, '../../../roadbook-sample-pack-v1.1');
const files = fs.existsSync(sampleDir)
  ? fs.readdirSync(sampleDir).filter(file => file.endsWith('-public-roadbook-v1.1.json')).sort()
  : [];
const results = [];
for (const file of files) {
  const value = JSON.parse(fs.readFileSync(path.join(sampleDir, file), 'utf8'));
  const result = validatePublicRoadbook(value);
  results.push({ file, ...result });
  process.stdout.write(`${result.valid ? 'PASS' : 'FAIL'} ${file}${result.errors.length ? `: ${result.errors.join('; ')}` : ''}\n`);
}
const valid = files.length === 13 && results.every(result => result.valid);
process.stdout.write(`${valid ? 'PUBLIC SAMPLE AUDIT PASS' : 'PUBLIC SAMPLE AUDIT FAIL'}: ${results.filter(result => result.valid).length}/${files.length}\n`);
if (!valid) process.exitCode = 1;
