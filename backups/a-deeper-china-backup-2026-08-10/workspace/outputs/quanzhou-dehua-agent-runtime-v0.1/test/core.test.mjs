import test from 'node:test';
import assert from 'node:assert/strict';
import { database, decide } from '../src/core.mjs';
import { renderRoadbook } from '../src/roadbook.mjs';
import { runRegression } from '../src/regression.mjs';

test('two days excludes Dehua', () => { const decision = decide({ days: 2, interests: ['ceramics'] }); assert.ok(!decision.selectedModules.some(module => module.id === 'QZM05')); assert.ok(decision.warnings.some(warning => warning.includes('Do not add Dehua'))); });
test('maker cannot be booked', () => assert.ok(decide({ days: 3, interests: ['maker_experience'] }).warnings.some(warning => warning.includes('research-only'))));
test('three days allows a separate Dehua day', () => { const decision = decide({ days: 3, interests: ['ceramics', 'three_days'] }); assert.ok(decision.selectedModules.some(module => module.id === 'QZM05')); const day = decision.dayPlan.find(item => item.modules.some(module => module.id === 'QZM05')); assert.ok(day.modules.every(module => ['QZM05', 'QZM06'].includes(module.id))); });
test('Quanzhou public core remains on separate days', () => { const decision = decide({ days: 2, interests: ['maritime_history', 'religion'] }); assert.equal(decision.dayPlan.length, 2); assert.ok(decision.dayPlan.every(day => day.modules.length >= 1 && day.modules.length <= 2)); });
test('boundary remains', () => assert.match(renderRoadbook({ days: 2, interests: ['booking_help_requested'] }), /do not book, bundle or sell/i));
test('roadbook renders real Quanzhou days', () => assert.match(renderRoadbook({ days: 2, interests: ['maritime_history'] }), /### Day 2/));
test('decision layers reach selected Quanzhou modules and points', () => { const decision = decide({ days: 2, firstVisit: true, interests: ['maritime_history', 'religion'] }); assert.ok(decision.selectedModules.every(module => module.decisionProfile)); assert.ok(decision.selectedPoints.every(point => point.decisionProfile)); assert.equal(decision.decisionLayerVersion, '1.0'); assert.equal(decision.pointDecisionLayerVersion, '1.0'); const text = renderRoadbook({ days: 2, firstVisit: true, interests: ['maritime_history', 'religion'] }); assert.match(text, /Client decision ledger/); assert.match(text, /Use when:/); assert.match(text, /Stop after:/); assert.doesNotMatch(text, /[㐀-鿿]/u); });
test('regressions pass', () => assert.ok(runRegression().every(result => result.pass)));
test('data count', () => assert.equal(database.points.length, 20));
