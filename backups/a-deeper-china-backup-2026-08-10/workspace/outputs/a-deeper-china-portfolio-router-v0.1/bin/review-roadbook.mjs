#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { reviewRoadbook } from '../../a-deeper-china-quality-system-v0.1/review-roadbook.mjs';

export function evaluateReviewRecord(record = {}) {
  const result = reviewRoadbook(record);
  return {
    valid: result.valid,
    status: result.status,
    errors: result.errors,
    release: result.release || null,
    next_action: result.valid && result.status === 'human_checked_ready'
      ? 'The digital roadbook may use the Human-checked label; it still does not create a booking or guarantee access.'
      : 'Keep the roadbook as draft_only and complete the required dated evidence checks.'
  };
}

async function main() {
  const args = process.argv.slice(2);
  const inputPath = args.find(arg => !arg.startsWith('--'));
  if (!inputPath) {
    process.stderr.write('Usage: npm run review-roadbook -- path/to/review-record.json\n');
    process.exitCode = 2;
    return;
  }
  const record = JSON.parse(fs.readFileSync(path.resolve(inputPath), 'utf8'));
  const result = evaluateReviewRecord(record);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (!result.valid) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();

