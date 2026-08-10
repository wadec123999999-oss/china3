#!/usr/bin/env node
import fs from 'node:fs';
import { validateRecord } from '../src/field-ops.mjs';
const file = process.argv[2];
if (!file) throw new Error('Usage: node bin/validate-field-record.mjs field-records/SHRUN001.json');
const record = JSON.parse(fs.readFileSync(file, 'utf8'));
const errors = validateRecord(record);
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`VALID ${record.run_id}`);
