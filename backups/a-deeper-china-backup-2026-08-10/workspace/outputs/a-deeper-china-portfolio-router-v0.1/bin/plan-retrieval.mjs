#!/usr/bin/env node
import { planRetrieval, retrieveForMessage } from '../src/retrieval.mjs';

const message = process.argv.slice(2).join(' ').trim();
if (!message) {
  console.error('Usage: node bin/plan-retrieval.mjs "your traveller question"');
  process.exit(1);
}
const result = retrieveForMessage(message, { limit: 8 });
console.log(JSON.stringify({ plan: result.plan, candidate_count: result.candidate_count, records: result.records }, null, 2));

