#!/usr/bin/env node
import assert from 'node:assert/strict';
import { planRetrieval, retrieveForMessage, retrievalIndexStats } from '../src/retrieval.mjs';

const stats = retrievalIndexStats();
const beijing = retrieveForMessage('First visit to Beijing for history and the Great Wall, three nights.');
const comparison = planRetrieval('Should I choose Beijing or Chengdu for five nights?');
const discovery = retrieveForMessage('I want tea, landscape and village life in China.');
assert.equal(stats.record_count, 1236);
assert.equal(beijing.plan.mode, 'city_focused');
assert.deepEqual(beijing.plan.candidate_database_ids, ['beijing']);
assert.ok(beijing.candidate_count < stats.record_count / 2);
assert.equal(comparison.mode, 'comparison');
assert.equal(discovery.plan.mode, 'portfolio_discovery');
assert.ok(discovery.plan.candidate_product_units.length <= 3);
console.log(`PASS retrieval audit: ${stats.record_count} records; ${stats.city_count} cities; ${stats.product_unit_count} product units`);
console.log(`  Beijing detail candidates: ${beijing.candidate_count}; discovery candidates: ${discovery.candidate_count}`);

