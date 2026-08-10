import test from 'node:test';
import assert from 'node:assert/strict';
import { portfolioReadiness } from './portfolio-readiness.mjs';

test('portfolio readiness report covers all active cities without inventing field verification',()=>{
  const cities=portfolioReadiness();
  assert.equal(cities.length,13);
  assert.equal(cities.every(city=>city.module_count>0),true);
  assert.equal(cities.every(city=>city.field_verified_records===0),true);
  assert.equal(cities.every(city=>Number.isInteger(city.field_validation.planned)&&Number.isInteger(city.field_validation.passed)&&typeof city.field_validation.ready==='boolean'),true);
  assert.equal(cities.every(city=>Number.isInteger(city.dated_refresh_record_count)),true);
  assert.equal(cities.every(city=>Number.isInteger(city.dated_refresh_dynamic_count)),true);
  assert.equal(cities.some(city=>city.dated_refresh_record_count>0),true);
  assert.equal(cities.every(city=>Number.isInteger(city.field_task_count)),true);
  assert.equal(cities.every(city=>/^P[0-2]$/.test(city.operator_priority)),true);
  assert.equal(cities.every(city=>typeof city.next_action==='string'&&city.next_action.length>20),true);
  assert.match(cities.find(city=>city.city==='Shanghai').next_action,/field tasks|field_run/);
  assert.equal(cities.some(city=>city.field_validation.ready),false);
  assert.equal(cities.every(city=>city.release_state.includes('no_city_is_preapproved')),true);
});
