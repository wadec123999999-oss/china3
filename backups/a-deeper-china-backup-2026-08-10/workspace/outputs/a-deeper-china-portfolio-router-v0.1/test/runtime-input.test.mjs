import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRuntimeInput, UNIT_RUNTIMES } from '../src/runtime-input.mjs';

const client={party:{adults:2,children_ages:[]},arrival:{date_time:'2026-10-10T09:00:00+08:00',place:'PEK'},departure:{date_time:'2026-10-11T20:00:00+08:00',place:'Beijing South'},overnight_area:'Wangfujing',pace:'moderate',mobility_notes:'none reported after asking',priorities:['imperial history and architecture'],avoid:['rushing'],food_restrictions:'none',budget_context:'comfortable',output_language:'English'};

test('all portfolio units declare their actual city runtime choices',()=>{
  assert.equal(Object.keys(UNIT_RUNTIMES).length,10);
  assert.equal(Object.values(UNIT_RUNTIMES).flat().length,13);
});

test('single-city client intake becomes an actual Beijing runtime request',()=>{
  const result=buildRuntimeInput({city_unit:'beijing',client,message:'This is our first visit to Beijing.'});
  assert.equal(result.valid,true);
  assert.equal(result.runtime,'beijing');
  assert.equal(result.runtime_input.days,2);
  assert.equal(result.runtime_input.firstVisit,true);
  assert.ok(result.runtime_input.interests.includes('history_architecture'));
});

test('combined products cannot silently choose one endpoint',()=>{
  const missing=buildRuntimeInput({city_unit:'chengdu_chongqing',client});
  assert.equal(missing.valid,false);
  assert.deepEqual(missing.runtime_choices,['chengdu','chongqing']);
  const selected=buildRuntimeInput({city_unit:'chengdu_chongqing',runtime_city:'chengdu',client:{...client,priorities:['food and a calm pace']}});
  assert.equal(selected.valid,true);
  assert.equal(selected.runtime,'chengdu');
  assert.ok(selected.runtime_input.interests.includes('food_driven'));
});

test('unknown client language survives for human confirmation',()=>{
  const result=buildRuntimeInput({city_unit:'shanghai',client:{...client,priorities:['I want something difficult to describe']}});
  assert.deepEqual(result.unmapped_priorities,['I want something difficult to describe']);
  assert.match(result.warnings.join(' '),/human confirmation/);
});

test('mountain products receive nights rather than invented full days',()=>{
  const result=buildRuntimeInput({city_unit:'wudang',client:{...client,priorities:['heritage architecture']}});
  assert.equal(result.runtime_input.nights,1);
  assert.equal('days' in result.runtime_input,false);
});
