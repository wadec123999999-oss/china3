import fs from 'node:fs';
import { assessPortfolioRoadbookRelease } from '../src/release.mjs';
const input=JSON.parse(fs.readFileSync(0,'utf8'));
process.stdout.write(`${JSON.stringify(assessPortfolioRoadbookRelease(input),null,2)}\n`);
