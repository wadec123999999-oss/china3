#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { validatePublicRoadbook } from '../src/public-roadbook-contract.mjs';

export function validateFile(filePath) {
  const value = JSON.parse(fs.readFileSync(path.resolve(filePath), 'utf8'));
  return validatePublicRoadbook(value);
}

async function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    process.stderr.write('Usage: npm run validate-public-roadbook -- path/to/public-roadbook.json\n');
    process.exitCode = 2;
    return;
  }
  const result = validateFile(inputPath);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (!result.valid) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();

