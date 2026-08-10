import test from 'node:test';import assert from 'node:assert/strict';import {database,decide} from '../src/core.mjs';import {renderRoadbook} from '../src/roadbook.mjs';import {runRegression} from '../src/regression.mjs';
test('same-day rejects water town',()=>{const d=decide({days:1,sameDayReturn:true,interests:['one_day','water_town','gardens']});assert.ok(!d.selectedModules.some(m=>m.id==='SZUM05'));assert.ok(d.warnings.some(w=>w.includes('Do not add Tongli')));});
test('water town survives with time',()=>assert.ok(decide({days:2,interests:['water_town']}).selectedModules.some(m=>m.id==='SZUM05')));
test('water town is a standalone day',()=>{const d=decide({days:2,interests:['water_town']});const day=d.dayPlan.find(item=>item.modules.some(m=>m.id==='SZUM05'));assert.deepEqual(day.modules.map(m=>m.id),['SZUM05']);});
test('boundary remains',()=>assert.match(renderRoadbook({days:2,interests:['booking_help_requested']}),/do not book, bundle or sell/i));
test('roadbook renders real Suzhou days',()=>assert.match(renderRoadbook({days:2,firstVisit:true,interests:['gardens']}),/### Day 2/));
test('regression passes',()=>assert.ok(runRegression().every(r=>r.pass)));
test('data count',()=>assert.equal(database.points.length,20));
test('decision layers reach selected Suzhou points',()=>{const d=decide({days:2,firstVisit:true,interests:['gardens','craft']});assert.ok(d.selectedModules.every(m=>m.decisionProfile));assert.ok(d.selectedPoints.every(p=>p.decisionProfile));assert.equal(d.decisionLayerVersion,'1.0');assert.equal(d.pointDecisionLayerVersion,'1.0');const t=renderRoadbook({days:2,firstVisit:true,interests:['gardens','craft']});assert.match(t,/Client decision ledger/);assert.match(t,/Use when:/);assert.doesNotMatch(t,/[㐀-鿿]/u);});
