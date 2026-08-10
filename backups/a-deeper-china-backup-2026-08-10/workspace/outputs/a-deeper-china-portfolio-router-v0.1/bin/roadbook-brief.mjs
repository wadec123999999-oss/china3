import fs from 'node:fs';
import path from 'node:path';
import { createRoadbookBrief } from '../src/roadbook-brief.mjs';

const inputPath = process.argv[2];
if (!inputPath) {
  process.stderr.write('Usage: node bin/roadbook-brief.mjs path/to/client-brief.json\n');
  process.exit(1);
}
const input = JSON.parse(fs.readFileSync(path.resolve(inputPath), 'utf8'));
process.stdout.write(`${JSON.stringify(createRoadbookBrief(input), null, 2)}\n`);
