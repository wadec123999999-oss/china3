import test from 'node:test';
import assert from 'node:assert/strict';
import {database,decide} from '../src/core.mjs';
import {renderRoadbook} from '../src/roadbook.mjs';
import {runRegression} from '../src/regression.mjs';

test('short stay removes Longji',()=>{const d=decide({days:3,interests:['longji']});assert.ok(!d.selectedModules.some(m=>m.id==='GYM07'));assert.ok(d.warnings.some(w=>w.includes('Do not add Longji')));assert.equal(d.dayPlan.length,3);});
test('non cycling is controlled',()=>assert.ok(decide({days:3,interests:['non_cycling']}).warnings.some(w=>w.includes('Do not assume cycling'))));
test('longer stay admits Longji as a standalone day',()=>{const d=decide({days:5,interests:['longji','five_nights']});assert.ok(d.selectedModules.some(m=>m.id==='GYM07'));const day=d.dayPlan.find(item=>item.modules.some(m=>m.id==='GYM07'));assert.deepEqual(day.modules.map(m=>m.id),['GYM07']);});
test('Li River remains a standalone operational day',()=>{const d=decide({days:3,interests:['li_river']});const day=d.dayPlan.find(item=>item.modules.some(m=>m.id==='GYM02'));assert.ok(day.modules.every(m=>['GYM02','GYM08'].includes(m.id)));});
test('boundary remains',()=>assert.match(renderRoadbook({days:3,interests:['booking_help_requested']}),/do not book, bundle or sell/i));
test('roadbook renders real landscape days',()=>assert.match(renderRoadbook({days:3,interests:['karst','yulong']}),/### Day 3/));
test('regressions pass',()=>assert.ok(runRegression().every(r=>r.pass)));
test('data count',()=>assert.equal(database.points.length,20));
test('decision layers reach selected Guilin points',()=>{const d=decide({days:3,interests:['li_river','non_cycling']});assert.ok(d.selectedModules.every(m=>m.decisionProfile));assert.ok(d.selectedPoints.every(p=>p.decisionProfile));assert.equal(d.decisionLayerVersion,'1.0');assert.equal(d.pointDecisionLayerVersion,'1.0');const t=renderRoadbook({days:3,interests:['li_river','non_cycling']});assert.match(t,/Client decision ledger/);assert.match(t,/Use when:/);assert.doesNotMatch(t,/[㐀-鿿]/u);});
