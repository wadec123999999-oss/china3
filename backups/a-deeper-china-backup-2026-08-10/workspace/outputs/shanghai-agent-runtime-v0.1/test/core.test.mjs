import test from 'node:test';
import assert from 'node:assert/strict';
import { decide } from '../src/core.mjs';
import { renderRoadbook } from '../src/roadbook.mjs';
import { runRegression } from '../src/regression.mjs';

test('first-time three-day plan covers city, culture and walkable modernity', () => {
  const result = decide({ days: 3, firstVisit: true, interests: ['architecture'] });
  assert.deepEqual(result.selectedModules.map(x => x.id), ['SHM01', 'SHM04', 'SHM02', 'SHM06']);
  assert.equal(result.status, 'draft_for_human_review');
  assert.equal(result.dayPlan.length, 3);
  assert.equal(result.dayPlan.every(day => day.modules.length >= 1 && day.modules.length <= 2), true);
  assert.deepEqual(result.dayPlan.flatMap(day => day.modules.map(module => module.id)).sort(), result.selectedModules.map(module => module.id).sort());
});

test('Tai Chi request stays non-commercial', () => {
  const result = decide({ days: 2, interests: ['tai_chi', 'slow'] });
  assert.ok(result.warnings.some(x => x.includes('Do not quote, book or collect payment')));
  assert.ok(!result.selectedPoints.some(x => x.id === 'SH020'));
});

test('guest roadbook omits internal point IDs and retains verification boundary', () => {
  const text = renderRoadbook({ days: 2, firstVisit: true, interests: ['photo'] });
  assert.ok(text.includes('Verification boundary'));
  assert.ok(!text.includes('SHM01'));
  assert.ok(!text.includes('SH020'));
});

test('a one-day request is not overstuffed', () => {
  const result = decide({ days: 1, firstVisit: true, interests: ['photo'] });
  assert.equal(result.selectedModules.length, 2);
  assert.deepEqual(result.selectedModules.map(x => x.id), ['SHM01', 'SHM04']);
  assert.equal(result.dayPlan.length, 1);
  assert.equal(result.dayPlan[0].modules.length, 2);
});

test('rendered Shanghai roadbook exposes a real day structure',()=>{
  const text=renderRoadbook({days:2,firstVisit:true,interests:['architecture']});
  assert.match(text,/### Day 1/);
  assert.match(text,/### Day 2/);
  assert.match(text,/What makes this a different kind of roadbook/);
  assert.match(text,/Physical anchor/);
  assert.match(text,/Stop rule/);
  assert.match(text,/Main friction/);
});

test('V1.2 exposes client decisions and executable fallback controls',()=>{
  const text=renderRoadbook({days:2,firstVisit:true,interests:['architecture','slow']});
  assert.match(text,/Client decision brief/);
  assert.match(text,/What we deliberately leave out/);
  assert.match(text,/Body and time budget/);
  assert.match(text,/Low-energy version/);
  assert.match(text,/Rain version/);
  assert.ok(!text.includes('SHM01'));
});

test('the old-city module remains available for history-led repeat visitors', () => {
  const result = decide({ days: 2, firstVisit: false, interests: ['history'] });
  assert.ok(result.selectedModules.some(x => x.id === 'SHM03'));
});

test('V1 routes the expanded module families', () => {
  assert.ok(decide({days:2,interests:['religion']}).selectedModules.some(x => x.id === 'SHM12'));
  assert.ok(decide({days:2,interests:['arrival']}).selectedModules.some(x => x.id === 'SHM18'));
  assert.ok(decide({days:2,interests:['jewish_history']}).selectedModules.some(x => x.id === 'SHM11'));
  assert.ok(decide({days:3,interests:['creative']}).selectedModules.some(x => x.id === 'SHM19'));
});

test('all selected modules and points carry database decision profiles', () => {
  const result = decide({days: 4, firstVisit: false, interests: ['history', 'photo', 'creative']});
  assert.ok(result.selectedModules.every(module => module.decisionProfile));
  assert.ok(result.selectedPoints.every(point => point.decisionProfile));
  assert.equal(result.decisionLayerVersion, '1.0');
  assert.equal(result.pointDecisionLayerVersion, '1.0');
});

test('all 60 V1 regression cases preserve safety and draft boundaries', () => {
  const report = runRegression();
  assert.equal(report.total, 60);
  assert.equal(report.passed, 60);
});
