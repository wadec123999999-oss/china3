import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildPortfolioRagRecords, PORTFOLIO_RAG_VERSION } from '../src/portfolio-rag-export.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const records = buildPortfolioRagRecords();
const tasks = records
  .filter((record) => record.tags.includes('verification-task'))
  .map((record) => ({
    task_id: `RAG-${record.destination_slug.toUpperCase()}-${record.metadata.check_id || record.id.split(':').at(-1)}`,
    city: record.destination_name,
    city_id: record.destination_slug,
    check_id: record.metadata.check_id || null,
    priority: record.metadata.check_priority || 'not_ranked',
    method: record.metadata.check_method || 'local reviewer to define method',
    task: record.title.replace(/^Pending verification:\s*/, ''),
    scope: record.text.replace(/^This is a live review task, not released evidence\.\nScope:\s*/, ''),
    source_url: record.source_url,
    status: record.verification.field_status,
    release_rule: 'Do not mark as field_verified or Human-checked until a dated record with evidence is approved.',
    rag_record_id: record.id
  }));

const output = {
  version: PORTFOLIO_RAG_VERSION,
  generated_at: new Date().toISOString(),
  task_count: tasks.length,
  tasks
};
const outputPath = path.resolve(here, '../rag/portfolio-rag-field-worklist-v1.json');
fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(`Wrote ${tasks.length} RAG review tasks to ${outputPath}`);
