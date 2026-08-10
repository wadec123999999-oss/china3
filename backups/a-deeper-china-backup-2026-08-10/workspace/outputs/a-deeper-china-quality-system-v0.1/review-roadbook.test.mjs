import test from 'node:test';
import assert from 'node:assert/strict';
import { reviewRoadbook } from './review-roadbook.mjs';

const base={review_id:'RBR-WUDANG-TEST-001',city:'Wudang Mountains',module_ids:['WDM04'],travel_start:'2026-09-10',travel_end:'2026-09-13',reviewed_at:'2026-08-03T10:00:00+08:00',reviewer:'Example reviewer',completed_check_ids:[],current_source_ids:[]};
test('review record cannot falsely declare a human-checked roadbook',()=>{
  const result=reviewRoadbook({...base,decision:'human_checked_ready'});
  assert.equal(result.valid,false);
  assert.equal(result.status,'draft_only');
});
test('review record becomes deliverable only after required live task is logged',()=>{
  const result=reviewRoadbook({...base,completed_check_ids:['DC-WD-ROUTE'],decision:'human_checked_ready'});
  assert.equal(result.valid,true);
  assert.equal(result.status,'human_checked_ready');
});

test('review record can preserve a passed field-run module as release evidence',()=>{
  const result=reviewRoadbook({
    ...base,
    city:'Beijing',
    city_unit:'beijing',
    module_ids:['BJM01'],
    completed_field_module_ids:['BJM01'],
    decision:'human_checked_ready'
  });
  assert.equal(result.valid,true);
  assert.equal(result.status,'human_checked_ready');
  assert.equal(result.release.modules[0].evidence_basis,'field_run');
});

test('future review time cannot support a release declaration',()=>{
  const result=reviewRoadbook({...base,reviewed_at:'2026-09-01T10:00:00+08:00',decision:'human_checked_ready'});
  assert.equal(result.valid,false);
  assert.match(result.errors[0],/future/);
});
