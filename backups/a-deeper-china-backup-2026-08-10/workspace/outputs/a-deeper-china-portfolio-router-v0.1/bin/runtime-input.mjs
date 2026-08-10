#!/usr/bin/env node
import fs from 'node:fs';
import { buildRuntimeInput } from '../src/runtime-input.mjs';
const inputPath=process.argv[2];
if(!inputPath){console.error('Usage: node bin/runtime-input.mjs <roadbook-brief-input.json>');process.exitCode=2;}
else process.stdout.write(`${JSON.stringify(buildRuntimeInput(JSON.parse(fs.readFileSync(inputPath,'utf8'))),null,2)}\n`);
