import test from 'node:test';
import assert from 'node:assert/strict';
import { decide } from '../src/core.mjs';
import { renderRoadbook } from '../src/roadbook.mjs';
import { runRegression } from '../src/regression.mjs';

test('two nights excludes Tai Chi module', () => assert.ok(!decide({ nights: 2, interests: ['tai_chi'] }).selectedModules.some(module => module.id === 'WDM06')));
test('private access requires review', () => assert.equal(decide({ nights: 3, interests: ['private_master_access'] }).status, 'research_only_human_review_required'));
test('protected nights become bounded days', () => {
  const result = decide({ nights: 3, interests: ['heritage_architecture', 'taoism_interest'] });
  assert.equal(result.dayPlan.length, 3);
  assert.ok(result.dayPlan.every(day => day.modules.length <= 2));
});
test('public architecture is a major day with movement support only', () => {
  const result = decide({ nights: 3, interests: ['heritage_architecture'] });
  const day = result.dayPlan.find(item => item.modules.some(module => module.id === 'WDM04'));
  assert.ok(day);
  assert.ok(day.modules.every(module => ['WDM03', 'WDM04'].includes(module.id)));
});
test('Tai Chi remains a standalone bounded day', () => {
  const result = decide({ nights: 3, interests: ['tai_chi'] });
  const day = result.dayPlan.find(item => item.modules.some(module => module.id === 'WDM06'));
  assert.ok(day);
  assert.deepEqual(day.modules.map(module => module.id), ['WDM06']);
});
test('roadbook renders real Wudang days', () => assert.match(renderRoadbook({ nights: 3, interests: ['heritage_architecture'] }), /### Day 3/));
test('decision layers reach selected Wudang modules and points', () => { const decision = decide({ nights: 3, firstVisit: true, interests: ['heritage_architecture', 'taoism_interest'] }); assert.ok(decision.selectedModules.every(module => module.decisionProfile)); assert.ok(decision.selectedPoints.every(point => point.decisionProfile)); assert.equal(decision.decisionLayerVersion, '1.0'); assert.equal(decision.pointDecisionLayerVersion, '1.0'); const text = renderRoadbook({ nights: 3, firstVisit: true, interests: ['heritage_architecture', 'taoism_interest'] }); assert.match(text, /Client decision ledger/); assert.match(text, /Use when:/); assert.match(text, /Stop after:/); assert.doesNotMatch(text, /[㐀-鿿]/u); });
test('regression', () => assert.ok(runRegression().every(result => result.pass)));
