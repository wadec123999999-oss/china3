#!/usr/bin/env node
import fs from 'node:fs';
import { renderRoadbook } from '../src/roadbook.mjs';
const input = process.argv[2] ? JSON.parse(fs.readFileSync(process.argv[2], 'utf8')) : { days: 3, firstVisit: true, interests: ['architecture'] };
console.log(renderRoadbook(input));
