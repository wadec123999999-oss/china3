import test from 'node:test';
import assert from 'node:assert/strict';
import { createRoadbookBrief } from '../src/roadbook-brief.mjs';

const client={party:{adults:1,children_ages:[]},arrival:{date_time:'2026-10-10T09:00:00+08:00',place:'Chengdu East'},departure:{date_time:'2026-10-13T19:00:00+08:00',place:'Chengdu Airport'},overnight_area:'Chengdu city centre',pace:'moderate',mobility_notes:'none reported after asking',priorities:['food and a calm pace'],avoid:['private company visits'],food_restrictions:'none reported',budget_context:'comfortable',output_language:'English'};

test('combined city product needs an explicit endpoint before human review',()=>{
  const missing=createRoadbookBrief({message:'I want Chengdu and Chongqing',city_unit:'chengdu_chongqing',module_ids:['CDM01'],travel:{start_date:'2026-10-10',end_date:'2026-10-13'},client});
  assert.equal(missing.status,'research_draft');
  assert.match(missing.required_before_human_review_signature.join(' '),/requires runtime_city/);
  const explicit=createRoadbookBrief({message:'I want Chengdu',city_unit:'chengdu_chongqing',runtime_city:'chengdu',module_ids:['CDM01'],travel:{start_date:'2026-10-10',end_date:'2026-10-13'},client});
  assert.equal(explicit.runtime_handoff.runtime,'chengdu');
});
