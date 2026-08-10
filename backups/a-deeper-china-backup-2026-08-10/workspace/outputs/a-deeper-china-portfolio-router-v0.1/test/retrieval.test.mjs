import test from 'node:test';
import assert from 'node:assert/strict';
import { planRetrieval, retrieveForMessage, retrievalIndexStats } from '../src/retrieval.mjs';

test('single-city Beijing query pre-filters detailed retrieval to Beijing', () => {
  const result = retrieveForMessage('First visit to Beijing for history and the Great Wall, three nights.', { limit: 8 });
  assert.equal(result.plan.mode, 'city_focused');
  assert.deepEqual(result.plan.candidate_database_ids, ['beijing']);
  assert.ok(result.records.length > 0);
  assert.ok(result.records.every(item => item.destination_slug === 'beijing'));
});

test('comparison query opens only the named city units', () => {
  const plan = planRetrieval('Should I choose Beijing or Chengdu for a first China trip with five nights?');
  assert.equal(plan.mode, 'comparison');
  assert.deepEqual(plan.candidate_database_ids.sort(), ['beijing', 'chengdu', 'chongqing'].sort());
  assert.equal(plan.retrieval_layers.includes('city_detail_layer'), false);
});

test('no-city tea query stays in portfolio discovery before promoting candidates', () => {
  const result = retrieveForMessage('I want to understand tea, landscape and village life in China.', { limit: 8 });
  assert.equal(result.plan.mode, 'portfolio_discovery');
  assert.ok(result.plan.candidate_product_units.length <= 3);
  assert.ok(result.records.length > 0);
  assert.ok(result.records.every(item => ['positioning_overview', 'traveler_faq'].includes(item.content_type)));
});

test('retrieval index is materially smaller than a full city-detail scan for a single city', () => {
  const stats = retrievalIndexStats();
  const result = retrieveForMessage('Architecture in Shanghai for three nights.', { limit: 8 });
  assert.equal(stats.record_count, 1236);
  assert.ok(result.candidate_count < stats.record_count / 2);
});

