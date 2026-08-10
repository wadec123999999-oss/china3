import test from 'node:test';
import assert from 'node:assert/strict';
import { decide } from '../src/core.mjs';
import { renderRoadbook } from '../src/roadbook.mjs';
import { runRegression } from '../src/regression.mjs';

test('two days excludes making', () => assert.ok(!decide({ days: 2, interests: ['workshop'] }).selectedModules.some(module => module.id === 'JZM05')));
test('two-day public core becomes real days', () => { const decision = decide({ days: 2, interests: ['ceramics', 'imperial_history', 'art_design'] }); assert.equal(decision.dayPlan.length, 2); assert.ok(decision.dayPlan.every(day => day.modules.length >= 1 && day.modules.length <= 2)); });
test('four days can discuss making as a bounded day', () => { const decision = decide({ days: 4, interests: ['workshop', 'four_days'] }); assert.ok(decision.selectedModules.some(module => module.id === 'JZM05')); const day = decision.dayPlan.find(item => item.modules.some(module => module.id === 'JZM05')); assert.ok(day.modules.every(module => ['JZM05', 'JZM06'].includes(module.id))); });
test('roadbook renders real Jingdezhen days', () => assert.match(renderRoadbook({ days: 2, interests: ['ceramics'] }), /### Day 2/));
test('decision layers reach selected Jingdezhen modules and points', () => { const decision = decide({ days: 2, firstVisit: true, interests: ['ceramics', 'imperial_history'] }); assert.ok(decision.selectedModules.every(module => module.decisionProfile)); assert.ok(decision.selectedPoints.every(point => point.decisionProfile)); assert.equal(decision.decisionLayerVersion, '1.0'); assert.equal(decision.pointDecisionLayerVersion, '1.0'); const text = renderRoadbook({ days: 2, firstVisit: true, interests: ['ceramics', 'imperial_history'] }); assert.match(text, /Client decision ledger/); assert.match(text, /Use when:/); assert.match(text, /Stop after:/); assert.doesNotMatch(text, /[㐀-鿿]/u); });
test('regression', () => assert.ok(runRegression().every(result => result.pass)));
