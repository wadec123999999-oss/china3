#!/usr/bin/env node
import fs from 'node:fs';
import { scoreRoadbookMarkdown } from '../src/roadbook-quality.mjs';

const inputPath = process.argv[2];
const markdown = inputPath && inputPath !== '-'
  ? fs.readFileSync(inputPath, 'utf8')
  : fs.readFileSync(0, 'utf8');
process.stdout.write(`${JSON.stringify(scoreRoadbookMarkdown(markdown), null, 2)}\n`);
