#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { progress } from '../src/field-ops.mjs';
const here = path.dirname(fileURLToPath(import.meta.url));
const directory = path.resolve(here, '../field-records');
const records = fs.readdirSync(directory).filter(x => /^SHRUN\d{3}\.json$/.test(x)).map(x => JSON.parse(fs.readFileSync(path.join(directory, x), 'utf8')));
console.log(JSON.stringify({ totalRuns: records.length, launchChecks: progress(records), taiChiSellable: progress(records).find(x => x.id === 'SHLFV006')?.ready ?? false }, null, 2));
