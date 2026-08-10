import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildPortfolioRagRecords, summarizePortfolioRag } from '../src/portfolio-rag-export.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(here, '../rag');
const records = buildPortfolioRagRecords();
const summary = summarizePortfolioRag(records);
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'portfolio-city-knowledge-v1.jsonl'), `${records.map((item) => JSON.stringify(item)).join('\n')}\n`);
fs.writeFileSync(path.join(outDir, 'portfolio-city-knowledge-v1.summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
console.log(JSON.stringify(summary, null, 2));
