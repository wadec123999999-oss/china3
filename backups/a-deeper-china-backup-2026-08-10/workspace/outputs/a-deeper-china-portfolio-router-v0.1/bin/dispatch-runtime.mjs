#!/usr/bin/env node
import fs from 'node:fs';
import { dispatchRuntime } from '../src/runtime-dispatch.mjs';

const inputPath=process.argv[2];
if(!inputPath){console.error('Usage: node bin/dispatch-runtime.mjs <runtime-handoff.json>');process.exitCode=2;}
else process.stdout.write(`${JSON.stringify(await dispatchRuntime(JSON.parse(fs.readFileSync(inputPath,'utf8'))),null,2)}\n`);
