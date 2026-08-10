import test from 'node:test';import assert from 'node:assert/strict';import {database,decide} from '../src/core.mjs';import {renderRoadbook} from '../src/roadbook.mjs';
test('first visit uses rhythm and panda decision',()=>{const d=decide({days:3,firstVisit:true,interests:['panda_priority']});assert.ok(d.selectedModules.some(m=>m.id==='CDM01'));assert.ok(d.selectedModules.some(m=>m.id==='CDM02'));assert.equal(d.dayPlan.length,3);assert.ok(d.dayPlan.every(day=>day.modules.length>=1&&day.modules.length<=2));const pandaDay=d.dayPlan.find(day=>day.modules.some(m=>m.id==='CDM02'));assert.ok(pandaDay.modules.some(m=>m.id==='CDM03'));});
test('panda-free Chengdu is valid',()=>{const d=decide({days:3,interests:['no_pandas']});assert.ok(!d.selectedPoints.some(p=>p.id==='CD002'));});
test('food forces preference question',()=>{const d=decide({days:2,interests:['food_driven']});assert.ok(d.requiredFollowUps.some(q=>q.includes('spice tolerance')));});
test('output does not promise booking',()=>assert.match(renderRoadbook({days:2,interests:['booking_help_requested']}),/do not book, bundle or sell/i));
test('Dujiangyan remains a standalone day',()=>{const d=decide({days:3,interests:['dujiangyan','history']});const day=d.dayPlan.find(item=>item.modules.some(m=>m.id==='CDM07'));assert.deepEqual(day.modules.map(m=>m.id),['CDM07']);});
test('roadbook renders real Chengdu days',()=>assert.match(renderRoadbook({days:3,firstVisit:true,interests:['panda_priority']}),/### Day 3/));
test('V1.2 roadbook exposes decision and fallback controls',()=>{
 const text=renderRoadbook({days:3,firstVisit:true,interests:['panda_priority','food_driven']});
 assert.match(text,/Client decision brief/);
 assert.match(text,/What we deliberately leave out/);
 assert.match(text,/Route shape/);
 assert.match(text,/Body and time budget/);
 assert.match(text,/Low-energy version/);
 assert.match(text,/Rain version/);
});
test('database decision profiles reach selected Chengdu modules and points',()=>{const d=decide({days:3,firstVisit:true,interests:['panda_priority','food_driven']});assert.ok(d.selectedModules.every(m=>m.decisionProfile));assert.ok(d.selectedPoints.every(p=>p.decisionProfile));assert.equal(d.decisionLayerVersion,'1.0');assert.equal(d.pointDecisionLayerVersion,'1.0');const text=renderRoadbook({days:3,firstVisit:true,interests:['panda_priority','food_driven']});assert.match(text,/Client decision ledger/);assert.match(text,/Why this over a nearby alternative/);assert.match(text,/Use when:/);assert.doesNotMatch(text,/[㐀-鿿]/u);});
test('data carries release fields',()=>assert.ok(database.points.every(p=>p.field_status&&Array.isArray(p.friction))));
