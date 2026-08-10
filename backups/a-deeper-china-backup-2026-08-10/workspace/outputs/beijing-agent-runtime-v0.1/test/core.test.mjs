import test from 'node:test';
import assert from 'node:assert/strict';
import { decide, database } from '../src/core.mjs';
import { renderRoadbook } from '../src/roadbook.mjs';
import { runRegression } from '../src/regression.mjs';

test('first visit surfaces axis and Wall decision', () => {
  const result = decide({ days: 3, firstVisit: true, interests: ['history_architecture', 'great_wall_must'] });
  assert.equal(result.status, 'draft_for_human_review');
  assert.ok(result.selectedModules.some(module => module.id === 'BJM01'));
  assert.ok(result.selectedModules.some(module => module.id === 'BJM04'));
  assert.equal(result.dayPlan.length,3);
  assert.equal(result.dayPlan.every(day=>day.modules.length>=1&&day.modules.length<=2),true);
  const wallDay=result.dayPlan.find(day=>day.modules.some(module=>module.id==='BJM04'));
  assert.deepEqual(wallDay.modules.map(module=>module.id),['BJM04']);
});
test('Wall request forces a decision warning', () => {
  const result = decide({ days: 2, interests: ['great_wall_must'] });
  assert.ok(result.warnings.some(item => item.includes('Wall section')));
  assert.ok(result.requiredFollowUps.some(item => item.includes('Wall')));
});
test('roadbook has no booking promise', () => {
  const text = renderRoadbook({ days: 2, interests: ['booking_help_requested'] });
  assert.match(text, /do not book, bundle or sell/i);
});
test('roadbook renders real Beijing days',()=>{
  const text=renderRoadbook({days:3,firstVisit:true,interests:['history_architecture','great_wall_must']});
  assert.match(text,/### Day 1/);
  assert.match(text,/### Day 3/);
});
test('V1.2 roadbook exposes decision and fallback controls',()=>{
  const text=renderRoadbook({days:3,firstVisit:true,interests:['history_architecture','great_wall_must']});
  assert.match(text,/Client decision brief/);
  assert.match(text,/What we deliberately leave out/);
  assert.match(text,/Route shape/);
  assert.match(text,/Body and time budget/);
  assert.match(text,/Low-energy version/);
  assert.match(text,/Rain version/);
});
test('database decision profiles reach selected Beijing modules and points',()=>{
  const result=decide({days:3,firstVisit:true,interests:['history_architecture','great_wall_must']});
  assert.ok(result.selectedModules.every(module=>module.decisionProfile));
  assert.ok(result.selectedPoints.every(point=>point.decisionProfile));
  assert.equal(result.decisionLayerVersion,'1.0');
  assert.equal(result.pointDecisionLayerVersion,'1.0');
  const text=renderRoadbook({days:3,firstVisit:true,interests:['history_architecture','great_wall_must']});
  assert.match(text,/Client decision ledger/);
  assert.match(text,/Why this over a nearby alternative/);
  assert.match(text,/Use when:/);
  assert.match(text,/Palace Museum \/ Forbidden City/);
  assert.doesNotMatch(text,/[㐀-鿿]/u);
});
test('all database points carry release fields', () => {
  assert.equal(database.points.length, 20);
  assert.ok(database.points.every(point => point.field_status && Array.isArray(point.friction)));
});
test('regression cases pass', () => {
  assert.ok(runRegression().every(result => result.pass));
});
