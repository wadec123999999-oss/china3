import test from 'node:test';
import assert from 'node:assert/strict';
import { decide } from '../src/core.mjs';
import { renderRoadbook } from '../src/roadbook.mjs';
import { runRegression } from '../src/regression.mjs';

test('three nights blocks farmer interaction', () => assert.ok(!decide({ nights: 3, interests: ['tea_farmer_visit'] }).selectedModules.some(module => module.id === 'JMM07')));
test('tea purchases contain warning', () => assert.ok(decide({ nights: 4, interests: ['tea_purchase'] }).warnings.some(warning => warning.includes('authenticate tea'))));
test('deep product keeps three distinct day layers', () => {
  const result = decide({ nights: 3, interests: ['tea_culture', 'walking'] });
  assert.equal(result.dayPlan.length, 3);
  assert.ok(result.dayPlan.every(day => day.modules.length <= 2));
  const days = ['JMM01', 'JMM03', 'JMM05'].map(id => result.dayPlan.find(day => day.modules.some(module => module.id === id))?.day);
  assert.equal(new Set(days).size, 3);
});
test('release gate is support, not a standalone promised experience', () => {
  const result = decide({ nights: 4, interests: ['tea_farmer_visit'] });
  const day = result.dayPlan.find(item => item.modules.some(module => module.id === 'JMM07'));
  assert.ok(day);
  assert.ok(day.modules.some(module => module.id === 'JMM03'));
  assert.equal(result.status, 'research_only_human_review_required');
});
test('short stay carries explicit no-deep-product warning', () => assert.ok(decide({ nights: 2, interests: ['tea_culture'] }).warnings.some(warning => warning.includes('fewer than three protected nights'))));
test('roadbook renders real Jingmai days', () => assert.match(renderRoadbook({ nights: 3, interests: ['tea_culture'] }), /### Day 3/));
test('decision layers reach selected Jingmai modules and points', () => { const decision = decide({ nights: 3, firstVisit: true, interests: ['tea_culture', 'walking'] }); assert.ok(decision.selectedModules.every(module => module.decisionProfile)); assert.ok(decision.selectedPoints.every(point => point.decisionProfile)); assert.equal(decision.decisionLayerVersion, '1.0'); assert.equal(decision.pointDecisionLayerVersion, '1.0'); const text = renderRoadbook({ nights: 3, firstVisit: true, interests: ['tea_culture', 'walking'] }); assert.match(text, /Client decision ledger/); assert.match(text, /Use when:/); assert.match(text, /Stop after:/); assert.doesNotMatch(text, /[㐀-鿿]/u); });
test('regression', () => assert.ok(runRegression().every(result => result.pass)));
